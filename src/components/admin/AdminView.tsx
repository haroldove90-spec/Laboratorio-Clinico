import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Estudio, MetodoPago } from '../../types/laboratory';
import { ClearDataModal } from '../shared/ClearDataModal';
import { 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  Settings, 
  Printer, 
  Trash2, 
  Database, 
  Send, 
  Plus, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  FileText, 
  Edit3, 
  Calendar,
  CreditCard,
  Banknote,
  Building,
  RefreshCw
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { 
    orders, 
    patients, 
    studies, 
    config, 
    updateConfig, 
    addStudy, 
    updateStudy, 
    activeModule,
    setActiveModule,
    isDemoCleared,
    restoreDemoData,
    syncWithSupabase,
    clearSupabaseRecords
  } = useLab();

  // Clear demo modal
  const [showClearModal, setShowClearModal] = useState(false);

  // Corte de caja filter date (default today)
  const [corteDate, setCorteDate] = useState(() => new Date().toISOString().split('T')[0]);

  // WhatsApp template editor
  const [templateText, setTemplateText] = useState(config.whatsapp.plantillaMensaje);
  const [whatsappMode, setWhatsappMode] = useState(config.whatsapp.modoEnvio);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Supabase state
  const [supaUrl, setSupaUrl] = useState(config.supabase.url);
  const [supaKey, setSupaKey] = useState(config.supabase.anonKey);
  const [supaTable, setSupaTable] = useState(config.supabase.tableName || 'ordenes_laboratorio');
  const [supaStatusMsg, setSupaStatusMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Study Modal
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [newStudyCode, setNewStudyCode] = useState('');
  const [newStudyName, setNewStudyName] = useState('');
  const [newStudyCategory, setNewStudyCategory] = useState<'Hematología' | 'Química Clínica' | 'Urianálisis' | 'Inmunología' | 'Coprología' | 'Perfiles'>('Química Clínica');
  const [newStudyPrice, setNewStudyPrice] = useState(300);
  const [newStudyHours, setNewStudyHours] = useState(4);
  const [newStudyTube, setNewStudyTube] = useState('Tubo Tapón Amarillo con Gel Separador');
  const [newStudySample, setNewStudySample] = useState('Suero sanguíneo 3 mL');

  // Compute Corte de Caja for selected date
  const ordersOnDate = orders.filter((o) => {
    const d = o.fechaCreacion.split('T')[0];
    return d === corteDate;
  });

  const totalRecaudado = ordersOnDate.reduce((sum, o) => sum + o.total, 0);
  const efectivoTotal = ordersOnDate
    .filter((o) => o.metodoPago === 'efectivo')
    .reduce((sum, o) => sum + o.total, 0);
  const tarjetaTotal = ordersOnDate
    .filter((o) => o.metodoPago === 'tarjeta')
    .reduce((sum, o) => sum + o.total, 0);
  const transferenciaTotal = ordersOnDate
    .filter((o) => o.metodoPago === 'transferencia')
    .reduce((sum, o) => sum + o.total, 0);

  // Métricas generales
  const totalPacientes = patients.length;
  const totalOrdenes = orders.length;
  const concluidasWhatsApp = orders.filter((o) => o.estatusGeneral === 'concluido').length;
  const validadasPendientesEnvio = orders.filter((o) => o.estatusGeneral === 'validado').length;

  // Estudios más solicitados
  const studyCounts: Record<string, number> = {};
  orders.forEach((o) => {
    o.estudios.forEach((e) => {
      studyCounts[e.nombre] = (studyCounts[e.nombre] || 0) + 1;
    });
  });
  const topStudies = Object.entries(studyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleSaveWhatsAppConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      whatsapp: {
        ...config.whatsapp,
        plantillaMensaje: templateText,
        modoEnvio: whatsappMode,
      },
    });
    setSaveSuccessMsg('Plantilla y configuración de WhatsApp guardada exitosamente.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleConnectSupabase = async () => {
    setIsSyncing(true);
    updateConfig({
      supabase: {
        url: supaUrl,
        anonKey: supaKey,
        tableName: supaTable,
        connected: false,
      },
    });

    const res = await syncWithSupabase();
    setIsSyncing(false);
    setSupaStatusMsg(res.message);
    setTimeout(() => setSupaStatusMsg(null), 4000);
  };

  const handleCreateStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudyName || !newStudyCode) return;

    addStudy({
      codigo: newStudyCode,
      nombre: newStudyName,
      categoria: newStudyCategory,
      precio: Number(newStudyPrice) || 100,
      tiempoEntregaHoras: Number(newStudyHours) || 4,
      tipoTubo: newStudyTube,
      colorTuboHex: '#0891b2',
      muestraRequerida: newStudySample,
      parametros: [
        {
          id: 'resultado_general',
          nombre: 'Resultado Analítico',
          unidad: 'mg/dL',
          rangoMinH: 10,
          rangoMaxH: 50,
          rangoMinM: 10,
          rangoMaxM: 50,
          valorPorDefecto: '25',
        },
      ],
    });

    setShowStudyModal(false);
    setNewStudyCode('');
    setNewStudyName('');
  };

  return (
    <div className="space-y-6">
      {/* Banner Administrador */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Fase 5: Mando Gerencial & Cortes Diarios</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Administración, Finanzas y Catálogo
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mt-1">
              Consolidación de ingresos por caja, gestión de tarifas, mensajería WhatsApp y limpieza permanente de base de datos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Borrar Datos Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Módulo: PANEL GERENCIAL / MÉTRICAS */}
      {activeModule === 'principal' && (
        <div className="space-y-6">
          {/* Métricas Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pacientes</span>
                <Users className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalPacientes}</div>
              <span className="text-[10px] text-slate-500">Padrón activo registrado</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Órdenes Totales</span>
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalOrdenes}</div>
              <span className="text-[10px] text-slate-500">Historial acumulado</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Enviadas WhatsApp</span>
                <Send className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">{concluidasWhatsApp}</div>
              <span className="text-[10px] text-emerald-700 font-semibold">Entregadas digitalmente</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Listas p/ Entrega</span>
                <CheckCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">{validadasPendientesEnvio}</div>
              <span className="text-[10px] text-amber-700 font-medium">Firmadas listas para enviar</span>
            </div>
          </div>

          {/* Quick Access to Corte de Caja & Top Studies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen Corte Rápido */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Resumen Financiero del Día</span>
                </h3>
                <button
                  onClick={() => setActiveModule('corte_caja')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700"
                >
                  Ver Detalle Completo →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Efectivo</span>
                  <span className="text-base font-black text-emerald-900">${efectivoTotal.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Tarjetas</span>
                  <span className="text-base font-black text-blue-900">${tarjetaTotal.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-purple-700 block">Transferencias</span>
                  <span className="text-base font-black text-purple-900">${transferenciaTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Total Ingresos Fecha ({corteDate}):</span>
                <span className="text-lg font-black text-slate-900">${totalRecaudado.toFixed(2)}</span>
              </div>
            </div>

            {/* Estudios Más Solicitados */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Estudios con Mayor Demanda</span>
                </h3>
                <span className="text-[11px] text-slate-400">Basado en órdenes creadas</span>
              </div>

              <div className="space-y-2">
                {topStudies.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Sin registros de estudios aún.</p>
                ) : (
                  topStudies.map(([name, count], i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[260px]">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{name}</span>
                      </div>
                      <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {count} orden{count > 1 ? 'es' : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Módulo: CORTE DE CAJA DIARIO */}
      {activeModule === 'corte_caja' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Fase 5: Corte de Caja Diario</span>
              </h2>
              <p className="text-xs text-slate-500">
                Consolidación de ingresos por método de pago para arqueo de caja y cierre de turno.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={corteDate}
                  onChange={(e) => setCorteDate(e.target.value)}
                  className="bg-transparent focus:outline-none"
                />
              </div>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Corte</span>
              </button>
            </div>
          </div>

          {/* Tarjetas Desglose */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" /> Efectivo
              </span>
              <span className="text-2xl font-black text-emerald-950">${efectivoTotal.toFixed(2)}</span>
            </div>

            <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-sky-700 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Tarjeta Débito / Crédito
              </span>
              <span className="text-2xl font-black text-sky-950">${tarjetaTotal.toFixed(2)}</span>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-700 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Transferencia / SPEI
              </span>
              <span className="text-2xl font-black text-purple-950">${transferenciaTotal.toFixed(2)}</span>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-300">Total Global Recaudado</span>
              <span className="text-2xl font-black text-emerald-400">${totalRecaudado.toFixed(2)}</span>
            </div>
          </div>

          {/* Listado de tickets del día */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Desglose de Órdenes y Recibos Cobrados ({ordersOnDate.length} órdenes)
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Folio</th>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Paciente</th>
                    <th className="py-2.5 px-3">Estudios</th>
                    <th className="py-2.5 px-3">Método de Pago</th>
                    <th className="py-2.5 px-3 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordersOnDate.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No hay cobros registrados en la fecha {corteDate}.
                      </td>
                    </tr>
                  ) : (
                    ordersOnDate.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-800">{o.folio}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(o.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{o.paciente.nombre}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {o.estudios.map((e) => e.codigo).join(', ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {o.metodoPago}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          ${o.total.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Módulo: CATÁLOGO DE ESTUDIOS */}
      {activeModule === 'catalogo' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Catálogo de Estudios, Perfiles y Precios</span>
              </h2>
              <p className="text-xs text-slate-500">
                Lista de pruebas de laboratorio, precios de lista, tiempos de entrega y tipo de contenedor biológico.
              </p>
            </div>

            <button
              onClick={() => setShowStudyModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Estudio</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nombre del Estudio</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Tubo / Muestra</th>
                  <th className="py-2.5 px-3">Entrega</th>
                  <th className="py-2.5 px-3 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studies.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-800">{st.codigo}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{st.nombre}</span>
                      <span className="text-[10px] text-slate-400">
                        {st.parametros.length} parámetros con rangos hombre/mujer
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {st.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="block font-medium">{st.tipoTubo}</span>
                      <span className="text-[10px] text-slate-400">{st.muestraRequerida}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{st.tiempoEntregaHoras} hrs</td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                      ${st.precio.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Módulo: CONFIGURACIÓN, WHATSAPP & SUPABASE */}
      {activeModule === 'configuracion' && (
        <div className="space-y-6">
          {/* Configuración WhatsApp */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <span>Configuración de Mensajería WhatsApp</span>
              </h2>
              <p className="text-xs text-slate-500">
                Personaliza la plantilla del mensaje enviado a los pacientes y elige el modo de despacho.
              </p>
            </div>

            <form onSubmit={handleSaveWhatsAppConfig} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Modo de Envío de Resultados:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setWhatsappMode('link')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                      whatsappMode === 'link'
                        ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="waMode"
                      checked={whatsappMode === 'link'}
                      onChange={() => setWhatsappMode('link')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span>Opción Económica (wa.me sin costo)</span>
                      <p className="text-[10px] text-slate-500 font-normal">
                        Abre WhatsApp Web / App de escritorio con el mensaje prearmado listo para enviar.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setWhatsappMode('api')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                      whatsappMode === 'api'
                        ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="waMode"
                      checked={whatsappMode === 'api'}
                      onChange={() => setWhatsappMode('api')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span>Opción Automatizada (WhatsApp Cloud API)</span>
                      <p className="text-[10px] text-slate-500 font-normal">
                        Despacha automáticamente el documento en cuanto el químico valida la orden.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">Plantilla de Mensaje Predeterminado:</label>
                  <span className="text-[10px] text-slate-400">
                    Variables: {'{paciente}'}, {'{folio}'}, {'{estudios}'}, {'{laboratorio}'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  {saveSuccessMsg}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Guardar Configuración WhatsApp
                </button>
              </div>
            </form>
          </div>

          {/* Configuración Supabase */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                <span>Integración con Base de Datos Supabase (Opcional)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Conecta tu proyecto de Supabase para respaldar órdenes y borrar registros directamente desde la aplicación.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Supabase Project URL:</label>
                  <input
                    type="text"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supaUrl}
                    onChange={(e) => setSupaUrl(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Anon / Public Key:</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supaKey}
                    onChange={(e) => setSupaKey(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Tabla:</label>
                <input
                  type="text"
                  placeholder="ordenes_laboratorio"
                  value={supaTable}
                  onChange={(e) => setSupaTable(e.target.value)}
                  className="w-full sm:w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs"
                />
              </div>

              {supaStatusMsg && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-semibold">
                  {supaStatusMsg}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.supabase.connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-slate-600 font-medium">
                    {config.supabase.connected ? 'Supabase Conectado' : 'Sin conexión activa'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConnectSupabase}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    {isSyncing ? 'Verificando...' : 'Guardar y Probar Conexión'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Borrado de Datos de Muestra */}
          <div className="bg-red-50/70 rounded-2xl border border-red-200 p-4 sm:p-6 space-y-3">
            <h3 className="font-bold text-red-950 text-base flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>Limpieza y Reinicio de Datos del Sistema</span>
            </h3>
            <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
              Puedes vaciar todas las órdenes de prueba y pacientes de demostración con un solo clic. El sistema guardará la configuración para que el navegador nunca vuelva a mostrar los datos de muestra y se sincronicen los cambios en blanco.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowClearModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Borrar Datos de Muestra Ahora
              </button>

              {isDemoCleared && (
                <button
                  onClick={restoreDemoData}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors"
                >
                  Restaurar Datos Demo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Estudio */}
      {showStudyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Nuevo Estudio en Catálogo</h3>
            <form onSubmit={handleCreateStudy} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Código del Estudio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. QUI-10, HEM-05"
                  value={newStudyCode}
                  onChange={(e) => setNewStudyCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Hemoglobina Glucosilada HbA1c"
                  value={newStudyName}
                  onChange={(e) => setNewStudyName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio al Público ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStudyPrice}
                    onChange={(e) => setNewStudyPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiempo de Entrega (hrs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStudyHours}
                    onChange={(e) => setNewStudyHours(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tubo / Contenedor</label>
                <input
                  type="text"
                  value={newStudyTube}
                  onChange={(e) => setNewStudyTube(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Muestra Requerida</label>
                <input
                  type="text"
                  value={newStudySample}
                  onChange={(e) => setNewStudySample(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudyModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Demo Modal */}
      <ClearDataModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
      />
    </div>
  );
};
