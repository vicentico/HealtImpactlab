# MediSync-Diabetes — PoC

Prueba de concepto de un sistema multiagente de IA para descomprimir listas de espera de pacientes
diabeticos en el sistema publico chileno, mediante priorizacion inteligente (Risk Agent + Priority Agent) y
coordinacion automatica de agenda (Scheduler Agent). Ver documentacion completa en [docs/](docs/), empezando
por [docs/00-resumen-ejecutivo.md](docs/00-resumen-ejecutivo.md).

## Stack

- Backend: .NET 10, Clean Architecture, CQRS/MediatR, FluentValidation
- IA: HttpClient propio hacia la Anthropic Messages API (`MediSync.AI`), sin SDK oficial (ver
  [docs/rustyhand-analisis.md](docs/rustyhand-analisis.md))
- Persistencia: MongoDB (Docker)
- Frontend: Angular 20, Standalone Components + Signals

## Requisitos

- .NET SDK 10+
- Docker (para MongoDB)
- Node 20+ y Angular CLI 20 (solo si vas a correr el frontend)
- Una API key de Anthropic (`ANTHROPIC_API_KEY`) — sin ella, el backend funciona pero los endpoints que
  invocan agentes IA devuelven `502` con el error real de Anthropic (no hay fallback simulado).

## Levantar el backend

```bash
# 1. Mongo (queda en localhost:27018, no 27017, para no chocar con otros proyectos locales)
docker compose up -d

# 2. Configurar la API key de Anthropic (no commitear secretos)
dotnet user-secrets init --project src/MediSync.Api
dotnet user-secrets set "Anthropic:ApiKey" "sk-ant-..." --project src/MediSync.Api

# 3. Correr la API (ASPNETCORE_ENVIRONMENT=Development es necesario para que se carguen los user-secrets)
ASPNETCORE_ENVIRONMENT=Development dotnet run --project src/MediSync.Api
# API en http://localhost:5182 (perfil "http" de src/MediSync.Api/Properties/launchSettings.json;
# el perfil "https" expone además https://localhost:7117)
```

Al arrancar, la API siembra automaticamente datos dummy (24 pacientes, 5 profesionales, 3 CESFAM, 2
hospitales, 2 especialidades, cupos de agenda) si las colecciones estan vacias — ver
`MediSync.Infrastructure/Seed/DummyDataSeeder.cs`.

## Probar el flujo completo (curl)

Ver el detalle linea por linea, con ejemplo real capturado, en
[docs/05-flujo-secuencia.md](docs/05-flujo-secuencia.md). Resumen:

```bash
curl http://localhost:5182/api/lista-espera

curl -X POST http://localhost:5182/api/pacientes -H "Content-Type: application/json" \
  -d '{"run":"11223344-5","nombre":"Juan Perez","fechaNacimiento":"1958-03-12","cesfamOrigenId":"cesfam-001"}'

curl -X POST http://localhost:5182/api/interconsultas -H "Content-Type: application/json" \
  -d '{"pacienteId":"<id>","especialidadId":"diabetologia","motivo":"HbA1c elevada","hbA1c":9.2,"glicemiaAyunas":180,"comorbilidades":["Hipertension"]}'

curl http://localhost:5182/api/casos/<listaEsperaItemId>

curl -X PATCH http://localhost:5182/api/casos/<listaEsperaItemId>/revision -H "Content-Type: application/json" \
  -d '{"aprobadoPor":"Dr. Gonzalez","prioridadConfirmada":"P1"}'

curl -X POST http://localhost:5182/api/casos/<listaEsperaItemId>/confirmar
curl -X POST http://localhost:5182/api/casos/<listaEsperaItemId>/atender
curl -X POST http://localhost:5182/api/casos/<listaEsperaItemId>/cerrar
```

## Levantar el frontend

```bash
cd frontend/medisync-web
npm install
ng serve   # http://localhost:4200 (CORS ya habilitado en MediSync.Api para este origen)
```

## Estructura del repo

Ver [docs/02-arquitectura.md](docs/02-arquitectura.md) para el detalle de capas y decisiones. Resumen:

```
src/MediSync.Domain           Entidades DDD
src/MediSync.Application      Casos de uso (CQRS/MediatR)
src/MediSync.AI                AgentLoop + 3 agentes + tools + manifiestos
src/MediSync.Infrastructure    MongoDB (documentos, repos, seed)
src/MediSync.Api               Minimal API
frontend/medisync-web          Angular 20
dummy-data/                    JSON de datos de referencia para el seeder
docs/                          Especificacion tecnica completa
```
