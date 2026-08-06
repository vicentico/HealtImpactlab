import sys
import os
import json
import pytest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.core.privacy import hash_rut, mask_rut
from app.data.mock_db import get_all_patients, get_patient_by_id, load_mock_db, format_patient_response
from app.api.endpoints.pacientes import update_contraloria_status, VALID_STATUSES
from app.schemas.patient import ContraloriaUpdatePayload
from fastapi.testclient import TestClient
from app.main import app

def run_empirical_verifications():
    print("=== EMPIRICAL VERIFICATION HARNESS ===")
    results = {}

    # 1. PII Hashing & Masking
    print("\n--- 1. Testing PII Hashing & Masking ---")
    rut_raw = "12.458.930-K"
    rut_unformatted = "12458930K"
    h1 = hash_rut(rut_raw)
    h2 = hash_rut(rut_unformatted)

    results["sha256_len_64"] = (len(h1) == 64)
    results["sha256_hex_valid"] = all(c in "0123456789abcdef" for c in h1)
    results["sha256_normalization"] = (h1 == h2)
    results["empty_rut_hash"] = (hash_rut("") == "" and hash_rut(None) == "")
    results["no_plain_rut_in_hash"] = (rut_raw not in h1 and "12458930" not in h1)

    m1 = mask_rut(rut_raw)
    m2 = mask_rut(rut_unformatted)
    results["mask_rut_formatted"] = (m1 == "12.458.***-K")
    results["mask_rut_unformatted"] = (m2 == "12.458.***-K")

    print(f"SHA-256 Length 64: {results['sha256_len_64']} ({h1})")
    print(f"HEX chars only: {results['sha256_hex_valid']}")
    print(f"Normalization (12.458.930-K vs 12458930K): {results['sha256_normalization']}")
    print(f"Empty/None RUT hash: {results['empty_rut_hash']}")
    print(f"No plain RUT in hash: {results['no_plain_rut_in_hash']}")
    print(f"Mask RUT formatted: {results['mask_rut_formatted']}")
    print(f"Mask RUT unformatted: {results['mask_rut_unformatted']}")

    # 2. Patient Dataset Sorting
    print("\n--- 2. Testing Patient Dataset Sorting ---")
    patients = get_all_patients()
    results["patient_count_gte_10"] = (len(patients) >= 10)
    positions = [p.get("priorityPosition") or p.get("priority_position") for p in patients]
    is_sorted = (positions == sorted(positions))
    results["sorted_by_priority_position"] = is_sorted

    print(f"Patient count: {len(patients)} (>=10: {results['patient_count_gte_10']})")
    print(f"Priority positions: {positions}")
    print(f"Sorted ascending: {is_sorted}")

    # Check for RUT leaks in get_all_patients
    rut_leaks = 0
    for p in patients:
        rut_val = p.get("rut", "")
        if "***" not in rut_val or len(p.get("rut_hash", "")) != 64:
            rut_leaks += 1
    results["zero_rut_leaks_in_dataset"] = (rut_leaks == 0)
    print(f"Zero plain RUT leaks in patient dataset: {results['zero_rut_leaks_in_dataset']}")

    # 3. Audit Log Appending in pacientes.py
    print("\n--- 3. Testing Audit Log Appending ---")
    client = TestClient(app)

    # Fetch initial PAT-001 audit history length
    res1 = client.get("/api/pacientes")
    pat001 = [p for p in res1.json() if p["id"] == "PAT-001"][0]
    initial_audit_len = len(pat001.get("auditHistory", []))

    # Send Contraloría PATCH update
    patch_payload = {
        "newStatus": "APROBADO",
        "clinicalNote": "Aprobación verificada por Challenger 2",
        "physicianName": "Dr. Verificador",
        "physicianRole": "Auditor Clínico"
    }
    res_patch = client.patch("/api/pacientes/PAT-001/contraloria", json=patch_payload)
    patch_ok = (res_patch.status_code == 200)
    updated_pat = res_patch.json()

    audit_history = updated_pat.get("auditHistory") or updated_pat.get("audit_history") or []
    new_audit_len = len(audit_history)
    audit_appended = (new_audit_len == initial_audit_len + 1)

    newest_entry = audit_history[-1] if audit_history else {}
    audit_fields_valid = (
        newest_entry.get("newStatus") == "APROBADO" and
        newest_entry.get("clinicalNote") == "Aprobación verificada por Challenger 2" and
        newest_entry.get("userName") == "Dr. Verificador" and
        newest_entry.get("userRole") == "Auditor Clínico" and
        newest_entry.get("action") == "STATUS_OVERRIDE" and
        "timestamp" in newest_entry and
        newest_entry.get("id", "").startswith("AUD-")
    )

    results["patch_contraloria_200"] = patch_ok
    results["audit_log_appended"] = audit_appended
    results["audit_entry_fields_valid"] = audit_fields_valid

    print(f"PATCH /api/pacientes/PAT-001/contraloria 200: {patch_ok}")
    print(f"Audit log appended (initial {initial_audit_len} -> new {new_audit_len}): {audit_appended}")
    print(f"Newest audit entry fields valid: {audit_fields_valid}")

    # 4. Pytest Suite Execution
    print("\n--- 4. Running Pytest Suite ---")
    pytest_exit_code = pytest.main(["backend/tests", "-v"])
    results["pytest_passed_100_percent"] = (pytest_exit_code == 0)
    print(f"Pytest Exit Code: {pytest_exit_code} (0 = PASS)")

    # Summary
    all_passed = all(results.values())
    print("\n=== VERIFICATION SUMMARY ===")
    for k, v in results.items():
        print(f" - {k}: {'PASS' if v else 'FAIL'}")

    print(f"\nFINAL EMPIRICAL VERDICT: {'APPROVE' if all_passed else 'REJECT'}")

    # Write summary to JSON file
    with open(".agents/challenger_backend_2/verification_results.json", "w") as f:
        json.dump({"results": results, "verdict": "APPROVE" if all_passed else "REJECT"}, f, indent=2)

    return all_passed

if __name__ == "__main__":
    success = run_empirical_verifications()
    sys.exit(0 if success else 1)
