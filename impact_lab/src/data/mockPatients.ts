import { Patient } from '../types/patient';

export const INITIAL_MOCK_PATIENTS: Patient[] = [
  {
    id: 'PAT-001',
    rut: '12.458.930-K',
    fullName: 'Carmen Rosa Morales Fuentes',
    age: 67,
    gender: 'F',
    sector: 'SECTOR_ROJO',
    cesfamName: 'CESFAM Carol Urzúa',
    hba1c: 11.4,
    systolicBP: 165,
    diastolicBP: 98,
    vfg: 42,
    hasFootUlcer: true,
    hasRetinopathy: true,
    daysInWaitingList: 142,
    priorityPosition: 1,
    previousPriorityPosition: 5,
    contraloriaStatus: 'PENDIENTE',
    assignedPhysician: 'Dr. Alejandro Silva (Contralor)',
    nt118Risk: {
      totalScore: 94,
      riskLevel: 'CRITICO',
      hba1cScore: 35,
      renalsScore: 25,
      cvScore: 24,
      socialScore: 10,
      decompensations: [
        { code: 'HBA1C_CRITICA', label: 'HbA1c > 11.0% Severa', severity: 'ALTA', value: '11.4%' },
        { code: 'PIE_DIABETICO', label: 'Sospecha Ulcera Activa', severity: 'ALTA', value: 'Grado 2' },
        { code: 'VFG_DISMINUIDA', label: 'Enfermedad Renal Etapa 3b', severity: 'MEDIA', value: '42 mL/min' }
      ]
    },
    auditHistory: [
      {
        id: 'LOG-101',
        timestamp: '2026-08-04 09:15',
        userName: 'Algoritmo NT 118',
        userRole: 'Sistema IA',
        action: 'Repriorización Automática',
        previousStatus: 'PENDIENTE',
        newStatus: 'PENDIENTE',
        clinicalNote: 'Paciente elevada a posición 1 por descompensación HbA1c 11.4% y presencia de pie diabético activo.'
      }
    ]
  },
  {
    id: 'PAT-002',
    rut: '14.821.405-3',
    fullName: 'Jorge Eduardo Tapia Benítez',
    age: 58,
    gender: 'M',
    sector: 'SECTOR_VERDE',
    cesfamName: 'CESFAM Carol Urzúa',
    hba1c: 9.8,
    systolicBP: 152,
    diastolicBP: 92,
    vfg: 58,
    hasFootUlcer: false,
    hasRetinopathy: true,
    daysInWaitingList: 98,
    priorityPosition: 2,
    previousPriorityPosition: 2,
    contraloriaStatus: 'REQUIERE_REVISION',
    assignedPhysician: 'Dra. María Paz Zúñiga',
    lastReviewDate: '2026-08-03 16:30',
    nt118Risk: {
      totalScore: 82,
      riskLevel: 'ALTO',
      hba1cScore: 28,
      renalsScore: 20,
      cvScore: 22,
      socialScore: 12,
      decompensations: [
        { code: 'HBA1C_ALTA', label: 'HbA1c > 9.0%', severity: 'ALTA', value: '9.8%' },
        { code: 'RETINOPATIA', label: 'Retinopatía Diabética Proliferativa', severity: 'MEDIA', value: 'Fondo de Ojo +' }
      ]
    },
    auditHistory: [
      {
        id: 'LOG-102',
        timestamp: '2026-08-03 16:30',
        userName: 'Dra. María Paz Zúñiga',
        userRole: 'Médico Contralor',
        action: 'Solicitud Exámenes Complementarios',
        previousStatus: 'PENDIENTE',
        newStatus: 'REQUIERE_REVISION',
        clinicalNote: 'Se solicita Microalbuminuria y Perfil Lipídico actualizado antes de dar alta a cita con diabetólogo.'
      }
    ]
  },
  {
    id: 'PAT-003',
    rut: '9.310.224-8',
    fullName: 'Héctor Hernán Sepúlveda Riquelme',
    age: 72,
    gender: 'M',
    sector: 'SECTOR_AZUL',
    cesfamName: 'CESFAM Carol Urzúa',
    hba1c: 8.9,
    systolicBP: 145,
    diastolicBP: 88,
    vfg: 35,
    hasFootUlcer: false,
    hasRetinopathy: false,
    daysInWaitingList: 210,
    priorityPosition: 3,
    previousPriorityPosition: 1,
    contraloriaStatus: 'APROBADO',
    assignedPhysician: 'Dr. Alejandro Silva (Contralor)',
    lastReviewDate: '2026-08-04 11:00',
    nt118Risk: {
      totalScore: 78,
      riskLevel: 'ALTO',
      hba1cScore: 22,
      renalsScore: 30,
      cvScore: 18,
      socialScore: 8,
      decompensations: [
        { code: 'VFG_CRITICA', label: 'VFG Severamente Caída', severity: 'ALTA', value: '35 mL/min' }
      ]
    },
    auditHistory: [
      {
        id: 'LOG-103',
        timestamp: '2026-08-04 11:00',
        userName: 'Dr. Alejandro Silva',
        userRole: 'Médico Contralor',
        action: 'Aprobación de Cupo Especialidad',
        previousStatus: 'PENDIENTE',
        newStatus: 'APROBADO',
        clinicalNote: 'Aprobado para cita prioritaria con Nefrología/Diabetología por deterioro renal acelerado.'
      }
    ]
  },
  {
    id: 'PAT-004',
    rut: '16.740.119-4',
    fullName: 'Valentina Ignacia Araya Valenzuela',
    age: 44,
    gender: 'F',
    sector: 'SECTOR_AMARILLO',
    cesfamName: 'CESFAM Carol Urzúa',
    hba1c: 10.2,
    systolicBP: 138,
    diastolicBP: 84,
    vfg: 88,
    hasFootUlcer: false,
    hasRetinopathy: false,
    daysInWaitingList: 45,
    priorityPosition: 4,
    previousPriorityPosition: 8,
    contraloriaStatus: 'PENDIENTE',
    nt118Risk: {
      totalScore: 68,
      riskLevel: 'MEDIO',
      hba1cScore: 30,
      renalsScore: 10,
      cvScore: 14,
      socialScore: 14,
      decompensations: [
        { code: 'HBA1C_ALTA', label: 'HbA1c Descompensada', severity: 'MEDIA', value: '10.2%' }
      ]
    },
    auditHistory: []
  },
  {
    id: 'PAT-005',
    rut: '11.503.882-1',
    fullName: 'Gonzalo Andrés Pinto Castro',
    age: 63,
    gender: 'M',
    sector: 'SECTOR_ROJO',
    cesfamName: 'CESFAM Carol Urzúa',
    hba1c: 7.4,
    systolicBP: 128,
    diastolicBP: 78,
    vfg: 75,
    hasFootUlcer: false,
    hasRetinopathy: false,
    daysInWaitingList: 180,
    priorityPosition: 5,
    previousPriorityPosition: 4,
    contraloriaStatus: 'OBSERVADO',
    assignedPhysician: 'Dra. María Paz Zúñiga',
    lastReviewDate: '2026-08-01 14:20',
    nt118Risk: {
      totalScore: 42,
      riskLevel: 'BAJO',
      hba1cScore: 10,
      renalsScore: 12,
      cvScore: 10,
      socialScore: 10,
      decompensations: []
    },
    auditHistory: [
      {
        id: 'LOG-105',
        timestamp: '2026-08-01 14:20',
        userName: 'Dra. María Paz Zúñiga',
        userRole: 'Médico Contralor',
        action: 'Derivación a Control APS Local',
        previousStatus: 'PENDIENTE',
        newStatus: 'OBSERVADO',
        clinicalNote: 'Paciente compensado (HbA1c 7.4%). Mantiene control en CESFAM sector por enfermera y médico tratante.'
      }
    ]
  }
];
