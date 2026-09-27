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
      title: newTitle.trim() || 'Note sans titre',
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
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-xl p-5 flex flex-col h-full shadow-sm dark:shadow-none transition-colors duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Bloc-Notes Rapides</span>
            <span className="text-xs font-mono tabular-nums text-zinc-500 font-normal">
              ({notes.length})
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Mémos instantanés, synthèses et idées enregistrés automatiquement
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Display Mode Switch */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setLocalDisplayMode('cards')}
              className={`p-1.5 rounded transition-colors ${
                localDisplayMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Modèle Cartes"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLocalDisplayMode('list')}
              className={`p-1.5 rounded transition-colors ${
                localDisplayMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Mode Liste"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-lg border border-indigo-500/50 mb-4 space-y-3">
          <input
            type="text"
            placeholder="Titre de la note..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          <textarea
            rows={3}
            placeholder="Écrivez votre pensée, snippet, lien temporaire..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            {/* Color choices */}
            <div className="flex items-center gap-1.5">
              {(Object.keys(colorStyles) as NoteColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-4 h-4 rounded-full ${colorStyles[c].dot} transition-transform ${
                    newColor === c ? 'scale-125 ring-2 ring-indigo-500 dark:ring-white/60' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={colorStyles[c].label}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2.5 py-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes Content */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <StickyNote className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Aucune note pour l'instant</p>
          <p className="text-xs text-zinc-500 mt-1">Créez votre première note rapide ci-dessus.</p>
        </div>
      ) : localDisplayMode === 'cards' ? (
        /* MODÈLE CARTES */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[460px] pr-1 flex-1">
          {sortedNotes.map((note) => {
            const style = colorStyles[note.color] || colorStyles.zinc;
            const isEditing = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`${style.bg} ${style.border} border rounded-xl p-3.5 flex flex-col justify-between transition-all duration-150 shadow-xs relative group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white px-2 py-0.5 rounded w-full focus:outline-none"
                      />
                    ) : (
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight truncate flex-1">
                        {note.title}
                      </h3>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onTogglePin(note.id)}
                        className={`p-1 rounded transition-colors ${
                          note.isPinned 
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/15' 
                            : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-300'
                        }`}
                        title={note.isPinned ? 'Détacher' : 'Épingler en haut'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 rounded transition-colors"
                        title="Supprimer la note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded resize-none focus:outline-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="px-2.5 py-0.5 text-xs bg-indigo-600 text-white rounded font-medium"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      onClick={() => handleStartEdit(note)}
                      className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed mt-1 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
                      title="Cliquer pour modifier"
                    >
                      {note.content || '(Note vide. Cliquez pour écrire...)'}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-200/60 dark:border-white/5 text-[11px] text-zinc-500">
                  <span className="font-mono tabular-nums">{note.updatedAt}</span>

                  <button
                    onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                    className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    title="Copier le texte"
                  >
                    {copiedId === note.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE LISTE */
        <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1 flex-1">
          {sortedNotes.map((note) => {
            const style = colorStyles[note.color] || colorStyles.zinc;
            return (
              <div
                key={note.id}
                className="p-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 rounded-lg flex items-center justify-between gap-3 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`}></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {note.title}
                      </h4>
                      {note.isPinned && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-medium">
                          Épinglé
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {note.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs text-zinc-500">
                  <span className="font-mono tabular-nums text-[11px] hidden sm:inline">{note.updatedAt}</span>
                  <button
                    onClick={() => onTogglePin(note.id)}
                    className={`p-1 rounded ${note.isPinned ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                    title={note.isPinned ? 'Détacher' : 'Épingler'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                    className="p-1 text-zinc-400 hover:text-zinc-600"
                    title="Copier"
                  >
                    {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 text-zinc-400 hover:text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
