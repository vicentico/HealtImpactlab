import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Stethoscope, 
  Clock, 
  X,
  Sparkles,
  Lock,
  HeartPulse,
  Activity,
  Layers,
  CalendarCheck,
  FileCheck,
  AlertOctagon,
  Eye,
  EyeOff
} from 'lucide-react';
import { Patient, UserRole } from '../types';
import { getRoleInfo, formatDisplayName, formatDisplayRut } from '../lib/roles';

interface PatientDetailPanelProps {
  patient: Patient | null;
  onClose: () => void;
  onConfirmPrioritization: (patientId: string, notes: string) => void;
  onOverridePosition: (patientId: string, newPosition: number, notes: string) => void;
  onDeriveToHospital: (patientId: string, notes: string) => void;
  onAddContralorNote: (patientId: string, note: string) => void;
  activeRole: UserRole | string;
  onRestrictedActionAttempt: (actionName: string) => void;
}

export const PatientDetailPanel: React.FC<PatientDetailPanelProps> = ({
  patient,
  onClose,
  onConfirmPrioritization,
  onOverridePosition,
  onDeriveToHospital,
  onAddContralorNote,
  activeRole,
  onRestrictedActionAttempt
}) => {
  const [contralorNoteInput, setContralorNoteInput] = useState('');
  const [overridePos, setOverridePos] = useState<number>(patient ? patient.currentPosition : 1);
  const [activeTab, setActiveTab] = useState<'CLINICO' | 'EXPLICABILIDAD' | 'CONTRALORIA'>('CLINICO');
  const [unmaskRequested, setUnmaskRequested] = useState<boolean>(false);

  const roleInfo = getRoleInfo(activeRole);

  if (!patient) {
    return (
      <div className="w-80 lg:w-96 bg-slate-900 border-l border-slate-800 p-6 text-center text-slate-500 flex flex-col items-center justify-center h-full">
        <User className="w-12 h-12 mb-3 text-slate-700" />
        <h3 className="text-sm font-bold text-slate-400">Sin persona con DM2 seleccionada</h3>
        <p className="text-xs text-slate-600 mt-1">
          Haga clic en cualquier fila de la lista para desplegar el expediente clínico completo, los biomarcadores DM2 y ejecutar acciones del Médico Contralor ECICEP.
        </p>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!roleInfo.canPerformContralorActions) {
      onRestrictedActionAttempt('Validación Contralora de Priorización');
      return;
    }
    onConfirmPrioritization(patient.id, contralorNoteInput || 'Priorización DM2 ECICEP auditada y validada por Médico Contralor APS.');
    setContralorNoteInput('');
  };

  const handleOverride = () => {
    if (!roleInfo.canPerformContralorActions) {
      onRestrictedActionAttempt('Ajuste Manual de Posición en Lista de Espera');
      return;
    }
    onOverridePosition(patient.id, overridePos, contralorNoteInput || 'Ajuste de posición por criterio clínico contralor bajo modelo ECICEP.');
    setContralorNoteInput('');
  };

  const handleDerive = () => {
    if (!roleInfo.canPerformContralorActions) {
      onRestrictedActionAttempt('Derivación a Nivel 2 Hospitalario');
      return;
    }
    onDeriveToHospital(patient.id, contralorNoteInput || 'Derivación iniciada a Especialidad Hospitalaria (Diabetología / Nefrología Nivel 2).');
    setContralorNoteInput('');
  };

  const hbA1c = patient.clinicalFactors.hbA1c || 8.0;
  const isHbA1cCritical = hbA1c >= 10.0;

  // Identity resolution based on role & user toggle
  const showFullIdentity = roleInfo.canSeeFullIdentity || (roleInfo.canUnmaskData && unmaskRequested);
  const nameDisplay = showFullIdentity ? patient.name : `${patient.initials || patient.name.substring(0, 3)} [${patient.code || patient.id}]`;
  const rutDisplay = showFullIdentity ? patient.rut : (patient.partialRut || `${patient.rut.substring(0, 6)}***-*`);

  return (
    <aside className="w-80 lg:w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col h-full text-slate-200 overflow-hidden shadow-2xl">
      {/* Detail Header with Security Authorization Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Ficha FCE Protegida [{patient.code || patient.id}]</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold text-slate-100 leading-tight">
              {nameDisplay}
            </h2>

            {/* Unmask toggle for authorized clinical profiles */}
            {roleInfo.canUnmaskData && !roleInfo.canSeeFullIdentity && (
              <button
                onClick={() => setUnmaskRequested(!unmaskRequested)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-teal-300 border border-slate-700 flex items-center gap-1 shrink-0"
                title={unmaskRequested ? "Ocultar datos normativos" : "Desenmascarar RUT y Nombre por requerimiento asistencial"}
              >
                {unmaskRequested ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-teal-400" />}
                <span>{unmaskRequested ? 'Ocultar ID' : 'Desenmascarar'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
            <span className="text-teal-300 font-bold">{rutDisplay}</span>
            <span>•</span>
            <span>{patient.age} años ({patient.gender})</span>
            <span>•</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              patient.sector === 'Verde' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              patient.sector === 'Azul' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
              patient.sector === 'Rojo' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
              'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              Sector {patient.sector}
            </span>
          </div>
        </div>

        {/* Access level message */}
        <div className={`text-[10px] p-2 rounded border flex items-center gap-2 ${
          roleInfo.canPerformContralorActions
            ? 'bg-slate-900/90 text-slate-300 border-slate-800'
            : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
        }`}>
          <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${roleInfo.canPerformContralorActions ? 'text-teal-400' : 'text-amber-400'}`} />
          <span>
            Acceso en rol: <strong className="text-slate-100">{roleInfo.label}</strong>
            {!roleInfo.canPerformContralorActions && ' (Modo lectura asistencial / gestión acotada)'}
          </span>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('CLINICO')}
          className={`flex-1 py-2.5 px-2 text-center transition-colors border-b-2 ${
            activeTab === 'CLINICO'
              ? 'border-teal-400 text-teal-300 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Biomarcadores DM2
        </button>
        <button
          onClick={() => setActiveTab('EXPLICABILIDAD')}
          className={`flex-1 py-2.5 px-2 text-center transition-colors border-b-2 ${
            activeTab === 'EXPLICABILIDAD'
              ? 'border-teal-400 text-teal-300 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Reglas ECICEP
        </button>
        <button
          onClick={() => setActiveTab('CONTRALORIA')}
          className={`flex-1 py-2.5 px-2 text-center transition-colors border-b-2 ${
            activeTab === 'CONTRALORIA'
              ? 'border-teal-400 text-teal-300 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Acciones Contralor
        </button>
      </div>

      {/* Main Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {activeTab === 'CLINICO' && (
          <div className="space-y-4">
            {/* Primary DM2 Pathology Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Diagnóstico & Estratificación ECICEP
              </span>
              <p className="text-xs font-bold text-slate-100 leading-snug">
                {patient.primaryPathology}
              </p>
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-teal-400 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                  {patient.ecicepTier ? patient.ecicepTier.replace(/_/g, ' ') : 'Nivel G2 - Complejidad Media'}
                </span>
                <span className="text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  Equipo: {patient.careTeam}
                </span>
              </div>
            </div>

            {/* Position & Risk Score */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Prioridad ECICEP</span>
                <span className="text-2xl font-black text-teal-300 font-mono mt-0.5 block">
                  #{patient.currentPosition}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  de #{patient.originalPosition} orig. ({patient.positionDelta > 0 ? `+${patient.positionDelta}` : patient.positionDelta})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Score Clínico DM2</span>
                <span className="text-2xl font-black text-amber-300 font-mono mt-0.5 block">
                  {patient.clinicalRiskScore} pts
                </span>
                <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                  Riesgo {patient.clinicalRiskLevel.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Biomarkers Grid */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                Biomarcadores de Metas de Control DM2
              </span>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded-lg border ${
                  isHbA1cCritical ? 'bg-rose-950/40 border-rose-500/40' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 block">Hemoglobina Glicosilada</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-base font-black font-mono ${isHbA1cCritical ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {hbA1c}%
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {isHbA1cCritical ? 'Descompensado' : 'En Meta'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block">Relación Albúmina/Creatinina</span>
                  <div className="text-xs font-bold font-mono text-amber-300 mt-1">
                    {patient.clinicalFactors.rac || '280 mg/g'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block">Vel. Filtración Glomerular</span>
                  <div className="text-xs font-bold font-mono text-teal-300 mt-1">
                    {patient.clinicalFactors.vfg || '52 ml/min/1.73m²'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block">Presión Arterial</span>
                  <div className="text-xs font-bold font-mono text-slate-200 mt-1">
                    {patient.clinicalFactors.bloodPressure || '155/95 mmHg'}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Meses sin control presencial:</span>
                <span className="font-mono font-extrabold text-amber-400">
                  {patient.controlBreachMonths} meses desfasado
                </span>
              </div>
            </div>

            {/* Emergency & SAPU Recent Events */}
            {patient.clinicalFactors.recentEmergencyEvents && patient.clinicalFactors.recentEmergencyEvents.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  Eventos de Urgencia / Hospitalización (&lt; 30 días)
                </span>
                <ul className="space-y-1 text-xs text-rose-200">
                  {patient.clinicalFactors.recentEmergencyEvents.map((evt, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-rose-950/60 p-2 rounded border border-rose-800/60">
                      <span>{evt.type}: {evt.reason}</span>
                      <span className="font-mono text-[10px] font-bold text-rose-300">{evt.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Motivo Principal */}
            <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/30">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
                Fundamentación del Caso Clínico
              </span>
              <p className="text-xs text-teal-200/90 leading-relaxed font-medium">
                "{patient.primaryReason}"
              </p>
            </div>
          </div>
        )}

        {activeTab === 'EXPLICABILIDAD' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Criterios Algorítmicos ECICEP & APS</span>
              </div>
              <p className="text-xs text-slate-400">
                Priorización calculada según la brecha de control biomarcador, riesgo cardiovascular multinivel y eventos de descompensación aguda.
              </p>
            </div>

            {/* Auditable Justification Statement */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Justificación Trazable Generada
              </span>
              <p className="text-xs text-slate-300 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                "{patient.auditableJustification}"
              </p>
            </div>

            {/* Rules Applied List */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Puntajes & Criterios Asignados
              </span>
              <div className="space-y-2">
                {patient.rulesApplied.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                          {rule.code}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{rule.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{rule.description}</p>
                    </div>
                    <span className="text-sm font-black text-amber-300 font-mono shrink-0">
                      +{rule.pointsAdded} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CONTRALORIA' && (
          <div className="space-y-4">
            {/* Validation Current Status */}
            <div className={`p-3.5 rounded-xl border ${
              patient.contralorValidation.isValidated 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                {patient.contralorValidation.isValidated ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Priorización ECICEP Validada</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Pendiente de Firma Contralora</span>
                  </>
                )}
              </div>
              {patient.contralorValidation.isValidated && (
                <div className="mt-2 text-[11px] text-slate-300 space-y-0.5 font-mono">
                  <p>Médico: {patient.contralorValidation.validatedBy}</p>
                  <p>Fecha: {patient.contralorValidation.timestamp}</p>
                  {patient.contralorValidation.notes && (
                    <p className="text-slate-400 italic mt-1 font-sans">
                      Obs: "{patient.contralorValidation.notes}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Input Note Box */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Observación Clínico-Administrativa del Contralor
              </label>
              <textarea
                value={contralorNoteInput}
                onChange={(e) => setContralorNoteInput(e.target.value)}
                rows={3}
                placeholder="Escriba indicaciones para el equipo de cabecera, citación a sobreagenda o fundamentación del reordenamiento..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Action 1: Confirm Prioritization */}
            <button
              onClick={handleConfirm}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validar Priorización & Asignar Citación ECICEP</span>
            </button>

            {/* Action 2: Override Position */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Reordenar Posición en Lista (Criterio Clínico)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Mover a #:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={overridePos}
                  onChange={(e) => setOverridePos(parseInt(e.target.value) || 1)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-teal-300 text-center"
                />
                <button
                  onClick={handleOverride}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
                >
                  Ajustar Posición
                </button>
              </div>
            </div>

            {/* Action 3: Derive to Secondary Hospital */}
            <button
              onClick={handleDerive}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4 text-indigo-400" />
              <span>Derivar a Nivel 2 Hospitalario (Diabetología)</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Security Microcopy */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Trazabilidad de sesión y cambios registrada</span>
        <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Auditable
        </span>
      </div>
    </aside>
  );
};

