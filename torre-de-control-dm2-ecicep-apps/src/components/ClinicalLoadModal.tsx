import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  Building2
} from 'lucide-react';

interface ClinicalLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSuccess: (loadedCount: number) => void;
  cesfamName: string;
}

export const ClinicalLoadModal: React.FC<ClinicalLoadModalProps> = ({
  isOpen,
  onClose,
  onLoadSuccess,
  cesfamName
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<'RAYEN' | 'SIGTE' | 'CSV_GENERICO'>('RAYEN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSimulateUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessCount(184);
      setTimeout(() => {
        onLoadSuccess(184);
        onClose();
        setSuccessCount(null);
        setSelectedFile(null);
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Cargar Lista de Espera APS</h3>
              <p className="text-xs text-slate-400">Importación estandarizada desde FCE (RAYEN / SIGTE)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target CESFAM */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span className="font-semibold text-slate-300">CESFAM Destino:</span>
            </div>
            <span className="font-bold text-teal-300 font-mono">{cesfamName}</span>
          </div>

          {/* System Origin Selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Sistema de Origen FCE / Registro
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSourceType('RAYEN')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  sourceType === 'RAYEN'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                RAYEN APS
              </button>
              <button
                type="button"
                onClick={() => setSourceType('SIGTE')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  sourceType === 'SIGTE'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                SIGTE MINSAL
              </button>
              <button
                type="button"
                onClick={() => setSourceType('CSV_GENERICO')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  sourceType === 'CSV_GENERICO'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Planilla CSV
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-slate-700/80 hover:border-teal-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors cursor-pointer">
            <FileSpreadsheet className="w-10 h-10 text-teal-400 mx-auto mb-2" />
            <p className="font-bold text-slate-200">
              Arrastre aquí el archivo de exportación .CSV o .XLSX
            </p>
            <p className="text-slate-500 text-[11px] mt-1">
              Campos requeridos: RUT, Nombre, Sector, Diagnóstico, Días de espera, Último Control
            </p>
            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              id="file-upload-input"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="file-upload-input"
              className="inline-block mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold cursor-pointer"
            >
              Examinar archivos local
            </label>
            {selectedFile && (
              <p className="mt-2 text-emerald-400 font-bold font-mono">
                ✓ Archivo cargado: {selectedFile.name}
              </p>
            )}
          </div>

          {successCount !== null && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-center font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>¡Se han procesado {successCount} registros de pacientes exitosamente!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={handleSimulateUpload}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-teal-950/50 transition-all disabled:opacity-50"
          >
            {isProcessing ? 'Procesando Archivo...' : 'Procesar e Importar'}
          </button>
        </div>
      </div>
    </div>
  );
};
