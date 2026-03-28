import React, { useState } from 'react';
import { PhysiologicalLog } from '../types';
import { 
  Moon, 
  Zap, 
  AlertTriangle, 
  Utensils, 
  Plus, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, subDays, addDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface PhysiologicalViewProps {
  logs: PhysiologicalLog[];
  onSave: (log: PhysiologicalLog) => void;
}

export const PhysiologicalView: React.FC<PhysiologicalViewProps> = ({ logs, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const existingLog = logs.find(l => l.date === dateStr);
  
  const [formData, setFormData] = useState<Partial<PhysiologicalLog>>(
    existingLog || {
      sleepHours: 7,
      energyLevel: 3,
      stressLevel: 2,
      hungerLevel: 2,
    }
  );

  React.useEffect(() => {
    if (existingLog) {
      setFormData(existingLog);
    } else {
      setFormData({
        sleepHours: 7,
        energyLevel: 3,
        stressLevel: 2,
        hungerLevel: 2,
      });
    }
  }, [existingLog, selectedDate]);

  const handleSave = () => {
    onSave({
      id: existingLog?.id || Math.random().toString(36).substr(2, 9),
      date: dateStr,
      sleepHours: formData.sleepHours || 0,
      energyLevel: (formData.energyLevel || 3) as any,
      stressLevel: (formData.stressLevel || 2) as any,
      hungerLevel: (formData.hungerLevel || 2) as any,
    });
  };

  const RatingSelector = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon, 
    colorClass 
  }: { 
    label: string, 
    value: number, 
    onChange: (v: number) => void, 
    icon: any,
    colorClass: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", colorClass)} />
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={cn(
              "flex-1 py-3 rounded-xl border transition-all font-bold text-sm",
              value === num 
                ? cn("border-transparent text-white shadow-lg", colorClass.replace('text-', 'bg-')) 
                : "border-border bg-surface hover:border-text-muted text-text-secondary"
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 notion-scrollbar overflow-y-auto p-8 bg-bg">
      <div className="max-w-2xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estado Fisiológico</h1>
            <p className="text-text-secondary mt-1">Registra cómo te sientes para optimizar tu rendimiento.</p>
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

        <div className="grid grid-cols-1 gap-8 bg-surface border border-border rounded-2xl p-8 shadow-sm">
          {/* Sleep Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-notion-purple" />
                <span className="text-sm font-bold">Horas de Sueño</span>
              </div>
              <span className="text-2xl font-bold text-notion-purple">{formData.sleepHours}h</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="12" 
              step="0.5"
              value={formData.sleepHours}
              onChange={(e) => setFormData({ ...formData, sleepHours: Number(e.target.value) })}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-notion-purple"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-bold uppercase tracking-widest">
              <span>3h</span>
              <span>7.5h (Ideal)</span>
              <span>12h</span>
            </div>
          </div>

          <div className="h-px bg-border" />

          <RatingSelector 
            label="Nivel de Energía" 
            value={formData.energyLevel || 3} 
            onChange={(v) => setFormData({ ...formData, energyLevel: v as any })}
            icon={Zap}
            colorClass="text-notion-yellow"
          />

          <RatingSelector 
            label="Nivel de Estrés" 
            value={formData.stressLevel || 2} 
            onChange={(v) => setFormData({ ...formData, stressLevel: v as any })}
            icon={AlertTriangle}
            colorClass="text-notion-red"
          />

          <RatingSelector 
            label="Nivel de Hambre" 
            value={formData.hungerLevel || 2} 
            onChange={(v) => setFormData({ ...formData, hungerLevel: v as any })}
            icon={Utensils}
            colorClass="text-notion-orange"
          />

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-notion-blue hover:bg-notion-blue/90 text-white rounded-xl font-bold shadow-lg shadow-notion-blue/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {existingLog ? 'Actualizar Registro' : 'Guardar Registro Diario'}
          </button>
        </div>

        {/* Insights Section */}
        <div className="bg-notion-blue/5 border border-notion-blue/20 p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-notion-blue uppercase tracking-widest mb-4">¿Por qué registrar esto?</h3>
          <ul className="space-y-3 text-xs text-notion-blue/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span><strong>Sueño:</strong> Menos de 7h correlaciona con un 20% más de hambre al día siguiente.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span><strong>Estrés:</strong> El cortisol elevado puede causar retención de líquidos y antojos.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span><strong>Energía:</strong> Si es baja consistentemente, tu NEAT bajará y quemarás menos calorías.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
