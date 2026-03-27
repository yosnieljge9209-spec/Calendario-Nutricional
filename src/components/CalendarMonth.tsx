import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn, getComplianceColor } from '../lib/utils';
import { CalendarEvent, UserTargets } from '../types';

type CalendarMonthProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  targets: UserTargets;
  onAddEvent: (date: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
};

export const CalendarMonth = ({ 
  currentDate, 
  onDateChange, 
  events, 
  targets,
  onAddEvent,
  onEditEvent 
}: CalendarMonthProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDayEvents = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.date === dayStr);
  };

  const getDayStats = (day: Date) => {
    const dayEvents = getDayEvents(day);
    return dayEvents.reduce((acc, ev) => {
      ev.ingredients.forEach(i => {
        acc.kcal += i.kcal;
        acc.prot += i.prot;
        acc.cost += i.cost;
      });
      return acc;
    }, { kcal: 0, prot: 0, cost: 0 });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/50">
        <h2 className="text-lg font-semibold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onDateChange(subMonths(currentDate, 1))}
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
            onClick={() => onDateChange(addMonths(currentDate, 1))}
            className="p-1.5 rounded hover:bg-surface text-text-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 notion-scrollbar overflow-y-auto">
        {calendarDays.map((day, idx) => {
          const dayEvents = getDayEvents(day);
          const stats = getDayStats(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);
          const complianceColor = getComplianceColor(stats.kcal, targets.kcal);

          return (
            <div 
              key={idx}
              className={cn(
                "min-h-[80px] sm:min-h-[120px] border-r border-b border-border p-1 sm:p-2 flex flex-col gap-0.5 sm:gap-1 group relative",
                !isCurrentMonth && "bg-bg/50 opacity-40"
              )}
            >
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-notion-blue text-white" : "text-text-secondary"
                )}>
                  {format(day, 'd')}
                </span>
                {stats.kcal > 0 && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="hidden xs:inline text-[8px] sm:text-[9px] text-text-muted font-mono">{Math.round(stats.kcal)}k</span>
                    <span className="hidden md:inline text-[8px] sm:text-[9px] text-notion-green font-mono">{stats.cost.toFixed(2)}€</span>
                    <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", complianceColor)} />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-hidden">
                {dayEvents.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => onEditEvent(ev)}
                    className="w-full text-left px-1 py-0.5 rounded text-[8px] sm:text-[10px] truncate bg-surface/80 hover:bg-surface border border-transparent hover:border-border transition-all"
                  >
                    <span className="hidden sm:inline opacity-70 mr-1">{ev.time}</span>
                    {ev.title}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onAddEvent(format(day, 'yyyy-MM-dd'))}
                className="absolute bottom-1 right-1 p-0.5 sm:p-1 rounded bg-surface border border-border text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
              >
                <Plus className="w-2.5 h-2.5 sm:w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
