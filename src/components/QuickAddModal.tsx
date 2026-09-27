import React, { useState } from 'react';
import { CheckSquare, Briefcase, Bookmark, StickyNote } from 'lucide-react';
import { Priority, ProjectStatus, NoteColor } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, priority: Priority, isToday: boolean) => void;
  onAddProject: (p: { title: string; description: string; category: string; status: ProjectStatus; progress: number; dueDate: string; tags: string[] }) => void;
  onAddLink: (l: { title: string; url: string; category: string; description: string; isFavorite: boolean }) => void;
  onAddNote: (n: { title: string; content: string; isPinned: boolean; color: NoteColor }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onAddProject,
  onAddLink,
  onAddNote
}) => {
  const [tab, setTab] = useState<'task' | 'project' | 'link' | 'note'>('task');

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('moyenne');
  const [taskToday, setTaskToday] = useState(true);

  // Project form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCat, setProjCat] = useState('Développement');

  // Link form
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCat, setLinkCat] = useState('Outils & SaaS');

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<NoteColor>('blue');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'task') {
      if (!taskTitle.trim()) return;
      onAddTask(taskTitle.trim(), taskPriority, taskToday);
      setTaskTitle('');
    } else if (tab === 'project') {
      if (!projTitle.trim()) return;
      onAddProject({
        title: projTitle.trim(),
        description: projDesc.trim(),
        category: projCat,
        status: 'en_cours',
        progress: 0,
        dueDate: '',
        tags: []
      });
      setProjTitle('');
      setProjDesc('');
    } else if (tab === 'link') {
      if (!linkTitle.trim() || !linkUrl.trim()) return;
      let url = linkUrl.trim();
      if (!url.startsWith('http')) url = 'https://' + url;
      onAddLink({
        title: linkTitle.trim(),
        url,
        category: linkCat,
        description: '',
        isFavorite: true
      });
      setLinkTitle('');
      setLinkUrl('');
    } else if (tab === 'note') {
      if (!noteTitle.trim() && !noteContent.trim()) return;
      onAddNote({
        title: noteTitle.trim() || 'Note rapide',
        content: noteContent.trim(),
        isPinned: false,
        color: noteColor
      });
      setNoteTitle('');
      setNoteContent('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Ajout Rapide</h3>
          <button 
            onClick={onClose} 
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-base"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setTab('task')}
            className={`min-h-[38px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors font-medium active:scale-95 ${
              tab === 'task' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tâche</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('project')}
            className={`min-h-[38px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors font-medium active:scale-95 ${
              tab === 'project' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Projet</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('link')}
            className={`min-h-[38px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors font-medium active:scale-95 ${
              tab === 'link' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Lien</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('note')}
            className={`min-h-[38px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors font-medium active:scale-95 ${
              tab === 'note' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'task' && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Intitulé de la tâche *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Répondre au courriel client"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Priorité</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="haute">🔴 Haute</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="basse">⚪ Basse</option>
                  </select>
                </div>
                <div className="flex items-center pt-2 sm:pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={taskToday}
                      onChange={(e) => setTaskToday(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Tâche pour aujourd'hui</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {tab === 'project' && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nom du projet *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Campagne Marketing T3"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Catégorie</label>
                <select
                  value={projCat}
                  onChange={(e) => setProjCat(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Développement">Développement</option>
                  <option value="Design">Design</option>
                  <option value="Organisation">Organisation</option>
                  <option value="Veille">Veille</option>
                  <option value="Personnel">Personnel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Objectif et contexte..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </>
          )}

          {tab === 'link' && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nom du lien *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Google Workspace"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Catégorie</label>
                <input
                  type="text"
                  placeholder="ex: Outils, Documentation..."
                  value={linkCat}
                  onChange={(e) => setLinkCat(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {tab === 'note' && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Titre de la note</label>
                <input
                  type="text"
                  placeholder="ex: Idée de projet"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contenu</label>
                <textarea
                  rows={3}
                  placeholder="Écrivez ici vos notes..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Couleur</label>
                <div className="flex items-center gap-2">
                  {(['blue', 'emerald', 'amber', 'purple', 'rose', 'zinc'] as NoteColor[]).map((c) => {
                    const bgClass = {
                      blue: 'bg-blue-500',
                      emerald: 'bg-emerald-500',
                      amber: 'bg-amber-500',
                      purple: 'bg-purple-500',
                      rose: 'bg-rose-500',
                      zinc: 'bg-zinc-500'
                    }[c];
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNoteColor(c)}
                        className={`w-7 h-7 rounded-full ${bgClass} transition-transform active:scale-90 ${
                          noteColor === c ? 'scale-115 ring-2 ring-indigo-500 dark:ring-white/80' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-sm active:scale-95"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
