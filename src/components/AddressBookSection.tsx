import React, { useState, useMemo } from 'react';
import { 
  BookUser, 
  Plus, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  X, 
  Check, 
  AlertTriangle,
  Key,
  Tag,
  Bell,
  User,
  Copy,
  FileText
} from 'lucide-react';
import { AddressEntry, DisplayMode } from '../types';
import { downloadFile, arrayToCSV } from '../utils/fileHelpers';
import * as XLSX from 'xlsx';

interface AddressBookSectionProps {
  entries: AddressEntry[];
  searchQuery?: string;
  displayMode?: DisplayMode;
  onAddEntry: (entry: Omit<AddressEntry, 'id' | 'createdAt'>) => void;
  onUpdateEntry: (entry: AddressEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenImportModal?: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

type SortField = 'name' | 'key' | 'nature' | 'notification' | 'date';
type SortOrder = 'asc' | 'desc';

export const AddressBookSection: React.FC<AddressBookSectionProps> = ({
  entries,
  searchQuery: externalSearchQuery = '',
  displayMode: initialDisplayMode = 'list',
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onOpenImportModal,
  onNotify
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AddressEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<AddressEntry | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formNature, setFormNature] = useState('');
  const [formNotification, setFormNotification] = useState('');

  // Track which cell was just copied for visual feedback
  const [copiedIdField, setCopiedIdField] = useState<string | null>(null);

  // Copy cell text handler with fallback for older browsers or non-secure contexts
  const handleCopyText = async (text: string | undefined | null, fieldLabel: string, keyId: string) => {
    if (!text || !text.trim()) return;
    const val = text.trim();

    let success = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(val);
        success = true;
      } catch (err) {
        console.warn('Clipboard API failed, using fallback:', err);
        success = false;
      }
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = val;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        textArea.remove();
      } catch (err) {
        console.error('Fallback copy failed:', err);
        success = false;
      }
    }

    if (success) {
      setCopiedIdField(keyId);
      setTimeout(() => {
        setCopiedIdField(prev => prev === keyId ? null : prev);
      }, 1800);
      onNotify(`${fieldLabel} copié`, 'success');
    } else {
      onNotify(`Impossible de copier ${fieldLabel.toLowerCase()}`, 'error');
    }
  };

  const activeQuery = (externalSearchQuery || internalSearch).trim().toLowerCase();

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormKey('');
    setFormNature('');
    setFormNotification('');
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (entry: AddressEntry) => {
    setEditingEntry(entry);
    setFormName(entry.name || '');
    setFormKey(entry.key || '');
    setFormNature(entry.nature || '');
    setFormNotification(entry.notification || '');
  };

  // Submit Add
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEntry({
      name: formName.trim(),
      key: formKey.trim(),
      nature: formNature.trim(),
      notification: formNotification.trim()
    });
    setIsAddModalOpen(false);
    resetForm();
    onNotify('Entrée ajoutée au carnet d’adresses', 'success');
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    onUpdateEntry({
      ...editingEntry,
      name: formName.trim(),
      key: formKey.trim(),
      nature: formNature.trim(),
      notification: formNotification.trim(),
      updatedAt: new Date().toISOString()
    });
    setEditingEntry(null);
    resetForm();
    onNotify('Entrée modifiée avec succès', 'success');
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (entryToDelete) {
      onDeleteEntry(entryToDelete.id);
      setEntryToDelete(null);
      onNotify('Entrée supprimée du carnet', 'info');
    }
  };

  // Sorting toggle
  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Quick export options
  const handleExportCSV = () => {
    const rows = entries.map(e => ({
      Nom: e.name || '',
      Clé: e.key || '',
      Nature: e.nature || '',
      Notification: e.notification || ''
    }));
    const csvStr = arrayToCSV(rows);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvStr, `carnet-adresses-${dateStr}.csv`, 'text/csv;charset=utf-8');
    onNotify('Export CSV téléchargé', 'success');
  };

  const handleExportXLSX = () => {
    const rows = entries.map(e => ({
      Nom: e.name || '',
      Clé: e.key || '',
      Nature: e.nature || '',
      Notification: e.notification || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Carnet d’adresses');
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `carnet-adresses-${dateStr}.xlsx`);
    onNotify('Export Excel XLSX téléchargé', 'success');
  };

  const handleExportJSON = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const dataStr = JSON.stringify(entries, null, 2);
    downloadFile(dataStr, `carnet-adresses-${dateStr}.json`, 'application/json');
    onNotify('Export JSON téléchargé', 'success');
  };

  // Filtered & Sorted list
  const filteredAndSortedEntries = useMemo(() => {
    let result = entries.filter(item => {
      if (!activeQuery) return true;
      const n = (item.name || '').toLowerCase();
      const k = (item.key || '').toLowerCase();
      const nat = (item.nature || '').toLowerCase();
      const notif = (item.notification || '').toLowerCase();
      return n.includes(activeQuery) || k.includes(activeQuery) || nat.includes(activeQuery) || notif.includes(activeQuery);
    });

    result.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortField === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      } else if (sortField === 'key') {
        valA = (a.key || '').toLowerCase();
        valB = (b.key || '').toLowerCase();
      } else if (sortField === 'nature') {
        valA = (a.nature || '').toLowerCase();
        valB = (b.nature || '').toLowerCase();
      } else if (sortField === 'notification') {
        valA = (a.notification || '').toLowerCase();
        valB = (b.notification || '').toLowerCase();
      } else if (sortField === 'date') {
        valA = a.createdAt || '';
        valB = b.createdAt || '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [entries, activeQuery, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 dark:bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
              <BookUser className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  Carnet d’adresses
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {entries.length} entrée{entries.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Nom, Clé, Nature et Notification · Synchronisé multi-appareils
              </p>
            </div>
          </div>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Menu */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={handleExportXLSX}
                title="Exporter en Excel XLSX"
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden md:inline">XLSX</span>
              </button>
              <button
                onClick={handleExportCSV}
                title="Exporter en CSV"
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden md:inline">CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                title="Exporter en JSON"
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">JSON</span>
              </button>
            </div>

            {/* Import Button */}
            {onOpenImportModal && (
              <button
                onClick={onOpenImportModal}
                title="Importer des entrées (CSV / XLSX / JSON)"
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Importer</span>
              </button>
            )}

            {/* + Ajouter Button */}
            <button
              onClick={handleOpenAdd}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Ajouter</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              placeholder="Rechercher par Nom, Clé, Nature ou Notification..."
              className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {internalSearch && (
              <button
                onClick={() => setInternalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Sort Selector for Mobile & Desktop */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="hidden xs:inline">Trier par :</span>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
              <button
                onClick={() => handleToggleSort('name')}
                className={`px-2 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
                  sortField === 'name' 
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <span>Nom</span>
                {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
              </button>
              <button
                onClick={() => handleToggleSort('key')}
                className={`px-2 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
                  sortField === 'key' 
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <span>Clé</span>
                {sortField === 'key' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
              </button>
              <button
                onClick={() => handleToggleSort('nature')}
                className={`px-2 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
                  sortField === 'nature' 
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <span>Nature</span>
                {sortField === 'nature' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
              </button>
              <button
                onClick={() => handleToggleSort('notification')}
                className={`px-2 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
                  sortField === 'notification' 
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <span>Notification</span>
                {sortField === 'notification' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredAndSortedEntries.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <BookUser className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {activeQuery ? 'Aucune entrée correspondante' : 'Carnet d’adresses vide'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {activeQuery 
              ? `Aucun élément ne correspond à votre recherche "${activeQuery}".`
              : 'Ajoutez une nouvelle entrée en renseignant les champs de votre choix (Nom, Clé, Nature, Notification).'
            }
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une première entrée</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. DESKTOP VIEW: Real Table with exact recommended widths */}
          {/* Nom: ~45% | Clé: ~20% | Nature: ~20% | Notification: ~15% | Actions */}
          <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">
                  {/* Nom: ~45% */}
                  <th 
                    scope="col"
                    style={{ width: '42%' }}
                    onClick={() => handleToggleSort('name')}
                    className="p-3.5 pl-5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Nom</span>
                      {sortField === 'name' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-500" /> : <ArrowDown className="w-3 h-3 text-indigo-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>

                  {/* Clé: ~20% */}
                  <th 
                    scope="col"
                    style={{ width: '18%' }}
                    onClick={() => handleToggleSort('key')}
                    className="p-3.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Clé</span>
                      {sortField === 'key' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-500" /> : <ArrowDown className="w-3 h-3 text-indigo-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>

                  {/* Nature: ~20% */}
                  <th 
                    scope="col"
                    style={{ width: '18%' }}
                    onClick={() => handleToggleSort('nature')}
                    className="p-3.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Nature</span>
                      {sortField === 'nature' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-500" /> : <ArrowDown className="w-3 h-3 text-indigo-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>

                  {/* Notification: ~15% */}
                  <th 
                    scope="col"
                    style={{ width: '14%' }}
                    onClick={() => handleToggleSort('notification')}
                    className="p-3.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Notification</span>
                      {sortField === 'notification' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-500" /> : <ArrowDown className="w-3 h-3 text-indigo-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>

                  {/* Actions column */}
                  <th scope="col" style={{ width: '8%' }} className="p-3.5 pr-5 text-right">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-200">
                {filteredAndSortedEntries.map((entry) => (
                  <tr 
                    key={entry.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    {/* Nom: very wide and readable with Copy button */}
                    <td className="p-3.5 pl-5 font-semibold text-zinc-900 dark:text-white align-top break-words">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {entry.name ? (
                            <span className="text-sm font-semibold">{entry.name}</span>
                          ) : (
                            <span className="text-zinc-400 italic font-normal">—</span>
                          )}
                        </div>
                        {entry.name && entry.name.trim() && (
                          <button
                            onClick={() => handleCopyText(entry.name, 'Nom', `${entry.id}-name`)}
                            aria-label="Copier le nom"
                            title={copiedIdField === `${entry.id}-name` ? 'Nom copié !' : 'Copier le nom'}
                            className={`shrink-0 p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                              copiedIdField === `${entry.id}-name`
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30'
                                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-60 group-hover:opacity-100'
                            }`}
                          >
                            {copiedIdField === `${entry.id}-name` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Copié</span>
                              </>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Clé with Copy button */}
                    <td className="p-3.5 align-top break-words">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {entry.key ? (
                            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 inline-block break-all">
                              {entry.key}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">—</span>
                          )}
                        </div>
                        {entry.key && entry.key.trim() && (
                          <button
                            onClick={() => handleCopyText(entry.key, 'Clé', `${entry.id}-key`)}
                            aria-label="Copier la clé"
                            title={copiedIdField === `${entry.id}-key` ? 'Clé copiée !' : 'Copier la clé'}
                            className={`shrink-0 p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                              copiedIdField === `${entry.id}-key`
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30'
                                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-60 group-hover:opacity-100'
                            }`}
                          >
                            {copiedIdField === `${entry.id}-key` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Copié</span>
                              </>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Nature with Copy button */}
                    <td className="p-3.5 align-top break-words">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {entry.nature ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              {entry.nature}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">—</span>
                          )}
                        </div>
                        {entry.nature && entry.nature.trim() && (
                          <button
                            onClick={() => handleCopyText(entry.nature, 'Nature', `${entry.id}-nature`)}
                            aria-label="Copier la nature"
                            title={copiedIdField === `${entry.id}-nature` ? 'Nature copiée !' : 'Copier la nature'}
                            className={`shrink-0 p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                              copiedIdField === `${entry.id}-nature`
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30'
                                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-60 group-hover:opacity-100'
                            }`}
                          >
                            {copiedIdField === `${entry.id}-nature` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Copié</span>
                              </>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Notification with Copy button */}
                    <td className="p-3.5 align-top break-words">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {entry.notification ? (
                            <span className="text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                              <Bell className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{entry.notification}</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">—</span>
                          )}
                        </div>
                        {entry.notification && entry.notification.trim() && (
                          <button
                            onClick={() => handleCopyText(entry.notification, 'Notification', `${entry.id}-notification`)}
                            aria-label="Copier la notification"
                            title={copiedIdField === `${entry.id}-notification` ? 'Notification copiée !' : 'Copier la notification'}
                            className={`shrink-0 p-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                              copiedIdField === `${entry.id}-notification`
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30'
                                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-60 group-hover:opacity-100'
                            }`}
                          >
                            {copiedIdField === `${entry.id}-notification` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Copié</span>
                              </>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-5 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(entry)}
                          aria-label={`Modifier ${entry.name || 'entrée'}`}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          aria-label={`Supprimer ${entry.name || 'entrée'}`}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE VIEW: Tailored cards to avoid horizontal overflow */}
          <div className="md:hidden space-y-3">
            {filteredAndSortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3 transition-colors"
              >
                {/* Nom is the most prominent area with quick Copy, Edit, Delete */}
                <div className="flex items-start justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                      Nom
                    </span>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-tight break-words mt-0.5">
                      {entry.name || <span className="text-zinc-400 font-normal italic">— Sans nom —</span>}
                    </h4>
                  </div>

                  {/* Actions buttons + Copy Nom directly in card header */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {entry.name && entry.name.trim() && (
                      <button
                        onClick={() => handleCopyText(entry.name, 'Nom', `${entry.id}-name`)}
                        aria-label="Copier le nom"
                        title="Copier le nom"
                        className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          copiedIdField === `${entry.id}-name`
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {copiedIdField === `${entry.id}-name` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="min-h-[38px] min-w-[38px] p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                      title="Modifier"
                      aria-label={`Modifier ${entry.name || 'entrée'}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEntryToDelete(entry)}
                      className="min-h-[38px] min-w-[38px] p-2 rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition-colors cursor-pointer"
                      title="Supprimer"
                      aria-label={`Supprimer ${entry.name || 'entrée'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vertical Rows for Clé, Nature, Notification with Finger-friendly Copy buttons */}
                <div className="space-y-2 text-xs">
                  {/* Clé */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Clé
                      </span>
                      <div className="mt-0.5 font-mono text-zinc-800 dark:text-zinc-200 break-words font-medium">
                        {entry.key || <span className="text-zinc-400 font-sans italic font-normal">—</span>}
                      </div>
                    </div>
                    {entry.key && entry.key.trim() && (
                      <button
                        onClick={() => handleCopyText(entry.key, 'Clé', `${entry.id}-key`)}
                        aria-label="Copier la clé"
                        className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer ${
                          copiedIdField === `${entry.id}-key`
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {copiedIdField === `${entry.id}-key` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Nature */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Nature
                      </span>
                      <div className="mt-0.5 text-zinc-800 dark:text-zinc-200 break-words font-medium">
                        {entry.nature || <span className="text-zinc-400 italic font-normal">—</span>}
                      </div>
                    </div>
                    {entry.nature && entry.nature.trim() && (
                      <button
                        onClick={() => handleCopyText(entry.nature, 'Nature', `${entry.id}-nature`)}
                        aria-label="Copier la nature"
                        className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer ${
                          copiedIdField === `${entry.id}-nature`
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {copiedIdField === `${entry.id}-nature` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Notification */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Bell className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Notification</span>
                      </span>
                      <div className="mt-0.5 text-zinc-800 dark:text-zinc-200 break-words">
                        {entry.notification || <span className="text-zinc-400 italic font-normal">—</span>}
                      </div>
                    </div>
                    {entry.notification && entry.notification.trim() && (
                      <button
                        onClick={() => handleCopyText(entry.notification, 'Notification', `${entry.id}-notification`)}
                        aria-label="Copier la notification"
                        className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer ${
                          copiedIdField === `${entry.id}-notification`
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {copiedIdField === `${entry.id}-notification` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL: AJOUT D'UNE ENTRÉE */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Nouvelle entrée
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Tous les champs sont facultatifs (texte libre)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNew} className="p-5 space-y-3.5">
              {/* Nom */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nom</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex : Cabinet Médical Pasteur ou Alexandre Dupont"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Clé */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Clé</span>
                </label>
                <input
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="Ex : MED-042 ou 0612345678"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              {/* Nature */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nature</span>
                </label>
                <input
                  type="text"
                  value={formNature}
                  onChange={(e) => setFormNature(e.target.value)}
                  placeholder="Ex : Santé / Consultation ou Fournisseur IT"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Notification */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Notification</span>
                </label>
                <input
                  type="text"
                  value={formNotification}
                  onChange={(e) => setFormNotification(e.target.value)}
                  placeholder="Ex : Rappel SMS 48h avant ou Alerte mensuelle"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODIFIER UNE ENTRÉE */}
      {editingEntry && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setEditingEntry(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Modifier l'entrée
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Modifiez ou effacez n'importe quelle valeur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              {/* Nom */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nom</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex : Cabinet Médical Pasteur"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Clé */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Clé</span>
                </label>
                <input
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="Ex : MED-042"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              {/* Nature */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nature</span>
                </label>
                <input
                  type="text"
                  value={formNature}
                  onChange={(e) => setFormNature(e.target.value)}
                  placeholder="Ex : Santé / Consultation"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Notification */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Notification</span>
                </label>
                <input
                  type="text"
                  value={formNotification}
                  onChange={(e) => setFormNotification(e.target.value)}
                  placeholder="Ex : Rappel SMS 48h avant"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMATION DE SUPPRESSION */}
      {entryToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setEntryToDelete(null)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-5 space-y-4 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Supprimer l'entrée ?
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
              <p>
                <strong>Nom :</strong> {entryToDelete.name || '—'}
              </p>
              {entryToDelete.key && (
                <p>
                  <strong>Clé :</strong> {entryToDelete.key}
                </p>
              )}
              {entryToDelete.nature && (
                <p>
                  <strong>Nature :</strong> {entryToDelete.nature}
                </p>
              )}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Voulez-vous vraiment supprimer cette entrée du carnet d’adresses ?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="min-h-[40px] px-4 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
