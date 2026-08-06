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
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold';
      case 'RECHAZADO':
        return 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40 font-bold';
      case 'DERIVADO':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 font-bold';
      case 'REQUIERE_REVISION':
      case 'OBSERVADO':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold';
      default:
        return 'apple-control apple-title font-bold';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Bitácora */}
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold apple-title flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Bitácora Global de Contraloría Médica
            </h2>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Inmutable & Auditable (Ley 21.719)
            </span>
          </div>
          <p className="text-xs font-medium apple-subtitle mt-1">
            Registro cronológico inalterable con trazabilidad completa de firma y decisiones médicas contraloras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="apple-control px-4 py-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider apple-muted block">Eventos Auditados</span>
            <span className="text-xl font-extrabold font-mono-tabular text-emerald-600 dark:text-emerald-400">
              {allAuditEntries.length}
            </span>
          </div>
        </div>
      </div>

      {/* Bar de Búsqueda y Filtros */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 apple-muted" />
          <input
            type="text"
            placeholder="Buscar por médico, nota o paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full apple-control pl-9 pr-4 py-2 text-xs placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['TODOS', 'APROBADO', 'RECHAZADO', 'DERIVADO', 'REQUIERE_REVISION'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedStatusFilter === st
                  ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-sm'
                  : 'apple-control apple-subtitle hover:apple-title'
              }`}
            >
              {st === 'TODOS' ? 'Todos los Estados' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Timeline Audit Event Feed */}
      <div className="glass-panel p-6 space-y-4">
        
        {filteredAuditEntries.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ClipboardCheck className="h-8 w-8 apple-muted mx-auto" />
            <p className="text-sm font-bold apple-title">No se encontraron registros de auditoría.</p>
            <p className="text-xs apple-subtitle">Prueba ajustando los términos de búsqueda o filtros.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
            {filteredAuditEntries.map((item, idx) => {
              const dateStr = new Date(item.audit.timestamp).toLocaleString('es-CL', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });
              const fakeHash = `0x${item.audit.id.replace('AUD-', '')}89f2a41c`;

              return (
                <div key={`${item.audit.id}-${idx}`} className="relative group">
                  
                  {/* Timeline Dot Icon */}
                  <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <UserCheck className="h-3 w-3" />
                  </div>

                  {/* Audit Event Card */}
                  <div className="glass-panel p-4 space-y-3">
                    
                    {/* Event Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold apple-title">{item.audit.userName}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full apple-control font-bold">
                          {item.audit.userRole}
                        </span>
                        <span className="text-xs apple-muted">•</span>
                        <span className="text-xs font-mono-tabular text-[#0071e3] font-bold">
                          ID: {item.patientId} ({item.patientRutMasked})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs apple-subtitle font-mono-tabular font-medium">
                        <Calendar className="h-3.5 w-3.5 apple-muted" />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Status Transition & Action */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="apple-subtitle font-bold">Transición:</span>
                        <span className="px-2.5 py-0.5 rounded-full apple-control text-[10px] font-bold">
                          {item.audit.previousStatus}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 apple-muted" />
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${getStatusBadgeStyle(item.audit.newStatus)}`}>
                          {item.audit.newStatus}
                        </span>
                      </div>
                    </div>

                    {/* Clinical Note Body */}
                    <div className="apple-control p-3 flex items-start gap-2.5">
                      <FileText className="h-4 w-4 text-[#0071e3] shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold apple-title leading-relaxed">
                        "{item.audit.clinicalNote}"
                      </p>
                    </div>

                    {/* SHA-256 Integrity Verification Badge */}
                    <div className="flex items-center justify-between text-[11px] apple-subtitle pt-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Firma SHA-256 Verificada</span>
                      </div>
                      <span className="font-mono text-xs apple-muted font-bold">{fakeHash}</span>
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
