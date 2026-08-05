# Prompt para ajustar el front end de plataforma de listas de espera en salud chilena

```text
Actúa como diseñador UX/UI senior y frontend architect para una plataforma de salud chilena orientada a disminuir listas de espera y priorizar pacientes críticos con un criterio de priorización auditable.

Toma como referencia visual y estructural las pantallas adjuntas: una interfaz sobria, directa, tipo dashboard clínico/prototipo, con títulos grandes, secciones secuenciales y controles simples. Mantén la lógica visual existente, pero transforma su propósito desde “lista de espera de diabetes tipo 2” hacia una plataforma general de priorización de pacientes críticos en salud chilena.

OBJETIVO DEL FRONT END
- Reutilizar la estructura visible de las capturas.
- Convertir los elementos existentes en componentes funcionales para priorización clínica.
- Mantener un estilo minimalista, claro, auditable y apto para uso institucional.
- Hacer que la interfaz permita entender:
  1. quiénes están en lista de espera,
  2. quiénes deben subir de prioridad,
  3. por qué cambiaron de posición,
  4. cuánta capacidad disponible existe,
  5. cómo se justifica la priorización.

ESTRUCTURA VISUAL A CONSERVAR Y ADAPTAR
1. Encabezado principal
- Título principal grande.
- Subtítulo explicativo corto.
- Mantener estética sobria, tipo sistema clínico.

2. Barra de acciones
Convierte los botones actuales en acciones del sistema:
- “Nueva lista ficticia” → “Cargar lista clínica”
- “Reestructurar y priorizar” → “Calcular priorización”
- Selector de hospital → selector de centro de salud / servicio / especialidad
- “+ 4 cupos DM2/semana” → “+ cupos disponibles / semana”
- “Restablecer” → “Limpiar filtros / restaurar orden original”

3. Sección de capacidad y presión asistencial
Transforma “Mapa de presión asistencial” en un módulo de capacidad operativa:
- Mostrar demanda, oferta, brecha y presión asistencial.
- Visualizar cupos disponibles vs pacientes críticos.
- Indicar alertas rojas cuando la capacidad sea insuficiente.
- Incluir un pequeño resumen explicativo del cálculo.

4. Sección “Selecciona una persona”
Convertirla en panel de detalle del paciente seleccionado:
- Identificación del paciente.
- Riesgo clínico.
- Antigüedad en lista.
- Brecha de control.
- Motivo de priorización.
- Cambio de posición en la lista.
- Justificación auditable.

5. Sección de lista priorizada
Transforma “Personas priorizadas” en una tabla clínica:
Columnas sugeridas:
- Prioridad antes.
- Prioridad ahora.
- Cambio.
- Paciente.
- Ruta / especialidad.
- Tiempo de espera.
- Cita estimada.
- Motivo principal.
- Estado.

6. Sección de explicación operativa
Convierte “Explicación operativa” en un panel de trazabilidad:
- Explicar por qué una persona subió o bajó.
- Mostrar reglas aplicadas.
- Mostrar alertas detectadas.
- Mostrar cupos faltantes.
- Mostrar quién aprobó el ajuste, si aplica.

COMPONENTES QUE DEBE TENER LA INTERFAZ
- Botones principales de acción.
- Filtros por hospital, especialidad, prioridad, fecha y estado.
- Tarjetas o filas de pacientes.
- Panel de detalle lateral o inferior.
- Indicadores visuales de prioridad: rojo, naranja, amarillo, verde.
- Mensajes de trazabilidad y auditoría.
- Indicadores de capacidad y carga de trabajo.
- Buscador por ID, nombre o centro asistencial.

DIRECCIÓN DE DISEÑO
- Mantener estética simple, clínica y funcional.
- Priorizar legibilidad sobre decoración.
- Evitar interfaces complejas o muy “tech”.
- Usar jerarquía visual clara.
- Hacer el layout responsive.
- Pensar en escritorio primero, pero adaptado a tablet.

TONO Y MICROCOPY
- En español claro, institucional y clínico.
- Frases cortas.
- Enfatizar transparencia, priorización y trazabilidad.
- Evitar lenguaje comercial.
- Evitar lenguaje que sugiera diagnóstico automático o reemplazo del criterio clínico humano.

CONSIDERACIONES ÉTICAS Y DE USO
- La plataforma no diagnostica ni prescribe.
- La priorización debe ser auditable.
- Debe existir revisión manual.
- Debe mostrarse siempre la razón de cada cambio.
- Debe quedar claro que es una herramienta de apoyo y no sustituye el criterio clínico local.

ENTREGABLE ESPERADO
Genera una propuesta visual y funcional del frontend con:
- distribución por secciones,
- componentes reutilizables,
- textos de interfaz,
- nombres de botones,
- estructura de tabla,
- panel de detalle,
- estados vacíos,
- alertas,
- y sugerencia de estilo visual basada en las capturas adjuntas.

Usa como base la estructura que ya existe en las imágenes, pero reescríbela para una plataforma real de priorización de listas de espera en salud chilena.
```

---

## Versión corta para iterar en Google AI Studio

```text
Rediseña esta interfaz tipo dashboard clínico para una plataforma de priorización de listas de espera en salud chilena. Conserva la estructura simple de las capturas: título grande, barra de acciones, sección de capacidad, panel de detalle de paciente, tabla de priorizados y bloque de explicación operativa. Convierte los botones actuales en acciones reales: cargar lista, calcular priorización, seleccionar hospital/centro, ajustar cupos, limpiar filtros. La interfaz debe ser sobria, auditable, clara, responsive y en español institucional. Mostrar prioridad, tiempo de espera, motivo de cambio, capacidad disponible y trazabilidad de cada ajuste. No diagnostica ni reemplaza el criterio clínico.
```