import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  ShieldCheck, 
  Building2,
  FileText
} from 'lucide-react';
import { Patient } from '../types';

interface OperationalExplicationPanelProps {
  selectedPatient: Patient | null;
}

export const OperationalExplicationPanel: React.FC<OperationalExplicationPanelProps> = ({
  selectedPatient
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Explicabilidad Operativa de Priorización
            </h3>
            <p className="text-[11px] text-slate-400">
              Criterios algorítmicos auditables según Norma Técnica N° 118 MINSAL
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
          Auditable APDP / MINSAL
        </span>
      </div>

      {selectedPatient ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Box 1: Why position moved */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
              <span>¿Por qué cambió de lugar?</span>
              {selectedPatient.positionDelta > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <p className="text-slate-200 leading-snug font-medium">
              Subió <strong className="text-teal-300 font-mono">+{selectedPatient.positionDelta} puestos</strong> debido a desfasaje crítico de control ({selectedPatient.controlBreachMonths} meses) y descompensación clínica activa.
            </p>
          </div>

          {/* Box 2: Variables considered */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
              <span>Variables Ponderadas</span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1">
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                Riesgo Vital: {selectedPatient.clinicalFactors.vitalRisk ? 'CRÍTICO' : 'Normal'}
              </li>
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Vulnerabilidad RSH: {selectedPatient.clinicalFactors.socialVulnerabilityScore}/10
              </li>
              <li className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Días en lista: {selectedPatient.daysOnWaitlist} días
              </li>
            </ul>
          </div>

          {/* Box 3: Capacity / Cupos impact */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
              <span>Capacidad Sectorial</span>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-slate-200 leading-snug">
              Asignado a cupo de sobreagenda en <strong className="text-cyan-300">Sector {selectedPatient.sector}</strong> con proyección de cita en <strong className="text-emerald-300">{selectedPatient.estimatedAppointmentDate}</strong>.
            </p>
          </div>

          {/* Box 4: Decision del Contralor */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
              <span>Dictamen Contralor</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-slate-300 text-[11px] italic">
              {selectedPatient.contralorValidation.isValidated
                ? `"${selectedPatient.contralorValidation.notes || 'Priorización confirmada y validada en sistema.'}"`
                : 'Pendiente de firma digital por el Médico Contralor del CESFAM.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-950/60 rounded-xl text-center text-slate-500 text-xs">
          Seleccione un paciente de la tabla para visualizar el desglose detallado de explicabilidad algorítmica y los factores de la Norma Técnica N° 118.
        </div>
      )}
    </div>
  );
};
