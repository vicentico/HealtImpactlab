import React from 'react';
import { Activity, ShieldCheck, Bell, User, RefreshCw } from 'lucide-react';

interface HeaderProps {
  cesfamName: string;
  onCesfamChange: (name: string) => void;
  pendingCount: number;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  cesfamName,
  onCesfamChange,
  pendingCount,
  criticalCount
}) => {
  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 px-6 py-3.5 backdrop-blur-md">
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

        {/* Center: CESFAM Selector & Live Status */}
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

          <div className="hidden lg:flex items-center gap-2 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Algoritmo Sincronizado</span>
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

          <div className="h-6 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-semibold text-xs">
              AS
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200">Dr. Alejandro Silva</p>
              <p className="text-[10px] text-slate-400">Médico Contralor APS</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
