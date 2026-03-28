import { 
  WeightLog, 
  UserProfile, 
  CalendarEvent, 
  PhysiologicalLog, 
  HabitLog, 
  UserTargets 
} from '../types';
import { 
  subDays, 
  isAfter, 
  parseISO, 
  isWeekend, 
} from 'date-fns';

export interface CoachInsight {
  type: 'success' | 'warning' | 'info';
  message: string;
  adjustment?: number; // Recommended calorie adjustment
}

export function getCoachInsights(
  weightLogs: WeightLog[],
  profile: UserProfile,
  events: CalendarEvent[],
  physioLogs: PhysiologicalLog[],
  habitLogs: HabitLog[],
  targets: UserTargets
): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const now = new Date();
  
  // 1. Weight Analysis
  if (weightLogs.length >= 7) {
    const last7Days = weightLogs.filter(log => 
      isAfter(parseISO(log.date), subDays(now, 7))
    );
    const prev7Days = weightLogs.filter(log => 
      isAfter(parseISO(log.date), subDays(now, 14)) && 
      !isAfter(parseISO(log.date), subDays(now, 7))
    );

    if (last7Days.length >= 3 && prev7Days.length >= 3) {
      const avgLast = last7Days.reduce((acc, log) => acc + log.weight, 0) / last7Days.length;
      const avgPrev = prev7Days.reduce((acc, log) => acc + log.weight, 0) / prev7Days.length;
      const weightChangePercent = ((avgLast - avgPrev) / avgPrev) * 100;

      if (profile.goal === 'lose-fat') {
        if (weightChangePercent > -0.2) {
          insights.push({
            type: 'warning',
            message: 'Tu pérdida de peso se ha estancado. Sugiero reducir 150 kcal diarias.',
            adjustment: -150,
          });
        } else if (weightChangePercent < -1.5) {
          insights.push({
            type: 'warning',
            message: 'Estás perdiendo peso demasiado rápido. Aumenta 200 kcal para preservar masa muscular.',
            adjustment: 200,
          });
        } else {
          insights.push({
            type: 'success',
            message: '¡Excelente progreso! Tu ritmo de pérdida de grasa es óptimo.',
          });
        }
      } else if (profile.goal === 'gain-muscle') {
        if (weightChangePercent < 0.1) {
          insights.push({
            type: 'warning',
            message: 'No estás ganando peso. Sugiero aumentar 200 kcal diarias.',
            adjustment: 200,
          });
        } else if (weightChangePercent > 0.6) {
          insights.push({
            type: 'warning',
            message: 'Estás ganando peso muy rápido. Reduce 150 kcal para minimizar la ganancia de grasa.',
            adjustment: -150,
          });
        } else {
          insights.push({
            type: 'success',
            message: 'Ganancia de masa magra en rango ideal. ¡Sigue así!',
          });
        }
      }
    }
  } else {
    insights.push({
      type: 'info',
      message: 'Necesito al menos 7 días de registros de peso para darte recomendaciones precisas.',
    });
  }

  // 2. Behavioral Analysis (Weekends)
  const last14DaysEvents = events.filter(e => isAfter(parseISO(e.date), subDays(now, 14)));
  const weekendEvents = last14DaysEvents.filter(e => isWeekend(parseISO(e.date)));
  const weekdayEvents = last14DaysEvents.filter(e => !isWeekend(parseISO(e.date)));

  const getComplianceRate = (evs: CalendarEvent[]) => {
    if (evs.length === 0) return 1;
    const completed = evs.filter(e => e.completed).length;
    return completed / evs.length;
  };

  if (getComplianceRate(weekendEvents) < getComplianceRate(weekdayEvents) * 0.7) {
    insights.push({
      type: 'warning',
      message: "Detectado patrón de fallo los fines de semana. Intenta preparar tus comidas el viernes.",
    });
  }

  // 3. Protein Consistency
  const dailyProtein = last14DaysEvents.reduce((acc, e) => {
    if (!e.completed) return acc;
    const date = e.date;
    const prot = e.ingredients.reduce((sum, i) => sum + i.prot, 0);
    acc[date] = (acc[date] || 0) + prot;
    return acc;
  }, {} as Record<string, number>);

  const proteinFailDays = Object.values(dailyProtein).filter(p => p < targets.prot * 0.85).length;
  if (proteinFailDays > 3) {
    insights.push({
      type: 'warning',
      message: "Tu ingesta de proteína es inconsistente. Prioriza fuentes de proteína en cada comida.",
    });
  }

  // 4. Physiological Correlations (Sleep vs Hunger)
  const last7Physio = physioLogs.filter(l => isAfter(parseISO(l.date), subDays(now, 7)));
  const poorSleepDays = last7Physio.filter(l => l.sleepHours < 6.5);
  const highHungerDays = last7Physio.filter(l => l.hungerLevel >= 4);

  if (poorSleepDays.length > 2 && highHungerDays.length > 2) {
    insights.push({
      type: 'info',
      message: "Dormir poco está aumentando tu hambre. Prioriza el descanso para mejorar el cumplimiento.",
    });
  }

  const highStressDays = last7Physio.filter(l => l.stressLevel >= 4);
  if (highStressDays.length > 3) {
    insights.push({
      type: 'info',
      message: "Niveles de estrés elevados detectados. Considera una semana de mantenimiento si el cumplimiento baja.",
    });
  }

  return insights;
}
