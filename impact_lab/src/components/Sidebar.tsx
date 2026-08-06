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
    { id: 'dashboard', label: 'Health OS', icon: LayoutDashboard },
    { id: 'capacity', label: 'Capacidad & Red', icon: Building2 },
    { id: 'matrix', label: 'Matriz Riesgo NT 118', icon: Layers },
    { id: 'audit', label: 'Bitácora Contraloría', icon: ClipboardCheck },
    { id: 'import', label: 'Importador SIGTE', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 shrink-0 apple-sidebar p-5 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        
        {/* Navigation Category */}
        <div>
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Módulos Operativos
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0071e3] text-white shadow-md shadow-[#0071e3]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sectors Quick View */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Sectores CESFAM
          </p>
          <div className="space-y-2.5 px-3 text-xs font-bold">
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                Sector Verde
              </span>
              <span className="font-mono-tabular font-extrabold text-slate-900 dark:text-slate-100">12</span>
            </div>
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                Sector Azul
              </span>
              <span className="font-mono-tabular font-extrabold text-slate-900 dark:text-slate-100">18</span>
            </div>
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                Sector Rojo
              </span>
              <span className="font-mono-tabular font-extrabold text-slate-900 dark:text-slate-100">24</span>
            </div>
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                Sector Amarillo
              </span>
              <span className="font-mono-tabular font-extrabold text-slate-900 dark:text-slate-100">15</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info & Explication Trigger */}
      <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
        <button
          onClick={onOpenExplication}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#0071e3]/40 bg-[#0071e3]/10 px-3 py-2.5 text-xs font-bold text-[#0071e3] dark:text-cyan-400 hover:bg-[#0071e3]/20 transition-all"
        >
          <HelpCircle className="h-4 w-4 text-[#0071e3]" />
          <span>Explicabilidad Algoritmo</span>
        </button>
        <div className="text-[10px] text-center font-bold text-slate-500 dark:text-slate-400">
          Health OS v1.0 • MINSAL APS
        </div>
      </div>
    </aside>
  );
};
