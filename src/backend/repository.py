from __future__ import annotations

import csv
from datetime import date
from functools import lru_cache
from pathlib import Path

from src.backend.config import get_settings
from src.backend.schemas import PatientRecord


class SyntheticPatientRepository:
    """Read-only repository. It never accepts arbitrary SQL or LLM-generated queries."""

    def __init__(self, dataset_path: Path | None = None):
        self.dataset_path = dataset_path or get_settings().dataset_path
        self._rows: list[dict[str, str]] | None = None

    def _load(self) -> list[dict[str, str]]:
        if self._rows is None:
            if not self.dataset_path.exists():
                raise FileNotFoundError(
                    f"Dataset no encontrado: {self.dataset_path}. Ejecute generate_synthetic_minsal_dataset.py"
                )
            with self.dataset_path.open("r", encoding="utf-8-sig", newline="") as source:
                self._rows = list(csv.DictReader(source))
        return list(self._rows)

    @staticmethod
    def _row_to_patient(row: dict[str, str]) -> PatientRecord:
        comorbidities = [item for item in str(row["Comorbilidades_Sinteticas"]).split("|") if item]
        return PatientRecord(
            rut_sintetico=row["RUT_Sintetico"],
            nombre_sintetico=row["Nombre_Sintetico"],
            edad=int(row["Edad"]),
            sexo_sintetico=row["Sexo_Sintetico"],
            fecha_inscripcion_lista=date.fromisoformat(row["Fecha_Inscripcion_Lista"]),
            synthetic_hba1c=float(row["Synthetic_HbA1c"]),
            comorbilidades_sinteticas=comorbidities,
            estrato_ecicep_sintetico=row["Estrato_ECICEP_Sintetico"],
            ultima_visita_hospital_sintetica=date.fromisoformat(row["Ultima_Visita_Hospital_Sintetica"]),
            institucion_id=row["Institucion_ID"],
            institucion_nombre=row["Institucion_Nombre"],
            region=row["Region"],
            ubicacion_sintetica_pie_diabetico_imageurl=row[
                "Ubicacion_Sintetica_PieDiabetico_ImageURL"
            ],
            riesgo_pie_diabetico_sintetico=float(row["Riesgo_Pie_Diabetico_Sintetico"]),
            wagner_sintetico=int(row["Wagner_Sintetico"]),
            riesgo_hipoglicemia_sintetico=float(row["Riesgo_Hipoglicemia_Sintetico"]),
            no_show_risk_sintetico=float(row["No_Show_Risk_Sintetico"]),
            route_sugerida=row["Ruta_Sugerida"],
        )

    def list_patients(self, institution_id: str | None = None) -> list[PatientRecord]:
        rows = self._load()
        if institution_id:
            rows = [row for row in rows if row["Institucion_ID"] == institution_id]
        return [self._row_to_patient(row) for row in rows]

    def get_patient(self, synthetic_id: str) -> PatientRecord | None:
        match = next((row for row in self._load() if row["RUT_Sintetico"] == synthetic_id), None)
        return self._row_to_patient(match) if match else None

    def count_by_institution(self, institution_id: str | None = None) -> int:
        return len(self.list_patients(institution_id))


@lru_cache(maxsize=1)
def get_repository() -> SyntheticPatientRepository:
    return SyntheticPatientRepository()
