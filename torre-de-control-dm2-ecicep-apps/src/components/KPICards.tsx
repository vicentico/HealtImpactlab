import React from 'react';
import { 
  Users, 
  AlertOctagon, 
  Activity, 
  Clock, 
  CalendarCheck, 
  TrendingDown, 
  TrendingUp,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { CapacityMetrics } from '../types';

interface KPICardsProps {
  metrics: CapacityMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const cards = [
    {
      id: 'dm2_activos',
      title: 'Personas DM2 Activas',
      subtitle: 'Bajo seguimiento ECICEP en CESFAM',
      value: (metrics.dm2ActivePatientsCount || 842).toLocaleString('es-CL'),
      unit: 'pacientes',
      trend: '+12 nuevos este mes',
      trendType: 'neutral',
      icon: Users,
      color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300'
    },
    {
      id: 'descompensados',
      title: 'Descompensados Severos',
      subtitle: 'HbA1c > 10% o VFG < 45 ml/min',
      value: metrics.dm2SevereDecompensatedCount || 68,
      unit: 'requieren cita <7d',
      trend: '+4 urgencias esta sem.',
      trendType: 'warning',
      icon: AlertOctagon,
      color: 'border-rose-500/40 bg-rose-950/30 text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 animate-pulse border border-rose-500/40'
    },
    {
      id: 'eventos_sapu',
      title: 'Eventos Urgencia / SAPU',
      subtitle: 'Consultas o altas hosp. <30d',
      value: metrics.recentEmergencyEventsCount || 24,
      unit: 'eventos registrados',
      trend: '-3 vs mes anterior',
      trendType: 'positive',
      icon: HeartPulse,
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300'
    },
    {
      id: 'brecha_control',
      title: 'Brecha Control ECICEP',
      subtitle: '> 6 meses sin evaluación clínica',
      value: metrics.dm2ControlBreachCount || 142,
      unit: 'personas desfasadas',
      trend: '-18 rescatados este mes',
      trendType: 'positive',
      icon: Activity,
      color: 'border-teal-500/30 bg-teal-950/20 text-teal-400',
      badgeBg: 'bg-teal-500/10 text-teal-300'
    },
    {
      id: 'cupos_reservados',
      title: 'Cupos Sobreagenda DM2',
      subtitle: 'Reserva semanal para descompensados',
      value: metrics.weeklyAvailableSlots || 38,
      unit: 'cupos disponibles',
      trend: '+8 lib. por contralor',
      trendType: 'positive',
      icon: CalendarCheck,
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300'
    },
    {
      id: 'espera_promedio',
      title: 'Espera Proyectada',
      subtitle: 'Proyección para cita de control',
      value: `${metrics.avgProjectedDays}d`,
      unit: 'días hábiles',
      trend: '-4.2 días prioridad ECICEP',
      trendType: 'positive',
      icon: Clock,
      color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-300'
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositiveTrend = card.trendType === 'positive';
        const isWarningTrend = card.trendType === 'warning';
        const TrendIcon = isPositiveTrend ? TrendingDown : (isWarningTrend ? AlertTriangle : TrendingUp);

        return (
          <div
            key={card.id}
            className={`p-3.5 rounded-xl border bg-slate-900/90 shadow-md transition-all hover:border-slate-700 ${card.color}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
                {card.value}
              </span>
              <span className="text-[10px] font-medium text-slate-400 truncate">
                {card.unit}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 font-medium">
                <TrendIcon className={`w-3 h-3 ${
                  isPositiveTrend ? 'text-emerald-400' : (isWarningTrend ? 'text-rose-400' : 'text-amber-400')
                }`} />
                <span className={
                  isPositiveTrend ? 'text-emerald-400' : (isWarningTrend ? 'text-rose-400' : 'text-slate-300')
                }>
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

