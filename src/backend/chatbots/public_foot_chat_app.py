from __future__ import annotations

from fastapi import FastAPI

from src.backend.chatbots.public_foot_rag import public_foot_answer
from src.backend.schemas import ChatRequest, ChatResponse
from src.backend.security.logging import new_audit_id, redact
from src.backend.security.middleware import LocalRateLimitMiddleware, SecurityHeadersMiddleware

app = FastAPI(title="HealthOS - Chatbot Público Pie Diabético", version="0.1.0")
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LocalRateLimitMiddleware, requests_per_minute=60)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "public-foot-chat", "data_access": "none"}


@app.post("/api/chat/public-foot", response_model=ChatResponse)
def public_foot_chat(request: ChatRequest) -> ChatResponse:
    audit_id = new_audit_id()
    if request.patient_synthetic_id or request.institution_id:
        return ChatResponse(
            answer="El chatbot público no acepta identificadores ni contexto de pacientes.",
            intent="scope_violation",
            evidence=["Proceso aislado sin repositorio clínico"],
            blocked=True,
            audit_id=audit_id,
        )
    answer, evidence = public_foot_answer(redact(request.message))
    return ChatResponse(
        answer=answer,
        intent="public_foot_education",
        evidence=evidence,
        audit_id=audit_id,
    )
