# 11. Prompt de implementación — Protocolo MINSAL (ECICEP) completo, matriz de riesgo y reprocesamiento

Este documento es un **prompt de implementación** (mismo formato que
[08-analisis-ecicep-prompt.md](08-analisis-ecicep-prompt.md)): no es codigo, es la especificacion
accionable — con clases, archivos y endpoints reales del repo — para adaptar el sistema al documento
completo [ECICEP_MODELO_TECNICO_OPERATIVO.md](ECICEP_MODELO_TECNICO_OPERATIVO.md) (fuente MINSAL, 7
secciones), no solo a su formula de priorizacion. Incluye ademas dos capacidades de valor pedidas
explicitamente: una **matriz de riesgo** en el frontend y un mecanismo para **reprocesar pacientes no
priorizados** desde la lista de espera.

No se implemento nada todavia. Este documento define **que** construir; la ejecucion queda para un
turno siguiente.

---

## 1. Alcance frente al documento ECICEP completo

`ECICEP_MODELO_TECNICO_OPERATIVO.md` tiene 7 secciones. No todas son funcionalidad de software para un
sistema de priorizacion de lista de espera — varias son procesos organizacionales, programas de
seguimiento longitudinal, o reportería MINSAL que no aplican a esta PoC sin inventar un dominio nuevo.
Esta tabla es la decision de alcance, honesta, antes de escribir una sola tarea:

| Seccion del documento | Contenido | Decision |
|---|---|---|
| 1. Marco normativo y principios MAIS | Contexto conceptual (ECICEP vs PSCV tradicional) | **Fuera de alcance** — no es un artefacto de datos ni una feature, es contexto de negocio (ya citado en este documento) |
| 2. Multimorbilidad M2/M5+ | Conteo de condiciones cronicas coexistentes | **Dentro de alcance**, gratis — ya existe `AntecedenteClinico.Comorbilidades`, solo falta contar |
| 3. Estratificacion G0-G3 (tabla de criterios) | Clasificar la poblacion en G0 (sano) a G3 (alto riesgo/complejo) segun severidad, farmacos, daño de organo blanco y fragilidad | **Dentro de alcance parcial** — nuestros pacientes ya entran via interconsulta (nunca G0), pero la clasificacion G1/G2/G3 en si es calculable con datos que ya recolectamos. Ver seccion 4.2 |
| 3b. Subfiltrado G3 → "Gestion de Caso" | Seleccionar sub-poblacion G3 para acompañamiento intensivo de hasta 6 meses | **Fuera de alcance** — es un programa de seguimiento longitudinal multi-visita, no una decision de lista de espera; no hay modulo de seguimiento de casos en esta PoC |
| 4. Canasta de prestaciones, roles disciplinarios, PCC | Frecuencia de controles por estrato, matriz de 9 disciplinas, metodologia de Plan de Cuidado Consensual (5A) | **Fuera de alcance** — dominio completo distinto (agenda recurrente, metas pactadas, adherencia a mediano plazo). Roadmap de largo plazo, no extension incremental |
| 5. Asignacion dinamica de horas | Principio general (G3 captura oferta proactivamente) | Ya implementado en espiritu por el Priority Agent + Scheduler Agent existentes |
| 5b. **Protocolo Algoritmico C1-C5** | Formula de puntaje para priorizar la lista de espera DM2 | **Dentro de alcance** — nucleo de este documento, secciones 2-4 |
| 5c. Criterios de derivacion a especialidad | Diabetologia / Nefrologia / Oftalmologia / Unidad de Pie Diabetico | **Dentro de alcance** — el de Nefrologia (caida de VFG >30% en <3 meses) ya esta en `CheckEmergencyEscalationTool`; faltan los otros 3. Ver seccion 4.6 |
| 5d. Contrarreferencia / Teleperitaje / PDE | Modulo de resolucion sin cita presencial, figura de enlace hospitalario | **Fuera de alcance** — ya listado como pendiente en [07-roadmap-futuro.md](07-roadmap-futuro.md) ("Reingreso de paciente y contrarreferencia formal") |
| 6. Registro RCE/REM | Formularios y series REM obligatorias a MINSAL, reglas de consistencia | **Fuera de alcance** — modelar REM real no aporta a la demo de priorizacion |
| 6b. KPIs de indicadores MINSAL | Cobertura PCC, compensacion metabolica G3, etc. | **Fuera de alcance** — dependen de PCC y poblacion G0-G3 completa, ambos fuera de alcance. `/api/kpis` ya cubre KPIs operativos propios del sistema |
| 7. Hoja de ruta operativa (Fases 1-4) | Gestion del cambio en un CESFAM real (gobernanza, capacitacion, reingenieria de agendas fisicas) | **Fuera de alcance** — no es una funcionalidad de software, es un plan de implementacion humana |

Con esto, lo que sigue de este documento cubre exactamente 4 cosas dentro de alcance: la formula C1-C5
(ya especificada antes), la estratificacion G1-G3, la matriz de riesgo, y el reprocesamiento de pendientes.

---

## 2. Por que un modelo nuevo, no un ajuste del existente

El sistema hoy calcula prioridad con el **Score de Criticidad Real ECICEP** (dossier Impact Lab, ver
[08-analisis-ecicep-prompt.md](08-analisis-ecicep-prompt.md)): un promedio ponderado 0-100
(`Severidad 40% + Urgencia_Reciente 25% + Vulnerabilidad 15% + Latencia_Ponderada 20%`) donde el Risk
Agent **razona con un LLM** sobre valores clinicos continuos, sin una tabla de puntos fija.

El protocolo MINSAL (seccion 5 del documento) es distinto en naturaleza: es **enteramente aritmetico**.
Cinco criterios (C1-C5), cada uno con 3 tramos de puntos fijos y enteros, sumados a un puntaje total
0-16, comparado contra 2 cortes (10 y 5) que determinan `Alta/Media/Baja` con un SLA en dias explicito.
No hay ambiguedad clinica que requiera el juicio de un LLM — es una tabla de lookup.

**Decision de diseno recomendada**: no reemplazar el Priority Agent existente ni su tier `P1/P2/P3` (es
el corazon de la postulacion ECICEP a Impact Lab). Agregar el protocolo MINSAL como un **segundo calculo
de prioridad, paralelo y explicito**, con su propia terminologia (`PrioridadMinsal`: `Alta/Media/Baja`) y
su propio campo `PuntajeMinsal` (0-16). Ambos quedan visibles en el mismo caso — son dos evidencias
distintas, no se promedian ni se reconcilian entre si. Justificacion: mezclarlos (por ejemplo, convertir
0-16 a 0-100 y promediarlo con ECICEP) inventaria una regla de conversion que ningun documento fuente
define, y volveria ambos modelos menos auditables.

---

## 3. Brecha detectada — formula C1-C5

| Criterio MINSAL | Formula exacta | Estado en el codigo |
|---|---|---|
| C1 — HbA1c | <7.0%=0, 7.0-8.9%=2, ≥9.0%=4 | `GetReferenceRangesTool` usa umbrales de *diagnostico* de diabetes (corte en 7.5), no los de *control* del protocolo (7.0 y 9.0) |
| C2 — ERC (RAC/VFG) | RAC<30 & VFG≥60=0; RAC 30-299 o VFG 45-59=1; RAC≥300 o VFG<45=3 | Datos existen (`Vfg`, `MicroalbuminuriaRac` en `AntecedenteClinico`), pero sin el segundo corte (45 ml/min) ni el calculo de puntos |
| C3 — Uso de urgencia | 0 sin atenciones; 2 si 1 en el **ultimo mes**; 4 si ≥2 en **6 meses** u hospitalizacion | Solo existe `UrgenciasUltimos90Dias`, un contador manual de una ventana que no coincide con ninguno de los 2 cortes del protocolo (1 mes / 6 meses), y sin registro de hospitalizaciones |
| C4 — Riesgo social/redes | 0 red efectiva; 1 red parcial; 3 sin red/abandono/cuidador colapsado | Existe `DependenciaSevera`, `Ruralidad`, `DeterminantesSociales` (texto libre) — sin la clasificacion estructurada de 3 niveles |
| C5 — Polifarmacia | <5=0; 5-6=1; ≥7=2 | **No existe ningun campo** de conteo de farmacos en el dominio |
| Umbral final | Alta≥10 (7-14 dias), Media 5-9 (30 dias), Baja<5 (regular) | No existe — el sistema solo tiene `P1/P2/P3` sin SLA en dias |

---

## 4. El prompt: tareas de implementacion

### 4.1 Modelo de dominio — historial granular en `Paciente`

Hoy `Paciente.Antecedentes` es una lista de `AntecedenteClinico`, pero solo se usa el ultimo
(`UltimoAntecedente()`). Para calcular C3 con precision (ventanas de 1 y 6 meses) hace falta historial
de **eventos con fecha**, no un contador acumulado que el usuario tipea a mano.

En `MediSync.Domain/Pacientes/`:

- Nuevo value object `AtencionUrgencia(DateTime Fecha, string Motivo)`.
- Nuevo value object `Hospitalizacion(DateTime FechaIngreso, DateTime? FechaAlta, string Motivo)`.
- `Paciente` agrega `List<AtencionUrgencia> AtencionesUrgencia` y `List<Hospitalizacion> Hospitalizaciones`,
  con metodos `RegistrarAtencionUrgencia(...)` / `RegistrarHospitalizacion(...)` (mismo patron que
  `RegistrarAntecedente`).
- `AntecedenteClinico` agrega `int NumeroFarmacosActivos` (para C5) — es un valor que cambia por control,
  igual que `HbA1c`, por eso va en el snapshot y no en `Paciente`.
- `Paciente` agrega `NivelRedApoyo` (enum: `RedEfectiva`, `RedParcial`, `SinRedOAbandono`) — reemplaza la
  interpretacion libre de `DeterminantesSociales` para efectos de C4 por una clasificacion estructurada
  y auditable en 3 niveles, igual que exige el protocolo. `DeterminantesSociales` (texto libre) se
  mantiene para el modelo ECICEP y para contexto humano, pero C4 se calcula desde `NivelRedApoyo`.
- Propagar los campos nuevos por `MediSync.Infrastructure/Persistence/Documents/PacienteDocument.cs`
  (nuevos documentos embebidos `AtencionUrgenciaDocument`/`HospitalizacionDocument`, mismo patron que
  `AntecedenteClinicoDocument`) y por `RegistrarInterconsultaCommand`/`RegistrarPacienteCommand`.

Con este cambio, `UrgenciasUltimos90Dias` (que ya usa el modelo ECICEP) puede quedar como **campo
derivado**: calculado contando `AtencionesUrgencia` con `Fecha >= hoy - 90 dias`, en vez de un numero
que el usuario tipea — un solo origen de verdad para ambos modelos de priorizacion.

Para la estratificacion G1-G3 (seccion 4.2) no hace falta ningun campo nuevo adicional: reusa
`Comorbilidades.Count` (numero de condiciones cronicas), `NumeroFarmacosActivos`, `HbA1c`, `Vfg`,
`MicroalbuminuriaRac`, `AlertasClinicas` (daño de organo blanco: retinopatia, pie diabetico, ECV) y
`NivelRedApoyo`/`DependenciaSevera` (fragilidad). Nota honesta: la tabla G1-G3 del documento tambien
menciona un test funcional especifico ("Get Up and Go" para riesgo de caidas) que no tiene campo hoy —
se aproxima con `DependenciaSevera` hasta que se justifique modelarlo aparte.

### 4.2 Calculo determinista — un tool, no un prompt de Claude

Ni el puntaje C1-C5 ni la estratificacion G1-G3 necesitan razonamiento de un LLM (son tablas de lookup
fijas), asi que siguen el mismo patron ya establecido por `CheckEmergencyEscalationTool`: una tool
deterministica en C#, no un prompt que le pide a Claude que aplique una tabla (evita que un LLM se
equivoque en una clasificacion que deberia ser siempre exacta y auditable).

Nuevo archivo `MediSync.AI/Tools/CalcularPuntajeMinsalTool.cs`:

- Input: `pacienteId`.
- Logica (todo en C#, sin llamar a Claude):
  - `C1`: segun `HbA1c` del ultimo `AntecedenteClinico` contra los cortes 7.0/9.0.
  - `C2`: segun `Vfg`/`MicroalbuminuriaRac` contra los cortes 30/300 (RAC) y 45/60 (VFG) — toma el
    puntaje mas alto entre ambos si difieren, como indica la tabla ("RAC ≥300 **o** VFG <45").
  - `C3`: cuenta `AtencionesUrgencia` en los ultimos 30 dias y en los ultimos 180 dias, mas
    `Hospitalizaciones` en los ultimos 180 dias, y aplica los cortes 1/2.
  - `C4`: segun `Paciente.NivelRedApoyo`.
  - `C5`: segun `NumeroFarmacosActivos` del ultimo antecedente, cortes 5/7.
  - `PuntajeTotal = C1+C2+C3+C4+C5`; `PrioridadMinsal` = `Alta` (≥10) / `Media` (5-9) / `Baja` (<5);
    `SlaDias` = `"7-14"` / `"30"` / `"regular"`.
  - `EstratoRiesgo` (G1/G2/G3): toma el nivel mas alto alcanzado por cualquiera de las 4 dimensiones de
    la tabla de la seccion 3 (numero de condiciones cronicas + farmacos, HbA1c, daño de organo blanco via
    RAC/VFG/`AlertasClinicas`, fragilidad via `NivelRedApoyo`/`DependenciaSevera`) — mismo criterio de
    "el peor gana" que ya usa C2.
- Output JSON: `{ c1, c2, c3, c4, c5, puntajeTotal, prioridadMinsal, slaDias, estratoRiesgo }` —
  desglosado por criterio, no solo el total, para que quede auditable igual que el desglose ECICEP.

### 4.3 Agente — explicabilidad sobre un calculo ya hecho

Nuevo manifest `MediSync.AI/Manifests/minsal-priority-agent.json` (o, si se prefiere no sumar un cuarto
agente, un modo alternativo del Priority Agent existente — ver decisiones abiertas). Su prompt es
distinto en espiritu al del Risk/Priority Agent actual: no le pide que *calcule*, le pide que **llame la
tool, tome el resultado tal cual, y redacte la justificacion clinica citando el desglose C1-C5 y el
estrato** — Claude aporta la explicabilidad ("Tarjeta de Explicabilidad Clinica"), no la aritmetica.

- Tools: `["calcular_puntaje_minsal"]` unicamente.
- Salida esperada: `{"puntajeTotal": <del tool>, "prioridadMinsal": "<del tool>", "estratoRiesgo": "<del tool>", "justificacion": "<3-5 frases citando C1..C5 y el estrato con sus valores>"}`.
- Se ejecuta junto al Risk/Priority Agent existente dentro de `CalcularPriorizacionCommand` (o en un
  command nuevo `CalcularPrioridadMinsalCommand`, para no acoplar un modelo con el otro) y persiste en
  un campo nuevo de `Priorizacion` (`PuntajeMinsal`, `PrioridadMinsal`, `EstratoRiesgo`,
  `MinsalJustificacion`) — extension aditiva del documento existente, sin tocar los campos ECICEP.

### 4.4 Extender la derivacion urgente con los criterios de especialidad restantes

`CheckEmergencyEscalationTool` ya cubre el criterio de Nefrologia (caida de VFG >30% en <3 meses,
seccion 5c del documento). Agregar los 3 restantes como nuevas señales del mismo tool (no agentes
nuevos, mismo patron determinista):

- **Diabetologia**: `AlertasClinicas` contiene señal de sospecha DM1/LADA/MODY, embarazo sin metas, o
  falla a triple terapia + insulina con HbA1c >9% tras 6 meses (requiere el historial de C3/farmacos ya
  agregado en 4.1 para verificar "6 meses de adherencia confirmada").
- **Oftalmologia**: `AlertasClinicas` contiene señal de retinopatia proliferativa o caida de agudeza
  visual.
- **Pie Diabetico**: `AlertasClinicas` contiene señal de ulcera activa infectada o isquemia critica —
  esto ya se cubre indirectamente hoy via el texto libre de alertas, pero conviene homologar el wording
  exacto del documento en la documentacion del campo para que quien lo cargue use terminologia
  consistente.

### 4.5 Frontend — derivar un paciente ya existente a una interconsulta

Hoy no existe forma de listar/buscar pacientes ya registrados: `IPacienteRepository` solo tiene
`GetByIdAsync`/`AddAsync`/`UpdateAsync` (sin listado), y la pantalla `/ingreso` siempre crea un paciente
**nuevo** junto con su interconsulta en el mismo paso.

**Backend** (aditivo, no rompe lo existente):
- `IPacienteRepository` agrega `Task<IReadOnlyList<Paciente>> BuscarAsync(string? texto, CancellationToken ct)`.
- Nueva `ListarPacientesQuery` → `GET /api/pacientes` (lista resumida: id, nombre, RUN, edad, CESFAM).
- Nueva `ObtenerPacienteQuery` → `GET /api/pacientes/{id}` (detalle completo: antecedentes historicos,
  atenciones de urgencia, hospitalizaciones, vulnerabilidad).

**Frontend** (nuevas pantallas, no se toca `/ingreso`):
- `/pacientes`: tabla con busqueda (reusa el patron `mat-table` de `lista-espera`).
- `/pacientes/:id`: detalle del paciente — historial en timeline (mismo patron que `.timeline` en
  `detalle-caso`) — con boton **"Derivar a interconsulta"**.
- El boton abre un formulario reducido (no el stepper completo de `/ingreso`): especialidad, motivo, y
  los campos clinicos de la nueva interconsulta — reusa `app-chip-list-input`. Al enviar, llama al mismo
  `POST /api/interconsultas` ya existente (con `pacienteId` fijo), disparando el mismo pipeline de
  agentes sin cambios en el backend de priorizacion.

### 4.6 Frontend — Matriz de Riesgo (valor agregado nuevo)

Cruza dos señales independientes que el sistema ya calcula, para detectar divergencias entre modelos:

- **Filas**: Estrato de Riesgo G1/G2/G3 (protocolo MINSAL, seccion 3 — nuevo, sale del tool en 4.2).
- **Columnas**: `PriorityTier` P1/P2/P3 (modelo ECICEP, ya existente).
- **Celda**: cantidad de casos activos en esa combinacion.

Por que esta matriz y no otra: cruzar una estratificacion poblacional (MINSAL, sobre severidad clinica
objetiva) contra un score de agenda (ECICEP, que tambien pondera espera y carga de especialidad) deja
ver casos donde ambos modelos coinciden y casos donde divergen — por ejemplo, un caso G3 (alto riesgo
clinico segun MINSAL) que el modelo ECICEP dejo en P3 por poca carga de especialidad seria una señal
concreta para revision manual, algo que ningun KPI agregado muestra por separado.

- Backend: `GET /api/matriz-riesgo` → `ObtenerMatrizRiesgoQuery`, agregando sobre `lista_espera_items` +
  `priorizaciones` (mismo patron que `ObtenerKpisQuery`), devolviendo una grilla 3x3 de conteos.
- Frontend: `matriz-riesgo.component.ts` — grilla CSS con `.status-pill` por celda segun intensidad
  (mismo lenguaje visual que el resto de la app, sin libreria de graficos), nueva ruta `/matriz-riesgo` +
  entrada en el nav de `app.html`. Celdas clicables que navegan a `/` con un filtro aplicado — requiere
  agregar filtrado por estrato/tier a `lista-espera.component.ts` (hoy no tiene filtros, ver decisiones
  abiertas).

### 4.7 Reprocesamiento — pacientes no priorizados y "Correr lista de espera"

**Que significa "no priorizado" hoy**: un `ListaEsperaItem` con `Estado == Clasificado` cuya
`Priorizacion` no existe o tiene `RiskJustificacion` vacio — es exactamente el mismo criterio que ya usa
`ListarListaEsperaQuery`/`ObtenerCasoQuery` para decidir si mostrar el tier
(`EstadosConPriorizacionCompleta`). Esto pasa hoy si `CalcularPriorizacionCommand` falla a mitad de
camino (ej. la API de Anthropic estaba caida en el momento de la interconsulta): el caso queda huerfano
en `Clasificado` para siempre, sin ningun mecanismo de reintento — es un bug de disponibilidad real, no
solo un caso hipotetico.

No hace falta una coleccion nueva en MongoDB — es una query sobre datos que ya existen
(`lista_espera_items` + `priorizaciones`). Lo que falta es la **accion** de reprocesarlos.

**Backend**:
- Nuevo `ReprocesarPendientesCommand` (`MediSync.Application/Priorizacion/Commands/`), sin parametros.
- Handler: `listaEsperaRepo.GetAllAsync()` filtrado a `Estado == Clasificado`, cruzado con
  `priorizacionRepo` para quedarse solo con los que no tienen `RiskJustificacion`. Para cada pendiente,
  reenvia el mismo `CalcularPriorizacionCommand(item.Id)` ya existente via `ISender` — **reusa la logica
  actual sin duplicarla** (Risk Agent → chequeo de escalamiento → Priority Agent → MINSAL Agent si se
  implemento 4.3).
- Try/catch por item individual (uno que falle de nuevo no debe bloquear al resto); devuelve un resumen
  `{ pendientesEncontrados, procesadosOk, derivadosUrgente, fallidos }`.
- Nuevo endpoint `POST /api/lista-espera/reprocesar`.

**Frontend** (`lista-espera.component`):
- `ListaEsperaItemDto` ya trae `estado` y `priorityTier` — se computa
  `pendientes = casos().filter(c => c.estado === 'Clasificado' && !c.priorityTier).length` sin cambios
  de contrato.
- Si `pendientes > 0`: banner/boton junto al "Actualizar" existente — *"N pacientes pendientes de
  priorizar — Correr lista de espera"*.
- Al hacer click: `POST /api/lista-espera/reprocesar`, mostrar el resumen en `MatSnackBar` (mismo patron
  ya usado en `ingreso-paciente`/`detalle-caso`), y recargar la lista.

Extension natural, no obligatoria para el primer corte: un boton "Recalcular prioridad" en
`detalle-caso` para un caso individual cuyo historial cambio despues del calculo inicial (ej. se agrego
una `AtencionUrgencia` nueva) — mismo mecanismo, acotado a un `listaEsperaItemId`.

---

## 5. Decisiones abiertas (para resolver antes de implementar)

1. **¿Cuarto agente o modo del Priority Agent existente?** Un agente nuevo es mas simple de razonar y
   auditar por separado. Recomendado: agente nuevo (seccion 4.3), porque su contrato de salida y sus
   tools son distintos.
2. **¿El calculo MINSAL corre siempre, o es opt-in?** Si corre siempre junto al pipeline ECICEP, cada
   interconsulta dispara una llamada mas a Claude (costo/latencia). Alternativa: boton manual
   ("Calcular prioridad MINSAL") desde `detalle-caso`, bajo demanda.
3. **Filtrado en lista de espera**: la matriz de riesgo (4.6) necesita que `/` acepte filtros por
   estrato/tier via query params — hoy `ListarListaEsperaQuery` no tiene parametros. Alcance minimo: un
   filtro en memoria en el frontend (sin cambiar el backend) vs. un filtro real server-side — a decidir
   segun cuantos casos se esperan manejar.
4. **Migracion de datos existentes**: los pacientes ya sembrados (`dummy-data/pacientes.json`) no tienen
   `NumeroFarmacosActivos`, `NivelRedApoyo`, ni historial de urgencias/hospitalizaciones — quedarian con
   los defaults hasta que se les registre una nueva interconsulta. El dummy data deberia actualizarse
   para poder demostrar el flujo (incluida la matriz de riesgo) con datos realistas y variados en los 3
   estratos G1-G3.
5. **Reprocesamiento automatico vs. manual**: este documento especifica un boton manual ("Correr lista
   de espera"). Una alternativa mas robusta a futuro es un `BackgroundService` que reintente pendientes
   periodicamente sin intervencion humana — queda fuera de este corte para no introducir infraestructura
   nueva (hosted services, colas de reintento) en una PoC.
