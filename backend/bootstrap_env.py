"""Provision crypto keys and service URLs before any IISTA app module loads."""
from __future__ import annotations

import os
from cryptography.hazmat.primitives import serialization

from app.crypto import make_key, public_pem

ROOT = os.path.dirname(os.path.abspath(__file__))


def _private_pem(key) -> str:
    return key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    ).decode()


def provision(force: bool = False) -> None:
    """Set process env for store, agent, DAE, and gateway."""
    if os.environ.get("IISTA_BOOTSTRAPPED") == "1" and not force:
        return

    agent_key = make_key()
    store_key = make_key()
    dae_key = make_key()

    values = {
        "PYTHONPATH": ROOT,
        "IISTA_BOOTSTRAPPED": "1",
        "IISTA_STORE_URL": "http://127.0.0.1:8000",
        "IISTA_DAE_URL": "http://127.0.0.1:8002",
        "IISTA_AGENT_URL": "http://127.0.0.1:8001",
        "IISTA_GATEWAY_URL": "http://127.0.0.1:8003",
        "IISTA_DISABLE_PLAYWRIGHT": os.environ.get("IISTA_DISABLE_PLAYWRIGHT", "1"),
        "IISTA_AGENT_PRIVATE_KEY": _private_pem(agent_key),
        "IISTA_AGENT_PUBLIC_KEY": public_pem(agent_key),
        "IISTA_STORE_PRIVATE_KEY": _private_pem(store_key),
        "IISTA_STORE_PUBLIC_KEY": public_pem(store_key),
        "IISTA_DAE_PRIVATE_KEY": _private_pem(dae_key),
        "IISTA_DAE_PUBLIC_KEY": public_pem(dae_key),
    }

    for key, value in values.items():
        os.environ[key] = value
