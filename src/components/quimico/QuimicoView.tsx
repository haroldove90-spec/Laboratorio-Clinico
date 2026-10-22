import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Orden, ResultadoValor } from '../../types/laboratory';
import { OfficialResultsPdfModal } from '../shared/OfficialResultsPdfModal';
import { WhatsAppModal } from '../shared/WhatsAppModal';
import { 
  Microscope, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  FileCheck2, 
  Search, 
  Save, 
  Check, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Phone,
  FileText
} from 'lucide-react';

export const QuimicoView: React.FC = () => {
  const { 
    orders, 
    studies, 
    config, 
    saveOrderResults, 
    activeModule 
  } = useLab();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForCapture, setSelectedOrderForCapture] = useState<Orden | null>(null);
  const [resultsForm, setResultsForm] = useState<Record<string, string>>({});
  const [quimicoName, setQuimicoName] = useState(config.quimicoPredeterminado);
  const [quimicoCedula, setQuimicoCedula] = useState(config.cedulaProfesional);

  // Modals
  const [previewPdfOrder, setPreviewPdfOrder] = useState<Orden | null>(null);
  const [whatsAppOrder, setWhatsAppOrder] = useState<Orden | null>(null);

  // Filter orders for laboratory analysis
  const captureOrders = orders.filter(
    (o) => o.estatusGeneral === 'muestra_tomada' || o.estatusGeneral === 'en_analisis'
  );
  const validatedOrders = orders.filter(
    (o) => o.estatusGeneral === 'validado' || o.estatusGeneral === 'concluido'
  );
  const alertOrders = orders.filter((o) => {
    return Object.values(o.resultados || {}).some((r) => r.fueraDeRango);
  });

  const getFilteredList = () => {
    let base = captureOrders;
    if (activeModule === 'validadas') base = validatedOrders;
    if (activeModule === 'alertas') base = alertOrders;

    return base.filter(
      (o) =>
        o.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const listOrders = getFilteredList();

  const handleStartCapture = (orden: Orden) => {
    setSelectedOrderForCapture(orden);

    // Populate existing or default values
    const initialForm: Record<string, string> = {};
    orden.estudios.forEach((estItem) => {
      const fullStudy = studies.find((s) => s.id === estItem.estudioId);
      fullStudy?.parametros.forEach((param) => {
        const key = `${estItem.estudioId}_${param.id}`;
        if (orden.resultados?.[key]) {
          initialForm[key] = String(orden.resultados[key].valor);
        } else {
          initialForm[key] = param.valorPorDefecto || '';
        }
      });
    });
    setResultsForm(initialForm);
  };

  // Helper to test if a parameter value is outside normal biological intervals
  const checkIsAbnormal = (
    studyId: string,
    paramId: string,
    rawVal: string,
    sexo: 'M' | 'F'
  ) => {
    if (!rawVal || rawVal.trim() === '') return false;
    const study = studies.find((s) => s.id === studyId);
    const param = study?.parametros.find((p) => p.id === paramId);
    if (!param) return false;

    if (param.esTexto) {
      const textLow = rawVal.toLowerCase();
      return textLow.includes('turbio') || textLow.includes('abundante') || textLow.includes('positivo');
    }

    const numVal = parseFloat(rawVal);
    if (isNaN(numVal)) return false;

    const min = sexo === 'M' ? param.rangoMinH : param.rangoMinM;
    const max = sexo === 'M' ? param.rangoMaxH : param.rangoMaxM;

    return numVal < min || numVal > max;
  };

  const handleSaveResults = (firmar = false, andSendWhatsApp = false) => {
    if (!selectedOrderForCapture) return;

    const formattedResults: Record<string, ResultadoValor> = {};

    selectedOrderForCapture.estudios.forEach((estItem) => {
      const fullStudy = studies.find((s) => s.id === estItem.estudioId);
      fullStudy?.parametros.forEach((param) => {
        const key = `${estItem.estudioId}_${param.id}`;
        const val = resultsForm[key] || '';
        const min = selectedOrderForCapture.paciente.sexo === 'M' ? param.rangoMinH : param.rangoMinM;
        const max = selectedOrderForCapture.paciente.sexo === 'M' ? param.rangoMaxH : param.rangoMaxM;
        const refStr = param.esTexto ? 'Normal / Negativo' : `${min} - ${max}`;
        const fuera = checkIsAbnormal(
          estItem.estudioId,
          param.id,
          val,
          selectedOrderForCapture.paciente.sexo
        );

        formattedResults[key] = {
          parametroId: param.id,
          nombreParametro: param.nombre,
          valor: val,
          unidad: param.unidad,
          rangoReferencia: refStr,
          fueraDeRango: fuera,
        };
      });
    });

    saveOrderResults(
      selectedOrderForCapture.id,
      formattedResults,
      firmar,
      { nombre: quimicoName, cedula: quimicoCedula }
    );

    const savedOrderSnapshot = {
      ...selectedOrderForCapture,
      resultados: formattedResults,
      estatusGeneral: firmar ? ('validado' as const) : ('en_analisis' as const),
      quimicoValidador: firmar ? { nombre: quimicoName, cedula: quimicoCedula } : undefined,
    };

    setSelectedOrderForCapture(null);

    if (andSendWhatsApp) {
      setWhatsAppOrder(savedOrderSnapshot);
    } else if (firmar) {
      setPreviewPdfOrder(savedOrderSnapshot);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Químico */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-900 text-white rounded-2xl p-4 sm:p-6 shadow-md shadow-teal-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
              <Microscope className="w-3.5 h-3.5 text-teal-200" />
              <span>Fase 3: Procesamiento Analítico & Dictamen</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight">
              {activeModule === 'alertas'
                ? 'Panel de Alertas y Valores Fuera de Rango'
                : activeModule === 'validadas'
                ? 'Resultados Validados con Firma y Cédula'
                : 'Captura de Resultados y Emisión de Dictamen'}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl mt-0.5 sm:mt-1">
              {activeModule === 'alertas'
                ? 'Triage de pacientes con parámetros analíticos patológicos fuera de los intervalos biológicos de referencia.'
                : activeModule === 'validadas'
                ? 'Expedientes liberados con firma electrónica oficial, listos para impresión o reenvío por WhatsApp.'
                : 'Registro de valores clínicos con detección automática en rojo de valores patológicos y validación oficial.'}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 p-2.5 sm:p-3 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-black text-white">{captureOrders.length}</span>
              <span className="text-[10px] text-teal-200 uppercase font-semibold">Por Capturar</span>
            </div>
            <div className="w-[1px] h-7 bg-white/20" />
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-black text-emerald-300">{validatedOrders.length}</span>
              <span className="text-[10px] text-teal-200 uppercase font-semibold">Validadas</span>
            </div>
            <div className="w-[1px] h-7 bg-white/20" />
            <div className="text-center px-2">
              <span className="block text-xl sm:text-2xl font-black text-red-300">{alertOrders.length}</span>
              <span className="text-[10px] text-red-200 uppercase font-semibold">Alertas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      {!selectedOrderForCapture ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeModule === 'alertas'
                    ? 'Buscar paciente con alerta clínica...'
                    : 'Buscar por folio o paciente...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {listOrders.length} órdenes en esta sección
            </span>
          </div>

          {/* Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Folio</th>
                    <th className="py-3 px-3">Paciente</th>
                    <th className="py-3 px-3">Estudios</th>
                    {activeModule === 'alertas' ? (
                      <th className="py-3 px-3">Parámetros Fuera de Rango</th>
                    ) : (
                      <th className="py-3 px-3">Toma de Muestra</th>
                    )}
                    <th className="py-3 px-3">Estatus</th>
                    <th className="py-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {activeModule === 'alertas'
                          ? 'No hay órdenes con valores fuera de rango registradas actualmente.'
                          : 'No hay órdenes en esta lista en este momento.'}
                      </td>
                    </tr>
                  ) : (
                    listOrders.map((ord) => {
                      const isValidated =
                        ord.estatusGeneral === 'validado' || ord.estatusGeneral === 'concluido';
                      
                      const abnormalParams = Object.values(ord.resultados || {}).filter(
                        (r) => r.fueraDeRango
                      );

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-teal-800 block">
                              {ord.folio}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{ord.paciente.nombre}</span>
                            <span className="text-[10px] text-slate-400">{ord.paciente.edad}a • {ord.paciente.sexo}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-slate-700 block font-medium">
                              {ord.estudios.map((e) => e.codigo).join(', ')}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">
                              {ord.estudios.map((e) => e.nombre).join(', ')}
                            </span>
                          </td>

                          {activeModule === 'alertas' ? (
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1 max-w-[240px]">
                                {abnormalParams.map((ap, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold"
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                                    {ap.nombreParametro}: <strong>{ap.valor} {ap.unidad}</strong>
                                  </span>
                                ))}
                              </div>
                            </td>
                          ) : (
                            <td className="py-3 px-3 text-slate-500 text-[11px]">
                              {ord.fechaTomaMuestra
                                ? new Date(ord.fechaTomaMuestra).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'No registrada'}
                            </td>
                          )}

                          <td className="py-3 px-3">
                            {isValidated ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Validada Oficial
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                                Lista p/ Captura
                              </span>
                            )}
                            {abnormalParams.length > 0 && activeModule !== 'alertas' && (
                              <span className="block mt-1 text-[9px] font-bold text-red-600">
                                ⚠ {abnormalParams.length} Alerta(s)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isValidated && (
                                <>
                                  <button
                                    onClick={() => setPreviewPdfOrder(ord)}
                                    className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                    title="Ver reporte oficial en PDF"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setWhatsAppOrder(ord)}
                                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Reenviar por WhatsApp"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleStartCapture(ord)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                              >
                                <span>{isValidated ? 'Editar Valores' : 'Capturar Resultados'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Captura y Detección de Alertas en Tiempo Real */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
          {/* Header de la orden actual */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-teal-800 text-sm bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {selectedOrderForCapture.folio}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Captura: {selectedOrderForCapture.paciente.nombre}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Edad: <strong className="text-slate-800">{selectedOrderForCapture.paciente.edad} años</strong> | Sexo: <strong className="text-slate-800">{selectedOrderForCapture.paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</strong> | WhatsApp: <span className="font-mono text-slate-700">{selectedOrderForCapture.paciente.telefono}</span>
              </p>
            </div>

            <button
              onClick={() => setSelectedOrderForCapture(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl self-start sm:self-auto font-semibold cursor-pointer"
            >
              ← Volver al listado
            </button>
          </div>

          {/* Alert Guidance Note */}
          <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-center justify-between gap-2 text-xs text-sky-900">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Detección automática de alertas:</strong> Los valores fuera de rango se resaltarán automáticamente en <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded">rojo y negrita</span>.
              </span>
            </span>
          </div>

          {/* Formularios por Estudio */}
          <div className="space-y-6">
            {selectedOrderForCapture.estudios.map((estItem) => {
              const study = studies.find((s) => s.id === estItem.estudioId);
              if (!study) return null;

              return (
                <div key={estItem.estudioId} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {study.nombre} ({study.codigo})
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {study.muestraRequerida}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {study.parametros.map((param) => {
                        const key = `${estItem.estudioId}_${param.id}`;
                        const currentVal = resultsForm[key] || '';
                        const isAbnormal = checkIsAbnormal(
                          estItem.estudioId,
                          param.id,
                          currentVal,
                          selectedOrderForCapture.paciente.sexo
                        );

                        const min = selectedOrderForCapture.paciente.sexo === 'M' ? param.rangoMinH : param.rangoMinM;
                        const max = selectedOrderForCapture.paciente.sexo === 'M' ? param.rangoMaxH : param.rangoMaxM;

                        return (
                          <div
                            key={param.id}
                            className={`p-3 rounded-xl border transition-all ${
                              isAbnormal
                                ? 'bg-red-50/70 border-red-300 ring-1 ring-red-400'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-800 truncate">
                                {param.nombre}
                              </label>
                              {isAbnormal && (
                                <span className="text-[9px] font-black uppercase text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                  ¡Fuera Rango!
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {param.esTexto && param.opcionesCualitativas ? (
                                <select
                                  value={currentVal}
                                  onChange={(e) =>
                                    setResultsForm({ ...resultsForm, [key]: e.target.value })
                                  }
                                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                  {param.opcionesCualitativas.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={currentVal}
                                  onChange={(e) =>
                                    setResultsForm({ ...resultsForm, [key]: e.target.value })
                                  }
                                  className={`w-full p-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                                    isAbnormal
                                      ? 'bg-red-100/60 text-red-900 border-red-400 focus:ring-red-500'
                                      : 'bg-white text-slate-900 border-slate-200 focus:ring-teal-500'
                                  }`}
                                  placeholder="0.00"
                                />
                              )}
                              {param.unidad && (
                                <span className="text-[11px] font-medium text-slate-500 shrink-0 min-w-[45px]">
                                  {param.unidad}
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Ref: {param.esTexto ? 'Normal' : `${min} - ${max}`}</span>
                              {isAbnormal && (
                                <span className="font-bold text-red-600">Revisar valor</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Firma del Químico Responsable */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Autorización y Cédula Profesional del Químico Validador</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Nombre del Químico Responsable:
                </label>
                <input
                  type="text"
                  value={quimicoName}
                  onChange={(e) => setQuimicoName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Cédula Profesional:
                </label>
                <input
                  type="text"
                  value={quimicoCedula}
                  onChange={(e) => setQuimicoCedula(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSaveResults(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full sm:w-auto justify-center cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Borrador (Sin Firmar)</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => handleSaveResults(true, false)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex-1 sm:flex-initial justify-center cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Validar y Firmar</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveResults(true, true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex-1 sm:flex-initial justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Validar y Enviar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      <OfficialResultsPdfModal
        orden={previewPdfOrder}
        onClose={() => setPreviewPdfOrder(null)}
        onOpenWhatsApp={(ord) => setWhatsAppOrder(ord)}
      />

      {/* WhatsApp Modal */}
      <WhatsAppModal
        orden={whatsAppOrder}
        onClose={() => setWhatsAppOrder(null)}
      />
    </div>
  );
};
