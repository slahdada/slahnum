import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, X } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'primary';
  badge?: string;
  disabled?: boolean;
}

interface ActionMenuProps {
  title?: string;
  subtitle?: string;
  items: ActionMenuItem[];
  align?: 'left' | 'right';
  triggerClassName?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  title = 'Options',
  subtitle,
  items,
  align = 'right',
  triggerClassName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAction = (item: ActionMenuItem) => {
    if (item.disabled) return;
    setIsOpen(false);
    item.onClick();
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Plus d'actions"
        title="Plus d'actions"
        className={triggerClassName || "min-w-[36px] min-h-[36px] p-2 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 rounded-lg transition-colors active:scale-95"}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Desktop Dropdown */}
      {isOpen && (
        <div
          className={`hidden sm:block absolute top-full mt-1 z-40 w-52 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {subtitle && (
            <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-medium text-zinc-400 truncate">
              {subtitle}
            </div>
          )}
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={item.disabled}
              onClick={() => handleAction(item)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors ${
                item.variant === 'danger'
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                  : item.variant === 'primary'
                  ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
              } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center gap-2.5">
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </span>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {isOpen && (
        <div 
          className="sm:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div 
            className="w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl p-4 shadow-2xl space-y-2 max-h-[80vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="min-w-0 flex-1 pr-2">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                  {title}
                </h4>
                {subtitle && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions List with large touch targets */}
            <div className="space-y-1 pt-1">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => handleAction(item)}
                  className={`w-full flex items-center justify-between min-h-[48px] px-3.5 py-2.5 rounded-xl text-sm font-medium text-left active:scale-98 transition-all ${
                    item.variant === 'danger'
                      ? 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 active:bg-red-100 dark:active:bg-red-900/40'
                      : item.variant === 'primary'
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 active:bg-indigo-100 dark:active:bg-indigo-900/40 font-semibold'
                      : 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:bg-zinc-200 dark:active:bg-zinc-800'
                  } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
