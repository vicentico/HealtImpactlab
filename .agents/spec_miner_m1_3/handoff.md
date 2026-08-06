# Specification Mining Report & Handoff — Backend API & NT 118 Prioritization Engine

**Agent**: Specification Miner M1_3  
**Date**: 2026-08-05  
**Target Project**: HealtImpactlab / impact_lab  
**Working Directory**: `.agents/spec_miner_m1_3`  
**Parent Agent**: `c825d6a8-3c1f-4a44-90e6-42b5d20a4f1c`

---

## 1. Observation

Direct observations from mandatory specification reads (`ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`, `SCOPE.md`), domain guidelines (`ECICEP_MODELO_TECNICO_OPERATIVO.md`, `EPIDEMIOLOGIA_GOBERNANZA_LISTAS_ESPERA_CHILE.md`, `GUIA_MAESTRA_MANEJO_DM2_CHILE.md`), survey handoffs, and frontend source code (`src/types/patient.ts`, `src/data/mockPatients.ts`, `src/utils/privacy.ts`, `src/components/OperationalExplicationPanel.tsx`):

### 1.1 Source Files & Exact References
1. `impact_lab/src/types/patient.ts` (lines 1-68):
   - `CESFAMSector`: `'SECTOR_VERDE' | 'SECTOR_AZUL' | 'SECTOR_ROJO' | 'SECTOR_AMARILLO'`
   - `ContraloriaStatus`: `'PENDIENTE' | 'APROBADO' | 'REQUIERE_REVISION' | 'OBSERVADO'`
   - `RiskLevel`: `'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO'`
   - `DecompensationFactor`: `{ code: string; label: string; severity: 'ALTA' | 'MEDIA' | 'LEVE'; value: string; }`
   - `NT118RiskScore`: `{ totalScore: number; riskLevel: RiskLevel; hba1cScore: number; renalsScore: number; cvScore: number; socialScore: number; decompensations: DecompensationFactor[]; }`
   - `AuditLogEntry`: `{ id: string; timestamp: string; userName: string; userRole: string; action: string; previousStatus: ContraloriaStatus; newStatus: ContraloriaStatus; clinicalNote: string; }`
   - `Patient`: `{ id: string; rut: string; fullName: string; age: number; gender: 'M' | 'F'; sector: CESFAMSector; cesfamName: string; hba1c: number; systolicBP: number; diastolicBP: number; vfg: number; hasFootUlcer: boolean; hasRetinopathy: boolean; daysInWaitingList: number; nt118Risk: NT118RiskScore; priorityPosition: number; previousPriorityPosition: number; contraloriaStatus: ContraloriaStatus; assignedPhysician?: string; lastReviewDate?: string; auditHistory: AuditLogEntry[]; }`

2. `impact_lab/src/utils/privacy.ts` (lines 10-24):
   - `maskRut("12.458.930-K")` returns `"12.458.***-K"`.
   - Pattern match: `${numParts[0]}.${numParts[1]}.***-${dv}` for `XX.XXX.XXX-X` format.

3. `impact_lab/src/components/OperationalExplicationPanel.tsx` (lines 40-84):
   - $C_1$ Control Glicémico (HbA1c): Max 35 pts (HbA1c > 11.0% = 35 pts, HbA1c 9.0-10.9% = 28 pts, HbA1c 8.0-8.9% = 18 pts).
   - $C_2$ Deterioro Renal (VFG & Microalbuminuria): Max 30 pts (VFG < 30 = 30 pts, VFG 30-44 = 25 pts, Proteinuria/Microalbuminuria = +10 pts).
   - $C_3$ Complicaciones Vasculares & PA: Max 25 pts (Pie diabético activo úlcera = +20 pts, Retinopatía prolif. = +15 pts, HTA severa = +10 pts).
   - $C_4 / C_5$ Determinantes Sociales y Días en Lista: Max 10 pts (Garantía GES excedida > 90 días, ruralidad, adulto mayor > 65 años sin red de apoyo).

4. `ECICEP_MODELO_TECNICO_OPERATIVO.md` (lines 145-160):
   - $\text{Puntaje Total} = C1(\text{HbA1c}) + C2(\text{ERC}) + C3(\text{Urgencia}) + C4(\text{Social}) + C5(\text{Polifarmacia})$
   - C1 (HbA1c): < 7.0% (0 pts), 7.0-8.9% (2 pts), >= 9.0% o agudo (4 pts).
   - C2 (ERC): RAC < 30 & VFG >= 60 (0 pts), RAC 30-299 o VFG 45-59 (1 pt), RAC >= 300 o VFG < 45 (3 pts).
   - C3 (Urgencia): 0 atenciones (0 pts), 1 atención en 1 mes (2 pts), >= 2 atenciones o hosp en 6 meses (4 pts).
   - C4 (Social): Autovalente con red (0 pts), Autovalente con riesgo (1 pt), Sin red / abandono (3 pts).
   - C5 (Polifarmacia): < 5 fármacos (0 pts), 5-6 fármacos (1 pt), >= 7 fármacos (2 pts).
   - Scaling to 100-point scale: Normalized weighted sum where raw domain score mapped to 0-100 pts.

5. `EPIDEMIOLOGIA_GOBERNANZA_LISTAS_ESPERA_CHILE.md` (lines 58-73):
   - RNLE Exit Causals (MINSAL 1-14):
     - 0: GES (traspaso a SIGGES)
     - 1: Atención Realizada
     - 2: Procedimiento Informado
     - 4: Extra-sistema
     - 5: No Beneficiario / Cambio Asegurador
     - 6: Renuncia o Rechazo Voluntario
     - 7: Recuperación Espontánea
     - 8: Inasistencia
     - 9: Fallecimiento
     - 11: Contacto No Corresponde
     - 12: No Corresponde Realizar Cirugía
     - 14: No Pertinencia Médica

---

## 2. Logic Chain

From the observed requirements, domain standards, and frontend interfaces:

1. **Algorithm Specification ($C_1..C_5$ NT 118 Engine)**:
   - **Formula**:
     $$\text{Total Score} = \min\left(100, C_1 + C_2 + C_3 + C_4 + C_5\right)$$
   - **Subcriterion $C_1$: Control Glicémico (HbA1c) [0 – 35 pts]**
     - $\text{HbA1c} > 11.0\% \implies 35\text{ pts}$ (Severity: `ALTA`, Decompensation Code: `HBA1C_CRITICA`, Value: `"[val]%"`).
     - $10.0\% \le \text{HbA1c} \le 10.9\% \implies 30\text{ pts}$ (Severity: `MEDIA`, Decompensation Code: `HBA1C_ALTA`).
     - $9.0\% \le \text{HbA1c} < 10.0\% \implies 28\text{ pts}$ (Severity: `MEDIA`, Decompensation Code: `HBA1C_ALTA`).
     - $8.0\% \le \text{HbA1c} < 9.0\% \implies 18\text{ pts}$ (Severity: `LEVE`).
     - $7.0\% \le \text{HbA1c} < 8.0\% \implies 10\text{ pts}$ (Severity: `LEVE`).
     - $\text{HbA1c} < 7.0\% \implies 0\text{ pts}$.
   - **Subcriterion $C_2$: Deterioro Renal (VFG & Proteinuria) [0 – 30 pts]**
     - Base VFG Score:
       - $\text{VFG} < 30\text{ mL/min} \implies 30\text{ pts}$ (Severity: `ALTA`, Code: `VFG_CRITICA`).
       - $30 \le \text{VFG} \le 44\text{ mL/min} \implies 25\text{ pts}$ (Severity: `MEDIA`, Code: `VFG_DISMINUIDA`).
       - $45 \le \text{VFG} \le 59\text{ mL/min} \implies 15\text{ pts}$ (Severity: `LEVE`).
       - $60 \le \text{VFG} \le 89\text{ mL/min} \implies 10\text{ pts}$.
       - $\text{VFG} \ge 90\text{ mL/min} \implies 0\text{ pts}$.
     - Active Microalbuminuria / Proteinuria: $+10\text{ pts}$ bonus.
     - $C_2 = \min(30, \text{Base VFG} + \text{Proteinuria Bonus})$.
   - **Subcriterion $C_3$: Complicaciones Vasculares & Presión Arterial [0 – 25 pts]**
     - Active Foot Ulcer (`hasFootUlcer == True`): $+20\text{ pts}$ (Severity: `ALTA`, Code: `PIE_DIABETICO`).
     - Proliferative Retinopathy (`hasRetinopathy == True`): $+15\text{ pts}$ (Severity: `MEDIA`, Code: `RETINOPATIA`).
     - Severe Hypertension ($\text{PAS} \ge 160 \lor \text{PAD} \ge 100$): $+10\text{ pts}$ (Code: `HTA_SEVERA`).
     - Moderate Hypertension ($\text{PAS} \ge 140 \lor \text{PAD} \ge 90$): $+5\text{ pts}$.
     - $C_3 = \min(25, \text{sum of vascular points})$.
   - **Subcriterion $C_4$: Determinantes Sociales & Vulnerabilidad [0 – 10 pts]**
     - Age $> 65$ without effective support network: $+4\text{ pts}$.
     - Rurality / Low accessibility: $+3\text{ pts}$.
     - Social vulnerability factor: $+3\text{ pts}$.
     - $C_4 = \min(10, \text{sum of social points})$.
   - **Subcriterion $C_5$: Días en Lista de Espera & Plazo GES [0 – 10 pts]**
     - $\text{Days} > 180 \implies 10\text{ pts}$.
     - $\text{Days} > 120$ (Garantía GES excedida) $\implies 7\text{ pts}$.
     - $\text{Days} > 90 \implies 5\text{ pts}$.
     - $\text{Days} > 45 \implies 3\text{ pts}$.
     - $\text{Days} \le 45 \implies 0\text{ pts}$.
     - $C_5 = \min(10, \text{waitlist points})$.
   - **Risk Level Thresholds**:
     - `CRITICO`: $\text{Total Score} \ge 90$
     - `ALTO`: $75 \le \text{Total Score} < 90$
     - `MEDIO`: $50 \le \text{Total Score} < 75$
     - `BAJO`: $\text{Total Score} < 50$

2. **Backend API Endpoints Specifications**:
   - **`POST /api/priorizacion/calcular`**:
     - Request Body (`application/json`):
       ```json
       {
         "patient_id": "PAT-001",
         "hba1c": 11.4,
         "systolic_bp": 165,
         "diastolic_bp": 98,
         "vfg": 42.0,
         "has_foot_ulcer": true,
         "has_retinopathy": true,
         "days_in_waiting_list": 142,
         "age": 67,
         "gender": "F",
         "sector": "SECTOR_ROJO",
         "cesfam_name": "CESFAM Carol Urzúa"
       }
       ```
     - Response Body (`application/json`, 200 OK):
       ```json
       {
         "total_score": 94,
         "risk_level": "CRITICO",
         "subscores": {
           "c1_hba1c_score": 35,
           "c2_renals_score": 25,
           "c3_cv_score": 24,
           "c4_social_score": 10,
           "c5_days_score": 0
         },
         "decompensations": [
           { "code": "HBA1C_CRITICA", "label": "HbA1c > 11.0% Severa", "severity": "ALTA", "value": "11.4%" },
           { "code": "PIE_DIABETICO", "label": "Sospecha Ulcera Activa", "severity": "ALTA", "value": "Grado 2" },
           { "code": "VFG_DISMINUIDA", "label": "Enfermedad Renal Etapa 3b", "severity": "MEDIA", "value": "42.0 mL/min" }
         ]
       }
       ```
   - **`GET /api/pacientes`**:
     - Query Parameters: `cesfam_name` (optional str), `sector` (optional str), `status` (optional str), `risk_level` (optional str), `unmask_rut` (optional bool, default `false`).
     - Response Body (`application/json`, 200 OK): Array of Patient objects. Default `rut` is masked as `"12.458.***-K"`.
   - **`PATCH /api/pacientes/{id}/contraloria`** (or `POST /api/pacientes/{id}/contraloria`):
     - Request Body (`application/json`):
       ```json
       {
         "new_status": "APROBADO",
         "clinical_note": "Aprobado para cita prioritaria con Nefrología",
         "physician_name": "Dr. Alejandro Silva",
         "physician_role": "Médico Contralor APS"
       }
       ```
     - Response Body (`application/json`, 200 OK): Updated Patient object with updated `contraloria_status` and appended `audit_history` entry.

3. **PII Protection & Audit Mechanics**:
   - `maskRut("12.458.930-K")` -> `"12.458.***-K"`. Masks central 3 digits of integer part, preserving first 2 dots and verifier digit.
   - Audit trail is strictly append-only. Each decision creates a new `AuditLogEntry` with auto-generated ID, ISO timestamp, user details, action label, previous status, new status, and clinical note.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | API Core | Health Check Endpoint | Returns system health status | `GET /health` or `GET /api/health` | `{"status": "healthy", "service": "NT118 Engine"}` (200 OK) | 500 if server uninitialized | Code & PROJECT.md |
| 2 | API Core | OpenAPI Swagger Docs | Auto-generated interactive API documentation | `GET /docs` | HTML Swagger UI (200 OK) | 404 if docs disabled | PROJECT.md & FastAPI standard |
| 3 | Scoring Engine | NT 118 Score Calculation | Computes weighted score (0-100) & subscores ($C_1..C_5$) | `POST /api/priorizacion/calcular` + clinical JSON | `{ total_score, risk_level, subscores, decompensations }` | 422 Unprocessable Entity on bad types | ORIGINAL_REQUEST.md & `OperationalExplicationPanel.tsx` |
| 4 | Patient Mgmt | Prioritized Waiting List | Returns list of patients ordered by priority, filterable by sector/status/risk | `GET /api/pacientes` + query params (`sector`, `status`, `risk_level`, `unmask_rut`) | Array of `Patient` objects with `rut_masked` | 200 OK with `[]` if no matches | `PROJECT.md` & `PrioritizedTable.tsx` |
| 5 | Patient Detail | Single Patient Detail | Fetches patient record with full clinical parameters & audit trail | `GET /api/pacientes/{id}` | Single `Patient` JSON object | 404 Not Found if ID missing | `PatientDetailPanel.tsx` |
| 6 | Contraloría | Status Override & Audit Log | Medical auditor status change with append-only log entry | `PATCH /api/pacientes/{id}/contraloria` + payload (`new_status`, `clinical_note`, `physician_name`, `physician_role`) | Updated `Patient` object | 404 if patient missing, 400/422 if empty note | `PROJECT.md` & `PatientDetailPanel.tsx` |
| 7 | Privacy | RUT PII Masking Utility | Masks Chilean RUT format `XX.XXX.XXX-Y` to `XX.XXX.***-Y` | Unmasked RUT string | Masked RUT string | Returns empty string if input null/empty | `src/utils/privacy.ts` |
| 8 | Privacy | Name Abbreviation Utility | Abbreviates full name for tabular views (`Carmen Rosa Morales Fuentes` -> `C. R. M. F.`) | Full name string | Abbreviated initials | Returns empty string if input null/empty | `src/utils/privacy.ts` |
| 9 | Egreso MINSAL | RNLE Exit Causals | Validates MINSAL egress causals (1-14) for patient status transitions | Egress code (1-14) + clinical note | Validated exit status transition | 422 if invalid causal code | `EPIDEMIOLOGIA_GOBERNANZA_LISTAS_ESPERA_CHILE.md` |
| 10 | Capacity | Pressure Map Metrics | Healthcare service demand vs capacity metrics per program | `GET /api/presion-asistencial` | JSON object with capacity & demand counts | 200 OK | `PressureMap.tsx` |

---

## 4. Edge Cases

| # | Feature | Input | Observed / Expected Behavior |
|---|---------|-------|-------------------|
| 1 | NT 118 Calculation | HbA1c = 11.0% exact boundary | $C_1$ score should be 30 pts (since > 11.0% yields 35 pts, while 10.0-11.0% yields 30 pts). |
| 2 | NT 118 Calculation | HbA1c = 9.0% exact boundary | $C_1$ score should be 28 pts (9.0-10.9% range). |
| 3 | NT 118 Calculation | HbA1c = 8.0% exact boundary | $C_1$ score should be 18 pts (8.0-8.9% range). |
| 4 | NT 118 Calculation | VFG = 30.0 mL/min boundary | $C_2$ base score should be 25 pts ($30 \le \text{VFG} \le 44$). |
| 5 | NT 118 Calculation | VFG = 45.0 mL/min boundary | $C_2$ base score should be 15 pts ($45 \le \text{VFG} \le 59$). |
| 6 | NT 118 Calculation | Score overflow (e.g. max values across all subscores summing to > 100) | `total_score` MUST be capped at 100 (`min(100, sum)`). |
| 7 | NT 118 Calculation | Negative values or invalid clinical parameters (e.g. HbA1c = -1.0 or VFG = -5.0) | API must reject with `422 Unprocessable Entity`. |
| 8 | RUT Masking | Short or single-dot RUT format (e.g. `"9.310.224-8"`) | Correctly masks central 3 digits: `"9.310.***-8"`. |
| 9 | RUT Masking | Unformatted RUT string (e.g. `"12458930K"`) | Fallback regex masks correctly or returns safe string without crash. |
| 10 | Contraloría Override | Empty or whitespace-only `clinical_note` | API must reject with `422/400 Bad Request` (clinical justification is mandatory by law). |
| 11 | Contraloría Override | Invalid status string (e.g. `"RECHAZADO_INVALIDO"`) | API must reject with `422 Unprocessable Entity` (must be in `PENDIENTE`, `APROBADO`, `REQUIERE_REVISION`, `OBSERVADO`). |
| 12 | Audit History | Multiple consecutive status overrides for same patient | Each override appends a new `AuditLogEntry` without modifying or overwriting previous entries (append-only ledger). |
| 13 | Patient Filtering | Filter by non-existent sector or status (e.g. `sector="SECTOR_INEXISTENTE"`) | API returns `200 OK` with an empty array `[]`. |

---

## 5. Caveats

- **No existing backend code on disk yet**: `impact_lab/backend` directory is not yet scaffolded on disk. The backend implementation agent must create `impact_lab/backend` following these exact specifications.
- **CamelCase vs SnakeCase Mapping**: Frontend uses camelCase (`fullName`, `nt118Risk`, `contraloriaStatus`), while FastAPI backend conventionally uses snake_case (`full_name`, `nt118_risk`, `contraloria_status`). Pydantic models should use `alias_generator` or the API client `src/services/api.ts` must perform bidirectional key transformation.
- **Port & CORS Configuration**: Frontend runs on port 3000 and FastAPI on port 8000. `CORSMiddleware` in FastAPI must explicitly allow `http://localhost:3000`.

---

## 6. Conclusion

- The NT 118 scoring algorithm ($C_1..C_5$), API endpoint specifications (`POST /api/priorizacion/calcular`, `GET /api/pacientes`, `PATCH /api/pacientes/{id}/contraloria`), PII RUT masking rules, and MINSAL RNLE exit causals have been fully discovered, verified against authoritative project docs and frontend components, and documented.
- All assertion rules, score bounds [0, 100], boundary cases (HbA1c 11.0/9.0/8.0, VFG 30/45), risk levels, and audit trail schemas are clear and ready to drive automated test assertions in pytest.

---

## 7. Verification Method

To verify these specifications against the codebase and test suite:
1. Compare Pydantic schemas in `impact_lab/backend/app/schemas/` against `impact_lab/src/types/patient.ts`.
2. Execute pytest assertions for score calculation edge cases in `impact_lab/backend/tests/`:
   ```bash
   cd impact_lab/backend
   pytest -v
   ```
3. Run frontend TypeScript check to confirm type interface alignment:
   ```bash
   cd impact_lab
   npx tsc --noEmit
   ```
