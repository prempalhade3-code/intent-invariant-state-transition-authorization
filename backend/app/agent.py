"""Isolated agent executor. It owns an attestation key, never the DAE master secret."""
import os
import asyncio
import httpx
from langgraph.graph import END, StateGraph
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from cryptography.hazmat.primitives import serialization
from .crypto import ExecutionGraph, canonical, make_key, public_pem, sha256, sign
from .browser_controller import BrowserController

app = FastAPI(title="IISTA Agent Executor")
STORE_URL = os.environ.get("IISTA_STORE_URL", "http://127.0.0.1:8000")
DAE_URL = os.environ.get("IISTA_DAE_URL", "http://127.0.0.1:8002")
GATEWAY_URL = os.getenv("IISTA_GATEWAY_URL", "http://127.0.0.1:8003")
raw = os.environ.get("IISTA_AGENT_PRIVATE_KEY")
KEY = serialization.load_pem_private_key(raw.encode(), password=None) if raw else make_key()


class Run(BaseModel):
    scenario: str = "standard"
    budget: int = 25
    domain: str = "mockstore.local"
    user_prompt: str | None = None
    run_id: str | None = None


async def emit(run_id: str, event_type: str, payload: dict, source: str = "agent"):
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=3) as c:
                await c.post(
                    f"{GATEWAY_URL}/api/runs/{run_id}/events",
                    json={"event_type": event_type, "source": source, "payload": payload},
                )
            return
        except Exception:
            if attempt < 2:
                await asyncio.sleep(0.05)


async def emit_tool(run_id: str, tool: str, output: dict, domain: str = "mockstore.local"):
    await emit(run_id, "browser_action", {"tool": tool, "domain": domain, "output": output}, "browser")
    await emit(run_id, "merchant_response", {"tool": tool, "output": output}, "store")


@app.get("/attestation")
def attestation():
    return {"public_key": public_pem(KEY)}


async def search(state):
    async with httpx.AsyncClient(timeout=5) as c:
        products = (await c.get(f"{STORE_URL}/products")).json()["products"]
    state["graph"].append("search_products", {"query": "VPS"}, {"product_id": products[0]["id"], "price": products[0]["price"]}, state["body"].domain)
    return state


async def path_attack(state):
    if state["body"].scenario == "deviation":
        state["graph"].append("unauthorized_api", {"url": "https://malicious.invalid"}, {"status": "attempted"}, "malicious.invalid")
    return state


async def checkout(state):
    body = state["body"]
    override = 200 if body.scenario == "injection" else None
    async with httpx.AsyncClient(timeout=5) as c:
        witness = (await c.post(f"{STORE_URL}/checkout", json={"product_id": "vps-basic", "override_price": override})).json()
    state["graph"].append("checkout", {"product_id": "vps-basic"}, witness["invoice"], body.domain, witness)
    if body.scenario == "tampered":
        state["graph"].nodes[0] = state["graph"].nodes[0].__class__(**{**state["graph"].nodes[0].__dict__, "output": {"price": 200}})
    if body.scenario == "merchant_substitution":
        node = state["graph"].nodes[-1]
        proof = {**node.witness_proof, "signature": "AAAA"}
        unsigned = {**node.unsigned(), "witness_proof": proof}
        digest = sha256(bytes.fromhex(node.prev_hash), canonical(unsigned)).hex()
        state["graph"].nodes[-1] = node.__class__(**unsigned, node_hash=digest, agent_signature=sign(KEY, bytes.fromhex(digest)))
    return state


async def authorize(state):
    body = state["body"]
    async with httpx.AsyncClient(timeout=5) as c:
        if body.scenario == "toctou":
            await c.post(f"{STORE_URL}/attack/set-price/50")
        r = await c.post(f"{DAE_URL}/authorize", json={"intent": {"budget": body.budget, "domain": body.domain}, "graph": state["graph"].serialise()})
    state["authorization"] = r.json()
    state["authorized"] = r.status_code == 200
    return state


async def pay(state):
    if not state["authorized"]:
        return state
    a = state["authorization"]
    payload = {k: a[k] for k in ("transaction", "signature", "transaction_public_key", "dae_attestation_signature")}
    if state["body"].scenario == "unauthorized_signing":
        payload["dae_attestation_signature"] = "AAAA"
    async with httpx.AsyncClient(timeout=5) as c:
        r = await c.post(f"{STORE_URL}/payment", json=payload)
    state["payment"] = r.json()
    state["authorized"] = r.status_code == 200
    if not state["authorized"]:
        state["authorization"] = {"detail": state["payment"].get("detail", "payment rejected")}
    return state


workflow = StateGraph(dict)
for name, fn in [("search", search), ("path_attack", path_attack), ("checkout", checkout), ("authorize", authorize), ("pay", pay)]:
    workflow.add_node(name, fn)
workflow.set_entry_point("search")
workflow.add_edge("search", "path_attack")
workflow.add_edge("path_attack", "checkout")
workflow.add_edge("checkout", "authorize")
workflow.add_edge("authorize", "pay")
workflow.add_edge("pay", END)
AGENT_GRAPH = workflow.compile()


@app.post("/run")
async def run(body: Run):
    if body.scenario not in {"standard", "injection", "toctou", "deviation", "tampered", "merchant_substitution", "unauthorized_signing"}:
        raise HTTPException(400, "unknown scenario")

    if body.user_prompt and body.run_id:
        state = {"body": body, "graph": ExecutionGraph(KEY), "authorized": False}
        browser = BrowserController(body.run_id)
        domain = body.domain

        await emit(body.run_id, "agent_plan_created", {
            "prompt": body.user_prompt,
            "actions": ["search_products", "view_product", "add_to_cart", "checkout", "read_invoice"],
        })

        search_result = await browser.call("search_products", query="VPS")
        products = search_result["output"]["products"]
        premium = next((p for p in products if p["id"] == "vps-premium"), None)
        if premium:
            chosen = premium
            content_influenced = True
        else:
            chosen = next(
                (p for p in products if p["id"] == "vps-basic"),
                products[0] if products else {"id": "vps-basic", "price": 20},
            )
            content_influenced = False

        await emit_tool(body.run_id, "search_products", search_result["output"], domain)
        await emit(body.run_id, "agent_decision", {"selected_product": chosen["id"], "content_influenced": content_influenced})
        state["graph"].append("search_products", {"query": "VPS"}, {"product_id": chosen["id"], "price": chosen["price"]}, domain)

        detail = await browser.call("view_product", product_id=chosen["id"])
        await emit_tool(body.run_id, "view_product", detail["output"], domain)
        state["graph"].append("view_product", {"product_id": chosen["id"]}, detail["output"], domain)

        cart = await browser.call("add_to_cart", product_id=chosen["id"])
        await emit_tool(body.run_id, "add_to_cart", cart["output"], domain)
        state["graph"].append("add_to_cart", {"product_id": chosen["id"]}, cart["output"], domain)

        checkout_result = await browser.call("checkout", product_id=chosen["id"])
        checkout_output = checkout_result["output"]
        await emit_tool(body.run_id, "checkout", checkout_output, domain)
        state["graph"].append(
            "checkout", {"product_id": chosen["id"]}, checkout_output["invoice"], domain,
            checkout_output.get("witness_proof"),
        )

        invoice_id = checkout_output["invoice"]["invoice_id"]
        invoice_result = await browser.call("read_invoice", invoice_id=invoice_id)
        await emit_tool(body.run_id, "read_invoice", invoice_result["output"], domain)
        state["graph"].append("read_invoice", {"invoice_id": invoice_id}, invoice_result["output"], domain)

        for node in state["graph"].serialise():
            await emit(body.run_id, "execution_node_recorded", node, "agent")

        async with httpx.AsyncClient(timeout=5) as c:
            auth = await c.post(f"{DAE_URL}/authorize", json={"intent": {"budget": body.budget, "domain": body.domain}, "graph": state["graph"].serialise()})
        state["authorization"] = auth.json()
        state["authorized"] = auth.status_code == 200
        await emit(body.run_id, "verification_result", state["authorization"], "dae")

        if state["authorized"]:
            await emit(body.run_id, "authorization_granted", {"status": "authorized"}, "dae")
            if body.run_id:
                try:
                    async with httpx.AsyncClient(timeout=2) as c:
                        run = await c.get(f"{GATEWAY_URL}/api/runs/{body.run_id}")
                        if run.status_code == 200 and run.json().get("status") == "cancelled":
                            await emit(body.run_id, "authorization_blocked", {"reason": "run abandoned"}, "gateway")
                            state["authorized"] = False
                            await emit(body.run_id, "run_finished", {"authorized": False, "reason": "run abandoned"})
                            return {"authorized": False, "scenario": "natural", "reason": "run abandoned", "graph": state["graph"].serialise()}
                except Exception:
                    pass
            a = state["authorization"]
            async with httpx.AsyncClient(timeout=5) as c:
                payment = await c.post(f"{STORE_URL}/payment", json={k: a[k] for k in ("transaction", "signature", "transaction_public_key", "dae_attestation_signature")})
            state["payment"] = payment.json()
            state["authorized"] = payment.status_code == 200
            if state["authorized"]:
                await emit(body.run_id, "payment_settled", state["payment"], "store")
            else:
                await emit(body.run_id, "authorization_blocked", {"reason": state["payment"].get("detail", "payment rejected")}, "dae")
                return {"authorized": False, "scenario": "natural", "reason": state["payment"].get("detail"), "graph": state["graph"].serialise()}
        else:
            await emit(body.run_id, "authorization_blocked", {"reason": state["authorization"].get("detail")}, "dae")
            return {"authorized": False, "scenario": "natural", "reason": state["authorization"].get("detail", "payment rejected"), "graph": state["graph"].serialise()}

        await emit(body.run_id, "run_finished", {"authorized": True})
        return {"authorized": True, "scenario": "natural", "payment": state["payment"], "graph": state["graph"].serialise(), "ssi": state["authorization"]["ssi"]}

    state = await AGENT_GRAPH.ainvoke({"body": body, "graph": ExecutionGraph(KEY)})
    if not state["authorized"]:
        return {"authorized": False, "scenario": body.scenario, "reason": state["authorization"].get("detail"), "graph": state["graph"].serialise()}
    return {"authorized": True, "scenario": body.scenario, "payment": state["payment"], "graph": state["graph"].serialise(), "ssi": state["authorization"]["ssi"]}
