import React, { useState, useEffect } from 'react';
import { ResourceLink, AttachedFile } from '../types';
import { DocumentManager } from './DocumentManager';
import { 
  Bookmark, 
  X, 
  Trash2, 
  Copy, 
  Download, 
  ExternalLink, 
  Star, 
  Save 
} from 'lucide-react';
import { downloadFile } from '../utils/fileHelpers';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: ResourceLink | null;
  onSaveLink: (updatedLink: ResourceLink) => void;
  onDeleteLink: (id: string) => void;
  onDuplicateLink: (link: ResourceLink) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  isOpen,
  onClose,
  link,
  onSaveLink,
  onDeleteLink,
  onDuplicateLink,
  onNotify
}) => {
  if (!isOpen || !link) return null;

  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [category, setCategory] = useState(link.category);
  const [description, setDescription] = useState(link.description || '');
  const [isFavorite, setIsFavorite] = useState(link.isFavorite);
  const [tagInput, setTagInput] = useState((link.tags || []).join(', '));
  const [documents, setDocuments] = useState<AttachedFile[]>(link.documents || []);

  useEffect(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setCategory(link.category);
      setDescription(link.description || '');
      setIsFavorite(link.isFavorite);
      setTagInput((link.tags || []).join(', '));
      setDocuments(link.documents || []);
    }
  }, [link]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSaveLink({
      ...link,
      title: title.trim(),
      url: formattedUrl,
      category: category.trim() || 'Général',
      description: description.trim(),
      isFavorite,
      tags,
      documents
    });

    onNotify('Lien modifié avec succès', 'success');
    onClose();
  };

  const handleExportLink = () => {
    const jsonStr = JSON.stringify(link, null, 2);
    downloadFile(jsonStr, `lien-${link.id}.json`, 'application/json');
    onNotify('Lien exporté au format JSON', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Modifier le Lien</h3>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg flex items-center justify-center"
              title="Ouvrir le lien"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={handleExportLink}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
              title="Exporter en JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onDuplicateLink(link);
                onNotify('Lien dupliqué avec succès', 'success');
                onClose();
              }}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
              title="Dupliquer le lien"
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nom de la ressource *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              URL / Adresse web *
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Catégorie
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tags (séparés par virgules)
              </label>
              <input
                type="text"
                placeholder="Docs, Outils, API..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Utilité, identifiants de session ou raccourcis..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1.5">
                <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
                Marquer comme favori (accès prioritaire)
              </span>
            </label>
          </div>

          {/* Attached Files & Documents */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <DocumentManager
              documents={documents}
              onAddDocument={(doc) => setDocuments(prev => [...prev, doc])}
              onRemoveDocument={(id) => setDocuments(prev => prev.filter(d => d.id !== id))}
              onReplaceDocument={(id, newDoc) => setDocuments(prev => prev.map(d => d.id === id ? newDoc : d))}
              onNotify={onNotify}
              title="Fichiers ou ressources locales associés"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment supprimer ce lien ?')) {
                  onDeleteLink(link.id);
                  onNotify('Lien supprimé', 'info');
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
