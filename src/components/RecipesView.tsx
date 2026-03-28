import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  DollarSign, 
  Tag, 
  X,
  Camera,
  Trash2,
  Save,
  ChevronDown,
  Library,
  UtensilsCrossed,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Recipe, RecipeIngredient, Category, Ingredient } from '../types';

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

type RecipesViewProps = {
  recipes: Recipe[];
  categories: Category[];
  ingredients: Ingredient[];
  onSave: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onAddCategory: (cat: Category) => void;
};

export const RecipesView = ({ recipes, categories, ingredients, onSave, onDelete, onAddCategory }: RecipesViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const handleSave = (recipe: Recipe) => {
    onSave(recipe);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-bg/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Recetas</h1>
            <p className="text-sm text-text-secondary">Crea y gestiona tus platos con cálculos automáticos</p>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-notion-blue hover:bg-notion-blue/90 text-white rounded-md text-sm font-medium transition-all shadow-lg shadow-notion-blue/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Receta</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar recetas o etiquetas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-notion-blue/50 transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-all">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 notion-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecipes.map(recipe => {
            const totals = recipe.ingredients.reduce((acc, ing) => ({
              kcal: acc.kcal + ing.kcal,
              prot: acc.prot + ing.prot,
              carb: acc.carb + ing.carb,
              fat: acc.fat + ing.fat,
              cost: acc.cost + ing.cost
            }), { kcal: 0, prot: 0, carb: 0, fat: 0, cost: 0 });

            return (
              <div 
                key={recipe.id}
                onClick={() => handleEdit(recipe)}
                className="group bg-surface border border-border rounded-xl p-4 hover:border-notion-blue/50 hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-xl">
                      {categories.find(c => c.id === recipe.catId)?.icon || '🍲'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary group-hover:text-notion-blue transition-colors">{recipe.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                          {categories.find(c => c.id === recipe.catId)?.name}
                        </span>
                        <span className="text-[10px] text-text-muted">•</span>
                        <span className="text-[10px] text-text-muted">{recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-bg/50 rounded-lg p-2 flex flex-col items-center justify-center border border-border/50">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Calorías</span>
                    <span className="text-sm font-semibold text-text-primary">{(totals.kcal / recipe.servings).toFixed(0)} <span className="text-[10px] font-normal text-text-muted">kcal</span></span>
                  </div>
                  <div className="bg-bg/50 rounded-lg p-2 flex flex-col items-center justify-center border border-border/50">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Costo</span>
                    <span className="text-sm font-semibold text-notion-green">${(totals.cost / recipe.servings).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-bg border border-border rounded text-[9px] text-text-muted uppercase font-bold tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[10px] text-text-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {(totals.prot / recipe.servings).toFixed(1)}g</span>
                    <span className="flex items-center gap-1"><Wheat className="w-3 h-3" /> {(totals.carb / recipe.servings).toFixed(1)}g</span>
                  </div>
                  <span className="flex items-center gap-1"><Droplet className="w-3 h-3" /> {(totals.fat / recipe.servings).toFixed(1)}g</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <RecipeModal 
          recipe={editingRecipe} 
          categories={categories}
          ingredientsLibrary={ingredients}
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave}
          onDelete={handleDelete}
          onAddCategory={onAddCategory}
        />
      )}
    </div>
  );
};

type ModalProps = {
  recipe: Recipe | null;
  categories: Category[];
  ingredientsLibrary: Ingredient[];
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onAddCategory: (cat: Category) => void;
};

const RecipeModal = ({ recipe, categories, ingredientsLibrary, onClose, onSave, onDelete, onAddCategory }: ModalProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Recipe>(recipe || {
    id: '',
    name: '',
    catId: categories[0]?.id || '1',
    servings: 1,
    tags: [],
    description: '',
    ingredients: [],
    instructions: '',
    photoUrl: ''
  });
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🍴');

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
      amount: '100g', // Default
      kcal: ing.kcal,
      prot: ing.prot,
      carb: ing.carb,
      fat: ing.fat,
      cost: ing.pricePerUnit
    };
    setFormData({ ...formData, ingredients: [...formData.ingredients, newIng] });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-notion-blue/20 rounded-lg flex items-center justify-center text-xl">
              <UtensilsCrossed className="w-4 h-4 text-notion-blue" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              {recipe ? 'Editar receta' : 'Nueva receta'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-bg text-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 notion-scrollbar space-y-8">
          {/* Photo Section */}
          <div className="flex flex-col items-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div 
              onClick={triggerFileInput}
              className="w-full h-48 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-bg/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              {formData.photoUrl ? (
                <>
                  <img 
                    src={formData.photoUrl} 
                    alt="Recipe" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-text-muted group-hover:text-notion-blue transition-colors" />
                  <span className="text-xs text-text-muted group-hover:text-text-secondary">Clic para agregar foto</span>
                </>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Nombre</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                placeholder="Ej. Avena con frutas"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Porciones</label>
                <input 
                  type="number" 
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) || 1 })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                  min="1"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Etiquetas</label>
                <input 
                  type="text" 
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '') })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                  placeholder="saludable, rápido..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Agrupación de ingredientes</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none focus:ring-2 focus:ring-notion-blue/50 outline-none"
                placeholder="Notas sobre la base, toppings, etc."
              />
            </div>
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
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto p-2 notion-scrollbar">
                  <div className="text-[10px] font-bold text-text-muted uppercase p-2 border-b border-border mb-1">Seleccionar Ingrediente</div>
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
                    <div className="p-4 text-center text-text-muted text-xs italic">No hay ingredientes en la biblioteca</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Totals Section */}
          <div className="bg-bg/50 border border-border rounded-xl p-4">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Totales por porción</h4>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-orange-500">{(totals.kcal / formData.servings).toFixed(0)}</span>
                <span className="text-[10px] text-text-muted uppercase">kcal</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-blue-500">{(totals.prot / formData.servings).toFixed(1)}g</span>
                <span className="text-[10px] text-text-muted uppercase">prot</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-yellow-600">{(totals.carb / formData.servings).toFixed(1)}g</span>
                <span className="text-[10px] text-text-muted uppercase">carb</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-yellow-500">{(totals.fat / formData.servings).toFixed(1)}g</span>
                <span className="text-[10px] text-text-muted uppercase">grasa</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-notion-green">${(totals.price / formData.servings).toFixed(2)}</span>
                <span className="text-[10px] text-text-muted uppercase">costo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-bg/50 flex items-center justify-between">
          {recipe && (
            <button 
              onClick={() => onDelete(recipe.id)}
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
              onClick={() => onSave(formData)}
              className="flex items-center gap-2 px-6 py-2 bg-notion-blue hover:bg-notion-blue/90 text-white rounded-md text-sm font-medium transition-all shadow-lg shadow-notion-blue/20"
            >
              <Save className="w-4 h-4" />
              <span>Guardar receta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
