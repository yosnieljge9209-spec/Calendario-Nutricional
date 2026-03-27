/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CalendarMonth } from './components/CalendarMonth';
import { CalendarWeek } from './components/CalendarWeek';
import { CalendarDay } from './components/CalendarDay';
import { MetricsView } from './components/MetricsView';
import { IngredientsView } from './components/IngredientsView';
import { RecipesView } from './components/RecipesView';
import { EventModal } from './components/EventModal';
import { CalendarEvent, UserTargets, Category, Ingredient, Recipe } from './types';
import { Plus, Search, Bell, User, Menu, X } from 'lucide-react';
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
    ingredients: [
      { name: 'Avena', amount: '80g', kcal: 300, prot: 10, carb: 54, fat: 6, cost: 0.4 },
      { name: 'Banana', amount: '1 unc', kcal: 89, prot: 1, carb: 23, fat: 0.3, cost: 0.2 }
    ]
  }
];

const INITIAL_TARGETS: UserTargets = {
  kcal: 2200,
  prot: 160,
  carb: 240,
  fat: 70
};

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Desayuno Proteico',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    duration: 30,
    catId: '1',
    completed: true,
    ingredients: [
      { name: 'Huevos', amount: '3', kcal: 210, prot: 18, carb: 1, fat: 15, cost: 0.5 },
      { name: 'Avena', amount: '50g', kcal: 190, prot: 7, carb: 33, fat: 3, cost: 0.2 }
    ]
  },
  {
    id: '2',
    title: 'Almuerzo Pollo y Arroz',
    date: new Date().toISOString().split('T')[0],
    time: '13:30',
    duration: 45,
    catId: '2',
    completed: false,
    ingredients: [
      { name: 'Pechuga Pollo', amount: '200g', kcal: 330, prot: 62, carb: 0, fat: 7, cost: 2.0 },
      { name: 'Arroz', amount: '100g', kcal: 130, prot: 3, carb: 28, fat: 0, cost: 0.1 }
    ]
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [targets] = useState<UserTargets>(INITIAL_TARGETS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>();
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>();

  const handleAddEvent = (date: string, time?: string) => {
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
    if (selectedEvent) {
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      setEvents([...events, event]);
    }
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setIsEventModalOpen(false);
  };

  const handleToggleEventCompletion = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            events={events} 
            targets={targets} 
            onViewChange={setCurrentView} 
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
            ingredients={ingredients}
            onSave={(recipe) => {
              if (recipes.find(r => r.id === recipe.id)) {
                setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
              } else {
                setRecipes([...recipes, { ...recipe, id: Math.random().toString(36).substr(2, 9) }]);
              }
            }}
            onDelete={(id) => setRecipes(recipes.filter(r => r.id !== id))}
          />
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-text-muted italic">
            Vista "{currentView}" en desarrollo...
          </div>
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
            <div className="relative group hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-text-secondary transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-surface border border-border rounded-md pl-8 pr-3 py-1 text-xs focus:outline-none focus:border-notion-blue w-32 md:w-40 transition-all focus:md:w-60"
              />
            </div>
            <button className="p-1.5 rounded hover:bg-surface text-text-secondary transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-notion-red rounded-full border border-bg" />
            </button>
            <div className="w-7 h-7 rounded-full bg-notion-purple flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:opacity-80 transition-opacity">
              YJ
            </div>
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
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}
