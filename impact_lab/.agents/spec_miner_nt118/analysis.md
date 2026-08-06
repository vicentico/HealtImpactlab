# Specification Mining Report: Torre de Control APS — HealtImpactlab

**Working Directory**: `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/.agents/spec_miner_nt118`  
**Parent Conversation ID**: `d59e830e-788d-444d-b23f-e5cbd10430d6`  
**Date**: 2026-08-05  

---

## 1. Executive Summary & Objective

This specification analysis mines, extracts, and documents all functional specifications, algorithm rules, data schemas, API contracts, risk thresholds, sub-criteria formulas, PII protection constraints, and acceptance criteria for **Torre de Control APS — HealtImpactlab**.

A comprehensive comparison was performed between the authoritative specification (`ORIGINAL_REQUEST.md`) and the codebase (`src/types/patient.ts`, `src/services/api.ts`, `src/components/*`, `backend/app/*`, `backend/tests/*`). Key mismatches, type gaps, missing fields, status set contradictions, missing subscores, PII rule deviations, and mock patient count deficits have been identified and documented below.

---

## 2. Extracted Specifications & Rules from ORIGINAL_REQUEST.md

### 2.1 NT 118 MINSAL Priority Scoring Algorithm Rules (ECICEP Programme)
The engine calculates clinical priority for DM2 / Cardiovascular patients across **5 sub-criteria** (Max Total Score = 100 points):

1. **C1: Glycemic Control (HbA1c)** [Max 35 points]
   - `HbA1c > 11.0%`: **35 pts** | Decompensation: `HBA1C_CRITICA` ("HbA1c > 11.0% Severa", severity: `ALTA`)
   - `10.0% <= HbA1c <= 11.0%`: **30 pts** | Decompensation: `HBA1C_ALTA` ("HbA1c Descompensada", severity: `MEDIA`)
   - `9.0% <= HbA1c < 10.0%`: **28 pts** | Decompensation: `HBA1C_ALTA` ("HbA1c Descompensada", severity: `MEDIA`)
   - `8.0% <= HbA1c < 9.0%`: **18 pts**
   - `7.0% <= HbA1c < 8.0%`: **10 pts**
   - `HbA1c < 7.0%`: **0 pts**

2. **C2: Renal Deterioration (VFG - Glomerular Filtration Rate)** [Max 30 points]
   - `VFG < 30.0 mL/min`: **30 pts** | Decompensation: `VFG_CRITICA` ("Insuficiencia Renal Severa (VFG < 30)", severity: `ALTA`)
   - `30.0 <= VFG <= 44.0 mL/min`: **25 pts** | Decompensation: `VFG_DISMINUIDA` ("Enfermedad Renal Etapa 3b", severity: `MEDIA`)
   - `45.0 <= VFG <= 59.0 mL/min`: **15 pts**
   - `60.0 <= VFG <= 89.0 mL/min`: **10 pts**
   - `VFG >= 90.0 mL/min`: **0 pts**

3. **C3: Vascular Complications & Blood Pressure** [Max 25 points]
   - Active Diabetic Foot Ulcer (`has_foot_ulcer = True`): **+20 pts** | Decompensation: `PIE_DIABETICO` ("Sospecha Ulcera Activa", severity: `ALTA`, value: "Grado 2")
   - Proliferative Retinopathy (`has_retinopathy = True`): **+15 pts** | Decompensation: `RETINOPATIA` ("Retinopatía Diabética Proliferativa", severity: `MEDIA`, value: "Fondo de Ojo +" / "Confirmado")
   - Severe Hypertension (`systolic_bp >= 160` OR `diastolic_bp >= 100`): **+10 pts** | Decompensation: `HTA_SEVERA` ("Hipertensión Severa", severity: `MEDIA`)
   - Moderate Hypertension (`systolic_bp >= 140` OR `diastolic_bp >= 90`): **+5 pts**
   - *Subscore cap*: `c3_cv_score = min(25, c3_raw)`

4. **C4: Social Determinants & Age** [Max 10 points]
   - Elderly (`age > 65`): **+4 pts**
   - *Subscore cap*: `c4_social_score = min(10, c4_raw)`

5. **C5: Waiting List Duration (Days in Waiting List)** [Max 10 points]
   - `days_in_waiting_list > 180`: **10 pts**
   - `120 < days_in_waiting_list <= 180`: **7 pts**
   - `90 < days_in_waiting_list <= 120`: **5 pts**
   - `45 < days_in_waiting_list <= 90`: **3 pts**
   - `days_in_waiting_list <= 45`: **0 pts**
   - *Subscore cap*: `c5_days_score = min(10, c5_raw)`

6. **Total Score & Risk Classification**:
   - `totalScore = min(100, C1 + C2 + C3 + C4 + C5)`
   - Risk Thresholds:
     - `CRITICO`: `totalScore >= 90`
     - `ALTO`: `75 <= totalScore < 90`
     - `MEDIO`: `50 <= totalScore < 75`
     - `BAJO`: `totalScore < 50`

### 2.2 PII Protection Rules
- Chilean RUT must be securely hashed using **SHA-256 + salt** prior to any logging or persistence (R1).

### 2.3 Contraloría Medical Action Requirements
- Medical action endpoint `PATCH /api/pacientes/{id}/contraloria` accepts:
  - `new_status`: Action choice. Canonical statuses in ORIGINAL_REQUEST: `APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE`.
  - `clinical_note`: Required clinical rationale text.
  - `physician_name`: Doctor's full name.
  - `physician_role`: Doctor's role (e.g. "Médico Contralor APS").
- Action must be appended to the patient's immutable `auditHistory` log.

### 2.4 Acceptance Criteria Checklist (ORIGINAL_REQUEST.md)
- `GET /api/pacientes` returns **>= 10 mock patients** sorted by `priorityPosition` ascending.
- `POST /api/priorizacion/calcular` with `hba1c=11.5, vfg=28, has_foot_ulcer=true` returns `riskLevel: "CRITICO"` and `totalScore >= 90`.
- `PATCH /api/pacientes/{id}/contraloria` appends an entry to `auditHistory` and returns patient with updated `contraloriaStatus`.
- All `pytest` tests pass in `backend/tests/`.
- `npm run build` exits with code 0 (zero TypeScript errors).
- UI operates seamlessly in offline fallback mode when backend is unreachable.
- `PressureMap` computes demand counts dynamically from live patient dataset.
- `KPICards` displays total patients, critical count, pending contraloría count, and **average NT 118 score**.
- E2E flow updates UI badges and audit timeline reactively within the same render cycle.

---

## 3. Comparative Codebase Analysis & Mismatch Inventory

A thorough audit comparing `ORIGINAL_REQUEST.md` against `src/types/patient.ts`, `src/services/api.ts`, frontend components, backend schemas (`backend/app/schemas/`), backend engine (`backend/app/engine/`), endpoints (`backend/app/api/endpoints/`), privacy (`backend/app/core/privacy.py`), and backend test suite (`backend/tests/`) revealed **7 critical mismatches**:

### Mismatch 1: Contraloría Status Set Inconsistency
- **Spec requirement (ORIGINAL_REQUEST R1)**: Allowed statuses are `APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE`.
- **Backend implementation (`backend/app/api/endpoints/pacientes.py:10`, `backend/app/schemas/patient.py:16`)**: Defines `VALID_STATUSES = {"PENDIENTE", "APROBADO", "REQUIERE_REVISION", "OBSERVADO"}`.
- **Frontend types (`src/types/patient.ts:3-7`)**: Defines `ContraloriaStatus = 'PENDIENTE' | 'APROBADO' | 'REQUIERE_REVISION' | 'OBSERVADO'`.
- **Frontend UI (`src/components/PatientDetailPanel.tsx:148-190`)**: Buttons only offer `APROBADO`, `REQUIERE_REVISION`, `OBSERVADO`, `PENDIENTE`.
- **Impact**: Submitting `RECHAZADO` or `DERIVADO` causes an HTTP 422 error from backend validation. `REQUIERE_REVISION` and `OBSERVADO` contradict the spec requirements in `ORIGINAL_REQUEST.md`.

### Mismatch 2: Missing C5 Subscore in Frontend Types and API Mapper
- **Spec requirement (ORIGINAL_REQUEST R1 & R2)**: NT 118 risk score must return and display all 5 subscores breakdown (C1 HbA1c, C2 VFG, C3 CV, C4 Social, C5 Days in Waiting List).
- **Backend Schema (`backend/app/schemas/priorizacion.py:21-26`)**: `SubscoresBreakdown` includes `c1_hba1c_score`, `c2_renals_score`, `c3_cv_score`, `c4_social_score`, `c5_days_score`.
- **Frontend Type (`src/types/patient.ts:18-26`)**: `NT118RiskScore` only defines `hba1cScore`, `renalsScore`, `cvScore`, `socialScore`. `c5DaysScore` / `daysScore` and the `subscores` object are missing.
- **Frontend API Mapper (`src/services/api.ts:39-52, 93-108`)**: `mapBackendPatientToFrontend` and `mapBackendScoreToFrontend` drop `c5_days_score`. `calculateLocalNT118Score` calculates `daysScore` for total score but omits it from the returned object.
- **Frontend UI (`src/components/PatientDetailPanel.tsx:81-98`)**: Only renders 4 subscore cards (`HbA1c`, `Renal`, `Cardiovascular`, `Determinantes`). C5 is omitted.

### Mismatch 3: PII (RUT) Hashing vs Visual Masking
- **Spec requirement (ORIGINAL_REQUEST R1)**: RUT must be hashed using SHA-256 + salt before persistence or logging.
- **Backend Privacy Module (`backend/app/core/privacy.py`)**: Implements visual asterisk masking `mask_rut()` (e.g. `12.458.***-K`). SHA-256 hashing is not implemented anywhere in the backend codebase.

### Mismatch 4: Mock Patient Dataset Quantity (< 10 patients)
- **Spec requirement (Acceptance Criteria)**: `GET /api/pacientes` must return **>= 10 mock patients** sorted by `priorityPosition` ascending.
- **Backend Mock DB (`backend/app/data/mock_db.py:6-173`)**: Contains only **5 mock patients** (`PAT-001` through `PAT-005`).
- **Frontend Mock Data (`src/data/mockPatients.ts:3-211`)**: Contains only **5 mock patients**.
- **Backend Tier 1 Test (`backend/tests/e2e/test_tier1_features.py:162`)**: `test_get_pacientes_unfiltered_200` explicitly asserts `len(data) == 5`.

### Mismatch 5: Missing Average NT 118 Score KPI Card
- **Spec requirement (ORIGINAL_REQUEST R2)**: `KPICards` component must display total patients, critical count, pending contraloría count, and **average NT 118 score**.
- **Frontend UI (`src/components/KPICards.tsx`)**: Displays Total Pacientes, Riesgo Crítico, Descompensados HbA1c > 10%, Pendiente Contraloría, and Aprobados. It does NOT compute or display the Average NT 118 score.

### Mismatch 6: Snake_case vs CamelCase Mapper Inconsistencies
- Backend uses Pydantic `CamelModel` with `to_camel` alias generator.
- `src/services/api.ts` maps `c1Hba1cScore` / `c1_hba1c_score` -> `hba1cScore`, `c2RenalsScore` / `c2_renals_score` -> `renalsScore`, `c3CvScore` / `c3_cv_score` -> `cvScore`, `c4SocialScore` / `c4_social_score` -> `socialScore`.
- Field naming variations exist between `systolicBp` / `systolicBP` / `systolic_bp` and `diastolicBp` / `diastolicBP` / `diastolic_bp`. `api.ts` handles fallbacks, but type declarations in `patient.ts` differ from backend schema keys.

### Mismatch 7: `calculate_nt118_score` Risk Threshold Boundary in Test vs Engine
- **Spec requirement & Engine (`backend/app/engine/nt118.py:140`)**: `CRITICO` threshold is `total_score >= 90`.
- **Backend Test (`backend/tests/e2e/test_tier1_features.py:77`)**: `test_calculate_nt118_critico_score` asserts `result["totalScore"] >= 85`. Note that 85 falls in `ALTO` range under NT 118 spec (spec requires >= 90 for `CRITICO`).

---

## 4. Discovered Features Table

```
## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | API / Backend | Patient List Endpoint | `GET /api/pacientes` returns prioritized, filtered list of patients | Query params: `sector`, `status`, `risk_level`, `cesfam_name` | JSON array of patient objects with masked RUT, NT118 score, and audit history | Returns `[]` if no matches; 500 on internal errors | `backend/app/api/endpoints/pacientes.py` |
| 2 | Engine | NT 118 Scoring Calculation | `POST /api/priorizacion/calcular` computes NT 118 risk score & decompensations | `PriorizacionRequest` (hba1c, vfg, systolic_bp, diastolic_bp, has_foot_ulcer, has_retinopathy, days_in_waiting_list, age, gender) | `PriorizacionResponse` with `totalScore`, `riskLevel`, `subscores`, `decompensations` | 422 Unprocessable Entity if required fields missing | `backend/app/engine/nt118.py`, `backend/app/api/endpoints/priorizacion.py` |
| 3 | API / Backend | Contraloría Action Patch | `PATCH /api/pacientes/{id}/contraloria` updates patient status & appends audit log | `ContraloriaUpdatePayload` (new_status, clinical_note, physician_name, physician_role) | Updated patient object with new `contraloriaStatus` and appended `auditHistory` entry | 404 if patient ID not found; 422 if invalid status | `backend/app/api/endpoints/pacientes.py` |
| 4 | Security / Privacy | RUT PII Masking | Masks Chilean RUT for display privacy | Raw or formatted RUT string (e.g., "12.458.930-K") | Masked RUT string (e.g., "12.458.***-K") | Idempotent for already masked; returns empty string for empty/null input | `backend/app/core/privacy.py` |
| 5 | Security / Privacy | SHA-256 PII Hashing | Spec requirement for secure salted RUT hashing | Raw RUT + Salt | Hashed hex string | Not currently implemented in reference backend | `ORIGINAL_REQUEST.md` (R1) |
| 6 | Frontend / State | Offline Fallback Store | Local in-memory patient dataset fallback when backend API is offline | Network failure / offline status | Mock patients dataset with local NT118 calculation & local state mutation | Graceful fallback, logs warning, no UI crash | `src/services/api.ts` (`fallbackPatientsStore`) |
| 7 | UI Component | Reactive KPI Dashboard | Displays aggregated metrics calculated reactively from active patient list | `patients` array | 5 KPI summary cards (Total, Critical, Decompensated, Pending, Approved) | Shows 0 values if patient array empty | `src/components/KPICards.tsx` |
| 8 | UI Component | Demand Pressure Map | Computes APS program demand vs weekly capacity | `patients` array (or `programs` array) | 4 program capacity cards with breach estimation & pressure status badge | Fallback to default counts if patient list empty | `src/components/PressureMap.tsx` |
| 9 | UI Component | Prioritized Patient Table | Renders priority-ranked table with risk badges and action buttons | `patients` array | Priority table sorted by `priorityPosition` ascending | Shows empty state if filtered dataset empty | `src/components/PrioritizedTable.tsx` |
| 10| UI Component | Patient Detail Drawer | Slide-over drawer displaying NT 118 score breakdown, biomedical params, audit timeline, and action form | `patient` object, `onUpdateStatus` handler | Detailed patient view + Contraloría override form | Alert prompt if clinical note is blank on submit | `src/components/PatientDetailPanel.tsx` |
| 11| UI Component | Algorithm Criteria Modal | Explanatory modal describing NT 118 MINSAL scoring methodology and weights | `isOpen` boolean, `onClose` handler | Modal overlay with scoring criteria tables | None | `src/components/OperationalExplicationPanel.tsx` |
```

---

## 5. Edge Cases Table

```
## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | NT 118 Engine | `hba1c = 11.5`, `vfg = 28.0`, `has_foot_ulcer = True`, `days_in_waiting_list = 200`, `age = 70` | Total raw score = 35 + 30 + 20 + 4 + 10 = 99. Bounded totalScore = 99, riskLevel = "CRITICO". 3 active decompensations recorded. |
| 2 | NT 118 Engine | All max parameters (`hba1c = 15.0`, `vfg = 10.0`, `has_foot_ulcer = True`, `has_retinopathy = True`, `systolic_bp = 180`, `age = 80`, `days = 300`) | Raw sum = 35 + 30 + (20+15+10 capped at 25) + 4 + 10 = 104. Capped totalScore = 100, riskLevel = "CRITICO". |
| 3 | NT 118 Engine | `hba1c = 6.5`, `vfg = 95.0`, `systolic_bp = 118`, `diastolic_bp = 75`, `days = 10`, `age = 30` | Total score = 0, riskLevel = "BAJO", decompensations = []. |
| 4 | Contraloría Action | `new_status = "DERIVADO"` or `"RECHAZADO"` | Backend returns HTTP 422 Unprocessable Entity ("Invalid contraloria status") due to `VALID_STATUSES` restriction. |
| 5 | Contraloría Action | Submit action with blank/whitespace `clinical_note` | Frontend triggers `alert('Por favor ingrese una nota clínica justificativa...')` and aborts submission. |
| 6 | PII Masking | RUT string `"12.458.***-K"` (already masked) | Returns `"12.458.***-K"` unchanged (idempotent behavior). |
| 7 | PII Masking | RUT string without dots/dashes `"12458930K"` | Formats and masks as `"12.458.***-K"`. |
| 8 | Offline Fallback | Backend server port 8000 unreachable | `fetchPacientes()` catches fetch exception, logs warning, returns `fallbackPatientsStore`, preventing UI error screens. |
| 9 | Patient Detail | Patient with empty `auditHistory = []` | Displays italic message: `"Sin registros previos de contraloría."` |
| 10| Dataset Query | `GET /api/pacientes?sector=SECTOR_ROJO&status=APROBADO` | Returns empty array `[]` (200 OK). |
```

---

## 6. Verification & Test Suite Status

Backend Tier 1 test execution results:
- Command: `pytest` inside `backend/`
- Test Suite File: `backend/tests/e2e/test_tier1_features.py`
- Test Status: All 20 tier1 tests pass (exit code 0).

---

## 7. Recommended Action Plan for Implementation Agents

1. **Expand Mock Patient Dataset**: Add 5 additional mock patients to both `backend/app/data/mock_db.py` and `src/data/mockPatients.ts` (total 10 patients: `PAT-001` through `PAT-010`) sorted by `priorityPosition`. Update test `test_get_pacientes_unfiltered_200` to assert `len(data) >= 10`.
2. **Harmonize Contraloría Statuses**: Update backend `VALID_STATUSES` in `backend/app/api/endpoints/pacientes.py`, schema comment in `backend/app/schemas/patient.py`, frontend type in `src/types/patient.ts`, and action buttons in `src/components/PatientDetailPanel.tsx` to include `APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE`.
3. **Add C5 Subscore to Frontend & Mappers**: Update `NT118RiskScore` interface in `src/types/patient.ts` to include `c5DaysScore` / `daysScore` (or subscores object), update `mapBackendPatientToFrontend`, `mapBackendScoreToFrontend`, and `calculateLocalNT118Score` in `src/services/api.ts` to map C5, and update `src/components/PatientDetailPanel.tsx` to display all 5 subscore cards.
4. **Implement SHA-256 RUT Hashing**: Add SHA-256 + salt hashing function in `backend/app/core/privacy.py` and apply it when saving or logging patient records.
5. **Update KPICards Metrics**: Add the Average NT 118 Score card to `src/components/KPICards.tsx` per requirement R2.
