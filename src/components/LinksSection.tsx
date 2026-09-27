import React, { useState } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Star, 
  Plus, 
  Trash2, 
  Globe,
  LayoutGrid,
  List
} from 'lucide-react';
import { ResourceLink, DisplayMode } from '../types';

interface LinksSectionProps {
  links: ResourceLink[];
  searchQuery: string;
  displayMode?: DisplayMode;
  onAddLink: (link: Omit<ResourceLink, 'id' | 'clicks'>) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementClicks: (id: string) => void;
  onDeleteLink: (id: string) => void;
}

export const LinksSection: React.FC<LinksSectionProps> = ({
  links,
  searchQuery,
  displayMode: initialDisplayMode = 'list',
  onAddLink,
  onToggleFavorite,
  onIncrementClicks,
  onDeleteLink
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localDisplayMode, setLocalDisplayMode] = useState<DisplayMode>(initialDisplayMode);

  React.useEffect(() => {
    if (initialDisplayMode) {
      setLocalDisplayMode(initialDisplayMode);
    }
  }, [initialDisplayMode]);

  // New Link Form
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Développement');
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(true);

  const categories = ['all', ...Array.from(new Set(links.map(l => l.category)))];

  const handleCopy = (id: string, linkUrl: string) => {
    navigator.clipboard.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onAddLink({
      title: title.trim(),
      url: formattedUrl,
      category: category.trim() || 'Général',
      description: description.trim(),
      isFavorite
    });

    setTitle('');
    setUrl('');
    setDescription('');
    setIsModalOpen(false);
  };

  const filteredLinks = links.filter(link => {
    if (searchQuery) {
      const match = 
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'favorites') return link.isFavorite;
    return link.category === selectedCategory;
  });

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-xl p-5 flex flex-col h-full shadow-sm dark:shadow-none transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Ressources & Liens Numériques</span>
            <span className="text-xs font-mono tabular-nums text-zinc-500 font-normal">
              ({links.length})
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Vos accès rapides, documentation technique et raccourcis essentiels
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Display Mode Switch */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setLocalDisplayMode('cards')}
              className={`p-1.5 rounded transition-colors ${
                localDisplayMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Modèle Cartes"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLocalDisplayMode('list')}
              className={`p-1.5 rounded transition-colors ${
                localDisplayMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Mode Liste"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
              selectedCategory === cat
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-950/40'
            }`}
          >
            {cat === 'all' ? 'Tous les liens' : cat}
          </button>
        ))}
        <button
          onClick={() => setSelectedCategory('favorites')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium flex items-center gap-1 ${
            selectedCategory === 'favorites'
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-500/30'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-950/40'
          }`}
        >
          <Star className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          <span>Favoris</span>
        </button>
      </div>

      {/* Links Content */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <Globe className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Aucun lien dans cette catégorie</p>
          <p className="text-xs text-zinc-500 mt-1">Ajoutez vos sites clés pour y accéder en un instant.</p>
        </div>
      ) : localDisplayMode === 'cards' ? (
        /* MODÈLE CARTES */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[460px] pr-1 flex-1">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 rounded-xl p-3.5 flex flex-col justify-between transition-all duration-150 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-medium text-zinc-500">
                    {link.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(link.id)}
                      className="text-zinc-400 hover:text-amber-500 transition-colors"
                      title="Favori"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          link.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  {link.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                  {link.description || link.url}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-850 gap-2">
                <button
                  onClick={() => handleCopy(link.id, link.url)}
                  className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors flex items-center gap-1"
                >
                  {copiedId === link.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copier</span>
                    </>
                  )}
                </button>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onIncrementClicks(link.id)}
                  className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-1"
                >
                  <span>Ouvrir</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MODE LISTE */
        <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1 flex-1">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="group bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 rounded-lg p-2.5 flex items-center justify-between gap-3 transition-all duration-150 shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  onClick={() => onToggleFavorite(link.id)}
                  className="text-zinc-400 hover:text-amber-500 transition-colors shrink-0"
                  title="Favori"
                >
                  <Star
                    className={`w-4 h-4 ${
                      link.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                    }`}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {link.title}
                    </h3>
                    <span className="text-xs text-zinc-500 shrink-0">
                      · {link.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {link.url.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(link.id, link.url)}
                  className="p-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md transition-colors"
                  title="Copier l'URL"
                >
                  {copiedId === link.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onIncrementClicks(link.id)}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-white bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/30 rounded-md transition-colors flex items-center gap-1"
                >
                  <span>Ouvrir</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => onDeleteLink(link.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Ajouter un lien */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Ajouter une Ressource</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nom de la ressource *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Documentation React 19"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">URL complète *</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Développement">Développement</option>
                    <option value="Outils & SaaS">Outils & SaaS</option>
                    <option value="Veille & Docs">Veille & Docs</option>
                    <option value="Design">Design</option>
                    <option value="Personnel">Personnel</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      className="rounded bg-zinc-100 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Favori épinglé</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description courte</label>
                <input
                  type="text"
                  placeholder="Notes ou usage principal..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Enregistrer le lien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
