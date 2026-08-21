"""Frontend-facing API gateway; keeps browser clients off enclave/service ports."""
import os
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="IISTA API Gateway")
AGENT_URL = os.environ.get("IISTA_AGENT_URL", "http://127.0.0.1:8001")
DAE_URL = os.environ.get("IISTA_DAE_URL", "http://127.0.0.1:8002")
class RunRequest(BaseModel): scenario: str = "standard"; budget: int = 25; domain: str = "mockstore.local"
@app.get("/health")
def health(): return {"service":"iista-gateway","status":"ok"}
@app.post("/api/run")
async def run(body: RunRequest):
    async with httpx.AsyncClient(timeout=10) as c: r=await c.post(f"{AGENT_URL}/run",json=body.model_dump())
    if r.status_code >= 500: raise HTTPException(502,"agent unavailable")
    return r.json()
@app.post("/api/intent")
async def intent(body: RunRequest):
    async with httpx.AsyncClient(timeout=5) as c: r=await c.post(f"{DAE_URL}/intent",json={"budget":body.budget,"domain":body.domain})
    return r.json()
