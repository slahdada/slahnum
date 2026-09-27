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
import { loadStoredData, saveStoredData, initialData, exportDataAsJson } from './utils/storage';
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
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { EditTaskModal } from './components/EditTaskModal';
import { EditProjectModal } from './components/EditProjectModal';
import { EditLinkModal } from './components/EditLinkModal';
import { EditNoteModal } from './components/EditNoteModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileMenu } from './components/UserProfileMenu';
import { DataMigrationModal } from './components/DataMigrationModal';
import { downloadDataUrl } from './utils/fileHelpers';
import { useFullscreen } from './hooks/useFullscreen';
import { usePWAInstall } from './hooks/usePWAInstall';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { 
  SyncStatus, 
  subscribeToUserCloudData, 
  saveTaskToCloud, 
  deleteTaskFromCloud, 
  saveProjectToCloud, 
  deleteProjectFromCloud, 
  saveLinkToCloud, 
  deleteLinkFromCloud, 
  saveNoteToCloud, 
  deleteNoteFromCloud,
  uploadLocalDataToCloud,
  checkUserCloudDataExists
} from './services/cloudSync';

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

  // Intelligent Global Search State & Direct Inspect/Edit Modals
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [editingTaskDirect, setEditingTaskDirect] = useState<Task | null>(null);
  const [editingProjectDirect, setEditingProjectDirect] = useState<Project | null>(null);
  const [editingLinkDirect, setEditingLinkDirect] = useState<ResourceLink | null>(null);
  const [editingNoteDirect, setEditingNoteDirect] = useState<QuickNote | null>(null);

  // User Authentication & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check for local data migration if this user hasn't been prompted yet
        const localData = loadStoredData();
        const hasLocalData = 
          localData.tasks.length > 0 || 
          localData.projects.length > 0 || 
          localData.links.length > 0 || 
          localData.notes.length > 0;

        const migrationKey = `espace_num_migrated_${user.uid}`;
        const alreadyMigrated = localStorage.getItem(migrationKey);

        if (hasLocalData && !alreadyMigrated) {
          const hasCloudData = await checkUserCloudDataExists(user.uid);
          if (!hasCloudData) {
            setIsMigrationModalOpen(true);
          }
        }
      } else {
        // When logged out, reset to local storage
        setData(loadStoredData());
        setSyncStatus('synced');
      }
    });

    return () => unsubAuth();
  }, []);

  // Real-time Firestore sync when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    setSyncStatus('syncing');

    const unsubCloud = subscribeToUserCloudData(
      currentUser.uid,
      (cloudData) => {
        setData(prev => ({
          tasks: cloudData.tasks !== undefined ? cloudData.tasks : prev.tasks,
          projects: cloudData.projects !== undefined ? cloudData.projects : prev.projects,
          links: cloudData.links !== undefined ? cloudData.links : prev.links,
          notes: cloudData.notes !== undefined ? cloudData.notes : prev.notes,
        }));
      },
      (status) => {
        setSyncStatus(status);
      }
    );

    return () => unsubCloud();
  }, [currentUser]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      if (currentUser) {
        setSyncStatus('synced');
        handleNotify('Connexion rétablie · Données synchronisées', 'success');
      }
    };
    const handleOffline = () => {
      setSyncStatus('offline');
      handleNotify('Mode hors ligne actif · Données consultables et modifiables', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Global search keyboard shortcuts (Ctrl+K, Cmd+K, "/")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);

      if (isCtrlK || isSlash) {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    if (currentUser) {
      setSyncStatus('syncing');
      uploadLocalDataToCloud(currentUser.uid, updatedData)
        .then(() => {
          setSyncStatus('synced');
          handleNotify('Données importées et synchronisées dans le cloud', 'success');
        })
        .catch((err) => {
          console.error(err);
          handleNotify('Données importées localement (erreur sync cloud)', 'warning');
        });
    }
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
    if (currentUser) {
      saveTaskToCloud(currentUser.uid, newTask).catch(console.error);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
    if (currentUser) {
      saveTaskToCloud(currentUser.uid, updatedTask).catch(console.error);
    }
  };

  const handleToggleTask = (id: string) => {
    let toggled: Task | undefined;
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== id) return t;
        const nextCompleted = !t.completed;
        toggled = {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? (t.completedAt || new Date().toISOString()) : undefined
        };
        return toggled;
      })
    }));
    if (currentUser && toggled) {
      saveTaskToCloud(currentUser.uid, toggled).catch(console.error);
    }
  };

  const handleDeleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
    if (currentUser) {
      deleteTaskFromCloud(currentUser.uid, id).catch(console.error);
    }
  };

  const handleClearCompletedTasks = () => {
    const completedTasks = data.tasks.filter(t => t.completed);
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => !t.completed)
    }));
    if (currentUser) {
      completedTasks.forEach(t => {
        deleteTaskFromCloud(currentUser.uid, t.id).catch(console.error);
      });
    }
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
    if (currentUser) {
      saveProjectToCloud(currentUser.uid, proj).catch(console.error);
    }
  };

  const handleUpdateProject = (updatedProj: Project) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === updatedProj.id ? updatedProj : p)
    }));
    if (currentUser) {
      saveProjectToCloud(currentUser.uid, updatedProj).catch(console.error);
    }
  };

  const handleUpdateProjectProgress = (id: string, progress: number) => {
    let updatedProj: Project | undefined;
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== id) return p;
        const clamped = Math.max(0, Math.min(100, progress));
        const status: ProjectStatus = clamped === 100 ? 'termine' : (p.status === 'termine' ? 'en_cours' : p.status);
        updatedProj = { ...p, progress: clamped, status };
        return updatedProj;
      })
    }));
    if (currentUser && updatedProj) {
      saveProjectToCloud(currentUser.uid, updatedProj).catch(console.error);
    }
  };

  const handleUpdateProjectStatus = (id: string, status: ProjectStatus) => {
    let updatedProj: Project | undefined;
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== id) return p;
        const progress = status === 'termine' ? 100 : (p.progress === 100 ? 50 : p.progress);
        updatedProj = { ...p, status, progress };
        return updatedProj;
      })
    }));
    if (currentUser && updatedProj) {
      saveProjectToCloud(currentUser.uid, updatedProj).catch(console.error);
    }
  };

  const handleDeleteProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      tasks: prev.tasks.map(t => t.projectId === id ? { ...t, projectId: undefined } : t)
    }));
    if (currentUser) {
      deleteProjectFromCloud(currentUser.uid, id).catch(console.error);
    }
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
    if (currentUser) {
      saveLinkToCloud(currentUser.uid, link).catch(console.error);
    }
  };

  const handleUpdateLink = (updatedLink: ResourceLink) => {
    setData(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === updatedLink.id ? updatedLink : l)
    }));
    if (currentUser) {
      saveLinkToCloud(currentUser.uid, updatedLink).catch(console.error);
    }
  };

  const handleToggleFavoriteLink = (id: string) => {
    let updatedLink: ResourceLink | undefined;
    setData(prev => ({
      ...prev,
      links: prev.links.map(l => {
        if (l.id !== id) return l;
        updatedLink = { ...l, isFavorite: !l.isFavorite };
        return updatedLink;
      })
    }));
    if (currentUser && updatedLink) {
      saveLinkToCloud(currentUser.uid, updatedLink).catch(console.error);
    }
  };

  const handleIncrementLinkClicks = (id: string) => {
    let updatedLink: ResourceLink | undefined;
    setData(prev => ({
      ...prev,
      links: prev.links.map(l => {
        if (l.id !== id) return l;
        updatedLink = { ...l, clicks: (l.clicks || 0) + 1 };
        return updatedLink;
      })
    }));
    if (currentUser && updatedLink) {
      saveLinkToCloud(currentUser.uid, updatedLink).catch(console.error);
    }
  };

  const handleDeleteLink = (id: string) => {
    setData(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== id)
    }));
    if (currentUser) {
      deleteLinkFromCloud(currentUser.uid, id).catch(console.error);
    }
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
    if (currentUser) {
      saveNoteToCloud(currentUser.uid, note).catch(console.error);
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<QuickNote>) => {
    let updatedNote: QuickNote | undefined;
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => {
        if (n.id !== id) return n;
        updatedNote = { ...n, ...updates };
        return updatedNote;
      })
    }));
    if (currentUser && updatedNote) {
      saveNoteToCloud(currentUser.uid, updatedNote).catch(console.error);
    }
  };

  const handleDeleteNote = (id: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id)
    }));
    if (currentUser) {
      deleteNoteFromCloud(currentUser.uid, id).catch(console.error);
    }
  };

  const handleTogglePinNote = (id: string) => {
    let updatedNote: QuickNote | undefined;
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => {
        if (n.id !== id) return n;
        updatedNote = { ...n, isPinned: !n.isPinned };
        return updatedNote;
      })
    }));
    if (currentUser && updatedNote) {
      saveNoteToCloud(currentUser.uid, updatedNote).catch(console.error);
    }
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
        onOpenGlobalSearch={(initQ) => {
          if (initQ !== undefined) setSearchQuery(initQ);
          setIsGlobalSearchOpen(true);
        }}
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
        user={currentUser}
        syncStatus={syncStatus}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
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

      {/* Intelligent Global Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        data={data}
        initialQuery={searchQuery}
        onSelectTask={(task) => {
          setActiveTab('tasks');
          setEditingTaskDirect(task);
        }}
        onSelectProject={(project) => {
          setActiveTab('projects');
          setEditingProjectDirect(project);
        }}
        onSelectLink={(link) => {
          setActiveTab('links');
          setEditingLinkDirect(link);
        }}
        onSelectNote={(note) => {
          setActiveTab('notes');
          setEditingNoteDirect(note);
        }}
        onSelectDocument={(doc, parent) => {
          downloadDataUrl(doc.dataUrl, doc.name);
          handleNotify(`Téléchargement lancé : ${doc.name}`, 'success');
        }}
        onNotify={handleNotify}
      />

      {/* Direct Edit Task Modal triggered from Global Search */}
      <EditTaskModal
        isOpen={Boolean(editingTaskDirect)}
        onClose={() => setEditingTaskDirect(null)}
        task={editingTaskDirect}
        projects={data.projects}
        onSaveTask={(updated) => {
          handleUpdateTask(updated);
          setEditingTaskDirect(null);
          handleNotify('Tâche modifiée avec succès', 'success');
        }}
        onDeleteTask={(id) => {
          handleDeleteTask(id);
          setEditingTaskDirect(null);
          handleNotify('Tâche supprimée', 'info');
        }}
        onDuplicateTask={(t) => {
          handleAddTask(t.title + ' (Copie)', t.priority, t.isToday, t.projectId);
          setEditingTaskDirect(null);
          handleNotify('Tâche dupliquée', 'success');
        }}
        onNotify={handleNotify}
      />

      {/* Direct Edit Project Modal triggered from Global Search */}
      <EditProjectModal
        isOpen={Boolean(editingProjectDirect)}
        onClose={() => setEditingProjectDirect(null)}
        project={editingProjectDirect}
        onSaveProject={(updated) => {
          handleUpdateProject(updated);
          setEditingProjectDirect(null);
          handleNotify('Projet mis à jour avec succès', 'success');
        }}
        onDeleteProject={(id) => {
          handleDeleteProject(id);
          setEditingProjectDirect(null);
          handleNotify('Projet supprimé', 'info');
        }}
        onDuplicateProject={(p) => {
          handleAddProject({
            title: p.title + ' (Copie)',
            description: p.description,
            category: p.category,
            status: p.status,
            progress: p.progress,
            dueDate: p.dueDate,
            tags: [...p.tags],
            notes: p.notes,
            documents: p.documents ? [...p.documents] : []
          });
          setEditingProjectDirect(null);
          handleNotify('Projet dupliqué', 'success');
        }}
        onNotify={handleNotify}
      />

      {/* Direct Edit Link Modal triggered from Global Search */}
      <EditLinkModal
        isOpen={Boolean(editingLinkDirect)}
        onClose={() => setEditingLinkDirect(null)}
        link={editingLinkDirect}
        onSaveLink={(updated) => {
          handleUpdateLink(updated);
          setEditingLinkDirect(null);
          handleNotify('Lien mis à jour avec succès', 'success');
        }}
        onDeleteLink={(id) => {
          handleDeleteLink(id);
          setEditingLinkDirect(null);
          handleNotify('Lien supprimé', 'info');
        }}
        onDuplicateLink={(l) => {
          handleAddLink({
            title: l.title + ' (Copie)',
            url: l.url,
            category: l.category,
            description: l.description,
            isFavorite: l.isFavorite,
            tags: l.tags ? [...l.tags] : [],
            documents: l.documents ? [...l.documents] : []
          });
          setEditingLinkDirect(null);
          handleNotify('Lien dupliqué', 'success');
        }}
        onNotify={handleNotify}
      />

      {/* Direct Edit Note Modal triggered from Global Search */}
      <EditNoteModal
        isOpen={Boolean(editingNoteDirect)}
        onClose={() => setEditingNoteDirect(null)}
        note={editingNoteDirect}
        onSaveNote={(updated) => {
          handleUpdateNote(updated.id, updated);
          setEditingNoteDirect(null);
          handleNotify('Note mise à jour avec succès', 'success');
        }}
        onDeleteNote={(id) => {
          handleDeleteNote(id);
          setEditingNoteDirect(null);
          handleNotify('Note supprimée', 'info');
        }}
        onDuplicateNote={(n) => {
          handleAddNote({
            title: n.title + ' (Copie)',
            content: n.content,
            isPinned: n.isPinned,
            color: n.color,
            tags: n.tags ? [...n.tags] : [],
            documents: n.documents ? [...n.documents] : []
          });
          setEditingNoteDirect(null);
          handleNotify('Note dupliquée', 'success');
        }}
        onNotify={handleNotify}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onNotify={handleNotify}
      />

      {/* User Profile & Cloud Sync Status Modal */}
      {currentUser && (
        <UserProfileMenu
          isOpen={isUserProfileOpen}
          onClose={() => setIsUserProfileOpen(false)}
          user={currentUser}
          syncStatus={syncStatus}
          onManualSync={() => {
            setSyncStatus('syncing');
            setTimeout(() => {
              setSyncStatus(navigator.onLine ? 'synced' : 'offline');
              handleNotify('Synchronisation actualisée', 'success');
            }, 500);
          }}
          onExportBackup={() => {
            exportDataAsJson(data);
            handleNotify('Sauvegarde JSON générée et téléchargée', 'success');
          }}
          onNotify={handleNotify}
        />
      )}

      {/* Data Migration Prompt Modal */}
      {currentUser && (
        <DataMigrationModal
          isOpen={isMigrationModalOpen}
          onClose={() => {
            setIsMigrationModalOpen(false);
            localStorage.setItem(`espace_num_migrated_${currentUser.uid}`, 'true');
          }}
          userId={currentUser.uid}
          localData={data}
          onMigrationComplete={() => {
            localStorage.setItem(`espace_num_migrated_${currentUser.uid}`, 'true');
            setIsMigrationModalOpen(false);
          }}
          onNotify={handleNotify}
        />
      )}

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
