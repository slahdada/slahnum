import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
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
  CheckCircle2, 
  Settings, 
  Database 
} from 'lucide-react';
import { DisplayMode, ThemeMode } from '../types';
import { ActionMenu } from './ActionMenu';
import { User } from 'firebase/auth';
import { SyncStatus } from '../services/cloudSync';
import { LogIn, User as UserIcon, Cloud, CloudOff, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'all' | 'addressBook' | 'projects' | 'links' | 'notes';
  setActiveTab: (tab: 'all' | 'addressBook' | 'projects' | 'links' | 'notes') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenGlobalSearch: (initialQuery?: string) => void;
  displayMode: DisplayMode;
  onToggleDisplayMode: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
  onQuickNewItem: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isInstallable?: boolean;
  onInstallApp?: () => void;
  isInstalled?: boolean;
  user: User | null;
  syncStatus: SyncStatus;
  onOpenAuthModal: () => void;
  onOpenUserProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenGlobalSearch,
  displayMode,
  onToggleDisplayMode,
  theme,
  onToggleTheme,
  onOpenExportModal,
  onOpenImportModal,
  onQuickNewItem,
  isFullscreen,
  onToggleFullscreen,
  isInstallable = false,
  onInstallApp,
  isInstalled = false,
  user,
  syncStatus,
  onOpenAuthModal,
  onOpenUserProfile
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

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
                  <span className="hidden xs:inline">En direct</span>
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
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Vue Complète
            </button>
            <button
              onClick={() => setActiveTab('addressBook')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'addressBook'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Carnet d’adresses
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Projets
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'links'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Liens Favoris
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Notes Rapides
            </button>
          </nav>

          {/* Action Tools & Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Desktop / Tablet Global Search Trigger Input */}
            <div 
              onClick={() => onOpenGlobalSearch(searchQuery)}
              className="hidden sm:flex items-center relative w-40 md:w-56 cursor-pointer group"
              title="Recherche globale intelligente (Ctrl+K ou /)"
            >
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 transition-colors pointer-events-none" />
              <input
                type="text"
                readOnly
                placeholder="Rechercher partout..."
                value={searchQuery}
                className="w-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 group-hover:border-indigo-400 dark:group-hover:border-zinc-700 rounded-lg pl-8 pr-12 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors cursor-pointer select-none"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-300/60 dark:border-zinc-700/60 pointer-events-none">
                ⌘K
              </kbd>
            </div>

            {/* Mobile Global Search Button (Opens Dedicated Fullscreen Search) */}
            <button
              onClick={() => onOpenGlobalSearch(searchQuery)}
              aria-label="Recherche globale"
              title="Rechercher dans toute l'application"
              className="sm:hidden min-w-[40px] min-h-[40px] p-2 flex items-center justify-center rounded-lg border bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors active:scale-95"
            >
              <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </button>

            {/* FULLSCREEN TOGGLE BUTTON */}
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

            {/* PWA INSTALL BUTTON */}
            {isInstallable && !isInstalled && onInstallApp && (
              <button
                onClick={onInstallApp}
                aria-label="Installer l'application"
                className="min-w-[40px] min-h-[40px] px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 active:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                title="Installer sur l'écran d'accueil"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden md:inline">Installer</span>
              </button>
            )}

            {/* Desktop Display Mode Toggle */}
            <button
              onClick={onToggleDisplayMode}
              aria-label={displayMode === 'cards' ? 'Passer en Mode Liste' : 'Passer en Mode Cartes'}
              className="hidden sm:flex min-w-[40px] min-h-[40px] px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors items-center justify-center gap-1.5 shrink-0 active:scale-95"
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

            {/* Desktop Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Activer mode clair' : 'Activer mode sombre'}
              className="hidden sm:flex min-w-[40px] min-h-[40px] px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors items-center justify-center gap-1.5 shrink-0 active:scale-95"
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

            {/* Desktop Import Button */}
            <button
              onClick={onOpenImportModal}
              title="Importer des données (CSV / JSON)"
              aria-label="Importer"
              className="hidden md:flex min-w-[40px] min-h-[40px] px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 items-center justify-center gap-1.5 shrink-0 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Importer</span>
            </button>

            {/* Desktop Export Button */}
            <button
              onClick={onOpenExportModal}
              title="Exporter & Sauvegarder"
              aria-label="Exporter"
              className="hidden sm:flex min-w-[40px] min-h-[40px] px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 items-center justify-center gap-1.5 shrink-0 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Exporter</span>
            </button>

            {/* Cloud User Profile / Auth Button */}
            {user ? (
              <button
                onClick={onOpenUserProfile}
                title={`Connecté avec : ${user.email} (${syncStatus === 'synced' ? '✓ Synchronisé' : syncStatus === 'syncing' ? 'Synchronisation...' : syncStatus === 'offline' ? 'Hors ligne' : 'Erreur'})`}
                aria-label="Mon compte"
                className="min-w-[40px] min-h-[40px] px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[95px] truncate text-left font-medium">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span 
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    syncStatus === 'synced' ? 'bg-emerald-500' : 
                    syncStatus === 'syncing' ? 'bg-indigo-500 animate-pulse' : 
                    syncStatus === 'offline' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                title="Se connecter pour synchroniser vos données sur tous vos appareils"
                aria-label="Se connecter"
                className="min-w-[40px] min-h-[40px] px-2.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connexion</span>
              </button>
            )}

            {/* Mobile / Compact « Plus » Options Menu */}
            <div className="sm:hidden">
              <ActionMenu
                title="Options Espace Num"
                subtitle="Gestion globale & Préférences"
                items={[
                  {
                    label: user ? `Mon compte (${user.email})` : 'Se connecter / Créer un compte',
                    icon: user ? <UserIcon className="w-4 h-4 text-indigo-500" /> : <LogIn className="w-4 h-4 text-indigo-500" />,
                    onClick: user ? onOpenUserProfile : onOpenAuthModal,
                    variant: 'primary'
                  },
                  {
                    label: 'Importer des fichiers (CSV / JSON)',
                    icon: <Upload className="w-4 h-4 text-indigo-500" />,
                    onClick: onOpenImportModal
                  },
                  {
                    label: 'Exporter & Sauvegarder',
                    icon: <Download className="w-4 h-4 text-emerald-500" />,
                    onClick: onOpenExportModal
                  },
                  {
                    label: displayMode === 'cards' ? 'Passer en Mode Liste' : 'Passer en Modèle Cartes',
                    icon: displayMode === 'cards' ? <List className="w-4 h-4 text-zinc-500" /> : <LayoutGrid className="w-4 h-4 text-zinc-500" />,
                    onClick: onToggleDisplayMode
                  },
                  {
                    label: theme === 'dark' ? 'Activer le Thème Clair' : 'Activer le Thème Sombre',
                    icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-400" />,
                    onClick: onToggleTheme
                  }
                ]}
              />
            </div>

            {/* Quick Add Button */}
            <button
              onClick={onQuickNewItem}
              aria-label="Ajouter un élément"
              className="min-w-[40px] min-h-[40px] px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          </div>

        </div>
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
