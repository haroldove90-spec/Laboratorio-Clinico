import React from 'react';
import { Orden } from '../../types/laboratory';
import { useLab } from '../../context/LabContext';
import { 
  Printer, 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Download,
  Share2
} from 'lucide-react';

interface OfficialResultsPdfModalProps {
  orden: Orden | null;
  onClose: () => void;
  onOpenWhatsApp?: (orden: Orden) => void;
}

export const OfficialResultsPdfModal: React.FC<OfficialResultsPdfModalProps> = ({
  orden,
  onClose,
  onOpenWhatsApp,
}) => {
  const { config, studies } = useLab();

  if (!orden) return null;

  const handlePrint = () => {
    window.print();
  };

  // Check how many abnormal values exist
  const abnormalCount = Object.values(orden.resultados || {}).filter(
    (r) => r.fueraDeRango
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top bar controls */}
        <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                Reporte Oficial de Resultados Clínicos — {orden.folio}
              </span>
              <span className="text-[10px] text-slate-500">
                {orden.estatusGeneral === 'validado' || orden.estatusGeneral === 'concluido'
                  ? 'Firma y Cédula Profesional Autorizada'
                  : 'Documento Preliminar / En Proceso de Análisis'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenWhatsApp && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWhatsApp(orden);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar por WhatsApp</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clinical Document Paper Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 text-slate-800 space-y-6">
            
            {/* Header del Laboratorio */}
            <div className="border-b-2 border-sky-700 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                  LC
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {config.nombreLaboratorio}
                  </h1>
                  <p className="text-xs font-medium text-sky-800">{config.subtitulo}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{config.direccion} | Tel: {config.telefono}</p>
                </div>
              </div>

              <div className="text-left sm:text-right text-[11px] font-mono bg-sky-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                <div className="font-bold text-sky-900 text-xs sm:text-sm">FOLIO: {orden.folio}</div>
                <div className="text-slate-500">FECHA: {new Date(orden.fechaCreacion).toLocaleDateString()}</div>
                <div className="text-slate-500">HORA: {new Date(orden.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            {/* Datos Demográficos del Paciente */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Paciente</span>
                <span className="font-bold text-slate-900">{orden.paciente.nombre}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Edad / Sexo</span>
                <span className="font-medium text-slate-800">
                  {orden.paciente.edad} años / {orden.paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Médico Tratante</span>
                <span className="font-medium text-slate-800">{orden.medicoTratante}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Registrado</span>
                <span className="font-medium text-slate-800">{orden.paciente.telefono}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha Toma Muestra</span>
                <span className="font-medium text-slate-800">
                  {orden.fechaTomaMuestra ? new Date(orden.fechaTomaMuestra).toLocaleDateString() : 'Pendiente'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Estatus Validación</span>
                <span className={`inline-flex items-center gap-1 font-bold ${
                  orden.estatusGeneral === 'validado' || orden.estatusGeneral === 'concluido'
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}>
                  {orden.estatusGeneral === 'validado' || orden.estatusGeneral === 'concluido'
                    ? 'Validado Oficial'
                    : 'En Proceso'}
                </span>
              </div>
            </div>

            {/* Resumen de Alertas Fuera de Rango */}
            {abnormalCount > 0 && (
              <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl flex items-center gap-2 text-red-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-semibold">
                  Aviso Clínico: Se detectaron {abnormalCount} parámetro(s) fuera del rango de referencia biológico para la edad y sexo del paciente.
                </span>
              </div>
            )}

            {/* Tablas de Resultados por Estudio */}
            <div className="space-y-6">
              {orden.estudios.map((estItem) => {
                const fullStudy = studies.find((s) => s.id === estItem.estudioId);
                const parametros = fullStudy?.parametros || [];

                return (
                  <div key={estItem.estudioId} className="space-y-2">
                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-sky-600 flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {estItem.nombre} ({estItem.codigo})
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Muestra: {estItem.muestraRequerida}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-500">
                            <th className="py-1.5 px-2">Parámetro</th>
                            <th className="py-1.5 px-2">Resultado</th>
                            <th className="py-1.5 px-2">Unidades</th>
                            <th className="py-1.5 px-2">Valores de Referencia</th>
                            <th className="py-1.5 px-2 text-right">Interpretación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parametros.map((param) => {
                            const resultKey = `${estItem.estudioId}_${param.id}`;
                            const resObj = orden.resultados?.[resultKey];
                            const valor = resObj ? resObj.valor : '-';
                            const fuera = resObj ? resObj.fueraDeRango : false;

                            const min = orden.paciente.sexo === 'M' ? param.rangoMinH : param.rangoMinM;
                            const max = orden.paciente.sexo === 'M' ? param.rangoMaxH : param.rangoMaxM;
                            const refString = param.esTexto
                              ? 'Negativo / Normal'
                              : `${min} - ${max}`;

                            return (
                              <tr 
                                key={param.id} 
                                className={`transition-colors ${fuera ? 'bg-red-50/60 font-semibold' : 'hover:bg-slate-50/80'}`}
                              >
                                <td className="py-2 px-2 text-slate-800">{param.nombre}</td>
                                <td className="py-2 px-2">
                                  <span className={`px-2 py-0.5 rounded text-xs inline-block ${
                                    fuera 
                                      ? 'bg-red-600 text-white font-black shadow-xs' 
                                      : 'font-bold text-slate-900'
                                  }`}>
                                    {valor}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-slate-500">{param.unidad}</td>
                                <td className="py-2 px-2 text-slate-600">{refString}</td>
                                <td className="py-2 px-2 text-right">
                                  {fuera ? (
                                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full inline-block">
                                      FUERA DE RANGO
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-emerald-700">
                                      Normal
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Firma y Cédula Profesional */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-[10px] text-slate-400 space-y-0.5 max-w-sm">
                <p>* Los resultados corresponden exclusivamente a la muestra recibida.</p>
                <p>* La interpretación de este estudio clínico debe ser efectuada por el médico tratante.</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 border border-slate-200 rounded-xl bg-slate-50/50 min-w-[240px]">
                {/* Simulated signature glyph */}
                <div className="h-10 flex items-center justify-center font-serif italic text-lg text-sky-900 select-none opacity-80">
                  {orden.quimicoValidador?.nombre || config.quimicoPredeterminado}
                </div>
                <div className="w-40 border-t border-slate-400 my-1" />
                <span className="text-xs font-bold text-slate-900">
                  {orden.quimicoValidador?.nombre || config.quimicoPredeterminado}
                </span>
                <span className="text-[10px] font-medium text-slate-600">
                  {orden.quimicoValidador?.cedula || config.cedulaProfesional}
                </span>
                <span className="text-[9px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  FIRMA ELECTRÓNICA VALIDADA
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between sm:hidden">
          {onOpenWhatsApp && (
            <button
              onClick={() => {
                onClose();
                onOpenWhatsApp(orden);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-xl"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
