"""Route internal service HTTP calls to in-process ASGI apps (no TCP ports)."""
from __future__ import annotations

import httpx
from httpx import ASGITransport

_ORIGINAL = httpx.AsyncClient
_TRANSPORTS: dict[str, ASGITransport] = {}


def register_internal_service(base_url: str, app) -> None:
    _TRANSPORTS[base_url.rstrip("/")] = ASGITransport(app=app)


class InternalAsyncClient(_ORIGINAL):
    async def request(self, method, url, **kwargs):
        url_str = str(url)
        for base, transport in _TRANSPORTS.items():
            if url_str.startswith(base):
                path = url_str[len(base):] or "/"
                async with _ORIGINAL(transport=transport, base_url=base, timeout=kwargs.get("timeout")) as client:
                    return await client.request(method, path, **kwargs)
        return await super().request(method, url, **kwargs)


def install() -> None:
    httpx.AsyncClient = InternalAsyncClient  # type: ignore[misc, assignment]
