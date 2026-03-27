import React, { useState } from 'react';
import { 
  Activity, 
  Flame, 
  Droplets, 
  Leaf, 
  CheckCircle2, 
  Circle,
  TrendingUp,
  Calendar as CalendarIcon,
  ArrowRight
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, getComplianceColor } from '../lib/utils';
import { CalendarEvent, UserTargets } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer, 
  Tooltip,
  Cell
} from 'recharts';

type DashboardProps = {
  events: CalendarEvent[];
  targets: UserTargets;
  onViewChange: (view: string) => void;
};

const HABITS = [
  { id: '1', name: 'Beber 2L Agua', icon: <Droplets className="w-4 h-4 text-notion-blue" />, color: 'bg-notion-blue' },
  { id: '2', name: 'Comer Vegetales', icon: <Leaf className="w-4 h-4 text-notion-green" />, color: 'bg-notion-green' },
  { id: '3', name: 'Sin Azúcar Añadido', icon: <Flame className="w-4 h-4 text-notion-orange" />, color: 'bg-notion-orange' },
  { id: '4', name: 'Proteína en cada comida', icon: <Activity className="w-4 h-4 text-notion-purple" />, color: 'bg-notion-purple' },
];

export const Dashboard = ({ events, targets, onViewChange }: DashboardProps) => {
  const today = new Date();
  const [habitCompletion, setHabitCompletion] = useState<Record<string, boolean[]>>(() => {
    // Initialize with some random data
    const initial: Record<string, boolean[]> = {};
    HABITS.forEach(h => {
      initial[h.id] = Array.from({ length: 7 }, () => Math.random() > 0.3);
    });
    return initial;
  });

  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  });

  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today
  });

  const toggleHabit = (habitId: string, dayIndex: number) => {
    setHabitCompletion(prev => {
      const current = [...prev[habitId]];
      current[dayIndex] = !current[dayIndex];
      return { ...prev, [habitId]: current };
    });
  };

  const getDayStats = (date: string) => {
    const dayEvents = events.filter(e => e.date === date);
    return dayEvents.reduce((acc, ev) => {
      ev.ingredients.forEach(i => {
        acc.kcal += i.kcal;
        acc.prot += i.prot;
        acc.cost += i.cost;
      });
      return acc;
    }, { kcal: 0, prot: 0, cost: 0 });
  };

  const todayStats = getDayStats(format(today, 'yyyy-MM-dd'));

  return (
    <div className="flex-1 notion-scrollbar overflow-y-auto p-8 bg-bg">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Vista de Águila</h1>
            <p className="text-text-secondary text-sm">Resumen general de tu progreso nutricional y hábitos.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-notion-green animate-pulse" />
            Sincronizado hoy a las {format(new Date(), 'HH:mm')}
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div 
            onClick={() => onViewChange('metrics')}
            className="p-3 sm:p-4 rounded-xl bg-surface border border-border group hover:border-notion-orange transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest">Calorías</span>
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-notion-orange" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{Math.round(todayStats.kcal)}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 sm:h-1.5 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-notion-orange" 
                  style={{ width: `${Math.min(100, (todayStats.kcal / targets.kcal) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] sm:text-[10px] text-text-muted font-mono">{Math.round((todayStats.kcal / targets.kcal) * 100)}%</span>
            </div>
          </div>

          <div 
            onClick={() => onViewChange('metrics')}
            className="p-3 sm:p-4 rounded-xl bg-surface border border-border group hover:border-notion-blue transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest">Proteína</span>
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-notion-blue" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{Math.round(todayStats.prot)}g</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 sm:h-1.5 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-notion-blue" 
                  style={{ width: `${Math.min(100, (todayStats.prot / targets.prot) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] sm:text-[10px] text-text-muted font-mono">{Math.round((todayStats.prot / targets.prot) * 100)}%</span>
            </div>
          </div>

          <div 
            onClick={() => onViewChange('week')}
            className="p-3 sm:p-4 rounded-xl bg-surface border border-border group hover:border-notion-green transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest">Racha</span>
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-notion-green" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">12 Días</div>
            <div className="text-[9px] sm:text-[10px] text-notion-green font-bold truncate">+2 vs semana pasada</div>
          </div>

          <div 
            onClick={() => onViewChange('metrics')}
            className="p-3 sm:p-4 rounded-xl bg-surface border border-border group hover:border-notion-green transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest">Costo Hoy</span>
              <span className="text-notion-green font-bold text-xs">€</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{todayStats.cost.toFixed(2)}€</div>
            <div className="text-[9px] sm:text-[10px] text-text-muted font-bold truncate">Inversión en salud</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Habit Tracker */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border overflow-x-auto">
              <div className="flex items-center justify-between mb-6 min-w-[300px]">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted">Hábitos</h3>
                <div className="flex gap-1">
                  {last7Days.map((day, i) => (
                    <div key={i} className="w-7 sm:w-8 text-center text-[8px] sm:text-[9px] font-bold text-text-muted uppercase">
                      {format(day, 'eee', { locale: es }).charAt(0)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 min-w-[300px]">
                {HABITS.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={cn("p-1.5 sm:p-2 rounded-lg bg-bg border border-border", habit.color.replace('bg-', 'text-'))}>
                        {habit.icon}
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{habit.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {last7Days.map((day, i) => {
                        const isCompleted = habitCompletion[habit.id][i];
                        const isToday = isSameDay(day, today);
                        return (
                          <div 
                            key={i} 
                            onClick={() => toggleHabit(habit.id, i)}
                            className={cn(
                              "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                              isCompleted ? habit.color : "bg-bg border border-border hover:border-text-muted",
                              isToday && !isCompleted && "ring-2 ring-notion-blue ring-offset-2 ring-offset-bg"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                            ) : (
                              <div className="w-1 h-1 rounded-full bg-text-muted opacity-30" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Actividad Nutricional</h3>
                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                  <span>Menos</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-border" />
                    <div className="w-3 h-3 rounded-sm bg-notion-green/30" />
                    <div className="w-3 h-3 rounded-sm bg-notion-green/60" />
                    <div className="w-3 h-3 rounded-sm bg-notion-green" />
                  </div>
                  <span>Más</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {last30Days.map((day, i) => {
                  const stats = getDayStats(format(day, 'yyyy-MM-dd'));
                  const level = stats.kcal > 2000 ? 'bg-notion-green' : stats.kcal > 1000 ? 'bg-notion-green/60' : stats.kcal > 0 ? 'bg-notion-green/30' : 'bg-border';
                  return (
                    <div 
                      key={i} 
                      onClick={() => {
                        onViewChange('day');
                        // We would need to set the current date in App.tsx too, 
                        // but for now let's just navigate.
                      }}
                      className={cn("w-4 h-4 rounded-sm transition-colors hover:ring-1 hover:ring-text-secondary cursor-pointer", level)}
                      title={`${format(day, 'd MMM')}: ${Math.round(stats.kcal)} kcal`}
                    />
                  );
                })}
              </div>
              <div className="mt-4 flex justify-between text-[10px] text-text-muted font-medium">
                <span>Hace 30 días</span>
                <span>Hoy</span>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Próximas Comidas</h3>
              <div className="space-y-4">
                {events.filter(e => e.date === format(today, 'yyyy-MM-dd') && !e.completed).slice(0, 3).map(ev => (
                  <div key={ev.id} className="flex gap-3 group cursor-pointer" onClick={() => onViewChange('day')}>
                    <div className="w-1 h-12 rounded-full bg-notion-blue group-hover:w-1.5 transition-all" />
                    <div>
                      <div className="text-xs text-text-muted font-mono mb-1">{ev.time}</div>
                      <div className="text-sm font-bold group-hover:text-notion-blue transition-colors">{ev.title}</div>
                    </div>
                  </div>
                ))}
                {events.filter(e => e.date === format(today, 'yyyy-MM-dd') && !e.completed).length === 0 && (
                  <div className="text-xs text-text-muted italic py-4">No hay comidas pendientes para hoy.</div>
                )}
                <button 
                  onClick={() => onViewChange('day')}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-bg border border-border text-xs font-medium hover:bg-surface transition-colors mt-2"
                >
                  Ver calendario <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-notion-blue/10 border border-notion-blue/20">
              <h3 className="text-sm font-bold text-notion-blue mb-2">Consejo del día</h3>
              <p className="text-xs text-text-primary leading-relaxed">
                Recuerda que la racha de 12 días es impresionante. Mantener la proteína alta hoy te ayudará con la recuperación muscular.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
