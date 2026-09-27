import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  Layers,
  Calendar,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Maximize2,
  Minimize2,
  Smartphone,
  CheckCircle2
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
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isInstallable?: boolean;
  onInstallApp?: () => void;
  isInstalled?: boolean;
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
  onQuickNewItem,
  isFullscreen,
  onToggleFullscreen,
  isInstallable = false,
  onInstallApp,
  isInstalled = false
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 sticky top-0 z-30 backdrop-blur-md transition-colors duration-200 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand & live indicator */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/15 dark:bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-zinc-900 dark:text-white text-base leading-tight">
                  Espace Num
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden xs:inline">Actif</span>
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 capitalize leading-tight">
                <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-none">{dateStr}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{time}</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
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

          {/* Action Tools & Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Desktop / Tablet Search Input */}
            <div className="hidden sm:block relative w-36 md:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-8 pr-6 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer recherche"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  ×
                </button>
              )}
            </div>

            {/* Mobile Search Toggle Icon Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              aria-label="Rechercher"
              className={`sm:hidden min-w-[40px] min-h-[40px] p-2 flex items-center justify-center rounded-lg border transition-colors ${
                isMobileSearchOpen || searchQuery
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* FULLSCREEN TOGGLE BUTTON - Clearly Visible as Requested */}
            <button
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
              className={`min-w-[40px] min-h-[40px] px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                isFullscreen
                  ? 'bg-amber-500/15 dark:bg-amber-500/25 border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="hidden md:inline font-semibold">Quitter plein écran</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="hidden md:inline">Plein écran</span>
                </>
              )}
            </button>

            {/* PWA INSTALL BUTTON (if available and not standalone) */}
            {isInstallable && !isInstalled && onInstallApp && (
              <button
                onClick={onInstallApp}
                aria-label="Installer l'application"
                className="min-w-[40px] min-h-[40px] px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 active:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 animate-pulse"
                title="Installer sur l'écran d'accueil"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden md:inline">Installer l'app</span>
              </button>
            )}

            {/* Display Mode Toggle (Cartes / Liste) */}
            <button
              onClick={onToggleDisplayMode}
              aria-label={displayMode === 'cards' ? 'Passer en Mode Liste' : 'Passer en Mode Cartes'}
              className="min-w-[40px] min-h-[40px] px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:bg-zinc-300 dark:active:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
              title={displayMode === 'cards' ? 'Mode Liste' : 'Mode Cartes'}
            >
              {displayMode === 'cards' ? (
                <>
                  <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="hidden lg:inline">Cartes</span>
                </>
              ) : (
                <>
                  <List className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="hidden lg:inline">Liste</span>
                </>
              )}
            </button>

            {/* Theme Toggle (Clair / Sombre) */}
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Activer mode clair' : 'Activer mode sombre'}
              className="min-w-[40px] min-h-[40px] px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:bg-zinc-300 dark:active:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
              title={theme === 'dark' ? 'Passer en Mode Clair' : 'Passer en Mode Sombre'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden lg:inline">Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span className="hidden lg:inline">Sombre</span>
                </>
              )}
            </button>

            {/* Backup / Export */}
            <button
              onClick={onOpenExportModal}
              aria-label="Sauvegarde et Exportation"
              title="Sauvegarde & Export"
              className="min-w-[40px] min-h-[40px] px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:bg-zinc-300 dark:active:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Quick Add Button (Desktop & Tablet) */}
            <button
              onClick={onQuickNewItem}
              aria-label="Ajouter un élément"
              className="min-w-[40px] min-h-[40px] px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </div>

        </div>

        {/* Mobile Expandable Search Bar */}
        {isMobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1 animate-in slide-in-from-top-2 duration-150">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                autoFocus
                placeholder="Rechercher dans vos tâches, projets, liens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Sticky Exit Banner on Mobile when Fullscreen is Active */}
      {isFullscreen && (
        <div className="bg-amber-500/10 dark:bg-amber-500/20 border-t border-amber-500/30 px-3 py-1.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
            Mode Plein Écran actif
          </span>
          <button
            onClick={onToggleFullscreen}
            className="px-2.5 py-1 rounded bg-amber-500 text-white font-semibold text-xs active:scale-95 transition-transform flex items-center gap-1"
          >
            <Minimize2 className="w-3 h-3" />
            Quitter
          </button>
        </div>
      )}
    </header>
  );
};
