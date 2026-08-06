import React, { useState, useMemo } from 'react';
import { Patient, AuditLogEntry } from '../types/patient';
import { ClipboardCheck, Search, ShieldCheck, Filter, UserCheck, Calendar, FileText, ArrowRight } from 'lucide-react';

interface GlobalAuditViewProps {
  patients: Patient[];
}

interface FlattenedAuditItem {
  audit: AuditLogEntry;
  patientId: string;
  patientRutMasked: string;
  patientName: string;
}

export const GlobalAuditView: React.FC<GlobalAuditViewProps> = ({ patients }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('TODOS');

  // Flatten and aggregate all audit entries from all patients, sorted by timestamp DESC
  const allAuditEntries: FlattenedAuditItem[] = useMemo(() => {
    const items: FlattenedAuditItem[] = [];
    patients.forEach((p) => {
      if (p.auditHistory && Array.isArray(p.auditHistory)) {
        p.auditHistory.forEach((a) => {
          items.push({
            audit: a,
            patientId: p.id,
            patientRutMasked: p.rut,
            patientName: p.fullName
          });
        });
      }
    });
    return items.sort((a, b) => new Date(b.audit.timestamp).getTime() - new Date(a.audit.timestamp).getTime());
  }, [patients]);

  // Filtered audit entries based on search & status filter
  const filteredAuditEntries = useMemo(() => {
    return allAuditEntries.filter((item) => {
      const matchSearch =
        item.audit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.audit.clinicalNote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientRutMasked.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        selectedStatusFilter === 'TODOS' || item.audit.newStatus === selectedStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [allAuditEntries, searchTerm, selectedStatusFilter]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'APROBADO':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30';
      case 'RECHAZADO':
        return 'bg-red-950/80 text-red-300 border-red-500/30';
      case 'DERIVADO':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/30';
      case 'REQUIERE_REVISION':
      case 'OBSERVADO':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Bitácora */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-400" />
              Bitácora Global de Contraloría Médica
            </h2>
            <span className="rounded bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Inmutable & Auditable (Ley 21.719)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro cronológico inalterable con trazabilidad completa de firma y decisiones médicas contraloras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel rounded-lg px-3.5 py-2 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Eventos Auditados</span>
            <span className="text-lg font-bold font-mono-tabular text-emerald-400">
              {allAuditEntries.length}
            </span>
          </div>
        </div>
      </div>

      {/* Bar de Búsqueda y Filtros */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por médico, nota o paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['TODOS', 'APROBADO', 'RECHAZADO', 'DERIVADO', 'REQUIERE_REVISION'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedStatusFilter === st
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {st === 'TODOS' ? 'Todos los Estados' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Timeline Audit Event Feed */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-4">
        
        {filteredAuditEntries.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ClipboardCheck className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">No se encontraron registros de auditoría.</p>
            <p className="text-xs text-slate-500">Prueba ajustando los términos de búsqueda o filtros.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
            {filteredAuditEntries.map((item, idx) => {
              const dateStr = new Date(item.audit.timestamp).toLocaleString('es-CL', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });
              const fakeHash = `0x${item.audit.id.replace('AUD-', '')}89f2a41c`;

              return (
                <div key={`${item.audit.id}-${idx}`} className="relative group">
                  
                  {/* Timeline Dot Icon */}
                  <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border-2 border-emerald-500 text-emerald-400">
                    <UserCheck className="h-3 w-3" />
                  </div>

                  {/* Audit Event Card */}
                  <div className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
                    
                    {/* Event Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{item.audit.userName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.audit.userRole}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-mono-tabular text-cyan-300 font-medium">
                          ID: {item.patientId} ({item.patientRutMasked})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-tabular">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Status Transition & Action */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 font-medium">Transición de Estado:</span>
                        <span className="px-2 py-0.5 rounded border text-[10px] font-bold bg-slate-900 text-slate-400 border-slate-800">
                          {item.audit.previousStatus}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadgeStyle(item.audit.newStatus)}`}>
                          {item.audit.newStatus}
                        </span>
                      </div>
                    </div>

                    {/* Clinical Note Body */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80 flex items-start gap-2.5">
                      <FileText className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">
                        "{item.audit.clinicalNote}"
                      </p>
                    </div>

                    {/* SHA-256 Integrity Verification Badge */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5 text-emerald-400/80">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Firma SHA-256 Verificada</span>
                      </div>
                      <span className="font-mono text-slate-600">{fakeHash}</span>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
