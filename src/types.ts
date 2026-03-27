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

export type UserTargets = {
  kcal: number;
  prot: number;
  carb: number;
  fat: number;
};
