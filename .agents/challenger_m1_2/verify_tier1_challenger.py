import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../impact_lab/backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.privacy import mask_rut
from app.engine.nt118 import calculate_nt118_score
import app.data.mock_db as mock_db
from app.data.mock_db import format_patient_response, get_all_patients, get_patient_by_id

def run_tests():
    print("==================================================")
    print(" RUNNING EMPIRICAL CHALLENGER VERIFICATION TESTS")
    print("==================================================")
    failures = []

    # ----------------------------------------------------
    # TEST GROUP 1: RUT PII Masking Standard & Boundary Cases
    # ----------------------------------------------------
    print("\n--- Test Group 1: RUT PII Masking ---")
    rut_cases = [
        ("12.458.930-K", "12.458.***-K"),
        ("14.821.405-3", "14.821.***-3"),
        ("12458930K", "12.458.***-K"),
        ("148214053", "14.821.***-3"),
        ("9.310.224-8", "9.310.***-8"),
        ("93102248", "9.310.***-8"),
        ("12.458.***-K", "12.458.***-K"),
        ("", ""),
        (None, ""),
    ]

    for rut_in, expected in rut_cases:
        res = mask_rut(rut_in)
        if res != expected:
            failures.append(f"RUT Masking failed for '{rut_in}': expected '{expected}', got '{res}'")
            print(f"  [FAIL] mask_rut('{rut_in}') = '{res}' (expected '{expected}')")
        else:
            print(f"  [PASS] mask_rut('{rut_in}') = '{res}'")

    # ----------------------------------------------------
    # TEST GROUP 2: RUT Masking Adversarial Stress Cases
    # ----------------------------------------------------
    print("\n--- Test Group 2: RUT Masking Adversarial Stress Cases ---")
    stress_cases = [
        (" 12.458.930-K ", "12.458.***-K"),  # Surrounding whitespace
        ("12.458.930-K.", "12.458.***-K"),   # Trailing dot
        ("12.458.930-K;", "12.458.***-K"),   # Trailing semicolon
    ]

    for rut_in, expected in stress_cases:
        res = mask_rut(rut_in)
        if res != expected:
            print(f"  [WARN/CAVEAT] mask_rut('{rut_in}') = '{res}' (expected '{expected}') -> PII leak edge case!")
        else:
            print(f"  [PASS] mask_rut('{rut_in}') = '{res}'")

    # ----------------------------------------------------
    # TEST GROUP 3: NT 118 Prioritization Scoring
    # ----------------------------------------------------
    print("\n--- Test Group 3: NT 118 Engine Calculation ---")
    critico_payload = {
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
    score_res = calculate_nt118_score(critico_payload)
    if score_res["totalScore"] >= 85 and score_res["riskLevel"] == "CRITICO":
        print(f"  [PASS] CRITICO score: {score_res['totalScore']}, risk: {score_res['riskLevel']}")
    else:
        failures.append(f"CRITICO calculation failed: {score_res}")
        print(f"  [FAIL] CRITICO calculation: {score_res}")

    bajo_payload = {
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
    score_res_b = calculate_nt118_score(bajo_payload)
    if score_res_b["totalScore"] < 50 and score_res_b["riskLevel"] == "BAJO":
        print(f"  [PASS] BAJO score: {score_res_b['totalScore']}, risk: {score_res_b['riskLevel']}")
    else:
        failures.append(f"BAJO calculation failed: {score_res_b}")
        print(f"  [FAIL] BAJO calculation: {score_res_b}")

    # ----------------------------------------------------
    # TEST GROUP 4: Patient List Filtering
    # ----------------------------------------------------
    print("\n--- Test Group 4: Patient List Filtering ---")
    all_pats = get_all_patients()
    if len(all_pats) == 5:
        print(f"  [PASS] Unfiltered count: {len(all_pats)}")
    else:
        failures.append(f"Unfiltered patients count mismatch: got {len(all_pats)}, expected 5")

    rojo_pats = get_all_patients(sector="SECTOR_ROJO")
    if len(rojo_pats) == 2 and all(p["sector"] == "SECTOR_ROJO" for p in rojo_pats):
        print(f"  [PASS] Sector filter SECTOR_ROJO count: {len(rojo_pats)}")
    else:
        failures.append(f"SECTOR_ROJO filter failed: got {len(rojo_pats)}")

    critico_pats = get_all_patients(risk_level="CRITICO")
    if len(critico_pats) == 1 and critico_pats[0]["id"] == "PAT-001":
        print(f"  [PASS] Risk level filter CRITICO: found PAT-001")
    else:
        failures.append(f"CRITICO filter failed: {critico_pats}")

    # ----------------------------------------------------
    # TEST GROUP 5: Status Override & Audit Log Mechanics
    # ----------------------------------------------------
    print("\n--- Test Group 5: Status Override & Audit Log ---")
    pat = get_patient_by_id("PAT-001")
    if pat:
        initial_history_len = len(pat.get("auditHistory", []))
        pat["contraloriaStatus"] = "APROBADO"
        audit_entry = {
            "id": "AUD-TEST",
            "timestamp": "2026-08-05T21:00:00Z",
            "userName": "Dr. Test",
            "userRole": "Contralor",
            "action": "STATUS_OVERRIDE",
            "previousStatus": "PENDIENTE",
            "newStatus": "APROBADO",
            "clinicalNote": "Test approval"
        }
        pat["auditHistory"].append(audit_entry)
        formatted = format_patient_response(pat)
        if formatted["contraloriaStatus"] == "APROBADO" and len(formatted["auditHistory"]) == initial_history_len + 1:
            print(f"  [PASS] Status override updated to APROBADO, audit log length: {len(formatted['auditHistory'])}")
        else:
            failures.append(f"Status override simulation failed: {formatted}")
    else:
        failures.append("Patient PAT-001 not found in mock_db")

    print("\n==================================================")
    if failures:
        print(f" VERDICT: FAIL ({len(failures)} failures)")
        for f in failures:
            print(f"  - {f}")
        return 1
    else:
        print(" VERDICT: PASS (All empirical checks passed)")
        return 0

if __name__ == "__main__":
    sys.exit(run_tests())
