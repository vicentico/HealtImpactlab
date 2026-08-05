import pytest
from fastapi.testclient import TestClient
from app.core.privacy import mask_rut
from app.engine.nt118 import calculate_nt118_score


# ============================================================================
# FEATURE 1: BACKEND API HEALTH & SCAFFOLDING (5 tests)
# ============================================================================

@pytest.mark.tier1
def test_health_check_returns_200_ok(client: TestClient):
    """1.1 GET /health returns 200 OK and status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.tier1
def test_openapi_swagger_docs_returns_200(client: TestClient):
    """1.2 GET /docs returns 200 OK with HTML Swagger UI."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger" in response.text.lower() or "html" in response.text.lower()


@pytest.mark.tier1
def test_openapi_redoc_returns_200(client: TestClient):
    """1.3 GET /redoc returns 200 OK with HTML ReDoc UI."""
    response = client.get("/redoc")
    assert response.status_code == 200
    assert "redoc" in response.text.lower() or "html" in response.text.lower()


@pytest.mark.tier1
def test_openapi_json_schema_valid(client: TestClient):
    """1.4 GET /openapi.json returns 200 OK with valid OpenAPI schema title and version."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    json_data = response.json()
    assert "info" in json_data
    assert json_data["info"]["title"] == "HealthImpactLab Backend API"
    assert json_data["info"]["version"] == "1.0.0"


@pytest.mark.tier1
def test_cors_preflight_and_headers(client: TestClient):
    """1.5 OPTIONS /health with Origin header returns CORS allow origin header."""
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET"
    }
    response = client.options("/health", headers=headers)
    assert response.status_code in (200, 204)
    assert response.headers.get("access-control-allow-origin") in ("http://localhost:3000", "*")


# ============================================================================
# FEATURE 2: NT 118 CALCULATION ENGINE & POST ENDPOINT (5 tests)
# ============================================================================

@pytest.mark.tier1
def test_calculate_nt118_critico_score():
    """2.1 High clinical risk factors yield CRITICO risk level and total_score >= 85."""
    payload = {
        "hba1c": 11.4,
        "systolicBp": 165,
        "diastolicBp": 98,
        "vfg": 42.0,
        "hasFootUlcer": True,
        "hasRetinopathy": True,
        "daysInWaitingList": 142,
        "age": 67,
        "gender": "F"
    }
    result = calculate_nt118_score(payload)
    assert result["totalScore"] >= 85
    assert result["riskLevel"] == "CRITICO"
    assert len(result["decompensations"]) >= 2


@pytest.mark.tier1
def test_calculate_nt118_bajo_score():
    """2.2 Low clinical risk factors yield BAJO risk level and total_score < 50."""
    payload = {
        "hba1c": 7.0,
        "systolicBp": 120,
        "diastolicBp": 80,
        "vfg": 85.0,
        "hasFootUlcer": False,
        "hasRetinopathy": False,
        "daysInWaitingList": 15,
        "age": 45,
        "gender": "M"
    }
    result = calculate_nt118_score(payload)
    assert result["totalScore"] < 50
    assert result["riskLevel"] == "BAJO"
    assert len(result["decompensations"]) == 0


@pytest.mark.tier1
def test_post_calcular_endpoint_success_200(client: TestClient, sample_priorization_payload: dict):
    """2.3 POST /api/priorizacion/calcular with valid payload returns 200 OK and breakdown."""
    response = client.post("/api/priorizacion/calcular", json=sample_priorization_payload)
    assert response.status_code == 200
    data = response.json()
    assert "totalScore" in data or "total_score" in data
    assert "riskLevel" in data or "risk_level" in data
    assert "subscores" in data
    assert "decompensations" in data


@pytest.mark.tier1
def test_post_calcular_endpoint_validation_error_422(client: TestClient):
    """2.4 POST /api/priorizacion/calcular with missing mandatory field returns 422."""
    incomplete_payload = {
        "patientId": "PAT-001"
        # missing hba1c, systolicBp, diastolicBp, vfg
    }
    response = client.post("/api/priorizacion/calcular", json=incomplete_payload)
    assert response.status_code == 422


@pytest.mark.tier1
def test_nt118_subscore_sum_and_bounds():
    """2.5 Verify subscores sum equals total score and is bounded in [0, 100]."""
    payload = {
        "hba1c": 8.9,
        "systolicBp": 145,
        "diastolicBp": 88,
        "vfg": 35.0,
        "hasFootUlcer": False,
        "hasRetinopathy": False,
        "daysInWaitingList": 210,
        "age": 72,
        "gender": "M"
    }
    result = calculate_nt118_score(payload)
    sub = result["subscores"]
    c1 = sub.get("c1_hba1c_score", sub.get("c1Hba1cScore", 0))
    c2 = sub.get("c2_renals_score", sub.get("c2RenalsScore", 0))
    c3 = sub.get("c3_cv_score", sub.get("c3CvScore", 0))
    c4 = sub.get("c4_social_score", sub.get("c4SocialScore", 0))
    c5 = sub.get("c5_days_score", sub.get("c5DaysScore", 0))
    computed_sum = c1 + c2 + c3 + c4 + c5
    assert 0 <= result["totalScore"] <= 100
    assert result["totalScore"] == min(100, computed_sum)


# ============================================================================
# FEATURE 3: PATIENT LIST FILTERING (5 tests)
# ============================================================================

@pytest.mark.tier1
def test_get_pacientes_unfiltered_200(client: TestClient):
    """3.1 GET /api/pacientes returns 200 OK and list of 5 mock patients."""
    response = client.get("/api/pacientes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5


@pytest.mark.tier1
def test_get_pacientes_filter_by_sector(client: TestClient):
    """3.2 GET /api/pacientes?sector=SECTOR_ROJO returns only SECTOR_ROJO patients."""
    response = client.get("/api/pacientes?sector=SECTOR_ROJO")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    for p in data:
        assert p["sector"] == "SECTOR_ROJO"


@pytest.mark.tier1
def test_get_pacientes_filter_by_status(client: TestClient):
    """3.3 GET /api/pacientes?status=PENDIENTE returns only PENDIENTE patients."""
    response = client.get("/api/pacientes?status=PENDIENTE")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    for p in data:
        assert p.get("contraloriaStatus") == "PENDIENTE" or p.get("contraloria_status") == "PENDIENTE"


@pytest.mark.tier1
def test_get_pacientes_filter_by_risk_level(client: TestClient):
    """3.4 GET /api/pacientes?risk_level=CRITICO returns only CRITICO patients."""
    response = client.get("/api/pacientes?risk_level=CRITICO")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "PAT-001"


@pytest.mark.tier1
def test_get_pacientes_combined_filter_empty(client: TestClient):
    """3.5 GET /api/pacientes?sector=SECTOR_ROJO&status=APROBADO returns empty array []."""
    response = client.get("/api/pacientes?sector=SECTOR_ROJO&status=APROBADO")
    assert response.status_code == 200
    data = response.json()
    assert data == []


# ============================================================================
# FEATURE 4: CONTRALORÍA STATUS OVERRIDE & AUDIT LOG (5 tests)
# ============================================================================

@pytest.mark.tier1
def test_patch_contraloria_status_success_200(client: TestClient, sample_contraloria_payload: dict):
    """4.1 PATCH /api/pacientes/PAT-001/contraloria updates status to APROBADO."""
    response = client.patch("/api/pacientes/PAT-001/contraloria", json=sample_contraloria_payload)
    assert response.status_code == 200
    data = response.json()
    assert data.get("contraloriaStatus") == "APROBADO" or data.get("contraloria_status") == "APROBADO"


@pytest.mark.tier1
def test_patch_contraloria_audit_history_appended(client: TestClient):
    """4.2 Status update appends a new AuditLogEntry to patient's auditHistory."""
    initial_res = client.get("/api/pacientes")
    pat_001_initial = [p for p in initial_res.json() if p["id"] == "PAT-001"][0]
    initial_log_count = len(pat_001_initial.get("auditHistory") or pat_001_initial.get("audit_history") or [])

    payload = {
        "newStatus": "REQUIERE_REVISION",
        "clinicalNote": "Solicitud de exámenes de laboratorio",
        "physicianName": "Dra. Zúñiga",
        "physicianRole": "Médico Contralor"
    }
    response = client.patch("/api/pacientes/PAT-001/contraloria", json=payload)
    assert response.status_code == 200
    data = response.json()
    audit_history = data.get("auditHistory") or data.get("audit_history")
    assert len(audit_history) == initial_log_count + 1
    newest_entry = audit_history[-1]
    assert newest_entry.get("clinicalNote") == "Solicitud de exámenes de laboratorio" or newest_entry.get("clinical_note") == "Solicitud de exámenes de laboratorio"
    assert newest_entry.get("userName") == "Dra. Zúñiga" or newest_entry.get("user_name") == "Dra. Zúñiga"


@pytest.mark.tier1
def test_patch_contraloria_nonexistent_patient_404(client: TestClient, sample_contraloria_payload: dict):
    """4.3 PATCH /api/pacientes/PAT-999/contraloria returns 404 Not Found."""
    response = client.patch("/api/pacientes/PAT-999/contraloria", json=sample_contraloria_payload)
    assert response.status_code == 404


@pytest.mark.tier1
def test_patch_contraloria_invalid_status_422(client: TestClient):
    """4.4 PATCH /api/pacientes/PAT-001/contraloria with invalid status returns 422."""
    payload = {
        "newStatus": "INVALID_STATUS",
        "clinicalNote": "Test note",
        "physicianName": "Dr. Silva",
        "physicianRole": "Médico Contralor"
    }
    response = client.patch("/api/pacientes/PAT-001/contraloria", json=payload)
    assert response.status_code == 422


@pytest.mark.tier1
def test_patch_contraloria_sequential_updates_audit_integrity(client: TestClient):
    """4.5 Sequential status overrides preserve audit history order and integrity."""
    p1 = {
        "newStatus": "REQUIERE_REVISION",
        "clinicalNote": "Nota 1",
        "physicianName": "Dr. A",
        "physicianRole": "Contralor"
    }
    client.patch("/api/pacientes/PAT-004/contraloria", json=p1)

    p2 = {
        "newStatus": "APROBADO",
        "clinicalNote": "Nota 2",
        "physicianName": "Dr. B",
        "physicianRole": "Contralor"
    }
    res = client.patch("/api/pacientes/PAT-004/contraloria", json=p2)
    assert res.status_code == 200
    data = res.json()
    audit_history = data.get("auditHistory") or data.get("audit_history")
    assert len(audit_history) >= 2
    note1 = audit_history[-2].get("clinicalNote") or audit_history[-2].get("clinical_note")
    note2 = audit_history[-1].get("clinicalNote") or audit_history[-1].get("clinical_note")
    assert note1 == "Nota 1"
    assert note2 == "Nota 2"


# ============================================================================
# FEATURE 5: RUT PII MASKING & PRIVACY (5 tests)
# ============================================================================

@pytest.mark.tier1
def test_mask_rut_standard_formatted():
    """5.1 Standard formatted RUT (XX.XXX.XXX-X) is masked correctly."""
    assert mask_rut("12.458.930-K") == "12.458.***-K"
    assert mask_rut("14.821.405-3") == "14.821.***-3"


@pytest.mark.tier1
def test_mask_rut_unformatted_raw():
    """5.2 Raw unformatted RUT string is normalized and masked."""
    assert mask_rut("12458930K") == "12.458.***-K"
    assert mask_rut("148214053") == "14.821.***-3"


@pytest.mark.tier1
def test_mask_rut_short_body_7digits():
    """5.3 7-digit body RUT (X.XXX.XXX-X) is masked correctly."""
    assert mask_rut("9.310.224-8") == "9.310.***-8"
    assert mask_rut("93102248") == "9.310.***-8"


@pytest.mark.tier1
def test_mask_rut_idempotency_and_empty():
    """5.4 Already masked RUT is idempotent; empty or None returns empty string."""
    assert mask_rut("12.458.***-K") == "12.458.***-K"
    assert mask_rut("") == ""
    assert mask_rut(None) == ""


@pytest.mark.tier1
def test_api_patient_payloads_rut_always_masked(client: TestClient):
    """5.5 Verification that GET /api/pacientes payloads contain masked RUTs with ***."""
    response = client.get("/api/pacientes")
    assert response.status_code == 200
    data = response.json()
    for patient in data:
        assert "***" in patient["rut"]
        assert not patient["rut"].replace(".", "").replace("-", "").isdigit()
