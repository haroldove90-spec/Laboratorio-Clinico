import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Trash2, AlertTriangle, CheckSquare, Square, Database, RefreshCw, X } from 'lucide-react';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({ isOpen, onClose }) => {
  const { 
    clearDemoData, 
    restoreDemoData, 
    isDemoCleared, 
    config, 
    clearSupabaseRecords 
  } = useLab();

  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [clearSupabase, setClearSupabase] = useState(config.supabase.connected);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteClear = async () => {
    setIsProcessing(true);
    try {
      clearDemoData(dontShowAgain);

      if (clearSupabase && config.supabase.connected) {
        const res = await clearSupabaseRecords();
        setFeedback(res.message);
      } else {
        setFeedback('Datos de muestra eliminados del sistema correctamente.');
      }

      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        setFeedback(null);
      }, 1000);
    } catch {
      setIsProcessing(false);
      setFeedback('Ocurrió un error al limpiar los datos.');
    }
  };

  const handleRestore = () => {
    restoreDemoData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50/80 px-6 py-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <h3 className="font-bold text-base text-red-900">
              Borrar Datos de Muestra
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Esta acción vaciará todas las órdenes de prueba y pacientes de demostración para iniciar el laboratorio con un registro en blanco y limpio.
          </p>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {/* Opción para no volver a cargar datos demo en el navegador */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setDontShowAgain(!dontShowAgain)}
                className="mt-0.5 text-sky-600 hover:text-sky-700 focus:outline-none"
              >
                {dontShowAgain ? (
                  <CheckSquare className="w-5 h-5 fill-sky-600 text-white" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </button>
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  No volver a cargar datos de muestra en este navegador
                </span>
                <span className="text-slate-500">
                  Guarda la preferencia permanente en el almacenamiento local para que al recargar la app inicie vacía.
                </span>
              </div>
            </label>

            {/* Opción Supabase */}
            <label className={`flex items-start gap-3 cursor-pointer select-none ${!config.supabase.connected ? 'opacity-60' : ''}`}>
              <button
                type="button"
                disabled={!config.supabase.connected}
                onClick={() => setClearSupabase(!clearSupabase)}
                className="mt-0.5 text-teal-600 hover:text-teal-700 focus:outline-none"
              >
                {clearSupabase && config.supabase.connected ? (
                  <CheckSquare className="w-5 h-5 fill-teal-600 text-white" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </button>
              <div className="text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-teal-600" />
                  Borrar registros en Supabase al ejecutar
                </span>
                <span className="text-slate-500">
                  {config.supabase.connected
                    ? `Sincronizado con tabla "${config.supabase.tableName}". Se limpiarán los registros remotos.`
                    : 'Supabase aún no está conectado (se puede vincular en el módulo de Administrador).'}
                </span>
              </div>
            </label>
          </div>

          {feedback && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-800 font-medium animate-in fade-in">
              {feedback}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3">
          {isDemoCleared ? (
            <button
              onClick={handleRestore}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
              Restaurar Demo
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleExecuteClear}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isProcessing ? 'Limpiando...' : 'Confirmar y Borrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
