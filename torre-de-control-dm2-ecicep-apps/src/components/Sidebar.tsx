import React from 'react';
import { 
  LayoutDashboard, 
  ListFilter, 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  History, 
  Users, 
  Settings, 
  Stethoscope, 
  Building2, 
  ChevronDown,
  CircleDot,
  HeartPulse,
  Lock,
  Eye,
  Calendar,
  FileText
} from 'lucide-react';
import { UserRole } from '../types';
import { getRoleInfo, USER_ROLES_CONFIG } from '../lib/roles';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole | string;
  setActiveRole: (role: UserRole | string) => void;
  cesfamName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  cesfamName
}) => {
  const roleInfo = getRoleInfo(activeRole);

  // Define role-specific menu items
  const getMenuItems = () => {
    switch (roleInfo.id) {
      case 'MEDICO_CONTRALOR':
        return [
          { id: 'resumen', label: 'Torre DM2 ECICEP', icon: LayoutDashboard },
          { id: 'lista', label: 'Casos DM2 Priorizados', icon: ListFilter, badge: '842' },
          { id: 'criticos', label: 'Descompensados Severos', icon: AlertTriangle, badge: '68', badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
          { id: 'eventos', label: 'Eventos Urgencia/SAPU', icon: HeartPulse, badge: '24', badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
          { id: 'brechas', label: 'Brechas de Control ECICEP', icon: Activity, badge: '142' },
          { id: 'contraloria', label: 'Contraloría & Gestor Casos', icon: ShieldCheck, badge: 'Auditable' },
          { id: 'trazabilidad', label: 'Bitácora de Trazabilidad', icon: History },
          { id: 'configuracion', label: 'Configuración Parámetros', icon: Settings }
        ];

      case 'MEDICO_APS':
        return [
          { id: 'resumen', label: 'Torre DM2 ECICEP', icon: LayoutDashboard },
          { id: 'lista', label: 'Fichas Pacientes Sector', icon: Stethoscope, badge: '842' },
          { id: 'criticos', label: 'Descompensados Severos', icon: AlertTriangle, badge: '68', badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
          { id: 'eventos', label: 'Eventos Urgencia/SAPU', icon: HeartPulse, badge: '24', badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
          { id: 'brechas', label: 'Pacientes Desfasados', icon: Activity, badge: '142' },
          { id: 'configuracion', label: 'Configuración Cabecera', icon: Settings }
        ];

      case 'ENFERMERIA_APS':
        return [
          { id: 'resumen', label: 'Torre DM2 ECICEP', icon: LayoutDashboard },
          { id: 'lista', label: 'Seguimiento & Glicemias', icon: ListFilter, badge: 'Seudonimizado' },
          { id: 'criticos', label: 'Descompensados Triaje', icon: AlertTriangle, badge: '68', badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
          { id: 'brechas', label: 'Pacientes sin Control', icon: Activity, badge: '142' },
          { id: 'configuracion', label: 'Configuración Enfermería', icon: Settings }
        ];

      case 'ADMINISTRATIVO':
        return [
          { id: 'resumen', label: 'Capacidad & Espera APS', icon: LayoutDashboard },
          { id: 'lista', label: 'Gestión Lista & Citas', icon: Calendar, badge: 'Protegido' },
          { id: 'brechas', label: 'Citas Pendientes Agendamiento', icon: Activity, badge: '142' },
          { id: 'configuracion', label: 'Configuración Cupos', icon: Settings }
        ];

      case 'AUDITOR_LECTURA':
      default:
        return [
          { id: 'resumen', label: 'Vista Auditoría General', icon: LayoutDashboard },
          { id: 'lista', label: 'Muestra Auditada DM2', icon: Eye, badge: 'Solo Lectura' },
          { id: 'trazabilidad', label: 'Bitácora Auditable ANCI/APDP', icon: History, badge: 'Firma OK' },
          { id: 'configuracion', label: 'Parámetros Normativos', icon: Settings }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 text-slate-200 select-none">
      {/* CESFAM Identity Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-semibold tracking-wider text-teal-400 uppercase">
              Torre Control DM2
            </h1>
            <p className="text-sm font-bold text-slate-100 truncate" title={cesfamName}>
              {cesfamName}
            </p>
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="mt-3 px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CircleDot className="w-3 h-3 animate-pulse" />
            <span>FCE Conectado (RAYEN)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ECICEP-APS</span>
        </div>
      </div>

      {/* Active Role Informational Card (Sin control duplicado) */}
      <div className="px-3 py-3 border-b border-slate-800 bg-slate-950/70 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Perfil Activo
          </span>
          <span className="text-[9px] text-teal-400 font-mono font-bold">RBAC Ley 21.719</span>
        </div>

        {/* Role Badge Indicator (Información Estática) */}
        <div className={`p-2.5 rounded-lg border text-[11px] font-semibold space-y-1 ${roleInfo.badgeColor}`}>
          <div className="flex items-center justify-between">
            <span className="font-extrabold">{roleInfo.label}</span>
            <Lock className="w-3.5 h-3.5 shrink-0 opacity-80" />
          </div>
          <p className="text-[10px] opacity-90 leading-tight font-normal">
            {roleInfo.description}
          </p>
        </div>
        <p className="text-[9px] text-slate-500 px-1 font-medium italic">
          Selección de perfil activa en barra superior.
        </p>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="px-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Módulos DM2 & ECICEP</span>
          <span className="text-[9px] text-slate-400 font-mono">Vistas Perfil</span>
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Privacy Microcopy Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px] uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          <span>Privacidad por Diseño</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Información visible según rol autorizado. Seudonimización en vistas generales.
        </p>
      </div>
    </aside>
  );
};


