import React from 'react';
import { 
  X, 
  ShieldCheck, 
  History, 
  Download,
  Lock
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl overflow-hidden text-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Bitácora Inmutable de Trazabilidad & Auditoría DM2 ECICEP</h3>
              <p className="text-xs text-slate-400">Registro auditable de accesos a FCE, validaciones clínicas y ajustes de sobreagenda APS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security bar */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Confidencialidad Garantizada • Accesos registrados con sello de tiempo e IP</span>
          </div>

          <button
            onClick={() => alert('Exportando registro de trazabilidad en CSV/PDF auditado...')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Registro Auditable</span>
          </button>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
                <th className="py-2.5 px-3">Sello Tiempo</th>
                <th className="py-2.5 px-3">Persona (RUT Abreviado)</th>
                <th className="py-2.5 px-3">Acción Registrada</th>
                <th className="py-2.5 px-3">Operador / Rol</th>
                <th className="py-2.5 px-3">Detalle & Fundamentación Clínico-Administrativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 text-slate-300">
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-100">{log.patientName}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.patientRut}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{log.performedBy}</div>
                    <span className="text-[10px] text-slate-500">{log.role}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <p>{log.details}</p>
                    {log.contralorNote && (
                      <p className="text-[11px] text-amber-300/90 italic mt-0.5">
                        Obs. Contraloría: "{log.contralorNote}"
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500">
          <span>Servidor de auditoría de salud e integridad de registros FCE APS</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            Cerrar Bitácora
          </button>
        </div>
      </div>
    </div>
  );
};

