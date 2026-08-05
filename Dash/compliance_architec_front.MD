Actúa como diseñador UX/UI senior y arquitecto frontend para una plataforma de salud digital en Atención Primaria (CESFAM), enfocada en gestión de personas con Diabetes Mellitus tipo 2 (DM2) bajo la estrategia ECICEP.

La plataforma está pensada para entornos clínicos y de gestión de casos, NO para uso jurídico, pero debe incorporar principios de privacidad y seguridad desde el diseño (privacy by design) acorde al marco chileno de protección de datos personales, sin mencionar leyes específicas en la interfaz.

Objetivo:
Diseñar una “torre de control DM2 ECICEP APS” que:
- Priorice pacientes con DM2 según riesgo, brecha de control y eventos (urgencias, hospitalización).
- Agilice el trabajo del médico contralor / gestor de casos en CESFAM.
- Mantenga información suficiente del paciente para tomar decisiones clínicas-administrativas.
- Proteja la información de salud y respete la confidencialidad y el mínimo necesario de datos visibles.

Principios de diseño (privacy by design, en clave de salud):
- Mostrar solo los datos estrictamente necesarios para la decisión clínica y de gestión.
- Evitar sobreexposición de datos sensibles en vistas generales; reservar detalle para paneles específicos.
- Roles y perfiles: el contralor ve más, otros roles ven menos.
- Indicadores claros de sesión activa, cierre de sesión y seguridad básica (sin tecnicismos legales).
- Evitar textos que hagan referencia explícita a números de ley; usar lenguaje clínico y de buenas prácticas.

Arquitectura visual (manteniendo foco DM2 y posibilidad de extender a otras patologías):
- Sidebar simplificado centrado en DM2, con módulo futuro para otras patologías.
- Encabezado superior “Torre de control DM2 – ECICEP APS”.
- KPIs superiores de DM2 (personas en seguimiento, descompensados, eventos recientes, brecha de control).
- Tabla central de casos DM2 con información clínica relevante pero acotada.
- Panel derecho con detalle de paciente DM2 y explicabilidad de prioridad.
- Módulo de trazabilidad de decisiones del contralor.

Elementos específicos de privacidad y seguridad en el front:
1. Tabla central:
   - Mostrar identificadores abreviados (ej. iniciales + código interno) donde sea posible.
   - Evitar RUT completo en vistas generales; reservarlo para panel de detalle.
   - Limitar datos sensibles visibles: solo aquellos que se requieren para priorizar (ej. último HbA1c, tiempo sin control, principales comorbilidades).

2. Panel de detalle de paciente:
   - Concentrar la información clínica detallada (HbA1c, eventos, comorbilidades).
   - Incluir indicadores de quién está viendo la ficha (rol activo) y cuándo se registró la última acción.
   - Permitir registrar decisiones y motivos, conservando trazabilidad operativa, no jurídica.

3. Navegación y roles:
   - Diseñar la UI pensando en distintos perfiles: contralor, médico APS, enfermería, gestor de casos.
   - Cada perfil tiene acceso a módulos y vistas adecuados a su rol.
   - La interfaz no debe explicar leyes, sino mostrar que el acceso está controlado y que la información es tratada con cuidado.

4. Microcopy de privacidad:
   - Frases breves en lugares clave (login, panel de usuario, pie de página) indicando:
     - “Uso exclusivo de equipos de salud autorizados”.
     - “Información de salud tratada con confidencialidad”.
     - “Acceso registrado para continuidad de cuidado”.
   - Evitar citar números de ley; mantener un tono clínico y operativo.

5. Extensibilidad a otras patologías:
   - Mantener un módulo “Otras patologías” para futuras integraciones (cardiovascular, respiratorio, salud mental).
   - Aplicar la misma lógica de mínima exposición de datos y roles diferenciados.
   - Reutilizar componentes de tabla, panel de detalle y trazabilidad, respetando los principios de privacidad.

Estilo visual:
- Tema clínico moderno (oscuro o claro sobrio), con acentos en cian y verde para estados favorables y naranja/rojo para riesgo.
- Alta legibilidad y jerarquía clara.
- Íconos discretos para seguridad (sin convertir la UI en un panel técnico de ciberseguridad).

Consideraciones finales:
- La plataforma está orientada a mejorar la gestión clínica y continuidad de cuidado para personas con DM2 en APS.
- Debe incorporar privacidad desde el diseño y respeto de la confidencialidad, pero sin convertir la interfaz en un discurso legal.
- El diseño debe permitir priorizar listas, agilizar atención prioritaria o derivación, y mantener trazabilidad de decisiones, siempre desde la perspectiva de salud.

Genera un diseño de frontend que combine:
- Foco funcional en DM2 ECICEP.
- Simplicidad operativa para el contralor del CESFAM.
- Arquitectura lista para futuras patologías.
- Principios de privacy by design integrados de forma natural en la experiencia de usuario.