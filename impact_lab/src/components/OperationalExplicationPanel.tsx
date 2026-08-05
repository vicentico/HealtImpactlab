import React from 'react';
import { X, BookOpen, ShieldCheck, CheckCircle, Cpu, FileCheck } from 'lucide-react';

interface OperationalExplicationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperationalExplicationPanel: React.FC<OperationalExplicationPanelProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl glass-panel border border-slate-800 bg-slate-950 rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Modelo Algorítmico & Explicabilidad NT 118</h2>
              <p className="text-xs text-slate-400">Normativa MINSAL APS para Repriorización de Diabetes Mellitus Tipo 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section 1: Ponderaciones de Riesgo */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> 1. Matriz de Ponderación Criterios de Riesgo (Total 100 Puntos)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">Control Glicémico (HbA1c)</span>
                <span className="font-mono-tabular font-bold text-slate-200">Máx. 35 pts</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pondera niveles de HbA1c &gt; 11% (35 pts), HbA1c 9.0-10.9% (28 pts), HbA1c 8.0-8.9% (18 pts).
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400">Deterioro Renal (VFG)</span>
                <span className="font-mono-tabular font-bold text-slate-200">Máx. 30 pts</span>
              </div>
              <p className="text-[11px] text-slate-400">
                VFG &lt; 30 mL/min (30 pts), VFG 30-44 (25 pts), Proteinuria / Microalbuminuria activa (+10 pts).
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400">Complicaciones Vasculares</span>
                <span className="font-mono-tabular font-bold text-slate-200">Máx. 25 pts</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pie diabético activo (+20 pts en caso de úlcera), Retinopatía prolif. (+15 pts), HTA severa (+10 pts).
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">Determinantes Sociales y Días</span>
                <span className="font-mono-tabular font-bold text-slate-200">Máx. 10 pts</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Garantía GES excedida (&gt;90 días), ruralidad y adulto mayor &gt; 65 años sin red de apoyo.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Rol del Médico Contralor */}
        <div className="rounded-xl bg-slate-900/80 border border-cyan-500/30 p-4 space-y-2 text-xs">
          <h3 className="font-bold text-cyan-300 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> 2. Autonomía Clínica y Override Médico (Human-in-the-Loop)
          </h3>
          <p className="text-slate-300 leading-relaxed">
            El algoritmo propone un orden jerárquico de prioridad, pero el <strong>Médico Contralor APS</strong> mantiene la potestad absoluta para ajustar la posición o solicitar exámenes previos. Cada decisión genera una entrada inmutable en la bitácora auditable para dar pleno cumplimiento a las regulaciones de la Ley de Derechos y Deberes de los Pacientes.
          </p>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-600/30"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
