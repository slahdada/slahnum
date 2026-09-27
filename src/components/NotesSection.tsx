import React, { useState } from 'react';
import { 
  StickyNote, 
  Plus, 
  Pin, 
  Copy, 
  Check, 
  Trash2, 
  LayoutGrid, 
  List, 
  Upload, 
  Download, 
  Share2, 
  Edit3, 
  Paperclip 
} from 'lucide-react';
import { QuickNote, NoteColor, DisplayMode } from '../types';
import { ActionMenu } from './ActionMenu';
import { EditNoteModal } from './EditNoteModal';
import { BulkActionBar } from './BulkActionBar';
import { downloadFile, arrayToCSV, shareContent } from '../utils/fileHelpers';

interface NotesSectionProps {
  notes: QuickNote[];
  searchQuery: string;
  displayMode?: DisplayMode;
  onAddNote: (note: Omit<QuickNote, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<QuickNote>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onImportNotesRequest?: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  searchQuery,
  displayMode: initialDisplayMode = 'cards',
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  onImportNotesRequest,
  onNotify
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<NoteColor>('blue');
  const [localDisplayMode, setLocalDisplayMode] = useState<DisplayMode>(initialDisplayMode);

  // Edit Modal State
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);

  // Multi-Selection State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  React.useEffect(() => {
    if (initialDisplayMode) {
      setLocalDisplayMode(initialDisplayMode);
    }
  }, [initialDisplayMode]);

  const colorStyles: Record<NoteColor, { border: string; bg: string; dot: string; label: string }> = {
    zinc: { border: 'border-zinc-200 dark:border-zinc-800', bg: 'bg-zinc-50 dark:bg-zinc-950/70', dot: 'bg-zinc-400', label: 'Neutre' },
    amber: { border: 'border-amber-200 dark:border-amber-500/30', bg: 'bg-amber-50/70 dark:bg-amber-950/20', dot: 'bg-amber-500 dark:bg-amber-400', label: 'Important' },
    emerald: { border: 'border-emerald-200 dark:border-emerald-500/30', bg: 'bg-emerald-50/70 dark:bg-emerald-950/20', dot: 'bg-emerald-500 dark:bg-emerald-400', label: 'Idée' },
    blue: { border: 'border-blue-200 dark:border-blue-500/30', bg: 'bg-blue-50/70 dark:bg-blue-950/20', dot: 'bg-blue-500 dark:bg-blue-400', label: 'Projet' },
    purple: { border: 'border-purple-200 dark:border-purple-500/30', bg: 'bg-purple-50/70 dark:bg-purple-950/20', dot: 'bg-purple-500 dark:bg-purple-400', label: 'Réunion' },
    rose: { border: 'border-rose-200 dark:border-rose-500/30', bg: 'bg-rose-50/70 dark:bg-rose-950/20', dot: 'bg-rose-500 dark:bg-rose-400', label: 'Urgent' },
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;

    onAddNote({
      title: newTitle.trim() || 'Note rapide',
      content: newContent.trim(),
      isPinned: false,
      color: newColor,
      tags: [],
      documents: []
    });

    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
    onNotify('Note enregistrée', 'success');
  };

  const handleDuplicate = (note: QuickNote) => {
    onAddNote({
      title: note.title + ' (Copie)',
      content: note.content,
      isPinned: false,
      color: note.color,
      tags: note.tags ? [...note.tags] : [],
      documents: note.documents ? [...note.documents] : []
    });
    onNotify('Note dupliquée avec succès', 'success');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify('Texte copié dans le presse-papiers', 'success');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleShare = async (note: QuickNote) => {
    const shared = await shareContent({
      title: note.title,
      text: note.content
    });
    if (shared) {
      onNotify('Note partagée ou copiée', 'success');
    }
  };

  const handleExportMarkdown = (note: QuickNote) => {
    const md = `# ${note.title}\n\n*${note.updatedAt}*\n\n${note.content}\n`;
    downloadFile(md, `${note.title.toLowerCase().replace(/\s+/g, '-')}.md`, 'text/markdown;charset=utf-8');
    onNotify('Note exportée en Markdown', 'info');
  };

  const filteredNotes = notes.filter(n => {
    if (searchQuery) {
      const match = 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return 0;
  });

  // Multi-Selection Handlers
  const toggleSelectNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(sortedNotes.map(n => n.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  const handleExportSelected = () => {
    const selectedNotes = notes.filter(n => selectedIds.includes(n.id));
    const jsonStr = JSON.stringify(selectedNotes, null, 2);
    downloadFile(jsonStr, `selection-notes-${Date.now()}.json`, 'application/json');
    onNotify(`${selectedNotes.length} notes exportées`, 'success');
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Supprimer définitivement les ${selectedIds.length} notes sélectionnées ?`)) {
      selectedIds.forEach(id => onDeleteNote(id));
      onNotify(`${selectedIds.length} notes supprimées`, 'info');
      handleClearSelection();
    }
  };

  // Export current list
  const handleExportSection = () => {
    const csvContent = arrayToCSV(filteredNotes.map(n => ({
      Titre: n.title,
      Contenu: n.content,
      Epinglé: n.isPinned ? 'Oui' : 'Non',
      Couleur: n.color,
      Documents: (n.documents || []).length,
      Derniere_Mise_A_Jour: n.updatedAt
    })));
    downloadFile(csvContent, `notes-${Date.now()}.csv`, 'text/csv;charset=utf-8');
    onNotify('Liste des notes exportée au format CSV', 'info');
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-3.5 sm:p-5 flex flex-col h-full shadow-sm dark:shadow-none transition-colors duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Bloc-Notes Rapides</span>
            <span className="text-xs font-mono tabular-nums text-zinc-500 font-normal">
              ({notes.length})
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Mémos instantanés, synthèses et idées enregistrés automatiquement
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Action buttons: Importer / Exporter */}
          <div className="flex items-center gap-1">
            {onImportNotesRequest && (
              <button
                type="button"
                onClick={onImportNotesRequest}
                className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 active:scale-95 transition-all"
                title="Importer des notes (Markdown, TXT ou JSON)"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Importer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportSection}
              className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 active:scale-95 transition-all"
              title="Exporter les notes au format CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Exporter</span>
            </button>

            {/* Multi-selection toggle */}
            <button
              type="button"
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedIds([]);
              }}
              className={`min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all active:scale-95 ${
                isSelectMode
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
              title="Activer la sélection multiple"
            >
              <span>{isSelectMode ? 'Annuler sélection' : 'Sélection'}</span>
            </button>
          </div>

          {/* Display Mode Switch */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs shrink-0">
            <button
              onClick={() => setLocalDisplayMode('cards')}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                localDisplayMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Modèle Cartes"
              aria-label="Mode cartes"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLocalDisplayMode('list')}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                localDisplayMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Mode Liste"
              aria-label="Mode liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            aria-label="Ajouter une note"
            className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Nouvelle note</span>
          </button>
        </div>
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-indigo-500/50 mb-4 space-y-3 animate-in fade-in">
          <input
            type="text"
            placeholder="Titre de la note..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-transparent text-base sm:text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
            autoFocus
          />
          <textarea
            rows={3}
            placeholder="Écrivez votre pensée, snippet, lien temporaire..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {/* Color Swatches */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 mr-1">Couleur :</span>
              {(Object.keys(colorStyles) as NoteColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full ${colorStyles[c].dot} transition-transform active:scale-90 flex items-center justify-center ${
                    newColor === c ? 'scale-115 ring-2 ring-indigo-500 dark:ring-white/80' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={colorStyles[c].label}
                  aria-label={colorStyles[c].label}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="min-h-[40px] px-3.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-all active:scale-95 shadow-sm"
              >
                Enregistrer la note
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes Content */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <StickyNote className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Aucune note pour le moment</p>
          <p className="text-xs text-zinc-500 mt-1">Créez votre première note rapide pour stocker vos idées.</p>
        </div>
      ) : localDisplayMode === 'cards' ? (
        /* MODÈLE CARTES */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[500px] pr-0.5 flex-1">
          {sortedNotes.map((note) => {
            const style = colorStyles[note.color] || colorStyles.blue;
            const isSelected = selectedIds.includes(note.id);
            const docCount = (note.documents || []).length;

            return (
              <div
                key={note.id}
                className={`${style.bg} ${style.border} border rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 shadow-sm relative ${
                  isSelected ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {isSelectMode && (
                        <button
                          type="button"
                          onClick={(e) => toggleSelectNote(note.id, e)}
                          className="mr-1"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      )}
                      <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      <span className="text-[11px] font-semibold text-zinc-500 capitalize">
                        {style.label}
                      </span>
                      {docCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-0.5">
                          <Paperclip className="w-2.5 h-2.5" />
                          {docCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onTogglePin(note.id)}
                        className={`min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors ${
                          note.isPinned
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                        title={note.isPinned ? 'Détacher' : 'Épingler'}
                        aria-label="Épingler"
                      >
                        <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
                      </button>

                      {/* Plus d'actions (⋮ ActionMenu) */}
                      <ActionMenu
                        title={note.title}
                        subtitle="Actions sur la note"
                        items={[
                          {
                            label: 'Modifier',
                            icon: <Edit3 className="w-4 h-4 text-indigo-500" />,
                            onClick: () => setEditingNote(note),
                            variant: 'primary'
                          },
                          {
                            label: 'Télécharger (Markdown)',
                            icon: <Download className="w-4 h-4 text-emerald-500" />,
                            onClick: () => handleExportMarkdown(note)
                          },
                          {
                            label: 'Dupliquer',
                            icon: <Copy className="w-4 h-4 text-zinc-500" />,
                            onClick: () => handleDuplicate(note)
                          },
                          {
                            label: 'Partager / Copier',
                            icon: <Share2 className="w-4 h-4 text-indigo-500" />,
                            onClick: () => handleShare(note)
                          },
                          {
                            label: note.isPinned ? 'Détacher' : 'Épingler en haut',
                            icon: <Pin className="w-4 h-4 text-amber-500" />,
                            onClick: () => onTogglePin(note.id)
                          },
                          {
                            label: 'Supprimer',
                            icon: <Trash2 className="w-4 h-4 text-red-500" />,
                            onClick: () => {
                              if (window.confirm('Supprimer cette note ?')) {
                                onDeleteNote(note.id);
                                onNotify('Note supprimée', 'info');
                              }
                            },
                            variant: 'danger'
                          }
                        ]}
                      />
                    </div>
                  </div>

                  <h3 
                    onClick={() => setEditingNote(note)}
                    className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight cursor-pointer leading-snug"
                  >
                    {note.title}
                  </h3>

                  <p 
                    onClick={() => setEditingNote(note)}
                    className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 whitespace-pre-wrap leading-relaxed cursor-pointer line-clamp-4"
                  >
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                  <span className="text-zinc-400 text-[11px]">
                    {note.updatedAt}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                      className="min-h-[36px] px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg flex items-center gap-1.5 transition-colors active:scale-95"
                    >
                      {copiedId === note.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE LISTE */
        <div className="space-y-2 overflow-y-auto max-h-[500px] pr-0.5">
          {sortedNotes.map((note) => {
            const style = colorStyles[note.color] || colorStyles.blue;
            const isSelected = selectedIds.includes(note.id);
            const docCount = (note.documents || []).length;

            return (
              <div
                key={note.id}
                className={`p-3.5 ${style.bg} ${style.border} border rounded-xl flex items-center justify-between gap-3 transition-colors shadow-sm ${
                  isSelected ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div 
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => setEditingNote(note)}
                >
                  <div className="flex items-center gap-2">
                    {isSelectMode && (
                      <button
                        type="button"
                        onClick={(e) => toggleSelectNote(note.id, e)}
                        className="mr-1"
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )}
                    <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`} />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {note.title}
                    </h3>
                    {note.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-current shrink-0" />
                    )}
                    {docCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-0.5 shrink-0">
                        <Paperclip className="w-2.5 h-2.5" />
                        {docCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg active:scale-95"
                    title="Copier le contenu"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Plus d'actions (⋮ ActionMenu) */}
                  <ActionMenu
                    title={note.title}
                    subtitle="Actions sur la note"
                    items={[
                      {
                        label: 'Modifier',
                        icon: <Edit3 className="w-4 h-4 text-indigo-500" />,
                        onClick: () => setEditingNote(note),
                        variant: 'primary'
                      },
                      {
                        label: 'Télécharger (Markdown)',
                        icon: <Download className="w-4 h-4 text-emerald-500" />,
                        onClick: () => handleExportMarkdown(note)
                      },
                      {
                        label: 'Partager / Envoyer',
                        icon: <Share2 className="w-4 h-4 text-indigo-500" />,
                        onClick: () => handleShare(note)
                      },
                      {
                        label: 'Dupliquer',
                        icon: <Copy className="w-4 h-4 text-zinc-500" />,
                        onClick: () => handleDuplicate(note)
                      },
                      {
                        label: note.isPinned ? 'Détacher' : 'Épingler en haut',
                        icon: <Pin className="w-4 h-4 text-amber-500" />,
                        onClick: () => onTogglePin(note.id)
                      },
                      {
                        label: 'Supprimer',
                        icon: <Trash2 className="w-4 h-4 text-red-500" />,
                        onClick: () => {
                          if (window.confirm('Supprimer cette note ?')) {
                            onDeleteNote(note.id);
                            onNotify('Note supprimée', 'info');
                          }
                        },
                        variant: 'danger'
                      }
                    ]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Edit Modal */}
      <EditNoteModal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        note={editingNote}
        onSaveNote={(updatedNote) => {
          onUpdateNote(updatedNote.id, updatedNote);
          onNotify('Note modifiée', 'success');
        }}
        onDeleteNote={onDeleteNote}
        onDuplicateNote={handleDuplicate}
        onNotify={onNotify}
      />

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={sortedNotes.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onExportSelected={handleExportSelected}
        onDeleteSelected={handleDeleteSelected}
        itemLabel="notes"
      />
    </div>
  );
};
