import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/Glassmorphism.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const roles = {
  jefatura_dm2: { label: "Jefatura clínica", user: "jefe.clinico", password: "HealthOS2026!Jefe", initials: "JC" },
  medico: { label: "Médico tratante", user: "medico.demo", password: "HealthOS2026!Medico", initials: "MT" },
  enfermeria: { label: "Enfermería clínica", user: "enfermera.demo", password: "HealthOS2026!Enfermera", initials: "EC" },
};

const editions = {
  hospital_operaciones: {
    short: "Hospital",
    name: "Hospital Operaciones",
    headline: "Torre de control hospitalaria DM2",
    subtitle: "Prioridad clínica explicable, coordinación y capacidad en una sola vista.",
  },
  cesfam_contralor: {
    short: "CESFAM",
    name: "CESFAM Contralor",
    headline: "Centro de control de derivaciones APS",
    subtitle: "Trazabilidad, pertinencia y seguimiento para reducir espera evitable.",
  },
};

const navItems = ["Resumen", "Lista priorizada", "Capacidad", "Visión asistida", "Copiloto clínico"];
const formatNumber = (value) => new Intl.NumberFormat("es-CL").format(value ?? 0);
const prioritySlug = (value) => String(value || "programada").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replaceAll(" ", "-");

async function apiFetch(path, { token, method = "POST", body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || "No fue posible conectar con HealthOS");
  return payload;
}

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? "compact" : ""}`}><img src="./healthos-logo.png" alt="HealthOS" /><div><strong>HealthOS</strong><span>DM2 Prioriza</span>{!compact && <small>by Health Solutions</small>}</div></div>;
}

function Intro({ onFinish }) {
  const videoRef = useRef(null);
  return <section className="intro-screen" aria-label="Presentación de HealthOS">
    <video ref={videoRef} src="./healthos-intro.mp4" autoPlay muted playsInline onLoadedMetadata={() => { videoRef.current.playbackRate = 1.75; }} onEnded={onFinish} onError={onFinish} />
    <div className="intro-overlay"><Brand /><div><span>HEALTH SOLUTIONS · 2026</span><h1>Decidir antes.<br />Atender mejor.</h1><p>Listas de espera DM2 priorizadas con trazabilidad clínica.</p></div></div>
    <button className="skip-intro" onClick={onFinish}>Saltar presentación <b>→</b></button>
  </section>;
}

function Login({ onLogin, theme, toggleTheme }) {
  const [role, setRole] = useState("jefatura_dm2");
  const [edition, setEdition] = useState("hospital_operaciones");
  const [username, setUsername] = useState(roles.jefatura_dm2.user);
  const [password, setPassword] = useState(roles.jefatura_dm2.password);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const selectRole = (value) => { setRole(value); setUsername(roles[value].user); setPassword(roles[value].password); setError(""); };
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await onLogin({ username, password, edition }); }
    catch (loginError) { setError(loginError.message); }
    finally { setBusy(false); }
  };
  return <main className="auth-page">
    <div className="auth-ambient one" /><div className="auth-ambient two" />
    <header className="auth-top"><Brand /><button className="icon-button" onClick={toggleTheme} aria-label="Cambiar tema">{theme === "dark" ? "☼" : "◐"}</button></header>
    <section className="auth-layout">
      <div className="auth-story"><p className="kicker">LONGEVIDAD · LÍNEA 2</p><h1>La lista de espera deja de ser una fila.</h1><p className="lead">HealthOS transforma riesgo, antigüedad y capacidad disponible en una ruta de atención transparente para equipos de salud.</p>
        <div className="promise-grid"><article><b>01</b><strong>Prioriza</strong><span>Orden explicable y auditable.</span></article><article><b>02</b><strong>Coordina</strong><span>Una vista para los tres roles.</span></article><article><b>03</b><strong>Protege</strong><span>Datos sintéticos y control de acceso.</span></article></div>
      </div>
      <form className="login-card glass-panel" onSubmit={submit}>
        <div className="login-heading"><span className="secure-dot" /><div><h2>Acceso institucional</h2><p>Demo segura · datos 100% sintéticos</p></div></div>
        <fieldset><legend>Edición de la plataforma</legend><div className="segmented">{Object.entries(editions).map(([value, item]) => <button type="button" key={value} className={edition === value ? "active" : ""} onClick={() => setEdition(value)}><span>{value === "hospital_operaciones" ? "H" : "C"}</span>{item.name}</button>)}</div></fieldset>
        <fieldset><legend>Perfil de acceso</legend><div className="role-cards">{Object.entries(roles).map(([value, item]) => <button type="button" key={value} className={role === value ? "active" : ""} onClick={() => selectRole(value)}><i>{item.initials}</i><span><strong>{item.label}</strong><small>{value === "jefatura_dm2" ? "Visión global" : value === "medico" ? "Agenda clínica" : "Coordinación"}</small></span></button>)}</div></fieldset>
        <label>Usuario<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="login-action" disabled={busy}>{busy ? "Validando acceso…" : "Ingresar a HealthOS"}<b>→</b></button>
        <p className="demo-note">Credenciales precargadas para evaluación. En producción se reemplazan por identidad institucional.</p>
      </form>
    </section>
    <footer className="auth-footer"><span>Licencia propietaria exclusiva y prioritaria</span><span>© 2026 Health Solutions</span><span>No diagnostica ni indica tratamientos</span></footer>
  </main>;
}

function Sidebar({ session, activeView, setActiveView, onLogout }) {
  const meta = roles[session.role];
  return <aside className="sidebar glass-panel"><Brand />
    <div className="edition-mark"><small>EDICIÓN ACTIVA</small><strong>{editions[session.edition].name}</strong></div>
    <nav aria-label="Navegación principal">{navItems.map((item, index) => <button key={item} className={activeView === item ? "active" : ""} onClick={() => setActiveView(item)}><i>{String(index + 1).padStart(2, "0")}</i><span>{item}</span></button>)}</nav>
    <div className="license-mini"><span>◆</span><div><strong>Licencia exclusiva</strong><small>Health Solutions · 2026</small></div></div>
    <div className="user-mini"><i>{meta.initials}</i><div><strong>{session.display_name}</strong><small>{meta.label}</small></div><button onClick={onLogout} aria-label="Cerrar sesión">↗</button></div>
  </aside>;
}

function Metric({ label, value, detail, tone = "cyan" }) {
  return <article className={`metric glass-panel ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small><i /></article>;
}

function PriorityBadge({ children }) { return <span className={`priority ${prioritySlug(children)}`}>{children}</span>; }

function patientContext(item) {
  const p = item.patient;
  const surgical = p.wagner_sintetico >= 4 || /amput|cirug/i.test(p.route_sugerida);
  const control = item.priority_band === "Programada" || item.total_score < .35;
  return {
    careType: surgical ? "Cirugía / procedimiento" : control ? "Control médico" : "Interconsulta de especialidad",
    status: control ? "Paciente estable" : surgical ? "Evaluación prequirúrgica" : "Interconsulta activa",
    waitTarget: surgical ? "Según evaluación quirúrgica" : control ? "90 días" : item.priority_band === "Revisión inmediata" ? "24–72 h" : "30–90 días",
  };
}

function Overview({ patients, onOpen }) {
  const distribution = patients.reduce((acc, item) => { const key = patientContext(item).careType; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  return <div className="overview-grid">
    <article className="executive-summary glass-panel"><p className="kicker">RESUMEN EJECUTIVO</p><h2>Situación de la red DM2</h2><p>La cola combina interconsultas, controles y procedimientos. HealthOS propone el orden usando riesgo clínico observable, antigüedad, estratificación ECICEP, continuidad de atención y vulnerabilidad operacional.</p><div className="summary-bars">{Object.entries(distribution).map(([label, value]) => <div key={label}><span>{label}<b>{value}</b></span><i><em style={{width:`${Math.max(8,value/patients.length*100)}%`}} /></i></div>)}</div></article>
    <article className="methodology glass-panel"><p className="kicker">CRITERIOS DE PRIORIZACIÓN</p><h2>Reglas visibles, decisión humana</h2><div className="criteria-grid"><span><b>72%</b> riesgo clínico</span><span><b>28%</b> antigüedad</span><span><b>ECICEP</b> multimorbilidad</span><span><b>MINSAL</b> rutas y espera</span></div><p className="source-note">Referencias metodológicas de demostración: Estrategia de Cuidado Integral Centrado en las Personas (ECICEP), taxonomías MINSAL/DEIS y criterios locales auditables. Datos 100% sintéticos.</p></article>
    <article className="priority-preview glass-panel"><header><div><p className="kicker">CASOS A REVISAR</p><h2>Mayor movimiento sugerido</h2></div><span>Sistema → profesional</span></header>{patients.slice(0,5).map((item)=><button key={item.patient.rut_sintetico} onClick={()=>onOpen(item)}><span><b>{item.patient.nombre_sintetico}</b><small>{patientContext(item).status} · {item.patient.route_sugerida}</small></span><PriorityBadge>{item.priority_band}</PriorityBadge><strong>{item.movement >= 0 ? "↑" : "↓"} {formatNumber(Math.abs(item.movement))}</strong></button>)}</article>
  </div>;
}

function PatientTable({ patients, selectedId, onSelect, onOpen }) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("Todas");
  const visible = patients.filter(({ patient, priority_band }) => `${patient.nombre_sintetico} ${patient.rut_sintetico} ${patient.institucion_nombre}`.toLowerCase().includes(query.toLowerCase()) && (priority === "Todas" || priority_band === priority));
  const exportCsv = () => {
    const rows = [["ID", "Paciente", "Institución", "Ruta", "Prioridad", "Posición", "Score"], ...visible.map((x) => [x.patient.rut_sintetico, x.patient.nombre_sintetico, x.patient.institucion_nombre, x.patient.route_sugerida, x.priority_band, x.new_position, x.total_score])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv" })); link.download = "healthos-priorizacion.csv"; link.click(); URL.revokeObjectURL(link.href);
  };
  return <article className="patient-list glass-panel"><header><div><p className="kicker">COLA OPERACIONAL</p><h2>Lista priorizada</h2><span>Cada movimiento conserva sus factores y trazabilidad.</span></div><div className="table-actions"><input aria-label="Buscar paciente" placeholder="Buscar paciente o institución" value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label="Filtrar prioridad" value={priority} onChange={(e) => setPriority(e.target.value)}>{["Todas", "Revisión inmediata", "Muy alta", "Alta", "Media", "Programada"].map((x) => <option key={x}>{x}</option>)}</select><button onClick={exportCsv}>Exportar</button></div></header>
    <div className="table-scroll"><table><thead><tr><th>Paciente</th><th>Tipo de espera</th><th>Estado</th><th>Prioridad</th><th>Posición</th><th>Sugerencia</th><th>Score</th><th /></tr></thead><tbody>{visible.slice(0, 30).map((item) => { const context=patientContext(item); return <tr key={item.patient.rut_sintetico} className={selectedId === item.patient.rut_sintetico ? "selected" : ""} onClick={() => onSelect(item.patient.rut_sintetico)}><td><span className="patient-name"><i>{item.patient.nombre_sintetico.split(" ").slice(0, 2).map((x) => x[0]).join("")}</i><b>{item.patient.nombre_sintetico}<small>{item.patient.rut_sintetico} · {item.patient.edad} años</small></b></span></td><td><b>{context.careType}</b><small>{item.patient.route_sugerida} · meta {context.waitTarget}</small></td><td><span className="care-status">{context.status}</span></td><td><PriorityBadge>{item.priority_band}</PriorityBadge></td><td><b>#{formatNumber(item.new_position)}</b><small>antes #{formatNumber(item.previous_position)}</small></td><td className={`movement ${item.movement<0?"down":""}`}>{item.movement >= 0 ? "↑" : "↓"} {formatNumber(Math.abs(item.movement))}</td><td><strong className="score">{item.total_score.toFixed(2)}</strong></td><td><button className="row-action" onClick={(e) => { e.stopPropagation(); onOpen(item); }}>Ficha / prioridad</button></td></tr>})}</tbody></table></div>
    <footer>Mostrando {Math.min(30, visible.length)} de {formatNumber(visible.length)} registros · orden sugerido, sujeto a validación profesional</footer></article>;
}

function PatientSummary({ selected, onOpen }) {
  if (!selected) return <article className="empty glass-panel">Seleccione un paciente.</article>;
  const p = selected.patient;
  return <article className="patient-summary glass-panel"><header><span className="avatar">{p.nombre_sintetico.split(" ").slice(0, 2).map((x) => x[0]).join("")}</span><div><h3>{p.nombre_sintetico}</h3><small>{p.rut_sintetico} · {p.edad} años</small></div><div className="risk-ring"><strong>{selected.total_score.toFixed(2)}</strong><small>score</small></div></header>
    <div className="summary-facts"><span>HbA1c <b>{p.synthetic_hba1c.toFixed(1)}%</b></span><span>ECICEP <b>{p.estrato_ecicep_sintetico}</b></span><span>Espera <b>{Math.round(selected.waiting_score * 730)} d</b></span><span>Prioridad <PriorityBadge>{selected.priority_band}</PriorityBadge></span></div>
    <div className="reasoning"><p>Por qué cambió su posición</p>{selected.explanation.slice(0, 3).map((reason) => <span key={reason}>✓ {reason}</span>)}</div>
    <button className="secondary-action" onClick={() => onOpen(selected)}>Ver ficha clínica sintética <b>→</b></button></article>;
}

function Capacity({ token }) {
  const resourceMeta={consulta_box:{label:"Atención en box",unit:"boxes",support:"equipos clínicos",minutes:30},control:{label:"Control médico",unit:"boxes",support:"profesionales",minutes:25},procedimiento:{label:"Procedimiento ambulatorio",unit:"salas",support:"equipos clínicos",minutes:60},cirugia_pabellon:{label:"Cirugía en pabellón",unit:"pabellones",support:"anestesiólogos/equipos",minutes:180}};
  const [form,setForm]=useState({care_mode:"consulta_box",current_units:5,additional_units:2,support_staff_current:5,support_staff_additional:2,shifts_per_day:2,hours_per_shift:8,average_case_minutes:30,utilization_rate:.82,workdays_per_week:5,weekly_new_entries:100}); const [result,setResult]=useState(null); const [error,setError]=useState(""); const meta=resourceMeta[form.care_mode];
  const update=(key,value)=>setForm((x)=>({...x,[key]:value}));
  const run=async()=>{try{setError("");setResult(await apiFetch("/api/simulate_capacity",{token,body:{...form,current_doctors:form.current_units,additional_doctors:form.additional_units,appointments_per_doctor_per_day:12}}));}catch(e){setError(e.message)}};
  return <article className="capacity-card capacity-pro glass-panel"><header><div><p className="kicker">PLANIFICACIÓN DE RED</p><h3>Simulador de capacidad asistencial</h3></div><span>TURNOS + RECURSOS</span></header><p>Modela el cuello de botella real. La capacidad modifica la fecha proyectada de atención, no reemplaza el criterio clínico.</p>
    <div className="capacity-form"><label>Tipo de atención<select value={form.care_mode} onChange={(e)=>{const m=resourceMeta[e.target.value];setForm((x)=>({...x,care_mode:e.target.value,average_case_minutes:m.minutes}))}}>{Object.entries(resourceMeta).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label><label>Turnos por día<select value={form.shifts_per_day} onChange={(e)=>update("shifts_per_day",Number(e.target.value))}><option value="1">1 turno</option><option value="2">2 turnos</option><option value="3">3 turnos</option></select></label><label>{meta.unit} actuales<input type="number" min="1" value={form.current_units} onChange={(e)=>update("current_units",Number(e.target.value))}/></label><label>{meta.unit} adicionales<input type="number" min="0" value={form.additional_units} onChange={(e)=>update("additional_units",Number(e.target.value))}/></label><label>{meta.support} actuales<input type="number" min="0" value={form.support_staff_current} onChange={(e)=>update("support_staff_current",Number(e.target.value))}/></label><label>{meta.support} adicionales<input type="number" min="0" value={form.support_staff_additional} onChange={(e)=>update("support_staff_additional",Number(e.target.value))}/></label><label>Duración media por caso<input type="number" min="10" value={form.average_case_minutes} onChange={(e)=>update("average_case_minutes",Number(e.target.value))}/><small>minutos</small></label><label>Horas por turno<input type="number" min="1" max="24" value={form.hours_per_shift} onChange={(e)=>update("hours_per_shift",Number(e.target.value))}/></label></div>
    <button className="primary-action" onClick={run}>Calcular capacidad y fechas proyectadas</button>{error&&<small className="error-text">{error}</small>}{result&&<div className="capacity-output"><div><span>Capacidad semanal</span><b>{formatNumber(result.baseline_weekly_capacity)} → {formatNumber(result.scenario_weekly_capacity)}</b></div><div><span>Cuello de botella</span><b>{result.bottleneck}</b></div><div><span>Espera global estimada</span><b>{result.estimated_global_wait_days_before} → {result.estimated_global_wait_days_after} días</b></div><section>{Object.entries(result.projected_attention_days).map(([k,v])=><span key={k}>{k.replaceAll("_"," ")}<b>{v} días</b></span>)}</section></div>}</article>;
}

function VisionPanel({ token, selected }) {
  const [file,setFile]=useState(null); const [preview,setPreview]=useState(""); const [result,setResult]=useState(null); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const choose=(event)=>{const next=event.target.files?.[0];if(!next)return;setFile(next);setPreview(URL.createObjectURL(next));setResult(null);};
  const analyze=async()=>{if(!file)return;setBusy(true);setError("");try{const form=new FormData();form.append("image",file);const response=await fetch(`${API_BASE}/api/diabetic_foot/analyze-upload`,{method:"POST",headers:{Authorization:`Bearer ${token}`},body:form});const payload=await response.json();if(!response.ok)throw new Error(payload.detail||"No fue posible analizar la imagen");setResult(payload);}catch(e){setError(e.message)}finally{setBusy(false)}};
  return <div className="vision-layout"><article className="vision-card glass-panel"><header><div><p className="kicker">VISIÓN ARTIFICIAL ASISTIVA</p><h2>Análisis aproximado de imagen</h2></div><span>MÉDICO CONFIRMA</span></header><p>Adjunte una fotografía JPEG o PNG. HealthOS extrae señales visuales y prepara observaciones para el profesional; no confirma ni descarta pie diabético.</p><label className="upload-zone">{preview?<img src={preview} alt="Vista previa clínica cargada"/>:<div><b>＋</b><strong>Seleccionar fotografía</strong><small>JPEG/PNG · máximo 8 MB</small></div>}<input type="file" accept="image/jpeg,image/png" onChange={choose}/></label><button className="primary-action" disabled={!file||busy} onClick={analyze}>{busy?"Analizando parámetros…":"Analizar para revisión médica"}</button>{error&&<p className="form-error">{error}</p>}</article>
    <article className="vision-result glass-panel"><p className="kicker">INFORME PARA CONFIRMACIÓN</p>{result?<><h2>{result.approximation}</h2><div className="vision-confidence"><strong>{Math.round(result.confidence*100)}%</strong><span>confianza técnica de la aproximación</span></div><h3>Parámetros observados</h3><div className="parameter-grid">{Object.entries(result.parameters_used).map(([k,v])=><span key={k}>{k.replaceAll("_"," ")}<b>{v}</b></span>)}</div><h3>Sugerencia al profesional</h3><p>{result.suggestion_to_clinician}</p><small className="vision-disclaimer">{result.disclaimer}</small></>:<><h2>Sin imagen analizada</h2><p>Paciente seleccionado: <b>{selected?.patient.nombre_sintetico||"ninguno"}</b>. El resultado quedará asociado visualmente a esta revisión de demo.</p><div className="vision-placeholder">IMAGEN → PARÁMETROS → OBSERVACIÓN → CONFIRMACIÓN MÉDICA</div></>}</article></div>;
}

function Chat({ token, role, selected }) {
  const [messages, setMessages] = useState([{ from: "bot", text: "Puedo explicar la priorización y resumir la lista sintética dentro de tu ámbito autorizado." }]); const [input, setInput] = useState(""); const [busy, setBusy] = useState(false);
  const send = async () => { const message = input.trim(); if (!message || busy) return; setInput(""); setBusy(true); setMessages((x) => [...x, { from: "user", text: message }]); try { const data = await apiFetch("/api/chat/local-list", { token, body: { message, role, institution_id: role === "jefatura_dm2" ? null : "INST-001", patient_synthetic_id: selected?.patient.rut_sintetico || null } }); setMessages((x) => [...x, { from: "bot", text: data.answer }]); } catch (e) { setMessages((x) => [...x, { from: "bot", text: e.message }]); } finally { setBusy(false); } };
  return <article className="chat-card glass-panel"><header><div><span className="secure-dot" /><div><h3>Copiloto clínico de la lista</h3><small>Contexto del paciente seleccionado · RBAC</small></div></div><b>EN LÍNEA</b></header><div className="chat-context">{selected?`${selected.patient.nombre_sintetico} · ${patientContext(selected).status} · ${patientContext(selected).careType}`:"Seleccione un paciente para contextualizar la consulta"}</div><div className="messages">{messages.slice(-6).map((m, i) => <p key={i} className={m.from}>{m.text}</p>)}</div><div className="composer"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ej.: resume antecedentes y explica su posición" /><button onClick={send} disabled={busy}>→</button></div></article>;
}

function Workflow({ role, patients, onOpen }) {
  if (role === "medico") return <article className="workflow-card glass-panel"><header><div><p className="kicker">AGENDA CLÍNICA</p><h2>Atenciones priorizadas de hoy</h2></div><span>10 cupos</span></header><div className="agenda">{patients.slice(0, 9).map((item, i) => <button key={item.patient.rut_sintetico} onClick={() => onOpen(item)}><time>{String(8 + Math.floor(i / 2)).padStart(2, "0")}:{i % 2 ? "30" : "00"}</time><span><b>{item.patient.nombre_sintetico}</b><small>{item.patient.route_sugerida}</small></span><PriorityBadge>{item.priority_band}</PriorityBadge><strong>{item.total_score.toFixed(2)}</strong></button>)}</div></article>;
  if (role === "enfermeria") return <article className="workflow-card glass-panel"><header><div><p className="kicker">COORDINACIÓN</p><h2>Seguimiento de cuidados</h2></div><span>Hoy</span></header><div className="care-grid">{["Contactar", "Exámenes", "Educación", "Escalar"].map((column, col) => <section key={column}><h3>{column}<b>{col + 2}</b></h3>{patients.slice(col * 2, col * 2 + 2).map((item) => <button key={item.patient.rut_sintetico} onClick={() => onOpen(item)}><small>{item.patient.rut_sintetico}</small><b>{item.patient.nombre_sintetico}</b><PriorityBadge>{item.priority_band}</PriorityBadge></button>)}</section>)}</div></article>;
  return null;
}

function PatientModal({ item, token, onClose, onSaved }) {
  const [priority,setPriority]=useState(item?.priority_band||"Media"); const [justification,setJustification]=useState(""); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{ if(item){ setPriority(item.priority_band); setJustification(""); setError(""); } },[item]);
  if (!item) return null; const p=item.patient; const context=patientContext(item);
  const save=async()=>{setSaving(true);setError("");try{await apiFetch("/api/reprioritize",{token,body:{patient_synthetic_id:p.rut_sintetico,priority_band:priority,justification}});onSaved();}catch(e){setError(e.message)}finally{setSaving(false)}};
  return <div className="modal-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><section className="patient-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="patient-title"><header><div><p className="kicker">FICHA INTEGRADA · DATOS SINTÉTICOS</p><h2 id="patient-title">{p.nombre_sintetico}</h2><span>{p.rut_sintetico} · {p.edad} años · {p.sexo_sintetico}</span></div><button onClick={onClose} aria-label="Cerrar ficha">×</button></header>
    <div className="patient-hero"><span className="large-avatar">{p.nombre_sintetico.split(" ").slice(0,2).map((x)=>x[0]).join("")}</span><div><small>{context.status}</small><PriorityBadge>{item.priority_band}</PriorityBadge><p>{context.careType} · meta {context.waitTarget}</p></div><div className="hero-score"><strong>{item.total_score.toFixed(2)}</strong><small>72% clínico + 28% espera</small></div></div>
    <div className="record-grid"><article><h3>Trayectoria asistencial</h3><dl><div><dt>Institución</dt><dd>{p.institucion_nombre}</dd></div><div><dt>Inscripción</dt><dd>{p.fecha_inscripcion_lista}</dd></div><div><dt>Última visita</dt><dd>{p.ultima_visita_hospital_sintetica}</dd></div><div><dt>Ruta / especialidad</dt><dd>{p.route_sugerida}</dd></div><div><dt>Posición sugerida</dt><dd>#{formatNumber(item.previous_position)} → #{formatNumber(item.new_position)}</dd></div></dl></article><article><h3>Antecedentes para priorización</h3><dl><div><dt>HbA1c sintética</dt><dd>{p.synthetic_hba1c.toFixed(1)}%</dd></div><div><dt>Estrato ECICEP</dt><dd>{p.estrato_ecicep_sintetico}</dd></div><div><dt>Pie diabético / Wagner</dt><dd>{Math.round(p.riesgo_pie_diabetico_sintetico*100)}% / {p.wagner_sintetico}</dd></div><div><dt>Riesgo hipoglicemia</dt><dd>{Math.round(p.riesgo_hipoglicemia_sintetico*100)}%</dd></div><div><dt>Riesgo inasistencia</dt><dd>{Math.round(p.no_show_risk_sintetico*100)}%</dd></div></dl></article></div>
    <article className="conditions"><h3>Comorbilidades y marco de datos</h3><div>{p.comorbilidades_sinteticas.map((x)=><span key={x}>{x}</span>)}<span>ECICEP {p.estrato_ecicep_sintetico}</span><span>MINSAL / DEIS sintético</span></div></article><article className="clinical-note"><h3>Fundamentos del orden sugerido</h3>{item.explanation.map((x)=><p key={x}>✓ {x}</p>)}</article>
    <article className="reprioritize-box"><header><div><p className="kicker">VALIDACIÓN PROFESIONAL</p><h3>Confirmar o repriorizar</h3></div><span>{item.movement>=0?"↑":"↓"} sugerencia del sistema</span></header><div><label>Nueva prioridad<select value={priority} onChange={(e)=>setPriority(e.target.value)}>{["Revisión inmediata","Muy alta","Alta","Media","Programada"].map((x)=><option key={x}>{x}</option>)}</select></label><label>Justificación clínica u operacional<textarea value={justification} onChange={(e)=>setJustification(e.target.value)} placeholder="Ej.: nueva descompensación, examen pendiente, estabilidad confirmada o criterio de continuidad…"/></label></div>{error&&<p className="form-error">{error}</p>}<button className="primary-action" disabled={saving||justification.trim().length<12} onClick={save}>{saving?"Registrando…":"Guardar decisión y trazabilidad"}</button></article>
    <footer><span>Referencias: ECICEP · MINSAL/DEIS · reglas locales auditables</span><button className="secondary-action" onClick={onClose}>Cerrar ficha</button></footer></section></div>;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("healthos-theme") || "dark");
  const [session, setSession] = useState(() => { try { return JSON.parse(sessionStorage.getItem("healthos-session")) || null; } catch { return null; } });
  const [activeView, setActiveView] = useState("Resumen"); const [patients, setPatients] = useState([]); const [metrics, setMetrics] = useState({}); const [selectedId, setSelectedId] = useState(null); const [modalPatient, setModalPatient] = useState(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [refreshKey,setRefreshKey]=useState(0);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("healthos-theme", theme); }, [theme]);
  useEffect(() => { if (!session?.token) return; let cancelled = false; setLoading(true); apiFetch("/api/prioritize", { token: session.token, body: { limit: 500, risk_weight: .72, waiting_weight: .28, include_explanations: true } }).then((data) => { if (cancelled) return; setPatients(data.patients); setMetrics(data.metrics); setSelectedId((current)=>current||data.patients[0]?.patient.rut_sintetico||null); setError(""); }).catch((e) => { if (!cancelled) setError(e.message); }).finally(() => !cancelled && setLoading(false)); return () => { cancelled = true; }; }, [session?.token,refreshKey]);
  const login = async (credentials) => { const data = await apiFetch("/api/auth/login", { body: credentials }); const next = { token: data.access_token, role: data.role, display_name: data.display_name, institution_id: data.institution_id, edition: data.edition }; sessionStorage.setItem("healthos-session", JSON.stringify(next)); setSession(next); };
  const logout = () => { sessionStorage.removeItem("healthos-session"); setSession(null); setPatients([]); };
  const switchEdition = (edition) => { const next = { ...session, edition }; sessionStorage.setItem("healthos-session", JSON.stringify(next)); setSession(next); };
  const selected = useMemo(() => patients.find((x) => x.patient.rut_sintetico === selectedId), [patients, selectedId]);
  if (showIntro) return <Intro onFinish={() => setShowIntro(false)} />;
  if (!session) return <Login onLogin={login} theme={theme} toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />;
  const edition = editions[session.edition]; const high = metrics.high_priority ?? patients.filter((x) => ["Revisión inmediata", "Muy alta", "Alta"].includes(x.priority_band)).length;
  return <main className="app-shell"><div className="app-ambient one" /><div className="app-ambient two" /><Sidebar session={session} activeView={activeView} setActiveView={setActiveView} onLogout={logout} /><section className="workspace">
    <header className="topbar"><div><p className="kicker">HEALTH SOLUTIONS · CLAUDE IMPACT LAB 2026</p><h1>{edition.headline}</h1><span>{edition.subtitle}</span></div><div className="top-controls"><div className="edition-toggle">{Object.entries(editions).map(([key, value]) => <button key={key} className={session.edition === key ? "active" : ""} onClick={() => switchEdition(key)}>{value.short}</button>)}</div><button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Cambiar tema">{theme === "dark" ? "☼" : "◐"}</button><button className="intro-button" onClick={() => setShowIntro(true)}>Ver intro</button></div></header>
    {error && <div className="error-banner" role="alert">{error}. Verifica que el backend de HealthOS esté activo.</div>}{loading && <div className="loading-line"><i /></div>}
    {activeView === "Resumen" && <><section className="metrics"><Metric label="Pacientes en espera" value={formatNumber(metrics.queue_size_unchanged || patients.length)} detail="muestra operacional sintética" /><Metric label="Revisión inmediata" value={formatNumber(metrics.immediate_review || 0)} detail="requieren evaluación profesional" tone="red" /><Metric label="Prioridad alta" value={formatNumber(high)} detail="riesgo clínico + antigüedad" tone="amber" /><Metric label="Mediana observada" value={`${metrics.median_waiting_days_observed || 0} días`} detail="en la muestra priorizada" /></section><Overview patients={patients} onOpen={setModalPatient}/></>}
    {activeView === "Lista priorizada" && <div className="dashboard-grid"><PatientTable patients={patients} selectedId={selectedId} onSelect={setSelectedId} onOpen={setModalPatient}/><aside><PatientSummary selected={selected} onOpen={setModalPatient}/>{session.role!=="jefatura_dm2"&&<Workflow role={session.role} patients={patients} onOpen={setModalPatient}/>}</aside></div>}
    {activeView === "Capacidad" && <div className="capacity-page"><Capacity token={session.token}/><article className="capacity-context glass-panel"><p className="kicker">LECTURA DEL ESCENARIO</p><h2>La fecha cambia; el riesgo clínico permanece</h2><p>Los cupos adicionales se asignan siguiendo la prioridad confirmada. Pabellón exige simultáneamente sala, cirujano, anestesiólogo, enfermería y recuperación; un recurso sin su contraparte no aumenta capacidad efectiva.</p><PatientSummary selected={selected} onOpen={setModalPatient}/></article></div>}
    {activeView === "Visión asistida" && <VisionPanel token={session.token} selected={selected}/>} 
    {activeView === "Copiloto clínico" && <div className="focus-grid"><Chat token={session.token} role={session.role} selected={selected}/><PatientSummary selected={selected} onOpen={setModalPatient}/></div>}
    <footer className="app-footer"><strong>HealthOS · Licencia propietaria exclusiva y prioritaria de Health Solutions</strong><span>© 2026 · Datos sintéticos · No diagnostica ni indica tratamientos</span></footer>
  </section><PatientModal item={modalPatient} token={session.token} onClose={() => setModalPatient(null)} onSaved={()=>{setModalPatient(null);setRefreshKey((x)=>x+1)}} /></main>;
}
