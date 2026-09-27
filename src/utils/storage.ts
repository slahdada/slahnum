import { AppData } from '../types';

const STORAGE_KEY = 'espace_numerique_storage_v1';

const getRelativeIsoDate = (daysAgo: number, hour = 14) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 30, 0, 0);
  return d.toISOString();
};

export const initialData: AppData = {
  addressBook: [
    {
      id: 'addr-1',
      name: 'Dr. Martin - Cabinet Médical Pasteur',
      key: 'MED-042',
      nature: 'Santé / Consultation',
      notification: 'Rappel SMS 48h avant',
      createdAt: getRelativeIsoDate(2, 9)
    },
    {
      id: 'addr-2',
      name: 'Fournisseur Matériel IT & Réseau',
      key: 'SRV-890',
      nature: 'Informatique / Équipement',
      notification: 'Alerte livraison par e-mail',
      createdAt: getRelativeIsoDate(1, 14)
    },
    {
      id: 'addr-3',
      name: 'Service Comptabilité & Facturation Centrale',
      key: 'COMPTA-01',
      nature: 'Gestion / Finance',
      notification: 'Notification mensuelle le 28',
      createdAt: getRelativeIsoDate(0, 10)
    },
    {
      id: 'addr-4',
      name: 'Contact Logistique & Transport Express',
      key: 'LOG-77',
      nature: 'Transport / Fret',
      notification: 'Suivi temps réel colis',
      createdAt: getRelativeIsoDate(0, 11)
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Refonte Espace Numérique',
      description: 'Centralisation des outils de productivité, révision de l\'architecture UX et tests responsive.',
      category: 'Développement',
      status: 'en_cours',
      progress: 75,
      dueDate: '2026-10-05',
      tags: ['React', 'Tailwind', 'Productivité']
    },
    {
      id: 'proj-2',
      title: 'Veille Technologique & IA',
      description: 'Synthèse hebdomadaire des modèles de pointe, automatisations de scripts et workflows.',
      category: 'Veille',
      status: 'en_cours',
      progress: 40,
      dueDate: '2026-10-18',
      tags: ['IA', 'Documentation', 'Scripts']
    },
    {
      id: 'proj-3',
      title: 'Optimisation Sauvegardes Cloud',
      description: 'Audit des points de stockage distants, synchronisation chiffrée et nettoyage d\'archives.',
      category: 'Système',
      status: 'en_attente',
      progress: 20,
      dueDate: '2026-11-01',
      tags: ['Sécurité', 'Backup']
    },
    {
      id: 'proj-4',
      title: 'Audit Performance & Sécurité',
      description: 'Revue complète des dépendances et validation des audits de vulnérabilité.',
      category: 'Qualité',
      status: 'termine',
      progress: 100,
      dueDate: '2026-09-20',
      tags: ['Audit', 'Sécurité']
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Finaliser le module de synchronisation locale',
      completed: true,
      priority: 'haute',
      isToday: true,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(0, 8),
      completedAt: getRelativeIsoDate(0, 11)
    },
    {
      id: 'task-1b',
      title: 'Conception mobile-first et mode plein écran immersif',
      completed: true,
      priority: 'haute',
      isToday: true,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(0, 9),
      completedAt: getRelativeIsoDate(0, 10)
    },
    {
      id: 'task-2',
      title: 'Vérifier la compatibilité mobile et l\'affichage tactile',
      completed: false,
      priority: 'haute',
      isToday: true,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(0, 8)
    },
    {
      id: 'task-3',
      title: 'Classer les liens favoris et vérifier les URLs utiles',
      completed: false,
      priority: 'moyenne',
      isToday: true,
      createdAt: getRelativeIsoDate(0, 9)
    },
    {
      id: 'task-4',
      title: 'Mettre à jour le script d\'export des sauvegardes',
      completed: false,
      priority: 'moyenne',
      isToday: true,
      projectId: 'proj-3',
      createdAt: getRelativeIsoDate(0, 10)
    },
    {
      id: 'task-5',
      title: 'Lire la documentation sur les nouveautés CSS 2026',
      completed: false,
      priority: 'basse',
      isToday: false,
      projectId: 'proj-2',
      createdAt: getRelativeIsoDate(1, 10)
    },
    // Historical completed tasks over the last 6 days for rich chart visualization
    {
      id: 'hist-1',
      title: 'Configurer l\'architecture Tailwind et la palette Zinc',
      completed: true,
      priority: 'haute',
      isToday: false,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(1, 9),
      completedAt: getRelativeIsoDate(1, 16)
    },
    {
      id: 'hist-2',
      title: 'Nettoyer le cache local et tester les timeouts',
      completed: true,
      priority: 'moyenne',
      isToday: false,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(1, 11),
      completedAt: getRelativeIsoDate(1, 17)
    },
    {
      id: 'hist-3',
      title: 'Synthèse des modèles d\'IA générative multimodale',
      completed: true,
      priority: 'haute',
      isToday: false,
      projectId: 'proj-2',
      createdAt: getRelativeIsoDate(2, 9),
      completedAt: getRelativeIsoDate(2, 14)
    },
    {
      id: 'hist-4',
      title: 'Valider le schéma JSON pour l\'export des sauvegardes',
      completed: true,
      priority: 'moyenne',
      isToday: false,
      projectId: 'proj-3',
      createdAt: getRelativeIsoDate(2, 11),
      completedAt: getRelativeIsoDate(2, 15)
    },
    {
      id: 'hist-5',
      title: 'Création des composants UI pour la saisie rapide',
      completed: true,
      priority: 'haute',
      isToday: false,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(2, 13),
      completedAt: getRelativeIsoDate(2, 18)
    },
    {
      id: 'hist-6',
      title: 'Audit de performance Lighthouse sur desktop et mobile',
      completed: true,
      priority: 'moyenne',
      isToday: false,
      projectId: 'proj-4',
      createdAt: getRelativeIsoDate(3, 8),
      completedAt: getRelativeIsoDate(3, 11)
    },
    {
      id: 'hist-7',
      title: 'Tests unitaires sur les règles de tri des priorités',
      completed: true,
      priority: 'haute',
      isToday: false,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(3, 10),
      completedAt: getRelativeIsoDate(3, 15)
    },
    {
      id: 'hist-8',
      title: 'Mise en place des raccourcis clavier pour l\'ajout rapide',
      completed: true,
      priority: 'moyenne',
      isToday: false,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(3, 14),
      completedAt: getRelativeIsoDate(3, 17)
    },
    {
      id: 'hist-9',
      title: 'Création du guide d\'utilisation hors-connexion',
      completed: true,
      priority: 'basse',
      isToday: false,
      createdAt: getRelativeIsoDate(4, 9),
      completedAt: getRelativeIsoDate(4, 12)
    },
    {
      id: 'hist-10',
      title: 'Optimisation des contrastes WCAG AA sur le thème sombre',
      completed: true,
      priority: 'moyenne',
      isToday: false,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(4, 10),
      completedAt: getRelativeIsoDate(4, 16)
    },
    {
      id: 'hist-11',
      title: 'Revue de sécurité des dépendances npm',
      completed: true,
      priority: 'haute',
      isToday: false,
      projectId: 'proj-4',
      createdAt: getRelativeIsoDate(5, 9),
      completedAt: getRelativeIsoDate(5, 14)
    },
    {
      id: 'hist-12',
      title: 'Initialisation du dépôt Git et structure du projet',
      completed: true,
      priority: 'haute',
      isToday: false,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(6, 8),
      completedAt: getRelativeIsoDate(6, 11)
    },
    {
      id: 'hist-13',
      title: 'Définition des types TypeScript et contrats de données',
      completed: true,
      priority: 'moyenne',
      isToday: false,
      projectId: 'proj-1',
      createdAt: getRelativeIsoDate(6, 10),
      completedAt: getRelativeIsoDate(6, 17)
    }
  ],
  links: [
    {
      id: 'link-1',
      title: 'GitHub Repositories',
      url: 'https://github.com',
      category: 'Développement',
      description: 'Accès rapide au code source, pull requests et tickets.',
      isFavorite: true,
      clicks: 34
    },
    {
      id: 'link-2',
      title: 'Tailwind CSS Documentation',
      url: 'https://tailwindcss.com/docs',
      category: 'Développement',
      description: 'Classes utilitaires, composants et bonnes pratiques CSS.',
      isFavorite: true,
      clicks: 28
    },
    {
      id: 'link-3',
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      category: 'Développement',
      description: 'Référence JavaScript, APIs web et standards HTML/CSS.',
      isFavorite: false,
      clicks: 19
    },
    {
      id: 'link-4',
      title: 'Google Drive & Documents',
      url: 'https://drive.google.com',
      category: 'Outils & SaaS',
      description: 'Feuilles de calcul, documents partagés et rapports.',
      isFavorite: true,
      clicks: 45
    },
    {
      id: 'link-5',
      title: 'Hacker News / Tech Watch',
      url: 'https://news.ycombinator.com',
      category: 'Veille & Docs',
      description: 'Discussions tech mondiales et actualités logicielles.',
      isFavorite: false,
      clicks: 12
    },
    {
      id: 'link-6',
      title: 'Figma Community & Designs',
      url: 'https://www.figma.com',
      category: 'Outils & SaaS',
      description: 'Maquettes vectorielles, prototypes et design systems.',
      isFavorite: true,
      clicks: 22
    }
  ],
  notes: [
    {
      id: 'note-1',
      title: 'Points clés réunion matinale',
      content: '1. Prioriser l\'ergonomie mobile et le rendu sans débordement.\n2. Stocker les données hors-ligne via localStorage pour une réactivité instantanée.\n3. Ajouter un bouton de sauvegarde/export JSON en 1 clic.',
      isPinned: true,
      color: 'blue',
      updatedAt: '2026-09-27 10:45'
    },
    {
      id: 'note-2',
      title: 'Commandes utiles terminal',
      content: 'git status -s\nnpm run build\ndocker compose up -d\ngrep -rn "TODO" ./src',
      isPinned: false,
      color: 'emerald',
      updatedAt: '2026-09-26 18:20'
    },
    {
      id: 'note-3',
      title: 'Idée d\'amélioration',
      content: 'Permettre de lier directement une tâche à un projet pour recalculer la progression automatiquement.',
      isPinned: false,
      color: 'amber',
      updatedAt: '2026-09-25 14:10'
    }
  ]
};

export function loadStoredData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialData;
    const parsed = JSON.parse(raw);
    if (parsed) {
      const addressBook = Array.isArray(parsed.addressBook) && parsed.addressBook.length > 0 
        ? parsed.addressBook 
        : (Array.isArray(parsed.addressBook) ? [] : initialData.addressBook);
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : (initialData.tasks || []);
      const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
      const links = Array.isArray(parsed.links) ? parsed.links : [];
      const notes = Array.isArray(parsed.notes) ? parsed.notes : [];

      return {
        addressBook,
        tasks,
        projects,
        links,
        notes
      };
    }
    return initialData;
  } catch (err) {
    console.error('Erreur lecture localStorage:', err);
    return initialData;
  }
}

export function saveStoredData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erreur écriture localStorage:', err);
  }
}

export function exportDataAsJson(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `espace-numerique-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateStandaloneHtml(data: AppData): string {
  const serialized = JSON.stringify(data).replace(/<\/script>/g, '<\\/script>');
  return `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Espace Numérique Quotidien</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(161,161,170,0.25); border-radius: 9999px; }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen antialiased flex flex-col">
  <!-- En-tête -->
  <header class="border-b border-zinc-800/80 bg-zinc-900/60 sticky top-0 z-30 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
          EN
        </div>
        <span class="text-base font-semibold tracking-tight text-white">Espace Numérique</span>
        <span class="hidden sm:inline text-xs text-zinc-500">· Sauvegarde locale</span>
      </div>
      <div class="flex items-center gap-2">
        <span id="clock" class="text-xs font-mono tabular-nums text-zinc-400 bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-800">--:--</span>
        <button onclick="downloadBackup()" class="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-lg border border-zinc-700/60 transition-colors">
          Exporter JSON
        </button>
      </div>
    </div>
  </header>

  <!-- Contenu Principal -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
    <!-- Cartes Récapitulatives -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-4">
        <p class="text-xs font-medium text-zinc-400">Carnet d’adresses</p>
        <p id="stat-address" class="text-2xl font-semibold text-white mt-1 font-mono tabular-nums">0</p>
        <p class="text-xs text-zinc-500 mt-1">Entrées synchronisées</p>
      </div>
      <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-4">
        <p class="text-xs font-medium text-zinc-400">Projets en cours</p>
        <p id="stat-projects" class="text-2xl font-semibold text-indigo-400 mt-1 font-mono tabular-nums">0</p>
        <p class="text-xs text-zinc-500 mt-1">Actifs et suivis</p>
      </div>
      <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-4">
        <p class="text-xs font-medium text-zinc-400">Liens & Favoris</p>
        <p id="stat-links" class="text-2xl font-semibold text-emerald-400 mt-1 font-mono tabular-nums">0</p>
        <p class="text-xs text-zinc-500 mt-1">Ressources numériques</p>
      </div>
      <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-4">
        <p class="text-xs font-medium text-zinc-400">Notes rapides</p>
        <p id="stat-notes" class="text-2xl font-semibold text-amber-400 mt-1 font-mono tabular-nums">0</p>
        <p class="text-xs text-zinc-500 mt-1">Mémos enregistrés</p>
      </div>
    </section>

    <!-- Grille Principale 2 Colonnes -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Colonne Gauche: Carnet d'adresses et Projets (7 colonnes) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Carnet d'adresses -->
        <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-white">Carnet d’adresses</h2>
            <button onclick="promptNewAddressEntry()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
              + Ajouter
            </button>
          </div>
          <!-- Tableau Desktop & Cartes Mobile -->
          <div id="address-container"></div>
        </div>

        <!-- Projets -->
        <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-white">Suivi de Projets</h2>
            <button onclick="promptNewProject()" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              + Nouveau projet
            </button>
          </div>
          <div id="projects-list" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
        </div>
      </div>

      <!-- Colonne Droite: Liens et Notes (5 colonnes) -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Liens Favoris -->
        <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-white">Liens Favoris & Outils</h2>
            <button onclick="promptNewLink()" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              + Ajouter un lien
            </button>
          </div>
          <div id="links-list" class="space-y-2.5"></div>
        </div>

        <!-- Notes Rapides -->
        <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-white">Notes Rapides</h2>
            <button onclick="promptNewNote()" class="text-xs text-amber-400 hover:text-amber-300 font-medium">
              + Nouvelle note
            </button>
          </div>
          <div id="notes-list" class="space-y-3"></div>
        </div>
      </div>
    </div>
  </main>

  <script>
    const INITIAL_DATA = ${serialized};
    let appData = null;
    let taskFilter = 'all';

    function init() {
      try {
        const stored = localStorage.getItem('espace_numerique_storage_v1');
        appData = stored ? JSON.parse(stored) : INITIAL_DATA;
      } catch(e) {
        appData = INITIAL_DATA;
      }
      renderAll();
      updateClock();
      setInterval(updateClock, 1000);
    }

    function save() {
      localStorage.setItem('espace_numerique_storage_v1', JSON.stringify(appData));
      renderAll();
    }

    function updateClock() {
      const now = new Date();
      document.getElementById('clock').textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function renderAll() {
      renderStats();
      renderAddressBook();
      renderProjects();
      renderLinks();
      renderNotes();
    }

    function renderStats() {
      const addressCount = (appData.addressBook || []).length;
      document.getElementById('stat-address').textContent = addressCount;
      document.getElementById('stat-projects').textContent = appData.projects.filter(p => p.status === 'en_cours').length;
      document.getElementById('stat-links').textContent = appData.links.length;
      document.getElementById('stat-notes').textContent = appData.notes.length;
    }

    function renderAddressBook() {
      const container = document.getElementById('address-container');
      const list = appData.addressBook || [];

      if (list.length === 0) {
        container.innerHTML = '<p class="text-xs text-zinc-500 py-6 text-center">Aucune entrée dans le carnet d’adresses. Cliquez sur "+ Ajouter" pour en créer une.</p>';
        return;
      }

      container.innerHTML = \`
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr class="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th style="width: 45%" class="py-2 px-3">Nom</th>
                <th style="width: 20%" class="py-2 px-2">Clé</th>
                <th style="width: 20%" class="py-2 px-2">Nature</th>
                <th style="width: 15%" class="py-2 px-2">Notification</th>
                <th style="width: 50px" class="py-2 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/60 text-zinc-200">
              \${list.map(e => \\\`
                <tr class="hover:bg-zinc-800/40 transition-colors">
                  <td class="py-2.5 px-3 font-medium text-white break-words">\\\${escapeHtml(e.name || '—')}</td>
                  <td class="py-2.5 px-2 font-mono text-zinc-300 break-words">\\\${escapeHtml(e.key || '—')}</td>
                  <td class="py-2.5 px-2 break-words">\\\${escapeHtml(e.nature || '—')}</td>
                  <td class="py-2.5 px-2 text-zinc-400 break-words">\\\${escapeHtml(e.notification || '—')}</td>
                  <td class="py-2.5 px-2 text-right whitespace-nowrap">
                    <button onclick="editAddressEntry('\\\\\${e.id}')" class="text-indigo-400 hover:text-indigo-300 px-1 text-xs">✏️</button>
                    <button onclick="deleteAddressEntry('\\\\\${e.id}')" class="text-zinc-500 hover:text-red-400 px-1 text-xs">🗑️</button>
                  </td>
                </tr>
              \\\`).join('')}
            </tbody>
          </table>
        </div>
      \`;
    }

    function promptNewAddressEntry() {
      const name = prompt('Nom (facultatif) :') || '';
      const key = prompt('Clé (facultatif) :') || '';
      const nature = prompt('Nature (facultatif) :') || '';
      const notification = prompt('Notification (facultatif) :') || '';

      if (!appData.addressBook) appData.addressBook = [];
      appData.addressBook.unshift({
        id: 'addr-' + Date.now(),
        name: name.trim(),
        key: key.trim(),
        nature: nature.trim(),
        notification: notification.trim(),
        createdAt: new Date().toISOString()
      });
      save();
    }

    function editAddressEntry(id) {
      const entry = (appData.addressBook || []).find(x => x.id === id);
      if (!entry) return;

      const name = prompt('Nom :', entry.name || '');
      if (name === null) return;
      const key = prompt('Clé :', entry.key || '');
      if (key === null) return;
      const nature = prompt('Nature :', entry.nature || '');
      if (nature === null) return;
      const notification = prompt('Notification :', entry.notification || '');
      if (notification === null) return;

      entry.name = name.trim();
      entry.key = key.trim();
      entry.nature = nature.trim();
      entry.notification = notification.trim();
      save();
    }

    function deleteAddressEntry(id) {
      if (confirm('Voulez-vous vraiment supprimer cette entrée ?')) {
        appData.addressBook = (appData.addressBook || []).filter(x => x.id !== id);
        save();
      }
    }

    function renderProjects() {
      const container = document.getElementById('projects-list');
      if (appData.projects.length === 0) {
        container.innerHTML = '<p class="text-xs text-zinc-500 py-4 col-span-2 text-center">Aucun projet.</p>';
        return;
      }
      container.innerHTML = appData.projects.map(p => {
        const statusLabel = p.status === 'en_cours' ? 'En cours' : (p.status === 'termine' ? 'Terminé' : 'En attente');
        const statusColor = p.status === 'en_cours' ? 'text-emerald-400' : (p.status === 'termine' ? 'text-zinc-400' : 'text-amber-400');
        return \`
          <div class="p-3.5 bg-zinc-950/60 rounded-lg border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>\${escapeHtml(p.category)}</span>
                <span class="\${statusColor} font-medium">\${statusLabel}</span>
              </div>
              <h3 class="text-sm font-medium text-white truncate">\${escapeHtml(p.title)}</h3>
              <p class="text-xs text-zinc-400 line-clamp-2 mt-1">\${escapeHtml(p.description)}</p>
            </div>
            <div class="mt-3">
              <div class="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Progression</span>
                <span class="font-mono tabular-nums text-zinc-300">\${p.progress}%</span>
              </div>
              <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full rounded-full" style="width: \${p.progress}%"></div>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function promptNewProject() {
      const title = prompt('Titre du projet :');
      if (!title) return;
      const desc = prompt('Description sommaire :') || '';
      appData.projects.unshift({
        id: 'p-' + Date.now(),
        title: title,
        description: desc,
        category: 'Projet',
        status: 'en_cours',
        progress: 0,
        dueDate: '',
        tags: []
      });
      save();
    }

    function renderLinks() {
      const container = document.getElementById('links-list');
      if (appData.links.length === 0) {
        container.innerHTML = '<p class="text-xs text-zinc-500 py-3 text-center">Aucun lien enregistré.</p>';
        return;
      }
      container.innerHTML = appData.links.map(l => \`
        <div class="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-colors">
          <div class="overflow-hidden pr-2">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-medium text-white truncate">\${escapeHtml(l.title)}</h4>
              <span class="text-xs text-zinc-500">· \${escapeHtml(l.category)}</span>
            </div>
            <p class="text-xs text-zinc-400 truncate mt-0.5">\${escapeHtml(l.description || l.url)}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a href="\${l.url}" target="_blank" rel="noopener noreferrer" 
              class="px-2.5 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded border border-indigo-500/30 transition-colors">
              Ouvrir ↗
            </a>
            <button onclick="deleteLink('\${l.id}')" class="text-zinc-500 hover:text-red-400 px-1 text-xs">×</button>
          </div>
        </div>
      \`).join('');
    }

    function promptNewLink() {
      const url = prompt('URL du lien (ex: https://...) :');
      if (!url) return;
      const title = prompt('Titre de la ressource :') || url;
      const category = prompt('Catégorie (Outils, Dév, Veille...) :') || 'Général';
      appData.links.unshift({
        id: 'l-' + Date.now(),
        title: title,
        url: url,
        category: category,
        description: '',
        isFavorite: true,
        clicks: 0
      });
      save();
    }

    function deleteLink(id) {
      appData.links = appData.links.filter(x => x.id !== id);
      save();
    }

    function renderNotes() {
      const container = document.getElementById('notes-list');
      if (appData.notes.length === 0) {
        container.innerHTML = '<p class="text-xs text-zinc-500 py-3 text-center">Aucune note rapide.</p>';
        return;
      }
      container.innerHTML = appData.notes.map(n => \`
        <div class="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
          <div class="flex items-center justify-between mb-1.5">
            <h4 class="text-sm font-semibold text-zinc-200 truncate">\${escapeHtml(n.title)}</h4>
            <div class="flex items-center gap-2 text-xs text-zinc-500">
              <span class="font-mono tabular-nums">\${n.updatedAt}</span>
              <button onclick="deleteNote('\${n.id}')" class="hover:text-red-400">×</button>
            </div>
          </div>
          <p class="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">\${escapeHtml(n.content)}</p>
        </div>
      \`).join('');
    }

    function promptNewNote() {
      const title = prompt('Titre de la note :');
      if (!title) return;
      const content = prompt('Contenu :') || '';
      const now = new Date();
      const timeStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      appData.notes.unshift({
        id: 'n-' + Date.now(),
        title: title,
        content: content,
        isPinned: false,
        color: 'blue',
        updatedAt: timeStr
      });
      save();
    }

    function deleteNote(id) {
      appData.notes = appData.notes.filter(x => x.id !== id);
      save();
    }

    function downloadBackup() {
      const jsonStr = JSON.stringify(appData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'espace-numerique-backup.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function escapeHtml(text) {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    window.onload = init;
  </script>
</body>
</html>`;
}
