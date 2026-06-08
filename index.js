const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

/* Configuration & Brand Metadata */
const title = "API-ARULZXD - REST";
const favicon = "https://arulz-uploader.vercel.app/files/C5VYmq.jpg";
const logo = "https://arulz-uploader.vercel.app/files/SnhJe3.png";
const headertitle = "API Arulz-XD";
const headerdescription = "Browse, inspect & fire requests against live endpoints._";
const footer = "© Arulz-XD";

// === KONFIGURASI PLAYLIST BANYAK MUSIK ===
const playlist = [
  {
    title: "PAMIT KERJO",
    artist: "NDX. AKA",
    cover: "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg",
    url: "https://files.catbox.moe/gfuwnv.mp3"
  },
  {
    title: "TANPO HUBUNGAN",
    artist: "LA TASYA",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop",
    url: "https://files.catbox.moe/xd5oq3.mp3"
  },
  {
    title: "DJ CIDRO 2",
    artist: "TIDAK DIKETAHUI",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop",
    url: "https://files.catbox.moe/u30w9k.mp3"
  }
];

const router = express.Router();
const apiPath = path.join(__dirname, 'api');

// Membaca direktori kategori di dalam folder api secara asinkronus/sinkronus awal
let endpointDirs = [];
if (fs.existsSync(apiPath)) {
  endpointDirs = fs.readdirSync(apiPath).filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());
}

// Daftarkan route API secara otomatis berdasarkan struktur folder
for (const category of endpointDirs) {
  const categoryPath = path.join(apiPath, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const routeName = path.basename(file, '.js');
    const route = require(path.join(categoryPath, file));
    router.use(`/${category}/${routeName}`, route);
  }
}

// Parser parameter internal dari script middleware untuk dimasukkan ke dashboard UI
function getEndpointsFromRouter(category, file) {
  const endpoints = [];
  try {
    const route = require(path.join(apiPath, category, file));
    const subRouter = route.stack ? route : route.router || route;
    if (!subRouter || !subRouter.stack) return endpoints;

    subRouter.stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        let params = {};
        if (layer.route.stack && layer.route.stack.length) {
          layer.route.stack.forEach(mw => {
            const fnString = mw.handle.toString();
            // Melakukan ekstraksi otomatis req.query dan req.body dari string fungsi
            [...fnString.matchAll(/req\.query\.([a-zA-Z0-9_]+)/g)].forEach(match => {
              params[match[1]] = "";
            });
            [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
              params[match[1]] = "";
            });
          });
        }
        endpoints.push({
          name: `/${category}/${file.replace(/\.js$/, "")}`,
          path: `/api/${category}/${file.replace(/\.js$/, "")}`,
          desc: `/${category}/${file.replace(/\.js$/, "")}`,
          status: "ready",
          params,
          methods
        });
      }
    });
  } catch (err) {
    console.error(`Gagal memuat parameter endpoint dari ${file}:`, err);
  }
  return endpoints;
}

// Endpoint JSON untuk mensuplai data ke UI dashboard utama
router.get('/apilist', (req, res) => {
  const categories = [];

  for (const category of endpointDirs) {
    const files = fs.readdirSync(path.join(apiPath, category)).filter(f => f.endsWith('.js'));
    const endpoints = [];
    for (const file of files) {
      endpoints.push(...getEndpointsFromRouter(category, file));
    }
    if (endpoints.length) {
      categories.push({
        name: `${category.toUpperCase()}`,
        items: endpoints
      });
    }
  }

  // Tambahkan kategori utilitas bawaan
  categories.push({
    name: "OTHER",
    items: [
      {
        name: "/apilist",
        path: "/api/apilist",
        desc: "Melihat daftar semua endpoint dalam format JSON RAW",
        status: "ready",
        params: {},
        methods: ["GET"]
      }
    ]
  });

  res.json({ categories });
});

app.use('/api', router);

// Pengarah aset statis eksplisit
app.get('/script.js', (req, res) => res.sendFile(path.join(__dirname, 'script.js')));
app.get('/linkbio.json', (req, res) => res.sendFile(path.join(__dirname, 'linkbio.json')));
app.get('/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'styles.css')));

// Handler Halaman Utama Dashboard
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en" class="notranslate" translate="no">
<head>
    <meta charset="UTF-8" />
    <meta name="google" content="notranslate" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
    <link id="faviconLink" rel="icon" type="image/x-icon" href="${favicon}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css" />
    
    <style>
        body {
            transition: background 0.25s ease, color 0.25s ease;
        }
        .glass-panel {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            will-change: transform, opacity;
        }
        .light-mode .glass-panel {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(15, 23, 42, 0.12);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
        }
        .light-mode {
            color: #0f172a !important;
        }
        .light-mode #mainTitle { color: #0f172a !important; }
        .light-mode #mainDescription { color: #334155 !important; }
        .light-mode #stat-battery-title,
        .light-mode #stat-endpoints-title,
        .light-mode #stat-categories-title { color: #475569 !important; }
        .light-mode #siteFooter { color: #64748b !important; border-color: rgba(0,0,0,0.1); }
        .light-mode #no-results-title { color: #0f172a !important; }

        .lang-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 10px;
            border: 2px solid #000000;
            background-color: #1a1a1a;
            color: #ffffff;
            transition: all 0.15s ease;
        }
        .lang-btn.active {
            background-color: #06b6d4;
            color: #000000;
            box-shadow: 2px 2px 0px #000000;
        }
        .filter-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            padding: 6px 12px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.05);
            color: #e2e8f0;
            transition: all 0.2s ease;
            border-radius: 8px;
            white-space: nowrap;
            cursor: pointer;
        }
        .filter-btn:hover { background: rgba(255,255,255,0.15); }
        .filter-btn.active {
            background-color: #06b6d4 !important;
            color: #000000 !important;
            border-color: #06b6d4 !important;
            font-weight: bold;
        }
        .light-mode .filter-btn {
            border-color: rgba(0,0,0,0.15);
            background: rgba(0,0,0,0.04);
            color: #334155;
        }
        .light-mode .filter-btn:hover { background: rgba(0,0,0,0.08); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased bg-[#030712] text-slate-100 relative">

    <div id="themeBg" class="fixed inset-0 -z-50 bg-gradient-to-br from-[#070b12] via-[#0f172a] to-[#070b12] transition-all duration-500"></div>

    <div id="toast" class="toast z-50">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-40">
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl glass-panel text-slate-300 hover:text-white shadow-lg transition-all active:scale-95 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm hidden z-40"></div>
    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#08111e]/95 backdrop-blur-lg border-l border-white/10 transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col p-6 font-['Space_Grotesk']">
        <div class="flex items-center justify-between mb-8">
            <div class="flex gap-0 border border-black p-0.5 bg-[#111]">
                <button id="lang-id" class="lang-btn active" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn" onclick="setLanguage('en')">EN</button>
            </div>
            
            <div class="flex items-center gap-2">
                <button id="themeToggle" class="flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-95 focus:outline-none border border-white/20 bg-slate-900/50 text-white">
                    <svg id="theme-toggle-dark-icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                    <svg id="theme-toggle-light-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" fill-rule="evenodd" clip-rule="evenodd"></path>
                    </svg>
                </button>
                <button id="closeMenuBtn" class="text-slate-400 hover:text-white">&times;</button>
            </div>
        </div>
        <div class="flex flex-col items-center text-center border-b border-white/10 pb-6 mb-6">
             <img src="${logo}" class="w-20 h-20 rounded-full border-2 border-cyan-400 p-1 mb-3" alt="Logo">
             <h3 class="font-bold text-lg">${headertitle}</h3>
             <p class="text-xs text-slate-400 mt-1">Fullstack Node.js Ecosystem Developer</p>
        </div>
        <div class="space-y-3 social-badge">
             <a href="https://github.com/Arulzxd" target="_blank" class="block">
                 <div class="px-4 py-2 rounded-xl text-xs font-bold transition-colors border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10 text-center">GitHub Profile</div>
             </a>
        </div>
    </div>

    <main class="max-w-4xl mx-auto px-4 pt-16 pb-24">
        <header class="text-center md:text-left md:flex md:items-center md:justify-between mb-12 gap-6">
            <div>
                <h1 id="mainTitle" class="text-4xl font-extrabold tracking-tight font-['Space_Grotesk'] mb-2">${headertitle}</h1>
                <p id="mainDescription" class="text-slate-400 text-sm max-w-lg font-['JetBrains_Mono']">${headerdescription}</p>
            </div>
        </header>

        <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div class="glass-panel rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <h4 id="stat-battery-title" class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Baterai Anda</h4>
                    <span id="batteryPercentage" class="text-2xl font-bold font-['Space_Grotesk']">...</span>
                    <p id="batteryStatus" class="text-[10px] text-slate-500 mt-1 font-['JetBrains_Mono']">Mendeteksi...</p>
                </div>
                <div id="batteryContainer" class="w-12 h-6 border-2 border-slate-600 rounded p-0.5 relative">
                     <div id="batteryLevel" class="h-full bg-cyan-400" style="width: 0%"></div>
                </div>
            </div>
            <div class="glass-panel rounded-2xl p-4">
                <h4 id="stat-endpoints-title" class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Endpoint</h4>
                <span id="totalEndpoints" class="text-3xl font-bold text-cyan-400 font-['Space_Grotesk']">0</span>
            </div>
            <div class="glass-panel rounded-2xl p-4">
                <h4 id="stat-categories-title" class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Kategori</h4>
                <span id="totalCategories" class="text-3xl font-bold text-purple-400 font-['Space_Grotesk']">0</span>
            </div>
        </section>

        <div class="glass-panel rounded-2xl p-4 mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint berdasarkan nama, path, atau kategori..." 
                    class="w-full bg-slate-950/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-cyan-500 font-['JetBrains_Mono'] transition-colors"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start overflow-x-auto pb-2 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">🔍</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1 text-white">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-slate-400">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-500 font-['JetBrains_Mono']">
            ${footer}
        </footer>
    </main>

    <script src="script.js"></script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port http://localhost:${PORT}`);
});
