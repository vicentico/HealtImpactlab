-- ============================================================================
-- HEALTH OS ENTERPRISE — SUPABASE POSTGRESQL SCHEMA DEFINITION
-- Ley 21.719 (Chile) & Norma Técnica 118 MINSAL (ECICEP)
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla Principal de Pacientes (Datos Sensibles Pseudonimizados)
CREATE TABLE IF NOT EXISTS patients (
  id                          TEXT PRIMARY KEY,                  -- Ej: "PAT-001"
  rut_masked                  TEXT NOT NULL,                     -- Ej: "12.458.***-K" (Ley 21.719)
  rut_hash                    TEXT NOT NULL,                     -- SHA-256 salted hash
  full_name                   TEXT NOT NULL,
  age                         INTEGER NOT NULL,
  gender                      TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  sector                      TEXT NOT NULL,                     -- Ej: "SECTOR_ROJO"
  cesfam_name                 TEXT NOT NULL,                     -- Ej: "CESFAM Carol Urzúa"
  hba1c                       NUMERIC(4,1) NOT NULL,
  systolic_bp                 INTEGER NOT NULL,
  diastolic_bp                INTEGER NOT NULL,
  vfg                         NUMERIC(5,1) NOT NULL,
  has_foot_ulcer              BOOLEAN NOT NULL DEFAULT false,
  has_retinopathy             BOOLEAN NOT NULL DEFAULT false,
  days_in_waiting_list        INTEGER NOT NULL DEFAULT 0,
  nt118_total_score           INTEGER NOT NULL DEFAULT 0,
  nt118_risk_level            TEXT NOT NULL CHECK (nt118_risk_level IN ('CRITICO', 'ALTO', 'MEDIO', 'BAJO')),
  nt118_subscores             JSONB NOT NULL DEFAULT '{}'::jsonb,
  nt118_decompensations       JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority_position           INTEGER NOT NULL DEFAULT 999,
  previous_priority_position  INTEGER NOT NULL DEFAULT 999,
  contraloria_status          TEXT NOT NULL DEFAULT 'PENDIENTE'
    CHECK (contraloria_status IN ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'DERIVADO', 'REQUIERE_REVISION', 'OBSERVADO')),
  assigned_physician          TEXT,
  last_review_date            TEXT,
  created_at                  TIMESTAMPTZ DEFAULT now(),
  updated_at                  TIMESTAMPTZ DEFAULT now()
);

-- 2. Bitácora Auditable de Contraloría Médica (Append-Only)
CREATE TABLE IF NOT EXISTS audit_log (
  id                          TEXT PRIMARY KEY,                  -- Ej: "AUD-A3F9B2"
  patient_id                  TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  timestamp                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_name                   TEXT NOT NULL,
  user_role                   TEXT NOT NULL,
  action                      TEXT NOT NULL,
  previous_status             TEXT NOT NULL,
  new_status                  TEXT NOT NULL,
  clinical_note               TEXT NOT NULL
);

-- 3. Infraestructura y Capacidad de Planta (Boxes y Profesionales)
CREATE TABLE IF NOT EXISTS capacity_boxes (
  id                          TEXT PRIMARY KEY,                  -- Ej: "BOX-001"
  cesfam_name                 TEXT NOT NULL,
  box_number                  INTEGER NOT NULL,
  box_type                    TEXT NOT NULL,                     -- "MEDICO", "ENFERMERA", "MULTIDISCIPLINARIO"
  is_active                   BOOLEAN NOT NULL DEFAULT true,
  weekly_hours_capacity       INTEGER NOT NULL DEFAULT 44,
  current_weekly_occupancy    INTEGER NOT NULL DEFAULT 0
);

-- 4. Topes de Derivación y Cuotas de Red Hospitalaria
CREATE TABLE IF NOT EXISTS referral_quotas (
  id                          TEXT PRIMARY KEY,                  -- Ej: "QUOTA-DIABETO-01"
  cesfam_name                 TEXT NOT NULL,
  hospital_target             TEXT NOT NULL,                     -- Ej: "Hospital San Borja Arriarán"
  specialty                   TEXT NOT NULL,                     -- "DIABETOLOGIA", "NEFROLOGIA", "PIE_DIABETICO"
  monthly_quota_limit         INTEGER NOT NULL DEFAULT 15,
  monthly_quota_used          INTEGER NOT NULL DEFAULT 0,
  valid_month                 TEXT NOT NULL                      -- "2026-08"
);

-- 5. Registro de Asignaciones e Interconsultas
CREATE TABLE IF NOT EXISTS assignments (
  id                          TEXT PRIMARY KEY,
  patient_id                  TEXT NOT NULL REFERENCES patients(id),
  assignment_type             TEXT NOT NULL CHECK (assignment_type IN ('INTERNA_APS', 'DERIVACION_RED')),
  target_professional         TEXT,
  target_specialty            TEXT,
  target_facility             TEXT NOT NULL,
  scheduled_date              TEXT,
  status                      TEXT NOT NULL DEFAULT 'PENDIENTE',
  created_at                  TIMESTAMPTZ DEFAULT now()
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_patients_sector ON patients(sector);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(contraloria_status);
CREATE INDEX IF NOT EXISTS idx_patients_risk ON patients(nt118_risk_level);
CREATE INDEX IF NOT EXISTS idx_patients_priority ON patients(priority_position);
CREATE INDEX IF NOT EXISTS idx_audit_patient_id ON audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_quotas_cesfam_month ON referral_quotas(cesfam_name, valid_month);
