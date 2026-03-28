import { UserProfile, UserTargets, ActivityLevel, Goal } from '../types';

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  'lose-fat': -500, // Standard deficit
  'gain-muscle': 300, // Controlled surplus
  'recomposition': 0, // Maintenance
};

export function calculateTargets(profile: UserProfile): UserTargets {
  const { 
    age, 
    weight, 
    height, 
    gender, 
    activityLevel, 
    goal, 
    proteinPreference, 
    fatPercentage 
  } = profile;

  // Mifflin-St Jeor Formula
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  // TDEE Calculation
  const tdee = bmr * ACTIVITY_FACTORS[activityLevel];
  const targetKcal = Math.round(tdee + GOAL_ADJUSTMENTS[goal]);

  // Macronutrient Distribution (Evidence-Based)
  // 1. Protein: 1.6 - 2.2 g/kg (4 kcal/g)
  const targetProt = Math.round(weight * proteinPreference);
  const protKcal = targetProt * 4;

  // 2. Fat: 20-30% of total calories (9 kcal/g)
  const fatKcal = targetKcal * (fatPercentage / 100);
  const targetFat = Math.round(fatKcal / 9);

  // 3. Carbs: Remainder (4 kcal/g)
  const carbKcal = targetKcal - protKcal - fatKcal;
  const targetCarb = Math.round(Math.max(0, carbKcal / 4));

  // Hydration Target: ~35ml per kg
  const targetWater = Math.round(weight * 35);

  return {
    kcal: targetKcal,
    prot: targetProt,
    carb: targetCarb,
    fat: targetFat,
    water: targetWater,
  };
}
