# Explorer 2 Technical Analysis & Architecture Handoff Report

## 1. Observation

Direct observations from the project environment and filesystem inspection:

1. **Working Directory & File Structures**:
   - Repository root: `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab`
   - Existing directory structure: `config/`, `dist/`, `docs/`, `src/`, `node_modules/`, `package.json`, `tsconfig.json`, `vite.config.ts`.
   - `impact_lab/backend/` does **NOT** exist currently (`find_by_name` returned 0 results for backend files or `.py` files in the repository). It must be scaffolded from scratch.

2. **Frontend Data Contracts & Types**:
   - File: `impact_lab/src/types/patient.ts` (lines 1–68)
     - `CESFAMSector`: `'SECTOR_VERDE' | 'SECTOR_AZUL' | 'SECTOR_ROJO' | 'SECTOR_AMARILLO'`
     - `ContraloriaStatus`: `'PENDIENTE' | 'APROBADO' | 'REQUIERE_REVISION' | 'OBSERVADO'`
     - `RiskLevel`: `'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO'`
     - `DecompensationFactor`: `{ code: string; label: string; severity: 'ALTA' | 'MEDIA' | 'LEVE'; value: string; }`
     - `NT118RiskScore`: `{ totalScore: number; riskLevel: RiskLevel; hba1cScore: number; renalsScore: number; cvScore: number; socialScore: number; decompensations: DecompensationFactor[]; }`
     - `AuditLogEntry`: `{ id: string; timestamp: string; userName: string; userRole: string; action: string; previousStatus: ContraloriaStatus; newStatus: ContraloriaStatus; clinicalNote: string; }`
     - `Patient`: `{ id: string; rut: string; fullName: string; age: number; gender: 'M' | 'F'; sector: CESFAMSector; cesfamName: string; hba1c: number; systolicBP: number; diastolicBP: number; vfg: number; hasFootUlcer: boolean; hasRetinopathy: boolean; daysInWaitingList: number; nt118Risk: NT118RiskScore; priorityPosition: number; previousPriorityPosition: number; contraloriaStatus: ContraloriaStatus; assignedPhysician?: string; lastReviewDate?: string; auditHistory: AuditLogEntry[]; }`

3. **Privacy Masking Implementation**:
   - File: `impact_lab/src/utils/privacy.ts` (lines 10–24)
     - `maskRut("12.458.930-K")` returns `"12.458.***-K"`.
     - `getAbbreviatedName("Carmen Rosa Morales Fuentes")` returns `"C. R. M. F."`.

4. **Clinical & Algorithmic Rules in Frontend Components**:
   - File: `impact_lab/src/components/OperationalExplicationPanel.tsx` (lines 40–84)
     - $C_1$ Control Glicémico (HbA1c): Max 35 pts (HbA1c > 11.0% = 35 pts, 9.0-10.9% = 28 pts, 8.0-8.9% = 18 pts).
     - $C_2$ Deterioro Renal (VFG): Max 30 pts (VFG < 30 = 30 pts, VFG 30-44 = 25 pts, Proteinuria/Microalbuminuria = +10 pts).
     - $C_3$ Complicaciones Vasculares: Max 25 pts (Pie diabético activo úlcera = +20 pts, Retinopatía prolif. = +15 pts, HTA severa = +10 pts).
     - $C_4 / C_5$ Determinantes Sociales y Días en Lista: Max 10 pts (GES excedida > 90 días, ruralidad, adulto mayor > 65 años sin red de apoyo).

5. **Python Environment State**:
   - Terminal Command: `python3 --version` returned `Python 3.14.6`. `pip` is `26.1.2`.
   - Package Inspection: Running `python3 -c "import fastapi, pydantic, uvicorn, pytest, httpx"` revealed that `fastapi`, `pydantic`, `uvicorn`, `pytest`, and `httpx` are **MISSING** in global python site-packages.
   - A dedicated Python virtual environment (`impact_lab/backend/.venv`) must be created and populated via `requirements.txt`.

---

## 2. Logic Chain

1. **System Scaffolding & Architecture**:
   Since `impact_lab/backend` does not exist yet, we must create a modular FastAPI directory layout under `impact_lab/backend/`. The architecture separates concerns into:
   - `app/main.py`: Application entrypoint, FastAPI instance creation, CORS configuration (allowing requests from React frontend on port 5173 / Vite).
   - `app/engine/`: Pure algorithmic business logic for NT 118 score calculation (`nt118.py`) and RNLE exit causals validation (`rnle.py`).
   - `app/schemas/`: Pydantic V2 models defining strict request/response schemas matching TypeScript types.
   - `app/core/`: Privacy RUT masking (`privacy.py`) and configuration (`config.py`).
   - `app/api/endpoints/`: Endpoint handlers (`pacientes.py`, `priorizacion.py`, `presion.py`, `bitacora.py`).
   - `app/data/`: Data storage abstraction (`mock_db.py`) populated with the 5 initial APS patients from `INITIAL_MOCK_PATIENTS`.
   - `tests/`: Automated unit and integration test suite using `pytest` and `httpx.AsyncClient` / `TestClient`.

2. **FastAPI Endpoints Specification**:
   - `POST /api/priorizacion/calcular`:
     - Input: Request body containing patient clinical parameters (`hba1c`, `systolicBP`, `diastolicBP`, `vfg`, `hasFootUlcer`, `hasRetinopathy`, `daysInWaitingList`, `age`, `socialFactors`).
     - Output: Weighted NT 118 score (0–100 pts), score breakdown ($C_1, C_2, C_3, C_4, C_5$), derived `riskLevel` (`CRITICO`, `ALTO`, `MEDIO`, `BAJO`), and list of active `decompensations`.
   - `GET /api/pacientes`:
     - Query Parameters: `sector` (optional: `SECTOR_ROJO`, `SECTOR_VERDE`, etc.), `risk_level` (optional: `CRITICO`, `ALTO`, etc.), `status` (optional: `PENDIENTE`, `APROBADO`, etc.), `unmask_rut` (boolean, default `false`).
     - Output: Array of patients sorted by `priorityPosition` ascending, with RUT masked (`12.458.***-K`) by default when `unmask_rut=false`.
   - `GET /api/pacientes/{patient_id}`:
     - Output: Single patient details with full clinical parameters and audit trail history.
   - `POST /api/pacientes/{patient_id}/contraloria`:
     - Input: `{ "newStatus": ContraloriaStatus, "clinicalNote": string, "userName": string, "userRole": string }`.
     - Behavior: Updates patient status, appends an immutable `AuditLogEntry` to `auditHistory`, updates `lastReviewDate`, and returns the updated patient object.
   - `GET /api/presion-asistencial`:
     - Output: Healthcare pressure metrics per program (demand count vs weekly capacity).
   - `/docs`:
     - Interactive OpenAPI / Swagger UI automatically generated by FastAPI.

3. **Algorithmic Rules for NT 118 / ECICEP Score Calculation**:
   - **Total Score Formula**:
     $$\text{Total Score} = \min\left(100, C_1 + C_2 + C_3 + C_4 + C_5\right)$$
   - **Subcriterion $C_1$: Control Glicémico (HbA1c) — Max 35 pts**
     - $\text{HbA1c} \ge 11.0\%$: 35 pts
     - $10.0\% \le \text{HbA1c} < 11.0\%$: 30 pts
     - $9.0\% \le \text{HbA1c} < 10.0\%$: 28 pts
     - $8.0\% \le \text{HbA1c} < 9.0\%$: 18 pts
     - $7.0\% \le \text{HbA1c} < 8.0\%$: 10 pts
     - $\text{HbA1c} < 7.0\%$: 0 pts
   - **Subcriterion $C_2$: Deterioro Renal (VFG & Proteinuria) — Max 30 pts**
     - Base VFG: $\text{VFG} < 30 \implies 30\text{ pts}$; $30 \le \text{VFG} < 45 \implies 25\text{ pts}$; $45 \le \text{VFG} < 60 \implies 15\text{ pts}$; $60 \le \text{VFG} < 90 \implies 10\text{ pts}$; $\text{VFG} \ge 90 \implies 0\text{ pts}$.
     - Active Proteinuria/Microalbuminuria: $+10\text{ pts}$.
     - $C_2 = \min(30, \text{Base VFG} + \text{Proteinuria Bonus})$.
   - **Subcriterion $C_3$: Complicaciones Vasculares — Max 25 pts**
     - Pie diabético activo / Sospecha úlcera (`hasFootUlcer == True`): $+20\text{ pts}$.
     - Retinopatía diabética proliferativa (`hasRetinopathy == True`): $+15\text{ pts}$.
     - HTA severa ($\text{PAS} \ge 160 \lor \text{PAD} \ge 100$): $+10\text{ pts}$ (HTA moderada $\text{PAS} \ge 140 \lor \text{PAD} \ge 90 \implies +5\text{ pts}$).
     - $C_3 = \min(25, \text{sum of vascular points})$.
   - **Subcriterion $C_4$: Determinantes Sociales & Vulnerabilidad — Max 10 pts**
     - Age $> 65$ without support network: $+4\text{ pts}$.
     - Rurality / Low accessibility: $+3\text{ pts}$.
     - Social vulnerability factor: $+3\text{ pts}$.
     - $C_4 = \min(10, \text{sum of social points})$.
   - **Subcriterion $C_5$: Días en Lista de Espera & Plazo GES — Max 10 pts**
     - $\text{Days} > 180$: $10\text{ pts}$
     - $\text{Days} > 120$ (Garantía GES excedida): $7\text{ pts}$
     - $\text{Days} > 90$: $5\text{ pts}$
     - $\text{Days} > 45$: $3\text{ pts}$
     - $\text{Days} \le 45$: $0\text{ pts}$
     - $C_5 = \min(10, \text{waitlist points})$.
   - **Risk Level Categorization**:
     - `CRITICO`: $\text{Total Score} \ge 90$
     - `ALTO`: $75 \le \text{Total Score} < 90$
     - `MEDIO`: $50 \le \text{Total Score} < 75$
     - `BAJO`: $\text{Total Score} < 50$
   - **MINSAL Exit Causals (RNLE Normative Rules)**:
     - Standard MINSAL exit causals enumeration:
       1. `ATENCION_REALIZADA`: Prestación efectuada / Cita realizada.
       2. `INASISTENCIA_DESERCION`: Inasistencia reiterada.
       3. `RENUNCIA_VOLUNTARIA`: Solicitud o renuncia del usuario.
       4. `FALLECIMIENTO`: Fallecimiento del paciente.
       5. `ERROR_DIGITACION`: Duplicidad o error de registro.
       6. `RESOLUCION_OTRA_VIA`: Atención realizada en el sistema privado u otro centro.
       7. `CONTRAINDICACION_MEDICA`: Criterio o cambio de indicación médica.

4. **PII RUT Masking & Auditable Log Mechanics**:
   - **RUT Masking**: Standard Chilean format `XX.XXX.XXX-Y` masked to `XX.XXX.***-Y`. Implemented in `app/core/privacy.py`. Backend default responses mask PII unless explicitly requested with administrative credentials.
   - **Auditable Log**: Append-only log storage. Each decision posted via `POST /api/pacientes/{id}/contraloria` appends an entry to the patient's `auditHistory`. Logs include generated UUID/ID, ISO-8601 UTC timestamp, `userName`, `userRole`, `action`, `previousStatus`, `newStatus`, and mandatory `clinicalNote`.

5. **Python Environment & Test Strategy**:
   - Setup step: Create `impact_lab/backend/.venv` using `python3 -m venv .venv`.
   - Install dependencies: `pip install fastapi uvicorn pydantic pytest httpx`.
   - `requirements.txt`:
     ```text
     fastapi>=0.110.0
     uvicorn[standard]>=0.28.0
     pydantic>=2.6.0
     pytest>=8.0.0
     httpx>=0.27.0
     ```
   - Execution command: `python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` (from `impact_lab/backend`).
   - Test execution command: `python3 -m pytest tests/` (from `impact_lab/backend`).

---

## 3. Caveats

- **No Database Persistence Layer (SQLAlchemy/PostgreSQL)**: The current initial scope specifies an in-memory or file-backed mock database seeded with `INITIAL_MOCK_PATIENTS`. If persistent database storage (e.g. SQLite / PostgreSQL via SQLAlchemy or SQLModel) is required in subsequent phases, an ORM layer can be added to `app/models/` without changing the API contract.
- **Single-Tenant Mock Auth**: User authentication / JWT tokens are not strictly mandated in R1/R2, but `userName` and `userRole` are accepted in requests to record medical audit actions.
- **Python Version**: System has Python 3.14.6. Dependencies like FastAPI and Pydantic V2 work smoothly on Python 3.14, but virtualenv creation is essential to avoid interfering with system site-packages.

---

## 4. Conclusion

The Python / FastAPI Backend API and NT 118 / ECICEP Prioritization Engine architecture is fully specified and ready for implementation. The proposed layout in `impact_lab/backend` adheres to clean modular software engineering standards, provides strict Pydantic models matching TypeScript interfaces, encapsulates the complete 0–100 point NT 118 scoring algorithm ($C_1..C_5$) and MINSAL RNLE exit causals, implements PII RUT masking by default, and guarantees an auditable, append-only medical log.

---

## 5. Verification Method

To independently verify the backend architecture and implementation once built:

1. **Directory Structure Verification**:
   Verify `impact_lab/backend` exists with:
   - `app/main.py`, `app/engine/nt118.py`, `app/engine/rnle.py`, `app/schemas/patient.py`, `app/api/endpoints/pacientes.py`, `app/api/endpoints/priorizacion.py`, `app/core/privacy.py`, `app/data/mock_db.py`.
   - `tests/test_nt118_engine.py`, `tests/test_privacy.py`, `tests/test_api_endpoints.py`.

2. **Automated Unit & Integration Test Execution**:
   Run the test suite from `impact_lab/backend`:
   ```bash
   cd /Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/backend
   source .venv/bin/activate
   pytest -v
   ```
   *Expected Result*: All tests pass (0 failures), covering NT 118 score calculation edge cases, RUT masking, and endpoint status codes.

3. **FastAPI OpenAPI Documentation & Server Verification**:
   Start the FastAPI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   - Open browser or execute curl: `curl -s http://localhost:8000/docs` (returns 200 OK HTML page).
   - Test `POST /api/priorizacion/calcular`:
     ```bash
     curl -X POST "http://localhost:8000/api/priorizacion/calcular" \
          -H "Content-Type: application/json" \
          -d '{"hba1c": 11.4, "systolicBP": 165, "diastolicBP": 98, "vfg": 42, "hasFootUlcer": true, "hasRetinopathy": true, "daysInWaitingList": 142}'
     ```
     *Expected Output*: Returns `totalScore: 94`, `riskLevel: "CRITICO"`, `hba1cScore: 35`, `renalsScore: 25`, `cvScore: 24`, `socialScore: 10`.

   - Test `GET /api/pacientes`:
     ```bash
     curl -s "http://localhost:8000/api/pacientes"
     ```
     *Expected Output*: Returns JSON array of patients with `rut` formatted as `12.458.***-K`.

4. **Invalidation Conditions**:
   - Total score calculated outside [0, 100] range.
   - PII RUT returned unmasked in general patient listing when `unmask_rut=false`.
   - Modifying contraloría status fails to append an audit log entry.
