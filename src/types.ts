export type Priority = 'haute' | 'moyenne' | 'basse';
export type ProjectStatus = 'en_cours' | 'en_attente' | 'termine';
export type NoteColor = 'zinc' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
export type DisplayMode = 'cards' | 'list';
export type ThemeMode = 'dark' | 'light';

export interface AttachedFile {
  id: string;
  name: string;
  size: number; // in bytes
  type: string;
  dataUrl: string; // base64 string
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  isToday: boolean;
  dueDate?: string;
  projectId?: string;
  description?: string;
  notes?: string;
  documents?: AttachedFile[];
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  progress: number; // 0 to 100
  dueDate: string;
  tags: string[];
  notes?: string;
  isArchived?: boolean;
  documents?: AttachedFile[];
  createdAt?: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  isFavorite: boolean;
  clicks: number;
  tags?: string[];
  documents?: AttachedFile[];
  createdAt?: string;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  color: NoteColor;
  updatedAt: string;
  tags?: string[];
  documents?: AttachedFile[];
}

export interface AppData {
  tasks: Task[];
  projects: Project[];
  links: ResourceLink[];
  notes: QuickNote[];
}

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}
