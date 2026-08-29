"""Frontend-facing API gateway; keeps browser clients off enclave/service ports."""
import os
import httpx
import asyncio, re, uuid
from datetime import datetime, timezone
from .crypto import canonical, sha256
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="IISTA API Gateway")
AGENT_URL = os.environ.get("IISTA_AGENT_URL", "http://127.0.0.1:8001")
DAE_URL = os.environ.get("IISTA_DAE_URL", "http://127.0.0.1:8002")
class RunRequest(BaseModel): scenario: str = "standard"; budget: int = 25; domain: str = "mockstore.local"; user_prompt: str | None = None; mode: str = "autonomous"
class NaturalRun(BaseModel): user_prompt: str; mode: str = "autonomous"; demo_event: str | None = None
RUNS: dict[str, dict] = {}
@app.get("/health")
def health(): return {"service":"iista-gateway","status":"ok"}
@app.post("/api/run")
async def run(body: RunRequest):
    async with httpx.AsyncClient(timeout=10) as c: r=await c.post(f"{AGENT_URL}/run",json=body.model_dump())
    if r.status_code >= 500: raise HTTPException(502,"agent unavailable")
    return r.json()

def _policy(prompt: str) -> dict:
    match = re.search(r"(?:under|below|less than|within)\s*\$?(\d+)", prompt.lower())
    budget = int(match.group(1)) if match else 25
    return {"goal": "purchase_basic_vps", "budget_max": budget, "merchant_id": "approved-marketplace",
            "allowed_domains": [body_domain := "mockstore.local"],
            "allowed_tools": ["search_products", "view_product", "add_to_cart", "checkout", "read_invoice"], "currency": "USD"}

@app.post("/api/runs")
async def create_run(body: NaturalRun):
    run_id = f"run-{uuid.uuid4().hex[:12]}"
    policy = _policy(body.user_prompt)
    events = [{"run_id": run_id, "sequence": 1, "event_type": "intent_received", "source": "gateway", "payload": {"prompt": body.user_prompt}} ,
              {"run_id": run_id, "sequence": 2, "event_type": "intent_normalized", "source": "gateway", "payload": {"policy": policy, "source": "deterministic-fallback"}}]
    RUNS[run_id] = {"run_id": run_id, "status": "running", "events": events, "policy": policy, "demo_event": body.demo_event}
    if body.demo_event == "prompt_injection":
        try:
            async with httpx.AsyncClient(timeout=3) as c: await c.post(f"http://127.0.0.1:8000/demo/prompt-injection/{run_id}")
        except Exception: pass
    asyncio.create_task(_execute_run(run_id))
    return {"run_id": run_id, "status": "running", "intent": policy}

async def _execute_run(run_id: str):
    item = RUNS[run_id]
    async with httpx.AsyncClient(timeout=20) as c:
        try:
            r = await c.post(f"{AGENT_URL}/run", json={"scenario": "standard", "budget": item["policy"]["budget_max"], "domain": "mockstore.local", "user_prompt": item["events"][0]["payload"]["prompt"], "run_id": run_id})
            result = r.json()
            item["result"] = result; item["status"] = "completed" if r.status_code < 400 else "blocked"
            # Agent emits live events; retain only a terminal fallback marker.
            seq = len(item["events"])
            previous = item["events"][-1].get("event_hash", "0" * 64)
            def emit(kind, source, payload):
                nonlocal seq, previous
                seq += 1
                event = {"run_id": run_id, "sequence": seq, "event_type": kind, "source": source,
                         "timestamp": datetime.now(timezone.utc).isoformat(), "payload": payload, "prev_event_hash": previous}
                event["event_hash"] = sha256(bytes.fromhex(previous), canonical(event)).hex(); previous = event["event_hash"]
                item["events"].append(event)
            graph = result.get("graph", [])
            if len(item["events"]) > 2:
                return
            emit("agent_plan_created", "agent", {"actions": [n.get("tool") for n in graph]})
            for node in graph:
                emit("browser_action", "browser", {"tool": node.get("tool"), "domain": node.get("domain"), "params": node.get("params")})
                emit("merchant_response", "store", {"tool": node.get("tool"), "output": node.get("output")})
                emit("execution_node_recorded", "agent", node)
            if result.get("authorized"):
                emit("authorization_granted", "dae", {"amount": result.get("payment", {}).get("amount"), "status": "authorized"})
                emit("payment_submitted", "gateway", result.get("payment", {})); emit("payment_settled", "store", result.get("payment", {}))
            else:
                emit("authorization_blocked", "dae", {"reason": result.get("reason")})
            emit("run_finished", "agent", result)
        except Exception as exc:
            item["status"] = "error"; item["result"] = {"authorized": False, "reason": str(exc)}

@app.get("/api/runs/{run_id}")
def get_run(run_id: str):
    if run_id not in RUNS: raise HTTPException(404, "run not found")
    item = RUNS[run_id]
    return {k: item[k] for k in ("run_id", "status", "policy", "result") if k in item}

@app.get("/api/runs/{run_id}/events")
def get_events(run_id: str, after: int = 0):
    if run_id not in RUNS: raise HTTPException(404, "run not found")
    return {"run_id": run_id, "events": [e for e in RUNS[run_id]["events"] if e["sequence"] > after]}

@app.post("/api/runs/{run_id}/events")
def publish_event(run_id: str, body: dict):
    if run_id not in RUNS: raise HTTPException(404, "run not found")
    item = RUNS[run_id]; seq = len(item["events"]) + 1
    previous = item["events"][-1].get("event_hash", "0" * 64)
    event = {"run_id": run_id, "sequence": seq, "event_type": body.get("event_type", "agent_event"), "source": body.get("source", "agent"), "timestamp": datetime.now(timezone.utc).isoformat(), "payload": body.get("payload", {}), "prev_event_hash": previous}
    event["event_hash"] = sha256(bytes.fromhex(previous), canonical(event)).hex(); item["events"].append(event)
    return event

@app.post("/api/runs/{run_id}/reset")
def reset_run(run_id: str):
    RUNS.pop(run_id, None); return {"status": "reset"}

@app.post("/api/runs/{run_id}/demo-event")
async def demo_event(run_id: str, body: dict):
    if run_id not in RUNS: raise HTTPException(404, "run not found")
    if body.get("event_type") == "prompt_injection":
        async with httpx.AsyncClient(timeout=3) as c: await c.post(f"http://127.0.0.1:8000/demo/prompt-injection/{run_id}")
    return {"status":"accepted", "event_type":body.get("event_type")}
@app.post("/api/intent")
async def intent(body: RunRequest):
    async with httpx.AsyncClient(timeout=5) as c: r=await c.post(f"{DAE_URL}/intent",json={"budget":body.budget,"domain":body.domain})
    return r.json()
