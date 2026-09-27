import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, AttachedFile } from '../types';
import { DocumentManager } from './DocumentManager';
import { 
  Briefcase, 
  X, 
  Calendar, 
  Trash2, 
  Copy, 
  Download, 
  Archive, 
  Save 
} from 'lucide-react';
import { downloadFile } from '../utils/fileHelpers';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSaveProject: (updatedProj: Project) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (proj: Project) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveProject,
  onDeleteProject,
  onDuplicateProject,
  onNotify
}) => {
  if (!isOpen || !project) return null;

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || '');
  const [category, setCategory] = useState(project.category);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [progress, setProgress] = useState(project.progress);
  const [dueDate, setDueDate] = useState(project.dueDate || '');
  const [tagInput, setTagInput] = useState(project.tags.join(', '));
  const [notes, setNotes] = useState(project.notes || '');
  const [isArchived, setIsArchived] = useState(project.isArchived || false);
  const [documents, setDocuments] = useState<AttachedFile[]>(project.documents || []);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setCategory(project.category);
      setStatus(project.status);
      setProgress(project.progress);
      setDueDate(project.dueDate || '');
      setTagInput(project.tags.join(', '));
      setNotes(project.notes || '');
      setIsArchived(project.isArchived || false);
      setDocuments(project.documents || []);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSaveProject({
      ...project,
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Général',
      status,
      progress: Number(progress),
      dueDate: dueDate || '',
      tags,
      notes: notes.trim(),
      isArchived,
      documents
    });

    onNotify('Projet mis à jour avec succès', 'success');
    onClose();
  };

  const handleExportProject = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    downloadFile(jsonStr, `projet-${project.id}.json`, 'application/json');
    onNotify('Données du projet exportées en JSON', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Modifier le Projet</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleExportProject}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
              title="Exporter les données du projet"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onDuplicateProject(project);
                onNotify('Projet dupliqué avec succès', 'success');
                onClose();
              }}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
              title="Dupliquer le projet"
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
              Nom du projet *
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
              Description & jalons
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objectifs stratégiques, livrables, responsabilités..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Développement">Développement</option>
                <option value="Design">Design</option>
                <option value="Veille">Veille & Recherche</option>
                <option value="Organisation">Organisation</option>
                <option value="Personnel">Personnel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as ProjectStatus;
                  setStatus(s);
                  if (s === 'termine') setProgress(100);
                }}
                className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="en_cours">🟢 En cours</option>
                <option value="en_attente">🟡 En attente / Pause</option>
                <option value="termine">🔵 Terminé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Date cible
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Progression : <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setProgress(prev => Math.max(0, prev - 10))}
                  className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold"
                >
                  -10%
                </button>
                <button
                  type="button"
                  onClick={() => setProgress(prev => Math.min(100, prev + 10))}
                  className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold"
                >
                  +10%
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                placeholder="ex: React, Cloud, Sécurité"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center pt-2 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isArchived}
                  onChange={(e) => setIsArchived(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5 text-amber-500" />
                  Archiver ce projet (conserver sans l'afficher en priorité)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes de suivi & Journal
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Journal de bord, réunions, remarques..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none"
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
              title="Documents & Fichiers du projet"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment supprimer ce projet ? Les tâches associées seront détachées.')) {
                  onDeleteProject(project.id);
                  onNotify('Projet supprimé', 'info');
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
