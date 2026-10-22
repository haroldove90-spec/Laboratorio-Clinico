import React from 'react';
import { useLab } from '../context/LabContext';
import { 
  Users, 
  FilePlus2, 
  Send, 
  FlaskConical, 
  Barcode, 
  CheckCircle2, 
  Microscope, 
  FileCheck2, 
  ShieldCheck, 
  DollarSign, 
  Settings, 
  Layers,
  ChevronLeft
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole, activeModule, setActiveModule, setActiveRole } = useLab();

  // Module items based on current active role
  const getNavItems = () => {
    switch (activeRole) {
      case 'recepcion':
        return [
          { id: 'principal', label: 'Monitor de Órdenes', icon: Layers },
          { id: 'nueva_orden', label: 'Nueva Orden de Estudio', icon: FilePlus2 },
          { id: 'pacientes', label: 'Registro de Pacientes', icon: Users },
          { id: 'entrega_whatsapp', label: 'Entrega WhatsApp', icon: Send },
        ];
      case 'tecnico':
        return [
          { id: 'principal', label: 'Pendientes de Toma', icon: FlaskConical },
          { id: 'etiquetas', label: 'Impresión de Etiquetas', icon: Barcode },
          { id: 'historial_tomas', label: 'Muestras Procesadas', icon: CheckCircle2 },
        ];
      case 'quimico':
        return [
          { id: 'principal', label: 'Captura de Resultados', icon: Microscope },
          { id: 'validadas', label: 'Resultados Validados', icon: FileCheck2 },
          { id: 'alertas', label: 'Valores Fuera de Rango', icon: Layers },
        ];
      case 'admin':
        return [
          { id: 'principal', label: 'Panel Gerencial', icon: ShieldCheck },
          { id: 'corte_caja', label: 'Corte de Caja Diario', icon: DollarSign },
          { id: 'catalogo', label: 'Catálogo de Estudios', icon: Layers },
          { id: 'configuracion', label: 'Configuración y Supabase', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 shrink-0 flex-col">
      {/* Modules navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Módulos del Rol
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom role switch */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveRole(null)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Cambiar de Rol</span>
        </button>
      </div>
    </aside>
  );
};
