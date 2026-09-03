"""Production entrypoint: all IISTA services in one process + public reverse proxy."""
from __future__ import annotations

import asyncio
import os
import sys
from contextlib import asynccontextmanager

import httpx
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import Response

ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from bootstrap_env import provision

GATEWAY = "http://127.0.0.1:8003"
STORE = "http://127.0.0.1:8000"
AGENT = "http://127.0.0.1:8001"
DAE = "http://127.0.0.1:8002"

_servers: list[uvicorn.Server] = []
_tasks: list[asyncio.Task] = []

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

SERVICE_APPS = (
    ("app.mock_store:app", 8000),
    ("app.agent:app", 8001),
    ("app.dae:app", 8002),
    ("app.main:app", 8003),
)


async def _run_service(app_path: str, port: int) -> None:
    config = uvicorn.Config(
        app_path,
        host="127.0.0.1",
        port=port,
        log_level="warning",
        access_log=False,
    )
    server = uvicorn.Server(config)
    _servers.append(server)
    await server.serve()


async def _wait_for_services() -> None:
    checks = (
        ("GET", f"{GATEWAY}/health", None),
        ("GET", f"{STORE}/products", None),
        ("GET", f"{AGENT}/health", None),
        ("POST", f"{DAE}/intent", {"budget": 25, "domain": "mockstore.local"}),
    )
    last_error = "unknown"
    for _ in range(120):
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                for method, url, body in checks:
                    response = (
                        await client.get(url)
                        if method == "GET"
                        else await client.post(url, json=body)
                    )
                    if response.status_code >= 500:
                        raise RuntimeError(f"{url} returned {response.status_code}")
            return
        except Exception as exc:
            last_error = str(exc)
        await asyncio.sleep(0.5)
    raise RuntimeError(f"Backend services failed to start: {last_error}")


async def _start_services() -> None:
    provision(force=True)
    os.environ.setdefault("IISTA_DISABLE_PLAYWRIGHT", "1")
    for app_path, port in SERVICE_APPS:
        task = asyncio.create_task(_run_service(app_path, port), name=f"iista-{port}")
        _tasks.append(task)
        await asyncio.sleep(0.4)
    await _wait_for_services()


async def _stop_services() -> None:
    for server in _servers:
        server.should_exit = True
    if _tasks:
        await asyncio.gather(*_tasks, return_exceptions=True)
    _tasks.clear()
    _servers.clear()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await _start_services()
    yield
    await _stop_services()


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
