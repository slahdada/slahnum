import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Trash2, 
  FolderKanban,
  LayoutGrid,
  List
} from 'lucide-react';
import { Project, ProjectStatus, DisplayMode } from '../types';

interface ProjectsSectionProps {
  projects: Project[];
  searchQuery: string;
  displayMode?: DisplayMode;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProjectProgress: (id: string, progress: number) => void;
  onUpdateProjectStatus: (id: string, status: ProjectStatus) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  searchQuery,
  displayMode: initialDisplayMode = 'cards',
  onAddProject,
  onUpdateProjectProgress,
  onUpdateProjectStatus,
  onDeleteProject
}) => {
  const [filter, setFilter] = useState<'all' | 'en_cours' | 'en_attente' | 'termine'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localDisplayMode, setLocalDisplayMode] = useState<DisplayMode>(initialDisplayMode);

  React.useEffect(() => {
    if (initialDisplayMode) {
      setLocalDisplayMode(initialDisplayMode);
    }
  }, [initialDisplayMode]);

  // New Project Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Développement');
  const [status, setStatus] = useState<ProjectStatus>('en_cours');
  const [progress, setProgress] = useState(10);
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onAddProject({
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Général',
      status,
      progress: Number(progress),
      dueDate: dueDate || '',
      tags
    });

    setTitle('');
    setDescription('');
    setCategory('Développement');
    setStatus('en_cours');
    setProgress(10);
    setDueDate('');
    setTagInput('');
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    if (searchQuery) {
      const match = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) return false;
    }

    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-xl p-5 flex flex-col h-full shadow-sm dark:shadow-none transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Suivi de Projets</span>
            <span className="text-xs font-mono tabular-nums text-zinc-500 font-normal">
              ({projects.length} au total)
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tableau de bord d'avancement de vos initiatives et jalons numériques
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

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('en_cours')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                filter === 'en_cours'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setFilter('en_attente')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                filter === 'en_attente'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Pause
            </button>
            <button
              onClick={() => setFilter('termine')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                filter === 'termine'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Finis
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouveau projet</span>
          </button>
        </div>
      </div>

      {/* Projects Content */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <FolderKanban className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Aucun projet trouvé</p>
          <p className="text-xs text-zinc-500 mt-1">Créez votre premier projet ou changez vos critères de filtre.</p>
        </div>
      ) : localDisplayMode === 'cards' ? (
        /* MODÈLE CARTES */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto max-h-[460px] pr-1">
          {filteredProjects.map((project) => {
            const statusConfig = {
              en_cours: { label: 'En cours', color: 'text-emerald-600 dark:text-emerald-400', barColor: 'bg-emerald-500' },
              en_attente: { label: 'En attente', color: 'text-amber-600 dark:text-amber-400', barColor: 'bg-amber-500' },
              termine: { label: 'Terminé', color: 'text-zinc-500 dark:text-zinc-400', barColor: 'bg-indigo-500' }
            }[project.status];

            return (
              <div
                key={project.id}
                className="bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 rounded-xl p-4 flex flex-col justify-between transition-all duration-150 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">{project.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 p-0.5 transition-colors"
                        title="Supprimer le projet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.description || 'Aucune description spécifiée.'}
                  </p>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2.5 flex-wrap">
                      {project.tags.map((tag, i) => (
                        <React.Fragment key={i}>
                          <span className="text-zinc-600 dark:text-zinc-400">#{tag}</span>
                          {i < project.tags.length - 1 && <span aria-hidden="true">·</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress bar + controls */}
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-850">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      {project.dueDate ? (
                        <>
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>Échéance: {project.dueDate}</span>
                        </>
                      ) : (
                        <span>Sans échéance</span>
                      )}
                    </div>
                    <span className="font-mono tabular-nums text-zinc-900 dark:text-white font-medium">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-850 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${statusConfig.barColor} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onUpdateProjectProgress(project.id, Math.max(0, project.progress - 10))}
                        className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded"
                        title="-10%"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => onUpdateProjectProgress(project.id, Math.min(100, project.progress + 10))}
                        className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded"
                        title="+10%"
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-zinc-500">
                    <span>Changer statut:</span>
                    <div className="flex items-center gap-1 font-medium">
                      <button
                        onClick={() => onUpdateProjectStatus(project.id, 'en_cours')}
                        className={`px-1.5 py-0.5 rounded ${project.status === 'en_cours' ? 'text-emerald-600 dark:text-emerald-300 font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                      >
                        Actif
                      </button>
                      <span aria-hidden="true">·</span>
                      <button
                        onClick={() => onUpdateProjectStatus(project.id, 'en_attente')}
                        className={`px-1.5 py-0.5 rounded ${project.status === 'en_attente' ? 'text-amber-600 dark:text-amber-300 font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                      >
                        Pause
                      </button>
                      <span aria-hidden="true">·</span>
                      <button
                        onClick={() => onUpdateProjectStatus(project.id, 'termine')}
                        className={`px-1.5 py-0.5 rounded ${project.status === 'termine' ? 'text-indigo-600 dark:text-indigo-300 font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                      >
                        Fini
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE LISTE */
        <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
          {filteredProjects.map((project) => {
            const statusConfig = {
              en_cours: { label: 'En cours', color: 'text-emerald-600 dark:text-emerald-400', barColor: 'bg-emerald-500' },
              en_attente: { label: 'En attente', color: 'text-amber-600 dark:text-amber-400', barColor: 'bg-amber-500' },
              termine: { label: 'Terminé', color: 'text-zinc-500 dark:text-zinc-400', barColor: 'bg-indigo-500' }
            }[project.status];

            return (
              <div
                key={project.id}
                className="p-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {project.title}
                    </h3>
                    <span className="text-xs text-zinc-500 shrink-0">
                      · {project.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {project.description || 'Sans description'}
                  </p>
                </div>

                {/* Progress bar + percentage */}
                <div className="w-full sm:w-48 shrink-0">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
                    <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`${statusConfig.barColor} h-full rounded-full transition-all`} style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onUpdateProjectProgress(project.id, Math.max(0, project.progress - 10))}
                    className="px-1.5 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-600 dark:text-zinc-400"
                    title="-10%"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => onUpdateProjectProgress(project.id, Math.min(100, project.progress + 10))}
                    className="px-1.5 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-600 dark:text-zinc-400"
                    title="+10%"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="p-1 text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 ml-1"
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

      {/* Modal: Nouveau Projet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Nouveau Projet</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Titre du projet *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Refonte Site E-commerce"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Objectifs principaux, jalons, périmètre..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Développement">Développement</option>
                    <option value="Design">Design</option>
                    <option value="Veille">Veille & Recherche</option>
                    <option value="Organisation">Organisation</option>
                    <option value="Personnel">Personnel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Statut initial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="en_cours">En cours</option>
                    <option value="en_attente">En pause</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Progression ({progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date cible</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  placeholder="ex: React, API, Urgent"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Créer le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
