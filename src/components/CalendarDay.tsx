import React from 'react';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle } from 'lucide-react';
import { cn, getComplianceColor } from '../lib/utils';
import { CalendarEvent, UserTargets } from '../types';

type CalendarDayProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  targets: UserTargets;
  onAddEvent: (date: string, time?: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onToggleCompletion: (id: string) => void;
};

export const CalendarDay = ({
  currentDate,
  onDateChange,
  events,
  targets,
  onAddEvent,
  onEditEvent,
  onToggleCompletion
}: CalendarDayProps) => {
  const dayStr = format(currentDate, 'yyyy-MM-dd');
  const dayEvents = events
    .filter(e => e.date === dayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const stats = dayEvents.reduce((acc, ev) => {
    ev.ingredients.forEach(i => {
      acc.kcal += i.kcal;
      acc.prot += i.prot;
      acc.carb += i.carb;
      acc.fat += i.fat;
      acc.cost += i.cost;
    });
    return acc;
  }, { kcal: 0, prot: 0, carb: 0, fat: 0, cost: 0 });

  const complianceColor = getComplianceColor(stats.kcal, targets.kcal);
  const pct = Math.min(100, Math.round((stats.kcal / targets.kcal) * 100));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/50">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", complianceColor)} />
              <span className="text-xs text-text-secondary font-mono">{Math.round(stats.kcal)} / {targets.kcal} kcal</span>
              <span className="text-xs text-notion-green font-mono ml-2">{stats.cost.toFixed(2)}€</span>
            </div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
              {pct}% Cumplimiento
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onDateChange(subDays(currentDate, 1))}
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
            onClick={() => onDateChange(addDays(currentDate, 1))}
            className="p-1.5 rounded hover:bg-surface text-text-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex notion-scrollbar overflow-y-auto">
        {/* Time Column */}
        <div className="w-14 sm:w-20 border-r border-border flex flex-col">
          {hours.map(h => (
            <div key={h} className="h-24 sm:h-32 border-b border-border/50 px-2 sm:px-3 pt-2 text-[10px] sm:text-xs text-text-muted font-mono">
              {format(new Date().setHours(h, 0), 'HH:mm')}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 relative">
          {hours.map(h => (
            <div 
              key={h} 
              className="h-24 sm:h-32 border-b border-border/50 hover:bg-surface/10 cursor-pointer transition-colors"
              onClick={() => onAddEvent(dayStr, `${format(new Date().setHours(h, 0), 'HH:mm')}`)}
            />
          ))}

          {dayEvents.map(ev => {
            const [h, m] = ev.time.split(':').map(Number);
            const rowHeight = window.innerWidth < 640 ? 96 : 128;
            const top = (h * rowHeight) + (m / 60 * rowHeight);
            const height = Math.max((ev.duration / 60) * rowHeight, rowHeight * 0.6);
            const evStats = ev.ingredients.reduce((acc, i) => {
              acc.kcal += i.kcal;
              acc.prot += i.prot;
              acc.cost += i.cost;
              return acc;
            }, { kcal: 0, prot: 0, cost: 0 });

            return (
              <div
                key={ev.id}
                onClick={() => onEditEvent(ev)}
                style={{ top: `${top}px`, height: `${height}px` }}
                className="absolute left-1 right-1 sm:left-4 sm:right-4 rounded-lg border border-border bg-surface shadow-lg p-2 sm:p-4 cursor-pointer hover:border-notion-blue transition-all z-20 group"
              >
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-xs text-text-muted font-mono mb-0.5 sm:mb-1">{ev.time} — {ev.duration} min</span>
                    <h3 className="text-xs sm:text-sm font-bold group-hover:text-notion-blue transition-colors truncate max-w-[120px] sm:max-w-none">{ev.title}</h3>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompletion(ev.id);
                    }}
                    className="text-text-muted hover:text-notion-green transition-colors"
                  >
                    {ev.completed ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-notion-green" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>

                <div className="flex gap-2 sm:gap-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[10px] text-text-muted uppercase font-bold tracking-tighter">Calorías</span>
                    <span className="text-xs sm:text-sm font-bold text-notion-orange">{Math.round(evStats.kcal)}k</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[10px] text-text-muted uppercase font-bold tracking-tighter">Proteína</span>
                    <span className="text-xs sm:text-sm font-bold text-notion-blue">{Math.round(evStats.prot)}g</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[10px] text-text-muted uppercase font-bold tracking-tighter">Costo</span>
                    <span className="text-xs sm:text-sm font-bold text-notion-green">{evStats.cost.toFixed(2)}€</span>
                  </div>
                </div>

                {ev.ingredients.length > 0 && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50 hidden xs:block">
                    <div className="flex flex-wrap gap-1">
                      {ev.ingredients.slice(0, 2).map((ing, i) => (
                        <span key={i} className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded bg-bg text-text-secondary border border-border truncate max-w-[60px] sm:max-w-none">
                          {ing.name}
                        </span>
                      ))}
                      {ev.ingredients.length > 2 && (
                        <span className="text-[8px] sm:text-[9px] text-text-muted">+{ev.ingredients.length - 2}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
