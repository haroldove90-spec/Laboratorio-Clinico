import React from 'react';
import { Orden } from '../../types/laboratory';
import { Barcode, Printer, X, Tag } from 'lucide-react';

interface TubeLabelModalProps {
  orden: Orden | null;
  onClose: () => void;
}

export const TubeLabelModal: React.FC<TubeLabelModalProps> = ({ orden, onClose }) => {
  if (!orden) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate stylized barcode lines based on folio string
  const renderBarcodeLines = (str: string) => {
    return (
      <div className="flex items-stretch justify-center h-8 gap-[2px] bg-white px-2 py-0.5">
        {str.split('').map((char, i) => {
          const code = char.charCodeAt(0);
          const w1 = (code % 3) + 1;
          const w2 = ((code * 2) % 3) + 1;
          return (
            <React.Fragment key={i}>
              <div style={{ width: `${w1}px` }} className="bg-slate-900 h-full" />
              <div style={{ width: `${w2}px` }} className="bg-white h-full" />
              <div style={{ width: `${(code % 2) + 1}px` }} className="bg-slate-900 h-full" />
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Barcode className="w-4 h-4 text-cyan-600" />
            <span>Etiquetas con Código de Barras para Muestras</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Labels Container */}
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
          <p className="text-xs text-slate-500 font-medium">
            Impresión térmica estándar (50mm x 25mm) para tubos y contenedores biológicos:
          </p>

          <div className="space-y-4">
            {orden.estudios.map((est, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                {/* Tube Color accent ribbon */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-2"
                  style={{ backgroundColor: est.colorTuboHex || '#0284c7' }}
                />

                <div className="pl-3 space-y-1.5">
                  {/* Top info */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black tracking-wider text-slate-900">
                      {orden.folio}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {est.codigo}
                    </span>
                  </div>

                  {/* Patient Name */}
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {orden.paciente.nombre}
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                    <span>{orden.paciente.edad}a / {orden.paciente.sexo}</span>
                    <span className="truncate max-w-[170px] text-slate-500">{est.tipoTubo}</span>
                    <span>{new Date(orden.fechaCreacion).toLocaleDateString()}</span>
                  </div>

                  {/* Visual Barcode */}
                  <div className="pt-1 flex flex-col items-center">
                    {renderBarcodeLines(`${orden.folio}-${est.codigo}`)}
                    <span className="font-mono text-[9px] text-slate-500 tracking-widest mt-0.5">
                      *{orden.folio}-{est.codigo}*
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Etiquetas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
