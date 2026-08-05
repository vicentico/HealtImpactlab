/**
 * Tipos de datos para la Torre de Control APS — CESFAM
 * Módulo de Gestión de Listas de Espera y Contraloría Médica Auditable
 * Marco Normativo MINSAL (Norma Técnica N°118 / Ley 20.584 / Ley 21.719)
 */

export type UserRole = 
  | 'MEDICO_CONTRALOR'   // Médico Contralor / Gestor de Casos (Máxima visibilidad clínica y de gestión)
  | 'MEDICO_APS'         // Médico APS (Atención directa en CESFAM/Sector)
  | 'ENFERMERIA_APS'     // Enfermería APS (Seguimiento, triaje, educación)
  | 'ADMINISTRATIVO'      // Administrativo / Gestor de Lista (Tiempos, citas, clínica seudonimizada)
  | 'AUDITOR_LECTURA';    // Perfil Lectura / Auditoría Clínica (Solo lectura)

export interface UserRoleInfo {
  id: UserRole;
  label: string;
  description: string;
  badge: string;
  badgeColor: string;
  badgeClass?: string;
  canSeeFullIdentity: boolean;
  canSeeDetailedBiomarkers: boolean;
  canPerformContralorActions: boolean;
  canModifyPriorities: boolean;
  canUnmaskData?: boolean;
}

export type ClinicalRiskLevel = 'MUY_ALTA' | 'ALTA' | 'MEDIA' | 'PROGRAMADA';

export type PatientStatus = 
  | 'REVISION_INMEDIATA'
  | 'PRIORIZADO_VALIDADO'
  | 'DERIVADO_NIVEL_2'
  | 'AJUSTE_CONTRALOR'
  | 'CITA_AGENDADA';

export type APSProgramCategory = 
  | 'DIABETES_DM2'
  | 'HIPERTENSION_HTA'
  | 'SALUD_MENTAL'
  | 'RESPIRATORIO_ERA_IRA'
  | 'CARDIOVASCULAR'
  | 'MULTIMORBIDO_G3';

export type ECICEPTier = 'G1_BAJO' | 'G2_MODERADO' | 'G3_ALTO_COMPLEJO';

export interface AppliedRule {
  ruleId: string;
  code: string; // e.g. "ECICEP-DM2", "NT118-RV", "BC-01"
  name: string;
  description: string;
  pointsAdded: number;
  category: 'RIESGO_VITAL' | 'BRECHA_CONTROL' | 'PROGRAMA_PRIORITARIO' | 'TIEMPO_ESPERA' | 'VULNERABILIDAD';
}

export interface PatientClinicalFactors {
  vitalRisk: boolean;
  biomarkerAgravation: boolean; // e.g., HbA1c > 10%, VFG < 45
  monthsWithoutControl: number; // Meses sin control en CESFAM
  comorbiditiesCount: number;
  functionalDecline: boolean;
  socialVulnerabilityScore: number; // 0-10 (RSH)
  adherenceStatus: 'ADHERENTE' | 'PARCIAL' | 'INADHERENTE_ABANDONO';
  // DM2 Specific Biomarkers
  hbA1c?: number; // %
  rac?: string; // Razón Albúmina/Creatinina mg/g
  vfg?: number; // VFG ml/min
  bloodPressure?: string; // e.g. "145/90"
  bmi?: number; // IMC
  recentEmergencyEvents?: string[]; // Atenciones SAPU / Urgencia / Altas <30d
}

export interface Patient {
  id: string; // ID / UUID
  code: string; // Cód FCE e.g. "DM2-001"
  initials: string; // e.g. "M.E.S."
  partialRut: string; // RUT con enmascaramiento e.g. "14.892.***-*"
  rut: string; // RUT Completo (solo visible en Ficha Detallada)
  name: string; // Nombre Completo
  age: number;
  gender: 'M' | 'F' | 'Otro';
  cesfamName: string; // e.g. "CESFAM Dr. Aníbal Ariztía"
  sector: 'Verde' | 'Azul' | 'Rojo' | 'Amarillo' | 'Transversal';
  careTeam: string; // e.g. "Equipo de Cabecera Sector Verde"
  program: APSProgramCategory;
  ecicepTier: ECICEPTier; // G1, G2, G3 ECICEP
  primaryPathology: string; // e.g. "Diabetes Mellitus Tipo 2 con Nefropatía Incipiente"
  isGES: boolean;
  daysOnWaitlist: number; // Días en lista no GES / APS
  controlBreachMonths: number; // Meses desfasados de norma técnica ECICEP
  clinicalRiskLevel: ClinicalRiskLevel;
  clinicalRiskScore: number; // 0 a 100
  originalPosition: number;
  currentPosition: number;
  positionDelta: number; // +12, -3, 0
  primaryReason: string; // Motivo clínico de la priorización ECICEP
  clinicalFactors: PatientClinicalFactors;
  auditableJustification: string;
  rulesApplied: AppliedRule[];
  estimatedAppointmentDate: string;
  status: PatientStatus;
  contralorValidation: {
    isValidated: boolean;
    validatedBy: string | null; // e.g. "Dr. Manuel Contreras (Contralor APS)"
    timestamp: string | null;
    notes: string | null;
    actionTaken: 'APROBADO' | 'REORDENADO' | 'DERIVADO_HOSPITAL' | 'PENDIENTE';
  };
  lastUpdated: string;
}

export interface SectorCoverageMetric {
  sectorName: 'Verde' | 'Azul' | 'Rojo' | 'Amarillo';
  assignedPopulation: number;
  waitingCount: number;
  criticalCount: number;
  weeklyCapacity: number;
  pressurePercentage: number;
  status: 'OPTIMO' | 'PRECAUCION' | 'SATURADO';
}

export interface CapacityMetrics {
  totalWaitlistDemand: number;
  immediateReviewCount: number;
  highPriorityCount: number;
  avgProjectedDays: number;
  weeklyAvailableSlots: number;
  capacityBreachPercentage: number;
  sectorCoverage: SectorCoverageMetric[];
  explanationSummary: string;
  // DM2 Specific KPIs
  dm2ActivePatientsCount: number;
  dm2SevereDecompensatedCount: number;
  recentEmergencyEventsCount: number;
  dm2ControlBreachCount: number;
}

export interface FilterState {
  cesfam: string;
  sector: string;
  program: string;
  riskLevel: string;
  gesOnly: boolean;
  status: string;
  searchQuery: string;
  sortBy: 'prioridad_actual' | 'prioridad_original' | 'dias_espera' | 'riesgo_score' | 'cambio_posicion' | 'hba1c';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  patientId: string;
  patientRut: string;
  patientName: string;
  action: 'RECALCULO_ECICEP' | 'VALIDACION_CONTRALOR' | 'DERIVACION_SECUNDARIA' | 'AJUSTE_MANUAL_SECTOR' | 'CARGA_LISTA_APS';
  performedBy: string;
  role: string;
  details: string;
  previousPosition?: number;
  newPosition?: number;
  contralorNote?: string;
}

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  cesfamName: string;
  defaultWeeklySlots: number;
  patients: Patient[];
}
