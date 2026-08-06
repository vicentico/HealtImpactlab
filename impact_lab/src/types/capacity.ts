export type UserRole = 'MEDICO_CONTRALOR' | 'ENFERMERA_GESTORA' | 'ADMIN_SOMO' | 'AUDITOR_MINSAL';

export interface BoxCapacity {
  id: string;
  cesfamName: string;
  boxNumber: number;
  boxType: 'MEDICO' | 'ENFERMERA' | 'MULTIDISCIPLINARIO';
  isActive: boolean;
  weeklyHoursCapacity: number;
  currentWeeklyOccupancy: number;
}

export interface ReferralQuota {
  id: string;
  cesfamName: string;
  hospitalTarget: string;
  specialty: 'DIABETOLOGIA' | 'NEFROLOGIA' | 'PIE_DIABETICO';
  monthlyQuotaLimit: number;
  monthlyQuotaUsed: number;
  validMonth: string;
}

export interface CapacitySummary {
  totalBoxes: number;
  activeBoxes: number;
  totalWeeklyHours: number;
  occupiedWeeklyHours: number;
  boxUtilizationRate: number;
  referralQuotas: ReferralQuota[];
  boxes: BoxCapacity[];
}
