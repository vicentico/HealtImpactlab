import React from 'react';
import { Activity, ShieldCheck, Bell, User, RefreshCw, Shield, Sun, Moon, Laptop } from 'lucide-react';
import { UserRole } from '../types/capacity';

export type AppTheme = 'light' | 'dark' | 'system';

interface HeaderProps {
  cesfamName: string;
  onCesfamChange: (name: string) => void;
  pendingCount: number;
  criticalCount: number;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cesfamName,
  onCesfamChange,
  pendingCount,
  criticalCount,
  activeRole,
  onRoleChange,
  theme,
  onThemeChange
}) => {
  return (
    <header className="glass-panel sticky top-0 z-30 border-b px-6 py-3.5 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Torre de Control APS</h1>
              <span className="rounded-md bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                NT 118 DM2
              </span>
            </div>
            <p className="text-xs text-slate-400">Repriorización Algorítmica y Contraloría Médica - MINSAL Chile</p>
          </div>
        </div>

        {/* Center: CESFAM & Role Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Establecimiento:</span>
            <select
              value={cesfamName}
              onChange={(e) => onCesfamChange(e.target.value)}
              className="bg-transparent font-semibold text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="CESFAM Carol Urzúa" className="bg-slate-900 text-slate-100">CESFAM Carol Urzúa</option>
              <option value="CESFAM Dr. Aníbal Ariztía" className="bg-slate-900 text-slate-100">CESFAM Dr. Aníbal Ariztía</option>
              <option value="CESFAM San Gerónimo" className="bg-slate-900 text-slate-100">CESFAM San Gerónimo</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs">
            <Shield className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-slate-400 font-medium">Rol:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-semibold text-purple-300 focus:outline-none cursor-pointer"
            >
              <option value="MEDICO_CONTRALOR" className="bg-slate-900 text-slate-100">Médico Contralor APS</option>
              <option value="ENFERMERA_GESTORA" className="bg-slate-900 text-slate-100">Enfermera Gestora Caso</option>
              <option value="ADMIN_SOMO" className="bg-slate-900 text-slate-100">Admin SOMO / SIGTE</option>
              <option value="AUDITOR_MINSAL" className="bg-slate-900 text-slate-100">Auditor MINSAL / Red</option>
            </select>
          </div>
        </div>

        {/* Right: Badges & Profile */}
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-950/80 border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-300 shadow-sm">
              <Bell className="h-3.5 w-3.5 text-red-400 animate-bounce" />
              <span>{criticalCount} Críticos</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300">
              <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
              <span>{pendingCount} Pendientes</span>
            </div>
          )}

          {/* Theme Switcher Toggle (Claro / Oscuro / Sistema) */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => onThemeChange('light')}
              title="Modo Claro (Por defecto)"
              className={`p-1.5 rounded-md transition-all ${
                theme === 'light'
                  ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              title="Modo Oscuro"
              className={`p-1.5 rounded-md transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('system')}
              title="Modo Sistema"
              className={`p-1.5 rounded-md transition-all ${
                theme === 'system'
                  ? 'bg-white dark:bg-slate-800 text-purple-500 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 font-semibold text-xs">
              {activeRole === 'MEDICO_CONTRALOR' ? 'AS' : activeRole === 'ENFERMERA_GESTORA' ? 'MV' : 'ADM'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200">
                {activeRole === 'MEDICO_CONTRALOR' ? 'Dr. Alejandro Silva' : activeRole === 'ENFERMERA_GESTORA' ? 'Enf. Maria Valenzuela' : 'Usuario SOMO'}
              </p>
              <p className="text-[10px] text-purple-400 font-medium">
                {activeRole.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
