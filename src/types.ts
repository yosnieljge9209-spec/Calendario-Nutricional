export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Ingredient = {
  id: string;
  name: string;
  icon: string;
  foodGroup: string;
  unit: string;
  
  // Nutritional (per unit)
  kcal: number;
  prot: number;
  carb: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  vitaminC?: number;
  calcium?: number;
  satFat?: number;
  iron?: number;
  potassium?: number;
  glycemicIndex?: 'low' | 'medium' | 'high';
  
  // Financial
  pricePerUnit: number;
  purchasePrice?: number;
  purchaseQuantity?: number;
  purchaseUnit?: string;
  brand?: string;
  supplier?: string;
  
  // Metadata
  tags: string[];
  notes?: string;
  photoUrl?: string;
};

export type RecipeIngredient = {
  name: string;
  amount: string;
  kcal: number;
  prot: number;
  carb: number;
  fat: number;
  cost: number;
};

export type Recipe = {
  id: string;
  name: string;
  catId: string;
  servings: number;
  tags: string[];
  description?: string;
  ingredients: RecipeIngredient[];
  instructions?: string;
  photoUrl?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  catId: string;
  recipeId?: string;
  ingredients: RecipeIngredient[];
  completed: boolean;
};

export type PhysiologicalLog = {
  id: string;
  date: string;
  sleepHours: number;
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1: Low, 5: High
  stressLevel: 1 | 2 | 3 | 4 | 5; // 1: Low, 5: High
  hungerLevel: 1 | 2 | 3 | 4 | 5; // 1: Low, 5: High
};

export type Habit = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

export type HabitLog = {
  id: string;
  date: string;
  habitId: string;
  completed: boolean;
};

export type UserTargets = {
  kcal: number;
  prot: number;
  carb: number;
  fat: number;
  water: number;
};

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Goal = 'lose-fat' | 'gain-muscle' | 'recomposition';

export type UserProfile = {
  age: number;
  weight: number; // current weight in kg
  height: number; // cm
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  goal: Goal;
  proteinPreference: number; // g/kg (1.6 - 2.2)
  fatPercentage: number; // 20-30% of total calories
  initialWeight?: number;
  targetWeight?: number;
};

export type WeightLog = {
  id: string;
  date: string;
  weight: number;
};

export type WaterLog = {
  id: string;
  date: string;
  amount: number; // ml
};
