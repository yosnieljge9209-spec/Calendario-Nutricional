import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent, UserTargets } from '../types';
import { Flame, Activity, TrendingUp, Target, Zap } from 'lucide-react';

type MetricsViewProps = {
  events: CalendarEvent[];
  targets: UserTargets;
};

export const MetricsView = ({ events, targets }: MetricsViewProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEvents = events.filter(e => e.date === today);
  
  const todayStats = todayEvents.reduce((acc, ev) => {
    ev.ingredients.forEach(i => {
      acc.kcal += i.kcal;
      acc.prot += i.prot;
      acc.carb += i.carb;
      acc.fat += i.fat;
      acc.cost += i.cost;
    });
    return acc;
  }, { kcal: 0, prot: 0, carb: 0, fat: 0, cost: 0 });

  const last14Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date()
  });

  const chartData = last14Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter(e => e.date === dayStr);
    const dayStats = dayEvents.reduce((acc, ev) => {
      ev.ingredients.forEach(i => {
        acc.kcal += i.kcal;
        acc.prot += i.prot;
        acc.cost += i.cost;
      });
      return acc;
    }, { kcal: 0, prot: 0, cost: 0 });

    return {
      name: format(day, 'd MMM', { locale: es }),
      kcal: Math.round(dayStats.kcal),
      prot: Math.round(dayStats.prot),
      cost: Number(dayStats.cost.toFixed(2)),
      targetKcal: targets.kcal,
      targetProt: targets.prot
    };
  });

  const macroData = [
    { name: 'Proteína', value: todayStats.prot * 4, color: '#2383e2' },
    { name: 'Carbohidratos', value: todayStats.carb * 4, color: '#cb912f' },
    { name: 'Grasas', value: todayStats.fat * 9, color: '#c4554d' },
  ].filter(d => d.value > 0);

  const radarData = [
    { subject: 'Proteína', A: (todayStats.prot / targets.prot) * 100, fullMark: 100 },
    { subject: 'Carbos', A: (todayStats.carb / targets.carb) * 100, fullMark: 100 },
    { subject: 'Grasas', A: (todayStats.fat / targets.fat) * 100, fullMark: 100 },
    { subject: 'Calorías', A: (todayStats.kcal / targets.kcal) * 100, fullMark: 100 },
  ];

  return (
    <div className="flex-1 notion-scrollbar overflow-y-auto p-4 sm:p-8 bg-bg">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Análisis de Métricas</h1>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded bg-surface border border-border text-[10px] sm:text-xs text-text-secondary">
              Últimos 14 días
            </div>
          </div>
        </div>

        {/* Today's Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-5 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted mb-1.5 sm:mb-2">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Calorías Hoy</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold">{Math.round(todayStats.kcal)} <span className="text-[10px] sm:text-xs text-text-muted font-normal">/ {targets.kcal}</span></div>
          </div>
          <div className="p-3 sm:p-5 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted mb-1.5 sm:mb-2">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Proteína Hoy</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold">{Math.round(todayStats.prot)}g <span className="text-[10px] sm:text-xs text-text-muted font-normal">/ {targets.prot}g</span></div>
          </div>
          <div className="p-3 sm:p-5 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted mb-1.5 sm:mb-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Costo Hoy</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-notion-green">{todayStats.cost.toFixed(2)}€</div>
          </div>
          <div className="p-3 sm:p-5 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted mb-1.5 sm:mb-2">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Cumplimiento</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold">{Math.round((todayStats.kcal / targets.kcal) * 100)}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calorie Trend Chart */}
          <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Tendencia de Calorías</h3>
            <div className="h-48 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d9730d" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#d9730d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#787774' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#787774' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#252525', border: '1px solid #2f2f2f', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="kcal" 
                    stroke="#d9730d" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorKcal)" 
                  />
                  <ReferenceLine y={targets.kcal} stroke="#c4554d" strokeDasharray="5 5" label={{ value: 'Meta', position: 'right', fill: '#c4554d', fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macro Balance Radar Chart */}
          <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Balance de Objetivos (%)</h3>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#2f2f2f" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#787774' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 8, fill: '#787774' }} />
                  <Radar
                    name="Cumplimiento"
                    dataKey="A"
                    stroke="#2383e2"
                    fill="#2383e2"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#252525', border: '1px solid #2f2f2f', borderRadius: '8px', fontSize: '10px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Protein Trend Chart */}
          <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border lg:col-span-2">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Consumo de Proteína (g)</h3>
            <div className="h-48 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#787774' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#787774' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#2c2c2c' }}
                    contentStyle={{ backgroundColor: '#252525', border: '1px solid #2f2f2f', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Bar dataKey="prot" fill="#2383e2" radius={[4, 4, 0, 0]} />
                  <ReferenceLine y={targets.prot} stroke="#c4554d" strokeDasharray="3 3" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macro Distribution Chart */}
          <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Distribución de Macronutrientes</h3>
            <div className="h-64 sm:h-72 flex flex-col items-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={macroData}
                    innerRadius={window.innerWidth < 640 ? 40 : 60}
                    outerRadius={window.innerWidth < 640 ? 70 : 90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#252525', border: '1px solid #2f2f2f', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 sm:gap-8 mt-4 w-full px-2 sm:px-8">
                <div className="text-center">
                  <div className="text-[10px] sm:text-xs text-text-muted mb-0.5 sm:mb-1">Proteína</div>
                  <div className="text-xs sm:text-sm font-bold text-notion-blue">{Math.round(todayStats.prot)}g</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] sm:text-xs text-text-muted mb-0.5 sm:mb-1">Carbos</div>
                  <div className="text-xs sm:text-sm font-bold text-notion-yellow">{Math.round(todayStats.carb)}g</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] sm:text-xs text-text-muted mb-0.5 sm:mb-1">Grasas</div>
                  <div className="text-xs sm:text-sm font-bold text-notion-red">{Math.round(todayStats.fat)}g</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Trend Chart */}
          <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Tendencia de Costo (€)</h3>
            <div className="h-48 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#787774' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#787774' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#2c2c2c' }}
                    contentStyle={{ backgroundColor: '#252525', border: '1px solid #2f2f2f', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Bar dataKey="cost" fill="#0f7b6c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
