import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

doc = docx.Document()

# Page setup margins
sections = doc.sections
for section in sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# Helper for cell shading
def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

# Title
title_p = doc.add_paragraph()
title_run = title_p.add_run("Ficha Cívica — Claude Impact Lab / Bendita IA")
title_run.font.name = "Arial"
title_run.font.size = Pt(20)
title_run.font.bold = True
title_run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x78)

sub_p = doc.add_paragraph()
sub_run = sub_p.add_run("Proyecto: Priorización Inteligente ECICEP y Copiloto IA en Diabetes Mellitus Tipo 2 (DM2)\nEquipo: Health Solutions | Territorio: SSMSO (~1,5M hab. / ~140.000 pacientes DM2)")
sub_run.font.name = "Arial"
sub_run.font.size = Pt(10)
sub_run.font.italic = True
sub_run.font.color.rgb = RGBColor(0x59, 0x59, 0x59)

doc.add_paragraph().paragraph_format.space_after = Pt(10)

def add_section_header(title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(title)
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x78)
    return p

def add_field_box(field_name, requirement_text, current_text, char_count=None):
    table = doc.add_table(rows=3, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Row 0: Field Title
    cell0 = table.cell(0, 0)
    set_cell_background(cell0, "1F4E78")
    p0 = cell0.paragraphs[0]
    p0.paragraph_format.space_before = Pt(4)
    p0.paragraph_format.space_after = Pt(4)
    r0 = p0.add_run(field_name)
    r0.font.name = "Arial"
    r0.font.size = Pt(11)
    r0.font.bold = True
    r0.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    
    # Row 1: Requirement
    cell1 = table.cell(1, 0)
    set_cell_background(cell1, "F2F4F7")
    p1 = cell1.paragraphs[0]
    p1.paragraph_format.space_before = Pt(3)
    p1.paragraph_format.space_after = Pt(3)
    r1 = p1.add_run(f"Instrucción del Formulario: {requirement_text}")
    r1.font.name = "Arial"
    r1.font.size = Pt(9.5)
    r1.font.italic = True
    r1.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    
    # Row 2: Text Content
    cell2 = table.cell(2, 0)
    set_cell_background(cell2, "FFFFFF")
    p2 = cell2.paragraphs[0]
    p2.paragraph_format.space_before = Pt(6)
    p2.paragraph_format.space_after = Pt(6)
    r2 = p2.add_run(current_text)
    r2.font.name = "Arial"
    r2.font.size = Pt(10.5)
    r2.font.color.rgb = RGBColor(0x11, 0x11, 0x11)
    
    if char_count is not None:
        p_count = cell2.add_paragraph()
        p_count.paragraph_format.space_after = Pt(3)
        r_count = p_count.add_run(f"Conteo exacto de caracteres: {char_count} / 300 caracteres")
        r_count.font.name = "Arial"
        r_count.font.size = Pt(9)
        r_count.font.bold = True
        r_count.font.color.rgb = RGBColor(0x2E, 0x75, 0xB6)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

# 1. Problema
add_section_header("1. Problema * (Máximo 300 caracteres, sin jerga)")
p_prob_text = "En Chile, la Diabetes descompensada consume 10% del presupuesto de salud ($2,8 billones en hospitalizaciones). Atender 140 mil pacientes por orden de llegada y no por riesgo provoca infartos, fallas renales y amputaciones evitables, perdiéndose 1,2M de horas por inasistencia médica."
char_len = len(p_prob_text)
add_field_box(
    "Problema *",
    "¿Qué problema de salud enfrenta esa población hoy? Sin jerga clínica sin explicar. Máximo 300 caracteres.",
    p_prob_text,
    char_len
)

# Detailed explanation box for Problema
p_exp = doc.add_paragraph()
p_exp.paragraph_format.space_after = Pt(6)
r_exp = p_exp.add_run("💡 Detalle de Cifras e Impacto Cardiovascular (Sustento Técnico):")
r_exp.font.name = "Arial"
r_exp.font.size = Pt(10)
r_exp.font.bold = True
r_exp.font.color.rgb = RGBColor(0x1F, 0x4E, 0x78)

bullets = [
    "Gasto Fiscal Masivo: La Diabetes Tipo 2 consume entre el 8% y 10% del presupuesto total del MINSAL. Solo en hospitalizaciones del sector público generó un gasto acumulado de $2,8 billones de pesos (CLP) en 5 años.",
    "Población Afectada: En la red SSMSO / Hosp. Sótero del Río abarca ~1,5 millones de habitantes con ~130.000 a 150.000 pacientes con DM2 en Programa Cardiovascular. A nivel nacional, existen >2 millones de personas en lista de espera No GES.",
    "Efecto Dominó Cardiovascular y Complicaciones: La falta de priorización clínica desencadena infartos agudos al miocardio (IAM), accidentes cerebrovasculares (ACV), insuficiencia cardíaca, enfermedad renal crónica (ingreso a diálisis a $20M CLP/año), ceguera por retinopatía y amputaciones de pie diabético.",
    "Pérdida de Capacidad por Inasistencias (NSP): Un 15,6% de inasistencia médica (NSP) quema 1,2 millones de horas de especialidad al año, agravando el déficit nacional de ~4.900 especialistas."
]
for bullet in bullets:
    p_b = doc.add_paragraph(style='List Bullet')
    p_b.paragraph_format.space_after = Pt(3)
    r_b = p_b.add_run(bullet)
    r_b.font.name = "Arial"
    r_b.font.size = Pt(9.5)

# 2. Población específica
add_section_header("2. Población específica *")
add_field_box(
    "Población específica *",
    "Quiénes exactamente. Nombra la condición de salud o etapa vital + al menos uno: rango etario, territorio, previsión.",
    "Personas adultas (15 años o más) con Diabetes Mellitus Tipo 2 y multimorbilidad en control en la Atención Primaria de Salud (APS) pertenecientes a FONASA (que concentra al ~79% de la población nacional), priorizando el territorio del Servicio de Salud Metropolitano Sur Oriente (SSMSO: ~140.000 pacientes en comunas como Puente Alto, La Florida y La Pintana, referenciados al Hospital Dr. Sótero del Río)."
)

# 3. Canal de adopción
add_section_header("3. Canal de adopción *")
add_field_box(
    "Canal de adopción *",
    "Cómo llega a esa persona. Nombrar canal concreto (no 'internet' o 'app móvil') + por qué llega al segmento.",
    "Derivación e integración directa en los controles presenciales en Centros de Salud Familiar (CESFAM), complementado con comunicación omnicanal vía WhatsApp institucional coordinado por la dupla de cabecera (médico-enfermera/o) para la citación del Programa Cardiovascular, estrategia ECICEP y reducción del 15,6% de inasistencias (NSP)."
)

# 4. Impacto cuantificado
add_section_header("4. Impacto cuantificado *")
add_field_box(
    "Impacto cuantificado *",
    "Número concreto.",
    "Reducción del tiempo de espera para casos graves (G3) de >500 días a <60 días. Prevención de eventos cardiovasculares (IAM/ACV) en 20%-30%, reducción del 35%-45% en amputaciones por pie diabético y 25%-35% en ingresos a hemodiálisis por falla renal (ahorro de ~$1.000M CLP anuales en 50 pacientes del SSMSO). Recuperación de horas perdidas por inasistencia (15,6% NSP) y brecha de 4.900 especialistas."
)

p_url = doc.add_paragraph()
r_url_title = p_url.add_run("URL Fuente Oficial (del Impacto): ")
r_url_title.bold = True
r_url_title.font.size = Pt(10)
r_url_val = p_url.add_run("https://www.cnep.cl/")
r_url_val.font.size = Pt(10)
r_url_val.font.color.rgb = RGBColor(0x05, 0x63, 0xC1)

# 5. Fuentes oficiales de salud
add_section_header("5. Fuentes oficiales de salud * (2 o más URLs, una por línea)")
add_field_box(
    "Fuentes oficiales de salud *",
    "Mínimo 2 URLs oficiales (minsal.cl, supersalud.gob.cl, ispch.gob.cl, fonasa.gob.cl, deis.minsal.cl, bcn.cl, cnep.cl).",
    "https://www.cnep.cl/\nhttps://www.minsal.cl/\nhttps://dis.saludoriente.cl/dis/docs/listas-de-espera/RES.%20EXENTA%20N%C2%B0%2003%20ACTUALIZACI%C3%93N%20DE%20NORMA%20DE%20REGISTRO%20LE%20NO%20GES,%20Norma%20tecnica%20118%20(enero%202025).pdf\nhttps://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/REM/2026/SERIE/Manual%20Series%20REM%202025%20-2026%20SERIE%20A%20-BS-BM-%20DV1.2.pdf\nhttps://www.bcn.cl/obtienearchivo?id=repositorio/10221/37106/1/BCN_Rendicion_Publica_de_Listas_Espera_en_Salud__final2.pdf"
)

# 6. Normativa base
add_section_header("6. Normativa base (Opcional)")
add_field_box(
    "Normativa base",
    "Leyes y normas aplicables. Citar literal evita marcadas como alucinación.",
    "Informes CNEP (Comisión Nacional de Evaluación y Productividad - Uso de quirófanos electivos); MINSAL 2019 (Estudio de brecha de médicos especialistas en Chile); Tesis U. de Chile 2022 (Estudio de inasistencias NSP); Seminario UC-SSMSO; Estrategia ECICEP MINSAL; Norma Técnica N° 118 / Res. Exenta N° 03 de enero 2025 MINSAL (Registro Nacional de Listas de Espera RNLE y SIGTE); Ordinario C202 N° 2760 de 2021; Ley N° 19.966 (GES N° 7 DM2, GES N° 31 Retinopatía, GES N° 1/64 ERC); Ley N° 20.584."
)

# Entregable Técnico
add_section_header("7. Entregable Técnico (Límites de tu Agente)")
add_field_box(
    "Qué SÍ hace *",
    "Límites de tu agente.",
    "Analiza fichas clínicas y notas no estructuradas, calcula el Score de Criticidad Real (0-100) según la matriz oficial ECICEP, reordena dinámicamente la lista de espera por riesgo clínico y genera Tarjetas de Explicabilidad para validación médica."
)
add_field_box(
    "Qué NO hace nunca *",
    "Límites de tu agente.",
    "No diagnostica por sí solo, no prescribe ni altera dosis de medicamentos, no reemplaza la decisión clínica y nunca egresa a un paciente de la lista de espera sin aprobación humana del médico o gestor UGD."
)
add_field_box(
    "Cuándo deriva a un profesional *",
    "Límites de tu agente.",
    "Deriva de inmediato cuando detecta sospecha de infarto (IAM) o accidente cerebrovascular (ACV), crisis de hiperglicemia aguda con compromiso de conciencia, pie diabético infectado activo o sospecha de falla renal acelerada (caída de filtración glomerular >30%)."
)

doc.save("/Users/franciscobustos/Library/CloudStorage/OneDrive-UniversidadCatólicadeChile(2)/Escritorio/Desafio Claude/Entregable/Ficha_Civica_Bendi_ImpactLab.docx")
print("SUCCESS")
