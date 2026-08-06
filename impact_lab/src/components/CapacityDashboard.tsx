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
      <div className="glass-panel p-8 text-center space-y-3">
        <Activity className="h-8 w-8 text-[#0071e3] animate-spin mx-auto" />
        <p className="text-sm font-bold apple-title">Cargando métricas de capacidad de planta...</p>
      </div>
    );
  }

  const {
    totalBoxes = 0,
    activeBoxes = 0,
    totalWeeklyHours = 0,
    occupiedWeeklyHours = 0,
    boxUtilizationRate = 0,
    referralQuotas = [],
    boxes = []
  } = capacityData || {};

  return (
    <div className="space-y-6">
      
      {/* Top Banner Capacidad */}
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold apple-title">Capacidad de Planta & Cuotas de Red</h2>
            <span className="rounded-full bg-[#0071e3]/10 border border-[#0071e3]/30 px-3 py-0.5 text-xs font-bold text-[#0071e3] dark:text-cyan-400">
              CESFAM Carol Urzúa
            </span>
          </div>
          <p className="text-xs font-medium apple-subtitle mt-1">
            Monitoreo en tiempo real de boxes disponibles, horas profesionales y topes de interconsulta hospitalaria.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="apple-control px-4 py-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider apple-muted block">Tasa de Ocupación</span>
            <span className={`text-xl font-extrabold font-mono-tabular ${boxUtilizationRate > 90 ? 'text-red-600 dark:text-red-400' : boxUtilizationRate > 75 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {boxUtilizationRate}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards de Infraestructura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 border-l-4 border-l-[#0071e3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold apple-subtitle">Boxes Clínicos Activos</span>
            <Building2 className="h-4 w-4 text-[#0071e3]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono-tabular apple-title">
              {activeBoxes} <span className="text-sm font-normal apple-muted">/ {totalBoxes}</span>
            </span>
            <span className="text-xs text-[#0071e3] font-bold">Infraestructura APS</span>
          </div>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold apple-subtitle">Horas Semanales Disponibles</span>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono-tabular text-blue-600 dark:text-blue-300">
              {occupiedWeeklyHours} <span className="text-sm font-normal apple-muted">/ {totalWeeklyHours} hrs</span>
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Capacidad FTE</span>
          </div>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold apple-subtitle">Cuotas Diabetología Red</span>
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono-tabular text-purple-700 dark:text-purple-300">
              11 <span className="text-sm font-normal apple-muted">/ 15 cupos</span>
            </span>
            <span className="text-xs text-purple-700 dark:text-purple-400 font-bold">H. San Borja Arriarán</span>
          </div>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold apple-subtitle">Cuotas Pie Diabético Red</span>
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono-tabular text-emerald-700 dark:text-emerald-400">
              5 <span className="text-sm font-normal apple-muted">/ 6 cupos</span>
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">H. Barros Luco (HBLT)</span>
          </div>
        </div>

      </div>

      {/* Tablas de Detalle: Boxes y Topes de Derivación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabla de Boxes */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold apple-title flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#0071e3]" />
              Estado de Boxes Clínicos (APS)
            </h3>
            <span className="text-xs font-bold apple-subtitle">{boxes.length} Boxes Registrados</span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {boxes.map((b: BoxCapacity) => {
              const boxRate = Math.round((b.currentWeeklyOccupancy / b.weeklyHoursCapacity) * 100);
              return (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold apple-title">Box N° {b.boxNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md apple-control font-bold">
                        {b.boxType}
                      </span>
                    </div>
                    <p className="text-xs apple-subtitle font-medium">{b.cesfamName}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-2">
                      {b.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle className="h-3.5 w-3.5" /> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-bold">
                          <AlertCircle className="h-3.5 w-3.5" /> Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono-tabular font-bold apple-title">
                      {b.currentWeeklyOccupancy} / {b.weeklyHoursCapacity} hrs ({boxRate}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabla de Topes de Derivación Hospitalaria */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold apple-title flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Topes de Derivación a Red Hospitalaria (Quotas)
            </h3>
            <span className="text-xs font-bold apple-subtitle">Mes: Agosto 2026</span>
          </div>

          <div className="space-y-3.5">
            {referralQuotas.map((q: ReferralQuota) => {
              const pct = Math.round((q.monthlyQuotaUsed / q.monthlyQuotaLimit) * 100);
              const isFull = q.monthlyQuotaUsed >= q.monthlyQuotaLimit;
              return (
                <div key={q.id} className="glass-panel p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold apple-title">{q.specialty.replace('_', ' ')}</span>
                      <p className="text-[11px] font-medium apple-subtitle">{q.hospitalTarget}</p>
                    </div>
                    <span className={`text-xs font-bold font-mono-tabular ${isFull ? 'text-red-600 dark:text-red-400' : pct > 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {q.monthlyQuotaUsed} / {q.monthlyQuotaLimit} cupos ({pct}%)
                    </span>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
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
