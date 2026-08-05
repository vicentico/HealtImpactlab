import React from 'react';
import { ShieldAlert, Lock, AlertTriangle, X, UserCheck } from 'lucide-react';
import { UserRole } from '../types';
import { getRoleInfo } from '../lib/roles';

interface AccessRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionAttempted: string;
  activeRole: UserRole | string;
  onSwitchToContralor?: () => void;
}

export const AccessRestrictedModal: React.FC<AccessRestrictedModalProps> = ({
  isOpen,
  onClose,
  actionAttempted,
  activeRole,
  onSwitchToContralor
}) => {
  if (!isOpen) return null;

  const roleInfo = getRoleInfo(activeRole);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Acceso Restringido por Perfil</h3>
              <p className="text-[11px] text-slate-400">Control de Acceso basado en Roles (RBAC)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Acción Solicitada:</span>
              <span className="text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                {actionAttempted}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-800">
              <span className="text-slate-400">Su Perfil Activo:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${roleInfo.badgeColor}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Privacidad & Seguridad de Datos Sanitaros</span>
            </div>
            <p className="leading-relaxed">
              La acción intentada requiere permisos de <strong>Médico Contralor / Gestor de Casos</strong>. 
              Su perfil actual sólo cuenta con visualización restringida o seudonimizada en conformidad con la Ley N° 20.584 y Ley N° 21.719 de Protección de Datos Personales.
            </p>
          </div>

          <div className="text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-tight">
            <strong>Mínima Exposición de Datos:</strong> Todas las consultas y acciones son registradas con firma digital y sello de tiempo en la bitácora auditable.
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-2">
          {onSwitchToContralor && (
            <button
              onClick={() => {
                onSwitchToContralor();
                onClose();
              }}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Cambiar a Perfil Contralor</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
