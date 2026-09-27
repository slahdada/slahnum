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
  ThemeMode 
} from './types';
import { loadStoredData, saveStoredData, initialData } from './utils/storage';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TasksSection } from './components/TasksSection';
import { ProjectsSection } from './components/ProjectsSection';
import { LinksSection } from './components/LinksSection';
import { NotesSection } from './components/NotesSection';
import { ExportModal } from './components/ExportModal';
import { QuickAddModal } from './components/QuickAddModal';
import { TaskActivityChart } from './components/TaskActivityChart';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadStoredData());
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'projects' | 'links' | 'notes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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
      id: 'proj-' + Date.now()
    };
    setData(prev => ({
      ...prev,
      projects: [proj, ...prev.projects]
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
      clicks: 0
    };
    setData(prev => ({
      ...prev,
      links: [link, ...prev.links]
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

  // Import & Reset
  const handleImportData = (imported: AppData) => {
    setData(imported);
  };

  const handleResetData = () => {
    setData(initialData);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200">
      {/* Top Bar */}
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
        onQuickNewItem={() => setIsQuickAddOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Summary Metric Cards */}
        <DashboardStats
          data={data}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Recharts Task Activity Visualization (7 derniers jours) */}
        {(activeTab === 'all' || activeTab === 'tasks') && (
          <TaskActivityChart tasks={data.tasks} theme={theme} />
        )}

        {/* View Switcher Content */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Column (7 cols): Tasks & Projects */}
            <div className="lg:col-span-7 space-y-6">
              <TasksSection
                tasks={data.tasks}
                projects={data.projects}
                searchQuery={searchQuery}
                displayMode={displayMode}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onClearCompleted={handleClearCompletedTasks}
              />

              <ProjectsSection
                projects={data.projects}
                searchQuery={searchQuery}
                displayMode={displayMode}
                onAddProject={handleAddProject}
                onUpdateProjectProgress={handleUpdateProjectProgress}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onDeleteProject={handleDeleteProject}
              />
            </div>

            {/* Secondary Column (5 cols): Links & Notes */}
            <div className="lg:col-span-5 space-y-6">
              <LinksSection
                links={data.links}
                searchQuery={searchQuery}
                displayMode={displayMode}
                onAddLink={handleAddLink}
                onToggleFavorite={handleToggleFavoriteLink}
                onIncrementClicks={handleIncrementLinkClicks}
                onDeleteLink={handleDeleteLink}
              />

              <NotesSection
                notes={data.notes}
                searchQuery={searchQuery}
                displayMode={displayMode}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePinNote}
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
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompletedTasks}
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
              onUpdateProjectProgress={handleUpdateProjectProgress}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              onDeleteProject={handleDeleteProject}
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
              onToggleFavorite={handleToggleFavoriteLink}
              onIncrementClicks={handleIncrementLinkClicks}
              onDeleteLink={handleDeleteLink}
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
            />
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-4 text-center text-xs text-zinc-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Espace Numérique Quotidien · Données sauvegardées en temps réel sur cet appareil</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Télécharger index.html autonome
            </button>
            <span aria-hidden="true">·</span>
            <span>Local v1.2</span>
          </div>
        </div>
      </footer>

      {/* Export / Backup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        onImportData={handleImportData}
        onResetData={handleResetData}
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
    </div>
  );
}
