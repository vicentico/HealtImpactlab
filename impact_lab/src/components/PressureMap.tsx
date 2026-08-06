import React, { useMemo } from 'react';
import { Gauge } from 'lucide-react';
import { Patient } from '../types/patient';

interface ProgramCapacity {
  id: string;
  name: string;
  demandCount: number;
  weeklyCapacity: number;
  unit: string;
}

interface PressureMapProps {
  programs?: ProgramCapacity[];
  patients?: Patient[];
}

export const PressureMap: React.FC<PressureMapProps> = ({ programs, patients }) => {
  const displayPrograms: ProgramCapacity[] = useMemo(() => {
    if (programs && programs.length > 0) return programs;
    
    if (patients && patients.length > 0) {
      const dm2Count = patients.filter(
        (p) => p.hba1c >= 8.5 || p.nt118Risk.riskLevel === 'CRITICO' || p.nt118Risk.riskLevel === 'ALTO'
      ).length;
      const nefroCount = patients.filter((p) => p.vfg < 60 || p.nt118Risk.renalsScore > 10).length;
      const footCount = patients.filter((p) => p.hasFootUlcer).length;
      const cvCount = patients.length;

      return [
        { id: '1', name: 'DM2 / Diabetología APS', demandCount: dm2Count, weeklyCapacity: 8, unit: 'cupos/sem' },
        { id: '2', name: 'Nefroprotección (VFG < 45)', demandCount: nefroCount, weeklyCapacity: 4, unit: 'cupos/sem' },
        { id: '3', name: 'Pie Diabético / Curación Avanzada', demandCount: footCount, weeklyCapacity: 6, unit: 'cupos/sem' },
        { id: '4', name: 'Control Enfermera CV / ECICEP', demandCount: cvCount, weeklyCapacity: 20, unit: 'cupos/sem' },
      ];
    }

    return [
      { id: '1', name: 'DM2 / Diabetología APS', demandCount: 24, weeklyCapacity: 8, unit: 'cupos/sem' },
      { id: '2', name: 'Nefroprotección (VFG < 45)', demandCount: 12, weeklyCapacity: 4, unit: 'cupos/sem' },
      { id: '3', name: 'Pie Diabético / Curación Avanzada', demandCount: 8, weeklyCapacity: 6, unit: 'cupos/sem' },
      { id: '4', name: 'Control Enfermera CV / ECICEP', demandCount: 35, weeklyCapacity: 20, unit: 'cupos/sem' },
    ];
  }, [programs, patients]);

  const getPressureStatus = (demand: number, capacity: number) => {
    const ratio = demand / (capacity * 2);
    if (ratio > 2.0) {
      return { label: 'CRÍTICA', color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30', badge: 'bg-red-500' };
    } else if (ratio > 1.2) {
      return { label: 'ALTA', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30', badge: 'bg-amber-500' };
    } else if (ratio > 0.8) {
      return { label: 'MEDIA', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30', badge: 'bg-cyan-500' };
    }
    return { label: 'NORMAL', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30', badge: 'bg-emerald-500' };
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold apple-title">Mapa de Presión Asistencial APS</h3>
            <p className="text-[11px] apple-subtitle">Balance de Demanda en Lista de Espera vs Capacidad de Agenda Semanal</p>
          </div>
        </div>
        <span className="rounded-full apple-control px-3 py-1 text-[10px] font-mono-tabular apple-subtitle">
          Corte: Semana Actual
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayPrograms.map((prog) => {
          const status = getPressureStatus(prog.demandCount, prog.weeklyCapacity);
          const gap = prog.demandCount - prog.weeklyCapacity;

          return (
            <div 
              key={prog.id}
              className="rounded-xl glass-panel p-3.5 flex flex-col justify-between space-y-3 glass-panel-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold apple-title line-clamp-1">{prog.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-1.5 font-mono-tabular text-xs">
                <div className="flex items-center justify-between apple-subtitle">
                  <span>Demanda Actual:</span>
                  <span className="font-bold apple-title">{prog.demandCount} pac.</span>
                </div>
                <div className="flex items-center justify-between apple-subtitle">
                  <span>Oferta Semanal:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{prog.weeklyCapacity} {prog.unit}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-1">
                  <span className="apple-subtitle">Brecha Estimada:</span>
                  <span className={`font-bold ${gap > 10 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-300'}`}>
                    +{gap} pacientes
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full ${status.badge}`}
                  style={{ width: `${Math.min(100, (prog.demandCount / (prog.weeklyCapacity * 2)) * 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
