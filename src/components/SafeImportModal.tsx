import React, { useState, useRef } from 'react';
import { AppData, AddressEntry, Task, Project, ResourceLink, QuickNote } from '../types';
import { parseCSV } from '../utils/fileHelpers';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  FileCode2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  FileText,
  BookUser
} from 'lucide-react';

interface SafeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: AppData;
  targetCategory?: 'all' | 'addressBook' | 'tasks' | 'projects' | 'links' | 'notes';
  onApplyImport: (updatedData: AppData) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface ParsedSummary {
  fileName: string;
  fileSize: number;
  addressBook: AddressEntry[];
  tasks: Task[];
  projects: Project[];
  links: ResourceLink[];
  notes: QuickNote[];
  newCount: number;
  duplicateCount: number;
  error?: string;
}

export const SafeImportModal: React.FC<SafeImportModalProps> = ({
  isOpen,
  onClose,
  currentData,
  targetCategory = 'all',
  onApplyImport,
  onNotify
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedSummary | null>(null);
  const [strategy, setStrategy] = useState<'add_new' | 'update_existing' | 'replace_all'>('add_new');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);

    const name = selectedFile.name.toLowerCase();
    const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls');

    const reader = new FileReader();

    const processData = (content: string | ArrayBuffer) => {
      try {
        let addressBook: AddressEntry[] = [];
        let tasks: Task[] = [];
        let projects: Project[] = [];
        let links: ResourceLink[] = [];
        let notes: QuickNote[] = [];

        if (isExcel) {
          const data = new Uint8Array(content as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Check if there is an AddressBook sheet
          const addressSheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('adresse') || s.toLowerCase().includes('carnet')) || workbook.SheetNames[0];
          const sheet = workbook.Sheets[addressSheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

          if (targetCategory === 'addressBook' || (rows[0] && ('Nom' in rows[0] || 'nom' in rows[0] || 'Clé' in rows[0] || 'Cle' in rows[0] || 'Nature' in rows[0]))) {
            addressBook = rows.map((r, i) => ({
              id: r.id || 'addr-import-' + Date.now() + '-' + i,
              name: String(r.Nom || r.nom || r.Name || r.name || r.titre || r.title || '').trim(),
              key: String(r.Clé || r.Cle || r.clé || r.cle || r.Key || r.key || r.code || '').trim(),
              nature: String(r.Nature || r.nature || r.Type || r.type || r.categorie || '').trim(),
              notification: String(r.Notification || r.notification || r.notif || r.Notif || '').trim(),
              createdAt: new Date().toISOString()
            }));
          } else if (targetCategory === 'projects' || (rows[0] && ('progression' in rows[0] || 'progress' in rows[0]))) {
            projects = rows.map((r, i) => ({
              id: r.id || 'proj-import-' + Date.now() + '-' + i,
              title: String(r.title || r.Titre || r.titre || 'Projet importé'),
              description: String(r.description || r.Description || ''),
              category: String(r.category || r.categorie || r.Catégorie || 'Général'),
              status: 'en_cours',
              progress: Number(r.progress || r.progression || 0),
              dueDate: String(r.dueDate || r.echeance || r.Echéance || ''),
              tags: []
            }));
          } else {
            // Default to addressBook if ambiguous
            addressBook = rows.map((r, i) => ({
              id: r.id || 'addr-import-' + Date.now() + '-' + i,
              name: String(r.Nom || r.nom || r.Name || r.name || r.titre || r.title || '').trim(),
              key: String(r.Clé || r.Cle || r.clé || r.cle || r.Key || r.key || r.code || '').trim(),
              nature: String(r.Nature || r.nature || r.Type || r.type || r.categorie || '').trim(),
              notification: String(r.Notification || r.notification || r.notif || r.Notif || '').trim(),
              createdAt: new Date().toISOString()
            }));
          }
        } else if (name.endsWith('.json')) {
          const raw = JSON.parse(content as string);
          if (raw && (Array.isArray(raw.addressBook) || Array.isArray(raw.tasks) || Array.isArray(raw.projects) || Array.isArray(raw.links) || Array.isArray(raw.notes))) {
            addressBook = Array.isArray(raw.addressBook) ? raw.addressBook : [];
            tasks = Array.isArray(raw.tasks) ? raw.tasks : [];
            projects = Array.isArray(raw.projects) ? raw.projects : [];
            links = Array.isArray(raw.links) ? raw.links : [];
            notes = Array.isArray(raw.notes) ? raw.notes : [];
          } else if (Array.isArray(raw)) {
            if (targetCategory === 'addressBook' || (raw[0] && ('nature' in raw[0] || 'notification' in raw[0] || 'name' in raw[0]))) {
              addressBook = raw.map((r, i) => ({
                id: r.id || 'addr-import-' + Date.now() + '-' + i,
                name: String(r.name || r.nom || r.Nom || '').trim(),
                key: String(r.key || r.cle || r.Clé || '').trim(),
                nature: String(r.nature || r.Nature || '').trim(),
                notification: String(r.notification || r.Notification || '').trim(),
                createdAt: r.createdAt || new Date().toISOString()
              }));
            } else if (targetCategory === 'tasks' || (raw[0] && 'priority' in raw[0])) {
              tasks = raw;
            } else if (targetCategory === 'projects' || (raw[0] && 'progress' in raw[0])) {
              projects = raw;
            } else if (targetCategory === 'links' || (raw[0] && 'url' in raw[0])) {
              links = raw;
            } else if (targetCategory === 'notes' || (raw[0] && 'content' in raw[0])) {
              notes = raw;
            }
          }
        } else if (name.endsWith('.csv')) {
          const rows = parseCSV(content as string);
          if (targetCategory === 'addressBook' || (rows[0] && ('nom' in rows[0] || 'Nom' in rows[0] || 'clé' in rows[0] || 'cle' in rows[0] || 'Clé' in rows[0] || 'nature' in rows[0] || 'Nature' in rows[0]))) {
            addressBook = rows.map((r, i) => ({
              id: r.id || 'addr-import-' + Date.now() + '-' + i,
              name: String(r.Nom || r.nom || r.Name || r.name || r.titre || r.title || '').trim(),
              key: String(r.Clé || r.Cle || r.clé || r.cle || r.Key || r.key || r.code || '').trim(),
              nature: String(r.Nature || r.nature || r.Type || r.type || r.categorie || '').trim(),
              notification: String(r.Notification || r.notification || r.notif || r.Notif || '').trim(),
              createdAt: new Date().toISOString()
            }));
          } else if (targetCategory === 'tasks' || (rows[0] && 'priorite' in rows[0]) || (rows[0] && 'priority' in rows[0])) {
            tasks = rows.map((r, i) => ({
              id: r.id || 'task-import-' + Date.now() + '-' + i,
              title: r.title || r.titre || 'Tâche importée',
              completed: r.completed === 'true' || r.termine === 'true',
              priority: (['haute', 'moyenne', 'basse'].includes(r.priority || r.priorite) ? (r.priority || r.priorite) : 'moyenne') as any,
              isToday: r.isToday === 'true' || r.aujourdhui === 'true',
              dueDate: r.dueDate || r.echeance || undefined,
              createdAt: new Date().toISOString()
            }));
          } else if (targetCategory === 'links' || (rows[0] && 'url' in rows[0])) {
            links = rows.map((r, i) => ({
              id: r.id || 'link-import-' + Date.now() + '-' + i,
              title: r.title || r.titre || 'Lien importé',
              url: r.url || 'https://',
              category: r.category || r.categorie || 'Général',
              description: r.description || '',
              isFavorite: r.isFavorite === 'true' || r.favori === 'true',
              clicks: Number(r.clicks || 0)
            }));
          } else if (targetCategory === 'projects' || (rows[0] && 'progress' in rows[0]) || (rows[0] && 'progression' in rows[0])) {
            projects = rows.map((r, i) => ({
              id: r.id || 'proj-import-' + Date.now() + '-' + i,
              title: r.title || r.titre || 'Projet importé',
              description: r.description || '',
              category: r.category || r.categorie || 'Développement',
              status: (['en_cours', 'en_attente', 'termine'].includes(r.status || r.statut) ? (r.status || r.statut) : 'en_cours') as any,
              progress: Number(r.progress || r.progression || 0),
              dueDate: r.dueDate || r.echeance || '',
              tags: r.tags ? r.tags.split(',').map((t: string) => t.trim()) : []
            }));
          } else if (targetCategory === 'notes' || (rows[0] && 'content' in rows[0]) || (rows[0] && 'contenu' in rows[0])) {
            notes = rows.map((r, i) => ({
              id: r.id || 'note-import-' + Date.now() + '-' + i,
              title: r.title || r.titre || 'Note importée',
              content: r.content || r.contenu || '',
              isPinned: r.isPinned === 'true',
              color: 'blue',
              updatedAt: new Date().toISOString()
            }));
          }
        } else if (name.endsWith('.txt') || name.endsWith('.md')) {
          notes = [{
            id: 'note-import-' + Date.now(),
            title: selectedFile.name.replace(/\.[^/.]+$/, ''),
            content: content as string,
            isPinned: false,
            color: 'zinc',
            updatedAt: new Date().toISOString()
          }];
        }

        // Compute duplicates against current database
        const existingAddressNames = new Set((currentData.addressBook || []).map(a => (a.name || a.key).toLowerCase().trim()));
        const existingTaskTitles = new Set((currentData.tasks || []).map(t => t.title.toLowerCase().trim()));
        const existingProjTitles = new Set(currentData.projects.map(p => p.title.toLowerCase().trim()));
        const existingLinkUrls = new Set(currentData.links.map(l => l.url.toLowerCase().trim()));
        const existingNoteTitles = new Set(currentData.notes.map(n => n.title.toLowerCase().trim()));

        let duplicateCount = 0;
        let newCount = 0;

        addressBook.forEach(a => {
          const key = (a.name || a.key).toLowerCase().trim();
          if (key && existingAddressNames.has(key)) duplicateCount++;
          else newCount++;
        });

        tasks.forEach(t => {
          if (existingTaskTitles.has(t.title.toLowerCase().trim())) duplicateCount++;
          else newCount++;
        });

        projects.forEach(p => {
          if (existingProjTitles.has(p.title.toLowerCase().trim())) duplicateCount++;
          else newCount++;
        });

        links.forEach(l => {
          if (existingLinkUrls.has(l.url.toLowerCase().trim())) duplicateCount++;
          else newCount++;
        });

        notes.forEach(n => {
          if (existingNoteTitles.has(n.title.toLowerCase().trim())) duplicateCount++;
          else newCount++;
        });

        setParsed({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          addressBook,
          tasks,
          projects,
          links,
          notes,
          newCount,
          duplicateCount
        });
        setIsProcessing(false);
      } catch (err) {
        setParsed({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          addressBook: [],
          tasks: [],
          projects: [],
          links: [],
          notes: [],
          newCount: 0,
          duplicateCount: 0,
          error: 'Impossible de lire ce fichier. Format non supporté ou syntaxe invalide.'
        });
        setIsProcessing(false);
      }
    };

    reader.onload = (e) => {
      if (e.target?.result) {
        processData(e.target.result);
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(selectedFile);
    } else {
      reader.readAsText(selectedFile);
    }
  };

  const handleConfirmImport = () => {
    if (!parsed || parsed.error) return;

    if (strategy === 'replace_all') {
      if (!window.confirm('Attention : toutes vos données actuelles vont être remplacées par celles du fichier. Continuer ?')) {
        return;
      }
      onApplyImport({
        addressBook: parsed.addressBook.length > 0 ? parsed.addressBook : (currentData.addressBook || []),
        tasks: parsed.tasks.length > 0 ? parsed.tasks : (currentData.tasks || []),
        projects: parsed.projects.length > 0 ? parsed.projects : currentData.projects,
        links: parsed.links.length > 0 ? parsed.links : currentData.links,
        notes: parsed.notes.length > 0 ? parsed.notes : currentData.notes
      });
      onNotify('Sauvegarde restaurée avec succès', 'success');
      onClose();
      return;
    }

    if (strategy === 'update_existing') {
      // Update addressBook by name/key/id, and add new ones
      const nextAddressBook = [...(currentData.addressBook || [])];
      parsed.addressBook.forEach(importedAddr => {
        const keyImported = (importedAddr.name || importedAddr.key).toLowerCase().trim();
        const idx = nextAddressBook.findIndex(a => a.id === importedAddr.id || (keyImported && (a.name || a.key).toLowerCase().trim() === keyImported));
        if (idx >= 0) nextAddressBook[idx] = { ...nextAddressBook[idx], ...importedAddr };
        else nextAddressBook.push(importedAddr);
      });

      // Update by title/id, and add new ones
      const nextTasks = [...(currentData.tasks || [])];
      parsed.tasks.forEach(importedTask => {
        const idx = nextTasks.findIndex(t => t.id === importedTask.id || t.title.toLowerCase().trim() === importedTask.title.toLowerCase().trim());
        if (idx >= 0) nextTasks[idx] = { ...nextTasks[idx], ...importedTask };
        else nextTasks.push(importedTask);
      });

      const nextProjects = [...currentData.projects];
      parsed.projects.forEach(importedProj => {
        const idx = nextProjects.findIndex(p => p.id === importedProj.id || p.title.toLowerCase().trim() === importedProj.title.toLowerCase().trim());
        if (idx >= 0) nextProjects[idx] = { ...nextProjects[idx], ...importedProj };
        else nextProjects.push(importedProj);
      });

      const nextLinks = [...currentData.links];
      parsed.links.forEach(importedLink => {
        const idx = nextLinks.findIndex(l => l.url.toLowerCase().trim() === importedLink.url.toLowerCase().trim());
        if (idx >= 0) nextLinks[idx] = { ...nextLinks[idx], ...importedLink };
        else nextLinks.push(importedLink);
      });

      const nextNotes = [...currentData.notes];
      parsed.notes.forEach(importedNote => {
        const idx = nextNotes.findIndex(n => n.title.toLowerCase().trim() === importedNote.title.toLowerCase().trim());
        if (idx >= 0) nextNotes[idx] = { ...nextNotes[idx], ...importedNote };
        else nextNotes.push(importedNote);
      });

      onApplyImport({
        addressBook: nextAddressBook,
        tasks: nextTasks,
        projects: nextProjects,
        links: nextLinks,
        notes: nextNotes
      });
      onNotify(`Import terminé : éléments existants mis à jour et ${parsed.newCount} ajoutés`, 'success');
      onClose();
      return;
    }

    // Default: 'add_new' (ignore duplicates)
    const existingAddressKeys = new Set((currentData.addressBook || []).map(a => (a.name || a.key).toLowerCase().trim()));
    const existingTaskTitles = new Set((currentData.tasks || []).map(t => t.title.toLowerCase().trim()));
    const existingProjTitles = new Set(currentData.projects.map(p => p.title.toLowerCase().trim()));
    const existingLinkUrls = new Set(currentData.links.map(l => l.url.toLowerCase().trim()));
    const existingNoteTitles = new Set(currentData.notes.map(n => n.title.toLowerCase().trim()));

    const newAddressBook = parsed.addressBook.filter(a => {
      const k = (a.name || a.key).toLowerCase().trim();
      return !k || !existingAddressKeys.has(k);
    });
    const newTasks = parsed.tasks.filter(t => !existingTaskTitles.has(t.title.toLowerCase().trim()));
    const newProjects = parsed.projects.filter(p => !existingProjTitles.has(p.title.toLowerCase().trim()));
    const newLinks = parsed.links.filter(l => !existingLinkUrls.has(l.url.toLowerCase().trim()));
    const newNotes = parsed.notes.filter(n => !existingNoteTitles.has(n.title.toLowerCase().trim()));

    onApplyImport({
      addressBook: [...newAddressBook, ...(currentData.addressBook || [])],
      tasks: [...newTasks, ...(currentData.tasks || [])],
      projects: [...newProjects, ...currentData.projects],
      links: [...newLinks, ...currentData.links],
      notes: [...newNotes, ...currentData.notes]
    });

    const totalAdded = newAddressBook.length + newTasks.length + newProjects.length + newLinks.length + newNotes.length;
    onNotify(`${totalAdded} élément${totalAdded > 1 ? 's' : ''} importé${totalAdded > 1 ? 's' : ''} (${parsed.duplicateCount} doublons ignorés)`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Import Sécurisé de Données
            </h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-base"
          >
            ✕
          </button>
        </div>

        {/* Step 1: File selection */}
        {!parsed ? (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Sélectionnez un fichier <span className="font-mono text-indigo-600 dark:text-indigo-400">JSON</span>, <span className="font-mono text-emerald-600 dark:text-emerald-400">CSV</span> ou <span className="font-mono text-amber-600 dark:text-amber-400">Markdown/TXT</span>. 
              Vos données actuelles ne seront jamais écrasées sans votre accord.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-zinc-50 dark:bg-zinc-950/40"
            >
              <Upload className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Choisir un fichier à importer
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                JSON, CSV, Markdown (.md), Texte (.txt)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.txt,.md"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                className="hidden"
              />
            </div>
          </div>
        ) : parsed.error ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Erreur de lecture</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{parsed.error}</p>
            <button
              type="button"
              onClick={() => setParsed(null)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
            >
              Choisir un autre fichier
            </button>
          </div>
        ) : (
          /* Step 2 & 3: Inspection and Preview */
          <div className="space-y-4 animate-in fade-in">
            {/* File info card */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode2 className="w-5 h-5 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {parsed.fileName}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {(parsed.fileSize / 1024).toFixed(1)} Ko
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setParsed(null)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                Changer
              </button>
            </div>

            {/* Elements breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">Tâches</span>
                <span className="font-mono font-bold text-base text-zinc-900 dark:text-white">
                  {parsed.tasks.length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">Projets</span>
                <span className="font-mono font-bold text-base text-zinc-900 dark:text-white">
                  {parsed.projects.length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">Liens</span>
                <span className="font-mono font-bold text-base text-zinc-900 dark:text-white">
                  {parsed.links.length}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">Notes</span>
                <span className="font-mono font-bold text-base text-zinc-900 dark:text-white">
                  {parsed.notes.length}
                </span>
              </div>
            </div>

            {/* Conflict Detection Badge */}
            <div className="p-3 rounded-xl bg-zinc-100/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                {parsed.newCount} nouveau{parsed.newCount > 1 ? 'x' : ''}
              </span>
              <span className="text-zinc-500">
                {parsed.duplicateCount} doublon{parsed.duplicateCount > 1 ? 's' : ''} détecté{parsed.duplicateCount > 1 ? 's' : ''}
              </span>
            </div>

            {/* Strategy Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Que faire des données importées ?
              </label>

              <div className="space-y-1.5">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950">
                  <input
                    type="radio"
                    name="strategy"
                    checked={strategy === 'add_new'}
                    onChange={() => setStrategy('add_new')}
                    className="mt-0.5 text-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Ajouter uniquement (Recommandé)
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Ajoute les nouveaux éléments et ignore les doublons sans altérer l'existant.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950">
                  <input
                    type="radio"
                    name="strategy"
                    checked={strategy === 'update_existing'}
                    onChange={() => setStrategy('update_existing')}
                    className="mt-0.5 text-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Mettre à jour les éléments existants
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Met à jour les doublons avec les données du fichier et ajoute les nouveautés.
                    </span>
                  </div>
                </label>

                {(parsed.tasks.length > 0 || parsed.projects.length > 0) && (
                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-red-200 dark:border-red-950/80 cursor-pointer hover:bg-red-50/40 dark:hover:bg-red-950/20">
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === 'replace_all'}
                      onChange={() => setStrategy('replace_all')}
                      className="mt-0.5 text-red-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                        Remplacer toutes les données (Restauration complète)
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        Écrase l'ensemble de la base actuelle avec le contenu du fichier.
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <span>Appliquer l'import</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
