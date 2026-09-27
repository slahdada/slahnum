import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getFriendlyAuthErrorMessage } from '../services/cloudSync';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Mail, 
  Lock, 
  User, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const projectId = (firebaseConfig as { projectId?: string }).projectId || 'gen-lang-client-0434791601';
  const firebaseConsoleAuthUrl = `https://console.firebase.google.com/project/${projectId}/authentication/providers`;

  const resetForm = () => {
    setErrorMsg('');
    setLastErrorCode(null);
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSwitchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    resetForm();
    setMode(newMode);
  };

  // Google 1-Click Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setErrorMsg('');
      setLastErrorCode(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      onNotify('Connexion Google réussie · Synchronisation activée', 'success');
      onClose();
    } catch (err: any) {
      console.error('Erreur Google Sign-in:', err);
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        const code = err?.code || '';
        setLastErrorCode(code);
        setErrorMsg(getFriendlyAuthErrorMessage(code));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Submit Handler for Email & Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLastErrorCode(null);
    setSuccessMsg('');

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMsg('Veuillez renseigner votre adresse e-mail.');
      return;
    }

    // 1. FORGOT PASSWORD
    if (mode === 'forgot') {
      try {
        setLoading(true);
        await sendPasswordResetEmail(auth, cleanEmail);
        setSuccessMsg(`Un lien de réinitialisation sécurisé a été envoyé à ${cleanEmail}. Vérifiez vos e-mails.`);
        onNotify('E-mail de réinitialisation envoyé', 'info');
      } catch (err: any) {
        const code = err?.code || '';
        setLastErrorCode(code);
        setErrorMsg(getFriendlyAuthErrorMessage(code));
        if (code === 'auth/operation-not-allowed') {
          setShowGuide(true);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMsg('Veuillez renseigner votre mot de passe.');
      return;
    }

    // 2. SIGN UP
    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Les deux mots de passe ne correspondent pas.');
        return;
      }

      try {
        setLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        
        // Optionally update display name
        if (displayName.trim()) {
          await updateProfile(userCredential.user, {
            displayName: displayName.trim()
          });
        }

        // Try sending verification email (silently ignore if restricted)
        try {
          await sendEmailVerification(userCredential.user);
        } catch (ve) {
          console.warn('Vérification e-mail non envoyée:', ve);
        }

        onNotify(`Bienvenue sur Espace Num, ${displayName.trim() || cleanEmail} !`, 'success');
        onClose();
      } catch (err: any) {
        const code = err?.code || '';
        setLastErrorCode(code);
        setErrorMsg(getFriendlyAuthErrorMessage(code));
        if (code === 'auth/operation-not-allowed') {
          setShowGuide(true);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. LOGIN
    if (mode === 'login') {
      try {
        setLoading(true);
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        onNotify('Connexion réussie · Données synchronisées', 'success');
        onClose();
      } catch (err: any) {
        const code = err?.code || '';
        setLastErrorCode(code);
        setErrorMsg(getFriendlyAuthErrorMessage(code));
        if (code === 'auth/operation-not-allowed') {
          setShowGuide(true);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const isOperationNotAllowed = lastErrorCode === 'auth/operation-not-allowed';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col transition-colors max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-start justify-between relative bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 dark:bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                {mode === 'login' && 'Connexion Espace Num'}
                {mode === 'signup' && 'Créer un Compte Cloud'}
                {mode === 'forgot' && 'Mot de passe oublié'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {mode === 'login' && 'Retrouvez vos données sur tous vos appareils'}
                {mode === 'signup' && 'Synchronisation temps réel et sauvegarde'}
                {mode === 'forgot' && 'Recevez un lien de réinitialisation sécurisé'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="min-w-[36px] min-h-[36px] p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">

          {/* Quick Google 1-Click Login Option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            {googleLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Connexion avec Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continuer avec Google</span>
                <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-1 hidden xs:inline">
                  Actif
                </span>
              </>
            )}
          </button>

          {/* Separator */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider shrink-0">
              Ou par e-mail
            </span>
          </div>
          
          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Step-by-Step Activation Helper Box for auth/operation-not-allowed */}
          {(isOperationNotAllowed || showGuide) && (
            <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Activation requise dans la console Firebase (30 sec)</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Par sécurité, Firebase désactive les fournisseurs d'authentification par défaut. Pour autoriser la connexion par e-mail/mot de passe :
              </p>
              
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-zinc-700 dark:text-zinc-200 font-medium pl-1">
                <li>
                  <span>Ouvrez l'onglet des fournisseurs Firebase :</span>
                  <a 
                    href={firebaseConsoleAuthUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-1 text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-500"
                  >
                    <span>Console Firebase</span>
                    <ArrowUpRight className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>Cliquez sur la ligne <strong>« E-mail/Mot de passe »</strong> (Email/Password).</li>
                <li>Activez le premier bouton <strong>« Activer »</strong> puis cliquez sur <strong>« Enregistrer »</strong>.</li>
              </ol>

              <div className="pt-1 flex items-center justify-between gap-2 border-t border-amber-500/20">
                <a
                  href={firebaseConsoleAuthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] transition-colors shadow-xs"
                >
                  <span>Ouvrir la Console Firebase</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Masquer
                </button>
              </div>
            </div>
          )}

          {/* Success Message Box */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Mode SIGNUP: Display Name */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nom ou prénom (facultatif)</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex : Alexandre"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Adresse e-mail</span>
              </label>
              <input
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Password Input (for Login & Signup) */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Mot de passe</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Password Confirmation (for Signup) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Confirmer le mot de passe</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            {/* Mode LOGIN: Rester connecté */}
            {mode === 'login' && (
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-300 text-indigo-600 focus:ring-0"
                />
                <span>Rester connecté sur cet appareil</span>
              </label>
            )}

            {/* Main Action Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full min-h-[46px] rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'signup' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Créer mon compte</span>
                </>
              ) : (
                <>
                  <span>Envoyer le lien de réinitialisation</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Help toggle */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Comment activer la connexion e-mail dans Firebase ?</span>
              {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Modal Footer / Switch Mode */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/40 text-center text-xs text-zinc-600 dark:text-zinc-400">
          {mode === 'login' && (
            <p>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1 cursor-pointer"
              >
                Créer un compte gratuitement
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Vous possédez déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1 cursor-pointer"
              >
                Se connecter
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                ← Retour à la page de connexion
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
