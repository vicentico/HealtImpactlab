from __future__ import annotations

import hashlib
import logging
import re
import uuid

SENSITIVE_PATTERNS = [
    re.compile(r"\b\d{7,8}-[0-9kK]\b"),
    re.compile(r"(?i)(authorization|token|secret|password)\s*[:=]\s*\S+"),
]


def configure_logging(level: str = "INFO") -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format='{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
    )


def pseudonymize(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:12]


def redact(text: str) -> str:
    output = text
    for pattern in SENSITIVE_PATTERNS:
        output = pattern.sub("[REDACTED]", output)
    return output[:1500]


def new_audit_id() -> str:
    return f"audit-{uuid.uuid4().hex[:16]}"
