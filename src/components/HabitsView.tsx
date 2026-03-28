import React, { useState, useMemo } from 'react';
import { Habit, HabitLog } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  TrendingUp, 
  Plus, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Activity
} from 'lucide-react';
import { format, subDays, addDays, startOfDay, isSameDay, parseISO, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface HabitsViewProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onToggleHabit: (habitId: string, date: string) => void;
  onAddHabit: (habit: Habit) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({ 
  habits, 
  habitLogs, 
  onToggleHabit,
  onAddHabit
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const getStreak = (habitId: string) => {
    let streak = 0;
    let current = startOfDay(new Date());
    
    while (true) {
      const dStr = format(current, 'yyyy-MM-dd');
      const log = habitLogs.find(l => l.habitId === habitId && l.date === dStr);
      if (log?.completed) {
        streak++;
        current = subDays(current, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getWeeklyCompliance = (habitId: string) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    
    const completed = days.filter(d => {
      const dStr = format(d, 'yyyy-MM-dd');
      return habitLogs.find(l => l.habitId === habitId && l.date === dStr)?.completed;
    }).length;
    
    return Math.round((completed / days.length) * 100);
  };

  return (
    <div className="flex-1 notion-scrollbar overflow-y-auto p-8 bg-bg">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hábitos & Consistencia</h1>
            <p className="text-text-secondary mt-1">Pequeñas acciones diarias, grandes resultados a largo plazo.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
            <button 
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-2 hover:bg-bg rounded-lg text-text-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 flex items-center gap-2 text-sm font-bold">
              <CalendarIcon className="w-4 h-4 text-notion-blue" />
              {format(selectedDate, "d 'de' MMM", { locale: es })}
            </div>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 hover:bg-bg rounded-lg text-text-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Weekly Overview */}
        <div className="grid grid-cols-7 gap-2 bg-surface border border-border rounded-2xl p-4 shadow-sm">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const dayCompleted = habits.every(h => 
              habitLogs.find(l => l.habitId === h.id && l.date === format(day, 'yyyy-MM-dd'))?.completed
            );
            
            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl transition-all",
                  isSelected ? "bg-notion-blue/10 border border-notion-blue/30" : "hover:bg-bg",
                  isToday && !isSelected && "border border-border"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  isSelected ? "text-notion-blue" : "text-text-primary"
                )}>
                  {format(day, 'd')}
                </span>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mt-2",
                  dayCompleted ? "bg-notion-green" : "bg-border"
                )} />
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map((habit) => {
            const isCompleted = habitLogs.find(l => l.habitId === habit.id && l.date === dateStr)?.completed;
            const streak = getStreak(habit.id);
            const compliance = getWeeklyCompliance(habit.id);
            
            return (
              <div 
                key={habit.id}
                className={cn(
                  "bg-surface border border-border rounded-2xl p-6 shadow-sm transition-all group",
                  isCompleted && "border-notion-green/30 bg-notion-green/5"
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm",
                      habit.color
                    )}>
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{habit.name}</h3>
                      <p className="text-xs text-text-muted">{habit.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onToggleHabit(habit.id, dateStr)}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      isCompleted ? "text-notion-green bg-notion-green/10" : "text-text-muted hover:bg-bg"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg/50 rounded-xl p-3 flex items-center gap-3">
                    <Flame className={cn("w-5 h-5", streak > 0 ? "text-notion-orange" : "text-text-muted")} />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Racha</p>
                      <p className="text-sm font-bold">{streak} días</p>
                    </div>
                  </div>
                  <div className="bg-bg/50 rounded-xl p-3 flex items-center gap-3">
                    <TrendingUp className={cn("w-5 h-5", compliance > 80 ? "text-notion-green" : "text-text-muted")} />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Semanal</p>
                      <p className="text-sm font-bold">{compliance}%</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <button 
            className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-text-muted hover:bg-surface hover:text-text-secondary transition-all"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-bold">Añadir Nuevo Hábito</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-notion-purple/5 border border-notion-purple/20 p-6 rounded-2xl flex items-center gap-4">
            <Trophy className="w-10 h-10 text-notion-purple" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-notion-purple/60">Mejor Racha</p>
              <p className="text-xl font-bold text-notion-purple">12 Días</p>
            </div>
          </div>
          <div className="bg-notion-blue/5 border border-notion-blue/20 p-6 rounded-2xl flex items-center gap-4">
            <Activity className="w-10 h-10 text-notion-blue" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-notion-blue/60">Consistencia</p>
              <p className="text-xl font-bold text-notion-blue">88%</p>
            </div>
          </div>
          <div className="bg-notion-green/5 border border-notion-green/20 p-6 rounded-2xl flex items-center gap-4">
            <CheckCircle2 className="w-10 h-10 text-notion-green" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-notion-green/60">Completados</p>
              <p className="text-xl font-bold text-notion-green">142</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
