# 🏥 Epidemiología, Gobernanza y Gestión Asistencial de las Listas de Espera en el Sistema Público de Salud de Chile

---

## 1. Marco Conceptual y Tipología de la Demanda Asistencial

La gestión de la demanda asistencial no urgente en el Sistema Nacional de Servicios de Salud (SNSS) de Chile constituye uno de los desafíos estructurales más complejos para la salud pública contemporánea. La arquitectura del sistema diferencia dos grandes regímenes de atención en función de su amparo normativo, sus mecanismos de financiamiento y la exigibilidad de sus plazos: el **régimen de Garantías Explícitas en Salud (GES/AUGE)** y el **régimen de atención No GES**.

El sistema GES, fundamentado en la Ley Nº 19.966, establece un modelo de acceso universal y prioritario para un conjunto delimitado de problemas de salud. Garantiza legalmente cuatro dimensiones exigibles: **Acceso**, **Oportunidad** (tiempos máximos de espera para diagnóstico, tratamiento y seguimiento), **Protección Financiera** y **Calidad**. La trazabilidad de estas prestaciones se ejecuta obligatoriamente a través del sistema informático **SIGGES**. La transgresión de un plazo legal en GES habilita al usuario a activar el mecanismo de reclamo ante el Fondo Nacional de Salud (FONASA) y la Superintendencia de Salud para la designación de un segundo prestador instituido.

El régimen No GES abarca la totalidad de las necesidades sanitarias no incluidas en el catálogo GES o aquellas fases clínicas de una condición que no cumplen con los criterios del decreto vigente. Operativamente, estas solicitudes son consolidadas a nivel nacional a través del **Sistema de Información de Gestión de Tiempos de Espera (SIGTE)** y el **Registro Nacional de Listas de Espera (RNLE)**. A diferencia del GES, las atenciones No GES no poseen un plazo legalmente exigible de resolución, estando supeditadas a la capacidad instalada de la red asistencial, la disponibilidad de horas profesionales y la eficiencia organizativa de los Servicios de Salud.

Dentro de la demanda No GES, el Ministerio de Salud (MINSAL) clasifica los requerimientos en tres subcategorías operativas claramente delimitadas:

1. **Consultas Nuevas de Especialidad (CNE):** Solicitudes de atención médica u odontológica derivadas desde la Atención Primaria de Salud (APS) o entre establecimientos de menor a mayor complejidad, destinadas a la primera evaluación de un paciente por parte de un especialista facultativo.
2. **Intervenciones Quirúrgicas (IQ):** Registros de pacientes que cuentan con una indicación médica confirmada para un procedimiento quirúrgico electivo e ingresado en tabla, requiriendo uso de pabellón y/o recurso hospitalario de atención cerrada.
3. **Procedimientos Diagnósticos y Terapéuticos:** Solicitudes de prestaciones de apoyo diagnóstico o intervenciones médicas/odontológicas no quirúrgicas de mayor complejidad (tales como endoscopias, estudios de imagenología avanzada, procedimientos cardiológicos o atenciones en Unidades de Atención Primaria Oftalmológica - UAPO) necesarias para dilucidar un diagnóstico o completar un plan terapéutico.

| Dimensión de Análisis | Régimen GES (SIGGES) | Régimen No GES - CNE (SIGTE/RNLE) | Régimen No GES - IQ (SIGTE/RNLE) | Régimen No GES - Procedimientos |
| --- | --- | --- | --- | --- |
| **Marco Legal y Regulatorio** | Ley Nº 19.966 y Decretos Supremos Trienales. | Norma Técnica N° 118 / Res. Ex. N° 03 MINSAL. | Norma Técnica N° 118 / Res. Ex. N° 03 MINSAL. | Norma Técnica N° 118 / Res. Ex. N° 03 MINSAL. |
| **Exigibilidad de Tiempos** | Garantizados legalmente por umbrales continuos. | No garantizados; guiados por metas institucionales. | No garantizados; guiados por metas institucionales. | No garantizados; supeditados a la capacidad operativa local. |
| **Origen de la Solicitud** | Sospecha o confirmación clínica en cualquier nivel. | Principalmente derivación desde la APS. | Nivel Secundario o Terciario (Especialista). | APS o Nivel Secundario/Terciario. |
| **Mecanismo de Reclamo** | Instancia administrativa ante FONASA / Sup. Salud. | Solicitud OIRS, Ley de Transparencia 20.285. | Solicitud OIRS, Ley de Transparencia 20.285. | Solicitud OIRS, Ley de Transparencia 20.285. |
| **Métrica Principal** | Días de retraso respecto a la garantía legal. | Mediana de espera y percentil 75 (días). | Mediana de espera y percentil 75 (días). | Mediana de espera y tasa de resolución local. |

---

## 2. Criterios de Incorporación y Operatoria del Registro Nacional

El ingreso formal de un usuario a la Lista de Espera No GES se desencadena mediante la emisión de una **Solicitud de Interconsulta (SIC)**, instrumento físico o electrónico normalizado que formaliza la necesidad de derivación asistencial. La generación de la SIC recae en el profesional médico u odontólogo tratante de la APS o del nivel secundario. La validez del registro requiere el cumplimiento estricto del **Conjunto Mínimo de Datos (CMD)** estipulado en la Norma Técnica N° 118, el cual contempla variables de identificación del paciente (RUT, nombres, dirección, vías de contactabilidad), antecedentes epidemiológicos y socioafectivos, diagnóstico presuntivo o confirmado (codificado bajo estándares CIE), motivo de derivación y la identificación del establecimiento emisor y receptor.

Una vez generada la SIC, el requerimiento ingresa al flujo de evaluación denominado **Contraloría Médica** o proceso de priorización y triaje secundario. Este filtro institucional lo realiza un médico o cirujano dentista contralor en las Unidades de Gestión de la Demanda o Departamentos de Servicio de Orientación Médico Estadística (SOME) del establecimiento de destino o del Servicio de Salud correspondiente. La Contraloría Médica evalúa tres pilares fundamentales:

* **Pertinencia Clínica:** Se verifica que el cuadro clínico fundamentado en la SIC concuerde con los protocolos de derivación institucionales aprobados por la red asistencial.
* **Completitud Diagnóstica Previa:** Se constata que el paciente posea la totalidad de los exámenes de laboratorio e imagenología de nivel primario requeridos para que la consulta del especialista sea resolutiva.
* **Criterio GES Oculto:** Se evalúa si la condición clínica descrita corresponde en realidad a una patología contenida en el decreto GES vigente. Si se detecta un "GES oculto", la SIC No GES debe ser rechazada y egresada inmediatamente bajo la causal correspondiente, canalizándola a través del sistema SIGGES con su respectivo Formulario de Constancia de Información al Paciente GES.

Las solicitudes que presentan deficiencias insustentables de información, incongruencias diagnósticas o falta de alineación con la oferta de la red son sujetas a causales de devolución o rechazo (destacando la causal de **No Pertinencia**). Cuando una SIC es devuelta, retorna al establecimiento de origen para su rectificación, la realización de mayores estudios o el alta en APS.

Las solicitudes validadas son incorporadas de manera obligatoria al **Registro Nacional de Listas de Espera (RNLE)**, repositorio centralizado administrado por el MINSAL. La Norma Técnica N° 118 (actualizada mediante la Resolución Exenta N° 03 de enero de 2025) impone que la carga e integración de datos entre los sistemas locales (motores de integración SIDRA o software hospitalarios) y el RNLE debe concretarse en un plazo máximo normado, no superior a **10 días hábiles** desde la validación de la SIC, para resguardar la continuidad de la atención y evitar sesgos de subregistro.

---

## 3. Dinámica de Flujo, Algoritmos de Priorización y Causales Normadas de Egreso

El tránsito del usuario dentro del RNLE está regulado por un flujo procedimental continuo que va desde la validación inicial de la demanda hasta el cierre del caso. Una vez que la Solicitud de Interconsulta (SIC) supera el filtro de la Contraloría Médica, ingresa al Registro Nacional de Listas de Espera (RNLE), donde queda disponible para la gestión de la oferta hospitalaria. La asignación del turno de atención no responde a una estricta regla de orden de llegada (FIFO), sino a un **modelo ponderado dinámico** sustentado en cuatro dimensiones clínicas y sociales fundamentales:

1. **Criterio Biomédico y Severidad Clínica:** Evaluado por la Contraloría Médica al momento de la recepción de la SIC. Prioriza aquellos cuadros que implican un riesgo incipiente de compromiso funcional severo, progresión rápida hacia la invalidez o riesgo vital implícito.
2. **Priorización de la Condición Oncológica No GES:** Pacientes con sospecha o diagnóstico confirmado de patologías neoplásicas malignas no amparadas por decretos GES específicos acceden a vías de agendamiento preferencial para evitar la progresión de la enfermedad.
3. **Antigüedad en la Lista de Espera:** Aquellas solicitudes que acumulan períodos extendidos (históricamente focalizados en colas superiores a 2 o más años de espera) reciben un factor de corrección en el algoritmo para garantizar la resolución progresiva de los casos más antiguos acumulados en el sistema.
4. **Vulnerabilidad Social y Grupos de Especial Protección:** Criterio transversal aplicable a niños, niñas y adolescentes bajo tutela del Estado (Servicio Nacional de Protección Especializada a la Niñez y Adolescencia / Mejor Niñez), beneficiarios del Programa de Reparación y Atención Integral en Salud (PRAIS) y adultos mayores en situación de dependencia.

El flujo dinámico del paciente exige un proceso de gestión activa de la contactabilidad. Los establecimientos deben ejecutar chequeos de confirmación de citas antes de la fecha agendada. Ante la imposibilidad de ubicar al usuario tras reiterados intentos documentados por diversas vías (telefónica, postal o visitas domiciliarias de APS), o ante inasistencias no justificadas a las citas programadas, se activan los protocolos de egreso administrativo o suspensión.

El egreso del RNLE es un acto legal y administrativo reglamentado que extingue la condición de espera del paciente para esa SIC específica. Las causales normadas se encuentran estructuradas bajo la **Norma Técnica N° 118**, el **Ordinario C202 N° 2760 de 2021** y la **Resolución Exenta N° 03 de enero de 2025**. Estas causales se dividen operativamente en salidas asistenciales (médicas/clínicas) y salidas administrativas.

| Código / Causal | Descripción Normativa de la Causal | Requisito de Respaldo Documental | Responsable de la Acreditación |
| --- | --- | --- | --- |
| **0. GES** | Traspaso del caso al régimen GES por identificación de criterio de acceso o confirmación diagnóstica durante la espera. | Formulario de Constancia GES e ingreso a SIGGES registrado en Ficha Clínica. | Médico Contralor / Administrativo SOME. |
| **1. Atención Realizada** | Otorgamiento efectivo de la consulta médica de especialidad presencial o por telemedicina por profesional validado. | Ficha Clínica con hoja de atención diaria y registro asistencial. | Médico Tratante / Especialista. |
| **2. Procedimiento Informado** | Ejecución y emisión del informe del procedimiento diagnóstico o terapéutico requerido. | Informe técnico en Ficha Clínica o sistema de almacenamiento de imágenes. | Profesional Ejecutor del Procedimiento. |
| **4. Extra-sistema** | Atención otorgada en prestadores privados o institucionales fuera de la red directa pero coordinada públicamente. | Registro de la atención y factura/convenio de prestación en ficha del caso. | Unidad de Convenios / Gestión de la Demanda. |
| **5. No Beneficiario / Cambio Asegurador** | Pérdida de la condición de afiliado a FONASA (traspaso a ISAPRE, CAPREDENA, DIPRECA o extemporaneidad). | Verificación en base de datos de FONASA o Fonasa-Certificador. | Administrativo Encargado de RNLE. |
| **6. Renuncia o Rechazo Voluntario** | Manifiesto expreso del usuario o apoderado de no querer recibir la atención requerida. | Documento de rechazo firmado por el paciente o registro firmado por profesional. | Equipo Asistencial / SOME. |
| **7. Recuperación Espontánea** | Cesación del cuadro clínico que motivó la derivación sin mediar intervención especializada. | Informe o comprobante emitido por profesional médico evaluador en APS. | Médico Tratante APS / Contralor. |
| **8. Inasistencia** | Ausencia del usuario a la cita médica agendada sin justificación oportuna dentro de los plazos establecidos. | Registro de agendamiento y marca de inasistencia en el sistema local. | Administrativo de Registro SOME. |
| **9. Fallecimiento** | Defunción del paciente registrada durante el transcurso del período de espera. | Certificado de Defunción expedido por el Registro Civil. | Encargado RNLE / Registro Civil. |
| **11. Contacto No Corresponde** | Imposibilidad absoluta de ubicar al usuario mediante los datos de contacto provistos tras agotar protocolos. | Bitácora de llamados, cartas certificadas o registros de visita domiciliaria de APS. | Unidad de Gestión de Contactabilidad / SOME. |
| **12. No Corresponde Realizar Cirugía** | Pérdida de la indicación quirúrgica por cambio de condición clínica, contraindicación o riesgo desproporcionado. | Evolución médica en Ficha Clínica suscrita por especialista facultativo. | Médico Cirujano Especialista. |
| **14. No Pertinencia** | Desestimación de la SIC por no cumplir protocolos de referencia o falta de requisitos de APS. | Informe de rechazo fundado emitido por la Contraloría Médica. | Médico Contralor de Especialidad. |
| **16/17/19. Resolutividad / Telemedicina / Hospital Digital** | Resolución del problema de salud mediante estrategias de telemedicina, UAPO o plataformas digitales. | Registro clínico electrónico respaldado en Hospital Digital o plataforma local. | Médico Tratante a Distancia / UAPO. |

---

## 4. Capítulo Especial: Trayectoria y Nudos Críticos del Paciente con Diabetes Mellitus Tipo 2 (DM2)

### Estatus Regulatorio y Segmentación GES vs. No GES

La Diabetes Mellitus Tipo 2 (DM2) constituye una entidad nosológica emblemática para comprender las intersecciones operativas entre los regímenes de atención pública en Chile. La cobertura primaria del diagnóstico, tratamiento inicial y seguimiento continuo del paciente con DM2 está consagrada oficialmente bajo el **Problema de Salud GES Nº 7 (Diabetes Mellitus Tipo 2)**. Bajo esta garantía legal, todo paciente diagnosticado en el Programa de Salud Cardiovascular (PSCV) de la Atención Primaria de Salud tiene asegurado el acceso a terapias farmacológicas de primera y segunda línea (hipoglucemiantes orales e insulinas) y a controles periódicos con equipo multidisciplinario (médico, enfermera, nutricionista).

A medida que la enfermedad progresa y sobrevienen complicaciones micro y macrovasculares, la trayectoria del usuario se fragmenta entre coberturas específicas de otros problemas GES y derivaciones a la Lista de Espera No GES:

* **Retinopatía Diabética:** Cubierta por el **Problema de Salud GES Nº 31**. El tamizaje periódico de fondo de ojo se ejecuta prioritariamente en las Unidades de Atención Primaria Oftalmológica (UAPO) o en la APS mediante teleoftalmología. Si se confirma una Retinopatía Diabética Proliferativa o un Edema Macular Diabético, el paciente es derivado a la especialidad médica de oftalmología en el nivel secundario bajo plazos garantizados por GES para fotocoagulación láser o inyecciones anti-VEGF.
* **Nefropatía Diabética y Enfermedad Renal Crónica (ERC):** En fases incipientes (microalbuminuria o alteración leve de la velocidad de filtración glomerular), la condición se maneja en el PSCV. Ante la progresión hacia estadios avanzados (ERC Estadio 4 o 5), la confirmación y acceso a terapia de reemplazo renal (diálisis o trasplante) queda protegida por el **Problema de Salud GES Nº 1 / Nº 64**. No obstante, la etapa intermedia (ERC Estadio 3, evaluación por nefrología para frenar la progresión microvascular) carece de plazo legal y debe ingresar a la **Lista de Espera No GES para Consulta Nueva de Especialidad en Nefrología**.
* **Pie Diabético y Enfermedad Arterial Oclusiva Periférica (EAOP):** El manejo inicial de las úlceras no infectadas y las curaciones avanzadas de herida se otorgan en la APS bajo la canasta del PSCV. Sin embargo, cuando existe compromiso vascular periférico severo (isquemia crítica de extremidad inferior), infección profunda o necesidad de revascularización quirúrgica/endovascular, la atención requiere la derivación a la **Lista de Espera No GES de Cirugía Vascular Periférica y Traumatología**.
* **Endocrinología Compleja:** Aquellos pacientes con falla terapéutica a múltiples esquemas de insulina, sospecha de formas secundarias o descompensaciones metabólicas persistentes sin criterio de urgencia vital inmediata deben ser derivados a la **Lista de Espera No GES para Consulta Nueva de Especialidad en Endocrinología**.

---

### Nudos Críticos de Latencia e Impacto Clínico-Epidemiológico

El recorrido asistencial del paciente con DM2 evidencia una marcada bifurcación operacional. Mientras el paciente permanece en la Atención Primaria bajo el control del PSCV, sus prestaciones están normadas por el régimen GES N° 7. Sin embargo, en el momento en que se sospecha o desencadena una complicación específica, la trayectoria varía sustancialmente: si la complicación califica como Retinopatía Diabética (GES N° 31) o Insuficiencia Renal Terminal (GES N° 1/64), el paciente ingresa a una vía garantizada en el nivel hospitalario. En contraste, cuando la complicación requiere una evaluación previa por Nefrología en Estadio 3, una intervención por Cirugía Vascular por un pie diabético isquémico o una evaluación endocrinológica avanzada, el usuario debe incorporarse a la Lista de Espera No GES.

En esta vía No GES se generan graves nudos críticos de latencia. El principal cuello de botella radica en los dilatados tiempos de espera entre la emisión de la SIC en APS y la atención efectiva en el nivel secundario. A pesar de que la APS mantiene un alto volumen de controles, las brechas de resolutividad distorsionan la continuidad asistencial.

* **Cuellos de Botella en Exámenes Diagnósticos Específicos:** La toma periódica de la Razón Albúmina/Creatinina (RAC) en orina y la estimación de la Filtración Glomerular son esenciales para la detección precoz del daño renal. La saturación de los laboratorios de referencia municipal o de los Servicios de Salud genera retrasos en la entrega de resultados, dilatando la emisión oportuna de la SIC a nefrología.
* **Brecha en el Tamizaje y Resolución Oftálmica:** Aunque las UAPO han incrementado la capacidad de fondo de ojo por telemedicina, las listas de espera No GES para atenciones quirúrgicas oftalmológicas complejas (tales como la vitrectomía en hemorragias vítreas masivas o desprendimientos de retina de origen diabético) presentan demoras significativas que superan los límites de reversibilidad visual.
* **Cirugía Vascular Periférica y Amputación:** La acumulación de solicitudes No GES para consultas de Cirugía Vascular y estudios angiográficos desencadena un fenómeno de espera deletérea. La progresión de la isquemia periférica en un pie diabético durante meses de espera transforma una lesión tratable con revascularización en un cuadro de necrosis irreversible. Epidemiológicamente, las tasas de amputación mayor (supracondílea o infracondílea) en la población con DM2 en Chile funcionan como un indicador indirecto de la falla estructural en los tiempos de respuesta del sistema de salud.
* **Impacto de la Inercia Terapéutica y la Morbimortalidad:** La espera prolongada por una evaluación endocrinológica No GES perpetúa esquemas de tratamiento insatisfactorios (inercia terapéutica). El mantenimiento de niveles de Hemoglobina Glicosilada (HbA1c) por encima de las metas clínicas (HbA1c > 8-9%) durante el período de espera acelera el daño microvascular en la retina y el glomérulo renal, e incrementa el riesgo de eventos macrovasculares descompensados (Infarto Agudo al Miocardio y Ataque Cerebrovascular).

---

## 5. Fuentes de Información, Bases de Datos y Herramientas Públicas

El análisis exhaustivo de la demanda no resuelta en el sector público de salud chileno requiere el dominio de una red heterogénea de sistemas informáticos primarios, registros estadísticos y plataformas de transparencia pública.

### Sistemas Primarios de Registro e Información Asistencial

1. **Sistema de Información de Gestión de Tiempos de Espera (SIGTE):** Plataforma transaccional y analítica del MINSAL encargada de consolidar mensualmente las bases de datos de listas de espera No GES (CNE, IQ y Procedimientos) enviadas por los 29 Servicios de Salud del país.
2. **Sistema de Información de Garantías Explícitas en Salud (SIGGES):** Aplicativo informático donde se registran, monitorean y notifican de forma obligatoria los eventos y etapas de los 87 problemas de salud GES.
3. **Registro Nacional de Listas de Espera (RNLE):** Base de datos centralizada alimentada mediante procesos de integración electrónica desde los sistemas locales de gestión hospitalaria (HIS/SIDRA).
4. **Departamento de Estadísticas e Información de Salud (DEIS):** Repositorio oficial que consolida las Series del Registro Estadístico Mensual (REM). Sobresalen la Serie REM-07 (Atenciones y Consultas Médicas de Especialidad), la Serie REM-20 (Listas de Espera) y la base de datos de Egresos Hospitalarios, fundamentales para correlacionar la demanda en espera con la oferta asistencial efectuada.

---

### Fuentes de Libre Acceso, Transparencia e Información Presupuestaria

* **Visor Ciudadano y Visor Gestor de Listas de Espera (MINSAL):** Portales web institucionalizados orientados al monitoreo del estado de las colas de espera. El Visor Ciudadano permite al usuario FONASA la verificación individual de sus SIC activas, mientras que el Visor Gestor entrega agregaciones operativas para los equipos de salud.
* **Informes a la Comisión Mixta de Presupuestos (Glosa 06 de la Ley de Presupuestos):** Reportes obligatorios presentados por la Subsecretaría de Redes Asistenciales al Congreso Nacional en virtud de la Glosa 06 de la Ley de Presupuestos del Sector Público. Estos informes contienen la desagregación oficial por Servicio de Salud, especialidad, grupo etario, causales de egreso y distribución temporal (mediana, percentiles 25 y 75) de las atenciones pendientes No GES y retrasos GES.
* **Portal de Transparencia del Estado (Ley N° 20.285):** Instrumento normativo que faculta a investigadores y ciudadanos a solicitar microdatos anonimizados del RNLE y SIGTE mediante peticiones de acceso a la información pública a las Direcciones de Servicios de Salud y al MINSAL.
* **Mercado Público (Dirección de Compras y Contratación Pública - ChileCompra):** Plataforma para analizar las licitaciones públicas, convenios marco y tratos directos ejecutados por FONASA y los Servicios de Salud para la derivación de pacientes a prestadores privados bajo las líneas de financiamiento especial de "Resolución de Listas de Espera".

| Sistema / Fuente de Información | Cobertura Sanitaria | Periodicidad de Actualización | Tipo de Acceso | Utilidad en Análisis Cuali-Cuantitativo |
| --- | --- | --- | --- | --- |
| **SIGTE / RNLE** | Universo No GES (CNE, IQ, Procedimientos). | Mensual (corte estadístico). | Restringido / Vía Ley 20.285 | Modelamiento cuantitativo de tiempos de espera y volumen de demanda. |
| **SIGGES** | Catálogo GES (87 Problemas de Salud). | En tiempo real / Continuo. | Restringido / Vía Ley 20.285 | Evaluación del cumplimiento de garantías de oportunidad y retrasos legales. |
| **Series REM (DEIS)** | Atenciones realizadas en toda la Red Nacional. | Mensual / Publicación anual. | Libre Acceso Público | Cálculo de tasas de producción, oferta efectiva y capacidad resolutiva local. |
| **Glosa 06 Presupuestaria** | Consolidado Nacional y por Servicio de Salud. | Trimestral / Semestral. | Libre Acceso (Congreso/MINSAL) | Análisis macro de tendencias epidemiológicas y auditoría de egresos. |
| **Mercado Público** | Compras e intermediación a prestadores privados. | En tiempo real / Por proceso. | Libre Acceso Público | Evaluación de costos del extra-sistema y compras de capacidad resolutiva. |

---

### Estrategias de Análisis Cuantitativo y Cualitativo de Datos

Para una evaluación analítica de las listas de espera, los estándares de salud pública e instituciones internacionales como la OCDE recomiendan rechazar el uso del promedio o media aritmética como métrica central, debido a la marcada asimetría positiva de las distribuciones de tiempos de espera. Se imponen las siguientes directrices metodológicas:

1. **Diferenciación entre Pacientes Tratados y Pacientes en Espera:** El análisis debe separar la distribución de tiempos de aquellos pacientes que ya causaron egreso por atención realizada (tiempo de espera completado) de aquellos que continúan activos en el RNLE a la fecha de corte (tiempo de espera incompleto). El indicador de pacientes en espera sobre-representa a los casos de larga estancia.
2. **Estadística Descriptiva No Paramétrica:** Se debe emplear la Mediana (Percentil 50) como medida de tendencia central fundamental, acompañada por el Rango Intercuartílico (Percentiles 25 y 75) para caracterizar la dispersión y la severidad de la cola de máxima antigüedad.
3. **Análisis de Supervivencia y Modelos de Riesgo Proporcional:** En estudios longitudinales de cohorte a partir de microdatos, se recomienda el uso de estimadores Kaplan-Meier para calcular las tasas acumuladas de resolución en el tiempo, así como modelos de regresión de Cox para identificar determinantes socio-demográficos (edad, ruralidad, tramo FONASA) y clínicos asociados al riesgo de permanecer más de 365 o 730 días en la lista.
4. **Auditoría Cualitativa de Causales de Salida:** Se sugiere metodológicamente contrastar el volumen de egresos bajo causales administrativas (tales como Inasistencia, Contacto no corresponde o No pertinencia) mediante muestras representativas auditadas contra las fichas clínicas. El objetivo es cuantificar potenciales egresos no asistenciales que afecten a pacientes vulnerables o ilocalizables.
5. **Modelación del Impacto de Grupos Relacionados con el Diagnóstico (GRD):** Integrar los datos de egresos hospitalarios e IQ No GES con la clasificación GRD para medir el consumo real de recursos hospitalarios y la complejidad casuística de los pacientes operados, permitiendo ponderar la eficiencia de los pabellones en la resolución de la demanda acumulada.

---

## 6. Referencias y Fuentes Oficiales

* [Biblioteca del Congreso Nacional (BCN) - Medición y Reportes de Lista de Espera No GES (PDF)](https://www.bcn.cl/obtienearchivo?id=repositorio/10221/37106/1/BCN_Rendicion_Publica_de_Listas_Espera_en_Salud__final2.pdf)
* [Boletín Academia de Medicina - Jornada APS y Gestión Asistencial](https://bolacadmed.cl/index.php/bacm/article/download/145/254/403)
* [Servicio de Salud Metropolitano Oriente (SSMO) - Lista de Espera No GES](https://dis.saludoriente.cl/dis/pages/lista-espera)
* [Servicio de Salud Osorno - Ord. C202 N°2760 Causales de Salida LE No GES (PDF)](https://estadisticas.ssosorno.cl/lista_espera/documentos_le/Ord_C202_N2760_Causales_de_Salida_de_LE_No_GES(08092021).pdf)
* [SSMO - Productos y Causales de Egreso RNLE](https://dis.saludoriente.cl/dis/productos/causales_le/causales)
* [SSMSO - Diseño e Implementación del Enfoque de Riesgo CV (PDF)](http://www.ssmso.cl/protocolos/Dise%C3%B1oDtoImpRiesgoCV9.pdf)
* [Ley Chile BCN - Decreto 29 Minsal Salud Pública](https://www.bcn.cl/leychile/navegar?idNorma=1220430)
* [Salud Quillota - Guía Rápida GES N° 31 Retinopatía Diabética (PDF)](https://www.saludquillota.cl/biblioteca/guias_rapidas/31%20Retinopat%C3%ADa%20Diab%C3%A9tica%202.1.pdf)
* [SSMO - Ord. C202 N°2760 Actualización Causales de Salida LE No GES (PDF)](https://dis.saludoriente.cl/dis/docs/listas-de-espera/Ord.%20C202%20N%C2%B02760%20-%20Actualizacion%20Causales%20de%20Salida%20de%20LE%20No%20GES%20(2021).pdf)
* [Superintendencia de Salud - Garantías Explícitas en Salud (GES)](https://www.superdesalud.gob.cl/tax-temas-de-orientacion/garantias-explicitas-en-salud-ges-1962/)
* [Servicio de Salud Coquimbo - Manual de Registro de Lista de Espera No GES (PDF)](https://www.sscoquimbo.cl/gob-cl/documentos/files/estadisticas/lista/06-07-2018/Manual%20FINAL%20LE.pdf)
* [Repositorio UNAB - Tesina Modelo de Gestión de Listas de Espera No GES (PDF)](https://repositorio.unab.cl/bitstreams/c1b57332-2d1a-45bf-a9d0-30b0a02576fb/download)
* [Corporación Municipal de Puente Alto - Plan de Salud 2026-2028 (PDF)](https://www.cmpuentealto.cl/app/uploads/2026/01/PLANDESALUD-2026-2028_PA_compressed.pdf)
* [Lista de Espera Salud Chile - Informe CEI 2025 Listas de Espera (PDF)](https://www.listaesperasalud.cl/informes/CEI2025.pdf)
* [Biblioteca del Congreso Nacional (BCN) - Listas y Tiempos de Espera en Chile (PDF)](https://obtienearchivo.bcn.cl/obtienearchivo?id=repositorio/10221/36366/2/BCN_Tiempos_de_espera_para_atencion_en_salud__EG_final.pdf)
* [SSMSO - Norma Técnica para el Registro de las Listas de Espera (PDF)](https://www.ssmso.cl/tmpArchivos/SIDRA/NORMA%20TECNICA%20RLE_v0.0.11.pdf)
* [SSMO - Res. Exenta N° 03 Actualización Norma Técnica 118 RNLE (2025) (PDF)](https://dis.saludoriente.cl/dis/docs/listas-de-espera/RES.%20EXENTA%20N%C2%B0%2003%20ACTUALIZACI%C3%93N%20DE%20NORMA%20DE%20REGISTRO%20LE%20NO%20GES,%20Norma%20tecnica%20118%20(enero%202025).pdf)
* [ResearchGate - Retinopatía Diabética en Chile Reporte Cuantitativo](https://www.researchgate.net/publication/355953449_Retinopatia_Diabetica_en_Chile_un_reporte_cuantitativo_de_la_proporcion_de_diabeticos_con_fondo_de_ojo_anual)
* [Senado de Chile - Claves y Propuestas Presupuesto Salud](https://tramitacion.senado.cl/appsenado/index.php?mo=transparencia&ac=doctoInformeAsesoria&id=36090)
* [Senado de Chile - Cumplimiento Glosas Presupuestarias Salud](https://www.senado.cl/site/presupuesto/2021/cumplimiento/Glosas%202021/16%20Salud/3245%20Salud.pdf)
* [DIPRES - Balance de Gestión Integral Ministerio de Salud (PDF)](http://www.dipres.cl/597/articles-172629_doc_pdf.pdf)
* [SSMSO - Priorización Diagnósticos Especialidades Médicas No GES (PDF)](https://redsalud.ssmso.cl/wp-content/uploads/2025/07/PRIORIZACION-SSMSO-02.07.2025-I-ETAPA.pdf)
* [Servicio de Salud Osorno - Causales de Egreso LE No GES DEIS](https://estadisticas.ssosorno.cl/lista_espera/causales_le.php)
* [Salud Quillota - Guía Rápida GES N° 7 Diabetes Mellitus Tipo 2 (PDF)](https://www.saludquillota.cl/biblioteca/guias_rapidas/7%20Diabetes%20Mellitus%20Tipo%202%20v3.2.pdf)
* [Servicio de Salud Coquimbo - Manual Series REM 2019 (PDF)](https://www.sscoquimbo.cl/gob-cl/documentos/files/estadisticas/series/2019/Manual%20Series%20REM%20V1.0%202019.pdf)
* [Superintendencia de Salud - Orientación Retinopatía Diabética](https://www.superdesalud.gob.cl/orientacion-en-salud/retinopatia-diabetica/)
* [Municipalidad de Maipú - Plan de Salud Comunal 2026 (PDF)](https://media.municipalidadmaipu.cl/media/documentos/2026/2/17707260403634.pdf)
* [Gobierno Digital - Informe de Traspaso Ministerio de Salud](https://traspaso.digital.gob.cl/ministerio-de-salud/subsecretaria-de-salud-publica/)
* [Biblioteca Digital Academia - Ley GES y Guías de Práctica Clínica (PDF)](https://bibliotecadigital.academia.cl/bitstreams/30625fd6-b089-4d5e-ba18-9c0d31cee906/download)
* [Scribd - Informe Amputaciones por Diabetes en Chile](https://es.scribd.com/document/663230527/2022-03-07-INFORME-AMPUTACION-POR-DIABETES)
* [Hospital Clínico de Magallanes - Plan Estratégico 2024-2027 (PDF)](https://hospitalclinicomagallanes.cl/0001%20Planificaci%C3%B3n%20Estrat%C3%A9gica%202024-2027/001%20Plan%20de%20desarrollo%20estrat%C3%A9gico%20VF191223.pdf)
* [Observatorio de Datos UAI - Glosa 6 Ley de Presupuesto MINSAL (PDF)](https://observatoriodedatos.uai.cl/wp-content/uploads/2025/06/Glosa-6-Ley-de-Presupuesto-cuarto-trimestre-2024-MINSAL.pdf)
* [Senado de Chile - Informe Subsecretaría de Redes Asistenciales](https://www.senado.cl/site/presupuesto/2025/cumplimiento/Glosas%202025/16%20Salud/1610_12213_18062025_subred.pdf)
* [Mercado Público - Licitaciones de Servicios Quirúrgicos](https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?idlicitacion=5184-99-LQ24)
* [Senado de Chile - Situación Presupuestaria Servicios de Salud](https://microservicio-documentos.senado.cl/v1/archivos/1b8f356f-c501-4d23-9f55-7a9425724906?includeContent=true)
* [Salud Atacama - Gestión de Demandas y Listas de Espera](https://www.saludatacama.cl/?page_id=5140)
* [DIPRES - Informe de Evaluación Cumplimiento de Glosas Presupuestarias](https://www.dipres.gob.cl/597/articles-188371_doc_pdf.pdf)
* [Municipalidad de Santa Bárbara - Plan de Salud Comunal 2026 (PDF)](https://www.santabarbara.cl/wp-content/uploads/2026/01/Plan-de-Salud-Comunal-2026-DSM.pdf)
* [PUCV - Repositorio Tesis Gestión Asistencial](http://opac.pucv.cl/pucv_txt/Txt-5500/UCC5974_01.pdf)
* [Universidad de Chile IAS - Investigación Salud Pública e Inequidad](https://ias.uchile.cl/uploads/investigacion_archivo/a322e5ffe081366d021244e235dcd5deebfca27d.pdf)
* [DIPRES - Informe de Ejecución Presupuestaria Sector Salud (PDF)](https://www.dipres.gob.cl/597/articles-212527_doc_pdf1.pdf)
