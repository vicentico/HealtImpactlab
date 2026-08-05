import { UserRole, UserRoleInfo } from '../types';

export const USER_ROLES_CONFIG: Record<UserRole, UserRoleInfo> = {
  MEDICO_CONTRALOR: {
    id: 'MEDICO_CONTRALOR',
    label: 'Médico Contralor / Gestor de Casos',
    description: 'Acceso total a ficha clínica, priorización auditable, firmas de contraloría y derivación a Nivel 2.',
    badge: 'Máximo Acceso Clínico',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    canSeeFullIdentity: true,
    canSeeDetailedBiomarkers: true,
    canPerformContralorActions: true,
    canModifyPriorities: true,
    canUnmaskData: true
  },
  MEDICO_APS: {
    id: 'MEDICO_APS',
    label: 'Médico APS (Atención Directa)',
    description: 'Acceso a expediente clínico completo y biomarcadores para atención directa. Sin atribuciones de reordenamiento administrativo global.',
    badge: 'Atención Clínica Directa',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    canSeeFullIdentity: true,
    canSeeDetailedBiomarkers: true,
    canPerformContralorActions: false,
    canModifyPriorities: false,
    canUnmaskData: true
  },
  ENFERMERIA_APS: {
    id: 'ENFERMERIA_APS',
    label: 'Enfermería APS (Seguimiento & Triaje)',
    description: 'Acceso operacional para seguimiento de adherencia, valores de glicemia/HbA1c y coordinación con equipo de cabecera. Identidad seudonimizada en listas de gestión.',
    badge: 'Triaje & Seguimiento',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    canSeeFullIdentity: false,
    canSeeDetailedBiomarkers: true,
    canPerformContralorActions: false,
    canModifyPriorities: false,
    canUnmaskData: true
  },
  ADMINISTRATIVO: {
    id: 'ADMINISTRATIVO',
    label: 'Administrativo / Gestor de Lista',
    description: 'Acceso acotado a tiempos de espera, estados de citación y coordinación. Datos clínicos y diagnósticos altamente seudonimizados.',
    badge: 'Gestión Administrativa',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    canSeeFullIdentity: false,
    canSeeDetailedBiomarkers: false,
    canPerformContralorActions: false,
    canModifyPriorities: false,
    canUnmaskData: false
  },
  AUDITOR_LECTURA: {
    id: 'AUDITOR_LECTURA',
    label: 'Perfil Lectura / Auditoría Clínica',
    description: 'Modo solo lectura para revisión institucional, trazabilidad ANCI/APDP y auditorías de contraloría sanitaria. Sin permisos de modificación.',
    badge: 'Auditoría Solo Lectura',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    canSeeFullIdentity: false,
    canSeeDetailedBiomarkers: true,
    canPerformContralorActions: false,
    canModifyPriorities: false,
    canUnmaskData: false
  }
};

export function getRoleInfo(role: UserRole | string): UserRoleInfo {
  // Map legacy string names if needed
  if (role === 'Médico Contralor' || role === 'Médico Contralor / Gestor ECICEP') return USER_ROLES_CONFIG.MEDICO_CONTRALOR;
  if (role === 'Médico de Cabecera' || role === 'Médico APS (Equipo Cabecera)' || role === 'MEDICO_APS') return USER_ROLES_CONFIG.MEDICO_APS;
  if (role === 'Enfermería de Sector' || role === 'Enfermería ECICEP (Triaje/Glicemia)' || role === 'ENFERMERIA_APS') return USER_ROLES_CONFIG.ENFERMERIA_APS;
  if (role === 'Administrador APS' || role === 'Administrativo' || role === 'ADMINISTRATIVO') return USER_ROLES_CONFIG.ADMINISTRATIVO;
  if (role === 'Auditor' || role === 'AUDITOR_LECTURA') return USER_ROLES_CONFIG.AUDITOR_LECTURA;

  return USER_ROLES_CONFIG[role as UserRole] || USER_ROLES_CONFIG.MEDICO_CONTRALOR;
}

export function formatDisplayName(
  fullName: string, 
  initials: string, 
  code: string, 
  role: UserRole | string,
  isUnlocked: boolean = false
): { nameDisplay: string; isPseudonymized: boolean } {
  const roleInfo = getRoleInfo(role);

  if (roleInfo.canSeeFullIdentity || isUnlocked) {
    return { nameDisplay: fullName, isPseudonymized: false };
  }

  return { 
    nameDisplay: `${initials} [${code}]`, 
    isPseudonymized: true 
  };
}

export function formatDisplayRut(
  fullRut: string, 
  partialRut: string, 
  role: UserRole | string,
  isUnlocked: boolean = false
): string {
  const roleInfo = getRoleInfo(role);

  if (roleInfo.canSeeFullIdentity || isUnlocked) {
    return fullRut;
  }

  return partialRut;
}

export function formatPathologyDisplay(
  pathology: string, 
  role: UserRole | string
): { display: string; isMasked: boolean } {
  const roleInfo = getRoleInfo(role);

  if (roleInfo.id === 'ADMINISTRATIVO') {
    return {
      display: 'Programa Salud Cardiovascular (DM2)',
      isMasked: true
    };
  }

  return { display: pathology, isMasked: false };
}
