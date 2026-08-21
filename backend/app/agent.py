"""Isolated agent executor. It owns an attestation key, never the DAE master secret."""
import os
import httpx
from langgraph.graph import END, StateGraph
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from cryptography.hazmat.primitives import serialization
from .crypto import ExecutionGraph, canonical, make_key, public_pem, sha256, sign

app = FastAPI(title="IISTA Agent Executor")
STORE_URL = os.environ.get("IISTA_STORE_URL", "http://127.0.0.1:8000")
DAE_URL = os.environ.get("IISTA_DAE_URL", "http://127.0.0.1:8002")
raw = os.environ.get("IISTA_AGENT_PRIVATE_KEY")
KEY = serialization.load_pem_private_key(raw.encode(), password=None) if raw else make_key()
class Run(BaseModel): scenario: str = "standard"; budget: int = 25; domain: str = "mockstore.local"
@app.get("/attestation")
def attestation(): return {"public_key": public_pem(KEY)}
async def search(state):
    async with httpx.AsyncClient(timeout=5) as c: products = (await c.get(f"{STORE_URL}/products")).json()["products"]
    state["graph"].append("search_products", {"query":"VPS"}, {"product_id":products[0]["id"],"price":products[0]["price"]}, state["body"].domain)
    return state
async def path_attack(state):
    if state["body"].scenario == "deviation": state["graph"].append("unauthorized_api", {"url":"https://malicious.invalid"}, {"status":"attempted"}, "malicious.invalid")
    return state
async def checkout(state):
    body=state["body"]; override=200 if body.scenario == "injection" else None
    async with httpx.AsyncClient(timeout=5) as c: witness=(await c.post(f"{STORE_URL}/checkout",json={"product_id":"vps-basic","override_price":override})).json()
    state["graph"].append("checkout", {"product_id":"vps-basic"}, witness["invoice"], body.domain, witness)
    if body.scenario == "tampered": state["graph"].nodes[0] = state["graph"].nodes[0].__class__(**{**state["graph"].nodes[0].__dict__, "output":{"price":200}})
    if body.scenario == "merchant_substitution":
        node=state["graph"].nodes[-1]; proof={**node.witness_proof, "signature":"AAAA"}; unsigned={**node.unsigned(),"witness_proof":proof}; digest=sha256(bytes.fromhex(node.prev_hash),canonical(unsigned)).hex()
        state["graph"].nodes[-1]=node.__class__(**unsigned,node_hash=digest,agent_signature=sign(KEY,bytes.fromhex(digest)))
    return state
async def authorize(state):
    body=state["body"]
    async with httpx.AsyncClient(timeout=5) as c:
        if body.scenario == "toctou": await c.post(f"{STORE_URL}/attack/set-price/50")
        r=await c.post(f"{DAE_URL}/authorize",json={"intent":{"budget":body.budget,"domain":body.domain},"graph":state["graph"].serialise()})
    state["authorization"]=r.json(); state["authorized"]=r.status_code==200
    return state
async def pay(state):
    if not state["authorized"]: return state
    a=state["authorization"]
    payload={k:a[k] for k in ("transaction","signature","transaction_public_key","dae_attestation_signature")}
    if state["body"].scenario == "unauthorized_signing": payload["dae_attestation_signature"]="AAAA"
    async with httpx.AsyncClient(timeout=5) as c: r=await c.post(f"{STORE_URL}/payment",json=payload)
    state["payment"]=r.json(); state["authorized"]=r.status_code==200
    if not state["authorized"]: state["authorization"]={"detail":state["payment"].get("detail","payment rejected")}
    return state
workflow=StateGraph(dict)
for name, fn in [("search",search),("path_attack",path_attack),("checkout",checkout),("authorize",authorize),("pay",pay)]: workflow.add_node(name,fn)
workflow.set_entry_point("search")
workflow.add_edge("search","path_attack"); workflow.add_edge("path_attack","checkout"); workflow.add_edge("checkout","authorize"); workflow.add_edge("authorize","pay"); workflow.add_edge("pay",END)
AGENT_GRAPH=workflow.compile()
@app.post("/run")
async def run(body: Run):
    if body.scenario not in {"standard","injection","toctou","deviation","tampered","merchant_substitution","unauthorized_signing"}: raise HTTPException(400,"unknown scenario")
    state=await AGENT_GRAPH.ainvoke({"body":body,"graph":ExecutionGraph(KEY)})
    if not state["authorized"]: return {"authorized":False,"scenario":body.scenario,"reason":state["authorization"].get("detail"),"graph":state["graph"].serialise()}
    return {"authorized":True,"scenario":body.scenario,"payment":state["payment"],"graph":state["graph"].serialise(),"ssi":state["authorization"]["ssi"]}
