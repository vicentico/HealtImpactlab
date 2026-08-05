import React from 'react';
import { RefreshCw, Play, UploadCloud, RotateCcw, Building2, Stethoscope, Hash, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '../types';

interface ActionBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  weeklySlots: number;
  onSlotsChange: (slots: number) => void;
  onCalculatePrioritization: () => void;
  onResetOrder: () => void;
  onOpenLoadModal: () => void;
  isCalculating: boolean;
  healthCenterOptions: string[];
  specialtyOptions: string[];
}

export const ActionBar: React.FC<ActionBarProps> = ({
  filters,
  onFilterChange,
  weeklySlots,
  onSlotsChange,
  onCalculatePrioritization,
  onResetOrder,
  onOpenLoadModal,
  isCalculating,
  healthCenterOptions,
  specialtyOptions,
}) => {
  return (
    <div id="action-bar-container" className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cargar lista clínica */}
            <button
              id="btn-load-clinical-list"
              onClick={onOpenLoadModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer active:scale-98"
            >
              <UploadCloud className="w-4 h-4 text-slate-600" />
              <span>Cargar Lista Clínica</span>
            </button>

            {/* Calcular priorización */}
            <button
              id="btn-calculate-prioritization"
              onClick={onCalculatePrioritization}
              disabled={isCalculating}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md text-white transition-all shadow-sm cursor-pointer active:scale-98 ${
                isCalculating
                  ? 'bg-sky-400 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800'
              }`}
            >
              <Play className={`w-4 h-4 fill-current ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'Calculando Algoritmo...' : 'Calcular Priorización'}</span>
            </button>

            {/* Restablecer orden original */}
            <button
              id="btn-reset-order"
              onClick={onResetOrder}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
              title="Limpiar filtros y restaurar el orden de llegada original de la lista"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Orden Original</span>
            </button>
          </div>

          {/* Selectors and Slot Capacity Control */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Selector de Centro de Salud */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                id="select-health-center"
                value={filters.healthCenter}
                onChange={(e) => onFilterChange({ ...filters, healthCenter: e.target.value })}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="TODOS">Todos los Centros Hospitalarios</option>
                {healthCenterOptions.map((center) => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Especialidad */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs">
              <Stethoscope className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                id="select-specialty"
                value={filters.specialty}
                onChange={(e) => onFilterChange({ ...filters, specialty: e.target.value })}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="TODAS">Todas las Especialidades</option>
                {specialtyOptions.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Controls para Cupos Disponibles / Semana */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-md px-3 py-1 text-xs text-emerald-900">
              <div className="flex items-center gap-1 font-semibold text-emerald-800">
                <Hash className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cupos Disponibles / Semana:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id="btn-decrement-slots"
                  onClick={() => onSlotsChange(Math.max(1, weeklySlots - 1))}
                  className="w-6 h-6 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center transition-colors cursor-pointer"
                  title="Disminuir cupos de atención por semana"
                >
                  -
                </button>
                <span className="w-7 text-center font-bold text-sm text-emerald-950">
                  {weeklySlots}
                </span>
                <button
                  id="btn-increment-slots"
                  onClick={() => onSlotsChange(weeklySlots + 1)}
                  className="w-6 h-6 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center transition-colors cursor-pointer"
                  title="Aumentar cupos de atención por semana"
                >
                  +
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
