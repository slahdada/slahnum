import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Trash2, 
  FolderKanban, 
  LayoutGrid, 
  List, 
  Upload, 
  Download, 
  Edit3, 
  Copy, 
  Paperclip, 
  Archive, 
  Check 
} from 'lucide-react';
import { Project, ProjectStatus, DisplayMode } from '../types';
import { ActionMenu } from './ActionMenu';
import { EditProjectModal } from './EditProjectModal';
import { BulkActionBar } from './BulkActionBar';
import { downloadFile, arrayToCSV } from '../utils/fileHelpers';

interface ProjectsSectionProps {
  projects: Project[];
  searchQuery: string;
  displayMode?: DisplayMode;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (project: Project) => void;
  onUpdateProjectProgress: (id: string, progress: number) => void;
  onUpdateProjectStatus: (id: string, status: ProjectStatus) => void;
  onDeleteProject: (id: string) => void;
  onImportProjectsRequest?: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  searchQuery,
  displayMode: initialDisplayMode = 'cards',
  onAddProject,
  onUpdateProject,
  onUpdateProjectProgress,
  onUpdateProjectStatus,
  onDeleteProject,
  onImportProjectsRequest,
  onNotify
}) => {
  const [filter, setFilter] = useState<'all' | 'en_cours' | 'en_attente' | 'termine' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localDisplayMode, setLocalDisplayMode] = useState<DisplayMode>(initialDisplayMode);

  // Edit Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Multi-Selection State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
      tags,
      documents: []
    });

    setTitle('');
    setDescription('');
    setCategory('Développement');
    setStatus('en_cours');
    setProgress(10);
    setDueDate('');
    setTagInput('');
    setIsModalOpen(false);
    onNotify('Projet créé avec succès', 'success');
  };

  const handleDuplicate = (proj: Project) => {
    onAddProject({
      title: proj.title + ' (Copie)',
      description: proj.description,
      category: proj.category,
      status: 'en_cours',
      progress: 0,
      dueDate: proj.dueDate,
      tags: [...proj.tags],
      notes: proj.notes,
      documents: proj.documents ? [...proj.documents] : []
    });
    onNotify('Projet dupliqué avec succès', 'success');
  };

  const handleToggleArchive = (proj: Project) => {
    const nextArchived = !proj.isArchived;
    onUpdateProject({
      ...proj,
      isArchived: nextArchived
    });
    onNotify(nextArchived ? 'Projet archivé' : 'Projet restauré des archives', 'info');
  };

  const handleExportSingleProject = (proj: Project) => {
    const jsonStr = JSON.stringify(proj, null, 2);
    downloadFile(jsonStr, `projet-${proj.id}.json`, 'application/json');
    onNotify('Données du projet exportées en JSON', 'info');
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (searchQuery) {
      const match = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) return false;
    }

    if (filter === 'archived') return !!p.isArchived;
    if (p.isArchived) return false; // Hide archived in regular tabs

    if (filter === 'all') return true;
    return p.status === filter;
  });

  // Multi-Selection Handlers
  const toggleSelectProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredProjects.map(p => p.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  const handleExportSelected = () => {
    const selectedProjects = projects.filter(p => selectedIds.includes(p.id));
    const jsonStr = JSON.stringify(selectedProjects, null, 2);
    downloadFile(jsonStr, `selection-projets-${Date.now()}.json`, 'application/json');
    onNotify(`${selectedProjects.length} projets exportés`, 'success');
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Supprimer définitivement les ${selectedIds.length} projets sélectionnés ?`)) {
      selectedIds.forEach(id => onDeleteProject(id));
      onNotify(`${selectedIds.length} projets supprimés`, 'info');
      handleClearSelection();
    }
  };

  // Export current list
  const handleExportSection = () => {
    const csvContent = arrayToCSV(filteredProjects.map(p => ({
      Titre: p.title,
      Catégorie: p.category,
      Statut: p.status,
      Progression: p.progress + '%',
      Echéance: p.dueDate || '',
      Tags: p.tags.join('; '),
      Documents: (p.documents || []).length,
      Description: p.description
    })));
    downloadFile(csvContent, `projets-${filter}-${Date.now()}.csv`, 'text/csv;charset=utf-8');
    onNotify('Liste des projets exportée au format CSV', 'info');
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-3.5 sm:p-5 flex flex-col h-full shadow-sm dark:shadow-none transition-colors duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Suivi de Projets</span>
            <span className="text-xs font-mono tabular-nums text-zinc-500 font-normal">
              ({projects.filter(p => !p.isArchived).length} actifs)
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tableau de bord, documents associés et jalons numériques
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Action buttons: Importer / Exporter */}
          <div className="flex items-center gap-1">
            {onImportProjectsRequest && (
              <button
                type="button"
                onClick={onImportProjectsRequest}
                className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 active:scale-95 transition-all"
                title="Importer des projets (CSV ou JSON)"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Importer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportSection}
              className="min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 active:scale-95 transition-all"
              title="Exporter les projets filtrés"
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

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors font-medium ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('en_cours')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors font-medium ${
                filter === 'en_cours'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setFilter('en_attente')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors font-medium ${
                filter === 'en_attente'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Pause
            </button>
            <button
              onClick={() => setFilter('termine')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors font-medium ${
                filter === 'termine'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Finis
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors font-medium ${
                filter === 'archived'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-500 dark:text-zinc-500'
              }`}
            >
              Archivés
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Nouveau projet"
            className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Projects Content */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <FolderKanban className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Aucun projet trouvé</p>
          <p className="text-xs text-zinc-500 mt-1">Créez votre premier projet ou changez vos critères de filtre.</p>
        </div>
      ) : localDisplayMode === 'cards' ? (
        /* MODÈLE CARTES */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto max-h-[500px] pr-0.5">
          {filteredProjects.map((project) => {
            const statusConfig = {
              en_cours: { label: 'En cours', color: 'text-emerald-600 dark:text-emerald-400', barColor: 'bg-emerald-500' },
              en_attente: { label: 'En attente', color: 'text-amber-600 dark:text-amber-400', barColor: 'bg-amber-500' },
              termine: { label: 'Terminé', color: 'text-zinc-500 dark:text-zinc-400', barColor: 'bg-indigo-500' }
            }[project.status];

            const isSelected = selectedIds.includes(project.id);
            const docCount = (project.documents || []).length;

            return (
              <div
                key={project.id}
                className={`bg-zinc-50/80 dark:bg-zinc-950/80 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 shadow-sm relative ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : project.isArchived
                    ? 'opacity-65 border-zinc-300 dark:border-zinc-800'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5">
                      {isSelectMode && (
                        <button
                          type="button"
                          onClick={(e) => toggleSelectProject(project.id, e)}
                          className="mr-1"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      )}
                      <span className="text-zinc-500 dark:text-zinc-400 font-semibold">{project.category}</span>
                      {docCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                          <Paperclip className="w-2.5 h-2.5" />
                          {docCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold ${statusConfig.color}`}>
                        {project.isArchived ? 'Archivé' : statusConfig.label}
                      </span>
                      
                      {/* Plus d'actions (⋮ ActionMenu) */}
                      <ActionMenu
                        title={project.title}
                        subtitle="Actions sur le projet"
                        items={[
                          {
                            label: 'Modifier',
                            icon: <Edit3 className="w-4 h-4 text-indigo-500" />,
                            onClick: () => setEditingProject(project),
                            variant: 'primary'
                          },
                          {
                            label: 'Dupliquer',
                            icon: <Copy className="w-4 h-4 text-zinc-500" />,
                            onClick: () => handleDuplicate(project)
                          },
                          {
                            label: 'Télécharger / Exporter (JSON)',
                            icon: <Download className="w-4 h-4 text-emerald-500" />,
                            onClick: () => handleExportSingleProject(project)
                          },
                          {
                            label: project.isArchived ? 'Désarchiver le projet' : 'Archiver le projet',
                            icon: <Archive className="w-4 h-4 text-amber-500" />,
                            onClick: () => handleToggleArchive(project)
                          },
                          {
                            label: 'Supprimer',
                            icon: <Trash2 className="w-4 h-4 text-red-500" />,
                            onClick: () => {
                              if (window.confirm('Supprimer ce projet ?')) {
                                onDeleteProject(project.id);
                                onNotify('Projet supprimé', 'info');
                              }
                            },
                            variant: 'danger'
                          }
                        ]}
                      />
                    </div>
                  </div>

                  <h3 
                    onClick={() => setEditingProject(project)}
                    className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-snug cursor-pointer"
                  >
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {project.description || 'Aucune description spécifiée.'}
                  </p>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2.5 flex-wrap">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress bar + controls */}
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      {project.dueDate ? (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Échéance: {project.dueDate}</span>
                        </>
                      ) : (
                        <span>Sans échéance</span>
                      )}
                    </div>
                    <span className="font-mono tabular-nums text-zinc-900 dark:text-white font-bold text-sm">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${statusConfig.barColor} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onUpdateProjectProgress(project.id, Math.max(0, project.progress - 10))}
                        className="min-w-[38px] min-h-[36px] px-2 py-1 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg active:scale-95 transition-all flex items-center justify-center"
                        title="-10%"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => onUpdateProjectProgress(project.id, Math.min(100, project.progress + 10))}
                        className="min-w-[38px] min-h-[36px] px-2 py-1 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg active:scale-95 transition-all flex items-center justify-center"
                        title="+10%"
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 text-[11px] text-zinc-500">
                    <span className="font-medium">Statut :</span>
                    <div className="flex items-center gap-1 font-semibold">
                      <button
                        onClick={() => onUpdateProjectStatus(project.id, 'en_cours')}
                        className={`min-h-[32px] px-2.5 py-1 rounded-lg transition-colors ${project.status === 'en_cours' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'}`}
                      >
                        Actif
                      </button>
                      <button
                        onClick={() => onUpdateProjectStatus(project.id, 'en_attente')}
                        className={`min-h-[32px] px-2.5 py-1 rounded-lg transition-colors ${project.status === 'en_attente' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'}`}
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => onUpdateProjectStatus(project.id, 'termine')}
                        className={`min-h-[32px] px-2.5 py-1 rounded-lg transition-colors ${project.status === 'termine' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'}`}
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
        <div className="space-y-2 overflow-y-auto max-h-[500px] pr-0.5">
          {filteredProjects.map((project) => {
            const statusConfig = {
              en_cours: { label: 'En cours', color: 'text-emerald-600 dark:text-emerald-400', barColor: 'bg-emerald-500' },
              en_attente: { label: 'En attente', color: 'text-amber-600 dark:text-amber-400', barColor: 'bg-amber-500' },
              termine: { label: 'Terminé', color: 'text-zinc-500 dark:text-zinc-400', barColor: 'bg-indigo-500' }
            }[project.status];

            const isSelected = selectedIds.includes(project.id);
            const docCount = (project.documents || []).length;

            return (
              <div
                key={project.id}
                className={`p-3.5 bg-zinc-50/80 dark:bg-zinc-950/80 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-sm ${
                  isSelected ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30' : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div 
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => setEditingProject(project)}
                >
                  <div className="flex items-center gap-2">
                    {isSelectMode && (
                      <button
                        type="button"
                        onClick={(e) => toggleSelectProject(project.id, e)}
                        className="mr-1"
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )}
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {project.title}
                    </h3>
                    <span className="text-xs text-zinc-500 shrink-0">
                      · {project.category}
                    </span>
                    {docCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 shrink-0">
                        <Paperclip className="w-2.5 h-2.5" />
                        {docCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {project.description || 'Sans description'}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${statusConfig.color}`}>
                      {project.isArchived ? 'Archivé' : statusConfig.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateProjectProgress(project.id, Math.max(0, project.progress - 10))}
                      className="min-w-[36px] min-h-[36px] px-2 py-1 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg active:scale-95 flex items-center justify-center"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => onUpdateProjectProgress(project.id, Math.min(100, project.progress + 10))}
                      className="min-w-[36px] min-h-[36px] px-2 py-1 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg active:scale-95 flex items-center justify-center"
                    >
                      +10
                    </button>

                    <ActionMenu
                      title={project.title}
                      subtitle="Actions sur le projet"
                      items={[
                        {
                          label: 'Modifier',
                          icon: <Edit3 className="w-4 h-4 text-indigo-500" />,
                          onClick: () => setEditingProject(project),
                          variant: 'primary'
                        },
                        {
                          label: 'Dupliquer',
                          icon: <Copy className="w-4 h-4 text-zinc-500" />,
                          onClick: () => handleDuplicate(project)
                        },
                        {
                          label: 'Télécharger / Exporter (JSON)',
                          icon: <Download className="w-4 h-4 text-emerald-500" />,
                          onClick: () => handleExportSingleProject(project)
                        },
                        {
                          label: project.isArchived ? 'Désarchiver' : 'Archiver',
                          icon: <Archive className="w-4 h-4 text-amber-500" />,
                          onClick: () => handleToggleArchive(project)
                        },
                        {
                          label: 'Supprimer',
                          icon: <Trash2 className="w-4 h-4 text-red-500" />,
                          onClick: () => {
                            if (window.confirm('Supprimer ce projet ?')) {
                              onDeleteProject(project.id);
                              onNotify('Projet supprimé', 'info');
                            }
                          },
                          variant: 'danger'
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Créer un nouveau projet</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-base"
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
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Objectifs principaux, jalons, périmètre..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Catégorie</label>
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
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Statut initial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="en_cours">En cours</option>
                    <option value="en_attente">En pause</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Progression ({progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full h-3 bg-zinc-200 dark:bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date cible</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  placeholder="ex: React, API, Mobile"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Créer le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Edit Modal */}
      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onSaveProject={onUpdateProject}
        onDeleteProject={onDeleteProject}
        onDuplicateProject={handleDuplicate}
        onNotify={onNotify}
      />

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={filteredProjects.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onExportSelected={handleExportSelected}
        onDeleteSelected={handleDeleteSelected}
        itemLabel="projets"
      />
    </div>
  );
};
