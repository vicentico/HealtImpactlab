import React from 'react';
import { CapacityMetrics } from '../types';
import { Users, Calendar, AlertOctagon, Activity, TrendingUp, Info } from 'lucide-react';

interface CapacityPressureProps {
  metrics: CapacityMetrics;
}

export const CapacityPressureModule: React.FC<CapacityPressureProps> = ({ metrics }) => {
  const isSaturated = metrics.assistancePressurePercentage > 100;
  const isWarning = metrics.assistancePressurePercentage >= 80 && !isSaturated;

  return (
    <div id="capacity-pressure-module" className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">Capacidad Operativa y Presión Asistencial Red Salud</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real de la oferta de agendamiento hospitalario frente a la demanda de pacientes en lista de espera.
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {isSaturated && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              Saturación Crítica ({metrics.assistancePressurePercentage}%)
            </span>
          )}
          {isWarning && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
              Presión Alta ({metrics.assistancePressurePercentage}%)
            </span>
          )}
          {!isSaturated && !isWarning && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Capacidad Balanceada ({metrics.assistancePressurePercentage}%)
            </span>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        
        {/* Demanda Total en Espera */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Demanda Activa</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalDemand}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Pacientes en lista de espera</p>
        </div>

        {/* Oferta de Cupos Semanales */}
        <div className="bg-emerald-50/60 rounded-lg p-3.5 border border-emerald-200/60">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium mb-1">
            <span>Oferta Semanal</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-950">{metrics.weeklyCapacitySlots} <span className="text-xs font-normal text-emerald-700">cupos/sem</span></div>
          <p className="text-[11px] text-emerald-800 mt-0.5">~{metrics.monthlyCapacitySlots} cupos al mes</p>
        </div>

        {/* Pacientes Críticos + Altos */}
        <div className="bg-rose-50/60 rounded-lg p-3.5 border border-rose-200/60">
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium mb-1">
            <span>Demanda Crítica / Alta</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-950">{metrics.criticalPatientsCount} <span className="text-xs font-normal text-rose-700">pacientes</span></div>
          <p className="text-[11px] text-rose-800 mt-0.5">Requieren atención prioritaria</p>
        </div>

        {/* Brecha / Déficit de Cupos */}
        <div className={`rounded-lg p-3.5 border ${metrics.breachSlots < 0 ? 'bg-rose-100/80 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs font-medium mb-1 text-slate-600">
            <span>Brecha de Capacidad</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className={`text-2xl font-bold ${metrics.breachSlots < 0 ? 'text-rose-900' : 'text-slate-900'}`}>
            {metrics.breachSlots < 0 ? `${metrics.breachSlots}` : `+${metrics.breachSlots}`}
            <span className="text-xs font-normal ml-1">cupos</span>
          </div>
          <p className={`text-[11px] mt-0.5 ${metrics.breachSlots < 0 ? 'text-rose-800 font-medium' : 'text-slate-500'}`}>
            {metrics.breachSlots < 0 ? 'Déficit semanal frente a riesgo' : 'Superávit semanal estimado'}
          </p>
        </div>

      </div>

      {/* Visual Bar: Weekly Slots vs Critical Patients */}
      <div className="mb-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200/70">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
          <span>Relación: Cupos Disponibles esta Semana vs. Pacientes de Riesgo Crítico/Alto</span>
          <span>
            {metrics.weeklyCapacitySlots} Cupos dispon. / {metrics.criticalPatientsCount} Pacientes críticos
          </span>
        </div>
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
          {/* Covered portion */}
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (metrics.weeklyCapacitySlots / Math.max(1, metrics.criticalPatientsCount)) * 100)}%`
            }}
            title="Cupos disponibles"
          ></div>
          {/* Uncovered deficit portion */}
          {metrics.criticalPatientsCount > metrics.weeklyCapacitySlots && (
            <div
              className="bg-rose-500 h-full transition-all duration-500 animate-pulse"
              style={{
                width: `${Math.min(100, ((metrics.criticalPatientsCount - metrics.weeklyCapacitySlots) / metrics.criticalPatientsCount) * 100)}%`
              }}
              title="Pacientes críticos en espera sin cupo esta semana"
            ></div>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Atenciones aseguradas esta semana ({Math.min(metrics.weeklyCapacitySlots, metrics.criticalPatientsCount)})
          </span>
          {metrics.criticalPatientsCount > metrics.weeklyCapacitySlots && (
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              {metrics.criticalPatientsCount - metrics.weeklyCapacitySlots} pacientes críticos deberán esperar a la siguiente semana
            </span>
          )}
        </div>
      </div>

      {/* Explanatory Calculation Summary */}
      <div className="bg-sky-50/80 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-sky-950">Justificación Técnica de Presión Asistencial:</strong>{' '}
          {metrics.explanationSummary}
        </div>
      </div>
    </div>
  );
};
