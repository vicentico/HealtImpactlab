import { 
  Patient, 
  NT118RiskScore, 
  ContraloriaStatus, 
  CESFAMSector, 
  RiskLevel, 
  AuditLogEntry, 
  DecompensationFactor,
  PriorizacionRequest 
} from '../types/patient';
import { INITIAL_MOCK_PATIENTS } from '../data/mockPatients';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * In-memory fallback patient database store.
 * Retains state updates when backend server is offline or unreachable.
 */
let fallbackPatientsStore: Patient[] = JSON.parse(JSON.stringify(INITIAL_MOCK_PATIENTS));

export interface ContraloriaUpdatePayload {
  new_status: string;
  clinical_note: string;
  physician_name: string;
  physician_role: string;
}

/**
 * Bidirectional Transformer: Maps backend raw patient object (snake_case or camelCase) to frontend Patient domain model.
 */
export function mapBackendPatientToFrontend(raw: any): Patient {
  if (!raw) {
    throw new Error('Raw patient payload is empty');
  }

  const nt118Raw = raw.nt118Risk || raw.nt118_risk || {};
  const subscores = nt118Raw.subscores || {};
  
  const nt118Risk: NT118RiskScore = {
    totalScore: nt118Raw.totalScore ?? nt118Raw.total_score ?? 0,
    riskLevel: (nt118Raw.riskLevel ?? nt118Raw.risk_level ?? 'BAJO') as RiskLevel,
    hba1cScore: subscores.hba1cScore ?? subscores.c1Hba1cScore ?? subscores.c1_hba1c_score ?? 0,
    renalsScore: subscores.renalsScore ?? subscores.c2RenalsScore ?? subscores.c2_renals_score ?? 0,
    cvScore: subscores.cvScore ?? subscores.c3CvScore ?? subscores.c3_cv_score ?? 0,
    socialScore: subscores.socialScore ?? subscores.c4SocialScore ?? subscores.c4_social_score ?? 0,
    decompensations: (nt118Raw.decompensations || []).map((d: any) => ({
      code: d.code || '',
      label: d.label || '',
      severity: d.severity || 'LEVE',
      value: d.value || ''
    }))
  };

  const auditHistory: AuditLogEntry[] = (raw.auditHistory || raw.audit_history || []).map((log: any) => ({
    id: log.id || '',
    timestamp: log.timestamp || '',
    userName: log.userName || log.user_name || '',
    userRole: log.userRole || log.user_role || '',
    action: log.action || '',
    previousStatus: log.previousStatus || log.previous_status || 'PENDIENTE',
    newStatus: log.newStatus || log.new_status || 'PENDIENTE',
    clinicalNote: log.clinicalNote || log.clinical_note || ''
  }));

  return {
    id: String(raw.id || ''),
    rut: String(raw.rut || ''),
    fullName: String(raw.fullName || raw.full_name || ''),
    age: Number(raw.age ?? 0),
    gender: (raw.gender || 'M') as 'M' | 'F',
    sector: (raw.sector || 'SECTOR_VERDE') as CESFAMSector,
    cesfamName: String(raw.cesfamName || raw.cesfam_name || ''),
    hba1c: Number(raw.hba1c ?? 0),
    systolicBP: Number(raw.systolicBP ?? raw.systolic_bp ?? raw.systolicBp ?? 120),
    diastolicBP: Number(raw.diastolicBP ?? raw.diastolic_bp ?? raw.diastolicBp ?? 80),
    vfg: Number(raw.vfg ?? 90),
    hasFootUlcer: Boolean(raw.hasFootUlcer ?? raw.has_foot_ulcer),
    hasRetinopathy: Boolean(raw.hasRetinopathy ?? raw.has_retinopathy),
    daysInWaitingList: Number(raw.daysInWaitingList ?? raw.days_in_waiting_list ?? 0),
    priorityPosition: Number(raw.priorityPosition ?? raw.priority_position ?? 0),
    previousPriorityPosition: Number(raw.previousPriorityPosition ?? raw.previous_priority_position ?? 0),
    contraloriaStatus: (raw.contraloriaStatus || raw.contraloria_status || 'PENDIENTE') as ContraloriaStatus,
    assignedPhysician: raw.assignedPhysician || raw.assigned_physician,
    lastReviewDate: raw.lastReviewDate || raw.last_review_date,
    nt118Risk,
    auditHistory
  };
}

/**
 * Bidirectional Transformer: Maps backend NT 118 score response to frontend NT118RiskScore model.
 */
export function mapBackendScoreToFrontend(raw: any): NT118RiskScore {
  const subscores = raw.subscores || {};
  return {
    totalScore: raw.totalScore ?? raw.total_score ?? 0,
    riskLevel: (raw.riskLevel ?? raw.risk_level ?? 'BAJO') as RiskLevel,
    hba1cScore: subscores.hba1cScore ?? subscores.c1Hba1cScore ?? subscores.c1_hba1c_score ?? 0,
    renalsScore: subscores.renalsScore ?? subscores.c2RenalsScore ?? subscores.c2_renals_score ?? 0,
    cvScore: subscores.cvScore ?? subscores.c3CvScore ?? subscores.c3_cv_score ?? 0,
    socialScore: subscores.socialScore ?? subscores.c4SocialScore ?? subscores.c4_social_score ?? 0,
    decompensations: (raw.decompensations || []).map((d: any) => ({
      code: d.code || '',
      label: d.label || '',
      severity: d.severity || 'LEVE',
      value: d.value || ''
    }))
  };
}

/**
 * Bidirectional Transformer: Maps frontend request payload to backend snake_case model.
 */
export function mapFrontendRequestToBackend(payload: PriorizacionRequest): any {
  return {
    patient_id: payload.patient_id || payload.patientId,
    hba1c: payload.hba1c,
    systolic_bp: payload.systolic_bp ?? payload.systolicBP,
    diastolic_bp: payload.diastolic_bp ?? payload.diastolicBP,
    vfg: payload.vfg,
    has_foot_ulcer: payload.has_foot_ulcer ?? payload.hasFootUlcer ?? false,
    has_retinopathy: payload.has_retinopathy ?? payload.hasRetinopathy ?? false,
    days_in_waiting_list: payload.days_in_waiting_list ?? payload.daysInWaitingList ?? 0,
    age: payload.age ?? 50,
    gender: payload.gender || 'M',
    sector: payload.sector,
    cesfam_name: payload.cesfam_name || payload.cesfamName
  };
}

/**
 * Evaluates NT 118 score locally when backend API is offline or unreachable.
 */
function calculateLocalNT118Score(payload: PriorizacionRequest): NT118RiskScore {
  const hba1c = Number(payload.hba1c || 0);
  const vfg = Number(payload.vfg || 90);
  const systolicBP = Number(payload.systolic_bp ?? payload.systolicBP ?? 120);
  const diastolicBP = Number(payload.diastolic_bp ?? payload.diastolicBP ?? 80);
  const hasFootUlcer = Boolean(payload.has_foot_ulcer ?? payload.hasFootUlcer);
  const hasRetinopathy = Boolean(payload.has_retinopathy ?? payload.hasRetinopathy);
  const daysInWaitingList = Number(payload.days_in_waiting_list ?? payload.daysInWaitingList ?? 0);
  const age = Number(payload.age ?? 50);

  const decompensations: DecompensationFactor[] = [];

  // C1: Control Glicémico (HbA1c) [0 - 35]
  let hba1cScore = 0;
  if (hba1c > 11.0) {
    hba1cScore = 35;
    decompensations.push({
      code: 'HBA1C_CRITICA',
      label: 'HbA1c > 11.0% Severa',
      severity: 'ALTA',
      value: `${hba1c}%`
    });
  } else if (hba1c >= 10.0) {
    hba1cScore = 30;
    decompensations.push({
      code: 'HBA1C_ALTA',
      label: 'HbA1c Descompensada',
      severity: 'MEDIA',
      value: `${hba1c}%`
    });
  } else if (hba1c >= 9.0) {
    hba1cScore = 28;
    decompensations.push({
      code: 'HBA1C_ALTA',
      label: 'HbA1c Descompensada',
      severity: 'MEDIA',
      value: `${hba1c}%`
    });
  } else if (hba1c >= 8.0) {
    hba1cScore = 18;
  } else if (hba1c >= 7.0) {
    hba1cScore = 10;
  } else {
    hba1cScore = 0;
  }

  // C2: Deterioro Renal (VFG) [0 - 30]
  let renalsScore = 0;
  if (vfg < 30.0) {
    renalsScore = 30;
    decompensations.push({
      code: 'VFG_CRITICA',
      label: 'Insuficiencia Renal Severa (VFG < 30)',
      severity: 'ALTA',
      value: `${vfg} mL/min`
    });
  } else if (vfg <= 44.0) {
    renalsScore = 25;
    decompensations.push({
      code: 'VFG_DISMINUIDA',
      label: 'Enfermedad Renal Etapa 3b',
      severity: 'MEDIA',
      value: `${vfg} mL/min`
    });
  } else if (vfg <= 59.0) {
    renalsScore = 15;
  } else if (vfg <= 89.0) {
    renalsScore = 10;
  } else {
    renalsScore = 0;
  }

  // C3: Complicaciones Vasculares & Presión Arterial [0 - 25]
  let cvRaw = 0;
  if (hasFootUlcer) {
    cvRaw += 20;
    decompensations.push({
      code: 'PIE_DIABETICO',
      label: 'Sospecha Ulcera Activa',
      severity: 'ALTA',
      value: 'Grado 2'
    });
  }

  if (hasRetinopathy) {
    cvRaw += 15;
    decompensations.push({
      code: 'RETINOPATIA',
      label: 'Retinopatía Diabética Proliferativa',
      severity: 'MEDIA',
      value: 'Fondo de Ojo +'
    });
  }

  if (systolicBP >= 160 || diastolicBP >= 100) {
    cvRaw += 10;
    decompensations.push({
      code: 'HTA_SEVERA',
      label: 'Hipertensión Severa',
      severity: 'MEDIA',
      value: `${systolicBP}/${diastolicBP} mmHg`
    });
  } else if (systolicBP >= 140 || diastolicBP >= 90) {
    cvRaw += 5;
  }

  const cvScore = Math.min(25, cvRaw);

  // C4: Determinantes Sociales [0 - 10]
  let socialScore = 0;
  if (age > 65) {
    socialScore = 4;
  }

  // C5: Días en Lista de Espera [0 - 10]
  let daysScore = 0;
  if (daysInWaitingList > 180) {
    daysScore = 10;
  } else if (daysInWaitingList > 120) {
    daysScore = 7;
  } else if (daysInWaitingList > 90) {
    daysScore = 5;
  } else if (daysInWaitingList > 45) {
    daysScore = 3;
  } else {
    daysScore = 0;
  }

  const totalScore = Math.min(100, hba1cScore + renalsScore + cvScore + socialScore + daysScore);

  let riskLevel: RiskLevel = 'BAJO';
  if (totalScore >= 90) {
    riskLevel = 'CRITICO';
  } else if (totalScore >= 75) {
    riskLevel = 'ALTO';
  } else if (totalScore >= 50) {
    riskLevel = 'MEDIO';
  } else {
    riskLevel = 'BAJO';
  }

  return {
    totalScore,
    riskLevel,
    hba1cScore,
    renalsScore,
    cvScore,
    socialScore,
    decompensations
  };
}

/**
 * Obtiene la lista de pacientes priorizada desde el Backend FastAPI o fallback local.
 */
export async function fetchPacientes(
  sector?: string, 
  status?: string, 
  risk_level?: string, 
  cesfam_name?: string
): Promise<Patient[]> {
  try {
    const params = new URLSearchParams();
    if (sector && sector !== 'ALL') params.append('sector', sector);
    if (status && status !== 'ALL') params.append('status', status);
    if (risk_level && risk_level !== 'ALL') params.append('risk_level', risk_level);
    if (cesfam_name && cesfam_name !== 'ALL') params.append('cesfam_name', cesfam_name);

    const url = `${API_BASE_URL}/pacientes${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      const mapped = data.map(mapBackendPatientToFrontend);
      // Synchronize in-memory fallback store with backend data
      fallbackPatientsStore = mapped;
      return mapped;
    }
    throw new Error('Formato de respuesta API inválido');
  } catch (error) {
    console.warn('Backend API no disponible. Utilizando modo offline / mock fallback dataset:', error);

    // Apply local fallback filtering
    let results = [...fallbackPatientsStore];
    if (sector && sector !== 'ALL') {
      results = results.filter((p) => p.sector === sector);
    }
    if (status && status !== 'ALL') {
      results = results.filter((p) => p.contraloriaStatus === status);
    }
    if (risk_level && risk_level !== 'ALL') {
      results = results.filter((p) => p.nt118Risk.riskLevel === risk_level);
    }
    if (cesfam_name && cesfam_name !== 'ALL') {
      results = results.filter((p) => p.cesfamName === cesfam_name);
    }
    return results;
  }
}

/**
 * Ejecuta el cálculo algorítmico del puntaje NT 118 en el motor Backend Python (o fallback local).
 */
export async function calcularNT118(payload: PriorizacionRequest): Promise<NT118RiskScore> {
  try {
    const backendPayload = mapFrontendRequestToBackend(payload);
    const response = await fetch(`${API_BASE_URL}/priorizacion/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload)
    });

    if (!response.ok) {
      throw new Error(`Error en motor de priorización API: ${response.statusText}`);
    }

    const data = await response.json();
    return mapBackendScoreToFrontend(data);
  } catch (error) {
    console.warn('Backend API no disponible para calcularNT118, calculando localmente:', error);
    return calculateLocalNT118Score(payload);
  }
}

/**
 * Registra una acción de contraloría médica (Override / Aprobación) en la bitácora auditable via Backend API o fallback local.
 */
export async function updateContraloriaStatus(
  patientId: string,
  payloadOrStatus: ContraloriaUpdatePayload | string,
  clinicalNote?: string,
  physicianName?: string,
  physicianRole?: string
): Promise<Patient> {
  let new_status: string;
  let note: string;
  let doctorName: string;
  let doctorRole: string;

  if (typeof payloadOrStatus === 'object' && payloadOrStatus !== null) {
    new_status = payloadOrStatus.new_status || (payloadOrStatus as any).newStatus || 'PENDIENTE';
    note = payloadOrStatus.clinical_note || (payloadOrStatus as any).clinicalNote || '';
    doctorName = payloadOrStatus.physician_name || (payloadOrStatus as any).physicianName || 'Dr. Alejandro Silva';
    doctorRole = payloadOrStatus.physician_role || (payloadOrStatus as any).physicianRole || 'Médico Contralor APS';
  } else {
    new_status = payloadOrStatus;
    note = clinicalNote || '';
    doctorName = physicianName || 'Dr. Alejandro Silva';
    doctorRole = physicianRole || 'Médico Contralor APS';
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pacientes/${patientId}/contraloria`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_status,
        clinical_note: note,
        physician_name: doctorName,
        physician_role: doctorRole
      })
    });

    if (!response.ok) {
      throw new Error(`Error en API Contraloría: ${response.statusText}`);
    }

    const data = await response.json();
    const updatedPatient = mapBackendPatientToFrontend(data);

    // Update in-memory fallback store
    const idx = fallbackPatientsStore.findIndex((p) => p.id === patientId);
    if (idx !== -1) {
      fallbackPatientsStore[idx] = updatedPatient;
    }

    return updatedPatient;
  } catch (error) {
    console.warn('Backend API no disponible para updateContraloriaStatus, aplicando actualización local:', error);

    const idx = fallbackPatientsStore.findIndex((p) => p.id === patientId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (idx !== -1) {
      const existing = fallbackPatientsStore[idx];
      const newAuditEntry: AuditLogEntry = {
        id: `AUD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        timestamp: nowStr,
        userName: doctorName,
        userRole: doctorRole,
        action: 'STATUS_OVERRIDE',
        previousStatus: existing.contraloriaStatus,
        newStatus: new_status as ContraloriaStatus,
        clinicalNote: note
      };

      const updated: Patient = {
        ...existing,
        contraloriaStatus: new_status as ContraloriaStatus,
        lastReviewDate: nowStr,
        auditHistory: [newAuditEntry, ...existing.auditHistory]
      };

      fallbackPatientsStore[idx] = updated;
      return updated;
    } else {
      throw new Error(`Paciente ${patientId} no encontrado en datos locales`);
    }
  }
}

/**
 * Service export object for backward compatibility.
 */
export const apiService = {
  fetchPacientes,
  calcularNT118,
  updateContraloriaStatus,
  getPatients: fetchPacientes,
  calculateNt118Score: calcularNT118
};
