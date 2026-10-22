import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { Orden, Patient, MetodoPago, Sexo } from '../../types/laboratory';
import { OrderTicketModal } from '../shared/OrderTicketModal';
import { TubeLabelModal } from '../shared/TubeLabelModal';
import { WhatsAppModal } from '../shared/WhatsAppModal';
import { OfficialResultsPdfModal } from '../shared/OfficialResultsPdfModal';
import { 
  Plus, 
  Search, 
  UserPlus, 
  FilePlus, 
  Send, 
  Printer, 
  Barcode, 
  CheckCircle, 
  Clock, 
  Receipt, 
  Phone, 
  User, 
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';

export const RecepcionView: React.FC = () => {
  const { 
    orders, 
    patients, 
    studies, 
    activeModule, 
    setActiveModule, 
    addPatient, 
    createOrder 
  } = useLab();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modals state
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<Orden | null>(null);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Orden | null>(null);
  const [selectedWhatsAppOrder, setSelectedWhatsAppOrder] = useState<Orden | null>(null);
  const [selectedPdfOrder, setSelectedPdfOrder] = useState<Orden | null>(null);

  // New Order State
  const [orderPatientId, setOrderPatientId] = useState<string>('');
  const [orderMedico, setOrderMedico] = useState<string>('');
  const [selectedStudiesIds, setSelectedStudiesIds] = useState<string[]>([]);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<MetodoPago>('efectivo');
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // Quick New Patient State
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState<number>(30);
  const [newPatientGender, setNewPatientGender] = useState<Sexo>('F');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientDoctor, setNewPatientDoctor] = useState('');
  const [newPatientNotes, setNewPatientNotes] = useState('');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.paciente.telefono.includes(searchTerm);

    if (statusFilter === 'todos') return matchesSearch;
    if (statusFilter === 'listos_whatsapp') return matchesSearch && (o.estatusGeneral === 'validado' || o.estatusGeneral === 'concluido');
    return matchesSearch && o.estatusGeneral === statusFilter;
  });

  // Calculate new order subtotal
  const selectedStudiesObjects = studies.filter((s) => selectedStudiesIds.includes(s.id));
  const newOrderSubtotal = selectedStudiesObjects.reduce((acc, s) => acc + s.precio, 0);
  const newOrderTotal = Math.max(0, newOrderSubtotal - orderDiscount);

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderPatientId) {
      alert('Por favor selecciona un paciente o registra uno nuevo.');
      return;
    }
    if (selectedStudiesIds.length === 0) {
      alert('Debes seleccionar al menos un estudio clínico para la orden.');
      return;
    }

    const created = createOrder({
      pacienteId: orderPatientId,
      medicoTratante: orderMedico,
      estudiosIds: selectedStudiesIds,
      metodoPago: orderPaymentMethod,
      descuento: orderDiscount,
    });

    // Reset form
    setSelectedStudiesIds([]);
    setOrderDiscount(0);
    setOrderPatientId('');
    setOrderMedico('');
    setPatientSearchTerm('');

    // Open ticket modal immediately so receptionist can print it!
    setSelectedTicketOrder(created);
    setActiveModule('principal');
  };

  const handleQuickAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientPhone.trim()) {
      alert('El nombre y el WhatsApp del paciente son obligatorios.');
      return;
    }

    const birthYear = new Date().getFullYear() - (newPatientAge || 25);
    const created = addPatient({
      nombre: newPatientName.trim(),
      edad: Number(newPatientAge) || 25,
      sexo: newPatientGender,
      fechaNacimiento: `${birthYear}-01-01`,
      telefono: newPatientPhone.trim(),
      email: newPatientEmail.trim() || undefined,
      medicoTratante: newPatientDoctor.trim() || undefined,
      notas: newPatientNotes.trim() || undefined,
    });

    // Auto-select for order if inside new order flow
    setOrderPatientId(created.id);
    setPatientSearchTerm(created.nombre);
    setShowNewPatientModal(false);

    // Reset inputs
    setNewPatientName('');
    setNewPatientPhone('');
    setNewPatientEmail('');
    setNewPatientDoctor('');
    setNewPatientNotes('');
  };

  const toggleStudySelection = (studyId: string) => {
    setSelectedStudiesIds((prev) =>
      prev.includes(studyId) ? prev.filter((id) => id !== studyId) : [...prev, studyId]
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Módulo: NUEVA ORDEN */}
      {activeModule === 'nueva_orden' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-sky-600" />
                <span>Fase 1: Admisión y Creación de Orden</span>
              </h2>
              <p className="text-xs text-slate-500">
                Selección de paciente, perfiles de estudio, cobro y emisión de recibo con código de barras.
              </p>
            </div>
            <button
              onClick={() => setShowNewPatientModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Alta Rápida de Paciente</span>
            </button>
          </div>

          <form onSubmit={handleCreateOrderSubmit} className="space-y-6">
            {/* Selección de Paciente */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center justify-between">
                <span>1. Buscar o Seleccionar Paciente (Obligatorio)</span>
                {orderPatientId && (
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Paciente Seleccionado
                  </span>
                )}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar paciente por nombre o WhatsApp..."
                    value={patientSearchTerm}
                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>

                <select
                  value={orderPatientId}
                  onChange={(e) => {
                    setOrderPatientId(e.target.value);
                    const selected = patients.find((p) => p.id === e.target.value);
                    if (selected?.medicoTratante) setOrderMedico(selected.medicoTratante);
                  }}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="">-- Elige un paciente registrado --</option>
                  {patients
                    .filter(
                      (p) =>
                        p.nombre.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                        p.telefono.includes(patientSearchTerm)
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.edad} años • WA: {p.telefono})
                      </option>
                    ))}
                </select>
              </div>

              {/* Paciente Card Preview */}
              {orderPatientId && (
                <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                  {(() => {
                    const pat = patients.find((p) => p.id === orderPatientId);
                    if (!pat) return null;
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-sky-600" />
                          <span className="font-bold text-slate-900">{pat.nombre}</span>
                          <span className="text-slate-500">({pat.edad} años, {pat.sexo === 'M' ? 'Hombre' : 'Mujer'})</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono font-bold">{pat.telefono}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Médico Tratante */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Médico Tratante (Opcional):</label>
              <input
                type="text"
                placeholder="Ej. Dr. Armando Valdés / A quien corresponda"
                value={orderMedico}
                onChange={(e) => setOrderMedico(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            {/* Selección de Estudios y Perfiles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  2. Estudios Clínicos o Perfiles Requeridos:
                </label>
                <span className="text-xs font-semibold text-sky-700">
                  {selectedStudiesIds.length} seleccionado(s)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studies.map((st) => {
                  const isSelected = selectedStudiesIds.includes(st.id);
                  return (
                    <div
                      key={st.id}
                      onClick={() => toggleStudySelection(st.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-sky-50/90 border-sky-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: st.colorTuboHex }} />
                          <span className="text-xs font-bold text-slate-900 leading-snug">{st.nombre}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {st.codigo}
                          </span>
                          <span>{st.tipoTubo}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Entrega est: {st.tiempoEntregaHoras} hrs • {st.parametros.length} parámetros
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900 block">
                          ${st.precio.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isSelected ? 'Agregado' : '+ Agregar'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cobro, Facturación y Forma de Pago */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                3. Cobro y Emisión de Comprobante
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Método de Pago:
                  </label>
                  <select
                    value={orderPaymentMethod}
                    onChange={(e) => setOrderPaymentMethod(e.target.value as MetodoPago)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta Débito / Crédito</option>
                    <option value="transferencia">🏦 Transferencia / SPEI</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Descuento o Cupón ($):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={orderDiscount}
                    onChange={(e) => setOrderDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
                  />
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-center text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total a Cobrar</span>
                  <span className="text-xl font-black text-sky-700">${newOrderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModule('principal')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!orderPatientId || selectedStudiesIds.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Registrar Pago y Generar Orden</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Módulo: REGISTRO DE PACIENTES */}
      {activeModule === 'pacientes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                <span>Directorio y Alta de Pacientes</span>
              </h2>
              <p className="text-xs text-slate-500">
                Padrón clínico con número obligatorio de WhatsApp para envío de resultados.
              </p>
            </div>
            <button
              onClick={() => setShowNewPatientModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuevo Paciente</span>
            </button>
          </div>

          {/* Buscador */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono WhatsApp o médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {/* Tabla de Pacientes */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Paciente</th>
                  <th className="py-2.5 px-3">Edad / Sexo</th>
                  <th className="py-2.5 px-3">WhatsApp</th>
                  <th className="py-2.5 px-3">Médico Tratante</th>
                  <th className="py-2.5 px-3">Notas</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients
                  .filter(
                    (p) =>
                      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.telefono.includes(searchTerm) ||
                      (p.medicoTratante && p.medicoTratante.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{p.nombre}</span>
                        <span className="text-[10px] text-slate-400">{p.email || 'Sin correo'}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {p.edad} años • {p.sexo === 'M' ? 'M' : 'F'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Phone className="w-3 h-3" />
                          {p.telefono}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.medicoTratante || 'No especificado'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate">
                        {p.notas || '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setOrderPatientId(p.id);
                            setPatientSearchTerm(p.nombre);
                            setActiveModule('nueva_orden');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                        >
                          Crear Orden
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Módulo: MONITOR PRINCIPAL & ENTREGA WHATSAPP */}
      {(activeModule === 'principal' || activeModule === 'entrega_whatsapp') && (
        <div className="space-y-4">
          {activeModule === 'entrega_whatsapp' && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base sm:text-lg">Canal Digital de Entrega de Resultados por WhatsApp</h3>
              </div>
              <p className="text-xs text-emerald-100 max-w-xl">
                Envío directo de resultados clínicos en formato digital al número verificado del paciente o médico tratante con acuse de entrega automático.
              </p>
            </div>
          )}

          {/* Top Bar with Filter & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por folio, paciente o WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'pendiente_toma', label: 'Por Tomar' },
                  { id: 'en_analisis', label: 'En Proceso' },
                  { id: 'listos_whatsapp', label: 'Listos WhatsApp' },
                  { id: 'concluido', label: 'Concluidos' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setStatusFilter(pill.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                      statusFilter === pill.id
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveModule('nueva_orden')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Orden</span>
            </button>
          </div>

          {/* Cards & Table of Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Folio & Fecha</th>
                    <th className="py-3 px-3">Paciente & Contacto</th>
                    <th className="py-3 px-3">Estudios</th>
                    <th className="py-3 px-3">Total / Pago</th>
                    <th className="py-3 px-3">Estatus</th>
                    <th className="py-3 px-3 text-right">Acciones Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        No se encontraron órdenes registradas con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const isReadyForWhatsApp =
                        ord.estatusGeneral === 'validado' || ord.estatusGeneral === 'concluido';

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Folio */}
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-sky-700 block text-xs">
                              {ord.folio}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ord.fechaCreacion).toLocaleDateString()} • {new Date(ord.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          {/* Paciente */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                              {ord.paciente.nombre}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-medium">
                              <Phone className="w-3 h-3" />
                              {ord.paciente.telefono}
                            </span>
                          </td>

                          {/* Estudios */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              {ord.estudios.map((est, i) => (
                                <span
                                  key={i}
                                  className="inline-block bg-slate-100 text-slate-700 text-[10px] font-medium px-1.5 py-0.5 rounded mr-1 mb-1"
                                >
                                  {est.codigo}
                                </span>
                              ))}
                              <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                {ord.estudios.map((e) => e.nombre).join(', ')}
                              </div>
                            </div>
                          </td>

                          {/* Total */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">
                              ${ord.total.toFixed(2)}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {ord.metodoPago} • {ord.estatusPago}
                            </span>
                          </td>

                          {/* Estatus */}
                          <td className="py-3 px-3">
                            {ord.estatusGeneral === 'pendiente_toma' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                Por Tomar
                              </span>
                            )}
                            {ord.estatusGeneral === 'muestra_tomada' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                                Muestra Tomada
                              </span>
                            )}
                            {ord.estatusGeneral === 'en_analisis' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                En Análisis
                              </span>
                            )}
                            {ord.estatusGeneral === 'validado' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                Listo p/ WhatsApp
                              </span>
                            )}
                            {ord.estatusGeneral === 'concluido' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                Concluido / Enviado
                              </span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Recibo Ticket */}
                              <button
                                onClick={() => setSelectedTicketOrder(ord)}
                                title="Ver comprobante y recibo de pago"
                                className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>

                              {/* Etiquetas Barcode */}
                              <button
                                onClick={() => setSelectedLabelOrder(ord)}
                                title="Imprimir etiquetas de tubos con código de barras"
                                className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
                              >
                                <Barcode className="w-4 h-4" />
                              </button>

                              {/* Ver PDF Resultados */}
                              <button
                                onClick={() => setSelectedPdfOrder(ord)}
                                title="Ver reporte clínico de resultados"
                                className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Botón WhatsApp */}
                              {isReadyForWhatsApp && (
                                <button
                                  onClick={() => setSelectedWhatsAppOrder(ord)}
                                  title="Enviar resultados al WhatsApp del paciente"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors cursor-pointer"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>
                              )}
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
      )}

      {/* Modal Alta Rápida de Paciente */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <span>Alta Rápida de Paciente</span>
              </h3>
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddPatient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Laura Ramírez Soto"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Edad *</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    required
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sexo *</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value as Sexo)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Número de WhatsApp (Obligatorio para entrega digital) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 525541987654 o 5541987654"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Médico Tratante</label>
                <input
                  type="text"
                  placeholder="Dr. / Dra."
                  value={newPatientDoctor}
                  onChange={(e) => setNewPatientDoctor(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  placeholder="paciente@correo.com"
                  value={newPatientEmail}
                  onChange={(e) => setNewPatientEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl"
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Modals */}
      <OrderTicketModal
        orden={selectedTicketOrder}
        onClose={() => setSelectedTicketOrder(null)}
      />

      <TubeLabelModal
        orden={selectedLabelOrder}
        onClose={() => setSelectedLabelOrder(null)}
      />

      <WhatsAppModal
        orden={selectedWhatsAppOrder}
        onClose={() => setSelectedWhatsAppOrder(null)}
      />

      <OfficialResultsPdfModal
        orden={selectedPdfOrder}
        onClose={() => setSelectedPdfOrder(null)}
        onOpenWhatsApp={(ord) => setSelectedWhatsAppOrder(ord)}
      />
    </div>
  );
};
