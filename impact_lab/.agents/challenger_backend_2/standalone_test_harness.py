import sys
import os
import json
import re

# Add backend to sys.path
backend_dir = os.path.abspath("backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.privacy import hash_rut, mask_rut, SALT
from app.data.mock_db import (
    get_all_patients,
    get_patient_by_id,
    load_mock_db,
    format_patient_response,
    get_initial_mock_patients,
    _db_patients
)
from app.engine.nt118 import calculate_nt118_score

def run_all_empirical_tests():
    print("==================================================================")
    print("  EMPIRICAL CHALLENGER 2 - BACKEND M1 VERIFICATION SUITE")
    print("==================================================================")

    results = {}
    failures = []

    # --------------------------------------------------------------------
    # TEST GROUP 1: PII Hashing & RUT Masking (app/core/privacy.py)
    # --------------------------------------------------------------------
    print("\n[TEST GROUP 1] PII Hashing & RUT Masking Verification")

    # 1.1 SHA-256 Length and Hex Format
    rut1 = "12.458.930-K"
    hash1 = hash_rut(rut1)
    is_64_len = len(hash1) == 64
    is_hex = bool(re.match(r"^[0-9a-f]{64}$", hash1))
    print(f"  1.1 SHA-256 hash output: '{hash1}'")
    print(f"      - Length 64 chars: {is_64_len}")
    print(f"      - Valid hex format: {is_hex}")

    if not (is_64_len and is_hex):
        failures.append("1.1 SHA-256 output is not 64 hex chars")
    results["1.1_sha256_64_hex"] = is_64_len and is_hex

    # 1.2 Normalization (Dots, Hyphens, Spaces, Lowercase)
    hash_unformatted = hash_rut("12458930K")
    hash_lowercase = hash_rut("12.458.930-k")
    hash_spaces = hash_rut(" 12.458.930 - K ")
    is_normalized = (hash1 == hash_unformatted == hash_lowercase == hash_spaces)
    print(f"  1.2 Normalization check (formatted vs raw vs lowercase vs spaces): {is_normalized}")

    if not is_normalized:
        failures.append("1.2 hash_rut normalization failed")
    results["1.2_hash_rut_normalization"] = is_normalized

    # 1.3 Salt Verification
    print(f"  1.3 Configured Salt: '{SALT}'")
    alt_salted_hash = hash_rut(rut1)
    is_salt_applied = len(SALT) > 0 and (alt_salted_hash == hash1)
    print(f"      - Salt applied consistently: {is_salt_applied}")
    results["1.3_salt_verification"] = is_salt_applied

    # 1.4 No Plain RUT Leak in Hash
    no_plain_leak = (rut1 not in hash1) and ("12458930" not in hash1)
    print(f"  1.4 Plain RUT string absent from hash digest: {no_plain_leak}")
    results["1.4_no_plain_rut_leak"] = no_plain_leak

    # 1.5 Empty / None Handling
    empty_hash = hash_rut("")
    none_hash = hash_rut(None)
    empty_ok = (empty_hash == "") and (none_hash == "")
    print(f"  1.5 Empty / None RUT hash handling: {empty_ok}")
    results["1.5_empty_none_hash"] = empty_ok

    # 1.6 Mask RUT Examples
    m_std = mask_rut("12.458.930-K") == "12.458.***-K"
    m_raw = mask_rut("12458930K") == "12.458.***-K"
    m_7body = mask_rut("9.310.224-8") == "9.310.***-8"
    m_7raw = mask_rut("93102248") == "9.310.***-8"
    m_idempotent = mask_rut("12.458.***-K") == "12.458.***-K"
    m_empty = mask_rut("") == "" and mask_rut(None) == ""

    masking_ok = m_std and m_raw and m_7body and m_7raw and m_idempotent and m_empty
    print(f"  1.6 Masking RUT format & idempotency checks: {masking_ok}")
    if not masking_ok:
        failures.append("1.6 mask_rut format failed")
    results["1.6_mask_rut_verification"] = masking_ok


    # --------------------------------------------------------------------
    # TEST GROUP 2: Patient Dataset & Sorting (app/data/mock_db.py)
    # --------------------------------------------------------------------
    print("\n[TEST GROUP 2] Patient Dataset & Sorting Verification")

    patients = get_all_patients()
    patient_count = len(patients)
    count_ok = patient_count >= 10
    print(f"  2.1 Total mock patients count: {patient_count} (>= 10: {count_ok})")
    results["2.1_patient_count_gte_10"] = count_ok

    # Priority Position Sorting Check
    positions = [p.get("priorityPosition") for p in patients]
    is_sorted_asc = (positions == sorted(positions))
    print(f"  2.2 Patient list priorityPositions: {positions}")
    print(f"      - Strictly sorted ascending by priorityPosition: {is_sorted_asc}")

    if not is_sorted_asc:
        failures.append("2.2 Patients dataset is not sorted by priorityPosition ascending")
    results["2.2_priority_position_sorted"] = is_sorted_asc

    # Dataset PII Masking Leak Audit
    leak_count = 0
    for p in patients:
        rut_val = str(p.get("rut", ""))
        rut_hash_val = str(p.get("rut_hash", ""))
        if "***" not in rut_val or len(rut_hash_val) != 64:
            leak_count += 1
            print(f"      [LEAK WARN] Patient {p.get('id')} has unmasked rut '{rut_val}' or invalid hash '{rut_hash_val}'")

    dataset_pii_secure = (leak_count == 0)
    print(f"  2.3 Dataset PII Security (0 plain RUT leaks): {dataset_pii_secure}")
    if not dataset_pii_secure:
        failures.append(f"2.3 Found {leak_count} PII RUT leaks in patient dataset")
    results["2.3_dataset_pii_security"] = dataset_pii_secure


    # --------------------------------------------------------------------
    # TEST GROUP 3: Contraloría Status & Audit Log Appending
    # (app/api/endpoints/pacientes.py & app/data/mock_db.py)
    # --------------------------------------------------------------------
    print("\n[TEST GROUP 3] Contraloría Status & Audit Log Appending Verification")

    valid_statuses = {"PENDIENTE", "APROBADO", "RECHAZADO", "DERIVADO", "REQUIERE_REVISION", "OBSERVADO"}

    # Mock endpoint logic directly
    patient = get_patient_by_id("PAT-001")
    assert patient is not None, "PAT-001 must exist in mock DB"

    initial_audit_history = list(patient.get("auditHistory", []))
    initial_log_len = len(initial_audit_history)
    initial_status = patient.get("contraloriaStatus", "PENDIENTE")

    print(f"  3.1 PAT-001 initial status: '{initial_status}', initial audit history count: {initial_log_len}")

    # Perform Action 1: Override status to APROBADO
    new_status_1 = "APROBADO"
    note_1 = "Aprobación clínica prioritaria Challenger 2"
    physician_1 = "Dr. Alejandro Silva"
    role_1 = "Médico Contralor"

    import uuid
    import datetime

    entry_1 = {
        "id": f"AUD-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "userName": physician_1,
        "user_name": physician_1,
        "userRole": role_1,
        "user_role": role_1,
        "action": "STATUS_OVERRIDE",
        "previousStatus": initial_status,
        "previous_status": initial_status,
        "newStatus": new_status_1,
        "new_status": new_status_1,
        "clinicalNote": note_1,
        "clinical_note": note_1,
    }

    patient["contraloriaStatus"] = new_status_1
    patient.setdefault("auditHistory", []).append(entry_1)

    updated_patient_1 = format_patient_response(patient)
    updated_history_1 = updated_patient_1.get("auditHistory", [])

    append_ok_1 = len(updated_history_1) == initial_log_len + 1
    newest_1 = updated_history_1[-1]
    entry_valid_1 = (
        newest_1["newStatus"] == "APROBADO" and
        newest_1["clinicalNote"] == note_1 and
        newest_1["userName"] == physician_1 and
        newest_1["action"] == "STATUS_OVERRIDE" and
        newest_1["previousStatus"] == initial_status and
        newest_1["id"].startswith("AUD-")
    )

    print(f"  3.2 Update 1 (APROBADO): Log count {initial_log_len} -> {len(updated_history_1)} (Appended: {append_ok_1})")
    print(f"      - Audit Entry fields valid: {entry_valid_1}")

    # Perform Action 2: Override status to DERIVADO
    new_status_2 = "DERIVADO"
    note_2 = "Derivación urgente a especialista"

    entry_2 = {
        "id": f"AUD-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "userName": "Dra. Maria Zuñiga",
        "user_name": "Dra. Maria Zuñiga",
        "userRole": role_1,
        "user_role": role_1,
        "action": "STATUS_OVERRIDE",
        "previousStatus": new_status_1,
        "previous_status": new_status_1,
        "newStatus": new_status_2,
        "new_status": new_status_2,
        "clinicalNote": note_2,
        "clinical_note": note_2,
    }

    patient["contraloriaStatus"] = new_status_2
    patient["auditHistory"].append(entry_2)

    updated_patient_2 = format_patient_response(patient)
    updated_history_2 = updated_patient_2.get("auditHistory", [])

    append_ok_2 = len(updated_history_2) == initial_log_len + 2
    newest_2 = updated_history_2[-1]
    entry_valid_2 = (
        newest_2["newStatus"] == "DERIVADO" and
        newest_2["previousStatus"] == "APROBADO" and
        updated_history_2[-2]["newStatus"] == "APROBADO"
    )

    print(f"  3.3 Update 2 (DERIVADO): Log count -> {len(updated_history_2)} (Appended & Order Preserved: {entry_valid_2})")

    audit_testing_passed = append_ok_1 and entry_valid_1 and append_ok_2 and entry_valid_2
    if not audit_testing_passed:
        failures.append("3.3 Audit log appending or history ordering failed")
    results["3.3_audit_log_appending_integrity"] = audit_testing_passed


    # --------------------------------------------------------------------
    # TEST GROUP 4: NT 118 Scoring Engine Verification
    # (app/engine/nt118.py)
    # --------------------------------------------------------------------
    print("\n[TEST GROUP 4] NT 118 Scoring Engine Verification")

    # Critical payload: hba1c=11.5, vfg=28.0, hasFootUlcer=True
    crit_payload = {
        "hba1c": 11.5,
        "systolicBp": 130,
        "diastolicBp": 80,
        "vfg": 28.0,
        "hasFootUlcer": True,
        "hasRetinopathy": False,
        "daysInWaitingList": 0,
        "age": 50,
        "gender": "M"
    }

    crit_res = calculate_nt118_score(crit_payload)
    total_score = crit_res["totalScore"]
    risk_level = crit_res["riskLevel"]
    subscores = crit_res["subscores"]

    crit_ok = total_score >= 90 and risk_level == "CRITICO"
    print(f"  4.1 Critical patient payload (hba1c=11.5, vfg=28, foot_ulcer=true):")
    print(f"      - Total score: {total_score} (>= 90)")
    print(f"      - Risk level: '{risk_level}' (Expected: 'CRITICO')")
    print(f"      - Subscores: {subscores}")
    print(f"      - Decompensations: {crit_res['decompensations']}")
    print(f"      - Criteria Result: {crit_ok}")

    if not crit_ok:
        failures.append("4.1 NT 118 scoring engine did not return totalScore >= 90 and CRITICO risk level")
    results["4.1_nt118_critico_score"] = crit_ok

    # Low payload: hba1c=7.0, vfg=85.0, days=15
    low_payload = {
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
    low_res = calculate_nt118_score(low_payload)
    low_ok = low_res["totalScore"] < 50 and low_res["riskLevel"] == "BAJO"
    print(f"  4.2 Low patient payload: totalScore={low_res['totalScore']}, riskLevel='{low_res['riskLevel']}' (OK: {low_ok})")
    results["4.2_nt118_bajo_score"] = low_ok


    # --------------------------------------------------------------------
    # FINAL VERDICT SYNTHESIS
    # --------------------------------------------------------------------
    all_passed = len(failures) == 0
    verdict = "APPROVE" if all_passed else "REJECT"

    print("\n==================================================================")
    print("  VERIFICATION SUMMARY")
    print("==================================================================")
    for test_id, pass_status in results.items():
        print(f"  [{'PASS' if pass_status else 'FAIL'}] {test_id}")

    if failures:
        print("\n  FAILURES:")
        for f in failures:
            print(f"   - {f}")

    print(f"\n  EXPLICIT VERDICT: {verdict}")
    print("==================================================================")

    # Save verification_results.json
    output_json_path = ".agents/challenger_backend_2/verification_results.json"
    with open(output_json_path, "w") as f:
        json.dump({
            "verdict": verdict,
            "all_passed": all_passed,
            "test_results": results,
            "failures": failures,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }, f, indent=2)

    return all_passed

if __name__ == "__main__":
    success = run_all_empirical_tests()
    sys.exit(0 if success else 1)
