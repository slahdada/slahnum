import React, { useState } from 'react';
import { 
  StickyNote, 
  Plus, 
  Pin, 
  Copy, 
  Check, 
  Trash2, 
  LayoutGrid,
  List
} from 'lucide-react';
import { QuickNote, NoteColor, DisplayMode } from '../types';

interface NotesSectionProps {
  notes: QuickNote[];
  searchQuery: string;
  displayMode?: DisplayMode;
  onAddNote: (note: Omit<QuickNote, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<QuickNote>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  searchQuery,
  displayMode: initialDisplayMode = 'cards',
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<NoteColor>('blue');
  const [localDisplayMode, setLocalDisplayMode] = useState<DisplayMode>(initialDisplayMode);

  React.useEffect(() => {
    if (initialDisplayMode) {
      setLocalDisplayMode(initialDisplayMode);
    }
  }, [initialDisplayMode]);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

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
      color: newColor
    });

    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const handleStartEdit = (note: QuickNote) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateNote(id, {
      title: editTitle.trim() || 'Note sans titre',
      content: editContent.trim(),
      updatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    });
    setEditingNoteId(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
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

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
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
            {/* Large Color Swatches */}
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
            const isEditing = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`${style.bg} ${style.border} border rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 shadow-sm relative`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none"
                    />
                    <textarea
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="min-h-[36px] px-3 py-1 text-xs text-zinc-500"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="min-h-[36px] px-3.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg active:scale-95"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                        <span className="text-[11px] font-semibold text-zinc-500 capitalize">
                          {style.label}
                        </span>
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
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                          title="Supprimer la note"
                          aria-label="Supprimer la note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 
                      onClick={() => handleStartEdit(note)}
                      className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight cursor-pointer leading-snug"
                    >
                      {note.title}
                    </h3>

                    <p 
                      onClick={() => handleStartEdit(note)}
                      className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 whitespace-pre-wrap leading-relaxed cursor-pointer line-clamp-4"
                    >
                      {note.content}
                    </p>
                  </div>
                )}

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
            return (
              <div
                key={note.id}
                className={`p-3.5 ${style.bg} ${style.border} border rounded-xl flex items-center justify-between gap-3 transition-colors shadow-sm`}
              >
                <div 
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => handleStartEdit(note)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`} />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {note.title}
                    </h3>
                    {note.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-current shrink-0" />
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

                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded-lg active:scale-95"
                    title="Supprimer la note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
