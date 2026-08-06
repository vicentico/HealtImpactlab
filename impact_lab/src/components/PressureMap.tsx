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
    const ratio = demand / (capacity * 2); // ratio de presión a 2 semanas
    if (ratio > 2.0) {
      return { label: 'CRÍTICA', color: 'text-red-400 bg-red-950/60 border-red-500/40', badge: 'bg-red-500' };
    } else if (ratio > 1.2) {
      return { label: 'ALTA', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40', badge: 'bg-amber-500' };
    } else if (ratio > 0.8) {
      return { label: 'MEDIA', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40', badge: 'bg-cyan-500' };
    }
    return { label: 'NORMAL', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40', badge: 'bg-emerald-500' };
  };

  return (
    <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Mapa de Presión Asistencial APS</h3>
            <p className="text-[11px] text-slate-400">Balance de Demanda en Lista de Espera vs Capacidad de Agenda Semanal</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-[10px] font-mono-tabular text-slate-400">
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
              className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3.5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200 line-clamp-1">{prog.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-1.5 font-mono-tabular text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Demanda Actual:</span>
                  <span className="font-bold text-white">{prog.demandCount} pac.</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Oferta Semanal:</span>
                  <span className="font-semibold text-cyan-300">{prog.weeklyCapacity} {prog.unit}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 border-t border-slate-800/60 pt-1">
                  <span>Brecha Estimada:</span>
                  <span className={`font-bold ${gap > 10 ? 'text-red-400' : 'text-amber-300'}`}>
                    +{gap} pacientes
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
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
