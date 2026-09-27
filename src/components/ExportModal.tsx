import React, { useState } from 'react';
import { AppData } from '../types';
import { exportDataAsJson, generateStandaloneHtml } from '../utils/storage';
import { arrayToCSV, downloadFile } from '../utils/fileHelpers';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  FileCode2, 
  Copy, 
  Check, 
  Database,
  FileSpreadsheet,
  Layers,
  Star,
  X
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
  onOpenImportModal?: () => void;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onResetData,
  onOpenImportModal,
  onNotify
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [scope, setScope] = useState<'all' | 'tasks' | 'projects' | 'links' | 'notes' | 'favorites'>('all');
  const [format, setFormat] = useState<'json' | 'csv' | 'html'>('json');

  if (!isOpen) return null;

  const handleDownloadStandaloneHtml = () => {
    const htmlCode = generateStandaloneHtml(data);
    downloadFile(htmlCode, 'espace-numerique.html', 'text/html;charset=utf-8');
    onNotify?.('Fichier index.html autonome téléchargé', 'success');
  };

  const handleCopyStandaloneHtml = () => {
    const htmlCode = generateStandaloneHtml(data);
    navigator.clipboard.writeText(htmlCode);
    setCopiedHtml(true);
    onNotify?.('Code HTML autonome copié dans le presse-papiers', 'success');
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleExecuteExport = () => {
    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'html') {
      handleDownloadStandaloneHtml();
      return;
    }

    if (format === 'json') {
      let exportObj: any = data;
      let filename = `espace-numerique-backup-${dateStr}.json`;

      if (scope === 'tasks') {
        exportObj = { tasks: data.tasks };
        filename = `taches-${dateStr}.json`;
      } else if (scope === 'projects') {
        exportObj = { projects: data.projects };
        filename = `projets-${dateStr}.json`;
      } else if (scope === 'links') {
        exportObj = { links: data.links };
        filename = `liens-${dateStr}.json`;
      } else if (scope === 'notes') {
        exportObj = { notes: data.notes };
        filename = `notes-${dateStr}.json`;
      } else if (scope === 'favorites') {
        exportObj = {
          links: data.links.filter(l => l.isFavorite),
          notes: data.notes.filter(n => n.isPinned),
          tasks: data.tasks.filter(t => t.priority === 'haute' || t.isToday)
        };
        filename = `favoris-priorites-${dateStr}.json`;
      }

      downloadFile(JSON.stringify(exportObj, null, 2), filename, 'application/json');
      onNotify?.(`Export JSON téléchargé : ${filename}`, 'success');
      onClose();
      return;
    }

    if (format === 'csv') {
      let csvContent = '';
      let filename = `espace-numerique-${scope}-${dateStr}.csv`;

      if (scope === 'tasks') {
        csvContent = arrayToCSV(data.tasks.map(t => ({
          ID: t.id,
          Titre: t.title,
          Statut: t.completed ? 'Terminé' : 'En attente',
          Priorité: t.priority,
          Aujourdhui: t.isToday ? 'Oui' : 'Non',
          Echéance: t.dueDate || '',
          Date_Creation: t.createdAt
        })));
      } else if (scope === 'projects') {
        csvContent = arrayToCSV(data.projects.map(p => ({
          ID: p.id,
          Titre: p.title,
          Catégorie: p.category,
          Statut: p.status,
          Progression: p.progress + '%',
          Echéance: p.dueDate || '',
          Tags: p.tags.join('; '),
          Description: p.description
        })));
      } else if (scope === 'links') {
        csvContent = arrayToCSV(data.links.map(l => ({
          ID: l.id,
          Titre: l.title,
          URL: l.url,
          Catégorie: l.category,
          Favori: l.isFavorite ? 'Oui' : 'Non',
          Clics: l.clicks,
          Description: l.description
        })));
      } else if (scope === 'notes') {
        csvContent = arrayToCSV(data.notes.map(n => ({
          ID: n.id,
          Titre: n.title,
          Contenu: n.content,
          Epinglé: n.isPinned ? 'Oui' : 'Non',
          Couleur: n.color,
          Derniere_Mise_A_Jour: n.updatedAt
        })));
      } else {
        // All or favorites in CSV: export tasks + projects + links
        const allRows = [
          ...data.tasks.map(t => ({ Type: 'Tâche', Titre: t.title, Détail: t.priority, Statut: t.completed ? 'Terminé' : 'En cours' })),
          ...data.projects.map(p => ({ Type: 'Projet', Titre: p.title, Détail: p.category, Statut: p.status })),
          ...data.links.map(l => ({ Type: 'Lien', Titre: l.title, Détail: l.url, Statut: l.isFavorite ? 'Favori' : 'Normal' })),
          ...data.notes.map(n => ({ Type: 'Note', Titre: n.title, Détail: n.content.substring(0, 50), Statut: n.isPinned ? 'Épinglé' : '' }))
        ];
        csvContent = arrayToCSV(allRows);
      }

      downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
      onNotify?.(`Export CSV téléchargé : ${filename}`, 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Export & Sauvegarde</h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-base transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section: "Que voulez-vous exporter ?" */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            1. Que voulez-vous exporter ?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'Toutes les données', count: data.tasks.length + data.projects.length + data.links.length + data.notes.length },
              { id: 'tasks', label: 'Tâches du jour', count: data.tasks.length },
              { id: 'projects', label: 'Projets', count: data.projects.length },
              { id: 'links', label: 'Liens favoris', count: data.links.length },
              { id: 'notes', label: 'Bloc-notes', count: data.notes.length },
              { id: 'favorites', label: 'Favoris & Urgences', count: data.links.filter(l => l.isFavorite).length + data.tasks.filter(t => t.priority === 'haute').length },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScope(item.id as any)}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs active:scale-95 ${
                  scope === item.id
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="block truncate">{item.label}</span>
                <span className="text-[10px] text-zinc-500 font-mono">({item.count} éléments)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Format */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            2. Format d'exportation
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`p-3 rounded-xl border text-center transition-all text-xs active:scale-95 ${
                format === 'json'
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <Database className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
              <span>JSON (Sauvegarde)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-3 rounded-xl border text-center transition-all text-xs active:scale-95 ${
                format === 'csv'
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
              <span>CSV (Tableur)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('html')}
              className={`p-3 rounded-xl border text-center transition-all text-xs active:scale-95 ${
                format === 'html'
                  ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <FileCode2 className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <span>HTML Autonome</span>
            </button>
          </div>
        </div>

        {/* Action Button for the selected export */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleExecuteExport}
            className="w-full min-h-[46px] rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'export ({format.toUpperCase()})</span>
          </button>
        </div>

        {/* Section: Standalone HTML copy button */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-200">Fichier autonome prêt à l'emploi</p>
            <p className="text-zinc-500">Un unique fichier .html contenant toute l'application et vos données.</p>
          </div>
          <button
            type="button"
            onClick={handleCopyStandaloneHtml}
            className="min-h-[38px] px-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium shrink-0 flex items-center gap-1.5 active:scale-95"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHtml ? 'Copié' : 'Copier'}</span>
          </button>
        </div>

        {/* Section: Import & Reset Shortcuts */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onOpenImportModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImportModal();
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importer un fichier</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous réinitialiser toutes vos données avec les valeurs par défaut ?')) {
                  onResetData();
                  onNotify?.('Données réinitialisées', 'info');
                  onClose();
                }
              }}
              className="text-xs text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser</span>
            </button>
          </div>

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
