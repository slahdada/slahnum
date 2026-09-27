import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Search, 
  Download, 
  Plus, 
  Layers,
  Calendar,
  Sun,
  Moon,
  LayoutGrid,
  List
} from 'lucide-react';
import { DisplayMode, ThemeMode } from '../types';

interface HeaderProps {
  activeTab: 'all' | 'tasks' | 'projects' | 'links' | 'notes';
  setActiveTab: (tab: 'all' | 'tasks' | 'projects' | 'links' | 'notes') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  displayMode: DisplayMode;
  onToggleDisplayMode: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenExportModal: () => void;
  onQuickNewItem: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  displayMode,
  onToggleDisplayMode,
  theme,
  onToggleTheme,
  onOpenExportModal,
  onQuickNewItem
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 sticky top-0 z-30 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Zone 1: Brand title & live indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/15 dark:bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-zinc-900 dark:text-white text-base">Espace Numérique</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                  <span className="hidden md:inline">Synchronisé</span>
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 capitalize">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span>{dateStr || 'Chargement...'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-zinc-600 dark:text-zinc-400">{time}</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation views */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900/90 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Vue Complète
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Tâches
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Projets
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'links'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Liens Favoris
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Notes Rapides
            </button>
          </nav>

          {/* Zone 3: Search, Controls & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Input */}
            <div className="relative w-28 sm:w-48 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  ×
                </button>
              )}
            </div>

            {/* Display Mode Toggle (Cartes / Liste) */}
            <button
              onClick={onToggleDisplayMode}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 shrink-0"
              title={displayMode === 'cards' ? 'Passer en Mode Liste' : 'Passer en Mode Cartes'}
            >
              {displayMode === 'cards' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden md:inline">Cartes</span>
                </>
              ) : (
                <>
                  <List className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden md:inline">Liste</span>
                </>
              )}
            </button>

            {/* Theme Toggle (Clair / Sombre) */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 shrink-0"
              title={theme === 'dark' ? 'Passer en Mode Clair' : 'Passer en Mode Sombre'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="hidden md:inline">Sombre</span>
                </>
              )}
            </button>

            {/* Backup / Export */}
            <button
              onClick={onOpenExportModal}
              title="Sauvegarde & Export"
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Quick Add */}
            <button
              onClick={onQuickNewItem}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </div>

        </div>

        {/* Mobile secondary tab selector */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-zinc-200 dark:border-zinc-850 gap-2 no-scrollbar">
          {(['all', 'tasks', 'projects', 'links', 'notes'] as const).map((tab) => {
            const labels = {
              all: 'Vue Complète',
              tasks: 'Tâches',
              projects: 'Projets',
              links: 'Liens',
              notes: 'Notes'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
