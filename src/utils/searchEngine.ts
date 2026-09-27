import { AppData, Task, Project, ResourceLink, QuickNote, AttachedFile } from '../types';

export type SearchFilterType = 'all' | 'tasks' | 'projects' | 'links' | 'notes' | 'documents' | 'favorites';

export interface SearchResultItem {
  id: string;
  type: 'task' | 'project' | 'link' | 'note' | 'document';
  title: string;
  subtitle?: string;
  snippet?: string;
  category?: string;
  badge?: string;
  badgeType?: 'status' | 'priority' | 'category' | 'favorite';
  date?: string;
  isFavorite?: boolean;
  score: number;
  rawItem: Task | Project | ResourceLink | QuickNote;
  parentItem?: Task | Project | ResourceLink | QuickNote;
  attachedFile?: AttachedFile;
  matchedFields: string[];
}

export interface SearchFilters {
  type: SearchFilterType;
  category?: string;
  status?: string;
  onlyFavorites?: boolean;
}

export interface GroupedSearchResults {
  tasks: SearchResultItem[];
  projects: SearchResultItem[];
  links: SearchResultItem[];
  notes: SearchResultItem[];
  documents: SearchResultItem[];
  totalCount: number;
}

/**
 * Normalizes text for accent-insensitive, case-insensitive, and clean comparison.
 * e.g. "Tâche Échéance Modèle" -> "tache echeance modele"
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim();
}

/**
 * Levenshtein distance between two short strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks if a word or phrase matches the target with approximate / fuzzy tolerance.
 * Supports:
 * 1. Exact substring
 * 2. Word prefix / startsWith
 * 3. Typo tolerance (Levenshtein distance <= 1 for 4-6 chars, <= 2 for 7+ chars)
 */
function fuzzyFieldMatch(normalizedTarget: string, normalizedQueryTerm: string): { matches: boolean; score: number } {
  if (!normalizedTarget || !normalizedQueryTerm) {
    return { matches: false, score: 0 };
  }

  // 1. Exact match
  if (normalizedTarget === normalizedQueryTerm) {
    return { matches: true, score: 100 };
  }

  // 2. Starts with query
  if (normalizedTarget.startsWith(normalizedQueryTerm)) {
    return { matches: true, score: 85 };
  }

  // 3. Substring match
  const subIndex = normalizedTarget.indexOf(normalizedQueryTerm);
  if (subIndex !== -1) {
    // If it starts right after a space or punctuation, higher score
    const isWordStart = subIndex === 0 || /[\s\-_/.]/.test(normalizedTarget.charAt(subIndex - 1));
    return { matches: true, score: isWordStart ? 75 : 60 };
  }

  // 4. Word-by-word fuzzy match (Levenshtein)
  const targetWords = normalizedTarget.split(/[\s\-_/.,;:]+/).filter(w => w.length > 0);
  for (const word of targetWords) {
    // Prefix match on individual words
    if (word.startsWith(normalizedQueryTerm)) {
      return { matches: true, score: 70 };
    }
    if (normalizedQueryTerm.startsWith(word) && word.length >= 3) {
      return { matches: true, score: 65 };
    }

    // Levenshtein typo tolerance only if term length >= 4
    if (normalizedQueryTerm.length >= 4) {
      const maxAllowedDist = normalizedQueryTerm.length <= 6 ? 1 : 2;
      const dist = levenshteinDistance(word, normalizedQueryTerm);
      if (dist <= maxAllowedDist) {
        return { matches: true, score: 50 - dist * 10 };
      }
    }
  }

  return { matches: false, score: 0 };
}

/**
 * Searches across an item's candidate fields for all terms in the query.
 */
function scoreItem(
  fields: { name: string; value: string | undefined | null; weight: number }[],
  queryTerms: string[]
): { totalScore: number; matchedFields: string[]; bestSnippet?: string } {
  if (queryTerms.length === 0) {
    return { totalScore: 0, matchedFields: [] };
  }

  let totalScore = 0;
  const matchedFields = new Set<string>();
  let bestSnippet: string | undefined;

  // Every query term must match at least one field (AND semantic)
  for (const term of queryTerms) {
    let termMatched = false;
    let maxTermScore = 0;

    for (const field of fields) {
      if (!field.value) continue;
      const normalizedValue = normalizeText(field.value);
      const match = fuzzyFieldMatch(normalizedValue, term);

      if (match.matches) {
        termMatched = true;
        const weightedScore = match.score * field.weight;
        if (weightedScore > maxTermScore) {
          maxTermScore = weightedScore;
        }
        matchedFields.add(field.name);

        if (!bestSnippet && (field.name === 'description' || field.name === 'content' || field.name === 'notes')) {
          bestSnippet = field.value;
        }
      }
    }

    if (!termMatched) {
      // If any term didn't match anything, reject item
      return { totalScore: 0, matchedFields: [] };
    }

    totalScore += maxTermScore;
  }

  return {
    totalScore,
    matchedFields: Array.from(matchedFields),
    bestSnippet
  };
}

/**
 * Extracts a searchable domain and path terms from a URL.
 */
function extractUrlKeywords(urlStr: string): string {
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    return `${url.hostname} ${url.pathname.replace(/[/_-]/g, ' ')}`;
  } catch {
    return urlStr;
  }
}

/**
 * Formats a snippet around the matched search terms.
 */
export function createExcerpt(text: string, query: string, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const firstTerm = normalizedQuery.split(/\s+/)[0] || '';

  const index = firstTerm ? normalizedText.indexOf(firstTerm) : -1;
  if (index === -1) {
    return text.substring(0, maxLength) + '...';
  }

  const start = Math.max(0, index - 25);
  const end = Math.min(text.length, index + maxLength - 25);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';

  return prefix + text.substring(start, end).trim() + suffix;
}

/**
 * Main Global Search Function
 */
export function performGlobalSearch(
  data: AppData,
  rawQuery: string,
  filters: SearchFilters = { type: 'all' }
): GroupedSearchResults {
  const query = rawQuery.trim();
  const normalizedQuery = normalizeText(query);
  const queryTerms = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

  const results: GroupedSearchResults = {
    tasks: [],
    projects: [],
    links: [],
    notes: [],
    documents: [],
    totalCount: 0
  };

  // If query is empty and no specific filter, return empty
  if (queryTerms.length === 0 && !filters.category && !filters.status && !filters.onlyFavorites) {
    return results;
  }

  const projectMap = new Map<string, Project>();
  data.projects.forEach(p => projectMap.set(p.id, p));

  // --- 1. SEARCH TASKS ---
  if (filters.type === 'all' || filters.type === 'tasks' || (filters.type === 'favorites' && filters.onlyFavorites)) {
    data.tasks.forEach(task => {
      // Extra filters check
      if (filters.status) {
        if (filters.status === 'completed' && !task.completed) return;
        if (filters.status === 'pending' && task.completed) return;
        if (filters.status === 'haute' && task.priority !== 'haute') return;
      }
      if (filters.onlyFavorites && task.priority !== 'haute' && !task.isToday) return;

      const associatedProject = task.projectId ? projectMap.get(task.projectId) : undefined;
      if (filters.category && associatedProject && associatedProject.category.toLowerCase() !== filters.category.toLowerCase()) {
        return;
      }

      // Fields to inspect
      const fields = [
        { name: 'titre', value: task.title, weight: 2.0 },
        { name: 'description', value: task.description, weight: 1.2 },
        { name: 'notes', value: task.notes, weight: 1.0 },
        { name: 'projet', value: associatedProject?.title, weight: 0.9 },
        { name: 'priorite', value: task.priority === 'haute' ? 'haute urgente' : task.priority, weight: 0.7 },
        { name: 'statut', value: task.completed ? 'termine terminee faite' : 'en cours a faire a_faire', weight: 0.7 },
        { name: 'date', value: task.dueDate || task.createdAt, weight: 0.5 },
      ];

      // Attached document names
      if (task.documents && task.documents.length > 0) {
        fields.push({
          name: 'fichiers',
          value: task.documents.map(d => d.name).join(' '),
          weight: 0.9
        });
      }

      const { totalScore, matchedFields, bestSnippet } = scoreItem(fields, queryTerms);

      // If query is empty but filter is active, give base score
      if (queryTerms.length === 0 || totalScore > 0) {
        const priorityLabels = { haute: 'Urgent', moyenne: 'Moyenne', basse: 'Basse' };
        results.tasks.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: associatedProject ? `Projet: ${associatedProject.title}` : (task.isToday ? "Aujourd'hui" : undefined),
          snippet: bestSnippet ? createExcerpt(bestSnippet, query) : (task.description ? createExcerpt(task.description, query) : undefined),
          badge: task.completed ? 'Terminée' : priorityLabels[task.priority],
          badgeType: task.completed ? 'status' : 'priority',
          date: task.dueDate || task.createdAt ? new Date(task.dueDate || task.createdAt).toLocaleDateString('fr-FR') : undefined,
          score: queryTerms.length === 0 ? 50 : totalScore + (task.priority === 'haute' ? 5 : 0),
          rawItem: task,
          matchedFields
        });
      }
    });
  }

  // --- 2. SEARCH PROJECTS ---
  if (filters.type === 'all' || filters.type === 'projects') {
    data.projects.forEach(project => {
      if (filters.status && project.status !== filters.status) return;
      if (filters.category && project.category.toLowerCase() !== filters.category.toLowerCase()) return;
      if (filters.onlyFavorites && project.progress < 50) return;

      const fields = [
        { name: 'titre', value: project.title, weight: 2.2 },
        { name: 'description', value: project.description, weight: 1.3 },
        { name: 'categorie', value: project.category, weight: 1.4 },
        { name: 'tags', value: project.tags?.join(' '), weight: 1.1 },
        { name: 'notes', value: project.notes, weight: 0.9 },
        { name: 'statut', value: project.status === 'en_cours' ? 'en cours' : (project.status === 'termine' ? 'termine' : 'en attente'), weight: 0.8 },
        { name: 'echeance', value: project.dueDate, weight: 0.5 },
      ];

      if (project.documents && project.documents.length > 0) {
        fields.push({
          name: 'fichiers',
          value: project.documents.map(d => d.name).join(' '),
          weight: 0.9
        });
      }

      const { totalScore, matchedFields, bestSnippet } = scoreItem(fields, queryTerms);

      if (queryTerms.length === 0 || totalScore > 0) {
        const statusMap = { en_cours: 'En cours', en_attente: 'En attente', termine: 'Terminé' };
        results.projects.push({
          id: project.id,
          type: 'project',
          title: project.title,
          subtitle: `${project.category} · ${project.progress}%`,
          snippet: bestSnippet ? createExcerpt(bestSnippet, query) : createExcerpt(project.description, query),
          category: project.category,
          badge: statusMap[project.status],
          badgeType: 'status',
          date: project.dueDate ? new Date(project.dueDate).toLocaleDateString('fr-FR') : undefined,
          score: queryTerms.length === 0 ? 50 : totalScore + (project.status === 'en_cours' ? 5 : 0),
          rawItem: project,
          matchedFields
        });
      }
    });
  }

  // --- 3. SEARCH LINKS ---
  if (filters.type === 'all' || filters.type === 'links' || (filters.type === 'favorites' && filters.onlyFavorites)) {
    data.links.forEach(link => {
      if (filters.onlyFavorites && !link.isFavorite) return;
      if (filters.category && link.category.toLowerCase() !== filters.category.toLowerCase()) return;

      const urlKeywords = extractUrlKeywords(link.url);
      const fields = [
        { name: 'titre', value: link.title, weight: 2.2 },
        { name: 'url', value: link.url, weight: 1.6 },
        { name: 'domaine', value: urlKeywords, weight: 1.4 },
        { name: 'categorie', value: link.category, weight: 1.3 },
        { name: 'description', value: link.description, weight: 1.1 },
        { name: 'tags', value: link.tags?.join(' '), weight: 1.0 },
      ];

      if (link.documents && link.documents.length > 0) {
        fields.push({
          name: 'fichiers',
          value: link.documents.map(d => d.name).join(' '),
          weight: 0.9
        });
      }

      const { totalScore, matchedFields, bestSnippet } = scoreItem(fields, queryTerms);

      if (queryTerms.length === 0 || totalScore > 0) {
        results.links.push({
          id: link.id,
          type: 'link',
          title: link.title,
          subtitle: link.url.replace(/^https?:\/\//i, ''),
          snippet: bestSnippet ? createExcerpt(bestSnippet, query) : (link.description ? createExcerpt(link.description, query) : undefined),
          category: link.category,
          badge: link.isFavorite ? 'Favori ★' : link.category,
          badgeType: link.isFavorite ? 'favorite' : 'category',
          isFavorite: link.isFavorite,
          score: queryTerms.length === 0 ? 50 : totalScore + (link.isFavorite ? 10 : 0),
          rawItem: link,
          matchedFields
        });
      }
    });
  }

  // --- 4. SEARCH NOTES ---
  if (filters.type === 'all' || filters.type === 'notes' || (filters.type === 'favorites' && filters.onlyFavorites)) {
    data.notes.forEach(note => {
      if (filters.onlyFavorites && !note.isPinned) return;

      const fields = [
        { name: 'titre', value: note.title, weight: 2.2 },
        { name: 'contenu', value: note.content, weight: 1.5 },
        { name: 'tags', value: note.tags?.join(' '), weight: 1.1 },
        { name: 'date', value: note.updatedAt, weight: 0.5 },
      ];

      if (note.documents && note.documents.length > 0) {
        fields.push({
          name: 'fichiers',
          value: note.documents.map(d => d.name).join(' '),
          weight: 0.9
        });
      }

      const { totalScore, matchedFields, bestSnippet } = scoreItem(fields, queryTerms);

      if (queryTerms.length === 0 || totalScore > 0) {
        results.notes.push({
          id: note.id,
          type: 'note',
          title: note.title,
          subtitle: note.updatedAt,
          snippet: bestSnippet ? createExcerpt(bestSnippet, query) : createExcerpt(note.content, query),
          badge: note.isPinned ? 'Épinglée 📌' : undefined,
          badgeType: 'favorite',
          isFavorite: note.isPinned,
          date: note.updatedAt,
          score: queryTerms.length === 0 ? 50 : totalScore + (note.isPinned ? 10 : 0),
          rawItem: note,
          matchedFields
        });
      }
    });
  }

  // --- 5. SEARCH ATTACHED DOCUMENTS & FILES ---
  if (filters.type === 'all' || filters.type === 'documents') {
    const allContainers: { parent: Task | Project | ResourceLink | QuickNote; typeName: string; docs?: AttachedFile[] }[] = [
      ...data.tasks.map(t => ({ parent: t, typeName: `Tâche: ${t.title}`, docs: t.documents })),
      ...data.projects.map(p => ({ parent: p, typeName: `Projet: ${p.title}`, docs: p.documents })),
      ...data.links.map(l => ({ parent: l, typeName: `Lien: ${l.title}`, docs: l.documents })),
      ...data.notes.map(n => ({ parent: n, typeName: `Note: ${n.title}`, docs: n.documents }))
    ];

    allContainers.forEach(({ parent, typeName, docs }) => {
      if (!docs || docs.length === 0) return;

      docs.forEach(doc => {
        const ext = doc.name.split('.').pop() || '';
        const fields = [
          { name: 'nom_fichier', value: doc.name, weight: 2.5 },
          { name: 'extension', value: ext, weight: 1.8 },
          { name: 'type_mime', value: doc.type, weight: 1.2 },
          { name: 'element_parent', value: typeName, weight: 1.0 },
        ];

        const { totalScore, matchedFields } = scoreItem(fields, queryTerms);

        if (queryTerms.length === 0 || totalScore > 0) {
          const sizeKb = Math.round(doc.size / 1024);
          results.documents.push({
            id: doc.id,
            type: 'document',
            title: doc.name,
            subtitle: typeName,
            snippet: `${sizeKb} Ko · Type: ${ext.toUpperCase() || 'Fichier'}`,
            badge: ext.toUpperCase() || 'FICHIER',
            badgeType: 'category',
            date: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : undefined,
            score: queryTerms.length === 0 ? 50 : totalScore,
            rawItem: parent,
            parentItem: parent,
            attachedFile: doc,
            matchedFields
          });
        }
      });
    });
  }

  // Sort each array by descending score
  results.tasks.sort((a, b) => b.score - a.score);
  results.projects.sort((a, b) => b.score - a.score);
  results.links.sort((a, b) => b.score - a.score);
  results.notes.sort((a, b) => b.score - a.score);
  results.documents.sort((a, b) => b.score - a.score);

  results.totalCount =
    results.tasks.length +
    results.projects.length +
    results.links.length +
    results.notes.length +
    results.documents.length;

  return results;
}

// -------------------------------------------------------------
// RECENT SEARCHES HISTORY MANAGEMENT (localStorage)
// -------------------------------------------------------------
const RECENT_SEARCHES_KEY = 'espace_numerique_recent_searches_v1';
const MAX_RECENT_SEARCHES = 8;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;

  try {
    const current = getRecentSearches();
    const updated = [trimmed, ...current.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erreur sauvegarde historique recherche:', e);
  }
}

export function removeRecentSearch(queryToRemove: string): void {
  try {
    const current = getRecentSearches();
    const updated = current.filter(item => item !== queryToRemove);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erreur suppression recherche:', e);
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    console.error('Erreur vidage historique recherche:', e);
  }
}
