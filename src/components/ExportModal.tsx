import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  FileCode2, 
  Copy, 
  Check, 
  Database,
  ShieldCheck
} from 'lucide-react';
import { AppData } from '../types';
import { exportDataAsJson, generateStandaloneHtml } from '../utils/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onImportData,
  onResetData
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadStandaloneHtml = () => {
    const htmlCode = generateStandaloneHtml(data);
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyStandaloneHtml = () => {
    const htmlCode = generateStandaloneHtml(data);
    navigator.clipboard.writeText(htmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.projects)) {
          onImportData(parsed);
          setImportError(null);
          onClose();
        } else {
          setImportError('Format de fichier JSON non reconnu.');
        }
      } catch (err) {
        setImportError('Erreur de lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Sauvegarde & Exportation</h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-base transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Local Storage Indicator */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-zinc-900 dark:text-zinc-200">Sauvegarde locale active</p>
            <p className="text-zinc-500">Toutes vos modifications sont conservées dans le <span className="font-mono text-zinc-700 dark:text-zinc-400">localStorage</span> de cet appareil.</p>
          </div>
        </div>

        {/* Section 1: Standalone single-file index.html */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Fichier index.html Autonome (Tailwind CDN)</span>
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Téléchargez ou copiez le code complet de l'application dans un seul fichier <span className="font-mono text-indigo-600 dark:text-indigo-300">index.html</span> autonome incluant vos données actuelles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadStandaloneHtml}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger index.html</span>
            </button>

            <button
              onClick={handleCopyStandaloneHtml}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/80 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              {copiedHtml ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Code HTML copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le code index.html</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Backup / Restore JSON */}
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sauvegarde des données brutes (JSON)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => exportDataAsJson(data)}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Exporter en JSON</span>
            </button>

            <label className="min-h-[44px] px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <Upload className="w-4 h-4" />
              <span>Importer un JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importError && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{importError}</p>
          )}
        </div>

        {/* Section 3: Reset */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous réinitialiser toutes vos données avec les valeurs par défaut ?')) {
                onResetData();
                onClose();
              }
            }}
            className="text-xs text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données</span>
          </button>

          <button
            onClick={onClose}
            className="min-h-[40px] w-full sm:w-auto px-5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
