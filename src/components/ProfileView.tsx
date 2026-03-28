import React from 'react';
import { UserProfile, ActivityLevel, Goal } from '../types';
import { User, Scale, Ruler, Activity, Target, Dumbbell, Droplet } from 'lucide-react';

type ProfileViewProps = {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentario (Poco o nada de ejercicio)',
  light: 'Ligero (Ejercicio 1-3 días/semana)',
  moderate: 'Moderado (Ejercicio 3-5 días/semana)',
  active: 'Activo (Ejercicio 6-7 días/semana)',
  very_active: 'Muy Activo (Atleta, trabajo físico)',
};

const GOAL_LABELS: Record<Goal, string> = {
  'lose-fat': 'Perder Grasa (Déficit)',
  'gain-muscle': 'Ganar Músculo (Superávit)',
  'recomposition': 'Recomposición (Mantenimiento)',
};

export const ProfileView = ({ profile, onUpdate }: ProfileViewProps) => {
  const handleChange = (field: keyof UserProfile, value: any) => {
    onUpdate({ ...profile, [field]: value });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-bg notion-scrollbar">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Perfil Metabólico</h1>
          <p className="text-text-secondary">Configura tus parámetros para que el Coach Inteligente ajuste tus metas.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Datos Antropométricos */}
          <section className="space-y-6 bg-surface p-6 rounded-2xl border border-border">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Scale className="w-4 h-4" /> Datos Físicos
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Edad</label>
                  <input 
                    type="number" 
                    value={profile.age}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Género</label>
                  <select 
                    value={profile.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Peso Actual (kg)</label>
                  <input 
                    type="number" 
                    value={profile.weight}
                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={profile.height}
                    onChange={(e) => handleChange('height', Number(e.target.value))}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Actividad y Objetivo */}
          <section className="space-y-6 bg-surface p-6 rounded-2xl border border-border">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Activity className="w-4 h-4" /> Estilo de Vida
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase">Nivel de Actividad</label>
                <select 
                  value={profile.activityLevel}
                  onChange={(e) => handleChange('activityLevel', e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                >
                  {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase">Objetivo Principal</label>
                <select 
                  value={profile.goal}
                  onChange={(e) => handleChange('goal', e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                >
                  {Object.entries(GOAL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Preferencias de Macronutrientes */}
          <section className="space-y-6 bg-surface p-6 rounded-2xl border border-border md:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Target className="w-4 h-4" /> Configuración de Macros (Evidencia Científica)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-2">
                    <Dumbbell className="w-3 h-3 text-notion-blue" /> Proteína (g/kg)
                  </label>
                  <span className="text-sm font-mono font-bold">{profile.proteinPreference} g/kg</span>
                </div>
                <input 
                  type="range" 
                  min="1.6" 
                  max="2.2" 
                  step="0.1"
                  value={profile.proteinPreference}
                  onChange={(e) => handleChange('proteinPreference', Number(e.target.value))}
                  className="w-full accent-notion-blue"
                />
                <p className="text-[10px] text-text-muted italic">Rango óptimo para preservar músculo: 1.6 - 2.2 g/kg.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-2">
                    <Droplet className="w-3 h-3 text-notion-yellow" /> Grasas (% kcal)
                  </label>
                  <span className="text-sm font-mono font-bold">{profile.fatPercentage}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="30" 
                  step="1"
                  value={profile.fatPercentage}
                  onChange={(e) => handleChange('fatPercentage', Number(e.target.value))}
                  className="w-full accent-notion-yellow"
                />
                <p className="text-[10px] text-text-muted italic">Rango saludable: 20% - 30% de las calorías totales.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-notion-blue/5 border border-notion-blue/20 p-4 rounded-xl text-xs text-notion-blue leading-relaxed">
          <strong>Coach Tip:</strong> Los carbohidratos se ajustan automáticamente para completar tus calorías restantes. Esto garantiza que cubras tus necesidades energéticas después de asegurar proteínas y grasas esenciales.
        </div>
      </div>
    </div>
  );
};
