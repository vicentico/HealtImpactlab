# Health OS — Handoff: Migración a Producción (Supabase + Vercel)

> **Asignado a:** [Team Member]
> **Branch de trabajo:** `Maxi`
> **Estado actual:** Backend local funcional (FastAPI + Python) · Frontend buildeable · 46/46 tests pasando
> **Objetivo de esta tarea:** Migrar la persistencia a Supabase PostgreSQL, exponer el backend en Railway (o Render), y desplegar el frontend en Vercel.

---

## Contexto del proyecto

**Health OS** es un sistema de gestión de lista de espera para Atención Primaria de Salud (APS) en Chile. Prioriza pacientes DM2/cardiovasculares usando el algoritmo NT 118 de MINSAL.

El producto fue desarrollado para el certamen **Impact Lab**. El código vive en:

```
github.com/vicentico/HealtImpactlab  (branch: Maxi)
└── impact_lab/
    ├── src/              ← Frontend React 18 + TypeScript + Vite
    ├── backend/          ← Backend Python FastAPI
    │   ├── app/
    │   │   ├── main.py           ← Servidor FastAPI
    │   │   ├── engine/nt118.py   ← Motor de priorización NT 118
    │   │   ├── core/privacy.py   ← Masking/hash de RUT (Ley 21.719)
    │   │   ├── data/mock_db.py   ← ⚠️ BD en memoria — esto hay que migrar
    │   │   ├── schemas/          ← Modelos Pydantic (CamelModel)
    │   │   └── api/endpoints/    ← Rutas REST
    │   ├── tests/                ← 46 tests E2E (pytest)
    │   └── requirements.txt
    ├── PRIVACY_POLICY.md         ← Política de privacidad técnica (Ley 21.719)
    └── package.json
```

---

## Arquitectura actual (local)

```
Frontend React (Vite)          Backend FastAPI (Python)
localhost:5173          ──►    localhost:8000
                               │
                               ├── GET  /api/pacientes
                               ├── POST /api/priorizacion/calcular
                               └── PATCH /api/pacientes/{id}/contraloria
                                        │
                                   mock_db.py  ← Lista en memoria (NO persistente)
```

## Arquitectura objetivo (producción)

```
Frontend React (Vite)          Backend FastAPI (Python)
Vercel (CDN global)     ──►    Railway / Render
                               │
                               ├── GET  /api/pacientes
                               ├── POST /api/priorizacion/calcular
                               └── PATCH /api/pacientes/{id}/contraloria
                                        │
                               Supabase PostgreSQL  ← Persistencia real
```

---

## Tarea 1 — Supabase: Schema de base de datos

### 1.1 Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → New Project
2. Nombre: `health-os-prod`
3. Región: `South America (São Paulo)` (más cercana a Chile)
4. Guardar: `SUPABASE_URL` y `SUPABASE_ANON_KEY` (Panel → Settings → API)

### 1.2 Ejecutar el schema SQL

En el SQL Editor de Supabase, ejecutar:

```sql
-- Tabla principal de pacientes (datos pseudonimizados)
CREATE TABLE patients (
  id                        TEXT PRIMARY KEY,          -- "PAT-001"
  rut_masked                TEXT NOT NULL,             -- "12.458.***-K"
  rut_hash                  TEXT NOT NULL,             -- SHA-256 salteado
  full_name                 TEXT NOT NULL,
  age                       INTEGER NOT NULL,
  gender                    TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  sector                    TEXT NOT NULL,
  cesfam_name               TEXT NOT NULL,
  hba1c                     NUMERIC(4,1) NOT NULL,
  systolic_bp               INTEGER NOT NULL,
  diastolic_bp              INTEGER NOT NULL,
  vfg                       NUMERIC(5,1) NOT NULL,
  has_foot_ulcer            BOOLEAN NOT NULL DEFAULT false,
  has_retinopathy           BOOLEAN NOT NULL DEFAULT false,
  days_in_waiting_list      INTEGER NOT NULL DEFAULT 0,
  nt118_total_score         INTEGER,
  nt118_risk_level          TEXT CHECK (nt118_risk_level IN ('CRITICO','ALTO','MEDIO','BAJO')),
  nt118_subscores           JSONB,
  nt118_decompensations     JSONB,
  priority_position         INTEGER,
  previous_priority_position INTEGER,
  contraloria_status        TEXT NOT NULL DEFAULT 'PENDIENTE'
    CHECK (contraloria_status IN ('PENDIENTE','APROBADO','RECHAZADO','DERIVADO','REQUIERE_REVISION','OBSERVADO')),
  assigned_physician        TEXT,
  last_review_date          TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- Audit log inmutable (append-only)
CREATE TABLE audit_log (
  id                TEXT PRIMARY KEY,           -- "AUD-A3F9B2"
  patient_id        TEXT NOT NULL REFERENCES patients(id),
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_name         TEXT NOT NULL,
  user_role         TEXT NOT NULL,
  action            TEXT NOT NULL,
  previous_status   TEXT NOT NULL,
  new_status        TEXT NOT NULL,
  clinical_note     TEXT NOT NULL
);

-- Índices para los filtros de la API
CREATE INDEX idx_patients_sector ON patients(sector);
CREATE INDEX idx_patients_contraloria_status ON patients(contraloria_status);
CREATE INDEX idx_patients_nt118_risk_level ON patients(nt118_risk_level);
CREATE INDEX idx_patients_cesfam_name ON patients(cesfam_name);
CREATE INDEX idx_patients_priority_position ON patients(priority_position);
CREATE INDEX idx_audit_log_patient_id ON audit_log(patient_id);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 1.3 Seed con datos sintéticos

Importar los 10 pacientes del mock actual ejecutando el script de seed:

```bash
cd impact_lab/backend
python3 scripts/seed_supabase.py
```

> ⚠️ Este script hay que crearlo (ver Tarea 2).

---

## Tarea 2 — Backend: Migrar `mock_db.py` a Supabase

### 2.1 Agregar dependencias

En `backend/requirements.txt`, agregar:

```
supabase>=2.4.0
python-dotenv>=1.0.0
```

### 2.2 Variables de entorno

Crear `backend/.env` (NO commitear — está en `.gitignore`):

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RUT_SALT=genera-un-string-aleatorio-de-32-chars-aqui
```

### 2.3 Reemplazar `mock_db.py` por cliente Supabase

El archivo `backend/app/data/mock_db.py` implementa 3 funciones que los endpoints usan:

```python
get_all_patients(sector, status, risk_level, cesfam_name) → List[dict]
get_patient_by_id(patient_id) → Optional[dict]
format_patient_response(patient) → dict
```

Reemplazar `get_all_patients` y `get_patient_by_id` por queries a Supabase:

```python
from supabase import create_client
from app.core.config import settings   # SUPABASE_URL, SUPABASE_KEY

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_all_patients(sector=None, status=None, risk_level=None, cesfam_name=None):
    q = supabase.table("patients").select("*, audit_log(*)")
    if sector:      q = q.eq("sector", sector)
    if status:      q = q.eq("contraloria_status", status)
    if risk_level:  q = q.eq("nt118_risk_level", risk_level)
    if cesfam_name: q = q.eq("cesfam_name", cesfam_name)
    q = q.order("priority_position", desc=False)
    return [format_patient_response(p) for p in q.execute().data]
```

> `format_patient_response()` ya hace el masking del RUT — **no tocar esa función**.

### 2.4 Crear script de seed

Nuevo archivo `backend/scripts/seed_supabase.py` que tome los datos de `mock_db.get_initial_mock_patients()` y los inserte en Supabase. Los 10 pacientes sintéticos están ahí listos.

---

## Tarea 3 — Frontend: Variable de entorno para la API URL

### 3.1 El problema actual

En `src/services/api.ts` línea 3:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';  // ← hardcodeado
```

### 3.2 La solución

Crear `impact_lab/.env.production`:

```env
VITE_API_BASE_URL=https://tu-backend-en-railway.up.railway.app/api
```

Cambiar en `api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
```

---

## Tarea 4 — Deploy Frontend en Vercel

1. Instalar Vercel CLI: `npm i -g vercel`
2. Desde `impact_lab/`: `vercel --prod`
3. Configurar en el dashboard de Vercel:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variable:** `VITE_API_BASE_URL=https://...railway.app/api`

O simplemente conectar el repo de GitHub en [vercel.com](https://vercel.com) → Import → seleccionar `vicentico/HealtImpactlab` → Root Directory: `impact_lab`.

---

## Tarea 5 — Deploy Backend en Railway

1. Ir a [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Seleccionar `vicentico/HealtImpactlab`
3. Configurar:
   - **Root Directory:** `impact_lab/backend`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Variables de entorno en Railway:
   ```
   SUPABASE_URL=...
   SUPABASE_KEY=...
   RUT_SALT=...
   ```

---

## Tests que deben seguir pasando después de la migración

```bash
cd impact_lab/backend
.venv/bin/pytest tests/ -v
# Esperado: 46 passed
```

Los tests son independientes de la BD (usan `TestClient` con estado en memoria via `conftest.py` reset). No es necesario mockar Supabase para los tests existentes.

---

## Archivos clave a leer antes de empezar

| Archivo | Por qué leerlo |
|---|---|
| [`backend/app/data/mock_db.py`](./backend/app/data/mock_db.py) | La BD actual — todo lo que hay que migrar |
| [`backend/app/core/privacy.py`](./backend/app/core/privacy.py) | Masking/hash de RUT — NO modificar |
| [`backend/app/schemas/patient.py`](./backend/app/schemas/patient.py) | Modelos Pydantic — mapean 1:1 con las tablas SQL |
| [`backend/app/api/endpoints/pacientes.py`](./backend/app/api/endpoints/pacientes.py) | Los 3 endpoints — solo cambiar la fuente de datos |
| [`src/services/api.ts`](./src/services/api.ts) | Cliente frontend — solo cambiar `API_BASE_URL` |
| [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md) | Requisitos legales (Ley 21.719) — leer antes de tocar datos |

---

## Lo que NO hay que tocar

- `backend/app/engine/nt118.py` — motor de scoring (testeado, estable)
- `backend/app/core/privacy.py` — masking/hash de RUT (compliance legal)
- `backend/tests/` — suite de tests existente
- `src/types/patient.ts` — modelos TypeScript canónicos
- `src/components/` — componentes UI (listos)

---

## Preguntas o bloqueos

Contactar al equipo Health OS vía el repo: [github.com/vicentico/HealtImpactlab](https://github.com/vicentico/HealtImpactlab)
