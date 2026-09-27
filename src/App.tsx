/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AppData, 
  Task, 
  Project, 
  ResourceLink, 
  QuickNote, 
  Priority, 
  ProjectStatus, 
  DisplayMode, 
  ThemeMode,
  ToastNotification
} from './types';
import { loadStoredData, saveStoredData, initialData } from './utils/storage';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TasksSection } from './components/TasksSection';
import { ProjectsSection } from './components/ProjectsSection';
import { LinksSection } from './components/LinksSection';
import { NotesSection } from './components/NotesSection';
import { ExportModal } from './components/ExportModal';
import { SafeImportModal } from './components/SafeImportModal';
import { QuickAddModal } from './components/QuickAddModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer } from './components/ToastContainer';
import { useFullscreen } from './hooks/useFullscreen';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadStoredData());
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'projects' | 'links' | 'notes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetCategory, setImportTargetCategory] = useState<'all' | 'tasks' | 'projects' | 'links' | 'notes'>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Fullscreen hook
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // PWA Install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('espace_numerique_theme');
      return (stored === 'light' || stored === 'dark') ? stored : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Display mode state: 'cards' | 'list'
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    try {
      const stored = localStorage.getItem('espace_numerique_display_mode');
      return (stored === 'list' || stored === 'cards') ? stored : 'cards';
    } catch {
      return 'cards';
    }
  });

  // Notifications handler
  const handleNotify = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Open import modal with specific category focus
  const handleOpenImport = (category: 'all' | 'tasks' | 'projects' | 'links' | 'notes' = 'all') => {
    setImportTargetCategory(category);
    setIsImportModalOpen(true);
  };

  // Apply imported data safely
  const handleApplyImport = (updatedData: AppData) => {
    setData(updatedData);
  };

  // Apply theme to document element
  useEffect(() => {
    try {
      localStorage.setItem('espace_numerique_theme', theme);
    } catch (e) {
      console.error(e);
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  // Persist display mode
  useEffect(() => {
    try {
      localStorage.setItem('espace_numerique_display_mode', displayMode);
    } catch (e) {
      console.error(e);
    }
  }, [displayMode]);

  // Sync state to localStorage on every change
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleToggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'cards' ? 'list' : 'cards');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // Tasks actions
  const handleAddTask = (title: string, priority: Priority, isToday: boolean, projectId?: string) => {
    const newTask: Task = {
      id: 'task-' + Date.now(),
      title,
      completed: false,
      priority,
      isToday,
      projectId,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
  };

  const handleToggleTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== id) return t;
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? (t.completedAt || new Date().toISOString()) : undefined
        };
      })
    }));
  };

  const handleDeleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const handleClearCompletedTasks = () => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => !t.completed)
    }));
  };

  // Projects actions
  const handleAddProject = (newProj: Omit<Project, 'id'>) => {
    const proj: Project = {
      ...newProj,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      projects: [proj, ...prev.projects]
    }));
  };

  const handleUpdateProject = (updatedProj: Project) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === updatedProj.id ? updatedProj : p)
    }));
  };

  const handleUpdateProjectProgress = (id: string, progress: number) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== id) return p;
        const clamped = Math.max(0, Math.min(100, progress));
        const status: ProjectStatus = clamped === 100 ? 'termine' : (p.status === 'termine' ? 'en_cours' : p.status);
        return { ...p, progress: clamped, status };
      })
    }));
  };

  const handleUpdateProjectStatus = (id: string, status: ProjectStatus) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== id) return p;
        const progress = status === 'termine' ? 100 : (p.progress === 100 ? 50 : p.progress);
        return { ...p, status, progress };
      })
    }));
  };

  const handleDeleteProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      tasks: prev.tasks.map(t => t.projectId === id ? { ...t, projectId: undefined } : t)
    }));
  };

  // Links actions
  const handleAddLink = (newLink: Omit<ResourceLink, 'id' | 'clicks'>) => {
    const link: ResourceLink = {
      ...newLink,
      id: 'link-' + Date.now(),
      clicks: 0,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      links: [link, ...prev.links]
    }));
  };

  const handleUpdateLink = (updatedLink: ResourceLink) => {
    setData(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === updatedLink.id ? updatedLink : l)
    }));
  };

  const handleToggleFavoriteLink = (id: string) => {
    setData(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === id ? { ...l, isFavorite: !l.isFavorite } : l)
    }));
  };

  const handleIncrementLinkClicks = (id: string) => {
    setData(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === id ? { ...l, clicks: (l.clicks || 0) + 1 } : l)
    }));
  };

  const handleDeleteLink = (id: string) => {
    setData(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== id)
    }));
  };

  // Notes actions
  const handleAddNote = (newNote: Omit<QuickNote, 'id' | 'updatedAt'>) => {
    const now = new Date();
    const timeStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const note: QuickNote = {
      ...newNote,
      id: 'note-' + Date.now(),
      updatedAt: timeStr
    };
    setData(prev => ({
      ...prev,
      notes: [note, ...prev.notes]
    }));
  };

  const handleUpdateNote = (id: string, updates: Partial<QuickNote>) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === id ? { ...n, ...updates } : n)
    }));
  };

  const handleDeleteNote = (id: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id)
    }));
  };

  const handleTogglePinNote = (id: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n)
    }));
  };

  // Reset Data
  const handleResetData = () => {
    setData(initialData);
  };

  const pendingTasksCount = data.tasks.filter(t => !t.completed).length;
  const activeProjectsCount = data.projects.filter(p => p.status === 'en_cours').length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200 overflow-x-hidden">
      
      {/* Top Bar with Fullscreen, PWA Controls, and Global Import/Export */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        displayMode={displayMode}
        onToggleDisplayMode={handleToggleDisplayMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenImportModal={() => handleOpenImport('all')}
        onQuickNewItem={() => setIsQuickAddOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isInstallable={isInstallable || isIOS}
        onInstallApp={handleInstallClick}
        isInstalled={isInstalled}
      />

      {/* Main Container - Optimized for mobile width with adequate bottom spacing for Thumb Nav */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-4 sm:space-y-6 pb-28 sm:pb-10">
        
        {/* Summary Metric Cards */}
        <DashboardStats
          data={data}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* View Switcher Content */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Primary Column (7 cols): Tasks & Projects */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <TasksSection
                tasks={data.tasks}
                projects={data.projects}
                searchQuery={searchQuery}
                displayMode={displayMode}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onClearCompleted={handleClearCompletedTasks}
                onImportTasksRequest={() => handleOpenImport('tasks')}
                onNotify={handleNotify}
              />

              <ProjectsSection
                projects={data.projects}
                searchQuery={searchQuery}
                displayMode={displayMode}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onUpdateProjectProgress={handleUpdateProjectProgress}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onDeleteProject={handleDeleteProject}
                onImportProjectsRequest={() => handleOpenImport('projects')}
                onNotify={handleNotify}
              />
            </div>

            {/* Secondary Column (5 cols): Links & Notes */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              <LinksSection
                links={data.links}
                searchQuery={searchQuery}
                displayMode={displayMode}
                onAddLink={handleAddLink}
                onUpdateLink={handleUpdateLink}
                onToggleFavorite={handleToggleFavoriteLink}
                onIncrementClicks={handleIncrementLinkClicks}
                onDeleteLink={handleDeleteLink}
                onImportLinksRequest={() => handleOpenImport('links')}
                onNotify={handleNotify}
              />

              <NotesSection
                notes={data.notes}
                searchQuery={searchQuery}
                displayMode={displayMode}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePinNote}
                onImportNotesRequest={() => handleOpenImport('notes')}
                onNotify={handleNotify}
              />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="w-full">
            <TasksSection
              tasks={data.tasks}
              projects={data.projects}
              searchQuery={searchQuery}
              displayMode={displayMode}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompletedTasks}
              onImportTasksRequest={() => handleOpenImport('tasks')}
              onNotify={handleNotify}
            />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="w-full">
            <ProjectsSection
              projects={data.projects}
              searchQuery={searchQuery}
              displayMode={displayMode}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onUpdateProjectProgress={handleUpdateProjectProgress}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              onDeleteProject={handleDeleteProject}
              onImportProjectsRequest={() => handleOpenImport('projects')}
              onNotify={handleNotify}
            />
          </div>
        )}

        {activeTab === 'links' && (
          <div className="w-full">
            <LinksSection
              links={data.links}
              searchQuery={searchQuery}
              displayMode={displayMode}
              onAddLink={handleAddLink}
              onUpdateLink={handleUpdateLink}
              onToggleFavorite={handleToggleFavoriteLink}
              onIncrementClicks={handleIncrementLinkClicks}
              onDeleteLink={handleDeleteLink}
              onImportLinksRequest={() => handleOpenImport('links')}
              onNotify={handleNotify}
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="w-full">
            <NotesSection
              notes={data.notes}
              searchQuery={searchQuery}
              displayMode={displayMode}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePinNote}
              onImportNotesRequest={() => handleOpenImport('notes')}
              onNotify={handleNotify}
            />
          </div>
        )}
      </main>

      {/* Subtle Desktop/Tablet Footer */}
      <footer className="hidden sm:block border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-4 text-center text-xs text-zinc-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Espace Numérique Quotidien · Données sauvegardées en local sur cet appareil</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sauvegarder & Exporter
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => handleOpenImport('all')}
              className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Importer un fichier
            </button>
            <span aria-hidden="true">·</span>
            <span>Mobile-First PWA</span>
          </div>
        </div>
      </footer>

      {/* Thumb-friendly Fixed Bottom Navigation Bar for Smartphone */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingTasksCount={pendingTasksCount}
        activeProjectsCount={activeProjectsCount}
        onQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Export / Backup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        onImportData={handleApplyImport}
        onResetData={handleResetData}
        onOpenImportModal={() => handleOpenImport('all')}
        onNotify={handleNotify}
      />

      {/* Safe Import Modal with Preview and Conflict Resolution */}
      <SafeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentData={data}
        targetCategory={importTargetCategory}
        onApplyImport={handleApplyImport}
        onNotify={handleNotify}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={(title, priority, isToday) => handleAddTask(title, priority, isToday)}
        onAddProject={handleAddProject}
        onAddLink={handleAddLink}
        onAddNote={handleAddNote}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

      {/* iOS Installation Guide Popup */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold">📲</span>
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Installer sur votre écran d'accueil</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed text-left bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              1. Appuyez sur le bouton <strong>Partager</strong> dans Safari (icône carré avec flèche vers le haut).<br />
              2. Faites défiler et appuyez sur <strong>Sur l'écran d'accueil</strong>.<br />
              3. Validez en appuyant sur <strong>Ajouter</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[44px] rounded-xl bg-indigo-600 active:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
