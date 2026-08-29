"""DAE: sole holder of master secret; validates graph, invariant, and store oracle."""
import os
import httpx
from cryptography.hazmat.primitives import serialization
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .crypto import (ExecutionGraph, SecurityError, canonical, compile_ssi, derive_transaction_key,
                     public_pem, random_master_secret, sign, verify)

app = FastAPI(title="IISTA DAE")
MASTER_SECRET = random_master_secret()  # never serialized, exported, or shared with Agent
_raw = os.environ.get("IISTA_DAE_PRIVATE_KEY")
DAE_IDENTITY_KEY = serialization.load_pem_private_key(_raw.encode(), password=None) if _raw else None
AGENT_PUBLIC_KEY = os.environ.get("IISTA_AGENT_PUBLIC_KEY", "")
TRUSTED_MERCHANT_PUBLIC_KEY = os.environ.get("IISTA_STORE_PUBLIC_KEY", "")
STORE_URL = os.environ.get("IISTA_STORE_URL", "http://127.0.0.1:8000")
ALLOWED_TOOLS = ["search_products", "view_product", "add_to_cart", "checkout", "read_invoice"]
class Intent(BaseModel): budget: int; domain: str
class Authorize(BaseModel): intent: Intent; graph: list[dict]
@app.post("/intent")
def intent(body: Intent): return {"ssi": compile_ssi(body.budget, body.domain, ALLOWED_TOOLS)}
@app.post("/authorize")
async def authorize(body: Authorize):
    try:
        if not AGENT_PUBLIC_KEY: raise SecurityError("agent attestation key not provisioned")
        ssi = compile_ssi(body.intent.budget, body.intent.domain, ALLOWED_TOOLS)
        nodes = ExecutionGraph.validate(body.graph, AGENT_PUBLIC_KEY)
        for n in nodes:
            if n.domain != ssi["domain"] or n.tool not in ssi["allowed_tools"]: raise SecurityError("SSI rejected execution path")
        invoice_nodes = [n for n in nodes if n.tool == "checkout" and n.witness_proof]
        if len(invoice_nodes) != 1: raise SecurityError("exactly one signed invoice witness is required")
        witness = invoice_nodes[0].witness_proof
        invoice = witness["invoice"]
        if not TRUSTED_MERCHANT_PUBLIC_KEY or not verify(TRUSTED_MERCHANT_PUBLIC_KEY, canonical(invoice), witness["signature"]): raise SecurityError("merchant invoice witness invalid")
        if invoice["price"] > ssi["budget"] or invoice["domain"] != ssi["domain"]: raise SecurityError("invoice violates budget or domain SSI")
        async with httpx.AsyncClient(timeout=3) as client: oracle = (await client.get(f"{STORE_URL}/oracle/{invoice['invoice_id']}")).json()
        if oracle["current_price"] != invoice["price"]: raise SecurityError("commit-time oracle detected stale price")
        tx = {"invoice_id": invoice["invoice_id"], "amount": invoice["price"], "domain": invoice["domain"], "graph_tip": nodes[-1].node_hash}
        tx_key = derive_transaction_key(MASTER_SECRET, nodes, ssi)
        tx_public_key = public_pem(tx_key)
        envelope = {"transaction": tx, "transaction_public_key": tx_public_key}
        if DAE_IDENTITY_KEY is None: raise SecurityError("DAE identity key not provisioned")
        return {"authorized": True, "transaction": tx, "signature": sign(tx_key, canonical(tx)), "transaction_public_key": tx_public_key,
                "dae_attestation_signature": sign(DAE_IDENTITY_KEY, canonical(envelope)), "ssi": ssi}
    except SecurityError as exc: raise HTTPException(403, str(exc))
