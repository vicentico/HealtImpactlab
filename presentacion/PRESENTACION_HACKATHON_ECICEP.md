# Presentación Hackathon: Priorización Inteligente ECICEP y Copiloto IA en Listas de Espera

> **Proyecto:** Priorización Inteligente y Reordenamiento Dinámico por Riesgo Clínico (Estrategia ECICEP)  
> **Área:** Salud Pública / HealthTech — Descompresión de Listas de Espera No GES (Línea 02)  
> **Territorio de Referencia:** Servicio de Salud Metropolitano Sur Oriente (SSMSO) / Hospital Dr. Sótero del Río (~1.500.000 hab.)  
> **Stack Tecnológico:** Anthropic Claude API (Agent SDK) + Model Context Protocol (MCP) + Dashboard UGD (Human-in-the-Loop)

---

## 1. Resumen Ejecutivo y Marco Estratégico

El presente documento compila el diseño narrativo, la justificación epidemiológico-económica, la estructura de la presentación (*slide-by-slide*) y el guion del pitch en vivo de 3 minutos para el proyecto de **Priorización Inteligente ECICEP en Listas de Espera de Diabetes Mellitus Tipo 2 (DM2)**.

### El Mensaje Fuerza Central
> *"En el sistema público de salud de Chile, un reloj de antigüedad no puede seguir decidiendo quién recibe atención médica y quién no. Un reloj mide tiempo, no criticidad clínica. Hoy transformamos una lista administrativa pasiva en un motor dinámico de equidad, ahorro fiscal y protección de órgano blanco."*

---

## 2. El Problema del Presupuesto y el "Efecto Dominó"

### 2.1. El Gasto Fiscal de la Diabetes (10% del Presupuesto MINSAL)
* **Carga Financiera Masiva:** Según estimaciones del *IDF Diabetes Atlas* (Federación Internacional de Diabetes) y la OCDE para países con prevalencias de diabetes del 12% al 14% en adultos (Chile posee un ~12.2%-14%), la diabetes y sus complicaciones consumen **entre el 8% y el 10% del presupuesto total de salud**.
* **Impacto en Hospitalizaciones:** En la red pública de salud de Chile (FONASA/MINSAL), el gasto acumulado en hospitalizaciones asociadas a Diabetes Tipo 2 superó los **$2,8 billones de pesos** en un quinquenio (2019-2023).

### 2.2. El "Efecto Cascada" en Otras Especialidades y Listas de Espera
La Diabetes descompensada e ignorada por inercia médica o espera prolongada **no permanece contenida en la atención primaria**; actúa como un destructor financiero y operativo que colapsa las listas de espera de múltiples especialidades hospitalarias:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DIABETES DM2 DESCOMPENSADA                            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EFECTO CASCO/DOMINÓ EN LA RED (ESPECIALIDADES)           │
├──────────────────┬──────────────────────────────────────────────────────────┤
│ 🫘 Nefrología    │ Progresión a ERC Terminal ➔ Ingreso a Hemodiálisis      │
│                  │ ($18M - $22M CLP anuales por paciente)                  │
├──────────────────┼──────────────────────────────────────────────────────────┤
│ 🩸 Cirugía       │ Pie Diabético e Isquemia Crítica ➔ Amputaciones mayores │
│    Vascular /    │ Ocupación de pabellón quirúrgico y camas de alta        │
│    Traumatología │ complejidad.                                             │
├──────────────────┼──────────────────────────────────────────────────────────┤
│ 👁️ Oftalmología  │ Retinopatía Diabética Severa ➔ Vitrectomías y Ceguera    │
│                  │ irreversible en edad productiva.                         │
├──────────────────┼──────────────────────────────────────────────────────────┤
│ 🫀 Cardiología & │ Eventos Cardiovasculares Mayores (MACE: IAM / ACV)       │
│    Urgencias     │ Ocupación de UCI/UTI y descompensaciones agudas.        │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

**Conclusión Estratégica:** Priorizar dinámicamente la lista de espera de DM2 en APS no solo resuelve la cola metabólica; **descomprime y libera capacidad instalada en pabellones, camas y consultas de otras 4 especialidades críticas**.

---

## 3. Arquitectura de la Solución (Claude Agent SDK + MCP + ECICEP)

```
 [ Fichas Clínicas, Notas de Urgencia e Interconsultas No Estructuradas ]
                                   │
                                   ▼
              [ Capa de Ingesta Segura / Anonimizada (MCP) ]
                                   │
                                   ▼
         [ Agente Claude (Agent SDK + Prompts Estratificados ECICEP) ]
         • Procesamiento de Lenguaje Natural (PLN) no estructurado
         • Cálculo de Score Multicriterio de Criticidad Real (0-100)
         • Clasificación en Estratos ECICEP (G1, G2, G3)
                                   │
                                   ▼
            [ Dashboard UGD (Unidad de Gestión de la Demanda) ]
         • Reordenamiento dinámico (Sort by Score Descendente)
         • Tarjeta de Explicabilidad Clínica ("¿Por qué cambió de lugar?")
         • Botón Human-in-the-Loop (Validación con 1 Clic)
```

### Multicriterio de Scoring (0 - 100 puntos):
1. **Severidad Patológica y Comorbilidades ($W_1$):** Multimorbilidad, HbA1c, falla renal incipiente.
2. **Progresión Sintomática y Urgencias ($W_2$):** Consultas recientes en SAPU/SAR/UEH, descompensaciones.
3. **Antigüedad Relativa / Latencia ($W_3$):** Peso ponderado justo para evitar postergaciones indefinidas.
4. **Vulnerabilidad Sociodemográfica ($W_4$):** Dependencia, edad, determinantes sociales.

---

## 4. Estructura de la Presentación (Slide-by-Slide Outline)

### 🔹 Slide 1: El Gancho (The Hook)
* **Título:** Priorización Inteligente ECICEP: Protegiendo Vidas Antes de que sea Tarde.
* **Visual:** Paradoja de dos pacientes: uno estable esperando 12 meses vs. uno crítico descompensado ingresado hace 2 meses.
* **Mensaje:** La regla FIFO (*First-In, First-Out*) atiende por antigüedad administrativa, no por riesgo clínico real.

### 🔹 Slide 2: El Problema Financiero y el "Efecto Dominó"
* **Título:** El Verdadero Costo de Esperar: 10% del Presupuesto de Salud Atrapado.
* **Visual:** Infografía del gasto de la diabetes ($2,8 billones en hospitalizaciones) y cómo contamina las listas de Nefrología, Cirugía Vascular, Oftalmología y Cardiología.
* **Mensaje:** Esperar no es gratis; destruye el presupuesto del Estado y satura los pabellones quirúrgicos del hospital secundario.

### 🔹 Slide 3: La Solución (Estrategia ECICEP + Claude Agent SDK)
* **Título:** Inteligencia Artificial para el Triage Dinámico de Listas de Espera.
* **Visual:** Arquitectura simplificada: Fichas no estructuradas ➔ MCP ➔ Claude Agent SDK ➔ Dashboard UGD.
* **Mensaje:** Rescatamos la información médica atrapada en texto libre y aplicamos la matriz oficial MINSAL (ECICEP).

### 🔹 Slide 4: Demostración y Explicabilidad (Human-in-the-Loop)
* **Título:** Transparencia y Control para la Unidad de Gestión de la Demanda (UGD).
* **Visual:** Mockup del Dashboard con vista comparativa (Antes vs. Después), Tarjeta de Explicabilidad y botón de aprobación humana.
* **Mensaje:** La IA sugiere con justificación clínica transparente; el equipo médico valida con un solo clic.

### 🔹 Slide 5: Impacto Clínico y Territorial (SSMSO / Hosp. Dr. Sótero del Río)
* **Título:** Resultados Sanitarios Proyectados en el Territorio.
* **Visual:** Métricas clave:
  * 📉 **-35% a -45%** en amputaciones por Pie Diabético.
  * 📉 **-25% a -35%** en ingresos a Hemodiálisis (ERC).
  * ⏱️ Reducción de latencia en casos críticos (G3) de **>500 días a <60 días**.

### 🔹 Slide 6: Sostenibilidad Financiera y Cierre
* **Título:** Eficiencia Fiscal y Capacidad Resolutiva.
* **Visual:** Ahorro directo: Evitar 50 ingresos a diálisis = **~$1.000 Millones CLP/año** para FONASA.
* **Mensaje de Cierre:** Transformemos un registro pasivo en un motor activo de equidad y protección de vidas.

---

## 5. Guion del Pitch en Vivo (3 Minutos)

```text
[0:00 - 0:35] EL GANCHO Y EL IMPACTO PRESUPUESTARIO
"Hoy en Chile, más de 2 millones de personas están atrapadas en una lista de espera de especialidad. Pero hay un dato devastador que pocos dimensionan: la diabetes y sus complicaciones le cuestan al Estado casi el 10% de todo el presupuesto de salud. Solo en hospitalizaciones públicas por diabetes, Chile ha gastado más de 2,8 billones de pesos en los últimos 5 años.

¿Por qué ocurre esto? Porque el sistema actual ordena las listas de espera por un reloj estricto: quien ingresó primero es atendido primero, sin importar su riesgo clínico. Pero un reloj no es un criterio médico."

[0:35 - 1:15] EL EFECTO DOMINÓ EN OTRAS ESPECIALIDADES
"La mayor tragedia es el 'efecto dominó'. Cuando un paciente con diabetes pasa 18 meses en una lista de espera sin priorización adecuada, su enfermedad evoluciona silenciosamente. Y ese único paciente termina colapsando las listas de espera de OTRAS cuatro especialidades:
- Va a Nefrología a ocupar un cupo de diálisis que cuesta $20 millones al año.
- Va a Cirugía Vascular y Traumatología por un pie diabético que termina en amputación y días de pabellón.
- Va a Oftalmología por ceguera por retinopatía.
- Y satura las urgencias hospitalarias por infartos o crisis hipertensivas.
La información sobre este deterioro está atrapada en miles de notas de evolución no estructuradas que los equipos humanos no alcanzan a revisar a tiempo."

[1:15 - 2:00] LA SOLUCIÓN TECNOLÓGICA (CLAUDE + ECICEP)
"Para romper este círculo vicioso, creamos el Copiloto Inteligente de Priorización ECICEP. Alineados con la estrategia del MINSAL y usando el stack de Anthropic (Claude Agent SDK y MCP), nuestro agente 'lee' e interpreta las fichas clínicas no estructuradas, notas de urgencia y trayectorias de exámenes.

Aplica un score multicriterio que evalúa severidad, deterioro sintomático, latencia y vulnerabilidad. Clasifica al paciente en la Matriz ECICEP y presenta a la UGD una lista reordenada dinámicamente. Mantenemos siempre el control humano: el médico ve una Tarjeta de Explicabilidad Clínica con el 'por qué' del reordenamiento y aprueba con un solo clic."

[2:00 - 3:00] EL IMPACTO Y EL CIERRE
"En un territorio como el Servicio de Salud Metropolitano Sur Oriente y el Hospital Sótero del Río, reducir el tiempo de espera de pacientes de alto riesgo de más de 500 días a menos de 60 días logra:
- Una reducción de hasta un 45% en amputaciones mayores.
- Evitar un 35% de los ingresos a diálisis.
- Y liberar valiosos pabellones quirúrgicos y camas hospitalarias para OTRAS patologías de la lista de espera.

No estamos proponiendo gastar más; estamos proponiendo gastar de forma inteligente. Transformemos la lista de espera de un reloj administrativo pasivo a un motor de equidad, ahorro fiscal y protección de la vida. Muchas gracias."
```

---

## 6. Guía de Respuestas a Preguntas del Jurado (Q&A)

| Pregunta del Jurado | Respuesta Estratégica Sugerida |
| :--- | :--- |
| **¿Cómo garantizan la privacidad de los datos médicos (Ley 20.584)?** | Utilizamos la arquitectura **Model Context Protocol (MCP)** para procesar y seudonimizar los datos sensibles en el entorno local antes del razonamiento del modelo de IA. |
| **¿Qué pasa con la responsabilidad clínica si la IA se equivoca?** | El sistema opera bajo la arquitectura **Human-in-the-Loop**. La IA actúa como copiloto recomendador y entrega una Tarjeta de Explicabilidad; la decisión y validación final recae siempre en el gestor/médico de la UGD. |
| **¿Cómo evitan que un paciente estable espere para siempre?** | El Score de Criticidad Real incluye la variable de **Latencia Relativa Ponderada**. A mayor tiempo en espera, el puntaje por antigüedad se incrementa gradualmente, impidiendo la postergación indefinida. |
| **¿Por qué este enfoque ayuda a resolver las Listas de Espera en general?** | Porque la diabetes es la puerta de entrada a complicaciones multisistémicas. Al resolver la descompensación en APS, evitamos que los pacientes ingresen a las colas quirúrgicas de nefrología, vascular y oftalmología. |
