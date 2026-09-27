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
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-3.5 sm:p-5 flex flex-col h-full shadow-sm dark:shadow-none transition-colors duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Ressources & Liens Numériques</span>
            <span className="text-xs font-mono tabular-nums text-zinc-500 font-normal">
              ({links.length})
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Vos accès rapides, documentation technique et raccourcis essentiels
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Display Mode Switch */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs shrink-0">
            <button
              onClick={() => setLocalDisplayMode('cards')}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                localDisplayMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Modèle Cartes"
              aria-label="Mode cartes"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLocalDisplayMode('list')}
              className={`min-w-[36px] min-h-[36px] p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                localDisplayMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Mode Liste"
              aria-label="Mode liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Ajouter un lien"
            className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium active:scale-95 ${
              selectedCategory === cat
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-950/60'
            }`}
          >
            {cat === 'all' ? 'Tous les liens' : cat}
          </button>
        ))}
        <button
          onClick={() => setSelectedCategory('favorites')}
          className={`min-h-[36px] px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium flex items-center gap-1.5 active:scale-95 ${
            selectedCategory === 'favorites'
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-500/40 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-950/60'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Favoris</span>
        </button>
      </div>

      {/* Links Content */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Globe className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Aucun lien dans cette catégorie</p>
          <p className="text-xs text-zinc-500 mt-1">Ajoutez vos sites clés pour y accéder en un instant.</p>
        </div>
      ) : localDisplayMode === 'cards' ? (
        /* MODÈLE CARTES */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[500px] pr-0.5 flex-1">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-zinc-500">
                    {link.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(link.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-amber-500 transition-colors"
                      title={link.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      aria-label="Favori"
                    >
                      <Star className={`w-4 h-4 ${link.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                      title="Supprimer le lien"
                      aria-label="Supprimer le lien"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
                  {link.title}
                </h3>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {link.description || link.url}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <button
                  onClick={() => handleCopy(link.id, link.url)}
                  className="min-h-[36px] px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  {copiedId === link.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier URL</span>
                    </>
                  )}
                </button>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onIncrementClicks(link.id)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span>Ouvrir</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MODE LISTE */
        <div className="space-y-2 overflow-y-auto max-h-[500px] pr-0.5">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="p-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between gap-2.5 transition-colors shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {link.title}
                  </h3>
                  <span className="text-xs text-zinc-500 shrink-0">
                    · {link.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">
                  {link.url}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleCopy(link.id, link.url)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg active:scale-95"
                  title="Copier le lien"
                >
                  {copiedId === link.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onIncrementClicks(link.id)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg active:scale-95"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => onDeleteLink(link.id)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded-lg active:scale-95"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Ajouter un lien favori</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Titre de la ressource *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Documentation React"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">URL / Adresse web *</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Catégorie</label>
                <input
                  type="text"
                  placeholder="ex: Développement, Design, Finance..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description courte</label>
                <input
                  type="text"
                  placeholder="Description facultative..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="link-fav"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="link-fav" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Mettre en avant dans les favoris
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-sm active:scale-95"
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
