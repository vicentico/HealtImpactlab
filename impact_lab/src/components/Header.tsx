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
    <header className="apple-header sticky top-0 z-30 px-6 py-3.5 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight apple-title">Torre de Control APS</h1>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                NT 118 DM2
              </span>
            </div>
            <p className="text-xs apple-subtitle">Repriorización Algorítmica y Contraloría Médica - MINSAL Chile</p>
          </div>
        </div>

        {/* Center: CESFAM & Role Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 apple-control px-3 py-1.5 text-xs font-medium">
            <span className="apple-muted">Establecimiento:</span>
            <select
              value={cesfamName}
              onChange={(e) => onCesfamChange(e.target.value)}
              className="bg-transparent font-semibold text-cyan-600 dark:text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="CESFAM Carol Urzúa">CESFAM Carol Urzúa</option>
              <option value="CESFAM Dr. Aníbal Ariztía">CESFAM Dr. Aníbal Ariztía</option>
              <option value="CESFAM San Gerónimo">CESFAM San Gerónimo</option>
            </select>
          </div>

          <div className="flex items-center gap-2 apple-control px-3 py-1.5 text-xs font-medium">
            <Shield className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="apple-muted">Rol:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-semibold text-purple-600 dark:text-purple-400 focus:outline-none cursor-pointer"
            >
              <option value="MEDICO_CONTRALOR">Médico Contralor APS</option>
              <option value="ENFERMERA_GESTORA">Enfermera Gestora Caso</option>
              <option value="ADMIN_SOMO">Admin SOMO / SIGTE</option>
              <option value="AUDITOR_MINSAL">Auditor MINSAL / Red</option>
            </select>
          </div>
        </div>

        {/* Right: Badges & Profile */}
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 shadow-sm">
              <Bell className="h-3.5 w-3.5 text-red-500 animate-bounce" />
              <span>{criticalCount} Críticos</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
              <span>{pendingCount} Pendientes</span>
            </div>
          )}

          {/* Theme Switcher Toggle (Claro / Oscuro / Sistema) */}
          <div className="flex items-center rounded-full apple-control p-1 text-xs">
            <button
              onClick={() => onThemeChange('light')}
              title="Modo Claro (Por defecto)"
              className={`p-1.5 rounded-full transition-all ${
                theme === 'light'
                  ? 'bg-white text-amber-500 shadow-sm font-bold'
                  : 'apple-muted hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              title="Modo Oscuro"
              className={`p-1.5 rounded-full transition-all ${
                theme === 'dark'
                  ? 'bg-slate-700 text-cyan-400 shadow-sm font-bold'
                  : 'apple-muted hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('system')}
              title="Modo Sistema"
              className={`p-1.5 rounded-full transition-all ${
                theme === 'system'
                  ? 'bg-slate-200 dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm font-bold'
                  : 'apple-muted hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-800"></div>

          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-xs">
              {activeRole === 'MEDICO_CONTRALOR' ? 'AS' : activeRole === 'ENFERMERA_GESTORA' ? 'MV' : 'ADM'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold apple-title">
                {activeRole === 'MEDICO_CONTRALOR' ? 'Dr. Alejandro Silva' : activeRole === 'ENFERMERA_GESTORA' ? 'Enf. Maria Valenzuela' : 'Usuario SOMO'}
              </p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                {activeRole.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
