import React from 'react';
import { 
  Upload, 
  RotateCw, 
  FileSpreadsheet, 
  ShieldCheck, 
  Building2, 
  Filter,
  Lock,
  UserCheck,
  EyeOff
} from 'lucide-react';
import { DATASET_PRESETS } from '../data/mockPatients';
import { UserRole } from '../types';
import { USER_ROLES_CONFIG, getRoleInfo } from '../lib/roles';

interface HeaderProps {
  selectedDataset: string;
  onSelectDataset: (presetId: string) => void;
  selectedSector: string;
  onSelectSector: (sector: string) => void;
  onOpenLoadModal: () => void;
  onRecalculatePriorities: () => void;
  onExportReport: () => void;
  onOpenAuditLog: () => void;
  isRecalculating: boolean;
  activeRole: UserRole | string;
  onSelectRole: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDataset,
  onSelectDataset,
  selectedSector,
  onSelectSector,
  onOpenLoadModal,
  onRecalculatePriorities,
  onExportReport,
  onOpenAuditLog,
  isRecalculating,
  activeRole,
  onSelectRole
}) => {
  const currentRoleInfo = getRoleInfo(activeRole);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 text-slate-100 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Description */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Torre de Control DM2 – ECICEP APS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              Gestión de Casos & Confidencialidad
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${currentRoleInfo.badgeClass}`}>
              <UserCheck className="w-3 h-3" />
              <span>Rol: {currentRoleInfo.label}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Estrategia de Cuidado Integral Centrado en la Persona para Diabetes Mellitus Tipo 2.</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-teal-400/90 font-medium flex items-center gap-1">
              <EyeOff className="w-3 h-3 text-teal-400" />
              {currentRoleInfo.canSeeFullIdentity ? 'Acceso Clínico Identificado (RBAC)' : 'Seudonimización Activa (Mínimo Necesario)'}
            </span>
          </p>
        </div>

        {/* Center Selectors: CESFAM, Sector, and Role Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* CESFAM Center Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Centro CESFAM</span>
              <select
                value={selectedDataset}
                onChange={(e) => onSelectDataset(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                {DATASET_PRESETS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sector Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sector ECICEP</span>
              <select
                value={selectedSector}
                onChange={(e) => onSelectSector(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="TODOS" className="bg-slate-900">Todos los Sectores (Transversal)</option>
                <option value="Verde" className="bg-slate-900">Sector Verde (Población 14.2k)</option>
                <option value="Azul" className="bg-slate-900">Sector Azul (Población 12.8k)</option>
                <option value="Rojo" className="bg-slate-900">Sector Rojo (Población 15.1k)</option>
                <option value="Amarillo" className="bg-slate-900">Sector Amarillo (Población 9.5k)</option>
              </select>
            </div>
          </div>

          {/* Role Switcher in Header */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="block text-[9px] font-semibold text-purple-400 uppercase tracking-wider">Perfil Usuario (RBAC)</span>
              <select
                value={activeRole}
                onChange={(e) => onSelectRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                {Object.values(USER_ROLES_CONFIG).map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cargar Lista */}
          <button
            onClick={onOpenLoadModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors shadow-sm"
            title="Importar lista desde RAYEN FCE o plantilla CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-300" />
            <span>Cargar FCE</span>
          </button>

          {/* Priorizar Casos (Recalculate) */}
          <button
            onClick={onRecalculatePriorities}
            disabled={isRecalculating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all shadow-md shadow-teal-900/30 disabled:opacity-50"
            title="Ejecutar algoritmo de priorización ECICEP DM2"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Analizando DM2...' : 'Priorizar DM2'}</span>
          </button>

          {/* Exportar */}
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors shadow-sm"
            title="Exportar informe de gestión clinico-operativa sin sobreexposición de datos"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Informe</span>
          </button>

          {/* Bitácora de Trazabilidad */}
          <button
            onClick={onOpenAuditLog}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            title="Bitácora auditable de decisiones del contralor"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Bitácora</span>
          </button>
        </div>
      </div>
    </header>
  );
};

