"""Production entrypoint: one process, in-process services, public proxy on $PORT."""
from __future__ import annotations

import os
import sys
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import Response

ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from bootstrap_env import provision

GATEWAY = "http://127.0.0.1:8003"
STORE = "http://127.0.0.1:8000"

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
        ("GET", "http://127.0.0.1:8001/health", None),
        ("POST", "http://127.0.0.1:8002/intent", {"budget": 25, "domain": "mockstore.local"}),
    )
    last_error = "unknown"
    for _ in range(60):
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                for method, url, body in checks:
                    response = (
                        await client.get(url)
                        if method == "GET"
                        else await client.post(url, json=body)
                    )
                    if response.status_code >= 500:
                        raise RuntimeError(f"{url} -> {response.status_code}")
            return
        except Exception as exc:
            last_error = str(exc)
        import asyncio
        await asyncio.sleep(0.5)
    raise RuntimeError(f"Backend services failed to start: {last_error}")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    provision(force=True)
    os.environ["IISTA_DISABLE_PLAYWRIGHT"] = "1"

    from app.internal_http import install, register_internal_service

    install()

    from app import agent, dae, main as gateway, mock_store

    register_internal_service("http://127.0.0.1:8000", mock_store.app)
    register_internal_service("http://127.0.0.1:8001", agent.app)
    register_internal_service("http://127.0.0.1:8002", dae.app)
    register_internal_service("http://127.0.0.1:8003", gateway.app)

    await _wait_for_services()
    yield


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


@app.get("/health")
async def health():
    async with httpx.AsyncClient(timeout=5) as client:
        response = await client.get(f"{GATEWAY}/health")
    return Response(content=response.content, status_code=response.status_code, media_type="application/json")


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request) -> Response:
    if request.url.path == "/health":
        return await health()
    upstream = GATEWAY if _is_gateway_path(request.url.path) else STORE
    return await _forward(request, upstream)
