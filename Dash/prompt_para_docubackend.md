Tu prompt puede mejorarse bastante si el objetivo **no es diseñar el frontend desde cero**, sino **inferir la arquitectura funcional existente a partir del código fuente**. Además, conviene orientarlo a un enfoque de _reverse engineering_, donde el modelo identifique actores, casos de uso, contratos de API, reglas de negocio y brechas.

A continuación tienes una versión mucho más robusta.

---

# Prompt Maestro: Ingeniería Inversa del Frontend para Identificar Casos de Uso, Actores y Contratos de API

Actúa como un **Software Architect**, **Frontend Tech Lead**, **UX Engineer**, **Business Analyst** y **Domain Expert en Salud Digital de Chile (MINSAL)** especializado en realizar **ingeniería inversa de aplicaciones web**.

Tu misión NO es diseñar un sistema nuevo.

Tu misión es **analizar el código fuente existente del frontend** para reconstruir toda la documentación funcional y técnica necesaria para que un equipo Backend pueda implementar correctamente todas las APIs requeridas.

La aplicación corresponde a un sistema de gestión de Lista de Espera para pacientes con Diabetes dentro del contexto del sistema público chileno.

Toda la documentación debe derivarse del código existente.

Si existe alguna funcionalidad incompleta, debes inferirla únicamente cuando exista evidencia suficiente en el código.

Nunca inventes funcionalidades.

Si algo no puede determinarse con certeza, indícalo como:

> **Pendiente de Validación Funcional**

---

# Objetivos

Reconstruir completamente:

- Actores
- Casos de Uso
- Navegación
- Flujos
- Componentes
- Contratos Backend
- Payloads
- Estados
- Validaciones
- Reglas de negocio
- Modelo de datos
- Dependencias entre pantallas

---

# 1. Identificación de Actores

Analiza todo el proyecto e identifica todos los actores que interactúan con el sistema.

Para cada actor documenta:

- Nombre
- Objetivo
- Responsabilidades
- Permisos
- Pantallas disponibles
- Casos de uso asociados

Ejemplo

Administrador

- Gestiona usuarios
- Configura parámetros
- Ve todas las listas

Médico Especialista

- Prioriza pacientes
- Atiende interconsultas
- Reagenda pacientes

Administrativo

- Ingresa pacientes
- Agenda horas
- Actualiza estados

Enfermera

- Actualiza controles
- Registra antecedentes

Paciente (si existe)

---

# 2. Descubrimiento Automático de Casos de Uso

Recorre todas las páginas, rutas, componentes y servicios.

Para cada pantalla identifica:

- propósito
- actor
- acciones posibles
- eventos
- navegación
- reglas de negocio

Genera un catálogo completo de Casos de Uso.

Cada caso debe contener:

## Nombre

## Objetivo

## Actor Principal

## Actores Secundarios

## Disparador

## Precondiciones

## Flujo Principal

Paso a paso.

## Flujos Alternativos

## Excepciones

## Resultado Esperado

## Pantallas involucradas

## Componentes utilizados

## Servicios consumidos

## Endpoints asociados

## Permisos requeridos

## Estados posibles

---

# 3. Mapa de Navegación

Reconstruye el flujo completo del sistema.

Ejemplo

Login

↓

Dashboard

↓

Lista Espera

↓

Detalle Paciente

↓

Priorización

↓

Interconsulta

↓

Agenda

↓

Alta

Debe incluir:

- rutas
- guards
- lazy loading
- módulos
- navegación
- breadcrumbs

---

# 4. Inventario de Pantallas

Para cada pantalla documenta:

Nombre

Descripción

Actor

Objetivo

URL

Componentes hijos

Servicios utilizados

Eventos

Estados

Acciones

APIs utilizadas

Modelos

Validaciones

Mensajes

---

# 5. Inventario Completo de Componentes

Analiza todos los componentes Angular.

Para cada componente documenta:

Nombre

Tipo

Smart Component

Presentational Component

Standalone

Reusable Component

Inputs

Outputs

Signals

Observables

Store

Dependencias

Servicios

Eventos

Validaciones

Estados

Loading

Error

Empty

Success

---

# 6. Ingeniería Inversa de Contratos Backend

Para cada acción del usuario reconstruye el contrato esperado.

Genera una tabla.

| Acción Usuario | Servicio Angular | Método HTTP | Endpoint | Request | Response | Códigos |

Ejemplo

Priorizar Paciente

PUT

/api/patients/{id}/priority

Request

```json
{
  "priorityLevel": 1,
  "reason": "",
  "clinicalRisk": "HIGH"
}
```

Response

```json
{
  "success": true,
  "patientId": "",
  "priorityUpdatedAt": ""
}
```

---

# 7. Reconstrucción de Payloads

Para cada endpoint generar

## Request

JSON completo

## Response

JSON completo

## Error

JSON completo

## Validaciones

## Campos obligatorios

## Campos opcionales

## Enumeraciones

## Restricciones

---

# 8. Modelo de Datos Frontend

Reconstruye todas las entidades.

Incluye

Interfaces

DTOs

Models

ViewModels

State

Store

Mapeos

Relaciones

Genera diagramas conceptuales.

---

# 9. Reglas de Negocio Detectadas

Extrae automáticamente todas las reglas encontradas en:

if

switch

guards

pipes

validators

services

effects

signals

rxjs

resolver

Cada regla debe indicar

Origen

Código

Descripción

Impacto

---

# 10. Validaciones del Cliente

Documenta

Validadores Angular

Validators

Regex

Máscaras

Campos obligatorios

Longitudes

RUT

RUN

Correo

Fechas

Comorbilidades

Diabetes

CIE10

Especialidad

Interconsulta

Prioridad

---

# 11. Estados de la UI

Documenta todos los estados.

Loading

Empty

Success

Error

Unauthorized

Forbidden

Not Found

Conflict

Validation Error

Timeout

Offline

Skeleton

Retry

---

# 12. Manejo de Errores

Reconstruye

HttpInterceptor

Toast

Snackbar

Dialog

Modal

Mensajes

Errores Backend

Errores Cliente

---

# 13. Integración con MINSAL

Identifica todos los datos compatibles con los estándares del MINSAL.

Incluye cuando corresponda:

- RUN
- DV
- CIE-10
- Especialidad
- Interconsulta
- Prioridad
- Estado Lista Espera
- Fecha Garantía
- Fecha Derivación
- Establecimiento
- Prestador
- Motivo Clínico
- Comorbilidades
- Riesgo Clínico
- ECICEP
- Diabetes Tipo 1
- Diabetes Tipo 2

Para cada dato indicar

Origen

Pantalla

Componente

Payload

Endpoint

---

# 14. Matriz de Trazabilidad

Genera una matriz completa.

Actor

↓

Caso de Uso

↓

Pantalla

↓

Componente

↓

Servicio Angular

↓

Endpoint

↓

Modelo

↓

Payload

↓

Respuesta

↓

Reglas de Negocio

↓

Entidad Backend

---

# 15. Diagrama de Arquitectura Frontend

Reconstruye la arquitectura.

Debe incluir

App

Feature Modules

Core

Shared

Infrastructure

Presentation

Services

Interceptors

Guards

Resolvers

Pipes

Directives

Store

Signals

RxJS

API

---

# 16. Detección de Funcionalidades Faltantes

Identifica:

- pantallas incompletas
- componentes sin uso
- servicios huérfanos
- endpoints inexistentes
- modelos no utilizados
- código muerto
- TODO
- FIXME
- funcionalidades parcialmente implementadas

Clasifica cada hallazgo por criticidad.

---

# 17. Resultado Esperado

Genera una documentación profesional organizada en el siguiente orden:

1. Resumen Ejecutivo
2. Arquitectura General
3. Actores
4. Casos de Uso
5. Navegación
6. Inventario de Pantallas
7. Inventario de Componentes
8. Contratos Backend
9. Payloads JSON
10. Validaciones
11. Reglas de Negocio
12. Estados de UI
13. Manejo de Errores
14. Modelo de Datos
15. Integración con MINSAL
16. Matriz de Trazabilidad
17. Funcionalidades Faltantes
18. Riesgos Detectados
19. Recomendaciones Arquitectónicas
20. APIs Prioritarias para implementar

## Criterios de análisis

- Basarse exclusivamente en la evidencia del código fuente.
- No inventar funcionalidades inexistentes.
- Marcar explícitamente cualquier inferencia como **"Pendiente de Validación Funcional"**.
- Priorizar la reconstrucción de contratos de API y casos de uso completos.
- Identificar inconsistencias entre la interfaz, los modelos de datos y los servicios.
- Cuando sea posible, proponer mejoras alineadas con **Angular 20+, Clean Architecture, DDD, arquitectura hexagonal y buenas prácticas de interoperabilidad del MINSAL**.

Este enfoque produce una documentación mucho más útil porque transforma el frontend existente en una **especificación funcional y técnica completa**, permitiendo derivar automáticamente los requisitos del backend, los contratos API, los actores, los casos de uso y las reglas de negocio sin depender de documentación previa.
