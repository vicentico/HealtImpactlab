# 📊 Bases de Datos Sintéticas en Excel (500 Pacientes DM2 - Modelo ECICEP Chile)

Este directorio contiene las **13 bases de datos sintéticas en formato Excel (`.xlsx`)**, construidas en base a la especificación completa del repositorio ([`ESPECIFICACION_BASES_DATOS_Y_FUENTES.md`](../ESPECIFICACION_BASES_DATOS_Y_FUENTES.md)) y ajustadas a la **realidad del Sistema de Salud Público Chileno (APS y Red Asistencial)**.

---

## 📁 Estructura del Directorio

El directorio incluye **13 archivos Excel individuales** (uno por cada tabla del modelo de datos relacionable) más un **Libro Consolidador Maestro** que reúne todas las pestañas:

1. **`BASE_DATOS_ECICEP_500_PACIENTES_MAESTRA.xlsx`** (Contiene las 13 tablas organizadas en hojas independientes).
2. **`01_pacientes.xlsx`** (Datos demográficos, RUTs chilenos ficticios, tramos FONASA, CESFAMs y sectores).
3. **`02_antecedentes_clinicos.xlsx`** (Diagnósticos, comorbilidades M2/M5+, tiempo de evolución y estrato ECICEP G0-G3).
4. **`03_contactabilidad_y_apoyo.xlsx`** (Canales de contacto, cuidadores y riesgo de colapso).
5. **`04_condiciones_sociales.xlsx`** (Determinantes sociales, distancia a CESFAM, tramo RSH y Puntaje $C4$).
6. **`05_biomarcadores_laboratorio.xlsx`** (HbA1c, RAC, VFG, glicemia basal y Puntajes $C1$ y $C2$).
7. **`06_eventos_urgencia_hospitalizacion.xlsx`** (Uso de SAPU/SAR/Urgencias, causas agudas y Puntaje $C3$).
8. **`07_recetas_y_polifarmacia.xlsx`** (Fármacos permanentes, conteo de polifarmacia y Puntaje $C5$).
9. **`08_complicaciones_agudas_organo.xlsx`** (Pie diabético, eventos CV, retinopatía y estadio de ERC).
10. **`09_evaluacion_funcional.xlsx`** (EFAM/Barthel, Get Up & Go, fragilidad y criterio VDI).
11. **`10_lista_espera_priorizada.xlsx`** (Algoritmo IA, Puntaje Total ECICEP, ranking FIFO vs. IA, Overrides médicos y versionado).
12. **`11_capacidad_asistencial_agendas.xlsx`** (Oferta de citas, duplas G3, médicos, enfermeras y QF).
13. **`12_interacciones_contactabilidad.xlsx`** (Notificaciones omnicanal, mensajes raw y clasificación NLP de respuestas).
14. **`13_plan_cuidado_y_red.xlsx`** (Planes Consensuales PCC, metas 5A, interconsultas SIC y teleperitaje).
15. **`generar_bases_excel_500.py`** (Script Python ejecutable con la lógica determinista de síntesis y correlaciones).

---

## 🧮 Algoritmo de Priorización ECICEP Implementado

El dataset de 500 pacientes calcula de forma estricta y transparente el puntaje de priorización de cada paciente:

$$\text{Puntaje Total ECICEP} = C1(\text{HbA1c}) + C2(\text{ERC}) + C3(\text{Urgencia}) + C4(\text{Social}) + C5(\text{Polifarmacia})$$

### Resumen de Distribución de los 500 Pacientes
- **Perfil Prioridad Alta ($\ge 10$ Puntos) / G3 Crítico:** 100 pacientes ($20\%$).
- **Perfil Prioridad Media ($5 - 9$ Puntos) / G2 Moderado:** 250 pacientes ($50\%$).
- **Perfil Prioridad Baja ($< 5$ Puntos) / G1 Leve:** 150 pacientes ($30\%$).

---

## 🔗 Trazabilidad y Relaciones (Claves Foráneas)

Todas las tablas están integradas mediante la clave primaria `id_paciente` (rango `PAC-00001` a `PAC-00500`), lo que permite realizar uniones (`JOIN`) directas en SQL, Python (Pandas), R, Power BI o Tableau.
