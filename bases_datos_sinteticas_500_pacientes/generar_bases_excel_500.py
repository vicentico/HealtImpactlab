import os
import random
import json
import datetime
import numpy as np
import pandas as pd

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

N = 500
base_dir = "/Users/franciscobustos/Library/CloudStorage/OneDrive-UniversidadCatólicadeChile(2)/Escritorio/Desafio Claude/HealtImpactlab/bases_datos_sinteticas_500_pacientes"
os.makedirs(base_dir, exist_ok=True)

# Chilean names lists
nombres_m = ["Juan", "Carlos", "José", "Luis", "Pedro", "Manuel", "Francisco", "Jorge", "Miguel", "Héctor", "Roberto", "Eduardo", "Claudio", "Gonzalo", "Diego", "Hernán", "Sergio", "Oscar", "Raúl", "Patricio", "Fernando", "Guillermo", "Jaime", "Victor", "Rodrigo"]
nombres_f = ["María", "Carmen", "Rosa", "Ana", "Juana", "Marta", "Elena", "Patricia", "Silvia", "Lucía", "Alicia", "Teresa", "Claudia", "Isabel", "Andrea", "Verónica", "Carolina", "Paula", "Francisca", "Camila", "Daniela", "Loreto", "Marcela", "Jimena", "Constanza"]
apellidos = ["González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras", "Silva", "Martínez", "Sepúlveda", "Morales", "Rodríguez", "López", "Fuentes", "Hernández", "Torres", "Araya", "Flores", "Espinoza", "Valenzuela", "Castillo", "Tapia", "Reyes", "Gutiérrez", "Castro", "Pizarro", "Álvarez", "Vásquez", "Sánchez", "Fernández"]

cesfams = [
    "CESFAM San Rafael",
    "CESFAM Cordillera",
    "CESFAM Los Volcanes",
    "CESFAM Cardenal Silva Henríquez",
    "CESFAM Dr. Alberto Bachelet"
]

sectores = ["Sector Azul", "Sector Rojo", "Sector Verde", "Sector Amarillo"]

# Rut generator
def make_rut(i):
    base_num = 7500000 + i * 2317 + random.randint(10, 99)
    s = str(base_num)
    factors = [2, 3, 4, 5, 6, 7]
    total = sum(int(digit) * factors[idx % 6] for idx, digit in enumerate(reversed(s)))
    mod = 11 - (total % 11)
    dv = '0' if mod == 11 else ('K' if mod == 10 else str(mod))
    formatted = f"{base_num:,}".replace(',', '.')
    return f"{formatted}-{dv}"

# Create 500 patients with profiles:
# G3 (High risk): ~100 patients (20%) -> Total score >= 10
# G2 (Moderate risk): ~250 patients (50%) -> Total score 5-9
# G1 (Low risk): ~150 patients (30%) -> Total score < 5

profiles = ['G3'] * 100 + ['G2'] * 250 + ['G1'] * 150
random.shuffle(profiles)

# Table 1: pacientes
pacientes_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    rut = make_rut(i)
    sexo = random.choice(['M', 'F'])
    nombre = random.choice(nombres_m) if sexo == 'M' else random.choice(nombres_f)
    nombre_completo = f"{nombre} {random.choice(apellidos)} {random.choice(apellidos)}"
    
    prof = profiles[i]
    if prof == 'G3':
        edad = random.randint(58, 85)
    elif prof == 'G2':
        edad = random.randint(48, 78)
    else:
        edad = random.randint(35, 68)
        
    birth_year = 2026 - edad
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)
    fecha_nac = f"{birth_year}-{birth_month:02d}-{birth_day:02d}"
    
    cesfam = random.choice(cesfams)
    sector = random.choice(sectores)
    
    # FONASA tramo distribution
    if prof == 'G3':
        tramo = random.choice(['FONASA A', 'FONASA B', 'FONASA B', 'FONASA C'])
    elif prof == 'G2':
        tramo = random.choice(['FONASA A', 'FONASA B', 'FONASA B', 'FONASA C', 'FONASA D'])
    else:
        tramo = random.choice(['FONASA B', 'FONASA B', 'FONASA C', 'FONASA D'])
        
    pacientes_rows.append({
        'id_paciente': p_id,
        'rut': rut,
        'nombre_completo': nombre_completo,
        'fecha_nacimiento': fecha_nac,
        'edad': edad,
        'sexo_biologico': sexo,
        'cesfam_origen': cesfam,
        'sector_comunal': sector,
        'prevision_tramo': tramo
    })

df_pacientes = pd.DataFrame(pacientes_rows)

# Table 2: antecedentes_clinicos
clinicos_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    if prof == 'G3':
        conteo = random.randint(5, 8)
        estrato = 'G3'
        tiempo_dm2 = round(random.uniform(8.0, 25.0), 1)
        comorbidities = ["HTA", "ERC Etapa 3b/4", "Dislipidemia", "Pie Diabético", "Retinopatía", "Cardiopatía Isquémica"][:conteo-1]
        comorbidities.append("DM2")
    elif prof == 'G2':
        conteo = random.randint(2, 4)
        estrato = 'G2'
        tiempo_dm2 = round(random.uniform(3.0, 12.0), 1)
        comorbidities = random.sample(["HTA", "Dislipidemia", "ERC Etapa 2/3a", "Artrosis", "Obesidad Grado I/II"], conteo-1)
        comorbidities.append("DM2")
    else:
        conteo = random.randint(1, 2)
        estrato = 'G1'
        tiempo_dm2 = round(random.uniform(0.5, 5.0), 1)
        comorbidities = random.sample(["HTA", "Dislipidemia", "Sobrepeso"], conteo-1)
        comorbidities.append("DM2")
        
    clinicos_rows.append({
        'id_clinico': f"CLI-{i+1:05d}",
        'id_paciente': p_id,
        'diagnostico_principal': 'Diabetes Mellitus Tipo 2 (CIE-10 E11)',
        'comorbilidades_activas': json.dumps(comorbidities, ensure_ascii=False),
        'conteo_condiciones_cronicas': conteo,
        'estrato_ecicep_actual': estrato,
        'tiempo_diagnostico_dm2_anios': tiempo_dm2
    })

df_clinicos = pd.DataFrame(clinicos_rows)

# Table 3: contactabilidad_y_apoyo
contacto_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    num1 = f"+569{random.randint(10000000, 99999999)}"
    num2 = f"+569{random.randint(10000000, 99999999)}"
    
    nombre_p = df_pacientes.loc[i, 'nombre_completo'].split()[0]
    email = f"{nombre_p.lower()}{random.randint(10, 999)}@gmail.com"
    
    canal = random.choice(['WhatsApp', 'WhatsApp', 'SMS', 'Llamada'])
    
    if prof == 'G3':
        estado_c = random.choice(['Riesgo Colapso', 'Sin Cuidador', 'Riesgo Colapso'])
        parentesco = random.choice(['Hija', 'Cónyuge', 'Vecino/a', 'Ninguno'])
        nombre_c = f"{random.choice(nombres_f if parentesco=='Hija' else nombres_m)} {random.choice(apellidos)}" if parentesco != 'Ninguno' else 'N/A'
    elif prof == 'G2':
        estado_c = random.choice(['Efectivo', 'Riesgo Colapso', 'Efectivo'])
        parentesco = random.choice(['Hija', 'Cónyuge', 'Hijo', 'Hermano/a'])
        nombre_c = f"{random.choice(nombres_f)} {random.choice(apellidos)}"
    else:
        estado_c = 'Efectivo'
        parentesco = random.choice(['Cónyuge', 'Hija', 'Hijo', 'Autovalente'])
        nombre_c = f"{random.choice(nombres_m)} {random.choice(apellidos)}"
        
    contacto_rows.append({
        'id_contacto': f"CNT-{i+1:05d}",
        'id_paciente': p_id,
        'telefono_celular_1': num1,
        'telefono_celular_2': num2,
        'correo_electronico': email,
        'canal_preferido': canal,
        'nombre_cuidador': nombre_c,
        'parentesco_cuidador': parentesco,
        'estado_cuidador': estado_c
    })

df_contacto = pd.DataFrame(contacto_rows)

# Table 4: condiciones_sociales & C4 score
sociales_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    if prof == 'G3':
        red = random.choice(['Abandono/Sin Red', 'Parcial', 'Abandono/Sin Red'])
        c4 = 3 if red == 'Abandono/Sin Red' else 1
        rsh = random.choice(['40%', '40%', '50%', '60%'])
        zona = random.choice(['Urbana', 'Rural', 'Rural'])
        dist = round(random.uniform(5.0, 22.0), 2)
        riesgo_inadh = True
    elif prof == 'G2':
        red = random.choice(['Parcial', 'Efectiva', 'Parcial'])
        c4 = 1 if red == 'Parcial' else 0
        rsh = random.choice(['40%', '60%', '70%', '80%'])
        zona = random.choice(['Urbana', 'Urbana', 'Rural'])
        dist = round(random.uniform(1.5, 12.0), 2)
        riesgo_inadh = random.choice([True, False])
    else:
        red = 'Efectiva'
        c4 = 0
        rsh = random.choice(['60%', '70%', '80%', '90%'])
        zona = 'Urbana'
        dist = round(random.uniform(0.5, 5.0), 2)
        riesgo_inadh = False
        
    sociales_rows.append({
        'id_social': f"SOC-{i+1:05d}",
        'id_paciente': p_id,
        'nivel_red_apoyo': red,
        'puntaje_c4_social': c4,
        'tramo_rsh': rsh,
        'zona_residencia': zona,
        'distancia_cesfam_km': dist,
        'riesgo_inadherencia_social': riesgo_inadh
    })

df_sociales = pd.DataFrame(sociales_rows)

# Table 5: biomarcadores_laboratorio & C1, C2 scores
lab_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    # fecha toma muestra en ultimos 3 meses
    days_ago = random.randint(5, 90)
    fecha_lab = (datetime.date(2026, 8, 5) - datetime.timedelta(days=days_ago)).strftime('%Y-%m-%d')
    
    if prof == 'G3':
        hba1c = round(random.uniform(9.1, 13.2), 2)
        c1 = 4
        rac = round(random.uniform(305.0, 750.0), 2)
        vfg = round(random.uniform(22.0, 44.0), 2)
        c2 = 3
        glic = random.randint(210, 360)
    elif prof == 'G2':
        hba1c = round(random.uniform(7.1, 8.9), 2)
        c1 = 2
        rac = round(random.uniform(35.0, 280.0), 2)
        vfg = round(random.uniform(46.0, 59.0), 2)
        c2 = 1
        glic = random.randint(140, 209)
    else:
        hba1c = round(random.uniform(5.6, 6.9), 2)
        c1 = 0
        rac = round(random.uniform(8.0, 28.0), 2)
        vfg = round(random.uniform(65.0, 105.0), 2)
        c2 = 0
        glic = random.randint(90, 135)
        
    lab_rows.append({
        'id_examen': f"LAB-{i+1:05d}",
        'id_paciente': p_id,
        'fecha_toma_muestra': fecha_lab,
        'hba1c_porcentaje': hba1c,
        'puntaje_c1_metabolico': c1,
        'rac_mg_g': rac,
        'vfg_ml_min': vfg,
        'puntaje_c2_renal': c2,
        'glicemia_ayunas_mg_dl': glic
    })

df_lab = pd.DataFrame(lab_rows)

# Table 6: eventos_urgencia_hospitalizacion & C3 score
urg_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    if prof == 'G3':
        c3 = random.choice([4, 4, 4, 2])
        if c3 == 4:
            cnt_1m = random.randint(1, 2)
            cnt_6m = random.randint(2, 5)
            disp = random.choice(['SAR', 'URG_Hospital', 'Hospitalizacion'])
            causa = random.choice(['Descompensación Hiperglicémica', 'Pie Diabético Infectado', 'Crisis Hipertensiva'])
        else:
            cnt_1m = 1
            cnt_6m = 1
            disp = random.choice(['SAPU', 'SAR'])
            causa = 'Descompensación Hiperglicémica'
        fecha_urg = (datetime.date(2026, 8, 5) - datetime.timedelta(days=random.randint(3, 45))).strftime('%Y-%m-%d')
    elif prof == 'G2':
        c3 = random.choice([0, 2, 2, 0])
        if c3 == 2:
            cnt_1m = 1
            cnt_6m = 1
            disp = random.choice(['SAPU', 'SAR'])
            causa = random.choice(['Hipoglicemia Leve/Mod', 'Crisis Hipertensiva', 'Infección Tracto Urinario'])
            fecha_urg = (datetime.date(2026, 8, 5) - datetime.timedelta(days=random.randint(10, 28))).strftime('%Y-%m-%d')
        else:
            cnt_1m = 0
            cnt_6m = 0
            disp = 'Ninguno'
            causa = 'Sin registro'
            fecha_urg = 'N/A'
    else:
        c3 = 0
        cnt_1m = 0
        cnt_6m = 0
        disp = 'Ninguno'
        causa = 'Sin registro'
        fecha_urg = 'N/A'
        
    urg_rows.append({
        'id_evento': f"URG-{i+1:05d}",
        'id_paciente': p_id,
        'tipo_dispositivo': disp,
        'causa_atencion': causa,
        'fecha_evento': fecha_urg,
        'conteo_urgencias_1mes': cnt_1m,
        'conteo_urgencias_6meses': cnt_6m,
        'puntaje_c3_urgencia': c3
    })

df_urg = pd.DataFrame(urg_rows)

# Table 7: recetas_y_polifarmacia & C5 score
recetas_rows = []
farmacos_pool = [
    "Metformina 850mg", "Glibenclamida 5mg", "Insulina NPH", "Insulina Cristalina",
    "Empagliflozina 10mg", "Sitagliptina 100mg", "Losartán 50mg", "Enalapril 10mg",
    "Amlodipino 10mg", "Atorvastatina 20mg", "Aspirina 100mg", "Omeprazol 20mg",
    "Paracetamol 500mg", "Furosemida 40mg", "Carvedilol 12.5mg"
]

for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    if prof == 'G3':
        conteo = random.randint(7, 11)
        c5 = 2
        qf = True
    elif prof == 'G2':
        conteo = random.randint(5, 6)
        c5 = 1
        qf = False
    else:
        conteo = random.randint(2, 4)
        c5 = 0
        qf = False
        
    meds = farmacos_pool[:conteo]
    recetas_rows.append({
        'id_receta': f"REC-{i+1:05d}",
        'id_paciente': p_id,
        'lista_medicamentos': json.dumps(meds, ensure_ascii=False),
        'conteo_farmacos_diarios': conteo,
        'puntaje_c5_polifarmacia': c5,
        'requiere_conciliacion_qf': qf
    })

df_recetas = pd.DataFrame(recetas_rows)

# Table 8: complicaciones_agudas_organo
cmp_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    if prof == 'G3':
        cv = random.choice([True, False, True])
        pie = random.choice([True, False, True])
        amp = random.choice([True, False, False])
        retin = random.choice(['Proliferativa', 'No Proliferativa Moderada'])
        erc_est = random.choice(['Etapa 3b', 'Etapa 4', 'Etapa 5'])
    elif prof == 'G2':
        cv = False
        pie = random.choice([False, False, True])
        amp = False
        retin = random.choice(['Sin Retinopatía', 'No Proliferativa Leve'])
        erc_est = random.choice(['Etapa 2', 'Etapa 3a'])
    else:
        cv = False
        pie = False
        amp = False
        retin = 'Sin Retinopatía'
        erc_est = 'Etapa 1'
        
    cmp_rows.append({
        'id_complicacion': f"CMP-{i+1:05d}",
        'id_paciente': p_id,
        'evento_cv_reciente_6m': cv,
        'pie_diabetico_infectado': pie,
        'amputacion_vascular_6m': amp,
        'retinopatia_grado': retin,
        'erc_estadio_clinico': erc_est
    })

df_cmp = pd.DataFrame(cmp_rows)

# Table 9: evaluacion_funcional
evf_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    if prof == 'G3':
        efam = random.choice(['Riesgo de Dependencia', 'Dependiente Severo', 'Autovalente con Riesgo'])
        tug = 'Alterado'
        fragil = random.choice([True, True, False])
        vdi = True
    elif prof == 'G2':
        efam = random.choice(['Autovalente con Riesgo', 'Autovalente sin Riesgo'])
        tug = random.choice(['Normal', 'Alterado'])
        fragil = False
        vdi = random.choice([True, False])
    else:
        efam = 'Autovalente sin Riesgo'
        tug = 'Normal'
        fragil = False
        vdi = False
        
    evf_rows.append({
        'id_evaluacion': f"EVF-{i+1:05d}",
        'id_paciente': p_id,
        'clasificacion_efam': efam,
        'test_get_up_and_go': tug,
        'sindrome_fragilidad': fragil,
        'criterio_vdi_anual': vdi
    })

df_evf = pd.DataFrame(evf_rows)

# Table 10: lista_espera_priorizada
le_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    c1 = df_lab.loc[i, 'puntaje_c1_metabolico']
    c2 = df_lab.loc[i, 'puntaje_c2_renal']
    c3 = df_urg.loc[i, 'puntaje_c3_urgencia']
    c4 = df_sociales.loc[i, 'puntaje_c4_social']
    c5 = df_recetas.loc[i, 'puntaje_c5_polifarmacia']
    
    total = c1 + c2 + c3 + c4 + c5
    if total >= 10:
        prio = 'Alta'
    elif total >= 5:
        prio = 'Media'
    else:
        prio = 'Baja'
        
    days_wait = random.randint(10, 180)
    ingreso_dt = datetime.datetime(2026, 8, 5) - datetime.timedelta(days=days_wait, hours=random.randint(1, 10))
    ingreso_str = ingreso_dt.strftime('%Y-%m-%d %H:%M:%S')
    
    le_rows.append({
        'id_item_lista': f"LE-{i+1:05d}",
        'id_paciente': p_id,
        'fecha_ingreso_lista': ingreso_str,
        'dias_en_espera': days_wait,
        'puntaje_c1': c1,
        'puntaje_c2': c2,
        'puntaje_c3': c3,
        'puntaje_c4': c4,
        'puntaje_c5': c5,
        'puntaje_total_ecicep': total,
        'prioridad_calculada': prio,
        'dt_obj': ingreso_dt
    })

df_le = pd.DataFrame(le_rows)

df_le_fifo = df_le.sort_values(by='dt_obj').reset_index(drop=True)
df_le_fifo['orden_original_sigte'] = range(1, N + 1)

df_le_ia = df_le_fifo.sort_values(by=['puntaje_total_ecicep', 'dias_en_espera'], ascending=[False, False]).reset_index(drop=True)
df_le_ia['orden_propuesto_ia'] = range(1, N + 1)

df_le_ia['orden_final_aprobado'] = df_le_ia['orden_propuesto_ia']
df_le_ia['flag_override_medico'] = False
df_le_ia['justificacion_override'] = 'N/A'
df_le_ia['version_lista'] = 'v1.0_2026-08-05'
df_le_ia['estado_paciente'] = ['Citado' if r <= 80 else ('Pendiente' if r <= 450 else 'Atendido') for r in df_le_ia['orden_final_aprobado']]

override_indices = random.sample(range(20, 200), 10)
for idx in override_indices:
    df_le_ia.loc[idx, 'flag_override_medico'] = True
    df_le_ia.loc[idx, 'justificacion_override'] = 'Priorización clínica directa por sospecha de falla renal acelerada o vulnerabilidad psicosocial aguda.'

df_le_final = df_le_ia.drop(columns=['dt_obj'])

cols_le = [
    'id_item_lista', 'id_paciente', 'fecha_ingreso_lista', 'dias_en_espera',
    'puntaje_c1', 'puntaje_c2', 'puntaje_c3', 'puntaje_c4', 'puntaje_c5',
    'puntaje_total_ecicep', 'prioridad_calculada', 'orden_original_sigte',
    'orden_propuesto_ia', 'orden_final_aprobado', 'flag_override_medico',
    'justificacion_override', 'version_lista', 'estado_paciente'
]
df_le_final = df_le_final[cols_le]

# Table 11: capacidad_asistencial_agendas
agendas_rows = []
profesionales = [
    ('Dr. Roberto Silva / Enf. Ana Soto', 'Ingreso_Dupla_G3', 45),
    ('Dra. Carolina Tapia / Enf. María Morales', 'Ingreso_Dupla_G3', 45),
    ('Dr. Felipe Morales', 'Control_Integral_G2', 30),
    ('Enf. Carla Fuentes', 'Seguimiento_Telematico_G1', 20),
    ('QF. Mauricio Tapia', 'Consulta_Quimico_Farmaceutico', 30),
    ('Nut. Daniela Palma', 'Atencion_Nutricional', 30)
]

for i in range(500):
    cupo_id = f"CUP-{i+1:05d}"
    cesfam = random.choice(cesfams)
    prof, prest, dur = random.choice(profesionales)
    
    date_cupo = datetime.datetime(2026, 8, 10) + datetime.timedelta(days=random.randint(0, 30), hours=random.randint(8, 16), minutes=random.choice([0, 30]))
    estado_c = random.choice(['Disponible', 'Reservado', 'Reservado', 'Bloqueado'])
    
    agendas_rows.append({
        'id_cupo': cupo_id,
        'cesfam_id': cesfam,
        'tipo_prestacion': prest,
        'profesional_titular': prof,
        'fecha_hora_inicio': date_cupo.strftime('%Y-%m-%d %H:%M:%S'),
        'duracion_bloque_min': dur,
        'estado_cupo': estado_c
    })

df_agendas = pd.DataFrame(agendas_rows)

# Table 12: interacciones_contactabilidad
inter_rows = []
for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    cupo_id = f"CUP-{i+1:05d}"
    canal = df_contacto.loc[i, 'canal_preferido']
    
    date_envio = datetime.datetime(2026, 8, 5, 9, 0) + datetime.timedelta(minutes=i*3)
    
    clasif = random.choice(['Confirmado', 'Confirmado', 'Reagendar', 'Rechazado', 'Sin_Respuesta'])
    if clasif == 'Confirmado':
        raw = 'Sí, confirmo la asistencia a la citación médica.'
        accion = 'Cita_Agendada'
        reint = 0
    elif clasif == 'Reagendar':
        raw = 'No puedo ir ese día, por favor cambiar para la semana siguiente.'
        accion = 'Reintento_Programado'
        reint = 1
    elif clasif == 'Rechazado':
        raw = 'No me interesa la atención, me atiendo por fuera.'
        accion = 'Cupo_Liberado'
        reint = 1
    else:
        raw = 'Sin respuesta al mensaje de texto / WhatsApp'
        accion = 'Reintento_Programado'
        reint = 3
        
    inter_rows.append({
        'id_interaccion': f"INT-{i+1:05d}",
        'id_paciente': p_id,
        'id_cupo': cupo_id,
        'canal_usado': canal,
        'fecha_envio': date_envio.strftime('%Y-%m-%d %H:%M:%S'),
        'respuesta_raw_paciente': raw,
        'clasificacion_ia': clasif,
        'reintentos_realizados': reint,
        'accion_ejecutada': accion
    })

df_inter = pd.DataFrame(inter_rows)

# Table 13: plan_cuidado_y_red
pcc_rows = []
duplas = ['DUP-SECTOR-AZUL-01', 'DUP-SECTOR-ROJO-02', 'DUP-SECTOR-VERDE-01', 'DUP-SECTOR-AMARILLO-03']
metas_samples = [
    '["Caminar 20 min diarios 4x/semana", "Reducir consumo de pan a 1/2 unidad", "Monitoreo glicemia 2x/semana"]',
    '["Asistir a taller de automanejo DM2", "Cumplimiento estricto fármacos nocturnos", "Control de peso mensual"]',
    '["Adherencia a dieta hiposódica y baja en hidratos", "Reducción de consumo de bebidas azucaradas", "Caminata diaria 30 min"]'
]

for i in range(N):
    p_id = f"PAC-{i+1:05d}"
    prof = profiles[i]
    
    dupla = random.choice(duplas)
    fecha_pcc = (datetime.date(2026, 8, 5) - datetime.timedelta(days=random.randint(5, 60))).strftime('%Y-%m-%d')
    metas = random.choice(metas_samples)
    
    if prof == 'G3':
        est_pcc = 'Vigente'
        deriv = random.choice(['Diabetologia_Especialidad', 'Nefrologia', 'Oftalmologia_UAPO'])
        teleper = random.choice(['Resuelto_APS', 'Aceptado_Nivel_Secundario'])
    elif prof == 'G2':
        est_pcc = 'Vigente'
        deriv = random.choice(['Sin_Derivacion', 'Oftalmologia_UAPO'])
        teleper = 'Resuelto_APS'
    else:
        est_pcc = 'Vigente'
        deriv = 'Sin_Derivacion'
        teleper = 'No_Aplica'
        
    pcc_rows.append({
        'id_pcc': f"PCC-{i+1:05d}",
        'id_paciente': p_id,
        'dupla_cabecera_id': dupla,
        'fecha_elaboracion_pcc': fecha_pcc,
        'metas_pactadas_5a': metas,
        'estado_pcc': est_pcc,
        'derivacion_sic_activa': deriv,
        'estado_teleperitaje': teleper
    })

df_pcc = pd.DataFrame(pcc_rows)

print("Writing Excel files...")

tables = {
    "01_pacientes": df_pacientes,
    "02_antecedentes_clinicos": df_clinicos,
    "03_contactabilidad_y_apoyo": df_contacto,
    "04_condiciones_sociales": df_sociales,
    "05_biomarcadores_laboratorio": df_lab,
    "06_eventos_urgencia_hospitalizacion": df_urg,
    "07_recetas_y_polifarmacia": df_recetas,
    "08_complicaciones_agudas_organo": df_cmp,
    "09_evaluacion_funcional": df_evf,
    "10_lista_espera_priorizada": df_le_final,
    "11_capacidad_asistencial_agendas": df_agendas,
    "12_interacciones_contactabilidad": df_inter,
    "13_plan_cuidado_y_red": df_pcc
}

# 1. Export master workbook
master_path = os.path.join(base_dir, "BASE_DATOS_ECICEP_500_PACIENTES_MAESTRA.xlsx")
with pd.ExcelWriter(master_path, engine='openpyxl') as writer:
    for name, df in tables.items():
        sheet_name = name.split('_', 1)[1][:31]
        df.to_excel(writer, sheet_name=sheet_name, index=False)

# 2. Export individual Excel files
for name, df in tables.items():
    file_path = os.path.join(base_dir, f"{name}.xlsx")
    df.to_excel(file_path, engine='openpyxl', index=False)

# Also save the generator script in base_dir for full transparency and reproducibility!
script_dest = os.path.join(base_dir, "generar_bases_excel_500.py")
with open(script_dest, "w", encoding="utf-8") as f:
    with open(__file__, "r", encoding="utf-8") as src:
        f.write(src.read())

print(f"Done exporting 13 Excel files, master workbook, and script to {base_dir}")
