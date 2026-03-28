import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Save, 
  ChevronDown, 
  UtensilsCrossed, 
  Library,
  CheckCircle2,
  Circle,
  Flame,
  Activity,
  Wheat,
  Droplet,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CalendarEvent, RecipeIngredient, Category, Ingredient, Recipe } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type EventModalProps = {
  event: CalendarEvent | null;
  initialDate?: string;
  initialTime?: string;
  ingredientsLibrary: Ingredient[];
  recipesLibrary: Recipe[];
  categories: Category[];
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onAddCategory: (cat: Category) => void;
  onSaveRecurring?: (event: CalendarEvent, mode: 'instance' | 'all') => void;
  onDeleteRecurring?: (id: string, mode: 'instance' | 'all') => void;
};

export const EventModal = ({ 
  event, 
  initialDate, 
  initialTime, 
  ingredientsLibrary, 
  recipesLibrary, 
  categories,
  onClose, 
  onSave, 
  onDelete,
  onAddCategory,
  onSaveRecurring,
  onDeleteRecurring
}: EventModalProps) => {
  const [formData, setFormData] = useState<CalendarEvent>(event || {
    id: Math.random().toString(36).substr(2, 9),
    title: '',
    date: initialDate || format(new Date(), 'yyyy-MM-dd'),
    time: initialTime || '12:00',
    duration: 30,
    catId: categories[0]?.id || '1',
    completed: false,
    ingredients: []
  });
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'ingredients' | 'recipes'>('ingredients');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🍴');
  
  const [showRecurrence, setShowRecurrence] = useState(!!formData.recurrence);
  const [recurrence, setRecurrence] = useState(formData.recurrence || {
    frequency: 'daily' as const,
    interval: 1
  });
  const [saveMode, setSaveMode] = useState<'instance' | 'all' | null>(null);

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      const newCat: Category = {
        id: '', // Will be assigned in App.tsx
        name: newCatName,
        icon: newCatIcon,
        color: 'bg-notion-blue'
      };
      onAddCategory(newCat);
      setNewCatName('');
      setIsAddingCategory(false);
    }
  };

  const totals = useMemo(() => {
    return formData.ingredients.reduce((acc, ing) => ({
      kcal: acc.kcal + (Number(ing.kcal) || 0),
      prot: acc.prot + (Number(ing.prot) || 0),
      carb: acc.carb + (Number(ing.carb) || 0),
      fat: acc.fat + (Number(ing.fat) || 0),
      cost: acc.cost + (Number(ing.cost) || 0)
    }), { kcal: 0, prot: 0, carb: 0, fat: 0, cost: 0 });
  }, [formData.ingredients]);

  const handleAddIngredient = () => {
    const newIng: RecipeIngredient = {
      name: '',
      amount: '',
      kcal: 0,
      prot: 0,
      carb: 0,
      fat: 0,
      cost: 0
    };
    setFormData({ ...formData, ingredients: [...formData.ingredients, newIng] });
  };

  const handleImportIngredient = (ing: Ingredient) => {
    const newIng: RecipeIngredient = {
      name: ing.name,
      amount: '100g',
      kcal: ing.kcal,
      prot: ing.prot,
      carb: ing.carb,
      fat: ing.fat,
      cost: ing.pricePerUnit
    };
    setFormData({ ...formData, ingredients: [...formData.ingredients, newIng] });
    setIsLibraryOpen(false);
  };

  const handleImportRecipe = (recipe: Recipe) => {
    // Import all ingredients from recipe
    const recipeIngredients = recipe.ingredients.map(ing => ({
      ...ing,
      name: `${recipe.name}: ${ing.name}`,
      cost: ing.cost // Ensure we use cost
    }));
    setFormData({ 
      ...formData, 
      title: formData.title || recipe.name,
      catId: recipe.catId || formData.catId,
      ingredients: [...formData.ingredients, ...recipeIngredients] 
    });
    setIsLibraryOpen(false);
  };

  const handleUpdateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-bg/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-xl",
              categories.find(c => c.id === formData.catId)?.color.replace('bg-', 'bg-opacity-20 ')
            )}>
              <UtensilsCrossed className={cn("w-4 h-4", categories.find(c => c.id === formData.catId)?.color.replace('bg-', 'text-'))} />
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              {event ? 'Editar Comida' : 'Nueva Comida'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFormData({ ...formData, completed: !formData.completed })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                formData.completed ? "bg-notion-green text-white" : "bg-bg border border-border text-text-muted hover:text-text-secondary"
              )}
            >
              {formData.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              {formData.completed ? 'Completado' : 'Pendiente'}
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-bg text-text-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 notion-scrollbar space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Título de la comida</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                placeholder="Ej. Desayuno Proteico"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Fecha</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Hora</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Categoría</label>
                  <button 
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className="text-[10px] font-bold text-notion-blue hover:underline uppercase tracking-wider"
                  >
                    {isAddingCategory ? 'Cancelar' : '+ Nueva'}
                  </button>
                </div>
                
                {isAddingCategory ? (
                  <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                    <input 
                      type="text" 
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-10 bg-bg border border-border rounded-lg px-2 py-2 text-center text-sm"
                      placeholder="Icon"
                    />
                    <input 
                      type="text" 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                      placeholder="Nombre..."
                      autoFocus
                    />
                    <button 
                      onClick={handleAddCategory}
                      disabled={!newCatName.trim()}
                      className="px-3 py-2 bg-notion-blue text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select 
                      value={formData.catId}
                      onChange={(e) => setFormData({ ...formData, catId: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-notion-blue/50 outline-none"
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recurrence Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={cn("w-4 h-4", showRecurrence ? "text-notion-blue" : "text-text-muted")} />
                <span className="text-sm font-bold text-text-primary">Repetir evento</span>
              </div>
              <button 
                onClick={() => setShowRecurrence(!showRecurrence)}
                className={cn(
                  "relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-blue focus-visible:ring-offset-2",
                  showRecurrence ? "bg-notion-blue" : "bg-border"
                )}
              >
                <span className={cn(
                  "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                  showRecurrence ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            {showRecurrence && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200 bg-bg/30 p-4 rounded-xl border border-border">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Frecuencia</label>
                  <select 
                    value={recurrence.frequency}
                    onChange={(e) => setRecurrence({ ...recurrence, frequency: e.target.value as any })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                  >
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="monthly">Mensualmente</option>
                    <option value="yearly">Anualmente</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Repetir cada</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1"
                      value={recurrence.interval}
                      onChange={(e) => setRecurrence({ ...recurrence, interval: parseInt(e.target.value) || 1 })}
                      className="w-20 bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                    />
                    <span className="text-xs text-text-muted">
                      {recurrence.frequency === 'daily' ? 'días' : 
                       recurrence.frequency === 'weekly' ? 'semanas' : 
                       recurrence.frequency === 'monthly' ? 'meses' : 'años'}
                    </span>
                  </div>
                </div>

                {recurrence.frequency === 'weekly' && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Repetir los días</label>
                    <div className="flex flex-wrap gap-2">
                      {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            const days = recurrence.daysOfWeek || [];
                            const newDays = days.includes(i) ? days.filter(d => d !== i) : [...days, i];
                            setRecurrence({ ...recurrence, daysOfWeek: newDays });
                          }}
                          className={cn(
                            "w-8 h-8 rounded-full text-xs font-bold transition-all",
                            recurrence.daysOfWeek?.includes(i) ? "bg-notion-blue text-white" : "bg-bg border border-border text-text-muted hover:bg-bg/80"
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Termina</label>
                  <select 
                    value={recurrence.endDate ? 'date' : recurrence.count ? 'count' : 'never'}
                    onChange={(e) => {
                      if (e.target.value === 'never') setRecurrence({ ...recurrence, endDate: undefined, count: undefined });
                      else if (e.target.value === 'date') setRecurrence({ ...recurrence, endDate: format(new Date(), 'yyyy-MM-dd'), count: undefined });
                      else setRecurrence({ ...recurrence, endDate: undefined, count: 10 });
                    }}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                  >
                    <option value="never">Nunca</option>
                    <option value="date">En fecha</option>
                    <option value="count">Después de X veces</option>
                  </select>
                </div>

                {recurrence.endDate !== undefined && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Fecha de fin</label>
                    <input 
                      type="date" 
                      value={recurrence.endDate}
                      onChange={(e) => setRecurrence({ ...recurrence, endDate: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                    />
                  </div>
                )}

                {recurrence.count !== undefined && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Número de veces</label>
                    <input 
                      type="number" 
                      min="1"
                      value={recurrence.count}
                      onChange={(e) => setRecurrence({ ...recurrence, count: parseInt(e.target.value) || 1 })}
                      className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Save Mode Selection for Recurring Events */}
            {event?.recurrence && (
              <div className="p-4 bg-notion-blue/5 border border-notion-blue/20 rounded-xl space-y-3">
                <p className="text-xs font-bold text-notion-blue uppercase tracking-wider">Este es un evento recurrente</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSaveMode('instance')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all",
                      saveMode === 'instance' ? "bg-notion-blue text-white border-notion-blue" : "bg-bg border-border text-text-muted hover:border-notion-blue/50"
                    )}
                  >
                    Solo esta instancia
                  </button>
                  <button
                    onClick={() => setSaveMode('all')}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all",
                      saveMode === 'all' ? "bg-notion-blue text-white border-notion-blue" : "bg-bg border-border text-text-muted hover:border-notion-blue/50"
                    )}
                  >
                    Todos los eventos futuros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ingredients + Metrics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Ingredientes + Métricas</h3>
              <div className="flex items-center gap-4 text-[9px] font-bold text-text-muted uppercase">
                <span className="w-12 text-center">Cant.</span>
                <span className="w-12 text-center">Kcal</span>
                <span className="w-12 text-center">Prot</span>
                <span className="w-12 text-center">Carb</span>
                <span className="w-12 text-center">Grasa</span>
                <span className="w-12 text-center">$</span>
                <span className="w-6"></span>
              </div>
            </div>

            <div className="space-y-2">
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <input 
                    type="text" 
                    value={ing.name}
                    onChange={(e) => handleUpdateIngredient(index, 'name', e.target.value)}
                    className="flex-1 bg-bg border border-border rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-notion-blue/50 outline-none"
                    placeholder="Ingrediente"
                  />
                  <input 
                    type="text" 
                    value={ing.amount}
                    onChange={(e) => handleUpdateIngredient(index, 'amount', e.target.value)}
                    className="w-12 bg-bg border border-border rounded px-2 py-1.5 text-xs text-center focus:ring-1 focus:ring-notion-blue/50 outline-none"
                    placeholder="80g"
                  />
                  <input 
                    type="number" 
                    value={ing.kcal}
                    onChange={(e) => handleUpdateIngredient(index, 'kcal', e.target.value)}
                    className="w-12 bg-bg border border-border rounded px-2 py-1.5 text-xs text-center focus:ring-1 focus:ring-notion-blue/50 outline-none"
                  />
                  <input 
                    type="number" 
                    value={ing.prot}
                    onChange={(e) => handleUpdateIngredient(index, 'prot', e.target.value)}
                    className="w-12 bg-bg border border-border rounded px-2 py-1.5 text-xs text-center focus:ring-1 focus:ring-notion-blue/50 outline-none"
                  />
                  <input 
                    type="number" 
                    value={ing.carb}
                    onChange={(e) => handleUpdateIngredient(index, 'carb', e.target.value)}
                    className="w-12 bg-bg border border-border rounded px-2 py-1.5 text-xs text-center focus:ring-1 focus:ring-notion-blue/50 outline-none"
                  />
                  <input 
                    type="number" 
                    value={ing.fat}
                    onChange={(e) => handleUpdateIngredient(index, 'fat', e.target.value)}
                    className="w-12 bg-bg border border-border rounded px-2 py-1.5 text-xs text-center focus:ring-1 focus:ring-notion-blue/50 outline-none"
                  />
                  <input 
                    type="number" 
                    value={ing.cost}
                    onChange={(e) => handleUpdateIngredient(index, 'cost', e.target.value)}
                    className="w-12 bg-bg border border-border rounded px-2 py-1.5 text-xs text-center focus:ring-1 focus:ring-notion-blue/50 outline-none"
                  />
                  <button 
                    onClick={() => handleRemoveIngredient(index)}
                    className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 relative">
              <button 
                onClick={handleAddIngredient}
                className="flex-1 flex items-center justify-center gap-2 py-2 border border-dashed border-border rounded-lg text-xs text-text-muted hover:bg-bg/50 hover:text-text-secondary transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ingrediente manual</span>
              </button>
              <button 
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="flex-1 flex items-center justify-center gap-2 py-2 border border-dashed border-border rounded-lg text-xs text-notion-blue hover:bg-notion-blue/5 transition-all"
              >
                <Library className="w-3.5 h-3.5" />
                <span>Importar de biblioteca</span>
              </button>

              {isLibraryOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto p-2 notion-scrollbar">
                  <div className="flex border-b border-border mb-2">
                    <button 
                      onClick={() => setLibraryTab('ingredients')}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all",
                        libraryTab === 'ingredients' ? "text-notion-blue border-b-2 border-notion-blue" : "text-text-muted hover:text-text-secondary"
                      )}
                    >
                      Ingredientes
                    </button>
                    <button 
                      onClick={() => setLibraryTab('recipes')}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all",
                        libraryTab === 'recipes' ? "text-notion-blue border-b-2 border-notion-blue" : "text-text-muted hover:text-text-secondary"
                      )}
                    >
                      Recetas
                    </button>
                  </div>

                  {libraryTab === 'ingredients' ? (
                    <div className="space-y-1">
                      {ingredientsLibrary.map(ing => (
                        <button
                          key={ing.id}
                          onClick={() => handleImportIngredient(ing)}
                          className="w-full flex items-center justify-between p-2 hover:bg-bg rounded text-left text-xs transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>{ing.icon}</span>
                            <span className="font-medium">{ing.name}</span>
                          </span>
                          <span className="text-text-muted">{ing.kcal} kcal</span>
                        </button>
                      ))}
                      {ingredientsLibrary.length === 0 && (
                        <div className="p-4 text-center text-text-muted text-xs italic">No hay ingredientes</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recipesLibrary.map(recipe => (
                        <button
                          key={recipe.id}
                          onClick={() => handleImportRecipe(recipe)}
                          className="w-full flex items-center justify-between p-2 hover:bg-bg rounded text-left text-xs transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>{categories.find(c => c.id === recipe.catId)?.icon || '🍲'}</span>
                            <span className="font-medium">{recipe.name}</span>
                          </span>
                          <span className="text-text-muted">
                            {recipe.ingredients.reduce((sum, i) => sum + i.kcal, 0)} kcal
                          </span>
                        </button>
                      ))}
                      {recipesLibrary.length === 0 && (
                        <div className="p-4 text-center text-text-muted text-xs italic">No hay recetas</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Totals Section */}
          <div className="bg-bg/50 border border-border rounded-xl p-4">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Totales de la comida</h4>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-notion-orange">{Math.round(totals.kcal)}</span>
                <span className="text-[10px] text-text-muted uppercase">kcal</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-notion-blue">{Math.round(totals.prot)}g</span>
                <span className="text-[10px] text-text-muted uppercase">prot</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-yellow-600">{Math.round(totals.carb)}g</span>
                <span className="text-[10px] text-text-muted uppercase">carb</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-yellow-500">{Math.round(totals.fat)}g</span>
                <span className="text-[10px] text-text-muted uppercase">grasa</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-notion-green">{totals.cost.toFixed(2)}€</span>
                <span className="text-[10px] text-text-muted uppercase">costo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-bg/50 flex flex-col gap-4">
          {event?.parentId && !saveMode && (
             <div className="flex flex-col gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Opciones de eliminación</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onDelete(event.id)}
                    className="flex-1 py-2 px-3 bg-bg border border-border hover:border-red-500/50 text-red-500 rounded-lg text-xs font-medium transition-all"
                  >
                    Solo este
                  </button>
                  <button 
                    onClick={() => onDeleteRecurring?.(event.id, 'all')}
                    className="flex-1 py-2 px-3 bg-bg border border-border hover:border-red-500/50 text-red-500 rounded-lg text-xs font-medium transition-all"
                  >
                    Todos los futuros
                  </button>
                </div>
             </div>
          )}
          
          <div className="flex items-center justify-between">
            {event && !event.parentId && (
              <button 
                onClick={() => onDelete(event.id)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-md text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary text-sm font-medium transition-all"
            >
              Cancelar
            </button>
            <button 
              disabled={!!event?.recurrence && !saveMode}
              onClick={() => {
                const finalData = {
                  ...formData,
                  recurrence: showRecurrence ? recurrence : undefined
                };
                if (event?.recurrence && onSaveRecurring && saveMode) {
                  onSaveRecurring(finalData, saveMode);
                } else {
                  onSave(finalData);
                }
              }}
              className={cn(
                "flex items-center gap-2 px-6 py-2 bg-notion-blue hover:bg-notion-blue/90 text-white rounded-md text-sm font-medium transition-all shadow-lg shadow-notion-blue/20",
                event?.recurrence && !saveMode && "opacity-50 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4" />
              <span>Guardar Comida</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
