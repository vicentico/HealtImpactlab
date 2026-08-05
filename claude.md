A continuación tienes un **prompt maestro** diseñado para que un modelo de IA (Claude, GPT-5.5, Gemini o Perplexity Deep Research) actúe como **Arquitecto de Software, Investigador y Tech Lead**, realizando una ingeniería inversa del proyecto Rust, extrayendo únicamente los patrones valiosos y reconstruyéndolos como una **PoC empresarial en .NET 10**, utilizando el **Claude SDK** como motor principal de agentes.

---

# Prompt Maestro — MediSync-Diabetes

## Ingeniería Inversa de RustyHand hacia .NET 10 + Claude SDK + Arquitectura Limpia + MINSAL Chile

Actúa como un equipo compuesto por:

- Software Architect
- AI Agent Architect
- Enterprise Solution Architect
- Clean Architecture Expert (.NET 10)
- MongoDB Architect
- Healthcare Interoperability Expert (HL7 FHIR)
- Especialista en estándares MINSAL Chile
- UX Architect
- Product Owner
- Technical Writer

Tu objetivo NO es traducir código Rust a C#.

Tu objetivo consiste en **extraer la arquitectura, patrones y buenas prácticas** del siguiente proyecto: ubicado en la carpeta "rustyhand" C:\Repos\Hackaton\rustyhand

Analiza especialmente:

- arquitectura
- diseño
- patrones
- separación de responsabilidades
- orquestación
- ciclo de vida de agentes
- comunicación
- memoria
- herramientas
- planificación
- ejecución
- eventos
- observabilidad
- extensibilidad

y reconstruir únicamente las ideas de mayor valor utilizando tecnologías Microsoft modernas.

---

# Objetivo del proyecto

Construir una Prueba de Concepto denominada

# MediSync-Diabetes

para demostrar que un sistema multiagente puede disminuir los tiempos de espera de pacientes con Diabetes dentro del sistema público chileno mediante priorización inteligente y coordinación automática.

El proyecto debe ser funcional pero acotado (MVP de alto nivel).

No debe intentar cubrir todo el sistema de salud.

Debe enfocarse exclusivamente en una especialidad relacionada con pacientes diabéticos.

---

# Objetivos funcionales

El sistema debe simular completamente:

- ingreso del paciente
- lista de espera
- derivación
- revisión clínica
- priorización
- agenda
- coordinación
- seguimiento
- resolución

utilizando IA.

Todas las APIs externas serán simuladas.

Toda la información será Dummy Data.

El diseño debe permitir reemplazar posteriormente las simulaciones por servicios reales.

---

# Investigación inicial

Primero realiza un estudio profundo del repositorio RustyHand.

Debes responder:

## ¿Qué problemas intenta resolver?

## ¿Qué patrones utiliza?

## ¿Qué conceptos vale la pena conservar?

## ¿Qué partes son específicas de Rust?

## ¿Qué partes son independientes del lenguaje?

## ¿Qué mejoras podrían hacerse?

## ¿Qué limitaciones tiene?

## ¿Qué decisiones arquitectónicas fueron acertadas?

## ¿Qué errores evitarías?

---

# Segundo estudio

Investiga el SDK oficial de Claude.

El proyecto NO utilizará el framework original de Rust.

Debe reconstruirse usando el SDK de Claude.

Analiza:

- herramientas
- agentes
- conversaciones
- memoria
- llamadas
- tool use
- context windows
- streaming
- planificación
- límites
- costos

y determina la mejor forma de implementar una arquitectura multiagente empresarial.

---

# Dominio del negocio

El dominio corresponde a

Descompresión de listas de espera de Diabetes.

Inspirarse en el funcionamiento real del sistema chileno.

Considerar:

- APS
- CESFAM
- Hospital
- Especialidad
- Interconsulta
- Derivación
- Contrarreferencia

---

# Procesos mínimos

El flujo mínimo debe incluir:

Paciente

↓

Derivación

↓

Lista de espera

↓

Clasificación

↓

Priorización IA

↓

Revisión médica

↓

Agenda

↓

Confirmación

↓

Atención

↓

Cierre

---

# Casos de uso

Definir todos los casos de uso necesarios.

Ejemplo:

Registrar Paciente

Registrar Interconsulta

Actualizar antecedentes

Ingresar exámenes

Calcular riesgo

Actualizar prioridad

Consultar estado

Asignar agenda

Registrar atención

Cerrar caso

Reingresar paciente

Auditar proceso

etc.

---

# Modelo de datos

Diseñar completamente el modelo del dominio.

Debe seguir buenas prácticas DDD.

Incluir:

Paciente

Interconsulta

ListaEspera

Especialidad

Derivación

Priorización

Evaluación

Agenda

Profesional

Centro de Salud

Estado del Caso

Eventos

Historial

Auditoría

Observaciones

Mensajes IA

Tool Calls

Contexto

Conversation

Agent Execution

Memory

Decision Log

---

# Estándares MINSAL

Toda la estructura debe inspirarse en:

[https://deis.minsal.cl/norma-tecnica-de-estandares-de-informacion-en-salud-eis/](https://deis.minsal.cl/norma-tecnica-de-estandares-de-informacion-en-salud-eis/)

No es necesario implementar completamente la norma.

Debe identificar qué partes aplican al MVP.

Debe proponer una versión simplificada compatible con futura integración.

Considerar:

HL7 FHIR

SNOMED

LOINC

identificadores

codificaciones

eventos clínicos

metadatos

interoperabilidad

---

# Arquitectura objetivo

El resultado debe implementarse en:

.NET 10

utilizando

Clean Architecture

con capas:

Domain

Application

Infrastructure

Presentation

Shared

AI

Agents

Contracts

Persistence

API

Frontend

---

# Backend

ASP.NET Core

Minimal APIs

CQRS

MediatR

FluentValidation

MongoDB

Event Bus (simulado)

Background Services

Dependency Injection

Repository Pattern

Unit of Work cuando sea necesario

Result Pattern

Domain Events

---

# Persistencia

MongoDB

Diseñar las colecciones.

Justificar por qué Mongo es adecuado.

Diseñar índices.

Diseñar documentos.

Preparar el modelo para millones de registros.

---

# Frontend

Angular 20

Angular Material

Signals

Standalone Components

Arquitectura limpia

Debe mostrar trazabilidad completa.

Ejemplos:

Timeline

Estados

Eventos

Agentes ejecutados

Prioridad

Historial

Conversaciones

Decisiones IA

Tiempo de espera

Tiempo estimado

KPIs

---

# Agentes

Diseñar agentes especializados.

Por ejemplo:

Triage Agent

Referral Agent

Priority Agent

Risk Agent

Scheduler Agent

Coordinator Agent

Notification Agent

Audit Agent

Supervisor Agent

---

Cada agente debe definir:

Objetivo

Responsabilidades

Entradas

Salidas

Prompt

Herramientas

Memoria

Eventos

Métricas

Errores

Fallback

---

# Orquestación

Extraer las mejores ideas de RustyHand.

Implementarlas usando Claude SDK.

Mostrar:

Workflow

State Machine

Execution Graph

Agent Graph

Retry

Compensación

Checkpoint

Observabilidad

---

# Observabilidad

Diseñar:

Logs

Tracing

Correlation Id

Execution Timeline

Conversation Timeline

Audit Trail

Decision History

Performance Metrics

---

# Simulación

Todas las APIs serán Dummy.

Simular:

FONASA

Agenda

Laboratorio

Hospital

CESFAM

Notificaciones

Correo

SMS

---

# Dummy Data

Crear datos ficticios para:

500 pacientes

50 profesionales

15 CESFAM

5 hospitales

2000 interconsultas

listas de espera

derivaciones

agenda

atenciones

---

# Escalabilidad

Diseñar pensando desde el inicio en:

microservicios

event sourcing

mensajería

Kafka

Azure Service Bus

RabbitMQ

vector databases

memoria semántica

aunque inicialmente NO se implementen.

---

# Entregables

Generar la documentación completa.

## 1.

Resumen ejecutivo.

---

## 2.

Ingeniería inversa de RustyHand.

---

## 3.

Arquitectura propuesta.

---

## 4.

Justificación técnica.

---

## 5.

Diagramas C4.

Nivel 1

Nivel 2

Nivel 3

Nivel 4

---

## 6.

Diagramas UML.

---

## 7.

Diagramas de secuencia.

---

## 8.

Mapa completo de agentes.

---

## 9.

Mapa de eventos.

---

## 10.

Modelo de dominio.

---

## 11.

Modelo MongoDB.

---

## 12.

Estructura completa de carpetas.

---

## 13.

Roadmap de implementación.

Organizado en sprints.

---

## 14.

Backlog completo.

Historias de usuario.

Criterios de aceptación.

---

## 15.

Definición de MVP.

Qué entra.

Qué queda fuera.

---

## 16.

Riesgos técnicos.

---

## 17.

Riesgos clínicos.

---

## 18.

Métricas de éxito.

Ejemplos:

Tiempo promedio de espera.

Tiempo hasta clasificación.

Tiempo hasta derivación.

Pacientes priorizados automáticamente.

Casos resueltos.

Tiempo ahorrado.

---

## 19.

Arquitectura preparada para evolucionar hacia un sistema nacional.

---

# Restricciones

No traducir Rust línea por línea.

Extraer únicamente los conceptos arquitectónicos.

Aplicar principios SOLID.

Aplicar DDD.

Aplicar Clean Architecture.

Aplicar Vertical Slice cuando sea conveniente.

No sobreingenierizar el MVP.

Cada decisión debe estar justificada.

Cuando existan varias alternativas, compararlas mediante una matriz de decisión indicando ventajas, desventajas, complejidad de implementación, mantenibilidad, escalabilidad y alineación con el objetivo de descompresión de listas de espera. El resultado debe ser un proyecto funcional, demostrable y preparado para evolucionar progresivamente hacia una plataforma de producción compatible con los estándares del sistema de salud chileno.
