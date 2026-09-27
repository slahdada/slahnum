import React, { useState } from 'react';
import { AppData } from '../types';
import { exportDataAsJson } from '../utils/storage';
import { uploadLocalDataToCloud } from '../services/cloudSync';
import { 
  Database, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  localData: AppData;
  onMigrationComplete: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({
  isOpen,
  onClose,
  userId,
  localData,
  onMigrationComplete,
  onNotify
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const totalItems = 
    localData.tasks.length + 
    localData.projects.length + 
    localData.links.length + 
    localData.notes.length;

  const handleImportToCloud = async () => {
    try {
      setIsMigrating(true);
      setProgress(10);

      // 1. Safety automatic backup download before migration!
      exportDataAsJson(localData);
      onNotify('Sauvegarde de sécurité créée', 'info');

      // 2. Upload to Firestore
      await uploadLocalDataToCloud(userId, localData, (p) => {
        setProgress(p);
      });

      setProgress(100);
      setTimeout(() => {
        setIsMigrating(false);
        onNotify('Vos données locales ont été importées avec succès dans votre compte', 'success');
        onMigrationComplete();
        onClose();
      }, 400);
    } catch (err) {
      console.error('Erreur migration:', err);
      setIsMigrating(false);
      onNotify('Erreur lors de la migration des données vers le cloud', 'error');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                Des données locales ont été détectées
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Voulez-vous synchroniser ces éléments avec votre nouveau compte ?
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              <span>Contenu présent sur cet appareil ({totalItems} éléments) :</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
              <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                • <strong>{localData.tasks.length}</strong> tâches
              </div>
              <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                • <strong>{localData.projects.length}</strong> projets
              </div>
              <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                • <strong>{localData.links.length}</strong> liens & favoris
              </div>
              <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                • <strong>{localData.notes.length}</strong> notes rapides
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Sécurité garantie :</strong> Une sauvegarde de sécurité sera automatiquement téléchargée sur votre appareil avant le transfert.
            </span>
          </div>

          {/* Progress bar during migration */}
          {isMigrating && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Synchronisation vers votre compte cloud...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-6 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950/40">
          <button
            type="button"
            disabled={isMigrating}
            onClick={handleImportToCloud}
            className="w-full sm:flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Importer mes données locales dans mon compte</span>
          </button>

          <button
            type="button"
            disabled={isMigrating}
            onClick={() => {
              onMigrationComplete();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-colors"
          >
            <span>Conserver uniquement les données en ligne</span>
          </button>
        </div>
      </div>
    </div>
  );
};
