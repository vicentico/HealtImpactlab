import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  ClipboardCheck, 
  FileSpreadsheet, 
  HelpCircle, 
  Sliders,
  Users,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenExplication: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenExplication
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Torre de Control', icon: LayoutDashboard },
    { id: 'capacity', label: 'Capacidad & Red', icon: Building2 },
    { id: 'matrix', label: 'Matriz Riesgo NT 118', icon: Layers },
    { id: 'audit', label: 'Bitácora Contraloría', icon: ClipboardCheck },
    { id: 'import', label: 'Importador SIGTE', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 shrink-0 glass-panel border-r border-slate-800 bg-slate-950/90 p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        
        {/* Navigation Category */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Módulos Operativos
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sectors Quick View */}
        <div className="border-t border-slate-800/80 pt-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Sectores CESFAM
          </p>
          <div className="space-y-1.5 px-3 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Sector Verde
              </span>
              <span className="font-mono-tabular text-slate-300">12</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Sector Azul
              </span>
              <span className="font-mono-tabular text-slate-300">18</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Sector Rojo
              </span>
              <span className="font-mono-tabular text-slate-300">24</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Sector Amarillo
              </span>
              <span className="font-mono-tabular text-slate-300">15</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info & Explication Trigger */}
      <div className="space-y-2 border-t border-slate-800 pt-4">
        <button
          onClick={onOpenExplication}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-900/40 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Explicabilidad Algoritmo</span>
        </button>
        <div className="text-[10px] text-center text-slate-500">
          Impact Lab v1.0 • MINSAL APS
        </div>
      </div>
    </aside>
  );
};
