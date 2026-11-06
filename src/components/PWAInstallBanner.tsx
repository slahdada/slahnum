import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

interface PWAInstallBannerProps {
  isInstalled: boolean;
  onOpenInstallModal: () => void;
  onDirectInstall?: () => Promise<boolean>;
  isInstallable: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstalled,
  onOpenInstallModal,
  onDirectInstall,
  isInstallable
}) => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (isInstalled) {
      setIsDismissed(true);
      return;
    }

    try {
      const dismissed = localStorage.getItem('espace_numerique_pwa_banner_dismissed');
      // If not dismissed or dismissed more than 3 days ago, show banner
      if (!dismissed) {
        setIsDismissed(false);
      } else {
        const dismissedAt = parseInt(dismissed, 10);
        if (Date.now() - dismissedAt > 3 * 24 * 60 * 60 * 1000) {
          setIsDismissed(false);
        }
      }
    } catch {
      setIsDismissed(false);
    }
  }, [isInstalled]);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('espace_numerique_pwa_banner_dismissed', Date.now().toString());
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClick = async () => {
    if (isInstallable && onDirectInstall) {
      const success = await onDirectInstall();
      if (success) {
        setIsDismissed(true);
        return;
      }
    }
    onOpenInstallModal();
  };

  return (
    <aside 
      aria-label="Proposition d'installation PWA"
      className="fixed bottom-20 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-auto sm:max-w-md z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-3.5 shadow-xl shadow-indigo-950/20 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
              Installer l'application mobile
            </h4>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            Plein écran · Hors ligne · Accès immédiat
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleClick}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
