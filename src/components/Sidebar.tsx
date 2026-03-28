import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  Calendar, 
  BarChart2, 
  BookOpen, 
  Settings, 
  Plus, 
  Cloud, 
  Home,
  LayoutGrid,
  Clock,
  Tag,
  FolderOpen,
  User,
  ShoppingBasket,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
  isCollapsed?: boolean;
};

const SidebarItem = ({ icon, label, active, onClick, badge, isCollapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={cn(
      "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors group relative",
      active ? "bg-surface text-text-primary" : "text-text-secondary hover:bg-surface/50 hover:text-text-primary",
      isCollapsed && "justify-center px-0"
    )}
  >
    <span className={cn("w-4 h-4 flex items-center justify-center opacity-70 group-hover:opacity-100", isCollapsed && "w-8 h-8")}>
      {icon}
    </span>
    {!isCollapsed && <span className="flex-1 text-left truncate">{label}</span>}
    {!isCollapsed && badge && (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-muted">
        {badge}
      </span>
    )}
    {isCollapsed && badge && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-notion-blue rounded-full border border-sidebar" />
    )}
  </button>
);

type SidebarGroupProps = {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onAdd?: () => void;
  isCollapsed?: boolean;
};

const SidebarGroup = ({ label, children, defaultOpen = true, onAdd, isCollapsed }: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return <div className="mb-4 space-y-1">{children}</div>;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center group px-2 mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-0.5 rounded hover:bg-border text-text-muted hover:text-text-secondary transition-colors"
        >
          <ChevronRight className={cn("w-3 h-3 transition-transform", isOpen && "rotate-90")} />
        </button>
        <span className="flex-1 text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">
          {label}
        </span>
        {onAdd && (
          <button
            onClick={onAdd}
            className="p-0.5 rounded hover:bg-border text-text-muted hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
      {isOpen && <div className="space-y-0.5 px-1">{children}</div>}
    </div>
  );
};

type SidebarProps = {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

export const Sidebar = ({ currentView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) => {
  return (
    <aside className={cn(
      "h-full bg-sidebar border-r border-border flex flex-col notion-scrollbar overflow-y-auto transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-60"
    )}>
      <div className={cn("p-4 flex items-center justify-between", isCollapsed && "flex-col gap-4 px-2")}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-notion-orange rounded flex items-center justify-center text-white text-xs font-bold shrink-0">
            🍴
          </div>
          {!isCollapsed && <span className="font-semibold text-sm truncate">NutriPlan</span>}
        </div>
        <button 
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>

      <div className={cn("flex-1 px-2", isCollapsed && "px-1")}>
        <SidebarGroup label="Navegación" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={<Home className="w-4 h-4" />} 
            label="Inicio" 
            active={currentView === 'dashboard'} 
            onClick={() => onViewChange('dashboard')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<Clock className="w-4 h-4" />} 
            label="Cronograma" 
            active={currentView === 'timeline'} 
            onClick={() => onViewChange('timeline')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="Vista Mensual" 
            active={currentView === 'month'} 
            onClick={() => onViewChange('month')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<Calendar className="w-4 h-4" />} 
            label="Vista Semanal" 
            active={currentView === 'week'} 
            onClick={() => onViewChange('week')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<Clock className="w-4 h-4" />} 
            label="Vista Diaria" 
            active={currentView === 'day'} 
            onClick={() => onViewChange('day')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<CheckCircle2 className="w-4 h-4" />} 
            label="Hábitos" 
            active={currentView === 'habits'} 
            onClick={() => onViewChange('habits')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<Activity className="w-4 h-4" />} 
            label="Fisiología" 
            active={currentView === 'physio'} 
            onClick={() => onViewChange('physio')}
            isCollapsed={isCollapsed}
          />
        </SidebarGroup>

        <SidebarGroup label="Análisis" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={<User className="w-4 h-4" />} 
            label="Perfil" 
            active={currentView === 'profile'} 
            onClick={() => onViewChange('profile')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<BarChart2 className="w-4 h-4" />} 
            label="Métricas" 
            active={currentView === 'metrics'} 
            onClick={() => onViewChange('metrics')}
            isCollapsed={isCollapsed}
          />
        </SidebarGroup>

        <SidebarGroup label="Biblioteca" onAdd={() => {}} isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={<BookOpen className="w-4 h-4" />} 
            label="Recetas" 
            active={currentView === 'recipes'} 
            onClick={() => onViewChange('recipes')}
            badge="12"
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<ShoppingBasket className="w-4 h-4" />} 
            label="Ingredientes" 
            active={currentView === 'ingredients'} 
            onClick={() => onViewChange('ingredients')}
            isCollapsed={isCollapsed}
          />
        </SidebarGroup>

        <SidebarGroup label="Sincronización" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={<Cloud className="w-4 h-4" />} 
            label="Google Drive" 
            onClick={() => onViewChange('sync')}
            badge="OK"
            isCollapsed={isCollapsed}
          />
        </SidebarGroup>
      </div>

      <div className={cn("p-4 border-t border-border", isCollapsed && "p-2")}>
        <button className={cn(
          "w-full flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm px-2 py-1.5 rounded hover:bg-surface transition-colors",
          isCollapsed && "justify-center px-0"
        )}>
          <Settings className="w-4 h-4" />
          {!isCollapsed && <span>Configuración</span>}
        </button>
      </div>
    </aside>
  );
};
