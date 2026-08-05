import { Patient, CapacityMetrics, AuditLogEntry, DatasetPreset } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PAT-001',
    code: 'DM2-001',
    initials: 'M.E.S.',
    partialRut: '14.892.***-*',
    rut: '14.892.310-K',
    name: 'Marta Elena Sepúlveda Riquelme',
    age: 64,
    gender: 'F',
    cesfamName: 'CESFAM Dr. Aníbal Ariztía',
    sector: 'Verde',
    careTeam: 'Equipo Cabecera Sector Verde - Dra. Morales',
    program: 'DIABETES_DM2',
    ecicepTier: 'G3_ALTO_COMPLEJO',
    primaryPathology: 'Diabetes Mellitus Tipo 2 descompensada + Nefropatía Incipiente',
    isGES: true,
    daysOnWaitlist: 142,
    controlBreachMonths: 8,
    clinicalRiskLevel: 'MUY_ALTA',
    clinicalRiskScore: 94,
    originalPosition: 18,
    currentPosition: 1,
    positionDelta: 17,
    primaryReason: 'HbA1c 11.8% + Atencion Urgencia SAPU reciente (Hiperglicemia 340 mg/dL) + Brecha > 8 meses',
    clinicalFactors: {
      vitalRisk: false,
      biomarkerAgravation: true,
      monthsWithoutControl: 8,
      comorbiditiesCount: 3,
      functionalDecline: true,
      socialVulnerabilityScore: 8,
      adherenceStatus: 'PARCIAL',
      hbA1c: 11.8,
      rac: '85 mg/g (Microalbuminuria)',
      vfg: 52,
      bloodPressure: '145/90',
      bmi: 31.4,
      recentEmergencyEvents: [
        'Atención SAPU 02/08 por crisis hiperglicémica (340 mg/dL)',
        'Alta Hospital Salvador 15/07 por descompensación metabólica'
      ]
    },
    auditableJustification: 'Paciente DM2 con HbA1c 11.8% y proteinuria reciente sin evaluación en 8 meses. Priorizada automáticamente según Criterio ECICEP - Alto riesgo de progresión a falla renal aguda.',
    rulesApplied: [
      {
        ruleId: 'ECICEP-DM2-CRIT',
        code: 'ECICEP-BIO',
        name: 'Biomarcador Crítico DM2 (HbA1c > 10%)',
        description: 'Puntaje máximo de riesgo metabólico activo en APS.',
        pointsAdded: 35,
        category: 'RIESGO_VITAL'
      },
      {
        ruleId: 'ECICEP-URG-01',
        code: 'ECICEP-URG',
        name: 'Atención Reciente en SAPU / Urgencia (< 30 días)',
        description: 'Evento de descompensación agudizada.',
        pointsAdded: 30,
        category: 'RIESGO_VITAL'
      },
      {
        ruleId: 'ECICEP-BRECHA-08',
        code: 'ECICEP-BRECHA',
        name: 'Inasistencia / Desfasaje Control APS > 6 Meses',
        description: 'Exceso sobre la frecuencia recomendada por norma técnica ECICEP.',
        pointsAdded: 25,
        category: 'BRECHA_CONTROL'
      }
    ],
    estimatedAppointmentDate: '2026-08-07 (2 días)',
    status: 'REVISION_INMEDIATA',
    contralorValidation: {
      isValidated: false,
      validatedBy: null,
      timestamp: null,
      notes: null,
      actionTaken: 'PENDIENTE'
    },
    lastUpdated: '2026-08-05 08:15'
  },
  {
    id: 'PAT-002',
    code: 'DM2-002',
    initials: 'H.R.F.',
    partialRut: '12.405.***-*',
    rut: '12.405.882-7',
    name: 'Hernán Rodolfo Fuenzalida Lagos',
    age: 71,
    gender: 'M',
    cesfamName: 'CESFAM Dr. Aníbal Ariztía',
    sector: 'Azul',
    careTeam: 'Equipo Cabecera Sector Azul - Dr. Valenzuela',
    program: 'DIABETES_DM2',
    ecicepTier: 'G3_ALTO_COMPLEJO',
    primaryPathology: 'DM2 Descompensada + Hipertensión Refractaria + Pie Diabético Wagner 1',
    isGES: true,
    daysOnWaitlist: 118,
    controlBreachMonths: 6,
    clinicalRiskLevel: 'MUY_ALTA',
    clinicalRiskScore: 89,
    originalPosition: 24,
    currentPosition: 2,
    positionDelta: 22,
    primaryReason: 'HbA1c 10.5% + PA 185/110 mmHg + Lesión incipiente en pie derecho',
    clinicalFactors: {
      vitalRisk: true,
      biomarkerAgravation: true,
      monthsWithoutControl: 6,
      comorbiditiesCount: 4,
      functionalDecline: true,
      socialVulnerabilityScore: 7,
      adherenceStatus: 'PARCIAL',
      hbA1c: 10.5,
      rac: '120 mg/g (Macroalbuminuria)',
      vfg: 44,
      bloodPressure: '185/110',
      bmi: 29.8,
      recentEmergencyEvents: [
        'Consulta de Urgencia Curación Podológica 28/07'
      ]
    },
    auditableJustification: 'Riesgo cardiovascular alto e insipiente complicación microvascular. Priorizado por sobreagenda ECICEP.',
    rulesApplied: [
      {
        ruleId: 'ECICEP-CV-CRIT',
        code: 'ECICEP-CV',
        name: 'Riesgo Cardiovascular Máximo + Complicación de Pie',
        description: 'Presión Arterial diastólica > 110 mmHg y lesión en pie.',
        pointsAdded: 40,
        category: 'RIESGO_VITAL'
      }
    ],
    estimatedAppointmentDate: '2026-08-08 (3 días)',
    status: 'REVISION_INMEDIATA',
    contralorValidation: {
      isValidated: false,
      validatedBy: null,
      timestamp: null,
      notes: null,
      actionTaken: 'PENDIENTE'
    },
    lastUpdated: '2026-08-05 07:40'
  },
  {
    id: 'PAT-003',
    code: 'DM2-003',
    initials: 'J.A.M.',
    partialRut: '17.102.***-*',
    rut: '17.102.943-4',
    name: 'Javier Antonio Muñoz Carrasco',
    age: 58,
    gender: 'M',
    cesfamName: 'CESFAM Dr. Aníbal Ariztía',
    sector: 'Rojo',
    careTeam: 'Equipo Cabecera Sector Rojo - Dr. Castillo',
    program: 'DIABETES_DM2',
    ecicepTier: 'G2_MODERADO',
    primaryPathology: 'DM2 Mala Adherencia + HTA Estadio 2',
    isGES: true,
    daysOnWaitlist: 85,
    controlBreachMonths: 7,
    clinicalRiskLevel: 'ALTA',
    clinicalRiskScore: 82,
    originalPosition: 12,
    currentPosition: 3,
    positionDelta: 9,
    primaryReason: 'HbA1c 9.8% + Abandono de tratamiento por 7 meses + Sin retiro de fármacos',
    clinicalFactors: {
      vitalRisk: false,
      biomarkerAgravation: true,
      monthsWithoutControl: 7,
      comorbiditiesCount: 2,
      functionalDecline: false,
      socialVulnerabilityScore: 9,
      adherenceStatus: 'INADHERENTE_ABANDONO',
      hbA1c: 9.8,
      rac: '35 mg/g',
      vfg: 68,
      bloodPressure: '150/92',
      bmi: 33.1,
      recentEmergencyEvents: []
    },
    auditableJustification: 'Alerta por abandono de retiro de insulina en farmacia CESFAM por 3 meses consecutivos.',
    rulesApplied: [
      {
        ruleId: 'ECICEP-ABANDONO',
        code: 'ECICEP-FARMA',
        name: 'Inadherencia Severa / Abandono de Farmacia',
        description: 'Brecha de continuidad del cuidado en APS.',
        pointsAdded: 30,
        category: 'BRECHA_CONTROL'
      }
    ],
    estimatedAppointmentDate: '2026-08-09 (4 días)',
    status: 'PRIORIZADO_VALIDADO',
    contralorValidation: {
      isValidated: true,
      validatedBy: 'Dra. María Paz Henríquez (Médico Contralor)',
      timestamp: '2026-08-04 16:30',
      notes: 'Validado priorización. Agendar sobrecupo ECICEP y citar con enfermera gestora de casos.',
      actionTaken: 'APROBADO'
    },
    lastUpdated: '2026-08-04 16:30'
  },
  {
    id: 'PAT-004',
    code: 'DM2-004',
    initials: 'C.G.A.',
    partialRut: '09.521.***-*',
    rut: '09.521.884-2',
    name: 'Carmen Gloria Araya Pinto',
    age: 79,
    gender: 'F',
    cesfamName: 'CESFAM Dr. Aníbal Ariztía',
    sector: 'Verde',
    careTeam: 'Equipo Cabecera Sector Verde - Dra. Morales',
    program: 'DIABETES_DM2',
    ecicepTier: 'G3_ALTO_COMPLEJO',
    primaryPathology: 'DM2 Mal Control Metabólico + Enfermedad Renal Crónica Etapa 3b',
    isGES: true,
    daysOnWaitlist: 110,
    controlBreachMonths: 10,
    clinicalRiskLevel: 'ALTA',
    clinicalRiskScore: 78,
    originalPosition: 5,
    currentPosition: 4,
    positionDelta: 1,
    primaryReason: 'HbA1c 9.4% + VFG 38 ml/min + Caída persistente de filtrado glomerular',
    clinicalFactors: {
      vitalRisk: false,
      biomarkerAgravation: true,
      monthsWithoutControl: 10,
      comorbiditiesCount: 4,
      functionalDecline: true,
      socialVulnerabilityScore: 6,
      adherenceStatus: 'PARCIAL',
      hbA1c: 9.4,
      rac: '140 mg/g',
      vfg: 38,
      bloodPressure: '138/85',
      bmi: 27.5,
      recentEmergencyEvents: []
    },
    auditableJustification: 'Ajuste renal urgente de antidiabéticos orales. Se requiere evaluación médica preferente.',
    rulesApplied: [
      {
        ruleId: 'ECICEP-RENAL',
        code: 'ECICEP-VFG',
        name: 'Deterioro Renal Crónico (VFG < 45 ml/min)',
        description: 'Necesidad de ajuste farmacológico por nefropatía.',
        pointsAdded: 25,
        category: 'RIESGO_VITAL'
      }
    ],
    estimatedAppointmentDate: '2026-08-10 (5 días)',
    status: 'PRIORIZADO_VALIDADO',
    contralorValidation: {
      isValidated: true,
      validatedBy: 'Dr. Roberto Palma (Contralor APS)',
      timestamp: '2026-08-04 11:20',
      notes: 'Confirmado por médico contralor. Ajustar linagliptina/insulina en Sector Verde.',
      actionTaken: 'APROBADO'
    },
    lastUpdated: '2026-08-04 11:20'
  },
  {
    id: 'PAT-005',
    code: 'DM2-005',
    initials: 'V.N.S.',
    partialRut: '18.943.***-*',
    rut: '18.943.201-9',
    name: 'Valeria Nicole Smith Orellana',
    age: 34,
    gender: 'F',
    cesfamName: 'CESFAM Dr. Aníbal Ariztía',
    sector: 'Amarillo',
    careTeam: 'Equipo Cabecera Sector Amarillo - Matrona Silva',
    program: 'DIABETES_DM2',
    ecicepTier: 'G3_ALTO_COMPLEJO',
    primaryPathology: 'DM2 Gestacional / DM2 Preexistente en Embarazo (24 Semanas)',
    isGES: true,
    daysOnWaitlist: 15,
    controlBreachMonths: 2,
    clinicalRiskLevel: 'MUY_ALTA',
    clinicalRiskScore: 91,
    originalPosition: 35,
    currentPosition: 5,
    positionDelta: 30,
    primaryReason: 'Embarazada 24 Semanas + Perfil Glicémico descompensado (Promedio 190 mg/dL postprandial)',
    clinicalFactors: {
      vitalRisk: true,
      biomarkerAgravation: true,
      monthsWithoutControl: 2,
      comorbiditiesCount: 1,
      functionalDecline: false,
      socialVulnerabilityScore: 5,
      adherenceStatus: 'ADHERENTE',
      hbA1c: 8.9,
      rac: '20 mg/g',
      vfg: 110,
      bloodPressure: '130/82',
      bmi: 32.0,
      recentEmergencyEvents: [
        'Derivación directa por Matrona de Sector Amarillo 04/08'
      ]
    },
    auditableJustification: 'Protección Binomio Madre-Hijo. Requerimiento inminente de insulinoterapia intensiva.',
    rulesApplied: [
      {
        ruleId: 'ECICEP-EMBARAZO',
        code: 'ECICEP-MATERNO',
        name: 'DM2 / Diabetes Gestacional Alto Riesgo',
        description: 'Urgencia obstétrica metabólica en atención primaria.',
        pointsAdded: 50,
        category: 'RIESGO_VITAL'
      }
    ],
    estimatedAppointmentDate: '2026-08-06 (Mañana)',
    status: 'REVISION_INMEDIATA',
    contralorValidation: {
      isValidated: false,
      validatedBy: null,
      timestamp: null,
      notes: null,
      actionTaken: 'PENDIENTE'
    },
    lastUpdated: '2026-08-05 08:30'
  },
  {
    id: 'PAT-006',
    code: 'HTA-001',
    initials: 'G.A.T.',
    partialRut: '08.112.***-*',
    rut: '08.112.450-8',
    name: 'Gonzalo Andrés Tapia Vergara',
    age: 83,
    gender: 'M',
    cesfamName: 'CESFAM Dr. Aníbal Ariztía',
    sector: 'Verde',
    careTeam: 'Equipo Cabecera Sector Verde - Dra. Morales',
    program: 'HIPERTENSION_HTA',
    ecicepTier: 'G2_MODERADO',
    primaryPathology: 'Hipertensión Arterial Severa + Síndrome de Fragilidad Senil',
    isGES: true,
    daysOnWaitlist: 120,
    controlBreachMonths: 12,
    clinicalRiskLevel: 'ALTA',
    clinicalRiskScore: 74,
    originalPosition: 8,
    currentPosition: 6,
    positionDelta: 2,
    primaryReason: 'PA 175/100 mmHg en toma domiciliaria + 12 meses sin evaluación por médico',
    clinicalFactors: {
      vitalRisk: false,
      biomarkerAgravation: false,
      monthsWithoutControl: 12,
      comorbiditiesCount: 4,
      functionalDecline: true,
      socialVulnerabilityScore: 8,
      adherenceStatus: 'PARCIAL',
      bloodPressure: '175/100',
      bmi: 24.2,
      recentEmergencyEvents: []
    },
    auditableJustification: '12 meses sin control médico en programa del Adulto Mayor. Reordenado con prioridad gerontológica.',
    rulesApplied: [
      {
        ruleId: 'ECICEP-GER-80',
        code: 'ECICEP-EMPAM',
        name: 'Adulto Mayor Dependiente / Riesgo HTA',
        description: 'Elevado riesgo de accidente cerebrovascular.',
        pointsAdded: 20,
        category: 'PROGRAMA_PRIORITARIO'
      }
    ],
    estimatedAppointmentDate: '2026-08-11 (6 días)',
    status: 'PRIORIZADO_VALIDADO',
    contralorValidation: {
      isValidated: true,
      validatedBy: 'Dr. Roberto Palma (Contralor APS)',
      timestamp: '2026-08-03 14:00',
      notes: 'Coordinar con programa de Visita Domiciliaria ECICEP.',
      actionTaken: 'APROBADO'
    },
    lastUpdated: '2026-08-03 14:00'
  }
];

export const INITIAL_CAPACITY_METRICS: CapacityMetrics = {
  totalWaitlistDemand: 1248,
  immediateReviewCount: 14,
  highPriorityCount: 86,
  avgProjectedDays: 18.4,
  weeklyAvailableSlots: 210,
  capacityBreachPercentage: 38.5,
  dm2ActivePatientsCount: 842,
  dm2SevereDecompensatedCount: 68,
  recentEmergencyEventsCount: 24,
  dm2ControlBreachCount: 142,
  sectorCoverage: [
    {
      sectorName: 'Verde',
      assignedPopulation: 14200,
      waitingCount: 380,
      criticalCount: 5,
      weeklyCapacity: 65,
      pressurePercentage: 82,
      status: 'SATURADO'
    },
    {
      sectorName: 'Azul',
      assignedPopulation: 12800,
      waitingCount: 290,
      criticalCount: 3,
      weeklyCapacity: 55,
      pressurePercentage: 68,
      status: 'PRECAUCION'
    },
    {
      sectorName: 'Rojo',
      assignedPopulation: 15100,
      waitingCount: 410,
      criticalCount: 4,
      weeklyCapacity: 50,
      pressurePercentage: 91,
      status: 'SATURADO'
    },
    {
      sectorName: 'Amarillo',
      assignedPopulation: 9500,
      waitingCount: 168,
      criticalCount: 2,
      weeklyCapacity: 40,
      pressurePercentage: 52,
      status: 'OPTIMO'
    }
  ],
  explanationSummary: 'La Torre de Control DM2 - ECICEP resguarda la continuidad del cuidado con la mínima exposición de datos sensibles. El algoritmo prioriza por HbA1c descompensada, eventos de urgencia agudos y brechas de control sin revelar identidades en las pantallas generales.'
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-1001',
    timestamp: '2026-08-05 08:30:12',
    patientId: 'PAT-005',
    patientRut: '18.943.***-*',
    patientName: 'V.N.S. [DM2-005]',
    action: 'RECALCULO_ECICEP',
    performedBy: 'Algoritmo ECICEP DM2 (Automático)',
    role: 'Sistema Torre de Control',
    details: 'Detección de alerta DM2 Gestacional con hiperglicemia. Salto automático a Posición #5.',
    previousPosition: 35,
    newPosition: 5
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-08-05 08:00:45',
    patientId: 'PAT-002',
    patientRut: '12.405.***-*',
    patientName: 'H.R.F. [DM2-002]',
    action: 'DERIVACION_SECUNDARIA',
    performedBy: 'Dr. Manuel Contreras',
    role: 'Médico Contralor ECICEP',
    details: 'Aprobación de interconsulta a Endocrinología / Pie Diabético en Hospital Salvador.',
    contralorNote: 'Caso con criterios de nivel secundario. Se emite SIC y se agenda cita puente en CESFAM.'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-08-04 16:30:00',
    patientId: 'PAT-003',
    patientRut: '17.102.***-*',
    patientName: 'J.A.M. [DM2-003]',
    action: 'VALIDACION_CONTRALOR',
    performedBy: 'Dra. María Paz Henríquez',
    role: 'Médico Contralor ECICEP',
    details: 'Validación de priorización por descompensación HbA1c 9.8% e inadherencia farmacológica.',
    previousPosition: 12,
    newPosition: 3,
    contralorNote: 'Validado. Citar a gestor de casos ECICEP.'
  }
];

export const DATASET_PRESETS: DatasetPreset[] = [
  {
    id: 'cesfam-ariztia',
    name: 'CESFAM Dr. Aníbal Ariztía (Población 51.600 hab.)',
    description: 'Comuna con alta prevalencia de Diabetes Mellitus Tipo 2 y Riesgo Cardiovascular bajo estrategia ECICEP.',
    cesfamName: 'CESFAM Dr. Aníbal Ariztía',
    defaultWeeklySlots: 210,
    patients: INITIAL_PATIENTS
  },
  {
    id: 'cesfam-matta-sur',
    name: 'CESFAM Matta Sur (Población 38.200 hab.)',
    description: 'Enfoque en personas con DM2 y multimorbilidad severa (G3 ECICEP).',
    cesfamName: 'CESFAM Matta Sur',
    defaultWeeklySlots: 175,
    patients: INITIAL_PATIENTS.map((p, idx) => ({
      ...p,
      id: `MS-${p.id}`,
      cesfamName: 'CESFAM Matta Sur',
      currentPosition: idx + 1,
      daysOnWaitlist: p.daysOnWaitlist + 15
    }))
  },
  {
    id: 'cesfam-san-rafael',
    name: 'CESFAM San Rafael (Población 29.400 hab.)',
    description: 'Población periurbana con alto índice de descompensación de glicemia.',
    cesfamName: 'CESFAM San Rafael',
    defaultWeeklySlots: 140,
    patients: INITIAL_PATIENTS.map((p, idx) => ({
      ...p,
      id: `SR-${p.id}`,
      cesfamName: 'CESFAM San Rafael',
      currentPosition: idx + 1,
      daysOnWaitlist: p.daysOnWaitlist - 10
    }))
  }
];
