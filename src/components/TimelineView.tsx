import React, { useMemo } from 'react';
import { CalendarEvent, UserTargets, Recipe } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Utensils,
  Info,
  DollarSign,
  ChefHat
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface TimelineViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  targets: UserTargets;
  recipes: Recipe[];
  onToggleCompletion: (id: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  currentDate, 
  onDateChange, 
  events, 
  targets,
  recipes,
  onToggleCompletion,
  onEditEvent
}) => {
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  
  const dayEvents = useMemo(() => 
    events
      .filter(e => e.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time)),
  [events, dateStr]);

  const dailyTotals = useMemo(() => {
    return dayEvents.reduce((acc, e) => {
      if (!e.completed) return acc;
      e.ingredients.forEach(ing => {
        acc.kcal += ing.kcal;
        acc.prot += ing.prot;
        acc.carb += ing.carb;
        acc.fat += ing.fat;
        acc.cost += ing.cost;
      });
      return acc;
    }, { kcal: 0, prot: 0, carb: 0, fat: 0, cost: 0 });
  }, [dayEvents]);

  return (
    <div className="flex-1 notion-scrollbar overflow-y-auto p-4 sm:p-8 bg-bg">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cronograma Diario</h1>
            <p className="text-text-secondary mt-1">Cumplimiento de horarios y detalles de comidas.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1 self-start sm:self-auto">
            <button 
              onClick={() => onDateChange(subDays(currentDate, 1))}
              className="p-2 hover:bg-bg rounded-lg text-text-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 flex items-center gap-2 text-sm font-bold whitespace-nowrap">
              <CalendarIcon className="w-4 h-4 text-notion-blue" />
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            </div>
            <button 
              onClick={() => onDateChange(addDays(currentDate, 1))}
              className="p-2 hover:bg-bg rounded-lg text-text-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Daily Summary Bar */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Calorías</p>
            <p className="text-lg font-bold">{dailyTotals.kcal} <span className="text-xs text-text-muted font-normal">/ {targets.kcal}</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Proteína</p>
            <p className="text-lg font-bold text-notion-blue">{dailyTotals.prot}g <span className="text-xs text-text-muted font-normal">/ {targets.prot}g</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Carbos</p>
            <p className="text-lg font-bold text-notion-orange">{dailyTotals.carb}g <span className="text-xs text-text-muted font-normal">/ {targets.carb}g</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Grasas</p>
            <p className="text-lg font-bold text-notion-yellow">{dailyTotals.fat}g <span className="text-xs text-text-muted font-normal">/ {targets.fat}g</span></p>
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Costo Total</p>
            <p className="text-lg font-bold text-notion-green">${dailyTotals.cost.toFixed(2)}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pl-4 sm:pl-8 space-y-8">
          {/* Vertical Line */}
          <div className="absolute left-[23px] sm:left-[39px] top-4 bottom-4 w-0.5 bg-border" />

          {dayEvents.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mx-auto text-text-muted">
                <Clock className="w-8 h-8" />
              </div>
              <p className="text-text-secondary font-medium">No hay comidas programadas para este día.</p>
            </div>
          ) : (
            dayEvents.map((event) => {
              const recipe = recipes.find(r => r.id === event.recipeId);
              const eventKcal = event.ingredients.reduce((sum, i) => sum + i.kcal, 0);
              const eventProt = event.ingredients.reduce((sum, i) => sum + i.prot, 0);
              const eventCarb = event.ingredients.reduce((sum, i) => sum + i.carb, 0);
              const eventFat = event.ingredients.reduce((sum, i) => sum + i.fat, 0);
              const eventCost = event.ingredients.reduce((sum, i) => sum + i.cost, 0);

              return (
                <div key={event.id} className="relative flex gap-4 sm:gap-8 group">
                  {/* Time Label */}
                  <div className="w-12 sm:w-16 shrink-0 pt-1 text-right">
                    <span className="text-xs sm:text-sm font-bold text-text-primary">{event.time}</span>
                  </div>

                  {/* Bullet / Icon */}
                  <div className={cn(
                    "relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                    event.completed 
                      ? "bg-notion-green border-notion-green text-white" 
                      : "bg-bg border-border text-text-muted group-hover:border-notion-blue"
                  )}>
                    {event.completed ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>

                  {/* Content Card */}
                  <div className={cn(
                    "flex-1 bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm transition-all",
                    event.completed ? "opacity-80 border-notion-green/20" : "hover:border-notion-blue/30"
                  )}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn("text-base sm:text-lg font-bold", event.completed && "line-through text-text-secondary")}>
                            {event.title}
                          </h3>
                          {event.completed && <span className="text-[10px] font-bold text-notion-green uppercase tracking-widest bg-notion-green/10 px-2 py-0.5 rounded">Completado</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.duration} min</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${eventCost.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onEditEvent(event)}
                          className="p-2 rounded-lg hover:bg-bg text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onToggleCompletion(event.id)}
                          className={cn(
                            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
                            event.completed 
                              ? "bg-notion-green/10 text-notion-green hover:bg-notion-green/20" 
                              : "bg-notion-blue text-white hover:bg-notion-blue/90 shadow-lg shadow-notion-blue/20"
                          )}
                        >
                          {event.completed ? 'Desmarcar' : 'Marcar como hecho'}
                        </button>
                      </div>
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <div className="bg-bg/50 p-2 rounded-lg text-center">
                        <p className="text-[8px] font-bold text-text-muted uppercase">Kcal</p>
                        <p className="text-xs font-bold">{eventKcal}</p>
                      </div>
                      <div className="bg-notion-blue/5 p-2 rounded-lg text-center">
                        <p className="text-[8px] font-bold text-notion-blue uppercase">Prot</p>
                        <p className="text-xs font-bold text-notion-blue">{eventProt}g</p>
                      </div>
                      <div className="bg-notion-orange/5 p-2 rounded-lg text-center">
                        <p className="text-[8px] font-bold text-notion-orange uppercase">Carb</p>
                        <p className="text-xs font-bold text-notion-orange">{eventCarb}g</p>
                      </div>
                      <div className="bg-notion-yellow/5 p-2 rounded-lg text-center">
                        <p className="text-[8px] font-bold text-notion-yellow uppercase">Fat</p>
                        <p className="text-xs font-bold text-notion-yellow">{eventFat}g</p>
                      </div>
                    </div>

                    {/* Ingredients & Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                          <Utensils className="w-3 h-3" /> Ingredientes
                        </h4>
                        <ul className="space-y-2">
                          {event.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-center justify-between text-xs">
                              <span className="text-text-secondary">• {ing.name}</span>
                              <span className="font-medium text-text-muted">{ing.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {recipe?.instructions && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                            <ChefHat className="w-3 h-3" /> Elaboración
                          </h4>
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                            {recipe.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
