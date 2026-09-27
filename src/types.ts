export type Priority = 'haute' | 'moyenne' | 'basse';
export type ProjectStatus = 'en_cours' | 'en_attente' | 'termine';
export type NoteColor = 'zinc' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
export type DisplayMode = 'cards' | 'list';
export type ThemeMode = 'dark' | 'light';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  isToday: boolean;
  dueDate?: string;
  projectId?: string;
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
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  isFavorite: boolean;
  clicks: number;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  color: NoteColor;
  updatedAt: string;
}

export interface AppData {
  tasks: Task[];
  projects: Project[];
  links: ResourceLink[];
  notes: QuickNote[];
}
