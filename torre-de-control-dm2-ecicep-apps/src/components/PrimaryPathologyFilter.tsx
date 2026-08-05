import React from 'react';
import { 
  Activity, 
  Heart, 
  Brain, 
  Wind, 
  Stethoscope, 
  CheckCircle2,
  Layers
} from 'lucide-react';

interface PrimaryPathologyFilterProps {
  selectedProgram: string;
  onSelectProgram: (program: string) => void;
  programCounts: Record<string, number>;
}

export const PrimaryPathologyFilter: React.FC<PrimaryPathologyFilterProps> = ({
  selectedProgram,
  onSelectProgram,
  programCounts
}) => {
  const categories = [
    { id: 'ALL', label: 'Todas las Patologías', icon: Activity, color: 'text-slate-300' },
    { id: 'DIABETES_DM2', label: 'Diabetes (DM2) • Foco ECICEP', icon: Stethoscope, color: 'text-emerald-400' },
    { id: 'HIPERTENSION_HTA', label: 'Hipertensión (HTA)', icon: Heart, color: 'text-rose-400' },
    { id: 'CARDIOVASCULAR', label: 'Cardiovascular', icon: Heart, color: 'text-red-400' },
    { id: 'RESPIRATORIO_ERA_IRA', label: 'Respiratorio (ERA/IRA)', icon: Wind, color: 'text-cyan-400' },
    { id: 'SALUD_MENTAL', label: 'Salud Mental', icon: Brain, color: 'text-purple-400' },
    { id: 'MULTIMORBIDO_G3', label: 'Multimórbido G3 (ECICEP)', icon: Layers, color: 'text-amber-400' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-md">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          Programa ECICEP Activo & Extensibilidad a Otras Patologías Crónicas
        </span>
        <span className="text-[10px] text-teal-400 font-mono font-medium">
          Modelos Crónicos ECICEP MINSAL
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedProgram === cat.id;
          const count = programCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectProgram(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                isSelected ? 'bg-teal-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
              {isSelected && <CheckCircle2 className="w-3 h-3 text-teal-400 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

