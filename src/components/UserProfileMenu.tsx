import React, { useState } from 'react';
import { User, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { SyncStatus } from '../services/cloudSync';
import { 
  LogOut, 
  User as UserIcon, 
  Mail, 
  CheckCircle2, 
  RefreshCw, 
  WifiOff, 
  KeyRound, 
  Download, 
  X, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  syncStatus: SyncStatus;
  onManualSync: () => void;
  onExportBackup: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  isOpen,
  onClose,
  user,
  syncStatus,
  onManualSync,
  onExportBackup,
  onNotify
}) => {
  const [isResettingPass, setIsResettingPass] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onNotify('Déconnexion réussie. À bientôt !', 'info');
      onClose();
    } catch (e) {
      console.error(e);
      onNotify('Erreur lors de la déconnexion', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!user.email) return;
    try {
      setIsResettingPass(true);
      await sendPasswordResetEmail(auth, user.email);
      onNotify(`Lien de réinitialisation envoyé à ${user.email}`, 'success');
    } catch (e) {
      console.error(e);
      onNotify('Erreur lors de l’envoi de l’e-mail de réinitialisation', 'error');
    } finally {
      setIsResettingPass(false);
    }
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
  const initial = (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col transition-colors mt-12 sm:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Avatar & Details */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 relative">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-3.5 top-3.5 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 pr-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {displayName}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">État du cloud :</span>
            
            {syncStatus === 'synced' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>✓ Synchronisé</span>
              </span>
            )}

            {syncStatus === 'syncing' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                <span>Synchronisation...</span>
              </span>
            )}

            {syncStatus === 'offline' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span>Hors ligne</span>
              </span>
            )}

            {syncStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25">
                <span>Erreur sync</span>
              </span>
            )}
          </div>
        </div>

        {/* Menu Actions */}
        <div className="p-3 space-y-1">
          {/* Manual Refresh / Sync */}
          <button
            onClick={() => {
              onManualSync();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-between text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-indigo-500" />
              <span>Actualiser la synchronisation</span>
            </div>
          </button>

          {/* Export Backup */}
          <button
            onClick={() => {
              onExportBackup();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-between text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Sauvegarder mes données (JSON)</span>
            </div>
          </button>

          {/* Reset / Change Password */}
          <button
            onClick={handleResetPassword}
            disabled={isResettingPass}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-between text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Modifier le mot de passe</span>
            </div>
            {isResettingPass && <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />}
          </button>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
          <button
            onClick={handleSignOut}
            className="w-full min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 border border-red-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter de ce compte</span>
          </button>
        </div>
      </div>
    </div>
  );
};
