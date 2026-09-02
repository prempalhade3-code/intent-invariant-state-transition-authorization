"""Production entrypoint: internal services + public reverse proxy on $PORT."""
from __future__ import annotations

import asyncio
import os
import signal
import subprocess
import sys
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import Response

ROOT = os.path.dirname(os.path.abspath(__file__))
GATEWAY = "http://127.0.0.1:8003"
STORE = "http://127.0.0.1:8000"

_process: subprocess.Popen | None = None

HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "content-encoding",
    "content-length",
}


async def _wait_for_services() -> None:
    for _ in range(90):
        try:
            async with httpx.AsyncClient(timeout=2) as client:
                health = await client.get(f"{GATEWAY}/health")
                store = await client.get(f"{STORE}/products")
                if health.status_code == 200 and store.status_code == 200:
                    return
        except Exception:
            pass
        await asyncio.sleep(0.5)
    raise RuntimeError("Backend services failed to start")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global _process
    _process = subprocess.Popen([sys.executable, "run.py"], cwd=ROOT)
    await _wait_for_services()
    yield
    if _process and _process.poll() is None:
        _process.send_signal(signal.SIGTERM)
        _process.wait(timeout=15)


app = FastAPI(title="Sworn Backend Proxy", lifespan=lifespan)


async def _forward(request: Request, upstream: str) -> Response:
    url = upstream + request.url.path
    if request.url.query:
        url += f"?{request.url.query}"
    body = await request.body()
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in ("host", "content-length")
    }
    async with httpx.AsyncClient(timeout=120, follow_redirects=False) as client:
        upstream_response = await client.request(
            request.method,
            url,
            headers=headers,
            content=body,
        )
    response_headers = {
        key: value
        for key, value in upstream_response.headers.items()
        if key.lower() not in HOP_BY_HOP
    }
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type"),
    )


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request) -> Response:
    if request.url.path.startswith("/api") or request.url.path == "/health":
        return await _forward(request, GATEWAY)
    return await _forward(request, STORE)
