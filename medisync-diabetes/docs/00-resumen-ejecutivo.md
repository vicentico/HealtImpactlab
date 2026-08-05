# 00. Resumen ejecutivo

## Que es MediSync-Diabetes

MediSync-Diabetes es una prueba de concepto (PoC) que demuestra que un sistema **multiagente de IA** puede
acelerar la descompresion de listas de espera de pacientes diabeticos derivados desde APS/CESFAM hacia
especialidad (Diabetologia/Endocrinologia), automatizando dos decisiones que hoy son manuales y lentas:

1. **Evaluacion de riesgo clinico** a partir de examenes (HbA1c, glicemia en ayunas) y comorbilidades.
2. **Priorizacion de agenda** combinando ese riesgo con el tiempo de espera acumulado y la carga de la especialidad.

Un tercer agente asigna el cupo de agenda mas adecuado una vez que un profesional confirma (o ajusta) la
prioridad sugerida por la IA. Todo el razonamiento se hace con llamadas reales a la API de Claude (Anthropic),
no con datos simulados ni reglas fijas: cada justificacion clinica que se muestra en pantalla fue generada
por el modelo a partir de los datos reales del caso.

## Por que esta PoC y no el sistema completo

El proyecto nace de un prompt maestro (`../claude.md`) que describe una plataforma completa de nivel
empresa: 9 agentes, Angular 20 con KPIs y dashboards, interoperabilidad HL7 FHIR/SNOMED/LOINC, 500 pacientes
de datos dummy, C4 de 4 niveles, backlog completo, etc. Esa es la **vision de largo plazo**.

Esta PoC es deliberadamente mas acotada: un flujo funcional de punta a punta, con 3 agentes reales, un
frontend minimo de 3 pantallas y documentacion enfocada en explicar como funciona, no en cubrir los 19
entregables del prompt maestro. El detalle de que entra y que queda fuera esta en
[01-vision-y-alcance-poc.md](01-vision-y-alcance-poc.md); el roadmap hacia la vision completa esta en
[07-roadmap-futuro.md](07-roadmap-futuro.md).

## Que se construyo

| Capa | Tecnologia | Contenido |
|---|---|---|
| Dominio | .NET 10 (C#) | Entidades DDD: Paciente, Interconsulta, ListaEsperaItem, Priorizacion, AgendaSlot, auditoria |
| Aplicacion | MediatR (CQRS), FluentValidation | Casos de uso, orquestacion del flujo, notificacion que simula un event bus |
| IA / Agentes | HttpClient propio hacia Anthropic Messages API | `AgentLoop` (port de `rusty-hand-runtime/agent_loop.rs`), 3 agentes, 8 tools |
| Persistencia | MongoDB (Docker) | 11 colecciones, documentos de persistencia separados del dominio |
| API | ASP.NET Core Minimal API | Endpoints REST para pacientes, interconsultas y trazabilidad de casos |
| Frontend | Angular 20 (Standalone + Signals) | Lista de espera, ingreso de paciente, detalle/trazabilidad del caso |

## Como se ve funcionando

Un caso real ejecutado durante el desarrollo de esta PoC (ver [05-flujo-secuencia.md](05-flujo-secuencia.md)
para el detalle completo):

> Paciente de 68 años, HbA1c 9.2%, glicemia 180 mg/dL, hipertenso. El Risk Agent calculo `RiskLevel=Alto`
> (score 75) razonando explicitamente sobre los rangos clinicos de referencia. El Priority Agent, viendo ese
> riesgo mas una carga baja de la especialidad (2 pacientes en espera), asigno `PriorityTier=P1`. Tras la
> revision medica, el Scheduler Agent asigno el cupo mas proximo disponible, justificando la eleccion por el
> tier P1. Todo el recorrido (Clasificado -> Priorizado -> EnRevision -> Agendado -> Confirmado -> Atendido ->
> Cerrado) quedo auditado con timestamps, tool calls y conteo real de tokens de la API de Anthropic.

## Alcance de este documento

Esta carpeta `docs/` documenta la especificacion tecnica de la PoC tal como quedo implementada, no un diseño
aspiracional. Cada documento referencia archivos y clases reales del repositorio.
