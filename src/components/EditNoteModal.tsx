import React, { useState, useEffect } from 'react';
import { QuickNote, NoteColor, AttachedFile } from '../types';
import { DocumentManager } from './DocumentManager';
import { 
  StickyNote, 
  X, 
  Trash2, 
  Copy, 
  Download, 
  Share2, 
  Pin, 
  Save, 
  FileText 
} from 'lucide-react';
import { downloadFile, shareContent } from '../utils/fileHelpers';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: QuickNote | null;
  onSaveNote: (updatedNote: QuickNote) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: QuickNote) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onSaveNote,
  onDeleteNote,
  onDuplicateNote,
  onNotify
}) => {
  if (!isOpen || !note) return null;

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState<NoteColor>(note.color);
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [tagInput, setTagInput] = useState((note.tags || []).join(', '));
  const [documents, setDocuments] = useState<AttachedFile[]>(note.documents || []);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
      setIsPinned(note.isPinned);
      setTagInput((note.tags || []).join(', '));
      setDocuments(note.documents || []);
    }
  }, [note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const now = new Date();
    const timeStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    onSaveNote({
      ...note,
      title: title.trim() || 'Note sans titre',
      content: content.trim(),
      color,
      isPinned,
      tags,
      documents,
      updatedAt: timeStr
    });

    onNotify('Note enregistrée avec succès', 'success');
    onClose();
  };

  const handleExportMarkdown = () => {
    const md = `# ${note.title}\n\n*Dernière mise à jour : ${note.updatedAt}*\n\n${note.content}\n`;
    downloadFile(md, `${note.title.toLowerCase().replace(/\s+/g, '-')}.md`, 'text/markdown;charset=utf-8');
    onNotify('Note exportée au format Markdown (.md)', 'info');
  };

  const handleExportTxt = () => {
    const txt = `${note.title}\n${'-'.repeat(note.title.length)}\nDate : ${note.updatedAt}\n\n${note.content}`;
    downloadFile(txt, `${note.title.toLowerCase().replace(/\s+/g, '-')}.txt`, 'text/plain;charset=utf-8');
    onNotify('Note exportée au format Texte (.txt)', 'info');
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(note, null, 2);
    downloadFile(jsonStr, `note-${note.id}.json`, 'application/json');
    onNotify('Note exportée au format JSON', 'info');
  };

  const handleShare = async () => {
    const shared = await shareContent({
      title: note.title,
      text: note.content
    });
    if (shared) {
      onNotify('Note partagée ou copiée dans le presse-papiers', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Modifier la Note</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg flex items-center justify-center"
              title="Partager cette note"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onDuplicateNote(note);
                onNotify('Note dupliquée avec succès', 'success');
                onClose();
              }}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
              title="Dupliquer la note"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Export Quick Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800/80 text-xs">
          <span className="px-2 text-zinc-500 font-semibold text-[11px]">Télécharger :</span>
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 font-medium shadow-xs"
          >
            Markdown (.md)
          </button>
          <button
            type="button"
            onClick={handleExportTxt}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 font-medium shadow-xs"
          >
            Texte (.txt)
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 font-medium shadow-xs"
          >
            JSON
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Titre du mémo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Réflexion architecture, checklist..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Contenu de la note
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Saisissez vos idées, snippets, liens ou brouillons..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Color selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Couleur de la note
              </label>
              <div className="flex items-center gap-2">
                {(['blue', 'emerald', 'amber', 'purple', 'rose', 'zinc'] as NoteColor[]).map((c) => {
                  const bgColors: Record<NoteColor, string> = {
                    blue: 'bg-blue-500',
                    emerald: 'bg-emerald-500',
                    amber: 'bg-amber-500',
                    purple: 'bg-purple-500',
                    rose: 'bg-rose-500',
                    zinc: 'bg-zinc-500'
                  };
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full ${bgColors[c]} transition-transform active:scale-90 ${
                        color === c ? 'scale-115 ring-2 ring-indigo-500 dark:ring-white/80' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Pin checkbox */}
            <div className="pt-2 sm:pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1.5">
                  <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-indigo-600 fill-indigo-600' : 'text-zinc-400'}`} />
                  Épingler en haut
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              placeholder="ex: Idée, Réunion, Urgent"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Attached Files & Documents */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <DocumentManager
              documents={documents}
              onAddDocument={(doc) => setDocuments(prev => [...prev, doc])}
              onRemoveDocument={(id) => setDocuments(prev => prev.filter(d => d.id !== id))}
              onReplaceDocument={(id, newDoc) => setDocuments(prev => prev.map(d => d.id === id ? newDoc : d))}
              onNotify={onNotify}
              title="Fichiers attachés à la note"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment supprimer cette note ?')) {
                  onDeleteNote(note.id);
                  onNotify('Note supprimée', 'info');
                  onClose();
                }
              }}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
