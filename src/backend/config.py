from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="HEALTHOS_",
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    env: str = "development"
    jwt_secret: str = "development-only-change-me-32-characters"
    dataset_path: Path = Path("src/data/output/patients_dm2_synthetic.csv")
    allowed_origins: str = "http://localhost:5173"
    log_level: str = "INFO"
    local_llm_url: str = "http://127.0.0.1:8080"
    local_llm_enabled: bool = False
    rayen_bridge_enabled: bool = False
    rayen_bridge_url: str = "http://127.0.0.1:8090"
    public_source_allowlist: str = "minsal.cl,interoperabilidad.minsal.cl,deis.minsal.cl"
    model_path: str = ""
    demo_chief_username: str = "jefe.clinico"
    demo_chief_password: str = "HealthOS2026!Jefe"
    demo_doctor_username: str = "medico.demo"
    demo_doctor_password: str = "HealthOS2026!Medico"
    demo_nurse_username: str = "enfermera.demo"
    demo_nurse_password: str = "HealthOS2026!Enfermera"

    @property
    def allowed_origin_list(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

    @property
    def public_source_domain_list(self) -> list[str]:
        return [item.strip() for item in self.public_source_allowlist.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
