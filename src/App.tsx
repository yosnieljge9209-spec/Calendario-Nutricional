/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays, addDays, addWeeks, addMonths, addYears, isBefore, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateTargets } from './services/metabolicService';
import { getCoachInsights } from './services/coachService';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CalendarMonth } from './components/CalendarMonth';
import { CalendarWeek } from './components/CalendarWeek';
import { CalendarDay } from './components/CalendarDay';
import { TimelineView } from './components/TimelineView';
import { MetricsView } from './components/MetricsView';
import { IngredientsView } from './components/IngredientsView';
import { RecipesView } from './components/RecipesView';
import { ProfileView } from './components/ProfileView';
import { EventModal } from './components/EventModal';
import { PhysiologicalView } from './components/PhysiologicalView';
import { HabitsView } from './components/HabitsView';
import { SyncView } from './components/SyncView';
import { useSync } from './hooks/useSync';
import { CalendarEvent, UserTargets, Category, Ingredient, Recipe, UserProfile, WaterLog, WeightLog, PhysiologicalLog, Habit, HabitLog } from './types';
import { Plus, Menu, X, ShoppingBasket, Cloud, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: '1',
    name: 'Avena',
    icon: '🌾',
    foodGroup: 'Carbohidrato',
    unit: 'Por 100g',
    kcal: 389,
    prot: 17,
    carb: 66,
    fat: 7,
    fiber: 10.6,
    sodium: 2,
    sugar: 1,
    vitaminC: 0,
    calcium: 54,
    satFat: 1.2,
    iron: 4.7,
    potassium: 429,
    glycemicIndex: 'low',
    pricePerUnit: 0.5,
    purchasePrice: 5.0,
    purchaseQuantity: 1000,
    purchaseUnit: 'g',
    brand: 'Quaker',
    supplier: 'Supermercado Local',
    tags: ['fibra alta', 'desayuno'],
    notes: 'Sustitutos: centeno, cebada.'
  },
  {
    id: '2',
    name: 'Pechuga de Pollo',
    icon: '🍗',
    foodGroup: 'Proteína',
    unit: 'Por 100g',
    kcal: 165,
    prot: 31,
    carb: 0,
    fat: 3.6,
    fiber: 0,
    sodium: 74,
    sugar: 0,
    pricePerUnit: 1.2,
    purchasePrice: 12.0,
    purchaseQuantity: 1000,
    purchaseUnit: 'g',
    brand: 'Fresco',
    tags: ['proteína magra'],
    notes: 'Cocinar a la plancha.'
  }
];

const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Avena con frutas',
    catId: '1',
    servings: 1,
    tags: ['saludable', 'fibra'],
    description: 'Base: avena. Toppings: frutas.',
    instructions: '1. Cocinar la avena con agua o leche. 2. Cortar las frutas. 3. Mezclar y servir con miel.',
    ingredients: [
      { name: 'Avena', amount: '80g', kcal: 300, prot: 10, carb: 54, fat: 6, cost: 0.4 },
      { name: 'Banana', amount: '1 unc', kcal: 89, prot: 1, carb: 23, fat: 0.3, cost: 0.2 }
    ]
  },
  {
    id: '2',
    name: 'Pollo con Arroz y Brócoli',
    catId: '2',
    servings: 1,
    tags: ['proteína', 'volumen'],
    description: 'Comida clásica de gimnasio.',
    instructions: '1. Sellar el pollo a la plancha. 2. Cocinar el arroz al vapor. 3. Hervir el brócoli por 5 min. 4. Servir todo junto.',
    ingredients: [
      { name: 'Pechuga Pollo', amount: '200g', kcal: 330, prot: 62, carb: 0, fat: 7, cost: 2.0 },
      { name: 'Arroz', amount: '100g', kcal: 130, prot: 3, carb: 28, fat: 0, cost: 0.1 },
      { name: 'Brócoli', amount: '150g', kcal: 50, prot: 4, carb: 10, fat: 0.5, cost: 0.5 }
    ]
  }
];

const INITIAL_PROFILE: UserProfile = {
  age: 30,
  weight: 75,
  height: 175,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'recomposition',
  proteinPreference: 2.0,
  fatPercentage: 25,
  initialWeight: 75,
  targetWeight: 72,
};

const INITIAL_TARGETS: UserTargets = calculateTargets(INITIAL_PROFILE);

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Desayuno Proteico',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    duration: 30,
    catId: '1',
    recipeId: '1',
    completed: true,
    ingredients: [
      { name: 'Avena', amount: '80g', kcal: 300, prot: 10, carb: 54, fat: 6, cost: 0.4 },
      { name: 'Banana', amount: '1 unc', kcal: 89, prot: 1, carb: 23, fat: 0.3, cost: 0.2 }
    ]
  },
  {
    id: '2',
    title: 'Almuerzo Pollo y Arroz',
    date: new Date().toISOString().split('T')[0],
    time: '13:30',
    duration: 45,
    catId: '2',
    recipeId: '2',
    completed: false,
    ingredients: [
      { name: 'Pechuga Pollo', amount: '200g', kcal: 330, prot: 62, carb: 0, fat: 7, cost: 2.0 },
      { name: 'Arroz', amount: '100g', kcal: 130, prot: 3, carb: 28, fat: 0, cost: 0.1 },
      { name: 'Brócoli', amount: '150g', kcal: 50, prot: 4, carb: 10, fat: 0.5, cost: 0.5 }
    ]
  }
];

const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Proteína Diaria', description: 'Alcanzar el 90% de la meta de proteína', icon: '🥩', color: 'bg-notion-blue/10 text-notion-blue' },
  { id: '2', name: 'Calorías en Rango', description: 'No exceder el 110% de las calorías', icon: '🔥', color: 'bg-notion-orange/10 text-notion-orange' },
  { id: '3', name: 'Comida Real', description: 'Evitar ultraprocesados hoy', icon: '🥦', color: 'bg-notion-green/10 text-notion-green' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Desayuno', color: 'bg-orange-500', icon: '🌅' },
  { id: '2', name: 'Almuerzo', color: 'bg-blue-500', icon: '🍲' },
  { id: '3', name: 'Cena', color: 'bg-purple-500', icon: '🌙' },
  { id: '4', name: 'Snack', color: 'bg-green-500', icon: '🍎' }
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('nutriplan_categories');
    try {
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nutriplan_profile');
    try {
      return saved ? { ...INITIAL_PROFILE, ...JSON.parse(saved) } : INITIAL_PROFILE;
    } catch (e) {
      return INITIAL_PROFILE;
    }
  });
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('nutriplan_events');
    try {
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch (e) {
      return INITIAL_EVENTS;
    }
  });
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    const saved = localStorage.getItem('nutriplan_weight');
    try {
      return saved ? JSON.parse(saved) : [
        { id: '1', date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), weight: 76.5 },
        { id: '2', date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), weight: 76.0 },
        { id: '3', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), weight: 75.5 },
        { id: '4', date: format(new Date(), 'yyyy-MM-dd'), weight: 75.0 },
      ];
    } catch (e) {
      return [];
    }
  });
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem('nutriplan_water');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [physioLogs, setPhysioLogs] = useState<PhysiologicalLog[]>(() => {
    const saved = localStorage.getItem('nutriplan_physio');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('nutriplan_habits');
    try {
      return saved ? JSON.parse(saved) : INITIAL_HABITS;
    } catch (e) {
      return INITIAL_HABITS;
    }
  });
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => {
    const saved = localStorage.getItem('nutriplan_habit_logs');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [targets, setTargets] = useState<UserTargets>(INITIAL_TARGETS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>();
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>();

  // Sync logic
  const nutriData = {
    userProfile,
    events,
    weightLogs,
    waterLogs,
    physioLogs,
    habits,
    habitLogs,
    categories,
    ingredients,
    recipes
  };

  const handleSyncComplete = useCallback((data: any) => {
    if (!data) return;
    if (data.userProfile) setUserProfile(data.userProfile);
    if (data.events) setEvents(data.events);
    if (data.weightLogs) setWeightLogs(data.weightLogs);
    if (data.waterLogs) setWaterLogs(data.waterLogs);
    if (data.physioLogs) setPhysioLogs(data.physioLogs);
    if (data.habits) setHabits(data.habits);
    if (data.habitLogs) setHabitLogs(data.habitLogs);
    if (data.categories) setCategories(data.categories);
    if (data.ingredients) setIngredients(data.ingredients);
    if (data.recipes) setRecipes(data.recipes);
  }, []);

  const { status, lastSync, error: syncError, isAuthenticated, download, upload } = useSync(nutriData, handleSyncComplete);

  useEffect(() => {
    localStorage.setItem('nutriplan_profile', JSON.stringify(userProfile));
    localStorage.setItem('nutriplan_events', JSON.stringify(events));
    localStorage.setItem('nutriplan_weight', JSON.stringify(weightLogs));
    localStorage.setItem('nutriplan_water', JSON.stringify(waterLogs));
    localStorage.setItem('nutriplan_physio', JSON.stringify(physioLogs));
    localStorage.setItem('nutriplan_habits', JSON.stringify(habits));
    localStorage.setItem('nutriplan_habit_logs', JSON.stringify(habitLogs));
    localStorage.setItem('nutriplan_categories', JSON.stringify(categories));
    
    const baseTargets = calculateTargets(userProfile);
    // Apply coach adjustments if any
    const insights = getCoachInsights(weightLogs, userProfile, events, physioLogs, habitLogs, baseTargets);
    const adjustment = insights.reduce((acc, insight) => acc + (insight.adjustment || 0), 0);
    
    setTargets({
      ...baseTargets,
      kcal: baseTargets.kcal + adjustment
    });
  }, [userProfile, events, weightLogs, waterLogs, physioLogs, habits, habitLogs]);

  const handleLogWeight = (weight: number) => {
    const date = format(new Date(), 'yyyy-MM-dd');
    const existingIndex = weightLogs.findIndex(l => l.date === date);
    
    if (existingIndex >= 0) {
      const newLogs = [...weightLogs];
      newLogs[existingIndex] = { ...newLogs[existingIndex], weight };
      setWeightLogs(newLogs);
    } else {
      const newLog: WeightLog = {
        id: Math.random().toString(36).substr(2, 9),
        date,
        weight,
      };
      setWeightLogs([...weightLogs, newLog]);
    }
    
    // Also update current weight in profile
    setUserProfile({ ...userProfile, weight });
  };

  const handleAddWater = (amount: number) => {
    const newLog: WaterLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: format(new Date(), 'yyyy-MM-dd'),
      amount,
    };
    setWaterLogs([...waterLogs, newLog]);
  };

  const handleAddEvent = (date?: string, time?: string) => {
    setSelectedEvent(null);
    setModalInitialDate(date);
    setModalInitialTime(time);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    if (event.recurrence) {
      const instances = generateRecurringEvents(event);
      if (selectedEvent) {
        // If it was already recurring, we might want to clean up old ones
        // But for a simple "Save" we'll just replace this one and add others
        setEvents(prev => [...prev.filter(e => e.id !== event.id), ...instances]);
      } else {
        setEvents(prev => [...prev, ...instances]);
      }
    } else {
      if (selectedEvent) {
        setEvents(events.map(e => e.id === event.id ? event : e));
      } else {
        setEvents([...events, event]);
      }
    }
    setIsEventModalOpen(false);
  };

  const handleSaveRecurringEvent = (event: CalendarEvent, mode: 'instance' | 'all') => {
    if (mode === 'instance') {
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      // Update all future instances with same parentId
      const parentId = event.parentId || event.id;
      const baseDate = event.date;
      
      // Delete all future instances
      const filteredEvents = events.filter(e => {
        if (e.parentId !== parentId && e.id !== parentId) return true;
        return isBefore(parseISO(e.date), parseISO(baseDate));
      });

      // Generate new instances starting from this one
      const newInstances = generateRecurringEvents({ ...event, id: parentId, parentId: undefined });
      setEvents([...filteredEvents, ...newInstances]);
    }
    setIsEventModalOpen(false);
  };

  const generateRecurringEvents = (baseEvent: CalendarEvent): CalendarEvent[] => {
    if (!baseEvent.recurrence) return [baseEvent];

    const instances: CalendarEvent[] = [];
    const { frequency, interval, endDate, count, daysOfWeek } = baseEvent.recurrence;
    const startDate = parseISO(baseEvent.date);
    let currentDate = startDate;
    let occurrences = 0;

    const maxDate = endDate ? parseISO(endDate) : addYears(startDate, 1);
    const maxCount = count || 365;

    while (occurrences < maxCount && (isBefore(currentDate, maxDate) || format(currentDate, 'yyyy-MM-dd') === format(maxDate, 'yyyy-MM-dd'))) {
      if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
        // Find all days in this week that match daysOfWeek
        for (let i = 0; i < 7; i++) {
          const dayDate = addDays(currentDate, i);
          if (isBefore(dayDate, startDate)) continue;
          if (endDate && isAfter(dayDate, maxDate)) break;
          if (occurrences >= maxCount) break;

          if (daysOfWeek.includes(dayDate.getDay())) {
            instances.push({
              ...baseEvent,
              id: occurrences === 0 ? baseEvent.id : Math.random().toString(36).substr(2, 9),
              date: format(dayDate, 'yyyy-MM-dd'),
              parentId: baseEvent.id,
              recurrence: undefined // Instances don't carry the recurrence data to avoid recursive expansion
            });
            occurrences++;
          }
        }
      } else {
        instances.push({
          ...baseEvent,
          id: occurrences === 0 ? baseEvent.id : Math.random().toString(36).substr(2, 9),
          date: format(currentDate, 'yyyy-MM-dd'),
          parentId: baseEvent.id,
          recurrence: undefined
        });
        occurrences++;
      }

      if (frequency === 'daily') currentDate = addDays(currentDate, interval);
      else if (frequency === 'weekly') currentDate = addWeeks(currentDate, interval);
      else if (frequency === 'monthly') currentDate = addMonths(currentDate, interval);
      else if (frequency === 'yearly') currentDate = addYears(currentDate, interval);
    }

    return instances;
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setIsEventModalOpen(false);
  };

  const handleDeleteRecurringEvent = (id: string, mode: 'instance' | 'all') => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    if (mode === 'instance') {
      setEvents(events.filter(e => e.id !== id));
    } else {
      const parentId = event.parentId || event.id;
      const baseDate = event.date;
      
      setEvents(events.filter(e => {
        if (e.parentId !== parentId && e.id !== parentId) return true;
        return isBefore(parseISO(e.date), parseISO(baseDate));
      }));
    }
    setIsEventModalOpen(false);
  };

  const handleToggleEventCompletion = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const handleSavePhysio = (log: PhysiologicalLog) => {
    setPhysioLogs(prev => {
      const existing = prev.findIndex(l => l.date === log.date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = log;
        return updated;
      }
      return [...prev, log];
    });
  };

  const handleToggleHabit = (habitId: string, date: string) => {
    setHabitLogs(prev => {
      const existing = prev.findIndex(l => l.habitId === habitId && l.date === date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], completed: !updated[existing].completed };
        return updated;
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), habitId, date, completed: true }];
    });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleAddCategory = (category: Category) => {
    setCategories(prev => [...prev, { ...category, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            events={events} 
            targets={targets} 
            waterLogs={waterLogs}
            weightLogs={weightLogs}
            physioLogs={physioLogs}
            habitLogs={habitLogs}
            habits={habits}
            profile={userProfile}
            onAddWater={handleAddWater}
            onLogWeight={handleLogWeight}
            onViewChange={setCurrentView} 
          />
        );
      case 'timeline':
        return (
          <TimelineView 
            currentDate={currentDate} 
            onDateChange={setCurrentDate}
            events={events}
            targets={targets}
            recipes={recipes}
            onToggleCompletion={handleToggleEventCompletion}
            onEditEvent={handleEditEvent}
          />
        );
      case 'month':
        return (
          <CalendarMonth 
            currentDate={currentDate} 
            onDateChange={setCurrentDate}
            events={events}
            targets={targets}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
          />
        );
      case 'week':
        return (
          <CalendarWeek 
            currentDate={currentDate} 
            onDateChange={setCurrentDate}
            events={events}
            targets={targets}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
          />
        );
      case 'day':
        return (
          <CalendarDay 
            currentDate={currentDate} 
            onDateChange={setCurrentDate}
            events={events}
            targets={targets}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onToggleCompletion={handleToggleEventCompletion}
          />
        );
      case 'metrics':
        return (
          <MetricsView 
            events={events} 
            targets={targets} 
          />
        );
      case 'ingredients':
        return (
          <IngredientsView 
            ingredients={ingredients}
            onSave={(ing) => {
              if (ingredients.find(i => i.id === ing.id)) {
                setIngredients(ingredients.map(i => i.id === ing.id ? ing : i));
              } else {
                setIngredients([...ingredients, { ...ing, id: Math.random().toString(36).substr(2, 9) }]);
              }
            }}
            onDelete={(id) => setIngredients(ingredients.filter(i => i.id !== id))}
          />
        );
      case 'recipes':
        return (
          <RecipesView 
            recipes={recipes}
            categories={categories}
            ingredients={ingredients}
            onSave={(recipe) => {
              if (recipes.find(r => r.id === recipe.id)) {
                setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
              } else {
                setRecipes([...recipes, { ...recipe, id: Math.random().toString(36).substr(2, 9) }]);
              }
            }}
            onDelete={(id) => setRecipes(recipes.filter(r => r.id !== id))}
            onAddCategory={handleAddCategory}
          />
        );
      case 'profile':
        return (
          <ProfileView 
            profile={userProfile}
            onUpdate={setUserProfile}
          />
        );
      case 'physio':
        return (
          <PhysiologicalView 
            logs={physioLogs} 
            onSave={handleSavePhysio} 
          />
        );
      case 'habits':
        return (
          <HabitsView 
            habits={habits} 
            habitLogs={habitLogs}
            onToggleHabit={handleToggleHabit}
            onAddHabit={(h) => setHabits(prev => [...prev, h])}
          />
        );
      case 'sync':
        return (
          <SyncView 
            onSyncComplete={handleSyncComplete}
            getCurrentData={() => nutriData}
            syncStatus={status}
            lastSync={lastSync}
            syncError={syncError}
            isAuthenticated={isAuthenticated}
            onDownload={download}
            onUpload={() => upload(nutriData)}
          />
        );
      default:
        return (
          <Dashboard 
            events={events} 
            targets={targets} 
            waterLogs={waterLogs}
            weightLogs={weightLogs}
            physioLogs={physioLogs}
            habitLogs={habitLogs}
            habits={habits}
            profile={userProfile}
            onAddWater={handleAddWater}
            onLogWeight={handleLogWeight}
            onViewChange={setCurrentView} 
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          currentView={currentView} 
          onViewChange={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-bg/80 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  toggleSidebarCollapse();
                } else {
                  toggleSidebar();
                }
              }}
              className="p-1.5 rounded hover:bg-surface text-text-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-xs text-text-secondary">
              <span 
                onClick={() => setCurrentView('dashboard')}
                className="hover:text-text-primary cursor-pointer transition-colors"
              >
                NutriPlan
              </span>
              <span className="text-text-muted">/</span>
              <span className="text-text-primary font-medium capitalize">{currentView}</span>
            </div>
            <div className="flex sm:hidden items-center gap-1 text-[10px] text-text-secondary">
              <span 
                onClick={() => setCurrentView('dashboard')}
                className="text-text-primary font-bold cursor-pointer"
              >
                {format(new Date(), 'd MMM', { locale: es })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync Status Indicator */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full bg-surface border border-border text-[10px] font-medium text-text-secondary">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  status === 'loading' ? "bg-notion-orange animate-pulse" :
                  status === 'error' ? "bg-notion-red" :
                  status === 'success' ? "bg-notion-green" : "bg-notion-green/50"
                )} />
                <span className="max-w-[100px] truncate">
                  {status === 'loading' ? 'Sincronizando...' : 
                   status === 'error' ? 'Error de sincronización' : 
                   lastSync ? `Sincronizado: ${lastSync.split(',')[1]}` : 'Conectado'}
                </span>
                {status === 'error' && (
                  <button onClick={download} className="text-notion-blue hover:underline">Reintentar</button>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {isEventModalOpen && (
        <EventModal 
          event={selectedEvent}
          initialDate={modalInitialDate}
          initialTime={modalInitialTime}
          ingredientsLibrary={ingredients}
          recipesLibrary={recipes}
          categories={categories}
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onAddCategory={handleAddCategory}
          onSaveRecurring={handleSaveRecurringEvent}
          onDeleteRecurring={handleDeleteRecurringEvent}
        />
      )}
    </div>
  );
}

export default App;
