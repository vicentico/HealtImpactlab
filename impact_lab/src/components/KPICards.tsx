import React from 'react';
import { Patient } from '../types/patient';
import { AlertTriangle, Users, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface KPICardsProps {
  patients: Patient[];
  avgNt118Score?: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ patients, avgNt118Score = 0 }) => {
  const totalCount = patients.length;
  const criticalCount = patients.filter(p => p.nt118Risk?.riskLevel === 'CRITICO').length;
  const highDecompensatedCount = patients.filter(p => p.hba1c >= 10.0 || p.hasFootUlcer).length;
  const pendingContraloriaCount = patients.filter(p => p.contraloriaStatus === 'PENDIENTE').length;
  const approvedCount = patients.filter(p => p.contraloriaStatus === 'APROBADO').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* Total Pacientes */}
      <div className="glass-panel glass-panel-hover p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold apple-subtitle">Total Pacientes</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular apple-title">{totalCount}</span>
          <span className="text-[10px] apple-muted">Lista Espera APS</span>
        </div>
      </div>

      {/* Riesgo Crítico NT 118 */}
      <div className="glass-panel glass-panel-hover p-4 flex flex-col justify-between border-l-4 border-l-red-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold apple-subtitle">Riesgo Crítico (NT 118)</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <ShieldAlert className="h-4 w-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-red-600 dark:text-red-400">{criticalCount}</span>
          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">Prioridad Inmediata</span>
        </div>
      </div>

      {/* Descompensación Severa */}
      <div className="glass-panel glass-panel-hover p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold apple-subtitle">Descompensados HbA1c &gt;10%</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-amber-600 dark:text-amber-300">{highDecompensatedCount}</span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Pie / HbA1c Crítica</span>
        </div>
      </div>

      {/* Pendientes Contraloría */}
      <div className="glass-panel glass-panel-hover p-4 flex flex-col justify-between border-l-4 border-l-cyan-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold apple-subtitle">Pendiente Contraloría</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-cyan-600 dark:text-cyan-300">{pendingContraloriaCount}</span>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Por Validar Médico</span>
        </div>
      </div>

      {/* Aprobados Médicos */}
      <div className="glass-panel glass-panel-hover p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold apple-subtitle">Aprobados y Citados</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400">{approvedCount}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Derivación Confirmada</span>
        </div>
      </div>

    </div>
  );
};
