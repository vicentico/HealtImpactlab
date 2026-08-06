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
    <aside className="w-64 shrink-0 apple-sidebar p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        
        {/* Navigation Category */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sectors Quick View */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Sectores CESFAM
          </p>
          <div className="space-y-2 px-3 text-xs font-medium">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                Sector Verde
              </span>
              <span className="font-mono-tabular font-bold text-slate-800 dark:text-slate-200">12</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                Sector Azul
              </span>
              <span className="font-mono-tabular font-bold text-slate-800 dark:text-slate-200">18</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                Sector Rojo
              </span>
              <span className="font-mono-tabular font-bold text-slate-800 dark:text-slate-200">24</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                Sector Amarillo
              </span>
              <span className="font-mono-tabular font-bold text-slate-800 dark:text-slate-200">15</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info & Explication Trigger */}
      <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
        <button
          onClick={onOpenExplication}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Explicabilidad Algoritmo</span>
        </button>
        <div className="text-[10px] text-center font-medium text-slate-400 dark:text-slate-500">
          Health OS v1.0 • MINSAL APS
        </div>
      </div>
    </aside>
  );
};
