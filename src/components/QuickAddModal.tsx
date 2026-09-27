import React, { useState } from 'react';
import { BookUser, Briefcase, Bookmark, StickyNote, User, Key, Tag, Bell } from 'lucide-react';
import { Priority, ProjectStatus, NoteColor } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAddressEntry: (entry: { name: string; key: string; nature: string; notification: string }) => void;
  onAddTask?: (title: string, priority: Priority, isToday: boolean) => void;
  onAddProject: (p: { title: string; description: string; category: string; status: ProjectStatus; progress: number; dueDate: string; tags: string[] }) => void;
  onAddLink: (l: { title: string; url: string; category: string; description: string; isFavorite: boolean }) => void;
  onAddNote: (n: { title: string; content: string; isPinned: boolean; color: NoteColor }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddAddressEntry,
  onAddProject,
  onAddLink,
  onAddNote
}) => {
  const [tab, setTab] = useState<'address' | 'project' | 'link' | 'note'>('address');

  // Address entry form
  const [addrName, setAddrName] = useState('');
  const [addrKey, setAddrKey] = useState('');
  const [addrNature, setAddrNature] = useState('');
  const [addrNotification, setAddrNotification] = useState('');

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
    if (tab === 'address') {
      onAddAddressEntry({
        name: addrName.trim(),
        key: addrKey.trim(),
        nature: addrNature.trim(),
        notification: addrNotification.trim()
      });
      setAddrName('');
      setAddrKey('');
      setAddrNature('');
      setAddrNotification('');
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
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setTab('address')}
            className={`min-h-[38px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors font-medium active:scale-95 cursor-pointer ${
              tab === 'address' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <BookUser className="w-3.5 h-3.5" />
            <span>Carnet</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('project')}
            className={`min-h-[38px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors font-medium active:scale-95 cursor-pointer ${
              tab === 'project' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Projet</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('link')}
            className={`min-h-[38px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors font-medium active:scale-95 cursor-pointer ${
              tab === 'link' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Lien</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('note')}
            className={`min-h-[38px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors font-medium active:scale-95 cursor-pointer ${
              tab === 'note' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {tab === 'address' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nom</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex : Cabinet Médical Pasteur ou Alexandre Dupont"
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Clé</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex : MED-042 ou Identifiant"
                  value={addrKey}
                  onChange={(e) => setAddrKey(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nature</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex : Santé / Consultation"
                  value={addrNature}
                  onChange={(e) => setAddrNature(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Notification</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex : Rappel SMS 48h avant"
                  value={addrNotification}
                  onChange={(e) => setAddrNotification(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <p className="text-[11px] text-zinc-400">
                Tous les champs sont facultatifs.
              </p>
            </>
          )}

          {tab === 'project' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Titre du projet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Audit cybersécurité..."
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Catégorie
                </label>
                <input
                  type="text"
                  placeholder="Ex : Développement, Qualité..."
                  value={projCat}
                  onChange={(e) => setProjCat(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Objectifs et livrables..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {tab === 'link' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Titre du lien *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Documentation React..."
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Adresse URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Catégorie
                </label>
                <input
                  type="text"
                  placeholder="Ex : Outils, IA, Références..."
                  value={linkCat}
                  onChange={(e) => setLinkCat(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {tab === 'note' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Titre de la note
                </label>
                <input
                  type="text"
                  placeholder="Titre court..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Contenu de la note *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tapez vos notes..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Couleur d'étiquette
                </label>
                <div className="flex gap-2">
                  {(['zinc', 'blue', 'emerald', 'amber', 'purple', 'rose'] as NoteColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNoteColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        noteColor === c ? 'scale-110 border-indigo-500' : 'border-transparent'
                      } ${
                        c === 'zinc' ? 'bg-zinc-600' :
                        c === 'blue' ? 'bg-blue-500' :
                        c === 'emerald' ? 'bg-emerald-500' :
                        c === 'amber' ? 'bg-amber-500' :
                        c === 'purple' ? 'bg-purple-500' : 'bg-rose-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
