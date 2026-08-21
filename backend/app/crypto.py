"""Cryptographic primitives used by IISTA's isolated services."""

from __future__ import annotations

import base64
import hashlib
import json
import os
from dataclasses import asdict, dataclass
from typing import Any

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

SECP256K1_ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
GENESIS_HASH = "0" * 64


class SecurityError(ValueError):
    """Raised when execution evidence cannot satisfy a security invariant."""


def canonical(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def sha256(*parts: bytes) -> bytes:
    return hashlib.sha256(b"".join(parts)).digest()


def b64(value: bytes) -> str:
    return base64.b64encode(value).decode()


def unb64(value: str) -> bytes:
    return base64.b64decode(value.encode())


def make_key() -> ec.EllipticCurvePrivateKey:
    return ec.generate_private_key(ec.SECP256K1())


def public_pem(key: ec.EllipticCurvePrivateKey) -> str:
    return key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo).decode()


def load_public_key(pem: str) -> ec.EllipticCurvePublicKey:
    key = serialization.load_pem_public_key(pem.encode())
    if not isinstance(key, ec.EllipticCurvePublicKey) or key.curve.name != "secp256k1":
        raise SecurityError("attestation key must be secp256k1")
    return key


def sign(key: ec.EllipticCurvePrivateKey, payload: bytes) -> str:
    return b64(key.sign(payload, ec.ECDSA(hashes.SHA256())))


def verify(public_key_pem: str, payload: bytes, signature: str) -> bool:
    try:
        load_public_key(public_key_pem).verify(unb64(signature), payload, ec.ECDSA(hashes.SHA256()))
        return True
    except Exception:
        return False


@dataclass(frozen=True)
class ExecutionNode:
    tool: str
    params: dict[str, Any]
    output: dict[str, Any]
    witness_proof: dict[str, Any] | None
    domain: str
    prev_hash: str
    node_hash: str
    agent_signature: str

    def unsigned(self) -> dict[str, Any]:
        data = asdict(self)
        data.pop("node_hash")
        data.pop("agent_signature")
        return data

    def signed_payload(self) -> bytes:
        return bytes.fromhex(self.node_hash)


class ExecutionGraph:
    """Append-only SHA-256 state transition graph represented as a linear DAG path."""

    def __init__(self, signing_key: ec.EllipticCurvePrivateKey | None = None) -> None:
        self.signing_key = signing_key
        self.nodes: list[ExecutionNode] = []

    def append(self, tool: str, params: dict[str, Any], output: dict[str, Any], domain: str,
               witness_proof: dict[str, Any] | None = None) -> ExecutionNode:
        if self.signing_key is None:
            raise RuntimeError("only an attested agent may append graph nodes")
        prev_hash = self.nodes[-1].node_hash if self.nodes else GENESIS_HASH
        unsigned = {"tool": tool, "params": params, "output": output, "witness_proof": witness_proof,
                    "domain": domain, "prev_hash": prev_hash}
        node_hash = sha256(bytes.fromhex(prev_hash), canonical(unsigned)).hex()
        node = ExecutionNode(**unsigned, node_hash=node_hash, agent_signature=sign(self.signing_key, bytes.fromhex(node_hash)))
        self.nodes.append(node)
        return node

    def serialise(self) -> list[dict[str, Any]]:
        return [asdict(node) for node in self.nodes]

    @staticmethod
    def validate(nodes: list[dict[str, Any]], agent_public_key: str) -> list[ExecutionNode]:
        previous = GENESIS_HASH
        result: list[ExecutionNode] = []
        for raw in nodes:
            node = ExecutionNode(**raw)
            if node.prev_hash != previous:
                raise SecurityError("execution graph has a broken predecessor link")
            expected = sha256(bytes.fromhex(previous), canonical(node.unsigned())).hex()
            if node.node_hash != expected:
                raise SecurityError("execution graph hash does not match node contents")
            if not verify(agent_public_key, node.signed_payload(), node.agent_signature):
                raise SecurityError("agent attestation signature is invalid")
            previous = node.node_hash
            result.append(node)
        if not result:
            raise SecurityError("authorization requires a non-empty execution graph")
        return result


def compile_ssi(budget: int, domain: str, allowed_tools: list[str]) -> dict[str, Any]:
    if budget <= 0 or not domain or not allowed_tools:
        raise SecurityError("invalid intent invariant")
    body = {"budget": budget, "domain": domain, "allowed_tools": sorted(allowed_tools)}
    return {**body, "digest": sha256(canonical(body)).hex()}


def derive_transaction_key(master_secret: bytes, nodes: list[ExecutionNode], ssi: dict[str, Any]) -> ec.EllipticCurvePrivateKey:
    """DPKD: recursively bind a transaction key to every approved node and SSI."""
    material = HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=b"IISTA/DPKD/extract").derive(master_secret)
    ssi_digest = bytes.fromhex(ssi["digest"])
    for node in nodes:
        material = HKDF(algorithm=hashes.SHA256(), length=32, salt=material,
                        info=b"IISTA/DPKD/expand" + bytes.fromhex(node.node_hash) + ssi_digest).derive(material)
    scalar = int.from_bytes(material, "big") % (SECP256K1_ORDER - 1) + 1
    return ec.derive_private_key(scalar, ec.SECP256K1())


def random_master_secret() -> bytes:
    return os.urandom(32)
