"""Frontend-facing API gateway; keeps browser clients off enclave/service ports."""
import os
import httpx
import asyncio
import re
import uuid
from datetime import datetime, timezone
from .crypto import canonical, sha256
from .agent import Run as AgentRun, run as execute_agent_run
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="IISTA API Gateway")
BUILD_ID = "20260903-pending-until-finalize"
AGENT_URL = os.environ.get("IISTA_AGENT_URL", "http://127.0.0.1:8001")
DAE_URL = os.environ.get("IISTA_DAE_URL", "http://127.0.0.1:8002")
STORE_URL = os.environ.get("IISTA_STORE_URL", "http://127.0.0.1:8000")


class RunRequest(BaseModel):
    scenario: str = "standard"
    budget: int = 25
    domain: str = "mockstore.local"
    user_prompt: str | None = None
    mode: str = "autonomous"


class NaturalRun(BaseModel):
    user_prompt: str
    mode: str = "autonomous"
    demo_event: str | None = None
    session_id: str | None = None


RUNS: dict[str, dict] = {}


def _hash_event(previous: str, event: dict) -> dict:
    event["event_hash"] = sha256(bytes.fromhex(previous), canonical(event)).hex()
    return event


@app.get("/health")
def health():
    return {"service": "iista-gateway", "status": "ok", "build": BUILD_ID}


@app.post("/api/run")
async def run(body: RunRequest):
    return await execute_agent_run(AgentRun(**body.model_dump()))


def _policy(prompt: str) -> dict:
    match = re.search(r"(?:under|below|less than|within)\s*\$?(\d+)", prompt.lower())
    budget = int(match.group(1)) if match else 25
    return {
        "goal": "purchase_basic_vps",
        "budget_max": budget,
        "merchant_id": "approved-marketplace",
        "allowed_domains": ["mockstore.local"],
        "allowed_tools": ["search_products", "view_product", "add_to_cart", "checkout", "read_invoice"],
        "currency": "USD",
    }


@app.post("/api/runs")
async def create_run(body: NaturalRun):
    run_id = f"run-{uuid.uuid4().hex[:12]}"
    policy = _policy(body.user_prompt)

    ssi = None
    try:
        async with httpx.AsyncClient(timeout=5) as c:
            r = await c.post(f"{DAE_URL}/intent", json={"budget": policy["budget_max"], "domain": "mockstore.local"})
            if r.status_code == 200:
                ssi = r.json().get("ssi")
    except Exception:
        pass

    previous = "0" * 64
    events = []
    for seq, (kind, source, payload) in enumerate([
        ("intent_received", "gateway", {"prompt": body.user_prompt}),
        ("intent_normalized", "gateway", {"policy": policy, "source": "deterministic-fallback"}),
    ], start=1):
        event = {
            "run_id": run_id, "sequence": seq, "event_type": kind, "source": source,
            "timestamp": datetime.now(timezone.utc).isoformat(), "payload": payload,
            "prev_event_hash": previous,
        }
        _hash_event(previous, event)
        previous = event["event_hash"]
        events.append(event)

    if ssi:
        seq = len(events) + 1
        event = {
            "run_id": run_id, "sequence": seq, "event_type": "policy_sealed", "source": "dae",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {"ssi": ssi, "policy": policy},
            "prev_event_hash": previous,
        }
        _hash_event(previous, event)
        events.append(event)

    RUNS[run_id] = {
        "run_id": run_id, "status": "pending", "events": events,
        "policy": policy, "ssi": ssi, "demo_event": body.demo_event,
        "session_id": body.session_id,
        "execution_started": False,
    }

    if body.demo_event == "prompt_injection":
        try:
            async with httpx.AsyncClient(timeout=3) as c:
                await c.post(f"{STORE_URL}/demo/prompt-injection/{run_id}")
        except Exception:
            pass

    return {"run_id": run_id, "status": "pending", "intent": policy, "ssi": ssi}


@app.post("/api/runs/{run_id}/start")
async def start_run(run_id: str):
    if run_id not in RUNS:
        raise HTTPException(404, "run not found")
    item = RUNS[run_id]
    if item["status"] in ("completed", "blocked", "error"):
        return {"run_id": run_id, "status": item["status"]}
    if item.get("execution_started"):
        return {"run_id": run_id, "status": item["status"]}
    if item["status"] == "cancelled":
        item["status"] = "running"
    item["execution_started"] = True
    item["status"] = "running"
    asyncio.create_task(_execute_run(run_id))
    return {"run_id": run_id, "status": "running"}


@app.post("/api/runs/{run_id}/cancel")
async def cancel_run(run_id: str):
    if run_id not in RUNS:
        raise HTTPException(404, "run not found")
    item = RUNS[run_id]
    if item["status"] in ("completed", "blocked", "error"):
        return {"run_id": run_id, "status": item["status"]}
    item["status"] = "cancelled"
    try:
        async with httpx.AsyncClient(timeout=3) as c:
            await c.delete(f"{STORE_URL}/api/orders/pending/{run_id}")
    except Exception:
        pass
    return {"run_id": run_id, "status": "cancelled"}


async def _execute_run(run_id: str):
    item = RUNS[run_id]
    if item.get("status") == "cancelled":
        return
    try:
        result = await execute_agent_run(AgentRun(
            scenario="standard",
            budget=item["policy"]["budget_max"],
            domain="mockstore.local",
            user_prompt=item["events"][0]["payload"]["prompt"],
            run_id=run_id,
            session_id=item.get("session_id"),
        ))
        item["result"] = result
        item["status"] = "completed" if result.get("authorized") else "blocked"
    except Exception as exc:
        item["status"] = "error"
        item["result"] = {"authorized": False, "reason": str(exc)}


@app.get("/api/runs/{run_id}")
def get_run(run_id: str):
    if run_id not in RUNS:
        raise HTTPException(404, "run not found")
    item = RUNS[run_id]
    return {k: item[k] for k in ("run_id", "status", "policy", "result", "ssi") if k in item}


@app.get("/api/runs/{run_id}/events")
def get_events(run_id: str, after: int = 0):
    if run_id not in RUNS:
        raise HTTPException(404, "run not found")
    return {"run_id": run_id, "events": [e for e in RUNS[run_id]["events"] if e["sequence"] > after]}


@app.post("/api/runs/{run_id}/events")
def publish_event(run_id: str, body: dict):
    if run_id not in RUNS:
        raise HTTPException(404, "run not found")
    item = RUNS[run_id]
    seq = len(item["events"]) + 1
    previous = item["events"][-1].get("event_hash", "0" * 64)
    event = {
        "run_id": run_id, "sequence": seq,
        "event_type": body.get("event_type", "agent_event"),
        "source": body.get("source", "agent"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": body.get("payload", {}),
        "prev_event_hash": previous,
    }
    _hash_event(previous, event)
    item["events"].append(event)
    return event


@app.post("/api/runs/{run_id}/reset")
def reset_run(run_id: str):
    RUNS.pop(run_id, None)
    return {"status": "reset"}


@app.post("/api/runs/{run_id}/demo-event")
async def demo_event(run_id: str, body: dict):
    if run_id not in RUNS:
        raise HTTPException(404, "run not found")
    if body.get("event_type") == "prompt_injection":
        async with httpx.AsyncClient(timeout=3) as c:
            await c.post(f"{STORE_URL}/demo/prompt-injection/{run_id}")
    return {"status": "accepted", "event_type": body.get("event_type")}


@app.post("/api/intent")
async def intent(body: RunRequest):
    async with httpx.AsyncClient(timeout=5) as c:
        r = await c.post(f"{DAE_URL}/intent", json={"budget": body.budget, "domain": body.domain})
    return r.json()
