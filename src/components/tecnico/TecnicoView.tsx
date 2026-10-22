import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Orden, MuestraStatus } from '../../types/laboratory';
import { TubeLabelModal } from '../shared/TubeLabelModal';
import { 
  FlaskConical, 
  Barcode, 
  CheckCircle, 
  Clock, 
  Search, 
  AlertTriangle, 
  Check, 
  X, 
  Printer, 
  Layers,
  ArrowRight,
  Filter,
  Tag
} from 'lucide-react';

export const TecnicoView: React.FC = () => {
  const { 
    orders, 
    updateSampleStatus, 
    markAllSamplesTaken, 
    updateOrderStatus,
    activeModule 
  } = useLab();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Orden | null>(null);

  // Reject modal state
  const [rejectingInfo, setRejectingInfo] = useState<{
    orderId: string;
    estudioId: string;
    studyName: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('Muestra hemolizada');

  // Filter orders for sampling area
  const pendingOrders = orders.filter((o) => o.estatusGeneral === 'pendiente_toma');
  const processedOrders = orders.filter((o) => o.estatusGeneral !== 'pendiente_toma');

  const handleMarkSingleSampleTaken = (orderId: string, estudioId: string) => {
    updateSampleStatus(orderId, estudioId, 'tomada');
  };

  const handleExecuteReject = () => {
    if (!rejectingInfo) return;
    updateSampleStatus(rejectingInfo.orderId, rejectingInfo.estudioId, 'rechazada', rejectReason);
    setRejectingInfo(null);
  };

  const handleSendToAnalytics = (orderId: string) => {
    updateOrderStatus(orderId, 'en_analisis');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Area Técnica */}
      <div className="bg-gradient-to-r from-cyan-700 via-cyan-800 to-sky-900 text-white rounded-2xl p-4 sm:p-6 shadow-md shadow-cyan-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-cyan-200" />
              <span>Fase 2: Toma de Muestras & Etiquetado</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight">
              {activeModule === 'etiquetas' 
                ? 'Centro de Impresión de Etiquetas y Códigos de Barras' 
                : activeModule === 'historial_tomas'
                ? 'Historial de Muestras Tomadas y Canalizadas'
                : 'Área de Toma de Muestras y Flebotomía'}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 max-w-xl mt-0.5 sm:mt-1">
              {activeModule === 'etiquetas'
                ? 'Generación rápida e impresión térmica de códigos de barras para tubos y contenedores biológicos.'
                : activeModule === 'historial_tomas'
                ? 'Control y trazabilidad de muestras biológicas enviadas a análisis clínico o maquila.'
                : 'Identificación de pacientes en sala de espera, extracción sanguínea y verificación de tubos.'}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 p-2.5 sm:p-3 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-black text-white">{pendingOrders.length}</span>
              <span className="text-[10px] text-cyan-200 uppercase font-semibold">Pendientes</span>
            </div>
            <div className="w-[1px] h-7 bg-white/20" />
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-black text-cyan-200">{processedOrders.length}</span>
              <span className="text-[10px] text-cyan-200 uppercase font-semibold">Procesadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. MÓDULO: IMPRESIÓN DE ETIQUETAS */}
      {activeModule === 'etiquetas' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar orden para imprimir etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>
            <div className="text-xs text-slate-500">
              Selecciona una orden para generar las etiquetas térmicas con código de barras.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders
              .filter(
                (o) =>
                  o.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-cyan-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {ord.folio}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ord.fechaCreacion).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 truncate">{ord.paciente.nombre}</h4>
                      <p className="text-xs text-slate-500">{ord.paciente.edad} años • {ord.paciente.sexo}</p>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Tubos y Muestras requeridas ({ord.estudios.length}):
                      </span>
                      {ord.estudios.map((est, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: est.colorTuboHex }} />
                          <span className="truncate">{est.nombre} ({est.codigo})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLabelOrder(ord)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Barcode className="w-4 h-4" />
                    <span>Ver e Imprimir Etiquetas</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 2. MÓDULO: PENDIENTES DE TOMA & HISTORIAL DE TOMAS */}
      {(activeModule === 'principal' || activeModule === 'historial_tomas') && (
        <div className="space-y-4">
          {/* Buscador & Scanner */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por folio (ej. ORD-2026-1001) o paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 font-medium"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Mostrando: <strong className="text-slate-800">
                {(activeModule === 'historial_tomas' ? processedOrders : pendingOrders).filter(
                  (o) =>
                    o.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                ).length}
              </strong> órdenes en lista
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {((activeModule === 'historial_tomas' ? processedOrders : pendingOrders).filter(
              (o) =>
                o.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            )).length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No hay órdenes pendientes en este módulo</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {activeModule === 'historial_tomas'
                    ? 'Aún no se han completado tomas de muestras en esta sesión.'
                    : 'Todas las muestras pendientes han sido recolectadas o no coinciden con la búsqueda.'}
                </p>
              </div>
            ) : (
              (activeModule === 'historial_tomas' ? processedOrders : pendingOrders)
                .filter(
                  (o) =>
                    o.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4 hover:border-slate-300 transition-all"
                  >
                    {/* Header Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg">
                          {ord.folio}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">{ord.paciente.nombre}</h3>
                          <p className="text-xs text-slate-500">
                            {ord.paciente.edad} años • {ord.paciente.sexo === 'M' ? 'Masculino' : 'Femenino'} • Tel: {ord.paciente.telefono}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLabelOrder(ord)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          <Barcode className="w-3.5 h-3.5 text-slate-600" />
                          <span>Etiquetas ({ord.estudios.length})</span>
                        </button>

                        {ord.estatusGeneral === 'pendiente_toma' && (
                          <button
                            onClick={() => markAllSamplesTaken(ord.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Recolectar Todas</span>
                          </button>
                        )}

                        {ord.estatusGeneral === 'muestra_tomada' && (
                          <button
                            onClick={() => handleSendToAnalytics(ord.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                          >
                            <span>Enviar a Análisis</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tubes / Studies Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ord.estudios.map((est, idx) => {
                        const isTaken = est.estatusMuestra === 'tomada';
                        const isRejected = est.estatusMuestra === 'rechazada';

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              isTaken
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : isRejected
                                ? 'bg-red-50/70 border-red-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 shadow-xs"
                                style={{ backgroundColor: est.colorTuboHex || '#0284c7' }}
                              />
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-900 block leading-tight">
                                  {est.nombre}
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  {est.tipoTubo}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  Muestra: {est.muestraRequerida}
                                </span>
                                {isRejected && est.motivoRechazo && (
                                  <span className="text-[10px] text-red-700 font-bold block">
                                    Motivo: {est.motivoRechazo}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status button */}
                            <div className="shrink-0 flex items-center gap-1.5">
                              {isTaken ? (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Tomada
                                </span>
                              ) : isRejected ? (
                                <button
                                  onClick={() => handleMarkSingleSampleTaken(ord.id, est.estudioId)}
                                  className="text-[10px] font-bold text-red-700 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-lg"
                                >
                                  Reintentar Toma
                                </button>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setRejectingInfo({
                                        orderId: ord.id,
                                        estudioId: est.estudioId,
                                        studyName: est.nombre,
                                      })
                                    }
                                    title="Rechazar muestra (hemólisis, coagulada, etc.)"
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleMarkSingleSampleTaken(ord.id, est.estudioId)}
                                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                                  >
                                    Marcar Tomada
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Modal Rechazo de Muestra */}
      {rejectingInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-red-700">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-base text-red-950">Rechazar Muestra Biológica</h3>
            </div>
            <p className="text-xs text-slate-600">
              Estudio: <strong className="text-slate-900">{rejectingInfo.studyName}</strong>
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Motivo de Rechazo Preanalítico:
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Muestra hemolizada">Muestra hemolizada</option>
                <option value="Muestra coagulada (tubo EDTA)">Muestra coagulada (tubo EDTA)</option>
                <option value="Volumen insuficiente (QNS)">Volumen insuficiente (QNS)</option>
                <option value="Tubo incorrecto o sin aditivo adecuado">Tubo incorrecto</option>
                <option value="Paciente sin el ayuno requerido">Sin ayuno adecuado</option>
                <option value="Muestra lipémica severa">Muestra lipémica severa</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingInfo(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tube Label Modal */}
      <TubeLabelModal
        orden={selectedLabelOrder}
        onClose={() => setSelectedLabelOrder(null)}
      />
    </div>
  );
};
