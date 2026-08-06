import React from 'react';
import { CapacitySummary, BoxCapacity, ReferralQuota } from '../types/capacity';
import { Building2, Clock, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface CapacityDashboardProps {
  capacityData: CapacitySummary | null;
  loading?: boolean;
}

export const CapacityDashboard: React.FC<CapacityDashboardProps> = ({ capacityData, loading }) => {
  if (loading || !capacityData) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center space-y-3">
        <Activity className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-300">Cargando métricas de capacidad de planta...</p>
      </div>
    );
  }

  const {
    totalBoxes,
    activeBoxes,
    totalWeeklyHours,
    occupiedWeeklyHours,
    boxUtilizationRate,
    referralQuotas,
    boxes
  } = capacityData;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Capacidad */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Capacidad de Planta & Cuotas de Red</h2>
            <span className="rounded bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
              CESFAM Carol Urzúa
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoreo en tiempo real de boxes disponibles, horas profesionales y topes de interconsulta hospitalaria.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-panel rounded-lg px-3.5 py-2 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Tasa de Ocupación</span>
            <span className={`text-lg font-bold font-mono-tabular ${boxUtilizationRate > 90 ? 'text-red-400' : boxUtilizationRate > 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {boxUtilizationRate}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards de Infraestructura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-cyan-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Boxes Clínicos Activos</span>
            <Building2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-white">
              {activeBoxes} <span className="text-sm font-normal text-slate-400">/ {totalBoxes}</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-medium">Infraestructura APS</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Horas Semanales Disponibles</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-blue-300">
              {occupiedWeeklyHours} <span className="text-sm font-normal text-slate-400">/ {totalWeeklyHours} hrs</span>
            </span>
            <span className="text-[10px] text-blue-400 font-medium">Capacidad FTE</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cuotas Diabetología Red</span>
            <Building2 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-purple-300">
              11 <span className="text-sm font-normal text-slate-400">/ 15 cupos</span>
            </span>
            <span className="text-[10px] text-purple-400 font-medium">H. San Borja Arriarán</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cuotas Pie Diabético Red</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-emerald-400">
              5 <span className="text-sm font-normal text-slate-400">/ 6 cupos</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">H. Barros Luco (HBLT)</span>
          </div>
        </div>

      </div>

      {/* Tablas de Detalle: Boxes y Topes de Derivación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabla de Boxes */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" />
              Estado de Boxes Clínicos (APS)
            </h3>
            <span className="text-xs text-slate-400">{boxes.length} Boxes Registrados</span>
          </div>

          <div className="divide-y divide-slate-800">
            {boxes.map((b: BoxCapacity) => {
              const boxRate = Math.round((b.currentWeeklyOccupancy / b.weeklyHoursCapacity) * 100);
              return (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Box N° {b.boxNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {b.boxType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{b.cesfamName}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      {b.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle className="h-3.5 w-3.5" /> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" /> Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono-tabular text-slate-300">
                      {b.currentWeeklyOccupancy} / {b.weeklyHoursCapacity} hrs ({boxRate}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabla de Topes de Derivación Hospitalaria */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Hospital className="h-4 w-4 text-purple-400" />
              Topes de Derivación a Red Hospitalaria (Quotas)
            </h3>
            <span className="text-xs text-slate-400">Mes: Agosto 2026</span>
          </div>

          <div className="space-y-4">
            {referralQuotas.map((q: ReferralQuota) => {
              const pct = Math.round((q.monthlyQuotaUsed / q.monthlyQuotaLimit) * 100);
              const isFull = q.monthlyQuotaUsed >= q.monthlyQuotaLimit;
              return (
                <div key={q.id} className="glass-panel p-3.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">{q.specialty.replace('_', ' ')}</span>
                      <p className="text-[11px] text-slate-400">{q.hospitalTarget}</p>
                    </div>
                    <span className={`text-xs font-bold font-mono-tabular ${isFull ? 'text-red-400' : pct > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {q.monthlyQuotaUsed} / {q.monthlyQuotaLimit} cupos ({pct}%)
                    </span>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all rounded-full ${isFull ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
