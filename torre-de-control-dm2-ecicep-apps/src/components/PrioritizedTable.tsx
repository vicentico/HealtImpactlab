import React from 'react';
import { 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  AlertOctagon, 
  ChevronRight,
  UserCheck,
  Lock,
  HeartPulse,
  Flame
} from 'lucide-react';
import { Patient, FilterState, UserRole } from '../types';
import { getRoleInfo, formatDisplayName, formatDisplayRut } from '../lib/roles';

interface PrioritizedTableProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
  filters: FilterState;
  onUpdateFilters: (newFilters: Partial<FilterState>) => void;
  onQuickValidate: (patientId: string) => void;
  activeRole: UserRole | string;
  onRestrictedActionAttempt: (actionName: string) => void;
}

export const PrioritizedTable: React.FC<PrioritizedTableProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  filters,
  onUpdateFilters,
  onQuickValidate,
  activeRole,
  onRestrictedActionAttempt
}) => {
  const roleInfo = getRoleInfo(activeRole);
  // Sorting logic
  const sortedPatients = [...patients].sort((a, b) => {
    if (filters.sortBy === 'prioridad_actual') return a.currentPosition - b.currentPosition;
    if (filters.sortBy === 'prioridad_original') return a.originalPosition - b.originalPosition;
    if (filters.sortBy === 'dias_espera') return b.daysOnWaitlist - a.daysOnWaitlist;
    if (filters.sortBy === 'hba1c') return (b.clinicalFactors.hbA1c || 0) - (a.clinicalFactors.hbA1c || 0);
    if (filters.sortBy === 'riesgo_score') return b.clinicalRiskScore - a.clinicalRiskScore;
    if (filters.sortBy === 'cambio_posicion') return Math.abs(b.positionDelta) - Math.abs(a.positionDelta);
    return a.currentPosition - b.currentPosition;
  });

  const getRiskBadge = (level: Patient['clinicalRiskLevel']) => {
    switch (level) {
      case 'MUY_ALTA':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'ALTA':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIA':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'REVISION_INMEDIATA':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'PRIORIZADO_VALIDADO':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'AJUSTE_CONTRALOR':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DERIVADO_NIVEL_2':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'CITA_AGENDADA':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSectorBadge = (sector: Patient['sector']) => {
    switch (sector) {
      case 'Verde': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Azul': return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'Rojo': return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'Amarillo': return 'bg-amber-950 text-amber-300 border-amber-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col h-full">
      {/* Privacy Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Vista General de Gestión DM2:</strong> Mínimo necesario de datos visibles. RUT e identidad completa se reservan para la Ficha Lateral.
          </span>
        </div>
        <span className="text-[10px] text-teal-400/90 font-mono hidden sm:inline">Protección de Datos en Salud</span>
      </div>

      {/* Controls Header: Search, Filters & Sorting */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
            placeholder="Buscar por Cód. FCE, Iniciales, RUT parcial o Diagnóstico..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Risk Level Filter */}
          <select
            value={filters.riskLevel}
            onChange={(e) => onUpdateFilters({ riskLevel: e.target.value })}
            className="bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Riesgo: Todos</option>
            <option value="MUY_ALTA">Riesgo Muy Alto</option>
            <option value="ALTA">Riesgo Alto</option>
            <option value="MEDIA">Riesgo Medio</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onUpdateFilters({ status: e.target.value })}
            className="bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Estado: Todos</option>
            <option value="REVISION_INMEDIATA">Revisión Inmediata</option>
            <option value="PRIORIZADO_VALIDADO">Priorizado Validado</option>
            <option value="AJUSTE_CONTRALOR">Ajuste Contralor</option>
            <option value="DERIVADO_NIVEL_2">Derivado N2 Hospital</option>
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => onUpdateFilters({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-transparent text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="prioridad_actual" className="bg-slate-900">Orden: Prioridad ECICEP</option>
              <option value="hba1c" className="bg-slate-900">Orden: Mayor HbA1c (%)</option>
              <option value="dias_espera" className="bg-slate-900">Orden: Mayor Tiempo Espera</option>
              <option value="riesgo_score" className="bg-slate-900">Orden: Score de Riesgo</option>
              <option value="cambio_posicion" className="bg-slate-900">Orden: Mayor Salto (Delta)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider select-none sticky top-0 z-10">
              <th className="py-2.5 px-3">Prioridad / Delta</th>
              <th className="py-2.5 px-3">Identificador & Sector</th>
              <th className="py-2.5 px-3 text-center">Biomarcador (HbA1c %)</th>
              <th className="py-2.5 px-3 text-center">Brecha / Evento SAPU</th>
              <th className="py-2.5 px-3 text-center">Estratificación ECICEP</th>
              <th className="py-2.5 px-3">Cita Proyectada</th>
              <th className="py-2.5 px-3">Estado Contralor</th>
              <th className="py-2.5 px-3 text-right">Ficha Protegida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {sortedPatients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <AlertOctagon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-semibold">No se encontraron pacientes DM2 con los filtros seleccionados.</p>
                  <p className="text-xs text-slate-600 mt-1">Pruebe ajustando la búsqueda o el sector ECICEP.</p>
                </td>
              </tr>
            ) : (
              sortedPatients.map((p) => {
                const isSelected = p.id === selectedPatientId;
                const isDeltaUp = p.positionDelta > 0;
                const hbA1c = p.clinicalFactors.hbA1c || 8.0;
                const isHbA1cCritical = hbA1c >= 10.0;
                const hasRecentEvents = p.clinicalFactors.recentEmergencyEvents && p.clinicalFactors.recentEmergencyEvents.length > 0;

                const { nameDisplay, isPseudonymized } = formatDisplayName(p.name, p.initials, p.code, activeRole);
                const rutDisplay = formatDisplayRut(p.rut, p.partialRut, activeRole);

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-teal-950/40 border-l-4 border-teal-400 text-slate-100'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    {/* Position Delta */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold font-mono text-slate-100 w-6">
                          #{p.currentPosition}
                        </span>
                        {p.positionDelta !== 0 ? (
                          <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isDeltaUp ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isDeltaUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{isDeltaUp ? `+${p.positionDelta}` : p.positionDelta}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">0</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 block">antes #{p.originalPosition}</span>
                    </td>

                    {/* Patient & Sector (Data Minimization) */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span className={isPseudonymized ? "text-teal-300 font-mono text-xs" : "text-slate-100 text-xs"}>
                          {nameDisplay}
                        </span>
                        {isPseudonymized && (
                          <span className="text-[9px] bg-slate-800 text-teal-300 px-1 py-0.2 rounded border border-slate-700">
                            Seudonimizado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-400">{rutDisplay}</span>
                        <span className="text-[10px] text-slate-500">({p.age}a / {p.gender})</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getSectorBadge(p.sector)}`}>
                          {p.sector}
                        </span>
                      </div>
                    </td>

                    {/* Biomarker DM2: HbA1c */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {roleInfo.canSeeDetailedBiomarkers ? (
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-black font-mono border ${
                            isHbA1cCritical 
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            HbA1c {hbA1c}%
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                            {p.clinicalFactors.rac ? p.clinicalFactors.rac.split(' ')[0] : 'Normal'}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-purple-400" />
                            {isHbA1cCritical ? 'Meta Alterada' : 'Compensado'}
                          </span>
                          <span className="text-[9px] text-slate-500 italic mt-0.5">Reservado por perfil</span>
                        </div>
                      )}
                    </td>

                    {/* Control Breach & Emergency Events */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{p.controlBreachMonths}m desfasado</span>
                      </div>
                      {hasRecentEvents ? (
                        <div className="text-[9px] text-rose-400 font-bold flex items-center justify-center gap-0.5 mt-0.5">
                          <HeartPulse className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>Urgencia/SAPU Reciente</span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-500 block mt-0.5">Sin urgencias 30d</span>
                      )}
                    </td>

                    {/* ECICEP Tier & Score */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getRiskBadge(p.clinicalRiskLevel)}`}>
                          {p.ecicepTier ? p.ecicepTier.split('_')[0] : 'G2'} • {p.clinicalRiskScore} pts
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          {p.clinicalRiskLevel.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Estimated Appointment */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-200 text-[11px]">
                        {p.estimatedAppointmentDate}
                      </div>
                      <span className="text-[9px] text-teal-400 font-medium block">Citación ECICEP</span>
                    </td>

                    {/* Contralor Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border inline-block ${getStatusBadge(p.status)}`}>
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {!p.contralorValidation.isValidated ? (
                          <button
                            onClick={() => {
                              if (!roleInfo.canPerformContralorActions) {
                                onRestrictedActionAttempt('Validación Contralora de Priorización');
                              } else {
                                onQuickValidate(p.id);
                              }
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${
                              roleInfo.canPerformContralorActions
                                ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                            }`}
                            title={
                              roleInfo.canPerformContralorActions
                                ? "Validar priorización como Médico Contralor ECICEP"
                                : "Acción restringida a Médico Contralor autorizados"
                            }
                          >
                            {roleInfo.canPerformContralorActions ? (
                              <UserCheck className="w-3 h-3" />
                            ) : (
                              <Lock className="w-3 h-3 text-amber-400" />
                            )}
                            <span>Validar</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Validado
                          </span>
                        )}
                        <button
                          onClick={() => onSelectPatient(p.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Desplegar Ficha FCE Protegida"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div>
          Mostrando <strong className="text-slate-200">{sortedPatients.length}</strong> de <strong className="text-slate-200">{patients.length}</strong> personas con DM2 en seguimiento ECICEP.
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Validados: {patients.filter(p => p.contralorValidation.isValidated).length}
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span> Pendientes: {patients.filter(p => !p.contralorValidation.isValidated).length}
          </span>
        </div>
      </div>
    </div>
  );
};

