import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar,
  CheckCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import { Task, Priority, Project, DisplayMode } from '../types';

interface TasksSectionProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  displayMode?: DisplayMode;
  onAddTask: (title: string, priority: Priority, isToday: boolean, projectId?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  projects,
  searchQuery,
  displayMode: initialDisplayMode = 'list',
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('moyenne');
  const [newIsToday, setNewIsToday] = useState(true);
  const [newProjectId, setNewProjectId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'today' | 'high' | 'pending' | 'completed'>('all');
  const [localDisplayMode, setLocalDisplayMode] = useState<DisplayMode>(initialDisplayMode);

  // Sync if prop changes
  React.useEffect(() => {
    if (initialDisplayMode) {
      setLocalDisplayMode(initialDisplayMode);
    }
  }, [initialDisplayMode]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(
      newTitle.trim(),
      newPriority,
      newIsToday,
      newProjectId ? newProjectId : undefined
    );
    setNewTitle('');
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (searchQuery) {
      const match = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }

    if (filter === 'today') return task.isToday;
    if (filter === 'high') return task.priority === 'haute';
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Sort tasks: pending first, then by priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityWeight = { haute: 3, moyenne: 2, basse: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-xl p-5 flex flex-col h-full shadow-sm dark:shadow-none transition-colors duration-200">
      {/* Header and filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Tâches du Jour & Priorités</span>
            <span className="text-xs font-mono tabular-nums text-zinc-500 font-normal">
              ({tasks.filter(t => !t.completed).length} en attente)
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Ajoutez, organisez et cochez vos priorités numériques quotidiennes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch (Liste / Cartes) */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setLocalDisplayMode('list')}
              className={`p-1.5 rounded transition-colors ${
                localDisplayMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Affichage en liste"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLocalDisplayMode('cards')}
              className={`p-1.5 rounded transition-colors ${
                localDisplayMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Affichage en cartes"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                filter === 'today'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                filter === 'high'
                  ? 'bg-red-500/20 text-red-600 dark:text-red-300 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Urgentes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                filter === 'completed'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Terminées
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2 bg-zinc-50 dark:bg-zinc-950/90 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            placeholder="Ajouter une tâche prioritaire (ex: Valider maquette)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-transparent px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 shrink-0">
            {/* Priority Selector */}
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="haute">🔴 Haute</option>
              <option value="moyenne">🟡 Moyenne</option>
              <option value="basse">⚪ Basse</option>
            </select>

            {/* Associate with project */}
            {projects.length > 0 && (
              <select
                value={newProjectId}
                onChange={(e) => setNewProjectId(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-300 rounded-md px-2 py-1.5 focus:outline-none max-w-[130px] truncate"
              >
                <option value="">Projet (aucun)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}

            {/* Today toggle */}
            <button
              type="button"
              onClick={() => setNewIsToday(!newIsToday)}
              className={`px-2 py-1.5 rounded-md text-xs border transition-colors flex items-center gap-1 ${
                newIsToday 
                  ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-300 font-medium' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
              title="Priorité du jour"
            >
              <Calendar className="w-3 h-3" />
              <span>Aujourd'hui</span>
            </button>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-md transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </form>

      {/* Tasks Content: List View or Card/Grid View */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <CheckCheck className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Aucune tâche trouvée</p>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery ? 'Aucun résultat correspondant à votre recherche.' : 'Toutes les tâches de cette catégorie sont traitées.'}
          </p>
        </div>
      ) : localDisplayMode === 'list' ? (
        /* MODE LISTE */
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[460px] pr-1">
          {sortedTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            const priorityBadge = {
              haute: { text: 'Haute', style: 'text-red-500 dark:text-red-400 font-medium' },
              moyenne: { text: 'Moyenne', style: 'text-amber-500 dark:text-amber-400 font-medium' },
              basse: { text: 'Basse', style: 'text-zinc-500 dark:text-zinc-400' }
            }[task.priority];

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-150 ${
                  task.completed
                    ? 'bg-zinc-100/60 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900/80 opacity-60'
                    : 'bg-zinc-50/80 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80'
                }`}
              >
                {/* Left: Checkbox + Title + Metadata */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                      task.completed
                        ? 'bg-emerald-500 text-white dark:text-zinc-950'
                        : 'border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 bg-white dark:bg-zinc-900/60'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm leading-tight transition-colors ${
                        task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-200'
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                      <span className={`font-mono text-[11px] ${priorityBadge.style}`}>
                        {priorityBadge.text}
                      </span>
                      {task.isToday && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-600 dark:text-indigo-400/90 flex items-center gap-1 font-medium">
                            <Clock className="w-2.5 h-2.5" />
                            Aujourd'hui
                          </span>
                        </>
                      )}
                      {project && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[140px]">
                            {project.title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity pl-2">
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded transition-colors"
                    title="Supprimer la tâche"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE CARTES */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
          {sortedTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            const priorityBadge = {
              haute: { text: 'Haute', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
              moyenne: { text: 'Moyenne', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
              basse: { text: 'Basse', color: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' }
            }[task.priority];

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-150 ${
                  task.completed
                    ? 'bg-zinc-100/60 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900/80 opacity-60'
                    : 'bg-zinc-50/80 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono uppercase font-semibold ${priorityBadge.color}`}>
                      {priorityBadge.text}
                    </span>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 p-1"
                      title="Supprimer la tâche"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p
                    className={`text-sm font-medium leading-snug transition-colors ${
                      task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {task.title}
                  </p>

                  {project && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 truncate">
                      📁 {project.title}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-850 text-xs">
                  <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                    {task.isToday && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">Aujourd'hui</span>
                    )}
                  </span>

                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      task.completed
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{task.completed ? 'Terminée' : 'Valider'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer count & actions */}
      {completedCount > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span>{completedCount} tâche{completedCount > 1 ? 's' : ''} accomplie{completedCount > 1 ? 's' : ''}</span>
          <button
            onClick={onClearCompleted}
            className="text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Nettoyer les terminées
          </button>
        </div>
      )}
    </div>
  );
};
