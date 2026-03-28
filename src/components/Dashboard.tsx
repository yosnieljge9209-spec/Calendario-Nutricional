import React, { useMemo } from 'react';
import { 
  CalendarEvent, 
  UserTargets, 
  WaterLog, 
  WeightLog, 
  UserProfile,
  PhysiologicalLog,
  Habit,
  HabitLog
} from '../types';
import { 
  Activity, 
  Droplets, 
  Flame, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Target, 
  BrainCircuit, 
  ChevronRight,
  Scale
} from 'lucide-react';
import { format, startOfDay, isSameDay, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { getCoachInsights } from '../services/coachService';
import { cn } from '../lib/utils';

interface DashboardProps {
  events: CalendarEvent[];
  targets: UserTargets;
  waterLogs: WaterLog[];
  weightLogs: WeightLog[];
  physioLogs: PhysiologicalLog[];
  habitLogs: HabitLog[];
  habits: Habit[];
  profile: UserProfile;
  onAddWater: (amount: number) => void;
  onLogWeight: (weight: number) => void;
  onViewChange: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  events, 
  targets, 
  waterLogs, 
  weightLogs,
  physioLogs,
  habitLogs,
  habits,
  profile,
  onAddWater,
  onLogWeight,
  onViewChange
}) => {
  const today = startOfDay(new Date());
  
  const todayEvents = useMemo(() => 
    events.filter(e => isSameDay(parseISO(e.date), today)),
  [events, today]);

  const todayWater = useMemo(() => 
    waterLogs
      .filter(log => isSameDay(parseISO(log.date), today))
      .reduce((acc, log) => acc + log.amount, 0),
  [waterLogs, today]);

  const totals = useMemo(() => {
    return todayEvents.reduce((acc, e) => {
      if (!e.completed) return acc;
      e.ingredients.forEach(ing => {
        acc.kcal += ing.kcal;
        acc.prot += ing.prot;
        acc.carb += ing.carb;
        acc.fat += ing.fat;
      });
      return acc;
    }, { kcal: 0, prot: 0, carb: 0, fat: 0 });
  }, [todayEvents]);

  const coachInsights = useMemo(() => 
    getCoachInsights(weightLogs, profile, events, physioLogs, habitLogs, targets),
  [weightLogs, profile, events, physioLogs, habitLogs, targets]);

  const weightData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = weightLogs.find(l => l.date === dateStr);
      return {
        date: format(date, 'dd/MM'),
        weight: log?.weight || null,
      };
    }).reverse();
    return last14Days;
  }, [weightLogs]);

  const heatmapData = useMemo(() => {
    const last28Days = Array.from({ length: 28 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayEvents = events.filter(e => e.date === dateStr);
      const dayHabits = habitLogs.filter(l => l.date === dateStr);
      
      const eventCompliance = dayEvents.length > 0 ? dayEvents.filter(e => e.completed).length / dayEvents.length : 1;
      const habitCompliance = habits.length > 0 ? dayHabits.filter(l => l.completed).length / habits.length : 1;
      
      const score = (eventCompliance + habitCompliance) / 2;
      
      return {
        date: dateStr,
        score,
      };
    }).reverse();
    return last28Days;
  }, [events, habitLogs, habits]);

  const getStatusColor = (current: number, target: number, type: 'kcal' | 'prot') => {
    const ratio = current / target;
    if (type === 'kcal') {
      if (ratio > 1.1) return 'text-notion-red';
      if (ratio > 0.9) return 'text-notion-green';
      return 'text-notion-yellow';
    }
    if (type === 'prot') {
      if (ratio >= 0.9) return 'text-notion-green';
      return 'text-notion-red';
    }
    return 'text-text-secondary';
  };

  const [isLoggingWeight, setIsLoggingWeight] = React.useState(false);
  const [weightInput, setWeightInput] = React.useState(profile.weight.toString());

  return (
    <div className="flex-1 notion-scrollbar overflow-y-auto p-8 bg-bg">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Welcome & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hola de nuevo</h1>
            <p className="text-text-secondary mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 group relative">
              <div className="w-10 h-10 rounded-full bg-notion-orange/10 flex items-center justify-center text-notion-orange">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Peso Actual</p>
                <div className="flex items-center gap-2">
                  {isLoggingWeight ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        step="0.1"
                        autoFocus
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        onBlur={() => {
                          if (weightInput && !isNaN(Number(weightInput))) {
                            onLogWeight(Number(weightInput));
                          }
                          setIsLoggingWeight(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (weightInput && !isNaN(Number(weightInput))) {
                              onLogWeight(Number(weightInput));
                            }
                            setIsLoggingWeight(false);
                          }
                        }}
                        className="w-16 bg-bg border border-border rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:border-notion-orange"
                      />
                      <span className="text-xs text-text-muted">kg</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-bold">{profile.weight} kg</p>
                      <button 
                        onClick={() => setIsLoggingWeight(true)}
                        className="p-1 rounded hover:bg-bg text-text-muted hover:text-notion-orange transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-notion-blue/10 flex items-center justify-center text-notion-blue">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Objetivo</p>
                <p className="text-lg font-bold">{profile.targetWeight || '--'} kg</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Daily Goals Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-notion-orange" />
                  Metas Diarias
                </h2>
                <div className="px-3 py-1 rounded-full bg-notion-blue/10 text-notion-blue text-[10px] font-bold uppercase tracking-wider">
                  {profile.goal.replace('-', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calories Ring/Progress */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-border"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (Math.min(targets.kcal > 0 ? totals.kcal / targets.kcal : 0, 1.2) * 440)}
                        className={cn(
                          "transition-all duration-1000 ease-out",
                          targets.kcal > 0 && totals.kcal > targets.kcal * 1.1 ? "text-notion-red" : "text-notion-orange"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{totals.kcal}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">kcal</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-secondary">
                      Meta: <span className="font-bold text-text-primary">{targets.kcal} kcal</span>
                    </p>
                    <p className={cn("text-xs font-bold mt-1", getStatusColor(totals.kcal, targets.kcal, 'kcal'))}>
                      {totals.kcal > targets.kcal ? `+${totals.kcal - targets.kcal} sobre meta` : `${targets.kcal - totals.kcal} restantes`}
                    </p>
                  </div>
                </div>

                {/* Macro Bars */}
                <div className="space-y-6">
                  {[
                    { label: 'Proteína', current: totals.prot, target: targets.prot, unit: 'g', color: 'bg-notion-blue', type: 'prot' as const },
                    { label: 'Carbohidratos', current: totals.carb, target: targets.carb, unit: 'g', color: 'bg-notion-orange', type: 'carb' as const },
                    { label: 'Grasas', current: totals.fat, target: targets.fat, unit: 'g', color: 'bg-notion-yellow', type: 'fat' as const },
                  ].map((macro) => (
                    <div key={macro.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold">{macro.label}</span>
                        <span className="text-text-secondary">
                          <span className={cn("font-bold", macro.type === 'prot' ? getStatusColor(macro.current, macro.target, 'prot') : "text-text-primary")}>
                            {macro.current}
                          </span> / {macro.target}{macro.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", macro.color)}
                          style={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hydration Widget - Moved to Main Grid */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-notion-blue" />
                    Hidratación
                  </h2>
                  <span className="text-xs font-bold text-text-muted">{todayWater} / {targets.water}ml</span>
                </div>
                
                <div className="relative h-4 bg-border rounded-full overflow-hidden mb-6">
                  <div 
                    className="absolute inset-y-0 left-0 bg-notion-blue transition-all duration-1000"
                    style={{ width: `${Math.min((todayWater / targets.water) * 100, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 750].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => onAddWater(amount)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:bg-surface-light transition-colors group"
                    >
                      <Plus className="w-4 h-4 mb-1 text-text-muted group-hover:text-notion-blue" />
                      <span className="text-xs font-bold">{amount}ml</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Habit Streaks Widget - Moved to Main Grid */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-notion-orange" />
                    Rachas de Hábitos
                  </h2>
                  <button 
                    onClick={() => onViewChange('habits')}
                    className="text-[10px] font-bold text-notion-blue hover:underline"
                  >
                    Ver todos
                  </button>
                </div>
                <div className="space-y-4">
                  {habits.slice(0, 3).map((habit) => {
                    const isCompleted = habitLogs.find(l => l.habitId === habit.id && l.date === format(today, 'yyyy-MM-dd'))?.completed;
                    return (
                      <div key={habit.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", habit.color)}>
                            {habit.icon}
                          </div>
                          <span className="text-sm font-medium">{habit.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-muted">3d</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full",
                            isCompleted ? "bg-notion-green" : "bg-border"
                          )} />
                        </div>
                      </div>
                    );
                  })}
                  {habits.length === 0 && (
                    <p className="text-xs text-text-muted italic text-center py-4">No hay hábitos configurados</p>
                  )}
                </div>
              </div>
            </div>

            {/* Consistency Heatmap */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-notion-purple" />
                  Consistencia de Hábitos
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase">
                  <span>Menos</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-border" />
                    <div className="w-3 h-3 rounded-sm bg-notion-purple/20" />
                    <div className="w-3 h-3 rounded-sm bg-notion-purple/50" />
                    <div className="w-3 h-3 rounded-sm bg-notion-purple" />
                  </div>
                  <span>Más</span>
                </div>
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
                {heatmapData.map((day, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "aspect-square rounded-sm transition-all hover:scale-110 cursor-help",
                      day.score === 0 ? "bg-border" :
                      day.score < 0.4 ? "bg-notion-purple/20" :
                      day.score < 0.8 ? "bg-notion-purple/50" :
                      "bg-notion-purple"
                    )}
                    title={`${day.date}: ${Math.round(day.score * 100)}% cumplimiento`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Widgets - Trends & Insights */}
          <div className="space-y-6">
            {/* Weight Trend Chart - Moved to Sidebar for better consolidation */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-notion-blue" />
                  Tendencia
                </h2>
                <button 
                  onClick={() => onViewChange('metrics')}
                  className="text-[10px] font-bold text-notion-blue hover:underline flex items-center gap-1"
                >
                  Historial <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 8, fill: '#8E9299' }}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 8, fill: '#8E9299' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151619', border: '1px solid #2A2B2F', borderRadius: '8px', fontSize: '10px' }}
                      itemStyle={{ color: '#F27D26' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#F27D26" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coach Insights */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-12 h-12" />
              </div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-notion-purple" />
                Coach Inteligente
              </h2>
              <div className="space-y-4">
                {coachInsights.length === 0 ? (
                  <p className="text-xs text-text-muted italic">Analizando tus datos... Sigue registrando para recibir consejos.</p>
                ) : (
                  coachInsights.map((insight, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-4 rounded-xl border-l-4",
                        insight.type === 'success' ? "bg-notion-green/5 border-notion-green text-notion-green" :
                        insight.type === 'warning' ? "bg-notion-orange/5 border-notion-orange text-notion-orange" :
                        "bg-notion-blue/5 border-notion-blue text-notion-blue"
                      )}
                    >
                      <p className="text-xs font-medium leading-relaxed">{insight.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
