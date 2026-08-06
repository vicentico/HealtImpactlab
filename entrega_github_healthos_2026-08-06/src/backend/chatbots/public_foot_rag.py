from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class PublicChunk:
    title: str
    content: str
    tags: tuple[str, ...]


# Synthetic paraphrases for the demo. Replace with reviewed public clinical documents and citations.
PUBLIC_FOOT_KNOWLEDGE = [
    PublicChunk(
        "Prevención",
        "Revise diariamente ambos pies, use calzado adecuado y evite caminar descalzo. No corte callos ni aplique sustancias corrosivas.",
        ("prevención", "autocuidado", "calzado"),
    ),
    PublicChunk(
        "Señales de alerta",
        "Una herida, ampolla, cambio de color, calor local, hinchazón, secreción, mal olor o fiebre requiere evaluación profesional; algunas señales necesitan atención urgente.",
        ("síntomas", "herida", "secreción", "fiebre", "mal olor"),
    ),
    PublicChunk(
        "Pérdida de sensibilidad",
        "Hormigueo, adormecimiento o pérdida de sensibilidad pueden favorecer lesiones que pasan inadvertidas. Se recomienda control clínico de pies y educación preventiva.",
        ("neuropatía", "hormigueo", "adormecimiento"),
    ),
    PublicChunk(
        "Alcance",
        "El asistente entrega educación general y orientación para consultar. No clasifica por sí solo una urgencia ni reemplaza al equipo médico.",
        ("alcance", "diagnóstico", "médico"),
    ),
]

RED_FLAGS = ("fiebre", "mal olor", "pus", "secreción", "negro", "necrosis", "dolor intenso", "herida")


def public_foot_answer(message: str) -> tuple[str, list[str]]:
    normalized = re.sub(r"[^a-záéíóúñ0-9\s]", " ", message.lower())
    tokens = set(normalized.split())
    ranked = sorted(
        PUBLIC_FOOT_KNOWLEDGE,
        key=lambda chunk: sum(1 for tag in chunk.tags if tag in tokens or tag in normalized),
        reverse=True,
    )
    selected = ranked[:2]
    red_flag_found = [flag for flag in RED_FLAGS if flag in normalized]

    if red_flag_found:
        answer = (
            "Los síntomas descritos incluyen señales de alerta. La recomendación segura es solicitar "
            "evaluación profesional presencial sin demora; si hay fiebre, tejido oscuro, deterioro rápido "
            "o compromiso general, use la vía de urgencia local. No envíe datos personales a este chatbot."
        )
    else:
        answer = " ".join(chunk.content for chunk in selected)
    return answer, [chunk.title for chunk in selected]
