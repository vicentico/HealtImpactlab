import React, { useState } from 'react';
import { Patient, ContraloriaStatus } from '../types/patient';
import { 
  X, 
  Activity, 
  ShieldAlert, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Send,
  History
} from 'lucide-react';

interface PatientDetailPanelProps {
  patient: Patient | null;
  onClose: () => void;
  onUpdateStatus: (patientId: string, newStatus: ContraloriaStatus, clinicalNote: string) => void;
}

export const PatientDetailPanel: React.FC<PatientDetailPanelProps> = ({
  patient,
  onClose,
  onUpdateStatus
}) => {
  if (!patient) return null;

  const [selectedStatus, setSelectedStatus] = useState<ContraloriaStatus>(patient.contraloriaStatus);
  const [clinicalNote, setClinicalNote] = useState<string>('');

  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNote.trim()) {
      alert('Por favor ingrese una nota clínica justificativa antes de registrar la acción.');
      return;
    }
    onUpdateStatus(patient.id, selectedStatus, clinicalNote);
    setClinicalNote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex justify-end">
      
      <div className="w-full max-w-2xl glass-panel border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 font-mono-tabular text-xs font-bold text-white">
                  #{patient.priorityPosition}
                </span>
                <h2 className="text-xl font-bold apple-title">{patient.fullName}</h2>
              </div>
              <p className="text-xs apple-subtitle mt-1">
                RUT: <span className="font-mono-tabular font-bold apple-title">{patient.rut}</span> • {patient.age} años ({patient.gender}) • <span className="text-cyan-600 dark:text-cyan-400 font-bold">{patient.sector}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full apple-control p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          </div>

          {/* NT 118 Score Breakdown */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-cyan-400" /> Desglose Puntaje Algorítmico NT 118
              </h3>
              <span className="text-lg font-mono-tabular font-extrabold text-cyan-300">
                {patient.nt118Risk.totalScore} <span className="text-xs font-normal text-slate-400">/ 100 pts</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono-tabular pt-2">
              <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                <p className="text-[10px] text-slate-400">HbA1c</p>
                <p className="font-bold text-amber-400">{patient.nt118Risk.hba1cScore} pts</p>
              </div>
              <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                <p className="text-[10px] text-slate-400">Renal (VFG)</p>
                <p className="font-bold text-red-400">{patient.nt118Risk.renalsScore} pts</p>
              </div>
              <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                <p className="text-[10px] text-slate-400">Cardiovascular</p>
                <p className="font-bold text-blue-400">{patient.nt118Risk.cvScore} pts</p>
              </div>
              <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                <p className="text-[10px] text-slate-400">Determinantes</p>
                <p className="font-bold text-emerald-400">{patient.nt118Risk.socialScore} pts</p>
              </div>
            </div>

            {/* Active Decompensation Factors */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Factores de Descompensación Detectados:</p>
              <div className="space-y-1">
                {patient.nt118Risk.decompensations.map((dec, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded bg-red-950/40 border border-red-500/20 px-2.5 py-1 text-xs">
                    <span className="text-red-300 font-medium">{dec.label}</span>
                    <span className="font-mono-tabular font-bold text-red-400">{dec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clinical Parameters Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" /> Parámetros Biomédicos Ficha Electrónica
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400">HbA1c Glicosilada</span>
                <p className="text-lg font-bold font-mono-tabular text-amber-400">{patient.hba1c}%</p>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400">Presión Arterial</span>
                <p className="text-lg font-bold font-mono-tabular text-slate-200">{patient.systolicBP}/{patient.diastolicBP}</p>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400">VFG Renal</span>
                <p className="text-lg font-bold font-mono-tabular text-cyan-300">{patient.vfg} mL/min</p>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400">Días Espera</span>
                <p className="text-lg font-bold font-mono-tabular text-slate-300">{patient.daysInWaitingList} días</p>
              </div>
            </div>
          </div>

          {/* Contraloría Action Form */}
          <form onSubmit={handleSubmitAction} className="rounded-xl bg-slate-900/90 border border-cyan-500/30 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Decisión Médica de Contraloría (Override / Validación)
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedStatus('APROBADO')}
                className={`py-2 px-3 rounded-lg font-semibold border transition-all ${
                  selectedStatus === 'APROBADO'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                ✓ Aprobar Derivación
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('REQUIERE_REVISION')}
                className={`py-2 px-3 rounded-lg font-semibold border transition-all ${
                  selectedStatus === 'REQUIERE_REVISION'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                ⏳ Solicitar Exámenes
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('OBSERVADO')}
                className={`py-2 px-3 rounded-lg font-semibold border transition-all ${
                  selectedStatus === 'OBSERVADO'
                    ? 'bg-slate-800 text-slate-200 border-slate-600 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                👁️ Observar / Mantener APS
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('PENDIENTE')}
                className={`py-2 px-3 rounded-lg font-semibold border transition-all ${
                  selectedStatus === 'PENDIENTE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                ⚠️ Pendiente Eval.
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nota Clínica Justificativa (Firma Digital Auditoría):
              </label>
              <textarea
                rows={3}
                value={clinicalNote}
                onChange={(e) => setClinicalNote(e.target.value)}
                placeholder="Ingrese justificación médica, exámenes faltantes o indicación especial..."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-600/30 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Registrar Acción de Contraloría</span>
            </button>
          </form>

          {/* Audit Trail History */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-cyan-400" /> Bitácora Inmutable de Trazabilidad Auditable
            </h3>
            <div className="space-y-2 text-xs">
              {patient.auditHistory.length === 0 ? (
                <p className="text-slate-500 text-[11px] italic">Sin registros previos de contraloría.</p>
              ) : (
                patient.auditHistory.map((log) => (
                  <div key={log.id} className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-cyan-400">{log.userName} ({log.userRole})</span>
                      <span className="font-mono-tabular">{log.timestamp}</span>
                    </div>
                    <p className="font-semibold text-slate-200">{log.action}</p>
                    <p className="text-slate-300 text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800/80">
                      "{log.clinicalNote}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>

  );
};
