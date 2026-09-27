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
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-3.5 sm:p-5 flex flex-col h-full shadow-sm dark:shadow-none transition-colors duration-200">
      
      {/* Header and filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Tâches du Jour & Priorités</span>
            <span className="text-xs font-mono tabular-nums text-zinc-500 font-normal">
              ({tasks.filter(t => !t.completed).length} en attente)
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Ajoutez, organisez et cochez vos priorités numériques quotidiennes
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Display Mode switch (Liste / Cartes) */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs shrink-0">
            <button
              onClick={() => setLocalDisplayMode('list')}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                localDisplayMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Affichage en liste"
              aria-label="Mode liste"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLocalDisplayMode('cards')}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                localDisplayMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Affichage en cartes"
              aria-label="Mode cartes"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Filter buttons - thumb scrollable with no scrollbar */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors whitespace-nowrap font-medium ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors whitespace-nowrap font-medium ${
                filter === 'today'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors whitespace-nowrap font-medium ${
                filter === 'high'
                  ? 'bg-red-500/20 text-red-600 dark:text-red-300 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Urgentes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors whitespace-nowrap font-medium ${
                filter === 'completed'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Terminées
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Form: Mobile-friendly vertical/wrapping */}
      <form onSubmit={handleAdd} className="mb-4">
        <div className="flex flex-col gap-2.5 bg-zinc-50 dark:bg-zinc-950/90 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            placeholder="Ajouter une tâche prioritaire..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            {/* Priority Selector */}
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              aria-label="Priorité de la tâche"
              className="min-h-[44px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-xs text-zinc-800 dark:text-zinc-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                aria-label="Associer au projet"
                className="min-h-[44px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-300 rounded-lg px-2.5 py-2 focus:outline-none truncate"
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
              className={`min-h-[44px] px-3 py-2 rounded-lg text-xs border transition-colors flex items-center justify-center gap-1.5 active:scale-95 ${
                newIsToday 
                  ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-300 font-semibold' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
              title="Priorité du jour"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Aujourd'hui</span>
            </button>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 sm:ml-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </form>

      {/* Tasks Content: List View or Card/Grid View */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <CheckCheck className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Aucune tâche trouvée</p>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery ? 'Aucun résultat correspondant à votre recherche.' : 'Toutes les tâches de cette catégorie sont traitées.'}
          </p>
        </div>
      ) : localDisplayMode === 'list' ? (
        /* MODE LISTE MOBILE OPTIMISÉ */
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-0.5">
          {sortedTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            const priorityBadge = {
              haute: { text: 'Haute', style: 'text-red-600 dark:text-red-400 font-semibold' },
              moyenne: { text: 'Moyenne', style: 'text-amber-600 dark:text-amber-400 font-medium' },
              basse: { text: 'Basse', style: 'text-zinc-500 dark:text-zinc-400' }
            }[task.priority];

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                  task.completed
                    ? 'bg-zinc-100/60 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900 opacity-60'
                    : 'bg-zinc-50/80 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Left: Large Finger Checkbox (Min 44x44px touch area) */}
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  aria-label={task.completed ? 'Marquer non terminée' : 'Marquer terminée'}
                  className="min-w-[44px] min-h-[44px] -ml-2 -my-2 flex items-center justify-center shrink-0 active:scale-95"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900'
                  }`}>
                    {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </button>

                {/* Center: Title + Metadata */}
                <div 
                  className="min-w-0 flex-1 px-2 cursor-pointer select-none"
                  onClick={() => onToggleTask(task.id)}
                >
                  <p
                    className={`text-sm sm:text-sm leading-snug transition-colors ${
                      task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100 font-medium'
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    <span className={`text-[11px] font-mono ${priorityBadge.style}`}>
                      {priorityBadge.text}
                    </span>
                    {task.isToday && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold text-[11px]">
                          <Clock className="w-3 h-3" />
                          Aujourd'hui
                        </span>
                      </>
                    )}
                    {project && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[130px] text-[11px]">
                          📁 {project.title}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Touch Delete Button (Min 44x44px touch area) */}
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label="Supprimer la tâche"
                  className="min-w-[44px] min-h-[44px] -mr-2 -my-2 flex items-center justify-center text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 active:scale-95 transition-colors shrink-0"
                  title="Supprimer la tâche"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE CARTES MOBILE OPTIMISÉ */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[500px] pr-0.5">
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
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all duration-150 ${
                  task.completed
                    ? 'bg-zinc-100/60 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900 opacity-60'
                    : 'bg-zinc-50/80 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono uppercase font-bold ${priorityBadge.color}`}>
                      {priorityBadge.text}
                    </span>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="min-w-[36px] min-h-[36px] -mr-1 -mt-1 flex items-center justify-center text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                      title="Supprimer la tâche"
                      aria-label="Supprimer la tâche"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p
                    className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${
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

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="text-zinc-500 text-[11px] flex items-center gap-1 font-medium">
                    {task.isToday && (
                      <span className="text-indigo-600 dark:text-indigo-400">Aujourd'hui</span>
                    )}
                  </span>

                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                      task.completed
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
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
            className="min-h-[36px] px-2 py-1 text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
          >
            Nettoyer les terminées
          </button>
        </div>
      )}
    </div>
  );
};
