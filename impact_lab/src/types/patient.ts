export type CESFAMSector = 'SECTOR_VERDE' | 'SECTOR_AZUL' | 'SECTOR_ROJO' | 'SECTOR_AMARILLO';

export type ContraloriaStatus = 
  | 'PENDIENTE'
  | 'APROBADO'
  | 'REQUIERE_REVISION'
  | 'OBSERVADO';

export type RiskLevel = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';

export interface DecompensationFactor {
  code: string;
  label: string;
  severity: 'ALTA' | 'MEDIA' | 'LEVE';
  value: string;
}

export interface NT118RiskScore {
  totalScore: number;
  riskLevel: RiskLevel;
  hba1cScore: number;
  renalsScore: number; // VFG & Proteinuria
  cvScore: number;    // Hipertensión & eventos previos
  socialScore: number; // Determinantes sociales y ruralidad
  decompensations: DecompensationFactor[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  previousStatus: ContraloriaStatus;
  newStatus: ContraloriaStatus;
  clinicalNote: string;
}

export interface PriorizacionRequest {
  patient_id?: string;
  patientId?: string;
  hba1c: number;
  systolic_bp?: number;
  systolicBP?: number;
  diastolic_bp?: number;
  diastolicBP?: number;
  vfg: number;
  has_foot_ulcer?: boolean;
  hasFootUlcer?: boolean;
  has_retinopathy?: boolean;
  hasRetinopathy?: boolean;
  days_in_waiting_list?: number;
  daysInWaitingList?: number;
  age?: number;
  gender?: string;
  sector?: string;
  cesfam_name?: string;
  cesfamName?: string;
}

export interface Patient {
  id: string;
  rut: string;
  fullName: string;
  age: number;
  gender: 'M' | 'F';
  sector: CESFAMSector;
  cesfamName: string;
  
  // Parámetros clínicos APS
  hba1c: number;             // % Hemoglobina Glicosilada
  systolicBP: number;        // Presión Sistólica
  diastolicBP: number;       // Presión Diastólica
  vfg: number;               // Velocidad Filtración Glomerular (mL/min/1.73m2)
  hasFootUlcer: boolean;     // Pie diabético activo
  hasRetinopathy: boolean;   // Retinopatía diabética
  
  // Tiempos y priorización algorítmica
  daysInWaitingList: number;
  nt118Risk: NT118RiskScore;
  priorityPosition: number;
  previousPriorityPosition: number; // Trazabilidad de cambio
  
  // Estado de Contraloría Médica
  contraloriaStatus: ContraloriaStatus;
  assignedPhysician?: string;
  lastReviewDate?: string;
  auditHistory: AuditLogEntry[];
}
