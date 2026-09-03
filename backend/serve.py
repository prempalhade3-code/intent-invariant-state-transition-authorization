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
AGENT = "http://127.0.0.1:8001"
DAE = "http://127.0.0.1:8002"

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
    checks = (
        ("GET", f"{GATEWAY}/health", None),
        ("GET", f"{STORE}/products", None),
        ("GET", f"{AGENT}/attestation", None),
        ("POST", f"{DAE}/intent", {"budget": 25, "domain": "mockstore.local"}),
    )
    last_error = "unknown"
    for _ in range(120):
        try:
            async with httpx.AsyncClient(timeout=2) as client:
                for method, url, body in checks:
                    if method == "GET":
                        response = await client.get(url)
                    else:
                        response = await client.post(url, json=body)
                    if response.status_code >= 500:
                        last_error = f"{url} returned {response.status_code}"
                        raise RuntimeError(last_error)
            return
        except Exception as exc:
            last_error = str(exc)
            if _process and _process.poll() is not None:
                raise RuntimeError(f"Backend subprocess exited early: {_process.returncode}") from exc
        await asyncio.sleep(0.5)
    raise RuntimeError(f"Backend services failed to start: {last_error}")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global _process
    env = os.environ.copy()
    env.setdefault("IISTA_DISABLE_PLAYWRIGHT", "1")
    env["PYTHONPATH"] = ROOT
    _process = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=ROOT,
        env=env,
    )
    await _wait_for_services()
    yield
    if _process and _process.poll() is None:
        _process.send_signal(signal.SIGTERM)
        try:
            _process.wait(timeout=15)
        except subprocess.TimeoutExpired:
            _process.kill()
            _process.wait(timeout=5)


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


def _is_gateway_path(path: str) -> bool:
    if path == "/health":
        return True
    if path in ("/api/run", "/api/intent"):
        return True
    return path.startswith("/api/runs")


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request) -> Response:
    upstream = GATEWAY if _is_gateway_path(request.url.path) else STORE
    return await _forward(request, upstream)
