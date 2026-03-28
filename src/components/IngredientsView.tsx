import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  Leaf, 
  Zap, 
  DollarSign, 
  Tag, 
  Info,
  X,
  Camera,
  Trash2,
  Save,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Ingredient } from '../types';

const FOOD_GROUPS = [
  'Carbohidrato',
  'Proteína',
  'Grasa',
  'Vegetal',
  'Fruta',
  'Lácteo',
  'Legumbre',
  'Otro'
];

const UNITS = [
  'Por 100g',
  'Por Unidad',
  'Por 100ml',
  'Por Porción'
];

const GLYCEMIC_INDEX = [
  { value: 'low', label: 'Bajo', color: 'bg-green-500/20 text-green-500' },
  { value: 'medium', label: 'Medio', color: 'bg-yellow-500/20 text-yellow-500' },
  { value: 'high', label: 'Alto', color: 'bg-red-500/20 text-red-500' }
];

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

type IngredientsViewProps = {
  ingredients: Ingredient[];
  onSave: (ing: Ingredient) => void;
  onDelete: (id: string) => void;
};

export const IngredientsView = ({ ingredients, onSave, onDelete }: IngredientsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.foodGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingIngredient(null);
    setIsModalOpen(true);
  };

  const handleSave = (ing: Ingredient) => {
    onSave(ing);
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
            <h1 className="text-2xl font-bold text-text-primary">Ingredientes</h1>
            <p className="text-sm text-text-secondary">Gestiona tu base de datos de alimentos y costos</p>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-notion-blue hover:bg-notion-blue/90 text-white rounded-md text-sm font-medium transition-all shadow-lg shadow-notion-blue/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Ingrediente</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar ingredientes o grupos..." 
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
          {filteredIngredients.map(ing => (
            <div 
              key={ing.id}
              onClick={() => handleEdit(ing)}
              className="group bg-surface border border-border rounded-xl hover:border-notion-blue/50 hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer relative overflow-hidden flex flex-col"
            >
              {ing.photoUrl && (
                <div className="w-full h-32 overflow-hidden border-b border-border">
                  <img 
                    src={ing.photoUrl} 
                    alt={ing.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-xl">
                      {ing.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary group-hover:text-notion-blue transition-colors">{ing.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">{ing.foodGroup}</span>
                    </div>
                  </div>
                  <button className="p-1 rounded hover:bg-bg text-text-muted opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-bg/50 rounded-lg p-2 flex flex-col items-center justify-center border border-border/50">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Calorías</span>
                    <span className="text-sm font-semibold text-text-primary">{ing.kcal} <span className="text-[10px] font-normal text-text-muted">kcal</span></span>
                  </div>
                  <div className="bg-bg/50 rounded-lg p-2 flex flex-col items-center justify-center border border-border/50">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Proteína</span>
                    <span className="text-sm font-semibold text-text-primary">{ing.prot}g</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1 text-notion-green font-semibold">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-sm">{ing.pricePerUnit.toFixed(2)}</span>
                    <span className="text-[10px] text-text-muted font-normal">/ {ing.unit.replace('Por ', '')}</span>
                  </div>
                  {ing.glycemicIndex && (
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                      GLYCEMIC_INDEX.find(gi => gi.value === ing.glycemicIndex)?.color
                    )}>
                      IG {ing.glycemicIndex}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <IngredientModal 
          ingredient={editingIngredient} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

type ModalProps = {
  ingredient: Ingredient | null;
  onClose: () => void;
  onSave: (ing: Ingredient) => void;
  onDelete: (id: string) => void;
};

const IngredientModal = ({ ingredient, onClose, onSave, onDelete }: ModalProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Ingredient>(ingredient || {
    id: '',
    name: '',
    icon: '🍎',
    foodGroup: 'Otro',
    unit: 'Por 100g',
    kcal: 0,
    prot: 0,
    carb: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0,
    vitaminC: 0,
    calcium: 0,
    satFat: 0,
    iron: 0,
    potassium: 0,
    glycemicIndex: 'low',
    pricePerUnit: 0,
    purchasePrice: 0,
    purchaseQuantity: 1,
    purchaseUnit: 'g',
    brand: '',
    supplier: '',
    tags: [],
    notes: ''
  });

  // Auto-calculate price per unit
  React.useEffect(() => {
    if (formData.purchasePrice && formData.purchaseQuantity) {
      let baseQuantity = 1;
      if (formData.unit === 'Por 100g' || formData.unit === 'Por 100ml') {
        baseQuantity = 100;
      }
      
      const calculatedPrice = (formData.purchasePrice / formData.purchaseQuantity) * baseQuantity;
      setFormData(prev => ({ ...prev, pricePerUnit: calculatedPrice }));
    }
  }, [formData.purchasePrice, formData.purchaseQuantity, formData.unit]);

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
            <div className="w-8 h-8 bg-notion-yellow/20 rounded-lg flex items-center justify-center text-xl">
              {formData.icon}
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              {ingredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}
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
                    alt="Ingredient" 
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Nombre</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                placeholder="Ej. Avena"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Icono</label>
              <input 
                type="text" 
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-notion-blue/50 outline-none"
                placeholder="Emoji"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Grupo Alimentario</label>
              <div className="relative">
                <select 
                  value={formData.foodGroup}
                  onChange={(e) => setFormData({ ...formData, foodGroup: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-notion-blue/50 outline-none"
                >
                  {FOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Unidad de Medida</label>
              <div className="relative">
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-notion-blue/50 outline-none"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Nutritional Metrics */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border pb-2">Métricas Nutricionales (Por unidad de medida)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Flame className="w-3 h-3 text-orange-500" /> Calorías (kcal)
                </label>
                <input 
                  type="number" 
                  value={formData.kcal}
                  onChange={(e) => setFormData({ ...formData, kcal: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Dumbbell className="w-3 h-3 text-blue-500" /> Proteína (g)
                </label>
                <input 
                  type="number" 
                  value={formData.prot}
                  onChange={(e) => setFormData({ ...formData, prot: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Wheat className="w-3 h-3 text-yellow-600" /> Carbohidratos (g)
                </label>
                <input 
                  type="number" 
                  value={formData.carb}
                  onChange={(e) => setFormData({ ...formData, carb: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Droplet className="w-3 h-3 text-yellow-500" /> Grasa (g)
                </label>
                <input 
                  type="number" 
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Leaf className="w-3 h-3 text-green-500" /> Fibra (g)
                </label>
                <input 
                  type="number" 
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Zap className="w-3 h-3 text-purple-500" /> Sodio (mg)
                </label>
                <input 
                  type="number" 
                  value={formData.sodium}
                  onChange={(e) => setFormData({ ...formData, sodium: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {/* Added Nutritional Fields */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Droplet className="w-3 h-3 text-red-400" /> Grasa Sat. (g)
                </label>
                <input 
                  type="number" 
                  value={formData.satFat}
                  onChange={(e) => setFormData({ ...formData, satFat: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Zap className="w-3 h-3 text-blue-400" /> Potasio (mg)
                </label>
                <input 
                  type="number" 
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Info className="w-3 h-3 text-notion-blue" /> Índice Gluc.
                </label>
                <div className="relative">
                  <select 
                    value={formData.glycemicIndex}
                    onChange={(e) => setFormData({ ...formData, glycemicIndex: e.target.value as any })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm appearance-none focus:ring-2 focus:ring-notion-blue/50 outline-none"
                  >
                    {GLYCEMIC_INDEX.map(gi => <option key={gi.value} value={gi.value}>{gi.label}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border pb-2">Métricas Financieras y Origen</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <DollarSign className="w-3 h-3 text-notion-green" /> Precio Compra
                </label>
                <input 
                  type="number" 
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="Total pagado"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <Tag className="w-3 h-3 text-notion-blue" /> Cantidad Compra
                </label>
                <div className="flex gap-1">
                  <input 
                    type="number" 
                    value={formData.purchaseQuantity}
                    onChange={(e) => setFormData({ ...formData, purchaseQuantity: Number(e.target.value) })}
                    className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                    placeholder="Cant."
                  />
                  <input 
                    type="text" 
                    value={formData.purchaseUnit}
                    onChange={(e) => setFormData({ ...formData, purchaseUnit: e.target.value })}
                    className="w-16 bg-bg border border-border rounded-lg px-2 py-2 text-sm text-center"
                    placeholder="Unid."
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                  <DollarSign className="w-3 h-3 text-notion-green" /> Precio / Unidad
                </label>
                <div className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-semibold text-notion-green flex items-center justify-between">
                  <span>${formData.pricePerUnit.toFixed(2)}</span>
                  <span className="text-[10px] text-text-muted font-normal uppercase">{formData.unit.replace('Por ', '')}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Marca / Origen</label>
                <input 
                  type="text" 
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ej. Quaker / Local"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Proveedor</label>
                <input 
                  type="text" 
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ej. Supermercado"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Etiquetas</label>
                <input 
                  type="text" 
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                  placeholder="fibra, desayuno..."
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Notas</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-notion-blue/50 outline-none"
              placeholder="Sustitutos, temporada, advertencias..."
            />
          </div>

          {/* Preview Footer */}
          <div className="bg-bg/50 border border-border rounded-xl p-4">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Vista Previa</h4>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-orange-500">{formData.kcal}</span>
                <span className="text-[10px] text-text-muted uppercase">kcal</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-blue-500">{formData.prot}g</span>
                <span className="text-[10px] text-text-muted uppercase">prot</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-yellow-600">{formData.carb}g</span>
                <span className="text-[10px] text-text-muted uppercase">carb</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-yellow-500">{formData.fat}g</span>
                <span className="text-[10px] text-text-muted uppercase">grasa</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-notion-green">${formData.pricePerUnit.toFixed(2)}</span>
                <span className="text-[10px] text-text-muted uppercase">costo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-bg/50 flex items-center justify-between">
          {ingredient && (
            <button 
              onClick={() => onDelete(ingredient.id)}
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
              <span>Guardar ingrediente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
