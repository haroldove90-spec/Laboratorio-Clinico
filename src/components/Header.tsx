import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ClearDataModal } from './shared/ClearDataModal';
import { 
  Download, 
  LogOut, 
  Trash2, 
  FlaskConical
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeRole, setActiveRole, config, isDemoCleared } = useLab();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const roleMeta: Record<string, { label: string; shortLabel: string; badgeClass: string; dotClass: string }> = {
    recepcion: {
      label: 'Recepción / Mostrador',
      shortLabel: 'Recepción',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
      dotClass: 'bg-sky-500',
    },
    tecnico: {
      label: 'Técnico de Muestras',
      shortLabel: 'Técnico',
      badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
      dotClass: 'bg-cyan-500',
    },
    quimico: {
      label: 'Químico Responsable',
      shortLabel: 'Químico',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
      dotClass: 'bg-teal-500',
    },
    admin: {
      label: 'Administrador General',
      shortLabel: 'Admin',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dotClass: 'bg-indigo-500',
    },
  };

  const currentRole = activeRole ? roleMeta[activeRole] : null;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Left: Brand Logo & Title (Sin icono de hamburguesa en móvil y tablet) */}
          <div 
            onClick={() => setActiveRole(null)} 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 select-none"
            title="Cambiar de rol / Ir a inicio"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-xs sm:text-base leading-tight tracking-tight group-hover:text-sky-700 transition-colors">
                Laboratorio Clínico
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden md:inline-block truncate max-w-[170px]">
                {config.nombreLaboratorio}
              </span>
            </div>
          </div>

          {/* Center: Identificación del Rol Activo */}
          <div className="flex items-center justify-center min-w-0">
            {currentRole && (
              <div 
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border ${currentRole.badgeClass} shadow-xs truncate`}
                title={`Rol activo: ${currentRole.label}`}
              >
                <span className={`w-2 h-2 rounded-full ${currentRole.dotClass} animate-pulse shrink-0`} />
                <span className="hidden sm:inline truncate">{currentRole.label}</span>
                <span className="sm:hidden truncate">{currentRole.shortLabel}</span>
              </div>
            )}
          </div>

          {/* Right: Acciones (Borrar Demo, Instalar PWA, Salir) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Botón Borrar Datos Demo */}
            <button
              onClick={() => setShowClearModal(true)}
              title="Borrar datos de muestra del todo el sistema"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                isDemoCleared
                  ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 active:scale-95'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 shrink-0" />
              <span className="hidden lg:inline text-[11px]">
                {isDemoCleared ? 'Datos Limpios' : 'Borrar Demo'}
              </span>
            </button>

            {/* Botón de Instalación Rápida PWA */}
            {!isInstalled && (
              <>
                {isInstallable && (
                  <button
                    onClick={install}
                    className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 active:scale-95 text-white text-[11px] sm:text-xs font-bold px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl shadow-xs shadow-sky-600/30 transition-all cursor-pointer"
                    title="Instalar Laboratorio Clínico como aplicación"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Instalar</span>
                  </button>
                )}

                {isIOS && !isInstallable && (
                  <button
                    onClick={() => setShowIOSModal(true)}
                    className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] sm:text-xs font-semibold px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-colors"
                    title="Instalar en iPhone o iPad"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden sm:inline">Instalar iOS</span>
                  </button>
                )}

                {!isInstallable && !isIOS && (
                  <button
                    onClick={() => {
                      alert('Para instalar la aplicación en su dispositivo o computadora: Abra el menú del navegador y seleccione "Instalar Laboratorio Clínico" o "Agregar a pantalla de inicio".');
                    }}
                    className="hidden xl:flex items-center gap-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-xl transition-colors"
                    title="Información de instalación PWA"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Instalar App</span>
                  </button>
                )}
              </>
            )}

            {/* Botón de Cambio de Rol / Cierre de Sesión */}
            <button
              onClick={() => setActiveRole(null)}
              className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all"
              title="Cambiar de rol o cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 hover:text-red-600 shrink-0" />
              <span className="hidden sm:inline text-[11px]">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Clear Demo Modal */}
      <ClearDataModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
      />

      {/* iOS Safari Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 rounded-xl text-sky-600">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Instalar en iOS</h3>
                <p className="text-xs text-slate-500">iPhone o iPad</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              1. En Safari, toca el botón de <strong>Compartir</strong> (ícono con un cuadrado y flecha hacia arriba).<br />
              2. Desplázate hacia abajo y selecciona <strong>"Agregar al inicio"</strong>.<br />
              3. Toca <strong>Agregar</strong> en la esquina superior derecha.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
