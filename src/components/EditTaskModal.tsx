import React, { useState, useEffect } from 'react';
import { Task, Project, Priority, AttachedFile } from '../types';
import { DocumentManager } from './DocumentManager';
import { 
  CheckSquare, 
  X, 
  Calendar, 
  Trash2, 
  Copy, 
  Download, 
  Save 
} from 'lucide-react';
import { downloadFile } from '../utils/fileHelpers';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projects: Project[];
  onSaveTask: (updatedTask: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: Task) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  projects,
  onSaveTask,
  onDeleteTask,
  onDuplicateTask,
  onNotify
}) => {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [isToday, setIsToday] = useState(task.isToday);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [projectId, setProjectId] = useState<string>(task.projectId || '');
  const [completed, setCompleted] = useState(task.completed);
  const [documents, setDocuments] = useState<AttachedFile[]>(task.documents || []);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setNotes(task.notes || '');
      setPriority(task.priority);
      setIsToday(task.isToday);
      setDueDate(task.dueDate || '');
      setProjectId(task.projectId || '');
      setCompleted(task.completed);
      setDocuments(task.documents || []);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      ...task,
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      priority,
      isToday,
      dueDate: dueDate || undefined,
      projectId: projectId || undefined,
      completed,
      documents
    });

    onNotify('Tâche modifiée avec succès', 'success');
    onClose();
  };

  const handleExportTask = () => {
    const jsonStr = JSON.stringify(task, null, 2);
    downloadFile(jsonStr, `tache-${task.id}.json`, 'application/json');
    onNotify('Tâche exportée au format JSON', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Modifier la Tâche</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleExportTask}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
              title="Exporter cette tâche"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onDuplicateTask(task);
                onNotify('Tâche dupliquée avec succès', 'success');
                onClose();
              }}
              className="min-w-[34px] min-h-[34px] p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
              title="Dupliquer la tâche"
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
              Titre de la tâche *
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
              Description & consignes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails complémentaires, étapes ou critères de validation..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="haute">🔴 Haute</option>
                <option value="moyenne">🟡 Moyenne</option>
                <option value="basse">⚪ Basse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Projet associé
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 truncate"
              >
                <option value="">Aucun projet</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
              </input>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isToday}
                onChange={(e) => setIsToday(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Tâche du jour (Priorité immédiate)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Marquée comme accomplie</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes rapides & Références
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Liens, références textuelles, mémo..."
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
              title="Pièces jointes & Documents de la tâche"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
                  onDeleteTask(task.id);
                  onNotify('Tâche supprimée', 'info');
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
