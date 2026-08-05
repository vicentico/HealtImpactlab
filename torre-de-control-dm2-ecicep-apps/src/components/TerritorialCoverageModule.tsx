import React from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Activity, 
  BarChart2, 
  CheckCircle2, 
  AlertTriangle,
  Flame
} from 'lucide-react';
import { SectorCoverageMetric } from '../types';

interface TerritorialCoverageModuleProps {
  sectors: SectorCoverageMetric[];
  cesfamName: string;
}

export const TerritorialCoverageModule: React.FC<TerritorialCoverageModuleProps> = ({
  sectors,
  cesfamName
}) => {
  const getSectorBg = (name: string) => {
    switch (name) {
      case 'Verde': return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/30', fill: 'bg-emerald-500' };
      case 'Azul': return { text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-950/30', fill: 'bg-cyan-500' };
      case 'Rojo': return { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-950/30', fill: 'bg-rose-500' };
      case 'Amarillo': return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/30', fill: 'bg-amber-500' };
      default: return { text: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-900', fill: 'bg-slate-500' };
    }
  };

  const totalAssignedPop = sectors.reduce((acc, s) => acc + s.assignedPopulation, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Cobertura Territorial & Presión por Sectores
            </h3>
            <p className="text-[11px] text-slate-400">
              Distribución de población inscrita y capacidad asistencial en {cesfamName}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Población Inscrita Validada</span>
          <span className="text-xs font-black text-slate-100 font-mono">
            {totalAssignedPop.toLocaleString('es-CL')} Fonasa A/B/C/D
          </span>
        </div>
      </div>

      {/* Sector Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {sectors.map((sec) => {
          const style = getSectorBg(sec.sectorName);

          return (
            <div
              key={sec.sectorName}
              className={`p-3 rounded-xl border ${style.bg} ${style.border} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.fill}`}></span>
                    <span className={`text-xs font-bold ${style.text}`}>
                      Sector {sec.sectorName}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    sec.status === 'SATURADO' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    sec.status === 'PRECAUCION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {sec.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[9px] block">Población</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {sec.assignedPopulation.toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] block">En Espera</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {sec.waitingCount} pac.
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] block">Críticos Urg.</span>
                    <span className="font-bold text-rose-400 font-mono">
                      {sec.criticalCount} casos
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] block">Cupos/Sem.</span>
                    <span className="font-bold text-teal-300 font-mono">
                      {sec.weeklyCapacity} hrs
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between items-center text-[10px] font-semibold mb-1">
                  <span className="text-slate-400">Presión de Demanda</span>
                  <span className={sec.pressurePercentage > 80 ? 'text-rose-400' : 'text-teal-300'}>
                    {sec.pressurePercentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      sec.pressurePercentage > 80 ? 'bg-rose-500' : (sec.pressurePercentage > 65 ? 'bg-amber-500' : 'bg-teal-400')
                    }`}
                    style={{ width: `${Math.min(sec.pressurePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
