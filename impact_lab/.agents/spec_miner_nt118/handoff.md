# Handoff Report — Spec Miner (nt118)

**Agent**: Spec Miner (`spec_miner_nt118`)  
**Working Directory**: `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/.agents/spec_miner_nt118`  
**Parent Conversation ID**: `d59e830e-788d-444d-b23f-e5cbd10430d6`  
**Date**: 2026-08-05  

---

## 1. Observation

Direct observations from source files and test executions:

1. **ORIGINAL_REQUEST.md Requirements**:
   - Section R1 (`lines 33-35`): "PATCH /api/pacientes/{id}/contraloria — records a Contraloría medical action (APROBADO, RECHAZADO, DERIVADO, PENDIENTE) in an append-only audit log per patient."
   - Section R1 (`line 40`): "PII (RUT) must be hashed (SHA-256 + salt) before any persistence or logging."
   - Section R2 (`line 52-53`): "The PatientDetailPanel must show: NT 118 score breakdown (all 5 subscores)"
   - Section R2 (`line 57-58`): "The KPICards component must show: total patients, critical count, pending contraloría count, and average NT 118 score"
   - Acceptance Criteria (`line 84`): "GET /api/pacientes returns >= 10 mock patients sorted by priorityPosition ascending."

2. **Contraloría Status Set Mismatch**:
   - `backend/app/api/endpoints/pacientes.py:10`: `VALID_STATUSES = {"PENDIENTE", "APROBADO", "REQUIERE_REVISION", "OBSERVADO"}`
   - `backend/app/schemas/patient.py:16`: `new_status: str  # "PENDIENTE" | "APROBADO" | "REQUIERE_REVISION" | "OBSERVADO"`
   - `src/types/patient.ts:3-7`: `export type ContraloriaStatus = 'PENDIENTE' | 'APROBADO' | 'REQUIERE_REVISION' | 'OBSERVADO';`
   - `src/components/PatientDetailPanel.tsx:148-190`: Buttons set status to `APROBADO`, `REQUIERE_REVISION`, `OBSERVADO`, `PENDIENTE`. Statuses `RECHAZADO` and `DERIVADO` are missing in backend, frontend types, and UI.

3. **C5 Subscore Omission**:
   - `src/types/patient.ts:18-26`: `NT118RiskScore` defines `hba1cScore`, `renalsScore`, `cvScore`, `socialScore` — `c5DaysScore` / `daysScore` is omitted.
   - `src/services/api.ts:42-45, 98-101`: `mapBackendPatientToFrontend` and `mapBackendScoreToFrontend` do not map `c5_days_score`.
   - `src/services/api.ts:275-283`: `calculateLocalNT118Score` calculates `daysScore` but excludes it from the returned object.
   - `src/components/PatientDetailPanel.tsx:81-98`: Renders 4 subscore boxes (`HbA1c`, `Renal`, `Cardiovascular`, `Determinantes`); C5 (Waiting List score) is not rendered.

4. **PII Handling**:
   - `backend/app/core/privacy.py:3-44`: Contains `mask_rut(rut)` for visual asterisk masking (`12.458.***-K`). No SHA-256 + salt hashing exists in the codebase.

5. **Mock Patients Quantity**:
   - `backend/app/data/mock_db.py:6-173`: Contains 5 mock patients (`PAT-001` to `PAT-005`).
   - `src/data/mockPatients.ts:3-211`: Contains 5 mock patients (`PAT-001` to `PAT-005`).
   - `backend/tests/e2e/test_tier1_features.py:162`: `test_get_pacientes_unfiltered_200` asserts `len(data) == 5`.

6. **KPICards Metrics**:
   - `src/components/KPICards.tsx:10-15`: Calculates `totalCount`, `criticalCount`, `highDecompensatedCount`, `pendingContraloriaCount`, `approvedCount`. Average NT 118 score is not calculated or rendered.

7. **Test Suite Execution**:
   - Ran `pytest` inside `backend/`: All 20 tests in `backend/tests/e2e/test_tier1_features.py` passed (exit code 0).

---

## 2. Logic Chain

1. **Contraloría Statuses**:
   - *Observation*: `ORIGINAL_REQUEST.md` specifies `APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE`. `pacientes.py` validates `new_status` against `VALID_STATUSES` which currently only allows `{"PENDIENTE", "APROBADO", "REQUIERE_REVISION", "OBSERVADO"}`.
   - *Deduction*: Any request attempting to set `RECHAZADO` or `DERIVADO` will fail with an HTTP 422 error from FastAPI. To meet specification R1, `VALID_STATUSES`, `patient.py` schemas, TypeScript `ContraloriaStatus`, and `PatientDetailPanel.tsx` buttons must be updated to include `RECHAZADO` and `DERIVADO`.

2. **C5 Subscore Breakdown**:
   - *Observation*: `ORIGINAL_REQUEST.md` requires displaying all 5 subscores (including C5 Days on waiting list). Backend engine `nt118.py` calculates `c5_days_score` and returns it inside `subscores`. `src/types/patient.ts` and `src/services/api.ts` drop C5, causing `PatientDetailPanel.tsx` to render only 4 subscores.
   - *Deduction*: `NT118RiskScore` interface in `patient.ts`, mappers in `api.ts`, and component `PatientDetailPanel.tsx` must be updated to include C5 (`c5DaysScore` / `daysScore`).

3. **PII Masking vs Hashing**:
   - *Observation*: `ORIGINAL_REQUEST.md` R1 specifies SHA-256 + salt RUT hashing. `privacy.py` only implements visual masking (`12.458.***-K`).
   - *Deduction*: SHA-256 salted hashing function must be added to `privacy.py` and called before logging/persisting patient records.

4. **Mock Dataset Size**:
   - *Observation*: `ORIGINAL_REQUEST.md` acceptance criteria require `>= 10 mock patients`. `mock_db.py` and `mockPatients.ts` currently have 5 patients. `test_tier1_features.py:162` asserts `len(data) == 5`.
   - *Deduction*: 5 additional mock patients (`PAT-006` to `PAT-010`) must be added to both backend and frontend datasets, and `test_get_pacientes_unfiltered_200` must be updated to assert `len(data) >= 10`.

5. **KPICards Metrics**:
   - *Observation*: `ORIGINAL_REQUEST.md` R2 requires an Average NT 118 score card in `KPICards`. `KPICards.tsx` currently displays Descompensados and Aprobados cards instead.
   - *Deduction*: `KPICards.tsx` must compute `patients.reduce((acc, p) => acc + p.nt118Risk.totalScore, 0) / patients.length` and render an Average NT 118 score card.

---

## 3. Caveats

- No code or implementation files outside `.agents/spec_miner_nt118/` were modified by this agent, per the Spec Miner read-only constraint.
- Existing tier 1 pytest suite passes with current 5 mock patients; adding mock patients to reach >= 10 will require updating `assert len(data) == 5` to `assert len(data) >= 10` in `test_tier1_features.py:162`.

---

## 4. Conclusion

All functional specifications, engine formulas, risk thresholds, API contracts, PII requirements, and acceptance criteria have been mined and documented in `.agents/spec_miner_nt118/analysis.md`. Seven explicit mismatches between `ORIGINAL_REQUEST.md` and the existing codebase have been cataloged with actionable remediation steps for implementation agents.

---

## 5. Verification Method

To independently verify these findings:

1. **Inspect Analysis Report**:
   Read `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/.agents/spec_miner_nt118/analysis.md`.

2. **Verify Backend Status Validation Mismatch**:
   Check `backend/app/api/endpoints/pacientes.py:10` and `backend/app/schemas/patient.py:16` vs `ORIGINAL_REQUEST.md:33-35`.

3. **Verify C5 Subscore Missing**:
   Check `src/types/patient.ts:18-26`, `src/services/api.ts:42-45`, and `src/components/PatientDetailPanel.tsx:81-98`.

4. **Verify Mock Patient Count**:
   Check patient count in `backend/app/data/mock_db.py:6` and `src/data/mockPatients.ts:3` (5 patients vs >= 10 spec).

5. **Run Backend Test Suite**:
   Run `pytest` in `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/backend`.
