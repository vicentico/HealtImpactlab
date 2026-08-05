Actúa como diseñador UX/UI senior y arquitecto de frontend para una plataforma de Atención Primaria de Salud (APS) en Chile, centrada en el trabajo del MÉDICO CONTRALOR en un CESFAM.

OBJETIVO GENERAL
Diseñar una interfaz web simple, sobria y funcional que:
- Agilice el trabajo del contralor en la gestión de listas de espera en APS.
- Permita priorizar la atención según patología primaria, riesgo clínico y normativa de listas de espera no GES (Norma Técnica N°118 del MINSAL).
- Entregue trazabilidad y explicabilidad de cada decisión de priorización.
- Se integre al modelo de salud familiar y a la lógica de sectorización del CESFAM.

CONTEXTO
- El CESFAM es el primer nivel de contacto con la población, con enfoque biopsicosocial y territorial, y equipos de salud familiar.
- El médico contralor en APS es clave para la pertinencia y resolución de casos, evaluando licencias, pertinencia de derivaciones y priorización de atención en coordinación con la red.[20][27][28]
- La plataforma debe ser una herramienta de apoyo a la decisión, NO sustituye el criterio clínico ni la normativa vigente.

FOCO DE LA INTERFAZ
Toda la UI se orienta a:
- Ver rápidamente la carga de trabajo del CESFAM (listas de espera por programa/patología).
- Priorizar casos según patología primaria (crónicos, agudos, salud mental, materno infantil, etc.).
- Visualizar riesgo, tiempo de espera y brecha de control.
- Documentar la decisión del contralor de forma auditable.

ESTRUCTURA PRINCIPAL DEL FRONT END

1. Encabezado CESFAM / Contralor
- Título principal: “Gestión de listas de espera APS – CESFAM”.
- Subtítulo: “Módulo de priorización para médico contralor”.
- Selector de CESFAM y sector (por población a cargo).

2. Barra de acciones del contralor
Reutiliza la lógica de botones tipo prototipo, adaptados a APS:
- Botón “Cargar lista APS”: Importar/actualizar lista de espera de atención primaria (consultas, controles, derivaciones).
- Botón “Priorizar casos”: Ejecutar el algoritmo de priorización según criterios clínicos y normativos.
- Selector “Programa / Patología”: crónicos, salud mental, materno infantil, respiratorio, etc.
- Selector “Capacidad semanal”: cupos disponibles por tipo de prestación (ej. controles crónicos/semana).
- Botón “Restablecer orden”: ver orden original de lista antes de priorización.

3. Módulo “Mapa de presión asistencial APS”
Basado en la idea de “Mapa de presión asistencial”, pero adaptado al CESFAM:
- Indicadores clave:
  - Demanda actual (número de pacientes en lista por programa).
  - Capacidad (cupos reales en agenda por semana).
  - Brecha (diferencia demanda/capacidad).
  - Nivel de presión por programa (baja, media, alta, crítica).
- Visualización simple (barras, semáforos, etiquetas) sin gráficos complejos.
- Texto breve explicando cómo se calcula la presión.

4. Módulo “Personas priorizadas – vista contralor”
Tabla central orientada al trabajo del médico contralor:
Columnas sugeridas:
- Prioridad antes.
- Prioridad ahora.
- Cambio (subió, bajó, se mantiene).
- Paciente (ID, nombre abreviado, sector).
- Programa/patología primaria.
- Tiempo de espera en APS.
- Riesgo clínico (ej. alto, medio, bajo).
- Brecha de control (ej. sin control 12 meses, descompensado, abandono).
- Cita estimada / próxima acción.
- Estado (pendiente revisión, priorizado, derivado, resuelto).

Controles en la tabla:
- Filtro por prioridad, programa, sector, riesgo.
- Buscador por RUT/ID, nombre, sector.
- Acción “Revisar caso” al hacer clic en la fila.

5. Panel de detalle del paciente (lado derecho o inferior)
Cuando el contralor selecciona una persona:
- Datos básicos: edad, sexo, sector, equipo de cabecera.
- Resumen clínico relevante para APS (diagnósticos principales, último control, tratamiento relevante).
- Motivos de priorización (reglas aplicadas: riesgo, tiempo, brecha de control, programa).
- Historial de movimientos en la lista (posición anterior, posición nueva, fecha de cambios).
- Botones de acción del contralor:
  - “Confirmar priorización”.
  - “Ajustar prioridad”.
  - “Derivar a nivel secundario”.
  - “Registrar observación”.

6. Módulo “Explicación y trazabilidad operacional”
Panel inspirado en “Explicación operacional”, adaptado a CESFAM:
- Texto que explique:
  - Por qué un paciente subió/bajó.
  - Qué reglas/clasificación se aplicaron (norma de listas de espera, criterios propios del CESFAM).
  - Dónde se detecta falta de cupos (programas con brecha crítica).
- Campo para que el contralor deje constancia de la decisión (nota clínica-administrativa).
- Indicador de auditoría: fecha, usuario, CESFAM, programa.

COMPONENTES CLAVE DEL FRONT END
- Botones principales simples, claramente etiquetados.
- Filtros por programa/patología primaria, prioridad, sector y riesgo.
- Tabla de pacientes con columnas clínicas-administrativas relevantes.
- Panel de detalle de paciente siempre visible tras selección.
- Indicadores visuales de prioridad y presión (semáforos, etiquetas).
- Mensajes claros de “esta plataforma no reemplaza el juicio clínico”.
- Estados vacíos (sin pacientes, sin cupos, sin datos) con mensajes explicativos.

ESTILO VISUAL
- Minimalista, clínico, institucional (blancos, grises, azules).
- Tipografía legible, jerarquía clara de títulos y secciones.
- Compatible con uso en escritorio en CESFAM, pero responsive para tablet.
- Sin sobrecarga de gráficos complejos; se privilegia claridad y rapidez.

MICROCOPY
- Español institucional chileno, tono sobrio.
- Textos cortos en botones y mensajes.
- Énfasis en: priorización, presión asistencial, decisión del contralor, trazabilidad.

CONSIDERACIONES NORMATIVAS Y ÉTICAS
- La interfaz debe alinearse con la Norma Técnica de listas de espera no GES del MINSAL, distinguiendo tiempos y tipos de atención.[18][23]
- La plataforma es un apoyo a la decisión del contralor, no diagnostica ni prescribe.
- Las decisiones deben quedar registradas de forma que puedan ser auditadas.
- Respetar la confidencialidad de datos de salud y el marco de protección de datos personales.

ENTREGABLE ESPERADO
Genera un diseño de frontend que incluya:
- Layout por secciones (encabezado, barra de acciones, mapa de presión APS, tabla de priorizados, panel de detalle, trazabilidad).
- Nombres de botones y textos de interfaz.
- Estructura de tablas y campos de detalle.
- Descripción de estados (normal, presión alta, sin cupos, sin datos).
- Sugerencias de componentes reutilizables para luego implementar el back end en Antigravity IDE.

El resultado debe ser simple, práctico y listo para usarse como base en Impact Labs: yo desarrollaré el front y otro miembro del equipo hará el back end en Antigravity a partir de esta estructura.