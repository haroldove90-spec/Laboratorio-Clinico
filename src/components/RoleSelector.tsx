import React from 'react';
import { useLab } from '../context/LabContext';
import { UserRole } from '../types/laboratory';
import { 
  Users, 
  FlaskConical, 
  Microscope, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface RoleOption {
  id: UserRole;
  title: string;
  badge: string;
  icon: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  iconColor: string;
}

export const RoleSelector: React.FC = () => {
  const { setActiveRole, isDemoCleared, restoreDemoData } = useLab();

  const roles: RoleOption[] = [
    {
      id: 'recepcion',
      title: 'Recepción / Mostrador',
      badge: 'Atención y Caja',
      icon: <Users className="w-12 h-12 stroke-[1.75]" />,
      bgGradient: 'hover:bg-sky-50/80 active:bg-sky-100/70',
      borderColor: 'hover:border-sky-500 hover:shadow-sky-100',
      iconColor: 'text-sky-600 group-hover:text-sky-700 group-hover:scale-105 transition-transform duration-200',
    },
    {
      id: 'tecnico',
      title: 'Personal de Laboratorio / Técnico',
      badge: 'Toma de Muestras',
      icon: <FlaskConical className="w-12 h-12 stroke-[1.75]" />,
      bgGradient: 'hover:bg-cyan-50/80 active:bg-cyan-100/70',
      borderColor: 'hover:border-cyan-500 hover:shadow-cyan-100',
      iconColor: 'text-cyan-600 group-hover:text-cyan-700 group-hover:scale-105 transition-transform duration-200',
    },
    {
      id: 'quimico',
      title: 'Químico / Responsable',
      badge: 'Captura y Validación',
      icon: <Microscope className="w-12 h-12 stroke-[1.75]" />,
      bgGradient: 'hover:bg-teal-50/80 active:bg-teal-100/70',
      borderColor: 'hover:border-teal-500 hover:shadow-teal-100',
      iconColor: 'text-teal-600 group-hover:text-teal-700 group-hover:scale-105 transition-transform duration-200',
    },
    {
      id: 'admin',
      title: 'Administrador',
      badge: 'Gerencia y Control',
      icon: <ShieldCheck className="w-12 h-12 stroke-[1.75]" />,
      bgGradient: 'hover:bg-indigo-50/80 active:bg-indigo-100/70',
      borderColor: 'hover:border-indigo-500 hover:shadow-indigo-100',
      iconColor: 'text-indigo-600 group-hover:text-indigo-700 group-hover:scale-105 transition-transform duration-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/40 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Sistema Logo & Brand Title */}
      <div className="flex flex-col items-center mb-10 sm:mb-14 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 p-0.5 shadow-xl shadow-cyan-500/20 mb-4 flex items-center justify-center transform hover:scale-105 transition-all duration-300">
          <div className="w-full h-full bg-white/95 rounded-[22px] flex items-center justify-center backdrop-blur-sm">
            <svg className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v7.31M14 9.3V2M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
              <circle cx="11" cy="16" r="1" fill="currentColor" />
              <circle cx="14" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Laboratorio Clínico
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Sistema Institucional de Gestión y Diagnóstico
        </p>
      </div>

      {/* Cuadrícula 2 Columnas Móvil / 4 Columnas Escritorio: Sin header, sin descripciones, solo nombre del rol y el logo/ícono */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`group flex flex-col items-center justify-center text-center p-5 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm shadow-slate-200/50 hover:shadow-xl transition-all duration-200 cursor-pointer ${role.borderColor} ${role.bgGradient} active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-500/40`}
            >
              {/* Logo / Ícono del rol */}
              <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-200 mb-4 ${role.iconColor}`}>
                {role.icon}
              </div>

              {/* Solo Nombre del Rol */}
              <span className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-slate-950 transition-colors leading-snug">
                {role.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo status note if cleared */}
      {isDemoCleared && (
        <div className="mt-8 text-center">
          <button
            onClick={restoreDemoData}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 px-3 py-1.5 rounded-full transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Datos de muestra borrados (Clic aquí para restaurar datos demo)
          </button>
        </div>
      )}
    </div>
  );
};
