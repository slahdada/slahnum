import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with durable local persistence across browser restarts & PWA
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('Erreur configuration persistance Auth:', err);
});

// Initialize Firestore with offline persistence enabled
let dbInstance;
try {
  // Use named database if specified in config
  const dbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, dbId || undefined);
} catch (e) {
  console.warn('Fallback standard getFirestore:', e);
  const dbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
  dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = dbInstance;
export default app;
