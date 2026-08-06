# Technical Analysis & Handoff Report - Frontend UI & Mocks Investigation

**Agent**: Explorer 1 (Frontend UI & Mocks Investigator)  
**Date**: 2026-08-05  
**Target Codebase**: `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab`

---

## 1. Observation

### 1.1 Directory & File Layout
The frontend project `impact_lab` is a single-page React 18 application built with TypeScript, Vite, and Tailwind CSS v4.
- Root files:
  - `package.json`: Dependencies include `react` (v18.2.0), `react-dom` (v18.2.0), `lucide-react` (v0.344.0), `@tailwindcss/vite` (v4.0.0), `tailwindcss` (v4.0.0), `typescript` (v5.2.2), `vite` (v5.1.6).
  - `tsconfig.json`: Strict mode enabled (`"strict": true`), bundler resolution (`"moduleResolution": "bundler"`), no emit (`"noEmit": true`).
  - `vite.config.ts`: Configures `@vitejs/plugin-react` and `@tailwindcss/vite`, dev server port 3000.
- Source files (`src/`):
  - `src/main.tsx` (line 6): Renders `<App />` under `React.StrictMode`.
  - `src/App.tsx` (lines 1-179): Main container managing local state `patients`, `activeTab`, `cesfamName`, `selectedPatient`, and `isExplicationOpen`.
  - `src/types/patient.ts` (lines 1-68): Core domain types (`CESFAMSector`, `ContraloriaStatus`, `RiskLevel`, `DecompensationFactor`, `NT118RiskScore`, `AuditLogEntry`, `Patient`).
  - `src/data/mockPatients.ts` (lines 1-212): Hardcoded initial mock array `INITIAL_MOCK_PATIENTS` containing 5 detailed clinical patient records.
  - `src/utils/privacy.ts` (lines 1-35): Privacy utilities `maskRut` (e.g. `12.458.***-K`) and `getAbbreviatedName`.
  - `src/components/Header.tsx` (lines 1-94): Top navigation bar with CESFAM selector dropdown, critical count indicator, pending review badge, and user profile.
  - `src/components/Sidebar.tsx` (lines 1-116): Left sidebar with module tabs (Torre de Control, Matriz Riesgo, Bitácora Contraloría, Importador SIGTE), CESFAM sector counters, and algorithm explication trigger button.
  - `src/components/KPICards.tsx` (lines 1-92): KPI summary grid (Total Pacientes, Riesgo Crítico, Descompensados HbA1c > 10% / Pie, Pendiente Contraloría, Aprobados y Citados).
  - `src/components/PressureMap.tsx` (lines 1-101): Health service pressure grid comparing demand count against weekly capacity across 4 care programs.
  - `src/components/PrioritizedTable.tsx` (lines 1-323): Interactive patient table with search (RUT / Name), multi-parameter filters (Sector, Risk Level, Contraloría Status), RUT privacy toggle, position trend indicators (`ArrowUp` / `ArrowDown`), and action trigger for patient detail drawer.
  - `src/components/PatientDetailPanel.tsx` (lines 1-256): Slide-over drawer displaying patient demographic details, NT 118 score breakdown ($C_1..C_4$), active decompensation factors, biomedical parameters grid, Contraloría override form (updating status and appending clinical notes), and audit trail log.
  - `src/components/OperationalExplicationPanel.tsx` (lines 1-110): Modal explaining NT 118 risk score weighting rules ($C_1..C_5$) and human-in-the-loop clinical override authority.

### 1.2 TypeScript Compilation Check
Execution of `npx tsc --noEmit` in `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab`:
- Result: **Exit Code 0** (0 compilation errors).
- All types and interfaces across `src/types/patient.ts` and components are strictly typed and compatible.

---

## 2. Logic Chain

### 2.1 Domain Model & Scoring Breakdown ($C_1..C_5$)
The algorithm for risk score calculation (Norma Técnica 118 MINSAL) weighs 5 subcriteria totaling 100 points:
1. **$C_1$ — Control Glicémico (HbA1c)** (`hba1cScore`, max 35 pts):
   - HbA1c > 11.0% (35 pts, severity: ALTA)
   - HbA1c 9.0% - 10.9% (28 pts)
   - HbA1c 8.0% - 8.9% (18 pts)
2. **$C_2$ — Deterioro Renal (VFG & Microalbuminuria)** (`renalsScore`, max 30 pts):
   - VFG < 30 mL/min (30 pts)
   - VFG 30 - 44 mL/min (25 pts)
   - Proteinuria / Microalbuminuria activa (+10 pts)
3. **$C_3$ — Complicaciones Vasculares & PA** (`cvScore`, max 25 pts):
   - Pie diabético activo / úlcera (+20 pts)
   - Retinopatía diabética proliferativa (+15 pts)
   - Hipertensión sistólica/diastólica severa (+10 pts)
4. **$C_4$ — Determinantes Sociales & Vulnerabilidad** (`socialScore`, max 10 pts):
   - Ruralidad, edad > 65 años, ausencia de red de apoyo.
5. **$C_5$ — Criterio Oportunidad & Días en Lista de Espera** (`daysInWaitingList` / GES):
   - Días acumulados en lista de espera y superación de garantías de oportunidad GES (>90/120 días), impactando posición relativa.

In `src/types/patient.ts`, the frontend representation is:
```typescript
export interface NT118RiskScore {
  totalScore: number;
  riskLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  hba1cScore: number;
  renalsScore: number;
  cvScore: number;
  socialScore: number;
  decompensations: DecompensationFactor[];
}
```

### 2.2 Data Flow & Mock Dependency Analysis
Currently:
- `App.tsx` imports `INITIAL_MOCK_PATIENTS` from `./data/mockPatients` and stores it in React state `patients`.
- All updates (e.g. updating contraloría status in `PatientDetailPanel.tsx`) update local React state only.
- Missing element: `src/services/api.ts` does not exist yet.

To replace mock data with backend API calls:
1. Create `src/services/api.ts` using standard `fetch` API.
2. Define API endpoints & serialization layer (snake_case from FastAPI <-> camelCase for React TS types).
3. Connect `App.tsx` `useEffect` to fetch patients on component mount and when CESFAM sector or filter parameters change.
4. Replace local state mutation in `handleUpdateStatus` with an API `PATCH` call to `/api/pacientes/{id}/contraloria`.

### 2.3 Required Backend API Data Shapes & Contracts

#### Endpoint 1: `POST /api/priorizacion/calcular`
Used to compute or recalculate the NT 118 score for a patient given clinical inputs.

- **Request Payload (`application/json`)**:
  ```json
  {
    "patient_id": "PAT-001",
    "hba1c": 11.4,
    "systolic_bp": 165,
    "diastolic_bp": 98,
    "vfg": 42,
    "has_foot_ulcer": true,
    "has_retinopathy": true,
    "days_in_waiting_list": 142,
    "age": 67,
    "gender": "F",
    "sector": "SECTOR_ROJO",
    "cesfam_name": "CESFAM Carol Urzúa"
  }
  ```

- **Response Payload (`application/json`)**:
  ```json
  {
    "total_score": 94,
    "risk_level": "CRITICO",
    "subscores": {
      "c1_hba1c_score": 35,
      "c2_renals_score": 25,
      "c3_cv_score": 24,
      "c4_social_score": 10
    },
    "decompensations": [
      {
        "code": "HBA1C_CRITICA",
        "label": "HbA1c > 11.0% Severa",
        "severity": "ALTA",
        "value": "11.4%"
      },
      {
        "code": "PIE_DIABETICO",
        "label": "Sospecha Ulcera Activa",
        "severity": "ALTA",
        "value": "Grado 2"
      },
      {
        "code": "VFG_DISMINUIDA",
        "label": "Enfermedad Renal Etapa 3b",
        "severity": "MEDIA",
        "value": "42 mL/min"
      }
    ]
  }
  ```

#### Endpoint 2: `GET /api/pacientes`
Used to fetch the prioritized waiting list for a CESFAM establishment.

- **Query Parameters**:
  - `cesfam_name` (optional string, e.g. `"CESFAM Carol Urzúa"`)
  - `sector` (optional string: `"SECTOR_ROJO"`, `"SECTOR_VERDE"`, `"SECTOR_AZUL"`, `"SECTOR_AMARILLO"`, `"ALL"`)
  - `status` (optional string: `"PENDIENTE"`, `"APROBADO"`, `"REQUIERE_REVISION"`, `"OBSERVADO"`, `"ALL"`)
  - `risk_level` (optional string: `"CRITICO"`, `"ALTO"`, `"MEDIO"`, `"BAJO"`, `"ALL"`)

- **Response Payload (`application/json` array)**:
  ```json
  [
    {
      "id": "PAT-001",
      "rut": "12.458.930-K",
      "full_name": "Carmen Rosa Morales Fuentes",
      "age": 67,
      "gender": "F",
      "sector": "SECTOR_ROJO",
      "cesfam_name": "CESFAM Carol Urzúa",
      "hba1c": 11.4,
      "systolic_bp": 165,
      "diastolic_bp": 98,
      "vfg": 42,
      "has_foot_ulcer": true,
      "has_retinopathy": true,
      "days_in_waiting_list": 142,
      "priority_position": 1,
      "previous_priority_position": 5,
      "contraloria_status": "PENDIENTE",
      "assigned_physician": "Dr. Alejandro Silva (Contralor)",
      "last_review_date": null,
      "nt118_risk": {
        "total_score": 94,
        "risk_level": "CRITICO",
        "hba1c_score": 35,
        "renals_score": 25,
        "cv_score": 24,
        "social_score": 10,
        "decompensations": [
          {
            "code": "HBA1C_CRITICA",
            "label": "HbA1c > 11.0% Severa",
            "severity": "ALTA",
            "value": "11.4%"
          }
        ]
      },
      "audit_history": [
        {
          "id": "LOG-101",
          "timestamp": "2026-08-04 09:15",
          "user_name": "Algoritmo NT 118",
          "user_role": "Sistema IA",
          "action": "Repriorización Automática",
          "previous_status": "PENDIENTE",
          "new_status": "PENDIENTE",
          "clinical_note": "Paciente elevada a posición 1 por descompensación HbA1c 11.4% y presencia de pie diabético activo."
        }
      ]
    }
  ]
  ```

#### Endpoint 3: `PATCH /api/pacientes/{id}/contraloria`
Used when a medical auditor overrides or approves a patient's status.

- **Request Body**:
  ```json
  {
    "new_status": "APROBADO",
    "clinical_note": "Aprobado para cita prioritaria con Nefrología/Diabetología",
    "physician_name": "Dr. Alejandro Silva",
    "physician_role": "Médico Contralor APS"
  }
  ```

- **Response Body**: Updated full `Patient` JSON object.

---

## 3. Caveats

1. **No Existing Backend Code**: `impact_lab/backend` does not exist yet. Backend endpoints must be built by the backend implementation agent matching these exact schemas.
2. **Vite Proxy / CORS**: When connecting frontend to FastAPI backend running locally (e.g. on port 8000), CORS middleware must be configured on FastAPI or a proxy rule added in `vite.config.ts` (`server.proxy`).
3. **No External HTTP Client Library**: `package.json` currently does not include `axios`. Native `window.fetch` is recommended and supported out of the box in modern browsers and Node 18+.

---

## 4. Conclusion

- The React 18 frontend in `impact_lab` is well-structured, modular, and fully typed in TypeScript.
- All core components (`PrioritizedTable.tsx`, `PatientDetailPanel.tsx`, `PressureMap.tsx`, `KPICards.tsx`, `Header.tsx`, `Sidebar.tsx`) are already operational with `INITIAL_MOCK_PATIENTS`.
- TypeScript compilation is clean (`npx tsc --noEmit` succeeds with 0 errors).
- Seamless transition from mock data to API require creating `src/services/api.ts` and updating `App.tsx` state management to invoke async API methods.

---

## 5. Verification Method

To independently verify these findings:
1. Run `npx tsc --noEmit` inside `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab` to verify clean compilation.
2. Inspect `src/types/patient.ts` to confirm interface definitions for `Patient`, `NT118RiskScore`, `CESFAMSector`, `ContraloriaStatus`, and `AuditLogEntry`.
3. Check `src/App.tsx` line 14 to verify reliance on `INITIAL_MOCK_PATIENTS`.
4. Inspect `PrioritizedTable.tsx`, `PatientDetailPanel.tsx`, and `PressureMap.tsx` to confirm prop signatures and state handlers.
