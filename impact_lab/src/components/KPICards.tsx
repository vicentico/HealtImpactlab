import React from 'react';
import { Patient } from '../types/patient';
import { AlertTriangle, Users, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface KPICardsProps {
  patients: Patient[];
}

export const KPICards: React.FC<KPICardsProps> = ({ patients }) => {
  const totalCount = patients.length;
  const criticalCount = patients.filter(p => p.nt118Risk.riskLevel === 'CRITICO').length;
  const highDecompensatedCount = patients.filter(p => p.hba1c >= 10.0 || p.hasFootUlcer).length;
  const pendingContraloriaCount = patients.filter(p => p.contraloriaStatus === 'PENDIENTE').length;
  const approvedCount = patients.filter(p => p.contraloriaStatus === 'APROBADO').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* Total Pacientes */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Pacientes</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-white">{totalCount}</span>
          <span className="text-[10px] text-slate-400">Lista Espera APS</span>
        </div>
      </div>

      {/* Riesgo Crítico NT 118 */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-red-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Riesgo Crítico (NT 118)</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <ShieldAlert className="h-4 w-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-red-400">{criticalCount}</span>
          <span className="text-[10px] text-red-400/80 font-medium">Prioridad Inmediata</span>
        </div>
      </div>

      {/* Descompensación Severa */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Descompensados HbA1c &gt;10%</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-amber-300">{highDecompensatedCount}</span>
          <span className="text-[10px] text-amber-400/80 font-medium">Pie / HbA1c Crítica</span>
        </div>
      </div>

      {/* Pendientes Contraloría */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-cyan-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Pendiente Contraloría</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-cyan-300">{pendingContraloriaCount}</span>
          <span className="text-[10px] text-cyan-400/80 font-medium">Por Validar Médico</span>
        </div>
      </div>

      {/* Aprobados Médicos */}
      <div className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Aprobados y Citados</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-emerald-400">{approvedCount}</span>
          <span className="text-[10px] text-emerald-400/80 font-medium">Derivación Confirmada</span>
        </div>
      </div>

    </div>
  );
};
