import React from 'react';
import { useLab } from '../context/LabContext';
import { 
  Layers, 
  FilePlus2, 
  Users, 
  Send, 
  FlaskConical, 
  Barcode, 
  CheckCircle2, 
  Microscope, 
  FileCheck2, 
  ShieldCheck, 
  DollarSign, 
  Settings 
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const { activeRole, activeModule, setActiveModule } = useLab();

  if (!activeRole) return null;

  const getNavItems = () => {
    switch (activeRole) {
      case 'recepcion':
        return [
          { id: 'principal', label: 'Monitor', icon: Layers },
          { id: 'nueva_orden', label: 'Nueva Orden', icon: FilePlus2 },
          { id: 'pacientes', label: 'Pacientes', icon: Users },
          { id: 'entrega_whatsapp', label: 'WhatsApp', icon: Send },
        ];
      case 'tecnico':
        return [
          { id: 'principal', label: 'Toma Muestras', icon: FlaskConical },
          { id: 'etiquetas', label: 'Etiquetas', icon: Barcode },
          { id: 'historial_tomas', label: 'Historial', icon: CheckCircle2 },
        ];
      case 'quimico':
        return [
          { id: 'principal', label: 'Captura', icon: Microscope },
          { id: 'validadas', label: 'Validadas', icon: FileCheck2 },
          { id: 'alertas', label: 'Fuera Rango', icon: Layers },
        ];
      case 'admin':
        return [
          { id: 'principal', label: 'Métricas', icon: ShieldCheck },
          { id: 'corte_caja', label: 'Corte Caja', icon: DollarSign },
          { id: 'catalogo', label: 'Catálogo', icon: Layers },
          { id: 'configuracion', label: 'Ajustes', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2 py-1">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 active:scale-95 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-sky-50' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[68px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
