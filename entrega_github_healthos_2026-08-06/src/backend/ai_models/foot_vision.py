from __future__ import annotations

import hashlib
import io
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
import numpy as np
from PIL import Image, UnidentifiedImageError

from src.backend.config import get_settings
from src.backend.schemas import FootClassifyRequest, FootClassifyResponse, Role
from src.backend.security.auth import CurrentUser, require_roles
from src.backend.security.middleware import LocalRateLimitMiddleware, SecurityHeadersMiddleware

try:
    import torch
except ImportError:  # pragma: no cover - core environment can run without ML extras.
    torch = None


class DiabeticFootVisionWrapper:
    """
    Safe wrapper for a future validated CNN/TorchScript model.

    Default mode is deterministic simulation, keyed by a synthetic URL. It does not fetch
    remote images and therefore cannot leak data or be abused for SSRF. A production model
    must receive locally uploaded, malware-scanned bytes through a dedicated media service.
    """

    def __init__(self, model_path: str = ""):
        self.model_path = Path(model_path) if model_path else None
        self.model = None
        self.mode = "synthetic-deterministic"
        if self.model_path and self.model_path.exists() and torch is not None:
            self.model = torch.jit.load(str(self.model_path), map_location="cpu")
            self.model.eval()
            self.mode = "torchscript-local"

    @staticmethod
    def _deterministic_features(url: str) -> tuple[int, float, float, float]:
        digest = hashlib.sha256(url.encode("utf-8")).digest()
        # Demo distribution is deliberately concentrated in stages 0-3.
        selector = digest[0] / 255
        if selector < 0.22:
            stage = 0
        elif selector < 0.47:
            stage = 1
        elif selector < 0.73:
            stage = 2
        elif selector < 0.91:
            stage = 3
        elif selector < 0.98:
            stage = 4
        else:
            stage = 5
        confidence = round(0.62 + (digest[1] / 255) * 0.34, 3)
        synthetic_area_cm2 = round(0.2 + (digest[2] / 255) * 8.0, 2)
        infection_signal = round((digest[3] / 255) * 0.55 + (stage / 5) * 0.45, 3)
        return stage, confidence, synthetic_area_cm2, infection_signal

    def classify_url(self, synthetic_url: str) -> FootClassifyResponse:
        if not synthetic_url.startswith(("synthetic://", "https://synthetic.healthos.local/")):
            raise ValueError(
                "El MVP solo acepta URLs sintéticas internas; no descarga contenido externo."
            )

        # The executable scaffold intentionally avoids pretending that unvalidated model weights exist.
        stage, confidence, area, infection_signal = self._deterministic_features(synthetic_url)
        infection_risk = "alto" if infection_signal >= 0.7 else "medio" if infection_signal >= 0.4 else "bajo"

        if stage >= 4:
            suggestion = "Revisión profesional inmediata y activación de ruta de pie diabético"
        elif stage >= 2:
            suggestion = "Derivación prioritaria a equipo de pie diabético"
        elif stage == 1:
            suggestion = "Evaluación clínica preferente y seguimiento de lesión"
        else:
            suggestion = "Mantener prevención, educación y evaluación clínica programada"

        return FootClassifyResponse(
            synthetic_stage=stage,
            synthetic_probability=confidence,
            infection_risk=infection_risk,
            prioritization_suggestion=suggestion,
            model_mode=self.mode,
            disclaimer=(
                "Salida sintética de demostración. No diagnostica, no reemplaza examen físico ni juicio clínico."
            ),
            explainability={
                "synthetic_lesion_area_cm2": area,
                "synthetic_infection_signal": infection_signal,
                "attention_method": "Grad-CAM placeholder / no heatmap generated",
            },
        )

    def analyze_image_bytes(self, content: bytes) -> dict[str, object]:
        """Extract observable image features for an assistive, non-diagnostic demo."""
        try:
            image = Image.open(io.BytesIO(content)).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError("La imagen no pudo ser interpretada como JPEG o PNG") from exc
        image.thumbnail((768, 768))
        pixels = np.asarray(image, dtype=np.float32)
        red, green, blue = pixels[..., 0], pixels[..., 1], pixels[..., 2]
        luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
        redness = float(np.mean(np.maximum(red - ((green + blue) / 2), 0)) / 255)
        dark_tissue_ratio = float(np.mean(luminance < 65))
        contrast = float(np.std(luminance) / 128)
        color_variation = float(np.mean(np.std(pixels, axis=(0, 1))) / 128)
        signal = min(1.0, 0.42 * redness + 0.32 * dark_tissue_ratio + 0.16 * contrast + 0.10 * color_variation)
        compatible = signal >= 0.16
        confidence = round(0.52 + min(signal, 0.43), 3)
        return {
            "possible_compatible_lesion": compatible,
            "approximation": "Hallazgos visuales compatibles; requiere confirmación clínica" if compatible else "Sin señal visual concluyente en esta aproximación",
            "confidence": confidence,
            "parameters_used": {
                "redness_index": round(redness, 3),
                "dark_tissue_ratio": round(dark_tissue_ratio, 3),
                "contrast_index": round(contrast, 3),
                "color_variation": round(color_variation, 3),
                "image_width": image.width,
                "image_height": image.height,
            },
            "suggestion_to_clinician": (
                "Revisar presencialmente integridad cutánea, temperatura, perfusión, infección, sensibilidad y profundidad de lesión."
            ),
            "disclaimer": "Aproximación visual no validada: no confirma ni descarta pie diabético y no constituye diagnóstico.",
        }


settings = get_settings()
model = DiabeticFootVisionWrapper(settings.model_path)
app = FastAPI(title="HealthOS - Pie Diabético IA", version="0.1.0")
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LocalRateLimitMiddleware, requests_per_minute=60)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "foot-vision", "mode": model.mode}


@app.post("/api/diabetic_foot/classify", response_model=FootClassifyResponse)
def classify(
    request: FootClassifyRequest,
    _user: Annotated[
        CurrentUser,
        Depends(require_roles(Role.JEFATURA_DM2, Role.MEDICO, Role.ENFERMERIA)),
    ],
) -> FootClassifyResponse:
    try:
        return model.classify_url(request.synthetic_image_url)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
