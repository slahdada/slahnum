import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { AppData, Task, Project, ResourceLink, QuickNote } from '../types';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

/**
 * Translates Firebase Auth and Firestore error codes into clear, friendly French messages.
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'L’adresse e-mail saisie n’est pas valide.';
    case 'auth/user-disabled':
      return 'Ce compte utilisateur a été désactivé.';
    case 'auth/user-not-found':
      return 'Aucun compte n’est associé à cette adresse e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou mot de passe incorrect.';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cette adresse e-mail.';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    case 'auth/network-request-failed':
      return 'Impossible de contacter le serveur. Vérifiez votre connexion Internet.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives infructueuses. Veuillez patienter un instant.';
    case 'auth/operation-not-allowed':
      return 'La méthode de connexion par E-mail/Mot de passe n’est pas encore activée dans la console Firebase. Suivez les étapes ci-dessous pour l’activer en 30 secondes.';
    default:
      return 'Une erreur est survenue lors de l’opération. Veuillez réessayer.';
  }
}

/**
 * Subscribes to all personal collections in real time for a logged-in user.
 * Returns an unsubscribe callback function.
 */
export function subscribeToUserCloudData(
  userId: string,
  onDataReceived: (cloudData: Partial<AppData>) => void,
  onStatusChange: (status: SyncStatus) => void
): () => void {
  onStatusChange('syncing');

  // References to user subcollections
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const projectsRef = collection(db, 'users', userId, 'projects');
  const linksRef = collection(db, 'users', userId, 'links');
  const notesRef = collection(db, 'users', userId, 'notes');

  let currentTasks: Task[] = [];
  let currentProjects: Project[] = [];
  let currentLinks: ResourceLink[] = [];
  let currentNotes: QuickNote[] = [];

  let loadedSections = 0;
  const markSectionLoaded = () => {
    loadedSections++;
    if (loadedSections >= 4) {
      onStatusChange(navigator.onLine ? 'synced' : 'offline');
    }
  };

  const unsubTasks = onSnapshot(
    query(tasksRef),
    (snapshot) => {
      currentTasks = snapshot.docs.map(d => d.data() as Task);
      onDataReceived({ tasks: currentTasks });
      markSectionLoaded();
    },
    (error) => {
      console.error('Erreur sync tâches:', error);
      onStatusChange(navigator.onLine ? 'error' : 'offline');
    }
  );

  const unsubProjects = onSnapshot(
    query(projectsRef),
    (snapshot) => {
      currentProjects = snapshot.docs.map(d => d.data() as Project);
      onDataReceived({ projects: currentProjects });
      markSectionLoaded();
    },
    (error) => {
      console.error('Erreur sync projets:', error);
      onStatusChange(navigator.onLine ? 'error' : 'offline');
    }
  );

  const unsubLinks = onSnapshot(
    query(linksRef),
    (snapshot) => {
      currentLinks = snapshot.docs.map(d => d.data() as ResourceLink);
      onDataReceived({ links: currentLinks });
      markSectionLoaded();
    },
    (error) => {
      console.error('Erreur sync liens:', error);
      onStatusChange(navigator.onLine ? 'error' : 'offline');
    }
  );

  const unsubNotes = onSnapshot(
    query(notesRef),
    (snapshot) => {
      currentNotes = snapshot.docs.map(d => d.data() as QuickNote);
      onDataReceived({ notes: currentNotes });
      markSectionLoaded();
    },
    (error) => {
      console.error('Erreur sync notes:', error);
      onStatusChange(navigator.onLine ? 'error' : 'offline');
    }
  );

  // Return combined unsubscribe
  return () => {
    unsubTasks();
    unsubProjects();
    unsubLinks();
    unsubNotes();
  };
}

/**
 * Saves/updates a single task in Firestore
 */
export async function saveTaskToCloud(userId: string, task: Task): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', task.id);
  await setDoc(taskRef, task, { merge: true });
}

/**
 * Deletes a single task from Firestore
 */
export async function deleteTaskFromCloud(userId: string, taskId: string): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskRef);
}

/**
 * Saves/updates a single project in Firestore
 */
export async function saveProjectToCloud(userId: string, project: Project): Promise<void> {
  const projRef = doc(db, 'users', userId, 'projects', project.id);
  await setDoc(projRef, project, { merge: true });
}

/**
 * Deletes a project from Firestore
 */
export async function deleteProjectFromCloud(userId: string, projectId: string): Promise<void> {
  const projRef = doc(db, 'users', userId, 'projects', projectId);
  await deleteDoc(projRef);
}

/**
 * Saves/updates a link in Firestore
 */
export async function saveLinkToCloud(userId: string, link: ResourceLink): Promise<void> {
  const linkRef = doc(db, 'users', userId, 'links', link.id);
  await setDoc(linkRef, link, { merge: true });
}

/**
 * Deletes a link from Firestore
 */
export async function deleteLinkFromCloud(userId: string, linkId: string): Promise<void> {
  const linkRef = doc(db, 'users', userId, 'links', linkId);
  await deleteDoc(linkRef);
}

/**
 * Saves/updates a note in Firestore
 */
export async function saveNoteToCloud(userId: string, note: QuickNote): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', note.id);
  await setDoc(noteRef, note, { merge: true });
}

/**
 * Deletes a note from Firestore
 */
export async function deleteNoteFromCloud(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await deleteDoc(noteRef);
}

/**
 * Checks if the user already has documents in the cloud
 */
export async function checkUserCloudDataExists(userId: string): Promise<boolean> {
  try {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const snap = await getDocs(query(tasksRef));
    return !snap.empty;
  } catch (e) {
    console.error('Erreur vérification données cloud:', e);
    return false;
  }
}

/**
 * Migrates local data into the cloud in safe atomic batches.
 * Preserves all files, dates, tags, and relations.
 */
export async function uploadLocalDataToCloud(
  userId: string, 
  localData: AppData,
  onProgress?: (percent: number) => void
): Promise<void> {
  const totalItems = 
    localData.tasks.length + 
    localData.projects.length + 
    localData.links.length + 
    localData.notes.length;

  if (totalItems === 0) return;

  let processed = 0;
  const updateProgress = () => {
    processed++;
    if (onProgress) {
      onProgress(Math.round((processed / totalItems) * 100));
    }
  };

  // Upload tasks in batches of up to 400 operations
  const tasks = localData.tasks;
  for (let i = 0; i < tasks.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = tasks.slice(i, i + 400);
    chunk.forEach(t => {
      const ref = doc(db, 'users', userId, 'tasks', t.id);
      batch.set(ref, t, { merge: true });
      updateProgress();
    });
    await batch.commit();
  }

  // Upload projects
  const projects = localData.projects;
  for (let i = 0; i < projects.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = projects.slice(i, i + 400);
    chunk.forEach(p => {
      const ref = doc(db, 'users', userId, 'projects', p.id);
      batch.set(ref, p, { merge: true });
      updateProgress();
    });
    await batch.commit();
  }

  // Upload links
  const links = localData.links;
  for (let i = 0; i < links.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = links.slice(i, i + 400);
    chunk.forEach(l => {
      const ref = doc(db, 'users', userId, 'links', l.id);
      batch.set(ref, l, { merge: true });
      updateProgress();
    });
    await batch.commit();
  }

  // Upload notes
  const notes = localData.notes;
  for (let i = 0; i < notes.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = notes.slice(i, i + 400);
    chunk.forEach(n => {
      const ref = doc(db, 'users', userId, 'notes', n.id);
      batch.set(ref, n, { merge: true });
      updateProgress();
    });
    await batch.commit();
  }
}
