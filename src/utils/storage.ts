import { AppData } from '../types';

const STORAGE_KEY = 'espace_numerique_storage_v1';

const getRelativeIsoDate = (daysAgo: number, hour = 14) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 30, 0, 0);
  return d.toISOString();
};

export const initialData: AppData = {
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
      title: 'Intégrer le composant graphique Recharts pour les 7 derniers jours',
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
    if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.projects)) {
      return {
        tasks: parsed.tasks ?? [],
        projects: parsed.projects ?? [],
        links: parsed.links ?? [],
        notes: parsed.notes ?? []
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
        <p class="text-xs font-medium text-zinc-400">Tâches du jour</p>
        <p id="stat-tasks" class="text-2xl font-semibold text-white mt-1 font-mono tabular-nums">0 / 0</p>
        <p class="text-xs text-zinc-500 mt-1">Accomplies aujourd'hui</p>
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

    <!-- Visualisation d'activité des 7 derniers jours -->
    <section class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-base font-semibold text-white">Activité des Tâches (7 derniers jours)</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Nombre de tâches terminées chaque jour</p>
        </div>
        <div id="chart-total-kpi" class="text-xs text-indigo-400 font-mono font-medium"></div>
      </div>
      <div id="activity-chart" class="grid grid-cols-7 gap-2 pt-2 items-end h-36"></div>
    </section>

    <!-- Grille Principale 2 Colonnes -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Colonne Gauche: Tâches et Projets (7 colonnes) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Tâches -->
        <div class="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-white">Tâches Prioritaires</h2>
            <div class="flex items-center gap-1 text-xs">
              <button onclick="setTaskFilter('all')" id="btn-filter-all" class="px-2.5 py-1 rounded-md bg-zinc-800 text-white font-medium">Toutes</button>
              <button onclick="setTaskFilter('today')" id="btn-filter-today" class="px-2.5 py-1 rounded-md text-zinc-400 hover:text-white">Aujourd'hui</button>
              <button onclick="setTaskFilter('high')" id="btn-filter-high" class="px-2.5 py-1 rounded-md text-zinc-400 hover:text-white">Urgentes</button>
            </div>
          </div>
          <!-- Ajout tâche -->
          <div class="flex gap-2 mb-4">
            <input id="new-task-input" type="text" placeholder="Nouvelle tâche prioritaire (Appuyer sur Entrée)..." 
              class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              onkeydown="if(event.key==='Enter') addTask()">
            <select id="new-task-priority" class="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500">
              <option value="haute">Haute</option>
              <option value="moyenne" selected>Moyenne</option>
              <option value="basse">Basse</option>
            </select>
            <button onclick="addTask()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition-colors">
              Ajouter
            </button>
          </div>
          <div id="tasks-list" class="space-y-2"></div>
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
      renderActivityChart();
      renderTasks();
      renderProjects();
      renderLinks();
      renderNotes();
    }

    function renderActivityChart() {
      const chartEl = document.getElementById('activity-chart');
      const kpiEl = document.getElementById('chart-total-kpi');
      if (!chartEl) return;

      const now = new Date();
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const dayLabel = i === 0 ? "Auj." : d.toLocaleDateString('fr-FR', { weekday: 'short' });
        const count = appData.tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(dateKey)).length;
        days.push({ label: dayLabel, count: count });
      }

      const total = days.reduce((sum, d) => sum + d.count, 0);
      if (kpiEl) kpiEl.textContent = total + ' tâche' + (total > 1 ? 's' : '') + ' terminées sur 7j';

      const maxCount = Math.max(1, ...days.map(d => d.count));

      chartEl.innerHTML = days.map(d => {
        const pct = Math.max(8, Math.round((d.count / maxCount) * 100));
        return \`
          <div class="flex flex-col items-center h-full justify-end group">
            <span class="text-[10px] font-mono text-zinc-400 mb-1 group-hover:text-indigo-400 font-bold">\${d.count}</span>
            <div class="w-full max-w-[36px] bg-zinc-800 rounded-t-md overflow-hidden h-24 flex items-end">
              <div class="w-full bg-indigo-500 hover:bg-indigo-400 transition-all rounded-t-md" style="height: \${pct}%"></div>
            </div>
            <span class="text-[10px] text-zinc-500 mt-1 capitalize">\${d.label}</span>
          </div>
        \`;
      }).join('');
    }

    function renderStats() {
      const completedTasks = appData.tasks.filter(t => t.completed).length;
      document.getElementById('stat-tasks').textContent = completedTasks + ' / ' + appData.tasks.length;
      document.getElementById('stat-projects').textContent = appData.projects.filter(p => p.status === 'en_cours').length;
      document.getElementById('stat-links').textContent = appData.links.length;
      document.getElementById('stat-notes').textContent = appData.notes.length;
    }

    function setTaskFilter(filter) {
      taskFilter = filter;
      ['all', 'today', 'high'].forEach(f => {
        const btn = document.getElementById('btn-filter-' + f);
        if (f === filter) {
          btn.className = 'px-2.5 py-1 rounded-md bg-zinc-800 text-white font-medium';
        } else {
          btn.className = 'px-2.5 py-1 rounded-md text-zinc-400 hover:text-white';
        }
      });
      renderTasks();
    }

    function renderTasks() {
      const list = document.getElementById('tasks-list');
      let filtered = appData.tasks;
      if (taskFilter === 'today') filtered = filtered.filter(t => t.isToday);
      if (taskFilter === 'high') filtered = filtered.filter(t => t.priority === 'haute');

      if (filtered.length === 0) {
        list.innerHTML = '<p class="text-xs text-zinc-500 py-4 text-center">Aucune tâche dans cette vue.</p>';
        return;
      }

      list.innerHTML = filtered.map(t => {
        const badgeColor = t.priority === 'haute' ? 'text-red-400' : (t.priority === 'moyenne' ? 'text-amber-400' : 'text-zinc-400');
        const priorityLabel = t.priority === 'haute' ? 'Haute' : (t.priority === 'moyenne' ? 'Moyenne' : 'Basse');
        return \`
          <div class="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800/80 hover:border-zinc-700 transition-colors">
            <div class="flex items-center gap-3 overflow-hidden">
              <input type="checkbox" \${t.completed ? 'checked' : ''} onchange="toggleTask('\${t.id}')"
                class="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer">
              <span class="text-sm \${t.completed ? 'line-through text-zinc-500' : 'text-zinc-200'} truncate">\${escapeHtml(t.title)}</span>
            </div>
            <div class="flex items-center gap-3 shrink-0 text-xs">
              <span class="\${badgeColor} font-mono">\${priorityLabel}</span>
              <button onclick="deleteTask('\${t.id}')" class="text-zinc-500 hover:text-red-400 transition-colors">×</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function addTask() {
      const input = document.getElementById('new-task-input');
      const prioritySelect = document.getElementById('new-task-priority');
      const title = input.value.trim();
      if (!title) return;

      appData.tasks.unshift({
        id: 't-' + Date.now(),
        title: title,
        completed: false,
        priority: prioritySelect.value,
        isToday: true,
        createdAt: new Date().toISOString()
      });
      input.value = '';
      save();
    }

    function toggleTask(id) {
      const t = appData.tasks.find(x => x.id === id);
      if (t) {
        t.completed = !t.completed;
        t.completedAt = t.completed ? new Date().toISOString() : undefined;
        save();
      }
    }

    function deleteTask(id) {
      appData.tasks = appData.tasks.filter(x => x.id !== id);
      save();
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
