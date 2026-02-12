from __future__ import annotations

import base64
import hashlib
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from config import ENCRYPTION_KEY

_key_bytes: bytes = base64.b64decode(ENCRYPTION_KEY) if ENCRYPTION_KEY else b""


def encrypt(plaintext: str) -> str:
    """AES-256-GCM encrypt. Returns base64(nonce + ciphertext + tag)."""
    nonce = os.urandom(12)
    ct = AESGCM(_key_bytes).encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ct).decode()


def decrypt(blob_b64: str) -> str:
    """Reverse of encrypt()."""
    raw = base64.b64decode(blob_b64)
    nonce, ct = raw[:12], raw[12:]
    return AESGCM(_key_bytes).decrypt(nonce, ct, None).decode()


def sha256_hash(value: str) -> str:
    """Deterministic SHA-256 hex digest for DB lookups."""
    return hashlib.sha256(value.encode()).hexdigest()
