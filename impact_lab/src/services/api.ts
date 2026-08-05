import { Patient, ContraloriaStatus, CESFAMSector } from '../types/patient';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Cliente de Servicio REST API para conectar el Frontend React de Torre de Control APS
 * con el motor Backend Python / FastAPI (NT 118 / ECICEP).
 */

export interface CalculateScorePayload {
  hba1c: number;
  systolicBP: number;
  diastolicBP: number;
  vfg: number;
  hasFootUlcer: boolean;
  hasRetinopathy: boolean;
  daysInWaitingList: number;
  sector: CESFAMSector;
  socialVulnerabilityScore?: number;
}

export interface CalculateScoreResponse {
  totalScore: number;
  riskLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  subscores: {
    hba1cScore: number;
    renalsScore: number;
    cvScore: number;
    socialScore: number;
  };
  decompensations: Array<{
    code: string;
    label: string;
    severity: 'ALTA' | 'MEDIA' | 'LEVE';
    value: string;
  }>;
}

export const apiService = {
  /**
   * Obtiene la lista de pacientes priorizada desde el Backend FastAPI.
   */
  async getPatients(cesfamId?: string, sector?: string): Promise<Patient[]> {
    try {
      const params = new URLSearchParams();
      if (cesfamId) params.append('cesfam_id', cesfamId);
      if (sector && sector !== 'ALL') params.append('sector', sector);

      const response = await fetch(`${API_BASE_URL}/pacientes?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Backend API no disponible, utilizando modo offline / dataset simulado:', error);
      return [];
    }
  },

  /**
   * Ejecuta el cálculo algorítmico del puntaje NT 118 en el motor Backend Python.
   */
  async calculateNt118Score(payload: CalculateScorePayload): Promise<CalculateScoreResponse> {
    const response = await fetch(`${API_BASE_URL}/priorizacion/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Error en motor de priorización: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * Registra una acción de contraloría médica (Override / Aprobación) en la bitácora auditable.
   */
  async updateContraloriaStatus(
    patientId: string,
    newStatus: ContraloriaStatus,
    clinicalNote: string,
    physicianName: string = 'Dr. Alejandro Silva'
  ): Promise<Patient> {
    const response = await fetch(`${API_BASE_URL}/pacientes/${patientId}/contraloria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        clinicalNote,
        physicianName
      })
    });
    if (!response.ok) {
      throw new Error(`Error al registrar en bitácora de contraloría: ${response.statusText}`);
    }
    return await response.json();
  }
};
