import React from 'react';
import { CheckSquare, Briefcase, Bookmark, StickyNote, ArrowUpRight } from 'lucide-react';
import { AppData } from '../types';

interface DashboardStatsProps {
  data: AppData;
  onSelectTab: (tab: 'tasks' | 'projects' | 'links' | 'notes') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data, onSelectTab }) => {
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.completed).length;
  const todayTasks = data.tasks.filter(t => t.isToday);
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const highPriorityPending = data.tasks.filter(t => !t.completed && t.priority === 'haute').length;

  const activeProjects = data.projects.filter(p => p.status === 'en_cours').length;
  const avgProgress = data.projects.length > 0 
    ? Math.round(data.projects.reduce((acc, p) => acc + p.progress, 0) / data.projects.length) 
    : 0;

  const totalLinks = data.links.length;
  const favoriteLinks = data.links.filter(l => l.isFavorite).length;

  const totalNotes = data.notes.length;
  const pinnedNotes = data.notes.filter(n => n.isPinned).length;

  const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Stat 1: Tâches */}
      <div 
        onClick={() => onSelectTab('tasks')}
        className="group cursor-pointer bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-98 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 transition-all duration-200 shadow-sm"
      >
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tâches</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-white">
            {completedTasks}/{totalTasks}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            ({taskPercentage}%)
          </span>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 sm:h-2 rounded-full overflow-hidden mt-2.5">
          <div 
            className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${taskPercentage}%` }}
          />
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center justify-between mt-2 text-[11px] text-zinc-500 gap-0.5">
          <span>{todayCompleted}/{todayTasks.length} auj.</span>
          {highPriorityPending > 0 && (
            <span className="text-red-600 dark:text-red-400 font-bold">{highPriorityPending} urgente{highPriorityPending > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Stat 2: Projets */}
      <div 
        onClick={() => onSelectTab('projects')}
        className="group cursor-pointer bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-98 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 transition-all duration-200 shadow-sm"
      >
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Projets</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-white">
            {activeProjects}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            en cours
          </span>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 sm:h-2 rounded-full overflow-hidden mt-2.5">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${avgProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-zinc-500">
          <span>Avancement</span>
          <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300 font-bold">{avgProgress}%</span>
        </div>
      </div>

      {/* Stat 3: Liens & Favoris */}
      <div 
        onClick={() => onSelectTab('links')}
        className="group cursor-pointer bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-98 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 transition-all duration-200 shadow-sm"
      >
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <Bookmark className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Liens</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-white">
            {totalLinks}
          </span>
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
            enregistrés
          </span>
        </div>

        <div className="h-1.5 sm:h-2 mt-2.5 flex gap-1">
          <div className="bg-cyan-500/40 h-full rounded-full flex-1"></div>
          <div className="bg-cyan-500 h-full rounded-full flex-1"></div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-zinc-500">
          <span>{favoriteLinks} favoris</span>
          <span className="text-zinc-400">Accès direct</span>
        </div>
      </div>

      {/* Stat 4: Notes Rapides */}
      <div 
        onClick={() => onSelectTab('notes')}
        className="group cursor-pointer bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-98 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 transition-all duration-200 shadow-sm"
      >
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <StickyNote className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Notes</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors shrink-0" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-white">
            {totalNotes}
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
            mémos
          </span>
        </div>

        <div className="h-1.5 sm:h-2 mt-2.5 flex gap-1">
          <div className="bg-amber-500 h-full rounded-full flex-1"></div>
          <div className="bg-amber-500/30 h-full rounded-full flex-1"></div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-zinc-500">
          <span>{pinnedNotes} épinglée{pinnedNotes > 1 ? 's' : ''}</span>
          <span className="text-zinc-400">Auto-sauvegardé</span>
        </div>
      </div>
    </section>
  );
};
