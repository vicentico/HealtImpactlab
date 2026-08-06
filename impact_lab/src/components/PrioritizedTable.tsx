import React, { useState } from 'react';
import { Patient, CESFAMSector, ContraloriaStatus, RiskLevel } from '../types/patient';
import { maskRut } from '../utils/privacy';
import { 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  ChevronRight, 
  ShieldAlert, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface PrioritizedTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const PrioritizedTable: React.FC<PrioritizedTableProps> = ({
  patients,
  onSelectPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isPrivacyMaskEnabled, setIsPrivacyMaskEnabled] = useState<boolean>(true);

  // Filtering Logic
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = 
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.rut.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === 'ALL' || patient.sector === selectedSector;
    const matchesRisk = selectedRisk === 'ALL' || patient.nt118Risk.riskLevel === selectedRisk;
    const matchesStatus = selectedStatus === 'ALL' || patient.contraloriaStatus === selectedStatus;

    return matchesSearch && matchesSector && matchesRisk && matchesStatus;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICO':
        return <span className="inline-flex items-center gap-1 rounded-md bg-red-950/80 border border-red-500/50 px-2 py-0.5 text-[11px] font-bold text-red-300 shadow-sm"><ShieldAlert className="h-3 w-3 text-red-400" /> CRÍTICO</span>;
      case 'ALTO':
        return <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 text-[11px] font-bold text-amber-300">ALTO</span>;
      case 'MEDIO':
        return <span className="inline-flex items-center gap-1 rounded-md bg-cyan-950/80 border border-cyan-500/50 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">MEDIO</span>;
      case 'BAJO':
        return <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 border border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-400">BAJO</span>;
    }
  };

  const getStatusBadge = (status: ContraloriaStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">PENDIENTE</span>;
      case 'APROBADO':
        return <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">APROBADO</span>;
      case 'REQUIERE_REVISION':
        return <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400">EXÁMENES REQ.</span>;
      case 'OBSERVADO':
        return <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">OBSERVADO</span>;
    }
  };

  const getSectorBadge = (sector: CESFAMSector) => {
    switch (sector) {
      case 'SECTOR_ROJO':
        return <span className="text-[10px] font-semibold text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded">Rojo</span>;
      case 'SECTOR_VERDE':
        return <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">Verde</span>;
      case 'SECTOR_AZUL':
        return <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded">Azul</span>;
      case 'SECTOR_AMARILLO':
        return <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded">Amarillo</span>;
    }
  };

  const renderTrend = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) {
      return (
        <span className="flex items-center text-xs font-semibold text-red-400" title={`Subió ${diff} puestos en prioridad`}>
          <ArrowUp className="h-3.5 w-3.5" /> +{diff}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-xs font-semibold text-emerald-400" title={`Bajó ${Math.abs(diff)} puestos`}>
          <ArrowDown className="h-3.5 w-3.5" /> {diff}
        </span>
      );
    }
    return <Minus className="h-3 w-3 text-slate-500" />;
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      
      {/* Table Filters & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 apple-muted" />
          <input
            type="text"
            placeholder="Buscar por RUT o Nombre del Paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full apple-control pl-9 pr-4 py-2 text-xs placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Dropdowns & Privacy Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Privacy Toggle */}
          <button
            onClick={() => setIsPrivacyMaskEnabled(!isPrivacyMaskEnabled)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isPrivacyMaskEnabled
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                : 'apple-control apple-subtitle hover:apple-title'
            }`}
            title="Privacy by Design: Enmascara el RUT en vistas masivas"
          >
            {isPrivacyMaskEnabled ? <EyeOff className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{isPrivacyMaskEnabled ? 'Privacidad: RUT Enmascarado' : 'Mostrar RUT'}</span>
          </button>

          <div className="flex items-center gap-1.5 apple-control px-3 py-1.5 text-xs font-medium">
            <Filter className="h-3.5 w-3.5 apple-muted" />
            <span className="apple-muted">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-transparent font-semibold apple-title focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Sectores</option>
              <option value="SECTOR_ROJO">Sector Rojo</option>
              <option value="SECTOR_VERDE">Sector Verde</option>
              <option value="SECTOR_AZUL">Sector Azul</option>
              <option value="SECTOR_AMARILLO">Sector Amarillo</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 apple-control px-3 py-1.5 text-xs font-medium">
            <span className="apple-muted">Riesgo:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-transparent font-semibold apple-title focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Niveles</option>
              <option value="CRITICO">Crítico</option>
              <option value="ALTO">Alto</option>
              <option value="MEDIO">Medio</option>
              <option value="BAJO">Bajo</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 apple-control px-3 py-1.5 text-xs font-medium">
            <span className="apple-muted">Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold apple-title focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="APROBADO">Aprobado</option>
              <option value="REQUIERE_REVISION">Exámenes Req.</option>
              <option value="OBSERVADO">Observado</option>
            </select>
          </div>
        </div>

      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs apple-title">
          <thead className="bg-slate-100 dark:bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider apple-subtitle border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Prioridad IA</th>
              <th className="py-3.5 px-4">Paciente / RUT</th>
              <th className="py-3.5 px-4">Sector</th>
              <th className="py-3.5 px-4">HbA1c / PA</th>
              <th className="py-3.5 px-4">VFG Renal</th>
              <th className="py-3.5 px-4">Puntaje NT 118</th>
              <th className="py-3.5 px-4">Días Lista</th>
              <th className="py-3.5 px-4">Estado Contraloría</th>
              <th className="py-3.5 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 apple-muted">
                  No se encontraron pacientes que coincidan con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr 
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  
                  {/* Position & Trend */}
                  <td className="py-3.5 px-4 font-mono-tabular">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 dark:bg-slate-800 font-bold apple-title group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        #{patient.priorityPosition}
                      </span>
                      {renderTrend(patient.priorityPosition, patient.previousPriorityPosition)}
                    </div>
                  </td>

                  {/* Patient Info with Privacy Masking */}
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-bold apple-title group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{patient.fullName}</p>
                      <p className="text-[10px] font-mono-tabular apple-subtitle">
                        {isPrivacyMaskEnabled ? maskRut(patient.rut) : patient.rut} • {patient.age} años ({patient.gender})
                      </p>
                    </div>
                  </td>

                  {/* Sector */}
                  <td className="py-3.5 px-4">
                    {getSectorBadge(patient.sector)}
                  </td>

                  {/* Clinical Parameters */}
                  <td className="py-3.5 px-4 font-mono-tabular">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${patient.hba1c >= 10.0 ? 'text-red-600 dark:text-red-400' : patient.hba1c >= 9.0 ? 'text-amber-600 dark:text-amber-400' : 'apple-title'}`}>
                          HbA1c {patient.hba1c}%
                        </span>
                        {patient.hasFootUlcer && (
                          <span className="rounded bg-red-500/10 text-red-600 dark:text-red-300 text-[9px] px-1 font-sans border border-red-500/30" title="Pie Diabético Activo">Pie!</span>
                        )}
                      </div>
                      <p className="text-[10px] apple-subtitle">PA: {patient.systolicBP}/{patient.diastolicBP} mmHg</p>
                    </div>
                  </td>

                  {/* VFG Renal */}
                  <td className="py-3.5 px-4 font-mono-tabular">
                    <span className={`font-semibold ${patient.vfg < 45 ? 'text-red-600 dark:text-red-400 font-bold' : patient.vfg < 60 ? 'text-amber-600 dark:text-amber-300' : 'apple-subtitle'}`}>
                      {patient.vfg} <span className="text-[9px] font-normal apple-muted">mL/min</span>
                    </span>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular font-bold text-slate-100">{patient.nt118Risk.totalScore} pts</span>
                      {getRiskBadge(patient.nt118Risk.riskLevel)}
                    </div>
                  </td>

                  {/* Days in List */}
                  <td className="py-3.5 px-4 font-mono-tabular text-slate-300">
                    <div className="flex items-center gap-1">
                      <span>{patient.daysInWaitingList} d</span>
                      {patient.daysInWaitingList > 120 && (
                        <span title="Garantía GES / Plazo Excedido">
                          <AlertCircle className="h-3 w-3 text-amber-400" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Contraloría Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(patient.contraloriaStatus)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(patient);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white px-2.5 py-1 text-[11px] font-semibold text-cyan-400 transition-colors"
                    >
                      <span>Abrir Ficha</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Privacy Microcopy Banner */}
      <div className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-slate-800/80 px-3 py-2 text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-cyan-400" />
          <span>Información de salud tratada con confidencialidad para uso exclusivo de equipos autorizados. Acceso registrado e inmutable.</span>
        </div>
        <span className="hidden sm:inline text-slate-500 font-mono-tabular">Ley 20.584 Compliant</span>
      </div>

    </div>
  );
};
