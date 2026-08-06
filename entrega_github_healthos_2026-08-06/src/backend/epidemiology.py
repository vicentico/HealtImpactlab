from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class ComplicationEstimate:
    complication: str
    specialties: str
    consultation: int
    surgery: int

    def to_dict(self, dm2_total: int) -> dict[str, object]:
        total = self.consultation + self.surgery
        return {
            **asdict(self),
            "total": total,
            "percent_dm2": round(total / dm2_total * 100, 1),
            "percent_consultation": round(self.consultation / 270_000 * 100, 1),
            "percent_surgery": round(self.surgery / 30_000 * 100, 1),
        }


COMPLICATIONS = (
    ComplicationEstimate("Retinopatía diabética", "Oftalmología", 72_000, 9_000),
    ComplicationEstimate("Nefropatía diabética", "Nefrología · Urología", 42_000, 3_000),
    ComplicationEstimate("Enfermedad cardiovascular", "Cardiología · Cirugía cardíaca", 45_000, 4_500),
    ComplicationEstimate("Neuropatías diabéticas", "Neurología · Fisiatría", 36_000, 600),
    ComplicationEstimate("Enfermedad vascular periférica y pie", "Cirugía vascular · Traumatología", 24_000, 11_400),
    ComplicationEstimate("Descompensación metabólica", "Endocrinología · Diabetología", 30_000, 0),
    ComplicationEstimate("Infecciones y lesiones cutáneas", "Infectología · Dermatología", 12_000, 900),
    ComplicationEstimate("Osteoarticular, rehabilitación y otras", "Traumatología · Rehabilitación", 9_000, 600),
)


def national_dm2_waitlist_summary() -> dict[str, object]:
    """Return a transparent synthetic scenario, never claimed as observed patient data."""
    base_total = 2_500_000
    base_consultation = 2_175_000
    base_surgery = 325_000
    dm2_total = 300_000
    dm2_consultation = sum(item.consultation for item in COMPLICATIONS)
    dm2_surgery = sum(item.surgery for item in COMPLICATIONS)
    return {
        "classification": "SYNTHETIC_AGGREGATE_MODEL",
        "as_of": "2025-12-31",
        "base_waitlist": {
            "total_records": base_total,
            "consultation_records": base_consultation,
            "surgery_records": base_surgery,
            "consultation_percent": 87.0,
            "surgery_percent": 13.0,
        },
        "dm2_filtered_estimate": {
            "total_records": dm2_total,
            "percent_of_base": round(dm2_total / base_total * 100, 1),
            "consultation_records": dm2_consultation,
            "surgery_records": dm2_surgery,
            "consultation_percent": round(dm2_consultation / dm2_total * 100, 1),
            "surgery_percent": round(dm2_surgery / dm2_total * 100, 1),
        },
        "complications": [item.to_dict(dm2_total) for item in COMPLICATIONS],
        "methodology": (
            "Escenario sintético de 2,5 millones de registros. La división consulta/cirugía usa una "
            "proporción basal 87/13 coherente con reportes MINSAL 2025. El subconjunto DM2 (12%) y su "
            "distribución son supuestos epidemiológico-operacionales para demostración; no son conteos "
            "observados ni sustituyen validación con datos DEIS/MINSAL enlazados por diagnóstico."
        ),
        "sources": [
            {
                "label": "MINSAL Glosa 06, primer trimestre 2025",
                "url": "https://www.minsal.cl/wp-content/uploads/2025/11/Informe-Glosa-06-primer-trimestre-2025-y-glosa-25-1.pdf",
            },
            {
                "label": "MINSAL Glosa 06, cuarto trimestre 2025",
                "url": "https://www.minsal.cl/wp-content/uploads/2026/02/Glosa-06-LE-IV-trimestre.pdf",
            },
            {"label": "MINSAL GES Diabetes Mellitus tipo 2", "url": "https://auge.minsal.cl/problemasdesalud/index/7"},
            {"label": "MINSAL GES Retinopatía diabética", "url": "https://auge.minsal.cl/problemasdesalud/index/31"},
        ],
    }
