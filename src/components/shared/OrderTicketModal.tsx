import React from 'react';
import { Orden } from '../../types/laboratory';
import { useLab } from '../../context/LabContext';
import { Printer, X, CheckCircle, Receipt } from 'lucide-react';

interface OrderTicketModalProps {
  orden: Orden | null;
  onClose: () => void;
}

export const OrderTicketModal: React.FC<OrderTicketModalProps> = ({ orden, onClose }) => {
  const { config } = useLab();

  if (!orden) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Receipt className="w-4 h-4 text-sky-600" />
            <span>Comprobante de Pago y Orden</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Content (Styled for receipt view & print) */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-slate-800 bg-white">
          {/* Header Lab */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              {config.nombreLaboratorio}
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">{config.subtitulo}</p>
            <p className="text-[10px] text-slate-500 mt-1">{config.direccion}</p>
            <p className="text-[10px] text-slate-500">Tel: {config.telefono} | RFC: {config.rfc}</p>
          </div>

          {/* Info Folio & Paciente */}
          <div className="space-y-1 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between font-bold text-sky-800">
              <span>FOLIO: {orden.folio}</span>
              <span>{new Date(orden.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>FECHA: {new Date(orden.fechaCreacion).toLocaleDateString()}</div>
            <div>PACIENTE: <span className="font-bold">{orden.paciente.nombre}</span></div>
            <div>EDAD: {orden.paciente.edad} años | SEXO: {orden.paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>
            <div>WHATSAPP: <span className="font-semibold text-slate-900">{orden.paciente.telefono}</span></div>
            <div>MÉDICO: {orden.medicoTratante}</div>
          </div>

          {/* Listado de Estudios */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between font-bold text-slate-600 uppercase text-[10px]">
              <span>Estudio</span>
              <span>Importe</span>
            </div>
            {orden.estudios.map((est, idx) => (
              <div key={idx} className="flex justify-between items-start gap-2">
                <span className="truncate max-w-[240px]">{est.nombre}</span>
                <span className="shrink-0 font-semibold">${est.precio.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="space-y-1 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>${orden.subtotal.toFixed(2)}</span>
            </div>
            {orden.descuento > 0 && (
              <div className="flex justify-between text-green-700">
                <span>DESCUENTO:</span>
                <span>-${orden.descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
              <span>TOTAL PAGADO:</span>
              <span>${orden.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 uppercase">
              <span>MÉTODO:</span>
              <span className="font-semibold">{orden.metodoPago}</span>
            </div>
          </div>

          {/* Estado y Entrega Digital */}
          <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 font-bold text-emerald-800 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>ORDEN PAGADA / LISTA PARA TOMA</span>
            </div>
            <p className="text-[10px] text-emerald-700">
              Sus resultados serán enviados automáticamente por WhatsApp a su número: {orden.paciente.telefono}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Recibo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
