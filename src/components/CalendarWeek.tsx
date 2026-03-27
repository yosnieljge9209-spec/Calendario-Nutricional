import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn, getComplianceColor } from '../lib/utils';
import { CalendarEvent, UserTargets } from '../types';

type CalendarWeekProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  targets: UserTargets;
  onAddEvent: (date: string, time?: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
};

export const CalendarWeek = ({
  currentDate,
  onDateChange,
  events,
  targets,
  onAddEvent,
  onEditEvent
}: CalendarWeekProps) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getDayEvents = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.date === dayStr).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getDayStats = (day: Date) => {
    const dayEvents = getDayEvents(day);
    return dayEvents.reduce((acc, ev) => {
      ev.ingredients.forEach(i => {
        acc.kcal += i.kcal;
        acc.prot += i.prot;
        acc.carb += i.carb;
        acc.fat += i.fat;
        acc.cost += i.cost;
      });
      return acc;
    }, { kcal: 0, prot: 0, carb: 0, fat: 0, cost: 0 });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/50">
        <h2 className="text-lg font-semibold capitalize">
          {format(weekStart, 'd MMM', { locale: es })} — {format(weekEnd, 'd MMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onDateChange(subDays(currentDate, 7))}
            className="p-1.5 rounded hover:bg-surface text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 text-xs font-medium rounded border border-border hover:bg-surface transition-colors"
          >
            Hoy
          </button>
          <button 
            onClick={() => onDateChange(addDays(currentDate, 7))}
            className="p-1.5 rounded hover:bg-surface text-text-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Totals Row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-surface/30">
        <div className="border-r border-border flex items-center justify-center text-[9px] font-bold text-text-muted uppercase">
          Metas
        </div>
        {days.map((day, idx) => {
          const stats = getDayStats(day);
          const complianceColor = getComplianceColor(stats.kcal, targets.kcal);
          const pct = Math.min(100, Math.round((stats.kcal / targets.kcal) * 100));

          return (
            <div key={idx} className="p-2 border-r border-border flex flex-col gap-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-mono text-text-secondary">{Math.round(stats.kcal)}k</span>
                <span className="text-[8px] text-text-muted">{pct}%</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", complianceColor)} 
                  style={{ width: `${pct}%` }} 
                />
              </div>
              <div className="flex gap-2 text-[8px] text-text-muted font-mono">
                <span>P:{Math.round(stats.prot)}g</span>
                <span className="text-notion-green">{stats.cost.toFixed(2)}€</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header Days & Timeline Grid Container */}
      <div className="flex-1 overflow-x-auto notion-scrollbar">
        <div className="min-w-[800px] h-full flex flex-col">
          {/* Header Days */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 z-10 bg-bg">
            <div className="border-r border-border" />
            {days.map((day, idx) => (
              <div key={idx} className="py-2 sm:py-3 text-center border-r border-border">
                <div className="text-[8px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5 sm:mb-1">
                  {format(day, 'eee', { locale: es })}
                </div>
                <div className={cn(
                  "text-sm sm:text-lg font-bold inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full",
                  isSameDay(day, new Date()) ? "bg-notion-blue text-white" : "text-text-primary"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="flex-1 notion-scrollbar overflow-y-auto relative">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] min-h-full">
              {/* Time Labels */}
              <div className="border-r border-border">
                {hours.map(h => (
                  <div key={h} className="h-16 sm:h-20 border-b border-border/50 px-1 sm:px-2 pt-1 text-[8px] sm:text-[10px] text-text-muted font-mono">
                    {format(new Date().setHours(h, 0), 'HH:mm')}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {days.map((day, dIdx) => {
                const dayEvents = getDayEvents(day);
                return (
                  <div key={dIdx} className="relative border-r border-border group">
                    {hours.map(h => (
                      <div 
                        key={h} 
                        className="h-16 sm:h-20 border-b border-border/50 hover:bg-surface/10 cursor-pointer transition-colors"
                        onClick={() => onAddEvent(format(day, 'yyyy-MM-dd'), `${format(new Date().setHours(h, 0), 'HH:mm')}`)}
                      />
                    ))}
                    
                    {dayEvents.map(ev => {
                      const [h, m] = ev.time.split(':').map(Number);
                      const rowHeight = window.innerWidth < 640 ? 64 : 80;
                      const top = (h * rowHeight) + (m / 60 * rowHeight);
                      const height = (ev.duration / 60) * rowHeight;
                      
                      return (
                        <div
                          key={ev.id}
                          onClick={() => onEditEvent(ev)}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          className="absolute left-0.5 right-0.5 sm:left-1 sm:right-1 rounded border-l-2 border-notion-blue bg-notion-blue/10 p-1 sm:p-1.5 text-[8px] sm:text-[10px] overflow-hidden cursor-pointer hover:bg-notion-blue/20 transition-all z-20 shadow-sm"
                        >
                          <div className="font-bold truncate">{ev.title}</div>
                          <div className="opacity-70">{ev.time}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
