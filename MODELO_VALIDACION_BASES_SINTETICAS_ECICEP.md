# 📐 Modelo de Validación Simulado sobre Base de Datos Sintética

## Repriorización Inteligente de Listas de Espera DM2 en el Marco de la Estrategia ECICEP

> **Contexto Local:** Servicio de Salud Metropolitano Sur Oriente (SSMSO) y Hospital Dr. Sótero del Río, Santiago de Chile.  
> **Propósito:** Definición del marco de validación, simulación estocástica/Monte Carlo y matriz de escenarios para probar la herramienta de repriorización algorítmica y el Copiloto IA antes de su despliegue en la red de salud.

---

## 1. Visión General del Modelo de Validación Sintética

Para validar clínicamente y operativamente la herramienta de repriorización inteligente antes de su integración directa en los sistemas de información de los CESFAM y el Hospital Sótero del Río, se establece un **Motor de Simulación de Eventos Discretos (DES) con Monte Carlo**.

La simulación se ejecuta sobre una cohorte sintética representativa del SSMSO ($N = 50.000 \text{ a } 150.000$ pacientes), estructurada según la especificación de las **13 bases de datos sintéticas** (modelo ER) y las reglas de scoring clínico **ECICEP ($C1 \text{ a } C5$)**.

---

## 2. Matriz de Escenarios de Validación

Se definen **5 Escenarios Principales** de simulación para probar la herramienta bajo condiciones normales, óptimas, de estrés asistencial y frente a degradación en la calidad de los datos.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ DE ESCENARIOS DE VALIDACIÓN                              │
├──────────────────┬─────────────────────────────────┬───────────────────────────────────┤
│ Escenario        │ Tipo de Priorización            │ Condición de Entorno / Red        │
├──────────────────┼─────────────────────────────────┼───────────────────────────────────┤
│ 1. Control       │ FIFO Tradicional (Fecha SIC)    │ Flujo operativo estándar actual   │
│ 2. ECICEP Puro   │ Algorítmica Estática (C1-C5)    │ Oferta asistencial constante      │
│ 3. Copiloto + APS│ Dinámica + Resolución APS       │ Incorporación iSGLT2/arGLP1 + Tele│
│ 4. Estrés Red    │ Dinámica con Prioridad G3       │ Colapso de oferta (-30% horas)    │
│ 5. Ruido/Sesgo   │ Algoritmo con Datos Faltantes   │ 30% vacíos en laboratorios/social │
└──────────────────┴─────────────────────────────────┴───────────────────────────────────┘
```

---

## 3. Detalle de los 5 Escenarios

### 3.1. Escenario 1: Línea Base Tradicional (FIFO / Modelo de Control)
* **Propósito:** Funciona como el *grupo control* numérico y empírico.
* **Mecánica:** Las interconsultas a especialidad (Diabetología, Nefrología, Cirugía Vascular, Oftalmología) se atienden estrictamente por orden de llegada (antigüedad de la SIC), ignorando la gravedad clínica y el riesgo dinámico del paciente.
* **Parámetros de Entrada:** Tiempo de espera medio para Estrato G3 $> 500$ días. Tasa de compensación metabólica en APS de $\sim 35\%$.
* **Resultado a Medir:** Tasa "natural" de progresión a amputación, diálisis, eventos cardiovasculares mayores (MACE) y ceguera a 3 y 5 años bajo el modelo actual.

### 3.2. Escenario 2: Priorización Algorítmica Pura ECICEP ($C1 \text{ a } C5$)
* **Propósito:** Evaluar el impacto del reordenamiento matemático según la norma ECICEP.
* **Mecánica:** Se calcula el puntaje total:
  $$\text{Puntaje ECICEP} = C1(\text{HbA1c}) + C2(\text{ERC}) + C3(\text{Urgencia}) + C4(\text{Social}) + C5(\text{Polifarmacia})$$
  Se reordenan las listas en tiempo real:
  * **G3 ($\ge 10$ pts):** Atención presencial priorizada en $< 60$ días.
  * **G2 ($5-9$ pts):** Atención presencial en $< 90$ días.
  * **G1 ($< 5$ pts):** Agendamiento regular / telemático.
* **Resultado a Medir:** Capacidad de detección temprana de la cohorte de alto riesgo y redistribución eficiente del tiempo de espera compensado por riesgo (*Risk-Adjusted Wait Time*).

### 3.3. Escenario 3: Priorización Dinámica + Copiloto IA + Resolución Reforzada en APS (Escenario Proyectado Principal)
* **Propósito:** Simular el modelo integral completo propuesto en el proyecto.
* **Mecánica:** 
  1. Se actualiza el puntaje mensualmente con datos dinámicos (urgencias, laboratorios, admisiones).
  2. El **Copiloto IA** asiste al médico de APS reduciendo rechazos de SIC por incompletitud diagnóstica.
  3. **Resolución en Origen (CESFAM):** Un $20\% - 30\%$ de los pacientes G1/G2 son resueltos localmente mediante ajuste farmacológico guiado (iSGLT2, arGLP-1) y tele-interconsulta, **evitando su ingreso a la lista hospitalaria**.
* **Resultado a Medir:** Verificación de las metas del proyecto:
  * Reducción $35\%-45\%$ en amputaciones mayores.
  * Reducción $25\%-35\%$ en ingreso a hemodiálisis / peritoneodiálisis.
  * Reducción $20\%-30\%$ en eventos MACE (IAM / ACV).
  * Reducción $40\%-50\%$ en pérdida visual severa.
  * Ahorro directo en FONASA ($\sim \$1.000$ millones CLP anuales por cada 50 casos de diálisis evitados).

### 3.4. Escenario 4: Estrés de Red y Restricción Severa de Oferta
* **Propósito:** Validar la seguridad y estabilidad del algoritmo cuando la capacidad hospitalaria decae.
* **Mecánica:** Se reduce en un $30\%$ la disponibilidad de horas médicas de especialidad en el Hospital Dr. Sótero del Río y se incrementa en un $15\%$ la entrada de nuevas SICs desde la APS.
* **Resultado a Medir:** Comprobar si el sistema preserva la ventana terapéutica de los pacientes G3 ($< 60$ días) aislando el impacto del colapso únicamente en las categorías de bajo riesgo (G1).

### 3.5. Escenario 5: Resiliencia ante Ruido, Datos Incompletos y Falsos Positivos/Negativos
* **Propósito:** Evaluar el comportamiento ante la falta de completitud habitual en bases de datos públicas.
* **Mecánica:** 
  * Se introduce un $30\%$ de datos faltantes en $C2$ (sin examen RAC reciente) y $C4$ (riesgo social no registrado).
  * Se simulan fallas en la contactabilidad de la tabla `interacciones_contactabilidad`.
* **Resultado a Medir:** Evaluar la efectividad de las reglas de *imputation fallback* (asignación conservadora de riesgo por defecto) y la tasa de falsos negativos (pacientes severos clasificados erróneamente como G1 por falta de datos).

---

## 4. Estructura del Código del Modelo de Validación

Para implementar este simulador en el repositorio, se propone la siguiente arquitectura modular en Python/SQL:

```
simulador_validacion_ecicep/
├── 1_generador_sintetico/        # Generador estocástico basado en las 13 tablas
│   ├── pacientes_generator.py
│   ├── lab_biomarkers_generator.py
│   └── ecicep_scorer.py
├── 2_motor_simulacion/           # Simulación de eventos discretos (DES / Markov)
│   ├── markov_disease_progression.py  # Ecuaciones Steno-2 / UKPDS / CREDENCE
│   ├── hospital_queue_simulator.py    # Modelo FIFO vs ECICEP
│   └── aps_resolution_engine.py
├── 3_escenarios/                 # Ejecutores de los 5 escenarios
│   ├── run_scenario_1_fifo.py
│   ├── run_scenario_2_ecicep_pure.py
│   ├── run_scenario_3_integrated_copilot.py
│   ├── run_scenario_4_stress_test.py
│   └── run_scenario_5_data_noise.py
└── 4_analisis_resultados/        # Módulo de métricas clínicas, operativas y financieras
    ├── clinical_outcomes.py      # Amputaciones, ERC, MACE, Retinopatía
    ├── financial_impact.py       # Costos evitados FONASA / Días Cama Ocupados
    └── model_validation_report.py
```

---

## 5. Matriz de Métricas Clave y Criterios de Aceptación

Para dar por **validada** la herramienta, los resultados de la simulación del **Escenario 3 vs Escenario 1** deben alcanzar las siguientes metas:

| Categoría | Indicador de Validación | Meta de Simulación Esperada |
| --- | --- | --- |
| **Operativa** | *Risk-Adjusted Wait Time* (G3) | De $>500$ días a $<60$ días |
| **Operativa** | Tasa de Rechazo de Interconsultas (SIC) | Reducción del $40\%$ al $<10\%$ por mejor completitud |
| **Clínica** | Incidencia de Amputaciones Mayores | Reducción relativa del $35\% - 45\%$ a 3 años |
| **Clínica** | Ingresos a Hemodiálisis (ERC G5) | Reducción relativa del $25\% - 35\%$ a 3 años |
| **Clínica** | Eventos Cardiovasculares (MACE) | Reducción relativa del $20\% - 30\%$ a 3 años |
| **Económica** | Costo Evitado Anual en Diálisis (FONASA) | $\ge \$1.000$ millones CLP / año (cohorte SSMSO) |
| **Algorítmica** | Sensibilidad en Detección de G3 Verdadero | $\ge 95\%$ |
| **Algorítmica** | ROC-AUC (Predicción de complicación a 12m) | $\ge 0.85$ |

---

## 6. Conclusión y Próximos Pasos

El diseño de este modelo de validación simula con rigor la transición desde un sistema administrativo de colas pasivo hacia un **mecanismo inteligente y proactivo de equidad en salud pública**. 

Los pasos a seguir para la implementación del simulador son:
1. Implementar los scripts del generador sintético para poblar las 13 tablas del modelo de datos.
2. Configurar las matrices de probabilidad de transición (modelos de Markov) basadas en la literatura médica de referencia (*Steno-2*, *UKPDS*, *CREDENCE*, *EMPA-REG*).
3. Ejecutar las corridas de Monte Carlo y generar el informe comparativo automatizado de validación.
