# Handoff Report — Explorer Frontend

## 1. Observation
- **Codebase location**: `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/src/`
- **Build verification command**: `npm run build` executed at `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab` (Exit code: 0, 0 TypeScript errors).
- **Exact File Observations**:
  1. `src/components/KPICards.tsx` (Lines 10-15):
     ```ts
     const totalCount = patients.length;
     const criticalCount = patients.filter(p => p.nt118Risk.riskLevel === 'CRITICO').length;
     const highDecompensatedCount = patients.filter(p => p.hba1c >= 10.0 || p.hasFootUlcer).length;
     const pendingContraloriaCount = patients.filter(p => p.contraloriaStatus === 'PENDIENTE').length;
     const approvedCount = patients.filter(p => p.contraloriaStatus === 'APROBADO').length;
     ```
     *Missing*: Calculation and card display for average NT 118 score as required by R2 line 57-58.
  2. `src/types/patient.ts` (Lines 18-26) & `src/components/PatientDetailPanel.tsx` (Lines 81-98):
     ```ts
     export interface NT118RiskScore {
       totalScore: number;
       riskLevel: RiskLevel;
       hba1cScore: number;
       renalsScore: number; // VFG & Proteinuria
       cvScore: number;    // Hipertensión & eventos previos
       socialScore: number; // Determinantes sociales y ruralidad
       decompensations: DecompensationFactor[];
     }
     ```
     *Missing*: Subscore `daysScore` (C5 Días en Lista de Espera) is omitted from the interface and from the 4-card grid in `PatientDetailPanel.tsx`, leaving only 4 subscores displayed instead of all 5 required by R2 line 52.
  3. `src/types/patient.ts` (Lines 3-7) & `src/components/PatientDetailPanel.tsx` (Lines 146-190):
     `ContraloriaStatus` is defined as `'PENDIENTE' | 'APROBADO' | 'REQUIERE_REVISION' | 'OBSERVADO'`.
     In `ORIGINAL_REQUEST.md` (Lines 33-34), backend API expects medical actions: `APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE`.
     *Mismatch*: Frontend lacks `RECHAZADO` and `DERIVADO` status options.
  4. `src/components/PatientDetailPanel.tsx` & `src/App.tsx` (Lines 19-20, 197-201):
     When a patient is selected, `setSelectedPatient` is called in `App.tsx`. There is no `useEffect` or trigger calling `calcularNT118()` (`POST /api/priorizacion/calcular`) to refresh score on selection as specified in R3 step 2.
  5. `src/components/PressureMap.tsx` (Lines 38-43):
     ```ts
     return [
       { id: '1', name: 'DM2 / Diabetología APS', demandCount: 24, weeklyCapacity: 8, unit: 'cupos/sem' },
       ...
     ];
     ```
     Fallback branch uses hardcoded 24 for DM2 demand count if patients array is empty.

## 2. Logic Chain
1. **Observation 1** shows that `KPICards.tsx` only measures count metrics and omits average score. R2 line 57-58 explicitly requires "average NT 118 score — all recomputed reactively when the patient list updates." Therefore, `KPICards.tsx` needs an `averageNT118Score` calculation and display card.
2. **Observation 2** shows that `NT118RiskScore` in `patient.ts` and `PatientDetailPanel.tsx` only contains 4 subscores. R1 lines 37-38 defines 5 sub-criteria (C1 HbA1c, C2 VFG, C3 CV, C4 Social, C5 Days in waiting list) and R2 line 52 mandates "NT 118 score breakdown (all 5 subscores)". Therefore, `NT118RiskScore` must include `daysScore` and `PatientDetailPanel.tsx` must render 5 subscore cards.
3. **Observation 3** shows a discrepancy between backend API expected `new_status` (`APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE`) and frontend status type/buttons (`PENDIENTE`, `APROBADO`, `REQUIERE_REVISION`, `OBSERVADO`). Submitting non-standard statuses to the backend FastAPI PATCH endpoint could cause validation errors. Alignment is required.
4. **Observation 4** shows that selecting a patient in `App.tsx` does not invoke `POST /api/priorizacion/calcular`. R3 step 2 states "User selects a patient -> opens detail panel -> triggers POST /api/priorizacion/calcular with that patient's clinical data -> panel updates with fresh NT 118 score." Therefore, an async calculation call must be wired into patient selection.
5. **Observation 5** shows that `PressureMap.tsx` defaults to static counts (including 24 for DM2) when the dataset is empty. The acceptance criteria explicitly state: "`PressureMap` card for 'DM2 / Diabetología APS' shows a non-zero demand count derived from the loaded patient list (not the hardcoded 24)." Therefore, the dynamic calculation must always derive from `patients` array without static fallbacks.

## 3. Caveats
- No caveats. All frontend files (`App.tsx`, `types/patient.ts`, `services/api.ts`, `data/mockPatients.ts`, and all UI components under `src/components/`) were inspected directly.

## 4. Conclusion
The frontend is structurally sound, type-checks cleanly (`npm run build` exits code 0), and has a robust offline fallback store (`fallbackPatientsStore`). However, 6 specific code adjustments are required to achieve full compliance with R2/R3 specifications before frontend implementation can be declared complete:
1. Add `averageNT118Score` to `KPICards.tsx`.
2. Add `daysScore` (C5) to `NT118RiskScore` interface, mapper, local calculator, and render 5 subscore cards in `PatientDetailPanel.tsx`.
3. Align `ContraloriaStatus` and detail panel buttons to include `RECHAZADO` and `DERIVADO`.
4. Trigger `calcularNT118` upon opening `PatientDetailPanel`.
5. Enhance `auditHistory` rendering in `PatientDetailPanel` to show `previousStatus -> newStatus` transition badges.
6. Ensure `PressureMap.tsx` computes counts dynamically without defaulting to hardcoded mock numbers.

## 5. Verification Method
1. **TypeScript Build**: Run `npm run build` in `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab`. It must exit with code 0.
2. **Files to Inspect for Verification**:
   - `src/types/patient.ts` — verify `NT118RiskScore` contains `daysScore` and `ContraloriaStatus` includes `RECHAZADO` / `DERIVADO`.
   - `src/services/api.ts` — verify `mapBackendScoreToFrontend` and `calculateLocalNT118Score` populate `daysScore`.
   - `src/components/KPICards.tsx` — verify average score card is rendered.
   - `src/components/PatientDetailPanel.tsx` — verify 5 subscore cards, calculation trigger on open, decision buttons for `APROBADO`/`RECHAZADO`/`DERIVADO`/`PENDIENTE`, and timeline status transition badges.
   - `src/components/PressureMap.tsx` — verify pure dynamic demand calculation.
