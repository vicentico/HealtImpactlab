from __future__ import annotations

import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from src.backend.config import get_settings
from src.backend.schemas import Role

security = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    subject: str
    role: Role
    institution_id: str | None = None
    display_name: str = "Usuario HealthOS"
    edition: str = "hospital_operaciones"


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(message: bytes, secret: str) -> str:
    signature = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).digest()
    return _b64url_encode(signature)


def create_demo_token(
    subject: str,
    role: Role,
    institution_id: str | None = None,
    display_name: str = "Usuario HealthOS",
    edition: str = "hospital_operaciones",
) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": subject,
        "role": role.value,
        "institution_id": institution_id,
        "display_name": display_name,
        "edition": edition,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=8)).timestamp()),
        "aud": "healthos-local",
    }
    encoded_header = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    encoded_payload = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    message = f"{encoded_header}.{encoded_payload}".encode("ascii")
    return f"{encoded_header}.{encoded_payload}.{_sign(message, settings.jwt_secret)}"


def _decode_and_verify(token: str) -> dict[str, Any]:
    settings = get_settings()
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Formato JWT inválido")
    encoded_header, encoded_payload, signature = parts
    message = f"{encoded_header}.{encoded_payload}".encode("ascii")
    expected = _sign(message, settings.jwt_secret)
    if not hmac.compare_digest(signature, expected):
        raise ValueError("Firma inválida")
    header = json.loads(_b64url_decode(encoded_header))
    payload = json.loads(_b64url_decode(encoded_payload))
    if header.get("alg") != "HS256" or payload.get("aud") != "healthos-local":
        raise ValueError("Algoritmo o audiencia inválida")
    if int(payload.get("exp", 0)) <= int(datetime.now(timezone.utc).timestamp()):
        raise ValueError("Token vencido")
    return payload


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")
    try:
        payload = _decode_and_verify(credentials.credentials)
        return CurrentUser(
            subject=payload["sub"],
            role=Role(payload["role"]),
            institution_id=payload.get("institution_id"),
            display_name=payload.get("display_name", "Usuario HealthOS"),
            edition=payload.get("edition", "hospital_operaciones"),
        )
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o vencido",
        ) from exc


def require_roles(*roles: Role):
    def dependency(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Rol sin permisos para esta operación")
        return user

    return dependency


def authenticate_demo_user(username: str, password: str) -> tuple[Role, str, str] | None:
    """Demo-only credential registry sourced from environment variables."""
    settings = get_settings()
    accounts = (
        (settings.demo_chief_username, settings.demo_chief_password, Role.JEFATURA_DM2, "Jefatura clínica", "INST-001"),
        (settings.demo_doctor_username, settings.demo_doctor_password, Role.MEDICO, "Médico tratante", "INST-001"),
        (settings.demo_nurse_username, settings.demo_nurse_password, Role.ENFERMERIA, "Enfermería clínica", "INST-001"),
    )
    for stored_user, stored_password, role, display_name, institution_id in accounts:
        if hmac.compare_digest(username, stored_user) and hmac.compare_digest(password, stored_password):
            return role, display_name, institution_id
    return None
