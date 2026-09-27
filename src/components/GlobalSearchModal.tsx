import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  ArrowLeft, 
  SlidersHorizontal, 
  Clock, 
  Trash2, 
  Star, 
  CheckSquare, 
  Briefcase, 
  Link2, 
  ExternalLink, 
  FileText, 
  Paperclip, 
  Download, 
  ChevronRight, 
  CornerDownLeft, 
  Layers, 
  Sparkles,
  Calendar,
  AlertCircle,
  BookUser
} from 'lucide-react';
import { AppData, AddressEntry, Task, Project, ResourceLink, QuickNote, AttachedFile } from '../types';
import { 
  performGlobalSearch, 
  SearchFilterType, 
  SearchResultItem, 
  GroupedSearchResults,
  getRecentSearches, 
  saveRecentSearch, 
  removeRecentSearch, 
  clearRecentSearches 
} from '../utils/searchEngine';
import { HighlightText } from './HighlightText';
import { downloadDataUrl } from '../utils/fileHelpers';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  initialQuery?: string;
  onSelectAddressEntry?: (entry: AddressEntry) => void;
  onSelectTask: (task: Task) => void;
  onSelectProject: (project: Project) => void;
  onSelectLink: (link: ResourceLink) => void;
  onSelectNote: (note: QuickNote) => void;
  onSelectDocument: (doc: AttachedFile, parent: Task | Project | ResourceLink | QuickNote) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  data,
  initialQuery = '',
  onSelectAddressEntry,
  onSelectTask,
  onSelectProject,
  onSelectLink,
  onSelectNote,
  onSelectDocument,
  onNotify
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<SearchFilterType>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial query when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialQuery);
      setDebouncedQuery(initialQuery);
      setRecentSearches(getRecentSearches());
      setSelectedIndex(-1);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Debounce search input (~250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      setSelectedIndex(-1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Dynamic Categories from existing items
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    data.projects.forEach(p => p.category && set.add(p.category));
    data.links.forEach(l => l.category && set.add(l.category));
    return Array.from(set).sort();
  }, [data]);

  // Perform search
  const searchResults: GroupedSearchResults = useMemo(() => {
    return performGlobalSearch(data, debouncedQuery, {
      type: filterType,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      onlyFavorites: onlyFavorites || filterType === 'favorites'
    });
  }, [data, debouncedQuery, filterType, selectedCategory, selectedStatus, onlyFavorites]);

  // Flat list of all visible results for keyboard navigation
  const flatResults = useMemo(() => {
    const list: SearchResultItem[] = [];
    if (filterType === 'all' || filterType === 'addressBook') list.push(...(searchResults.addressBook || []));
    if (filterType === 'all' || filterType === 'projects') list.push(...searchResults.projects);
    if (filterType === 'all' || filterType === 'tasks' || filterType === 'favorites') list.push(...searchResults.tasks);
    if (filterType === 'all' || filterType === 'links' || filterType === 'favorites') list.push(...searchResults.links);
    if (filterType === 'all' || filterType === 'notes' || filterType === 'favorites') list.push(...searchResults.notes);
    if (filterType === 'all' || filterType === 'documents') list.push(...searchResults.documents);
    return list;
  }, [searchResults, filterType]);

  // Handle item selection
  const handleItemClick = (item: SearchResultItem) => {
    if (debouncedQuery.trim()) {
      saveRecentSearch(debouncedQuery.trim());
      setRecentSearches(getRecentSearches());
    }

    onClose();

    switch (item.type) {
      case 'address':
        if (onSelectAddressEntry) {
          onSelectAddressEntry(item.rawItem as AddressEntry);
        }
        break;
      case 'task':
        onSelectTask(item.rawItem as Task);
        break;
      case 'project':
        onSelectProject(item.rawItem as Project);
        break;
      case 'link':
        onSelectLink(item.rawItem as ResourceLink);
        break;
      case 'note':
        onSelectNote(item.rawItem as QuickNote);
        break;
      case 'document':
        if (item.attachedFile && item.parentItem) {
          onSelectDocument(item.attachedFile, item.parentItem);
        }
        break;
    }
  };

  // Keyboard navigation (Escape, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (flatResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < flatResults.length) {
          e.preventDefault();
          handleItemClick(flatResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatResults, selectedIndex]);

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
    onNotify('Historique de recherche effacé', 'info');
  };

  const handleRemoveRecentItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const handleSelectRecentTerm = (term: string) => {
    setSearchTerm(term);
    setDebouncedQuery(term);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const isQueryEmpty = !searchTerm.trim();

  // Frequent items for empty state
  const favoriteLinks = data.links.filter(l => l.isFavorite).slice(0, 4);
  const pinnedNotes = data.notes.filter(n => n.isPinned).slice(0, 3);
  const urgentTasks = data.tasks.filter(t => !t.completed && (t.priority === 'haute' || t.isToday)).slice(0, 4);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-3xl h-full sm:h-[85vh] sm:max-h-[720px] bg-white dark:bg-zinc-950 sm:rounded-2xl border-0 sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Search Bar */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md px-3 sm:px-5 py-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Back Button */}
            <button
              onClick={onClose}
              aria-label="Fermer la recherche"
              className="sm:hidden min-w-[38px] min-h-[38px] p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Desktop Brand Icon */}
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-indigo-600/15 dark:bg-indigo-600/25 border border-indigo-500/30 items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>

            {/* Search Input Field */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher partout (tâches, projets, liens, notes, documents, URLs...)"
                className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all pr-9"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDebouncedQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Effacer le texte"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[28px] min-h-[28px] p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              title="Filtres supplémentaires"
              aria-label="Filtres"
              className={`min-w-[40px] min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                showAdvancedFilters || selectedCategory || selectedStatus || onlyFavorites
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden md:inline">Filtres</span>
              {(selectedCategory || selectedStatus || onlyFavorites) && (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="hidden sm:flex min-w-[36px] min-h-[36px] p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Category Filter Pills (Horizontal Scrolling on Touch) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Tout</span>
              {!isQueryEmpty && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  {searchResults.totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('addressBook')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                filterType === 'addressBook'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BookUser className="w-3.5 h-3.5" />
              <span>Carnet d’adresses</span>
              {!isQueryEmpty && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  {searchResults.addressBook?.length || 0}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('tasks')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                filterType === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tâches</span>
              {!isQueryEmpty && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  {searchResults.tasks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('projects')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                filterType === 'projects'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Projets</span>
              {!isQueryEmpty && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  {searchResults.projects.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('links')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                filterType === 'links'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Liens</span>
              {!isQueryEmpty && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  {searchResults.links.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('notes')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                filterType === 'notes'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes</span>
              {!isQueryEmpty && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  {searchResults.notes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('documents')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                filterType === 'documents'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Documents</span>
              {!isQueryEmpty && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                  {searchResults.documents.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('favorites')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                filterType === 'favorites'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Favoris</span>
            </button>
          </div>

          {/* Advanced Filters Simple Drawer */}
          {showAdvancedFilters && (
            <div className="mt-2.5 pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2.5 text-xs animate-in slide-in-from-top-1 duration-150">
              {/* Category selector */}
              {availableCategories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 font-medium">Catégorie :</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Toutes</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 font-medium">Statut :</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Tous statuts</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé / Complété</option>
                  <option value="en_attente">En attente</option>
                  <option value="haute">Haute priorité / Urgent</option>
                </select>
              </div>

              {/* Only favorites checkbox */}
              <label className="flex items-center gap-1.5 cursor-pointer ml-auto text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Favoris / Épinglés uniquement</span>
              </label>

              {/* Reset filters button */}
              {(selectedCategory || selectedStatus || onlyFavorites) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedStatus('');
                    setOnlyFavorites(false);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Réinitialiser filtres
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Body / Scrollable Area */}
        <div 
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6"
        >
          {/* STATE 1: Empty Query -> Recent Searches & Quick Access */}
          {isQueryEmpty ? (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Recherches Récentes</span>
                    </h3>
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Effacer l'historique</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectRecentTerm(term)}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-indigo-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 cursor-pointer text-xs transition-colors"
                      >
                        <Search className="w-3 h-3 text-zinc-400 group-hover:text-indigo-500" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {term}
                        </span>
                        <button
                          onClick={(e) => handleRemoveRecentItem(term, e)}
                          title="Supprimer ce terme"
                          className="text-zinc-400 hover:text-red-500 p-0.5 rounded transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick access bookmarks & favorites */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Accès Rapide & Favoris</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Favorite Links */}
                  {favoriteLinks.map(link => (
                    <div
                      key={link.id}
                      onClick={() => {
                        onClose();
                        onSelectLink(link);
                      }}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Link2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {link.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {link.category}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  ))}

                  {/* Urgent tasks */}
                  {urgentTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => {
                        onClose();
                        onSelectTask(task);
                      }}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {task.title}
                          </p>
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            {task.priority === 'haute' ? 'Priorité Haute' : "Aujourd'hui"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  ))}

                  {/* Pinned notes */}
                  {pinnedNotes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => {
                        onClose();
                        onSelectNote(note);
                      }}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {note.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {note.updatedAt}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions footer */}
              <div className="pt-4 text-center">
                <p className="text-xs text-zinc-400">
                  Tapez n'importe quel terme pour chercher dans l'ensemble de l'application (titres, dates, catégories, pièces jointes, URLs...).
                </p>
              </div>
            </div>
          ) : searchResults.totalCount === 0 ? (
            /* STATE 2: Query With No Results */
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Aucun résultat pour « {searchTerm} »
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Vérifiez l'orthographe, essayez avec moins de mots ou réinitialisez les filtres sélectionnés.
              </p>
            </div>
          ) : (
            /* STATE 3: Grouped Search Results */
            <div className="space-y-6">
              
              {/* SECTION: CARNET D'ADRESSES */}
              {(filterType === 'all' || filterType === 'addressBook') && (searchResults.addressBook?.length || 0) > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <BookUser className="w-3.5 h-3.5" />
                      <span>Carnet d’adresses ({searchResults.addressBook.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.addressBook.map((item) => (
                      <ResultCard
                        key={item.id}
                        item={item}
                        query={debouncedQuery}
                        onClick={() => handleItemClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PROJETS */}
              {(filterType === 'all' || filterType === 'projects') && searchResults.projects.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Projets ({searchResults.projects.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.projects.map((item) => (
                      <ResultCard
                        key={item.id}
                        item={item}
                        query={debouncedQuery}
                        onClick={() => handleItemClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: TÂCHES */}
              {(filterType === 'all' || filterType === 'tasks' || filterType === 'favorites') && searchResults.tasks.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Tâches ({searchResults.tasks.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.tasks.map((item) => (
                      <ResultCard
                        key={item.id}
                        item={item}
                        query={debouncedQuery}
                        onClick={() => handleItemClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: LIENS */}
              {(filterType === 'all' || filterType === 'links' || filterType === 'favorites') && searchResults.links.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Liens Favoris ({searchResults.links.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.links.map((item) => (
                      <ResultCard
                        key={item.id}
                        item={item}
                        query={debouncedQuery}
                        onClick={() => handleItemClick(item)}
                        onSecondaryAction={() => {
                          const link = item.rawItem as ResourceLink;
                          window.open(link.url, '_blank', 'noopener,noreferrer');
                        }}
                        secondaryActionLabel="Ouvrir ↗"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: NOTES */}
              {(filterType === 'all' || filterType === 'notes' || filterType === 'favorites') && searchResults.notes.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Notes Rapides ({searchResults.notes.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.notes.map((item) => (
                      <ResultCard
                        key={item.id}
                        item={item}
                        query={debouncedQuery}
                        onClick={() => handleItemClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: DOCUMENTS & FICHIERS */}
              {(filterType === 'all' || filterType === 'documents') && searchResults.documents.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Documents & Pièces Jointes ({searchResults.documents.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchResults.documents.map((item) => (
                      <ResultCard
                        key={item.id}
                        item={item}
                        query={debouncedQuery}
                        onClick={() => handleItemClick(item)}
                        onSecondaryAction={() => {
                          if (item.attachedFile) {
                            downloadDataUrl(item.attachedFile.dataUrl, item.attachedFile.name);
                            onNotify(`Téléchargement lancé : ${item.attachedFile.name}`, 'info');
                          }
                        }}
                        secondaryActionLabel="Télécharger ⭳"
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-2.5 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono">↓</kbd>
              <span className="hidden sm:inline">pour naviguer</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono">Entrée</kbd>
              <span>pour ouvrir</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono">Échap</kbd>
              <span>pour fermer</span>
            </span>
          </div>

          <div className="text-[11px] font-medium text-zinc-400">
            Recherche globale instantanée
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// INDIVIDUAL RESULT ITEM CARD
// -------------------------------------------------------------
interface ResultCardProps {
  item: SearchResultItem;
  query: string;
  onClick: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  item,
  query,
  onClick,
  onSecondaryAction,
  secondaryActionLabel
}) => {
  const getIcon = () => {
    switch (item.type) {
      case 'address':
        return <BookUser className="w-4 h-4 text-indigo-500" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'link':
        return <Link2 className="w-4 h-4 text-blue-500" />;
      case 'note':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'document':
        return <Paperclip className="w-4 h-4 text-purple-500" />;
    }
  };

  const getBadgeStyle = () => {
    if (item.badge === 'Terminée' || item.badge === 'Terminé') {
      return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
    }
    if (item.badge === 'Urgent' || item.badge === 'Haute') {
      return 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30';
    }
    if (item.badge === 'En cours') {
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    }
    if (item.isFavorite) {
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    }
    return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  };

  return (
    <div
      onClick={onClick}
      className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group active:scale-[0.99]"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Type Icon */}
        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <HighlightText text={item.title} query={query} />
            </h4>

            {item.badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getBadgeStyle()}`}>
                {item.badge}
              </span>
            )}
          </div>

          {/* Subtitle / Context */}
          {item.subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 truncate">
              <HighlightText text={item.subtitle} query={query} />
            </p>
          )}

          {/* Snippet / Description match */}
          {item.snippet && (
            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed bg-zinc-50 dark:bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 mt-1">
              <HighlightText text={item.snippet} query={query} />
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons on right */}
      <div className="flex items-center gap-1.5 shrink-0 self-center">
        {onSecondaryAction && secondaryActionLabel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSecondaryAction();
            }}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 transition-colors hidden sm:flex items-center gap-1"
          >
            <span>{secondaryActionLabel}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClick}
          className="w-8 h-8 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
          title="Ouvrir la fiche"
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
