import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  Monitor, 
  Sparkles, 
  WifiOff, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  onInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isIOS,
  isAndroid,
  onInstall
}) => {
  // Select initial tab based on device detection
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'desktop';
  });
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await onInstall();
      if (installed) {
        onClose();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Branding */}
        <div className="relative p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-4 top-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0 overflow-hidden">
              <img 
                src="/pwa-192x192.png" 
                alt="Espace Num" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Espace Numérique
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  PWA Mobile
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Installer l'application sur votre écran d'accueil
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Direct 1-Click Install Button (When browser provides beforeinstallprompt) */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Installation rapide disponible pour votre navigateur</span>
              </div>
              <button
                onClick={handleDirectInstall}
                disabled={isInstalling}
                className="w-full min-h-[46px] rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? 'Installation en cours...' : 'Installer en 1 clic'}</span>
              </button>
            </div>
          )}

          {/* Platform Guide Tabs */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              <span>Guide par appareil :</span>
              {isAndroid && <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Android détecté</span>}
              {isIOS && <span className="text-[11px] text-indigo-600 dark:text-indigo-400">iOS Safari détecté</span>}
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-medium">
              <button
                onClick={() => setActiveTab('android')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>🤖 Android</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>🍏 iPhone</span>
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>💻 PC / Mac</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Android Instructions */}
          {activeTab === 'android' && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Installation sur Android (Chrome, Brave, Samsung Internet)</span>
              </h4>
              <ol className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2.5 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Ouvrez le menu du navigateur en appuyant sur les <strong>trois points verticaux (⋮)</strong> en haut à droite.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Appuyez sur <strong>« Installer l'application »</strong> (ou <strong>« Ajouter à l'écran d'accueil »</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    Confirmez : l'icône de l'application apparaît instantanément sur votre écran d'accueil avec plein écran et accès hors ligne !
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* Tab 2: iOS Instructions */}
          {activeTab === 'ios' && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Share className="w-4 h-4 text-indigo-500" />
                <span>Installation sur iPhone / iPad (Safari)</span>
              </h4>
              <ol className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2.5 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Dans Safari, appuyez sur le bouton <strong>Partager</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-indigo-500" /> (icône carré avec flèche vers le haut).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Faites défiler le menu vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    Validez en appuyant sur <strong>« Ajouter »</strong> en haut à droite.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* Tab 3: Desktop Instructions */}
          {activeTab === 'desktop' && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-indigo-500" />
                <span>Installation sur Ordinateur (Chrome, Edge, Brave)</span>
              </h4>
              <ol className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2.5 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Repérez l'icône d'installation <strong>⊕</strong> ou <strong>Installer</strong> dans la barre d'adresse de votre navigateur (à droite de l'URL).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Cliquez sur <strong>« Installer »</strong> dans la boîte de dialogue de confirmation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    L'application s'ouvre dans sa propre fenêtre indépendante, sans barre de navigation ni onglets parasites !
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* PWA Key Advantages */}
          <div className="pt-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block mb-2">
              Avantages de la version PWA
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800 flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white font-semibold">100% Hors ligne</strong>
                  <span className="text-[11px] text-zinc-500">Carnet & projets accessibles sans connexion</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white font-semibold">Zéro latence</strong>
                  <span className="text-[11px] text-zinc-500">Lancement immédiat depuis l'écran d'accueil</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white font-semibold">Plein écran immersif</strong>
                  <span className="text-[11px] text-zinc-500">Sans barre d'adresse ni encombrement</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white font-semibold">Synchronisation</strong>
                  <span className="text-[11px] text-zinc-500">Mise à jour automatique dès reconnexion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between gap-2">
          <p className="text-[11px] text-zinc-500">
            Installation 100% locale et sécurisée
          </p>
          <button
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
