import React from 'react';
import { 
  Layers, 
  CheckSquare, 
  Briefcase, 
  Bookmark, 
  StickyNote,
  Plus
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'all' | 'tasks' | 'projects' | 'links' | 'notes';
  setActiveTab: (tab: 'all' | 'tasks' | 'projects' | 'links' | 'notes') => void;
  pendingTasksCount: number;
  activeProjectsCount: number;
  onQuickAdd: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingTasksCount,
  activeProjectsCount,
  onQuickAdd
}) => {
  const navItems = [
    {
      id: 'all' as const,
      label: 'Aperçu',
      icon: Layers,
      badge: null
    },
    {
      id: 'tasks' as const,
      label: 'Tâches',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null
    },
    {
      id: 'projects' as const,
      label: 'Projets',
      icon: Briefcase,
      badge: activeProjectsCount > 0 ? activeProjectsCount : null
    },
    {
      id: 'links' as const,
      label: 'Liens',
      icon: Bookmark,
      badge: null
    },
    {
      id: 'notes' as const,
      label: 'Notes',
      icon: StickyNote,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Floating Action Button (FAB) for thumb quick-add */}
      <div className="sm:hidden fixed right-4 bottom-20 z-40 pb-[env(safe-area-inset-bottom,0px)]">
        <button
          onClick={onQuickAdd}
          aria-label="Ajout rapide"
          className="w-13 h-13 rounded-full bg-indigo-600 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform active:scale-90 border-2 border-white dark:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav 
        aria-label="Navigation principale mobile"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1 items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center h-full py-1 min-h-[48px] rounded-lg transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {/* Active Indicator Top Pip */}
                {isActive && (
                  <span className="absolute top-1 w-6 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-in fade-in duration-200" />
                )}

                <div className="relative mt-1">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {item.badge !== null && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border border-white dark:border-zinc-900 leading-none">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span className="text-[11px] tracking-tight mt-0.5 select-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
