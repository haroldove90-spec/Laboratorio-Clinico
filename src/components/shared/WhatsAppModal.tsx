import React, { useState } from 'react';
import { Orden } from '../../types/laboratory';
import { useLab } from '../../context/LabContext';
import { 
  Send, 
  X, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle, 
  FileText, 
  Phone, 
  Zap, 
  Clock 
} from 'lucide-react';

interface WhatsAppModalProps {
  orden: Orden | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ orden, onClose, onSuccess }) => {
  const { config, sendWhatsAppResults } = useLab();
  
  if (!orden) return null;

  // Clean phone
  let cleanPhone = orden.paciente.telefono.replace(/\D/g, '');
  if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
    cleanPhone = `52${cleanPhone}`;
  }

  const estudiosNombres = orden.estudios.map((e) => e.nombre).join(', ');

  const defaultMessage = config.whatsapp.plantillaMensaje
    .replace(/{paciente}/g, orden.paciente.nombre)
    .replace(/{folio}/g, orden.folio)
    .replace(/{estudios}/g, estudiosNombres)
    .replace(/{laboratorio}/g, config.nombreLaboratorio);

  const [message, setMessage] = useState(defaultMessage);
  const [targetPhone, setTargetPhone] = useState(cleanPhone);
  const [mode, setMode] = useState<'link' | 'api'>(config.whatsapp.modoEnvio);
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendLink = () => {
    const encoded = encodeURIComponent(message);
    const link = `https://wa.me/${targetPhone}?text=${encoded}`;
    
    // Register sent in context
    sendWhatsAppResults(orden.id, message);
    
    // Open WhatsApp in new window/app
    window.open(link, '_blank', 'noopener,noreferrer');
    
    setSentSuccess(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 1500);
  };

  const handleSendApi = async () => {
    setIsSendingApi(true);
    // Simulate WhatsApp Cloud API dispatch
    await new Promise((res) => setTimeout(res, 1200));
    sendWhatsAppResults(orden.id, message);
    setIsSendingApi(false);
    setSentSuccess(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Envío Digital de Resultados por WhatsApp
              </h3>
              <p className="text-emerald-100 text-xs">
                Orden: <span className="font-mono font-bold text-white">{orden.folio}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {sentSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                ¡Resultados Despachados Exitosamente!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                La orden #{orden.folio} ha sido actualizada y marcada como <strong className="text-emerald-700">"Concluida"</strong> en el sistema.
              </p>
            </div>
          ) : (
            <>
              {/* Selector de Modo */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMode('link')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'link'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Enlace Directo (wa.me)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('api')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'api'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>API WhatsApp Business</span>
                </button>
              </div>

              {/* Paciente y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Paciente</span>
                  <span className="font-bold text-slate-800 text-xs truncate block">{orden.paciente.nombre}</span>
                  <span className="text-[10px] text-slate-500">{orden.paciente.edad} años • {orden.paciente.sexo}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Número de WhatsApp
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <input
                      type="text"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      className="w-full bg-white px-2 py-1 rounded border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Redacción del Mensaje */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700">Mensaje a Enviar:</label>
                  <span className="text-[10px] text-slate-400">PDF clínico anexado</span>
                </div>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-emerald-50/20 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Badge info */}
              <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-xl flex items-center gap-2 text-sky-800 text-xs">
                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Al pulsar el botón se abrirá WhatsApp con el mensaje estructurado y se registrará automáticamente la entrega y fecha de cierre.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!sentSuccess && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            {mode === 'link' ? (
              <button
                onClick={handleSendLink}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Abrir WhatsApp y Registrar</span>
              </button>
            ) : (
              <button
                onClick={handleSendApi}
                disabled={isSendingApi}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isSendingApi ? 'Despachando...' : 'Despachar por API WhatsApp'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
