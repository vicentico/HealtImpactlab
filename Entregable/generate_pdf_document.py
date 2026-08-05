#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar el documento PDF técnico e institucional completo del proyecto:
"Priorización Inteligente ECICEP y Copiloto IA en Listas de Espera de DM2"
para la organización del concurso (Impact Lab / Bendi / MINSAL).
"""

import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# ----------------------------------------------------------------------
# Clase para Canvas Numerado con Encabezados y Pies de Página
# ----------------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Portada: sin encabezado ni pie de página estándar
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#4A5568"))

        # Encabezado (Header)
        self.drawString(54, 750, "PROYECTO PRIORIZACIÓN INTELIGENTE ECICEP & COPILOTO IA — DOSSIER OFICIAL")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Pie de Página (Footer)
        self.line(54, 48, 558, 48)
        self.setFont("Helvetica", 8)
        self.drawString(54, 34, "Health Solutions / Impact Lab 2026 — Documento de Presentación para Concurso")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(558, 34, page_str)
        self.restoreState()


def create_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Definición de Paleta de Colores
    PRIMARY = colors.HexColor("#1A365D")    # Azul Marino Profundo
    SECONDARY = colors.HexColor("#2F855A")  # Verde Salud / Esmeralda
    DARK_TEXT = colors.HexColor("#2D3748")  # Gris Oscuro
    LIGHT_BG = colors.HexColor("#F7FAFC")   # Gris Muy Claro
    ACCENT_BG = colors.HexColor("#EDF2F7")  # Gris Claro Destacado
    BORDER_COLOR = colors.HexColor("#CBD5E0")
    ALERT_BG = colors.HexColor("#FEFCBF")   # Amarillo Pastel
    ALERT_BORDER = colors.HexColor("#D69E2E")

    # Modificación/Creación de Estilos Tipográficos
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=PRIMARY,
        alignment=0,
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11.5,
        leading=16,
        textColor=SECONDARY,
        alignment=0,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'H1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'H3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=DARK_TEXT,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1A202C")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=DARK_TEXT
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # =========================================================================
    # PORTADA EJECUTIVA
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("HEALTH SOLUTIONS / HEALTH IMPACT LAB 2026", ParagraphStyle('OrgTag', fontName='Helvetica-Bold', fontSize=10, textColor=SECONDARY, leading=12, spaceAfter=15)))
    story.append(Paragraph("DOCUMENTO TÉCNICO INTEGRADO & DOSSIER DE PRESENTACIÓN", ParagraphStyle('DocType', fontName='Helvetica-Bold', fontSize=12, textColor=colors.HexColor("#718096"), leading=14, spaceAfter=10)))
    story.append(HRFlowable(width="100%", thickness=3, color=PRIMARY, spaceBefore=0, spaceAfter=20))
    
    story.append(Paragraph("Priorización Inteligente ECICEP y Copiloto IA en Listas de Espera de Diabetes Mellitus Tipo 2 (DM2)", title_style))
    story.append(Paragraph("Optimizando la gestión asistencial y la equidad en salud pública mediante Inteligencia Artificial guiada por la matriz oficial del MINSAL en el Servicio de Salud Metropolitano Sur Oriente (SSMSO / Hosp. Dr. Sótero del Río)", subtitle_style))
    
    story.append(Spacer(1, 25))

    # Box de Metadatos de la Portada
    meta_data = [
        [Paragraph("<b>Concurso / Desafío:</b>", table_cell_bold), Paragraph("Impact Lab 2026 — Línea 02: Descompresión de Listas de Espera No GES", table_cell_style)],
        [Paragraph("<b>Territorio Piloto:</b>", table_cell_bold), Paragraph("SSMSO (~1,5 M hab.) / Hospital Dr. Sótero del Río (~140.000 pac. DM2 en APS)", table_cell_style)],
        [Paragraph("<b>Equipo Postulante:</b>", table_cell_bold), Paragraph("Health Solutions / Impact Lab", table_cell_style)],
        [Paragraph("<b>Tecnologías Clave:</b>", table_cell_bold), Paragraph("Anthropic Claude API (Agent SDK) + Model Context Protocol (MCP) + Dashboard UGD", table_cell_style)],
        [Paragraph("<b>Fecha de Entregable:</b>", table_cell_bold), Paragraph("Agosto 2026 — Versión Oficial 1.0", table_cell_style)],
    ]
    t_meta = Table(meta_data, colWidths=[140, 364])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_BG),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_meta)

    story.append(Spacer(1, 35))

    # Mensaje Fuerza Destacado en la Portada
    quote_text = Paragraph(
        "<b>Mensaje Fuerza Central:</b><br/>"
        "<i>«En el sistema público de salud de Chile, un reloj de antigüedad no puede seguir decidiendo quién recibe atención médica y quién no. Un reloj mide tiempo, no criticidad clínica. Hoy transformamos una lista administrativa pasiva en un motor dinámico de equidad, ahorro fiscal y protección de órgano blanco.»</i>",
        callout_style
    )
    t_quote = Table([[quote_text]], colWidths=[504])
    t_quote.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ALERT_BG),
        ('PADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 1.5, ALERT_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_quote)

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 1: RESUMEN EJECUTIVO Y MARCO ESTRATÉGICO
    # =========================================================================
    story.append(Paragraph("1. Resumen Ejecutivo y Marco Estratégico", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "En la red pública de salud de Chile (FONASA), la gestión de las Listas de Espera No GES (SIGTE / RNLE) opera históricamente bajo una regla de colas estricta <b>FIFO (First-In, First-Out)</b>. Este modelo prioriza la atención en función de la fecha de ingreso de la Interconsulta (SIC), sin evaluar dinámicamente el deterioro clínico del paciente ni su riesgo de descompensación.",
        body_style
    ))
    story.append(Paragraph(
        "Para un paciente con <b>Diabetes Mellitus Tipo 2 (DM2)</b>, esperar a ciegas en una cola administrativa representa una amenaza crítica: la inercia terapéutica promueve la progresión silenciosa del daño micro y macrovascular hacia complicaciones irreversibles como insuficiencia renal terminal, amputaciones de extremidades inferiores, infartos agudos al miocardio y ceguera.",
        body_style
    ))
    story.append(Paragraph(
        "El presente proyecto introduce una herramienta integral de <b>Priorización Inteligente basada en el Modelo ECICEP y un Copiloto de Inteligencia Artificial (Claude Agent SDK + MCP)</b>. El sistema analiza datos no estructurados de fichas clínicas y evoluciones médicas, calcula un <b>Score de Criticidad Real (0-100)</b>, reordena dinámicamente la lista de espera e integra una interfaz UGD con trazabilidad y explicabilidad clínica garantizada (<i>Human-in-the-Loop</i>).",
        body_style
    ))

    story.append(Paragraph("Matriz de Objetivos Estratégicos del Proyecto", h2_style))
    
    obj_data = [
        [Paragraph("Objetivo", table_header_style), Paragraph("Descripción Breve", table_header_style), Paragraph("Impacto Esperado", table_header_style)],
        [
            Paragraph("<b>1. Equidad por Riesgo</b>", table_cell_bold),
            Paragraph("Reemplazar el criterio de antigüedad pasiva por el Score de Criticidad Real ECICEP (0-100 pts).", table_cell_style),
            Paragraph("Reducción de latencia en casos graves (G3) de >500 días a <b><60 días</b>.", table_cell_style)
        ],
        [
            Paragraph("<b>2. Protección Orgánica</b>", table_cell_bold),
            Paragraph("Intervenir en la ventana metabólica de reversibilidad mediante derivación priorizada y apoyo a APS.", table_cell_style),
            Paragraph("Reducción del <b>35%-45%</b> en amputaciones y <b>25%-35%</b> en diálisis.", table_cell_style)
        ],
        [
            Paragraph("<b>3. Eficiencia Operativa</b>", table_cell_bold),
            Paragraph("Reducir la inasistencia (NSP - 15,6%) y optimizar la pertinencia diagnóstica de las interconsultas.", table_cell_style),
            Paragraph("Recuperación de capacidad médica y brecha de <b>4.900 especialistas</b>.", table_cell_style)
        ],
        [
            Paragraph("<b>4. Sostenibilidad Fiscal</b>", table_cell_bold),
            Paragraph("Evitar hospitalizaciones complejas y terapias de reemplazo renal de alto costo para FONASA.", table_cell_style),
            Paragraph("Ahorro directo de <b>~$1.000M CLP/año</b> por cada 50 casos de diálisis evitados.", table_cell_style)
        ]
    ]
    t_obj = Table(obj_data, colWidths=[110, 234, 160])
    t_obj.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_obj)

    story.append(Spacer(1, 15))

    # =========================================================================
    # CAPÍTULO 2: FICHA CÍVICA OFICIAL BENDI / IMPACT LAB
    # =========================================================================
    story.append(Paragraph("2. Ficha Cívica Oficial (Postulación Bendi / Impact Lab)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph("A continuación se presentan las respuestas estandarizadas y validadas para el formulario de postulación oficial de la Ficha Cívica, acompañadas de su riguroso respaldo técnico epidemiológico y financiero.", body_style))

    # Campo 1
    story.append(Paragraph("📌 Campo 1: Problema (Máx. 300 caracteres | Sin jerga clínica)", h2_style))
    box_c1 = Paragraph("<b>Versión Optimizada Enviada (285 caracteres):</b><br/>"
                       "<i>«En Chile, la Diabetes descompensada consume 10% del presupuesto de salud ($2,8 billones en hospitalizaciones). Atender 140 mil pacientes por orden de llegada y no por riesgo provoca infartos, fallas renales y amputaciones evitables, perdiéndose 1,2M de horas por inasistencia médica.»</i>", callout_style)
    t_c1 = Table([[box_c1]], colWidths=[504])
    t_c1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_BG),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, SECONDARY),
    ]))
    story.append(t_c1)
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Sustento Técnico Ampliado del Campo 1:</b>", body_bold))
    story.append(Paragraph("• <b>Gasto Fiscal Masivo:</b> La Diabetes Tipo 2 consume entre el 8% y el 10% del presupuesto total del MINSAL. Las hospitalizaciones del sector público alcanzaron un gasto acumulado de $2,8 billones CLP en un quinquenio.", bullet_style))
    story.append(Paragraph("• <b>Efecto Dominó Cardiovascular:</b> La falta de priorización clínica oportuna gatilla infartos al miocardio (IAM), accidentes cerebrovasculares (ACV), enfermedad renal crónica (ingreso a diálisis a $20M CLP/año) y amputaciones.", bullet_style))
    story.append(Paragraph("• <b>Pérdida por Inasistencias (NSP):</b> Un 15,6% de inasistencia médica destruye 1,2 millones de horas de especialidad al año, profundizando la brecha nacional de 4.900 especialistas.", bullet_style))

    story.append(Spacer(1, 8))

    # Campo 2
    story.append(Paragraph("📌 Campo 2: Población Específica", h2_style))
    story.append(Paragraph("Personas adultas (15 años o más) con Diabetes Mellitus Tipo 2 y multimorbilidad en control en la Atención Primaria de Salud (APS) pertenecientes a FONASA (que reúne al ~79% de la población nacional), priorizando el territorio del Servicio de Salud Metropolitano Sur Oriente (SSMSO: ~140.000 pacientes en comunas como Puente Alto, La Florida y La Pintana, referenciados al Hospital Dr. Sótero del Río).", body_style))

    # Campo 3
    story.append(Paragraph("📌 Campo 3: Canal de Adopción", h2_style))
    story.append(Paragraph("Derivación e integración directa en los controles presenciales en Centros de Salud Familiar (CESFAM), complementado con comunicación omnicanal vía WhatsApp institucional coordinado por la dupla de cabecera (médico-enfermera/o) para la citación del Programa Cardiovascular, estrategia ECICEP y reducción del 15,6% de inasistencias (NSP).", body_style))

    # Campo 4
    story.append(Paragraph("📌 Campo 4: Impacto Cuantificado", h2_style))
    story.append(Paragraph("Reducción del tiempo de espera para casos graves (G3) de >500 días a <60 días. Prevención de eventos cardiovasculares (IAM/ACV) en 20%-30%, reducción del 35%-45% en amputaciones por pie diabético y 25%-35% en ingresos a hemodiálisis por falla renal (ahorro de ~$1.000M CLP anuales en 50 pacientes del SSMSO). Recuperación de horas perdidas por inasistencia (15,6% NSP) y brecha de 4.900 especialistas.", body_style))

    # Campo 5 & 6
    story.append(Paragraph("📌 Campo 5 & 6: Fuentes Oficiales y Normativa Base", h2_style))
    story.append(Paragraph("• <b>Fuentes Oficiales:</b> Comisión Nacional de Evaluación y Productividad (CNEP - cnep.cl), Ministerio de Salud (MINSAL - minsal.cl), Departamento de Estadística e Información en Salud (DEIS), Biblioteca del Congreso Nacional (BCN).", bullet_style))
    story.append(Paragraph("• <b>Normativa Legal y Técnica:</b> Estrategia ECICEP MINSAL; Norma Técnica N° 118 / Res. Exenta N° 03 (enero 2025 MINSAL - RNLE y SIGTE); Ley N° 19.966 (GES N° 7 DM2, GES N° 31 Retinopatía, GES N° 1/64 ERC); Ley N° 20.584 (Derechos y Deberes del Paciente).", bullet_style))

    story.append(Spacer(1, 8))

    # Límites Operativos del Entregable Técnico
    story.append(Paragraph("Límites Operativos y Salvaguardas Clínicas del Entregable Técnico", h3_style))
    lim_data = [
        [Paragraph("Categoría", table_header_style), Paragraph("Definición Operativa Estricta", table_header_style)],
        [
            Paragraph("<b>Qué SÍ hace *</b>", table_cell_bold),
            Paragraph("Analiza fichas clínicas y notas no estructuradas, calcula el Score de Criticidad Real (0-100) según la matriz oficial ECICEP, reordena dinámicamente la lista de espera por riesgo clínico y genera Tarjetas de Explicabilidad para validación médica.", table_cell_style)
        ],
        [
            Paragraph("<b>Qué NO hace nunca *</b>", table_cell_bold),
            Paragraph("No diagnostica por sí solo, no prescribe ni altera dosis de medicamentos, no reemplaza la decisión clínica y nunca egresa a un paciente de la lista de espera sin aprobación humana del médico o gestor UGD.", table_cell_style)
        ],
        [
            Paragraph("<b>Cuándo deriva a profesional *</b>", table_cell_bold),
            Paragraph("Deriva de inmediato cuando detecta sospecha de infarto (IAM) o accidente cerebrovascular (ACV), crisis de hiperglicemia aguda con compromiso de conciencia, pie diabético infectado activo o sospecha de falla renal acelerada (caída de filtración glomerular >30%).", table_cell_style)
        ]
    ]
    t_lim = Table(lim_data, colWidths=[120, 384])
    t_lim.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_lim)

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 3: DIAGNÓSTICO SANITARIO Y EL "EFECTO DOMINÓ"
    # =========================================================================
    story.append(Paragraph("3. Diagnóstico Sanitario, Gobernanza y el «Efecto Dominó»", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "En Chile existen más de 2 millones de interconsultas en Lista de Espera No GES. La gestión actual mediante registros pasivos (SIGTE/RNLE) asume implícitamente que todos los pacientes con una interconsulta de la misma especialidad tienen la misma urgencia médica. Sin embargo, en patologías crónicas como la Diabetes Mellitus Tipo 2, esta premisa es clínicamente falsa.",
        body_style
    ))

    story.append(Paragraph("Caracterización del Territorio de Análisis: SSMSO y Hospital Sótero del Río", h2_style))
    story.append(Paragraph("El proyecto toma como modelo de aplicación el <b>Servicio de Salud Metropolitano Sur Oriente (SSMSO)</b>, uno de los territorios sanitarios más extensos y densamente poblados del país:", body_style))
    story.append(Paragraph("• <b>Comunas Asignadas:</b> Puente Alto, La Florida, La Pintana, San Ramón, Pirque, San José de Maipo y La Granja.", bullet_style))
    story.append(Paragraph("• <b>Población Beneficiaria:</b> ~1.500.000 habitantes (~85% afiliados a FONASA).", bullet_style))
    story.append(Paragraph("• <b>Red Asistencial:</b> ~30 Centros de Salud Familiar (CESFAM) en APS referenciados al Hospital Dr. Sótero del Río (Alta Complejidad).", bullet_style))
    story.append(Paragraph("• <b>Población en Programa Cardiovascular (PSCV / ECICEP):</b> ~130.000 a 150.000 pacientes con DM2 diagnosticados.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("El «Efecto Dominó» de la Diabetes Descompensada en la Red Hospitalaria", h2_style))
    story.append(Paragraph(
        "Un paciente con DM2 descompensado que aguarda meses sin priorización no permanece inmóvil. La inercia metabólica desencadena el <b>«Efecto Dominó»</b>: el deterioro progresivo contamina y colapsa las listas de espera de otras 4 especialidades hospitalarias críticas, destruyendo la capacidad operativa de la red asistencial.",
        body_style
    ))

    domino_data = [
        [Paragraph("Especialidad Hospitalaria", table_header_style), Paragraph("Mecanismo del Efecto Dominó", table_header_style), Paragraph("Consecuencia Sanitaria y Económica", table_header_style)],
        [
            Paragraph("<b>🫘 Nefrología</b>", table_cell_bold),
            Paragraph("Progresión de Nefropatía Diabética a Enfermedad Renal Crónica Terminal (ERC G5).", table_cell_style),
            Paragraph("Ingreso a Hemodiálisis / Peritoneodiálisis (<b>$18M a $22M CLP anuales</b> por paciente).", table_cell_style)
        ],
        [
            Paragraph("<b>🩸 Cirugía Vascular / Traumatología</b>", table_cell_bold),
            Paragraph("Neuropatía periférica e Isquemia Crítica derivan en Pie Diabético infectado grave (Wagner 3-5).", table_cell_style),
            Paragraph("<b>Amputaciones mayores</b> (supracondíleas). Alta ocupación de pabellón y camas de urgencia.", table_cell_style)
        ],
        [
            Paragraph("<b>👁️ Oftalmología (UAPO)</b>", table_cell_bold),
            Paragraph("Retinopatía Diabética proliferativa no tratada a tiempo gatilla hemorragias vitreas.", table_cell_style),
            Paragraph("Necesidad de Vitrectomías complejas o <b>ceguera irreversible</b> en edad laboral productiva.", table_cell_style)
        ],
        [
            Paragraph("<b>🫀 Cardiología & Urgencias</b>", table_cell_bold),
            Paragraph("Riesgo Cardiovascular Global no controlado acelera aterosclerosis e hipertensión severa.", table_cell_style),
            Paragraph("Eventos MACE: <b>Infarto Agudo al Miocardio (IAM) y ACV</b>. Saturación de Unidades de Urgencia (UEH/SAR).", table_cell_style)
        ]
    ]
    t_domino = Table(domino_data, colWidths=[120, 204, 180])
    t_domino.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_domino)

    story.append(Spacer(1, 15))

    # =========================================================================
    # CAPÍTULO 4: ARQUITECTURA TÉCNICA Y MODELO OPERATIVO
    # =========================================================================
    story.append(Paragraph("4. Arquitectura Técnica y Modelo Operativo de la Solución", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "El sistema integra el stack avanzado de <b>Anthropic (Claude Agent SDK)</b> y el <b>Model Context Protocol (MCP)</b> para procesar la información clínica atrapada en texto libre no estructurado (evoluciones de enfermería, notas de urgencia, recetas, interconsultas) sin vulnerar la privacidad del paciente (Ley 20.584).",
        body_style
    ))

    story.append(Paragraph("Fórmula del Score de Criticidad Real ECICEP (0 - 100 puntos)", h2_style))
    story.append(Paragraph(
        "El motor de priorización evalúa un vector multicriterio ponderado de 4 dimensiones esenciales:",
        body_style
    ))
    story.append(Paragraph("Score ECICEP = (W1 × Severidad) + (W2 × Urgencia_Reciente) + (W3 × Latencia_Ponderada) + (W4 × Vulnerabilidad)", ParagraphStyle('MathEqText', fontName='Helvetica-BoldOblique', fontSize=9, leading=11, alignment=1, spaceAfter=8, textColor=PRIMARY)))
    
    story.append(Paragraph("• <b>1. Severidad Patológica (W1 - 40%):</b> Nivel de HbA1c (>9% o descompensación), microalbuminuria/RAC elevado, falla renal incipiente (VFG < 60 ml/min), neuropatía previa.", bullet_style))
    story.append(Paragraph("• <b>2. Progresión Sintomática y Urgencias (W2 - 25%):</b> Consultas recientes en SAPU/SAR/UEH por crisis hiperglicémica o síndrome coronario agudo en los últimos 90 días.", bullet_style))
    story.append(Paragraph("• <b>3. Latencia Relativa Ponderada (W3 - 20%):</b> Antigüedad de la SIC ajustada linealmente para garantizar que los pacientes estables no queden postergados indefinidamente.", bullet_style))
    story.append(Paragraph("• <b>4. Vulnerabilidad Sociodemográfica (W4 - 15%):</b> Edad avanzada, dependencia severa, ruralidad y determinantes sociales de la salud registrados en APS.", bullet_style))

    story.append(Spacer(1, 8))

    story.append(Paragraph("Matriz de Roles de Usuario en la Plataforma Torre de Control APS", h2_style))

    roles_data = [
        [Paragraph("Rol de Usuario", table_header_style), Paragraph("Funciones Clave en la Plataforma", table_header_style), Paragraph("Mecanismo de Interacción / Control", table_header_style)],
        [
            Paragraph("<b>1. Jefe de Servicio / UGD</b>", table_cell_bold),
            Paragraph("Selecciona ventana temporal, revisa la propuesta de reordenamiento de la IA, audita explicabilidad y aprueba la lista oficial.", table_cell_style),
            Paragraph("<b>Override Clínico</b> (modificación manual) + Botón de Aprobación con 1 Clic. Genera versión auditable en BD.", table_cell_style)
        ],
        [
            Paragraph("<b>2. Equipo Médico Tratante</b>", table_cell_bold),
            Paragraph("Visualiza la lista aprobada, revisa la priorización de sus pacientes asignados y aporta retroalimentación técnica.", table_cell_style),
            Paragraph("Sincronización directa con la agenda médica semanal/mensual del Hospital o CESFAM.", table_cell_style)
        ],
        [
            Paragraph("<b>3. Equipo de Enfermería</b>", table_cell_bold),
            Paragraph("Gestiona el agendamiento y contactabilidad siguiendo el orden estricto de la lista repriorizada.", table_cell_style),
            Paragraph("Gestión omnicanal (Teléfono, WhatsApp). Reglas de agendamiento y control de inasistencias (NSP).", table_cell_style)
        ],
        [
            Paragraph("<b>4. Paciente (Usuario Final)</b>", table_cell_bold),
            Paragraph("Recibe citaciones, notificaciones de preparación previa y recordatorios interactivos de su hora médica.", table_cell_style),
            Paragraph("Respuesta simplificada vía WhatsApp/SMS procesada por el motor NLP de IA (Confirmado/Rechazado).", table_cell_style)
        ]
    ]
    t_roles = Table(roles_data, colWidths=[120, 204, 180])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_roles)

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 5: IMPACTO CLÍNICO, EPIDEMIOLÓGICO Y FINANCIERO
    # =========================================================================
    story.append(Paragraph("5. Impacto Clínico, Epidemiológico y Sostenibilidad Financiera", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "La aceleración en la atención de casos de alto riesgo (G3) de >500 días a menos de 60 días, combinada con la resolución optimizada en APS (vía iSGLT2, arGLP-1 y tele-interconsulta), produce una reducción masiva en la incidencia de daño a órgano blanco a 3-5 años.",
        body_style
    ))

    story.append(Paragraph("Cuantificación del Impacto Clínico y Reducción de Complicaciones", h2_style))

    impact_data = [
        [Paragraph("Complicación Orgánica Severa", table_header_style), Paragraph("Reducción Proyectada (3-5 años)", table_header_style), Paragraph("Mecanismo de Intervención y Evidencia Científica", table_header_style)],
        [
            Paragraph("<b>🩸 Amputaciones por Pie Diabético</b>", table_cell_bold),
            Paragraph("<font color='#2F855A'><b>-35% a -45%</b></font>", table_cell_style),
            Paragraph("Detección precoz neuropática/vascular en APS + derivación priorizada a Unidad de Pie Diabético en estadios incipientes (Wagner 1-2). <i>IWGDF Guidelines</i>.", table_cell_style)
        ],
        [
            Paragraph("<b>🫘 Ingreso a Hemodiálisis (ERC)</b>", table_cell_bold),
            Paragraph("<font color='#2F855A'><b>-25% a -35%</b></font>", table_cell_style),
            Paragraph("Pesquisa temprana de microalbuminuria + inicio inmediato de nefroprotección farmacológica (iECA/ARA2 + iSGLT2) y evaluación nefrológica. <i>CREDENCE / DAPA-CKD</i>.", table_cell_style)
        ],
        [
            Paragraph("<b>🫀 Eventos MACE (IAM / ACV)</b>", table_cell_bold),
            Paragraph("<font color='#2F855A'><b>-20% a -30%</b></font>", table_cell_style),
            Paragraph("Control intensivo multifactorial del riesgo cardiovascular global (PA <130/80, estatinas de alta potencia) en cohorte G3. <i>Steno-2 Study (NEJM)</i>.", table_cell_style)
        ],
        [
            Paragraph("<b>👁️ Retinopatía Diabética y Ceguera</b>", table_cell_bold),
            Paragraph("<font color='#2F855A'><b>-40% a -50%</b></font>", table_cell_style),
            Paragraph("Tamizaje priorizado mediante UAPO y fotocoagulación láser / anti-VEGF oportuna en Hospital Sótero del Río.", table_cell_style)
        ]
    ]
    t_impact = Table(impact_data, colWidths=[140, 114, 250])
    t_impact.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_impact)

    story.append(Spacer(1, 10))

    story.append(Paragraph("Sustento Científico y Literatura Médica de Referencia", h2_style))
    story.append(Paragraph("• <b>Steno-2 Study (Gaede et al., NEJM / Lancet):</b> Demostró que la intervención multifactorial intensiva en DM2 de alto riesgo reduce un <b>53% los eventos cardiovasculares</b> (IAM/ACV) y un <b>61% la progresión a nefropatía</b>.", bullet_style))
    story.append(Paragraph("• <b>UKPDS 33 y 35 (UK Prospective Diabetes Study):</b> Evidenció que por cada 1% de reducción de HbA1c se logra una <b>disminución del 37% en complicaciones microvasculares</b> y <b>43% en amputaciones</b>.", bullet_style))
    story.append(Paragraph("• <b>Estudios Pivotales Modernos (CREDENCE, DAPA-CKD, EMPA-REG):</b> Demostraron reducciones del 30%-39% en progresión a falla renal terminal con iSGLT2.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("Análisis de Sostenibilidad Financiera y Ahorro Fiscal (FONASA)", h2_style))
    story.append(Paragraph("• <b>Costo Directo Evitado por Diálisis:</b> Un paciente en Hemodiálisis cuesta al Estado entre <b>$18 y $22 millones CLP anuales</b>. Evitar el ingreso a diálisis en solo 50 pacientes del SSMSO genera un ahorro directo recurrente de <b>~$1.000 millones CLP/año</b>.", body_style))
    story.append(Paragraph("• <b>Liberación de Días Cama Ocupados (DCO):</b> Previene estadías hospitalarias prolongadas (15 a 30+ días) por amputaciones e infecciones graves, liberando pabellones quirúrgicos para cirugías electivas retrasadas.", body_style))

    story.append(Spacer(1, 15))

    # =========================================================================
    # CAPÍTULO 6: MODELO DE VALIDACIÓN SINTÉTICA
    # =========================================================================
    story.append(Paragraph("6. Modelo de Validación Sintética y Simulación Monte Carlo", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "Para validar la herramienta con máxima seguridad clínica antes de su despliegue en la red de salud, se definió un <b>Motor de Simulación de Eventos Discretos (DES) con Monte Carlo</b> sobre una cohorte sintética representativa de N = 50.000 a 150.000 pacientes (13 tablas modelo ER).",
        body_style
    ))

    story.append(Paragraph("Matriz de los 5 Escenarios de Simulación y Validación", h2_style))

    scen_data = [
        [Paragraph("Escenario", table_header_style), Paragraph("Mecánica de Priorización", table_header_style), Paragraph("Condición del Entorno", table_header_style), Paragraph("Resultado Proyectado / Meta", table_header_style)],
        [
            Paragraph("<b>1. Control</b>", table_cell_bold),
            Paragraph("FIFO Tradicional (Fecha SIC)", table_cell_style),
            Paragraph("Flujo operativo actual", table_cell_style),
            Paragraph("Espera G3 >500 días. Alta progresión a amputación y diálisis (Grupo Control).", table_cell_style)
        ],
        [
            Paragraph("<b>2. ECICEP Puro</b>", table_cell_bold),
            Paragraph("Algoritmo Estático (C1-C5)", table_cell_style),
            Paragraph("Oferta médica constante", table_cell_style),
            Paragraph("Identificación correcta del 95% de pacientes G3. Reordenamiento por riesgo.", table_cell_style)
        ],
        [
            Paragraph("<b>3. Integrado (Copiloto)</b>", table_cell_bold),
            Paragraph("Priorización Dinámica + Res. APS", table_cell_style),
            Paragraph("Resolución 20-30% en CESFAM", table_cell_style),
            Paragraph("<b>Metas del Proyecto:</b> -45% amputaciones, -35% diálisis, ahorro $1.000M CLP/año.", table_cell_style)
        ],
        [
            Paragraph("<b>4. Estrés Red</b>", table_cell_bold),
            Paragraph("Priorización Dinámica G3", table_cell_style),
            Paragraph("Colapso (-30% horas médicas)", table_cell_style),
            Paragraph("Preservación estricta de la ventana terapéutica G3 (<60 días) aislando impacto en G1.", table_cell_style)
        ],
        [
            Paragraph("<b>5. Ruido Datos</b>", table_cell_bold),
            Paragraph("Algoritmo con Fallback", table_cell_style),
            Paragraph("30% datos faltantes en BD", table_cell_style),
            Paragraph("Demuestra resiliencia algorítmica sin falsos negativos en casos graves (Sensibilidad ≥95%).", table_cell_style)
        ]
    ]
    t_scen = Table(scen_data, colWidths=[80, 130, 114, 180])
    t_scen.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_scen)

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 7: GUION DE PRESENTACIÓN Y PITCH DE 3 MINUTOS
    # =========================================================================
    story.append(Paragraph("7. Estrategia de Presentación y Pitch en Vivo (3 Minutos)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph("A continuación se transcribe la estructura narrativa y el guion textual oficial para la defensa en vivo ante el jurado del concurso.", body_style))

    story.append(Paragraph("Guion Textual del Pitch de 3 Minutos", h2_style))

    pitch_box = Paragraph(
        "<b>[0:00 - 0:35] EL GANCHO Y EL IMPACTO PRESUPUESTARIO:</b><br/>"
        "«Hoy en Chile, más de 2 millones de personas están atrapadas en una lista de espera de especialidad. Pero hay un dato devastador que pocos dimensionan: la diabetes y sus complicaciones le cuestan al Estado casi el 10% de todo el presupuesto de salud. Solo en hospitalizaciones públicas por diabetes, Chile ha gastado más de 2,8 billones de pesos en los últimos 5 años.<br/>"
        "¿Por qué ocurre esto? Porque el sistema actual ordena las listas de espera por un reloj estricto: quien ingresó primero es atendido primero, sin importar su riesgo clínico. Pero un reloj no es un criterio médico.»<br/><br/>"
        "<b>[0:35 - 1:15] EL EFECTO DOMINÓ EN OTRAS ESPECIALIDADES:</b><br/>"
        "«La mayor tragedia es el 'efecto dominó'. Cuando un paciente con diabetes pasa 18 meses en una lista de espera sin priorización adecuada, su enfermedad evoluciona silenciosamente. Y ese único paciente termina colapsando las listas de espera de OTRAS cuatro especialidades: Nefrología con hemodiálisis a $20M al año, Cirugía Vascular por amputaciones, Oftalmología por ceguera y Urgencias por infartos. La información sobre este deterioro está atrapada en miles de notas de evolución no estructuradas que los equipos humanos no alcanzan a revisar a tiempo.»<br/><br/>"
        "<b>[1:15 - 2:00] LA SOLUCIÓN TECNOLÓGICA (CLAUDE + ECICEP):</b><br/>"
        "«Para romper este círculo vicioso, creamos el Copiloto Inteligente de Priorización ECICEP. Alineados con la estrategia del MINSAL y usando el stack de Anthropic (Claude Agent SDK y MCP), nuestro agente 'lee' e interpreta las fichas clínicas no estructuradas, notas de urgencia y trayectorias de exámenes. Aplica un score multicriterio que evalúa severidad, deterioro sintomático, latencia y vulnerabilidad. Clasifica al paciente en la Matriz ECICEP y presenta a la UGD una lista reordenada dinámicamente. Mantenemos siempre el control humano: el médico ve una Tarjeta de Explicabilidad Clínica con el 'por qué' del reordenamiento y aprueba con un solo clic.»<br/><br/>"
        "<b>[2:00 - 3:00] EL IMPACTO Y EL CIERRE:</b><br/>"
        "«En un territorio como el Servicio de Salud Metropolitano Sur Oriente y el Hospital Sótero del Río, reducir el tiempo de espera de pacientes de alto riesgo de más de 500 días a menos de 60 días logra una reducción de hasta un 45% en amputaciones mayores, evitar un 35% de los ingresos a diálisis y liberar valiosos pabellones quirúrgicos para OTRAS patologías de la lista de espera.<br/>"
        "No estamos proponiendo gastar más; estamos proponiendo gastar de forma inteligente. Transformemos la lista de espera de un reloj administrativo pasivo a un motor de equidad, ahorro fiscal y protección de la vida. Muchas gracias.»",
        body_style
    )
    t_pitch = Table([[pitch_box]], colWidths=[504])
    t_pitch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, PRIMARY),
    ]))
    story.append(t_pitch)

    story.append(Spacer(1, 15))

    # =========================================================================
    # CAPÍTULO 8: MATRIZ DE RESPUESTAS A PREGUNTAS DEL JURADO (Q&A)
    # =========================================================================
    story.append(Paragraph("8. Matriz de Respuestas a Preguntas del Jurado (Q&A)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=10))

    qa_data = [
        [Paragraph("Pregunta Probable del Jurado", table_header_style), Paragraph("Respuesta Estratégica Sugerida", table_header_style)],
        [
            Paragraph("<b>¿Cómo garantizan la privacidad de los datos médicos (Ley 20.584)?</b>", table_cell_bold),
            Paragraph("Utilizamos la arquitectura <b>Model Context Protocol (MCP)</b> para procesar y seudonimizar los datos sensibles en el entorno local antes de cualquier razonamiento de la IA. Ningún dato identificable (RUT, nombre) sale de la red segura del servicio de salud.", table_cell_style)
        ],
        [
            Paragraph("<b>¿Qué pasa si la IA comete un error o alucina en la priorización?</b>", table_cell_bold),
            Paragraph("El sistema opera strictly bajo el modelo <b>Human-in-the-Loop</b>. La IA actúa exclusivamente como copiloto recomendador y entrega una <b>Tarjeta de Explicabilidad Clínica</b> con la evidencia citada. La decisión y validación final recae siempre en el médico o gestor UGD.", table_cell_style)
        ],
        [
            Paragraph("<b>¿Cómo evitan que un paciente estable espere para siempre?</b>", table_cell_bold),
            Paragraph("El Score de Criticidad Real incorpora la variable de <b>Latencia Relativa Ponderada (W3)</b>. A medida que aumenta el tiempo en lista de espera, el puntaje por antigüedad se incrementa gradualmente de forma acotada, impidiendo la postergación indefinida de casos G1/G2.", table_cell_style)
        ],
        [
            Paragraph("<b>¿Por qué resolver la diabetes ayuda a las listas de espera en general?</b>", table_cell_bold),
            Paragraph("Porque la diabetes es la principal puerta de entrada a complicaciones multisistémicas. Al estabilizar al paciente en APS, evitamos que ingrese a las colas quirúrgicas de nefrología, cirugía vascular y oftalmología, liberando pabellones y camas para otras patologías.", table_cell_style)
        ]
    ]
    t_qa = Table(qa_data, colWidths=[170, 334])
    t_qa.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_qa)

    # Compilar Documento
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Documento PDF generado exitosamente: {filename}")


if __name__ == "__main__":
    out_pdf = "Proyecto_Priorizacion_Inteligente_ECICEP_ImpactLab.pdf"
    create_pdf(out_pdf)
