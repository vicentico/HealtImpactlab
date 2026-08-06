# Política de Privacidad Técnica — Health OS

> **Versión:** 1.0.0
> **Fecha de vigencia:** 1 de diciembre de 2026 (entrada en vigor Ley 21.719)
> **Producto:** Health OS — Sistema de Gestión de Lista de Espera APS
> **Certamen:** Impact Lab
> **Repositorio:** `vicentico/HealtImpactlab`
> **Clasificación:** Documento técnico interno — cumplimiento normativo

---

## 1. Propósito y Alcance

Este documento establece los principios técnicos y las medidas de implementación que **Health OS** adopta para cumplir con la **Ley N° 21.719 sobre Protección de Datos Personales de Chile**, que entra en plena vigencia el **1 de diciembre de 2026**.

Health OS procesa datos clínicos de pacientes del sistema de Atención Primaria de Salud (APS) chileno para:

- Calcular el puntaje de riesgo algorítmico NT 118 / ECICEP (Norma Técnica 118, MINSAL)
- Gestionar la lista de espera priorizada de pacientes DM2 y cardiovasculares
- Registrar las decisiones de la Contraloría Médica en bitácora auditable

**Health OS no almacena, procesa ni transmite datos personales identificadores directos** de pacientes fuera del entorno seguro del CESFAM origen. Toda operación interna utiliza **datos pseudonimizados o anonimizados** según el nivel de sensibilidad.

---

## 2. Marco Normativo Aplicable

| Norma | Descripción | Vigencia |
|---|---|---|
| **Ley 21.719** | Ley de Protección de Datos Personales Chile | 1 dic 2026 |
| **Ley 20.584** | Derechos y Deberes del Paciente | Vigente |
| **Norma Técnica 118 MINSAL** | Criterios de Priorización NT 118 / ECICEP | Vigente |
| **Circular N°A15/14 MINSAL** | Confidencialidad de la Ficha Clínica | Vigente |

---

## 3. Clasificación de Datos Procesados

### 3.1 Datos Sensibles de Salud (Art. 16 Ley 21.719)

Los siguientes datos son clasificados como **datos sensibles** y requieren el nivel máximo de protección:

| Campo clínico | Tipo | Tratamiento en Health OS |
|---|---|---|
| HbA1c (%) | Numérico clínico | Pseudonimizado — sin vínculo a identidad |
| VFG (mL/min) | Numérico clínico | Pseudonimizado |
| Presión Arterial (mmHg) | Numérico clínico | Pseudonimizado |
| Úlcera de pie diabético | Booleano clínico | Pseudonimizado |
| Retinopatía diabética | Booleano clínico | Pseudonimizado |
| Días en lista de espera | Numérico operacional | Pseudonimizado |

### 3.2 Datos Identificadores Directos

| Campo | Tipo | Tratamiento en Health OS |
|---|---|---|
| RUT | Identificador único nacional | **Enmascarado** en API y UI; **hasheado** en persistencia |
| Nombre completo | Identificador personal | Pseudonimizado con ID interno |
| Fecha de nacimiento | Identificador personal | Solo edad (dato derivado) |

### 3.3 Datos Operacionales

| Campo | Tipo | Tratamiento |
|---|---|---|
| ID interno paciente (`PAT-XXX`) | Pseudónimo | Generado localmente, sin mapeo externo |
| Nombre del médico contralor | Identificador profesional | Registrado con firma en audit log |
| Timestamp de acciones | Metadato operacional | Registrado íntegramente para trazabilidad |

---

## 4. Principios de Privacy by Design Implementados

Health OS implementa los **7 principios de Privacy by Design** (Ann Cavoukian) como requisito de arquitectura, no como característica opcional.

### 4.1 Proactivo, no Reactivo

La protección de datos está integrada desde el diseño del motor NT 118. Ningún endpoint del API retorna datos identificadores sin pasar por la capa de enmascaramiento.

```
Flujo de datos:
CESFAM / SIGTE → [Pseudonimización en origen] → Health OS API → Motor NT 118
                                                              ↓
                                                   UI Torre de Control
                                                   (RUT enmascarado, ID pseudónimo)
```

### 4.2 Privacidad como Configuración Predeterminada

- La capa de enmascaramiento se aplica **siempre**, sin configuración explícita por parte del operador.
- El modo offline (fallback) usa exclusivamente **datos sintéticos** que replican la distribución estadística clínica sin corresponder a ningún paciente real.

### 4.3 Privacidad Incorporada al Diseño

| Componente | Implementación |
|---|---|
| `backend/app/core/privacy.py` | `mask_rut()` — enmascaramiento del cuerpo del RUT |
| `backend/app/core/privacy.py` | `hash_rut()` — SHA-256 con sal para persistencia |
| `backend/app/data/mock_db.py` | `format_patient_response()` — aplica masking en todo response |
| `src/services/api.ts` | `fallbackPatientsStore` — datos sintéticos en modo offline |
| `src/data/mockPatients.ts` | Dataset sintético — RUTs ficticios estadísticamente válidos |

### 4.4 Funcionalidad Total — Sin Compromisos

El enmascaramiento y hashing no degradan la funcionalidad clínica:
- El motor NT 118 opera **exclusivamente sobre variables numéricas clínicas** — no requiere el RUT ni el nombre.
- La Contraloría Médica identifica al paciente por su **posición en la lista priorizada** y su ID pseudónimo, no por su identidad.

### 4.5 Seguridad de Extremo a Extremo

- Comunicación Frontend ↔ Backend exclusivamente sobre **HTTPS en producción**
- CORS configurado con `allow_origins` restrictivo por entorno
- No se loguean datos clínicos en archivos de log o salida de consola

### 4.6 Visibilidad y Transparencia

- El audit log registra **quién tomó la decisión y cuándo**, no los datos clínicos completos del paciente
- Cada entrada del `auditHistory` contiene: timestamp, nombre del médico, rol, acción, nota clínica mínima requerida

### 4.7 Respeto por la Privacidad del Usuario (Paciente)

- El sistema no expone datos del paciente a roles no autorizados
- El médico contralor solo accede al nivel de detalle necesario para validar la priorización
- No existe exportación de datos sin control de acceso por rol

---

## 5. Implementación Técnica del Enmascaramiento (Ley 21.719, Art. 14)

### 5.1 `mask_rut(rut: str) → str`

Implementado en [`backend/app/core/privacy.py`](./backend/app/core/privacy.py).

**Algoritmo:**
1. Normaliza el RUT (elimina puntos y guión)
2. Separa cuerpo y dígito verificador
3. Enmascara los últimos 3 dígitos del cuerpo con `***`
4. Reconstruye el formato estándar chileno `XX.XXX.***-X`

**Ejemplos:**
```
12.458.930-K  →  12.458.***-K
9.310.224-8   →   9.310.***-8
12458930K     →  12.458.***-K  (normalización automática)
```

**Idempotencia:** aplicar `mask_rut()` sobre un RUT ya enmascarado retorna el mismo valor sin error.

### 5.2 `hash_rut(rut: str) → str`

**Algoritmo:** SHA-256 con sal de 32 bytes generada en `settings.RUT_SALT` (variable de entorno, no hardcodeada).

```python
SHA-256(SALT + normalize(rut)) → hex string de 64 caracteres
```

- El hash es **unidireccional** — no puede revertirse a RUT original
- El mismo RUT en distintos entornos produce hashes distintos (sal diferente por entorno)
- Verificado en test `test_hash_rut_sha256_salted` (46 tests passing)

---

## 6. Datos Sintéticos en Entornos de Desarrollo y Testing

**Health OS nunca utiliza datos de pacientes reales en entornos de desarrollo, testing o demostración.**

El dataset de referencia (`src/data/mockPatients.ts` y `backend/app/data/mock_db.py`) contiene:

- **RUTs ficticios** que pasan la validación del dígito verificador chileno pero no corresponden a personas reales
- **Variables clínicas** con distribución estadística representativa de la epidemiología DM2/APS en Chile (basada en datos agregados publicados por MINSAL)
- **Nombres ficticios** generados sintéticamente
- **10 pacientes sintéticos** que cubren todos los niveles de riesgo NT 118: CRÍTICO, ALTO, MEDIO y BAJO

---

## 7. Derechos de los Titulares (Ley 21.719, Capítulo IV)

| Derecho | Mecanismo en Health OS |
|---|---|
| **Acceso** | El CESFAM origen es el responsable del tratamiento; Health OS actúa como encargado |
| **Rectificación** | Las correcciones se gestionan en el sistema fuente (SIGTE/CESFAM); Health OS actualiza via API |
| **Cancelación / Olvido** | `DELETE /api/pacientes/{id}` elimina el registro del estado en memoria; el CESFAM elimina en origen |
| **Oposición** | El paciente puede solicitar al CESFAM la exclusión de la priorización algorítmica |
| **Portabilidad** | Disponible en formato JSON estándar via `GET /api/pacientes/{id}` con autenticación |

> **Nota:** Health OS es un **encargado del tratamiento** (Art. 5 letra k Ley 21.719). El **responsable del tratamiento** es el CESFAM o red asistencial que lo implemente.

---

## 8. Roles y Responsabilidades

| Rol | Descripción | Acceso en Health OS |
|---|---|---|
| **Médico Contralor APS** | Valida y aprueba/rechaza la priorización | Panel de Contraloría — lectura clínica + acción |
| **Enfermera Coordinadora** | Gestiona la lista operativa del CESFAM | Vista de lista priorizada — solo lectura |
| **Administrador del Sistema** | Configuración y mantenimiento | Consola de administración — sin datos clínicos |
| **Motor NT 118** | Proceso algorítmico automatizado | Variables clínicas pseudonimizadas únicamente |

---

## 9. Auditoría y Trazabilidad

Cada acción sobre un paciente en Health OS genera una entrada inmutable en el `auditHistory`:

```json
{
  "id": "AUD-A3F9B2",
  "timestamp": "2026-08-06T05:00:00Z",
  "userName": "Dr. Alejandro Silva",
  "userRole": "Médico Contralor APS",
  "action": "STATUS_OVERRIDE",
  "previousStatus": "PENDIENTE",
  "newStatus": "APROBADO",
  "clinicalNote": "Paciente con HbA1c crítica. Aprobado para cita prioritaria con Diabetología."
}
```

El audit log:
- Es **append-only** — no permite edición ni eliminación de entradas
- No contiene datos biométricos del paciente
- Identifica al profesional responsable de cada decisión

---

## 10. Compromisos para Producción (Antes del 1 de Diciembre 2026)

Los siguientes elementos deben implementarse antes del despliegue productivo:

- [ ] **Autenticación de médicos** con 2FA obligatorio (OAuth2 + TOTP)
- [ ] **Autorización por rol** con JWT firmado — scopes diferenciados por función
- [ ] **HTTPS obligatorio** en todos los entornos (Let's Encrypt o certificado institucional)
- [ ] **Registro de accesos** a nivel de infraestructura (log de IPs + usuario + timestamp)
- [ ] **Acuerdo de encargo de tratamiento** firmado con cada CESFAM cliente
- [ ] **Evaluación de Impacto en Privacidad (DPIA)** según Art. 69 Ley 21.719
- [ ] **DPO designado** o asesor externo de protección de datos
- [ ] **Política de retención de datos** — definir TTL por tipo de dato
- [ ] **Plan de respuesta a brechas** (Art. 50 Ley 21.719 — notificación en 72h)
- [ ] **Sal de RUT por entorno** cargada desde variables de entorno seguras (no hardcodeada)

---

## 11. Contacto

Para consultas sobre privacidad y protección de datos en Health OS:

**Equipo Health OS — Impact Lab**
Repositorio: [github.com/vicentico/HealtImpactlab](https://github.com/vicentico/HealtImpactlab)
Branch producción: `Maxi`

---

*Este documento es un artefacto técnico vivo. Debe actualizarse ante cambios en la arquitectura del sistema, nuevas resoluciones de la Agencia de Protección de Datos Personales (APDP) de Chile, o modificaciones en la Ley 21.719.*
