import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div 
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-xl shadow-amber-950/20 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-amber-400/30"
    >
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Mode hors ligne actif · Données locales disponibles</span>
    </div>
  );
};
