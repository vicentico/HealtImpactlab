import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.engine.nt118 import calculate_nt118_score
from app.core.privacy import mask_rut, hash_rut

client = TestClient(app)

# ============================================================================
# SECTION 1: MANDATORY DISPATCH SCENARIO (hba1c=11.5, vfg=28, has_foot_ulcer=true)
# ============================================================================

def test_dispatch_mandatory_critico_scenario():
    """
    Mandatory test case: hba1c=11.5, vfg=28, has_foot_ulcer=true
    Must yield totalScore >= 90 and riskLevel == 'CRITICO'.
    """
    payload = {
        "hba1c": 11.5,
        "vfg": 28.0,
        "has_foot_ulcer": True,
        "systolic_bp": 120,
        "diastolic_bp": 80,
        "has_retinopathy": False,
        "days_in_waiting_list": 0,
        "age": 50,
        "gender": "M"
    }
    
    # Direct engine call
    res_engine = calculate_nt118_score(payload)
    assert res_engine["totalScore"] >= 90, f"Expected totalScore >= 90, got {res_engine['totalScore']}"
    assert res_engine["riskLevel"] == "CRITICO", f"Expected CRITICO, got {res_engine['riskLevel']}"
    
    # API endpoint call
    api_payload = {
        "hba1c": 11.5,
        "vfg": 28.0,
        "hasFootUlcer": True,
        "systolicBp": 120,
        "diastolicBp": 80,
        "hasRetinopathy": False,
        "daysInWaitingList": 0,
        "age": 50,
        "gender": "M"
    }
    response = client.post("/api/priorizacion/calcular", json=api_payload)
    assert response.status_code == 200
    res_api = response.json()
    assert res_api["totalScore"] >= 90
    assert res_api["riskLevel"] == "CRITICO"

# ============================================================================
# SECTION 2: ENGINE NT118 BOUNDARY & STRESS TESTS
# ============================================================================

def test_nt118_hba1c_boundaries():
    """Test HbA1c exact boundaries and subscores."""
    # > 11.0 -> 40 pts
    assert calculate_nt118_score({"hba1c": 11.1})["subscores"]["c1_hba1c_score"] == 40
    # = 11.0 -> 30 pts (since threshold is > 11.0)
    assert calculate_nt118_score({"hba1c": 11.0})["subscores"]["c1_hba1c_score"] == 30
    # = 10.0 -> 30 pts
    assert calculate_nt118_score({"hba1c": 10.0})["subscores"]["c1_hba1c_score"] == 30
    # = 9.99 -> 28 pts
    assert calculate_nt118_score({"hba1c": 9.99})["subscores"]["c1_hba1c_score"] == 28
    # = 9.0 -> 28 pts
    assert calculate_nt118_score({"hba1c": 9.0})["subscores"]["c1_hba1c_score"] == 28
    # = 8.99 -> 18 pts
    assert calculate_nt118_score({"hba1c": 8.99})["subscores"]["c1_hba1c_score"] == 18
    # = 8.0 -> 18 pts
    assert calculate_nt118_score({"hba1c": 8.0})["subscores"]["c1_hba1c_score"] == 18
    # = 7.99 -> 10 pts
    assert calculate_nt118_score({"hba1c": 7.99})["subscores"]["c1_hba1c_score"] == 10
    # = 7.0 -> 10 pts
    assert calculate_nt118_score({"hba1c": 7.0})["subscores"]["c1_hba1c_score"] == 10
    # < 7.0 -> 0 pts
    assert calculate_nt118_score({"hba1c": 6.99})["subscores"]["c1_hba1c_score"] == 0
    # Extreme high HbA1c
    assert calculate_nt118_score({"hba1c": 25.0})["subscores"]["c1_hba1c_score"] == 40

def test_nt118_vfg_boundaries():
    """Test VFG exact boundaries and subscores."""
    # < 30.0 -> 30 pts
    assert calculate_nt118_score({"vfg": 29.99})["subscores"]["c2_renals_score"] == 30
    # = 30.0 -> 25 pts (since threshold is <= 44.0)
    assert calculate_nt118_score({"vfg": 30.0})["subscores"]["c2_renals_score"] == 25
    # = 44.0 -> 25 pts
    assert calculate_nt118_score({"vfg": 44.0})["subscores"]["c2_renals_score"] == 25
    # = 44.01 -> 15 pts
    assert calculate_nt118_score({"vfg": 44.01})["subscores"]["c2_renals_score"] == 15
    # = 59.0 -> 15 pts
    assert calculate_nt118_score({"vfg": 59.0})["subscores"]["c2_renals_score"] == 15
    # = 59.01 -> 10 pts
    assert calculate_nt118_score({"vfg": 59.01})["subscores"]["c2_renals_score"] == 10
    # = 89.0 -> 10 pts
    assert calculate_nt118_score({"vfg": 89.0})["subscores"]["c2_renals_score"] == 10
    # > 89.0 -> 0 pts
    assert calculate_nt118_score({"vfg": 90.0})["subscores"]["c2_renals_score"] == 0

def test_nt118_c3_cap():
    """Test C3 subscore capping at 25 points."""
    # Foot ulcer (20) + Retinopathy (15) + HTA severa (10) = 45 raw -> max 25
    payload = {
        "has_foot_ulcer": True,
        "has_retinopathy": True,
        "systolic_bp": 170,
        "diastolic_bp": 105
    }
    result = calculate_nt118_score(payload)
    assert result["subscores"]["c3_cv_score"] == 25
    assert len(result["decompensations"]) == 3

def test_nt118_c5_days_in_waiting_list_boundaries():
    """Test C5 subscore boundaries."""
    assert calculate_nt118_score({"days_in_waiting_list": 181})["subscores"]["c5_days_score"] == 10
    assert calculate_nt118_score({"days_in_waiting_list": 180})["subscores"]["c5_days_score"] == 7
    assert calculate_nt118_score({"days_in_waiting_list": 121})["subscores"]["c5_days_score"] == 7
    assert calculate_nt118_score({"days_in_waiting_list": 120})["subscores"]["c5_days_score"] == 5
    assert calculate_nt118_score({"days_in_waiting_list": 91})["subscores"]["c5_days_score"] == 5
    assert calculate_nt118_score({"days_in_waiting_list": 90})["subscores"]["c5_days_score"] == 3
    assert calculate_nt118_score({"days_in_waiting_list": 46})["subscores"]["c5_days_score"] == 3
    assert calculate_nt118_score({"days_in_waiting_list": 45})["subscores"]["c5_days_score"] == 0

def test_nt118_total_score_cap_at_100():
    """Test total score is capped at 100 even if raw sum exceeds 100."""
    payload = {
        "hba1c": 12.0,            # C1 = 40
        "vfg": 20.0,              # C2 = 30
        "has_foot_ulcer": True,   # C3 = 20
        "has_retinopathy": True,  # C3 = +15 -> C3 capped at 25
        "systolic_bp": 170,       # C3 = +10
        "age": 70,                # C4 = 4
        "days_in_waiting_list": 200 # C5 = 10
    }
    # Raw sum = 40 + 30 + 25 + 4 + 10 = 109
    result = calculate_nt118_score(payload)
    assert result["totalScore"] == 100
    assert result["riskLevel"] == "CRITICO"

# ============================================================================
# SECTION 3: API ENDPOINT GET /api/pacientes SORTING & FILTERING
# ============================================================================

def test_get_pacientes_sorting_and_count():
    """Verify GET /api/pacientes returns >= 10 patients sorted by priorityPosition ascending."""
    res = client.get("/api/pacientes")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 10, f"Expected >= 10 patients, got {len(data)}"
    
    positions = [p.get("priorityPosition") or p.get("priority_position") for p in data]
    assert positions == sorted(positions), f"Patients are not sorted by priorityPosition: {positions}"
    assert positions[0] == 1, f"First patient priority position is {positions[0]}, expected 1"

def test_get_pacientes_filtering():
    """Test all single and combined filters on GET /api/pacientes."""
    # Filter by sector
    res_sector = client.get("/api/pacientes?sector=SECTOR_ROJO")
    assert res_sector.status_code == 200
    for p in res_sector.json():
        assert p["sector"] == "SECTOR_ROJO"

    # Filter by status
    res_status = client.get("/api/pacientes?status=PENDIENTE")
    assert res_status.status_code == 200
    for p in res_status.json():
        assert p["contraloriaStatus"] == "PENDIENTE"

    # Filter by risk level
    res_risk = client.get("/api/pacientes?risk_level=CRITICO")
    assert res_risk.status_code == 200
    for p in res_risk.json():
        assert p["nt118Risk"]["riskLevel"] == "CRITICO"

    # Filter by CESFAM
    res_cesfam = client.get("/api/pacientes?cesfam_name=CESFAM Carol Urzúa")
    assert res_cesfam.status_code == 200
    for p in res_cesfam.json():
        assert p["cesfamName"] == "CESFAM Carol Urzúa"

    # Non-matching filter returns empty array
    res_empty = client.get("/api/pacientes?sector=NON_EXISTENT_SECTOR")
    assert res_empty.status_code == 200
    assert res_empty.json() == []

# ============================================================================
# SECTION 4: CONTRALORÍA STATUS UPDATE ADVERSARIAL CASES
# ============================================================================

def test_patch_contraloria_valid_statuses_full_set():
    """Verify all 6 valid Contraloría status strings work correctly."""
    valid_statuses = ["PENDIENTE", "APROBADO", "RECHAZADO", "DERIVADO", "REQUIERE_REVISION", "OBSERVADO"]
    for s in valid_statuses:
        payload = {
            "newStatus": s,
            "clinicalNote": f"Evaluación de estado {s}",
            "physicianName": "Dr. Test Contralor",
            "physicianRole": "Médico Contralor"
        }
        res = client.patch("/api/pacientes/PAT-001/contraloria", json=payload)
        assert res.status_code == 200, f"Failed for valid status {s}"
        data = res.json()
        assert data["contraloriaStatus"] == s

def test_patch_contraloria_invalid_status_rejects_422():
    """Verify invalid status values return 422 Unprocessable Entity."""
    invalid_statuses = ["INVALID", "APPROVED", "REJECTED", "approved", "123", ""]
    for inv in invalid_statuses:
        payload = {
            "newStatus": inv,
            "clinicalNote": "Test note",
            "physicianName": "Dr. Test",
            "physicianRole": "Contralor"
        }
        res = client.patch("/api/pacientes/PAT-001/contraloria", json=payload)
        assert res.status_code == 422, f"Expected 422 for invalid status '{inv}', got {res.status_code}"

def test_patch_contraloria_missing_fields_rejects_422():
    """Verify missing required fields in Contraloría payload return 422."""
    incomplete_payloads = [
        {"newStatus": "APROBADO"}, # missing clinicalNote, physicianName, physicianRole
        {"newStatus": "APROBADO", "clinicalNote": "Note"}, # missing physicianName, physicianRole
        {"newStatus": "APROBADO", "physicianName": "Dr. Test", "physicianRole": "Role"}, # missing clinicalNote
    ]
    for inc in incomplete_payloads:
        res = client.patch("/api/pacientes/PAT-001/contraloria", json=inc)
        assert res.status_code == 422

def test_patch_contraloria_nonexistent_patient_returns_404():
    """Verify updating a non-existent patient returns 404 Not Found."""
    payload = {
        "newStatus": "APROBADO",
        "clinicalNote": "Test note",
        "physicianName": "Dr. Test",
        "physicianRole": "Contralor"
    }
    res = client.patch("/api/pacientes/PAT-99999/contraloria", json=payload)
    assert res.status_code == 404

# ============================================================================
# SECTION 5: PRIVACY & RUT MASKING / HASHING
# ============================================================================

def test_rut_masking_edge_cases():
    """Test RUT masking edge cases and invalid formats."""
    assert mask_rut("12.458.930-K") == "12.458.***-K"
    assert mask_rut("9.310.224-8") == "9.310.***-8"
    assert mask_rut("12458930K") == "12.458.***-K"
    assert mask_rut("") == ""
    assert mask_rut(None) == ""
    # Idempotent
    assert mask_rut("12.458.***-K") == "12.458.***-K"

def test_rut_hashing_sha256():
    """Test SHA-256 salted RUT hashing."""
    h1 = hash_rut("12.458.930-K")
    h2 = hash_rut("12458930K")
    assert len(h1) == 64
    assert h1 == h2, "Hash must be identical regardless of formatting dots/dashes"
    assert hash_rut("") == ""
    assert hash_rut(None) == ""

def test_all_api_patient_ruts_are_masked():
    """Verify that no unmasked RUT is ever served in API responses."""
    res = client.get("/api/pacientes")
    assert res.status_code == 200
    for patient in res.json():
        assert "***" in patient["rut"], f"RUT not masked in patient {patient['id']}: {patient['rut']}"
        assert patient["rut_hash"] or patient["rutHash"], f"Missing rut_hash in patient {patient['id']}"
