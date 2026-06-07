const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

/*
For setting API name etc
*/
const title = "EH PI AY DOANG";
const favicon = "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg?format=png&name=900x900";
const logo = "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg";
const headertitle = "REST EH PI AY";
const headerdescription = "Kumpulan API Endpoint yang mungkin berguna.";
const footer = "© SHIKAKU IYAYN AJAH";

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
const endpointDirs = fs.readdirSync(apiPath).filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());

for (const category of endpointDirs) {
  const categoryPath = path.join(apiPath, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const routeName = path.basename(file, '.js');
    const route = require(path.join(categoryPath, file));
    router.use(`/${category}/${routeName}`, route);
  }
}

function getEndpointsFromRouter(category, file) {
  const endpoints = [];
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
          [...fnString.matchAll(/req\.query\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            params[match[1]] = "";
          });
          [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            params[match[1]] = "";
          });
        });
      }
      endpoints.push({
        name: `/${category}/${file.replace(/\.js$/,"")}`,
        path: `/api/${category}/${file.replace(/\.js$/,"")}`,
        desc: `/${category}/${file.replace(/\.js$/,"")}`,
        status: "ready",
        params,
        methods
      });
    }
  });
  return endpoints;
}

// Tambahkan variabel cache di luar fungsi
let cachedApiList = null;

router.get('/apilist', (req, res) => {
  // 1. Jika data cache sudah ada, langsung kirimkan datanya (Sangat Cepat)
  if (cachedApiList) {
    return res.json({ categories: cachedApiList });
  }

  // 2. Jika belum ada, proses membaca folder seperti biasa
  const categories = [];

  for (const category of endpointDirs) {
    const files = fs.readdirSync(path.join(apiPath, category)).filter(f => f.endsWith('.js'));
    const endpoints = [];
    for (const file of files) {
      endpoints.push(...getEndpointsFromRouter(category, file));
    }
    if (endpoints.length) {
      categories.push({
        name: `${category.toUpperCase()} API ENDPOINT`,
        items: endpoints
      });
    }
  }

  categories.push({
    name: "OTHER",
    items: [
      {
        name: "/apilist",
        path: "/api/apilist",
        desc: "/apilist",
        status: "ready",
        params: {},
        methods: ["GET"]
      }
    ]
  });

  // 3. Simpan hasilnya ke variabel cache sebelum dikirim
  cachedApiList = categories;

  res.json({ categories });
});


app.use('/api', router);

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.get('/linkbio.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'linkbio.json'));
});
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

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
        .light-mode .music-player-card {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .light-mode .music-text-title {
            color: #1e293b !important;
        }
        .light-mode .music-text-artist {
            color: #475569 !important;
        }
        .light-mode .music-progress-bar-bg {
            background-color: #e2e8f0 !important;
        }
        .light-mode .music-btn-nav {
            background-color: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #334155 !important;
        }
        .light-mode .music-btn-nav:hover {
            background-color: #e2e8f0 !important;
            color: #0f172a !important;
        }
        .light-mode .music-playlist-border {
            border-color: #e2e8f0 !important;
        }
        
        /* Brutalist Toggle Language Switcher */
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
            background-color: #eab308;
            color: #000000;
            box-shadow: 2px 2px 0px #000000;
        }
    </style>
</head>
<body class="min-h-screen antialiased">
    <div id="toast" class="toast">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-50">
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0f141c] text-slate-400 hover:text-white border border-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 focus:outline-none" aria-label="Open Navigation Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#0a0f18] border-l-2 border-[#161f30] transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col p-6 font-['Space_Grotesk']">
        <div class="flex items-center justify-between mb-8">
            <div class="flex gap-0 border border-black p-0.5 bg-[#111]">
                <button id="lang-id" class="lang-btn active" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn" onclick="setLanguage('en')">EN</button>
            </div>
            
            <div class="flex items-center gap-2">
                <button id="themeToggle" class="flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-95 focus:outline-none border" aria-label="Toggle theme">
                    <svg id="theme-toggle-dark-icon" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                    <svg id="theme-toggle-light-icon" class="w-4 h-4 text-black hidden" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
                    </svg>
                </button>

                <button id="closeMenuBtn" class="text-white hover:text-red-400 transition-colors p-1.5 border border-slate-800 rounded bg-[#111622]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <nav class="flex flex-col gap-5 text-sm font-bold tracking-wider uppercase text-gray-300">
            <a href="#api" class="menu-link hover:text-yellow-400 transition-colors flex items-center gap-2">HOME</a>
            <a href="#apiList" class="menu-link hover:text-yellow-400 transition-colors flex items-center gap-2">DOCUMENTATION</a>
            <a href="#" class="menu-link hover:text-yellow-400 transition-colors flex items-center gap-2">FILE UPLOADER</a>
            <a href="#" class="menu-link hover:text-yellow-400 transition-colors flex items-center gap-2">PASTEBIN</a>
            
            <hr class="border-slate-800 my-2">
            
            <a href="#" class="menu-link hover:text-yellow-400 transition-colors flex items-center gap-2 text-xs opacity-80">BUG REPORT</a>
            <a href="#" class="menu-link hover:text-yellow-400 transition-colors flex items-center gap-2 text-xs opacity-80">PRIVACY POLICY</a>
            <a href="#" class="menu-link hover:text-yellow-400 transition-colors flex items-center gap-2 text-xs opacity-80">TERMS OF SERVICE</a>
        </nav>

        <div class="mt-8 flex-1 overflow-y-auto">
            <h3 class="text-[10px] font-bold tracking-widest uppercase mb-3 text-slate-500 code-font">DYNAMIC LINK BIO</h3>
            <div id="socialContainer" class="flex flex-col gap-2">
                <div id="socialLoading" class="text-center py-2 w-full">
                    <p class="text-xs text-slate-600">Loading...</p>
                </div>
                <div id="socialError" class="text-center py-2 w-full hidden">
                    <p class="text-[10px] text-red-400">Link bio tidak tersedia.</p>
                </div>
            </div>
        </div>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-40 transition-opacity duration-300"></div>

    <div class="max-w-5xl mx-auto px-4 py-8">
        <header id="api" class="mb-12">
            <div class="mb-6 flex justify-center">
                <img id="logoImg" src="${logo}" alt="Logo" class="w-full max-w-sm rounded-xl shadow-xl hover:scale-105 transition-all duration-300">
            </div>
            <h1 id="mainTitle" class="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-wider text-center gray-gradient-text">${headertitle}</h1>
            <p id="mainDescription" class="text-lg font-light tracking-wide text-center text-gray-300 light-mode:text-gray-600">${headerdescription}</p>
            
            <div class="mt-8 flex flex-wrap justify-center items-center gap-4 md:gap-8">
                <div class="stats-card flex items-center gap-3 px-4 py-3 rounded-lg">
                    <div class="flex flex-col items-center">
                        <span id="stat-battery-title" class="text-xs font-medium stats-text-secondary">Baterai Anda</span>
                        <div class="flex items-center gap-2 mt-1">
                            <div id="batteryContainer" class="battery-container">
                                <div id="batteryLevel" class="battery-level bg-green-500" style="width: 0%"></div>
                                <div class="battery-tip"></div>
                            </div>
                            <div class="flex flex-col items-start">
                                <span id="batteryPercentage" class="text-sm font-bold">0%</span>
                                <span id="batteryStatus" class="battery-status-text stats-text-secondary">Mendeteksi...</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stats-card flex items-center gap-3 px-4 py-3 rounded-lg">
                    <div class="flex flex-col items-center">
                        <span id="stat-endpoints-title" class="text-xs font-medium stats-text-secondary">Total Endpoint</span>
                        <span id="totalEndpoints" class="text-lg font-bold">0</span>
                    </div>
                </div>
                
                <div class="stats-card flex items-center gap-3 px-4 py-3 rounded-lg">
                    <div class="flex flex-col items-center">
                        <span id="stat-categories-title" class="text-xs font-medium stats-text-secondary">Total Kategori</span>
                        <span id="totalCategories" class="text-lg font-bold">0</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 h-1 w-32 mx-auto bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 rounded-full"></div>

            <div class="music-player-card mt-8 max-w-2xl mx-auto bg-[#090e1a] border border-slate-800/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden transition-all duration-300">
                <audio id="audioElement"></audio>
                
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-800">
                            <img id="musicCoverImg" src="" alt="Cover" class="w-full h-full object-cover transition-transform duration-500">
                        </div>
                        
                        <div class="flex-1 min-w-0">
                            <h3 id="musicTitle" class="music-text-title text-white font-bold text-sm tracking-wider uppercase truncate m-0">Loading...</h3>
                            <p id="musicArtist" class="music-text-artist text-gray-400 text-xs font-semibold tracking-wide truncate mt-0.5">-</p>
                            
                            <div class="flex items-center gap-2 mt-2">
                                <span id="currentTime" class="text-[10px] text-gray-500 code-font w-7 text-left">0:00</span>
                                <div id="progressContainer" class="music-progress-bar-bg flex-1 h-1 bg-slate-800 rounded-full relative cursor-pointer group">
                                    <div id="progressBar" class="h-full bg-blue-600 rounded-full w-0 transition-all duration-300"></div>
                                </div>
                                <span id="totalDuration" class="text-[10px] text-gray-500 code-font w-7 text-right">0:00</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <button id="prevBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center bg-[#0e1629] border border-slate-800 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>
                        <button id="playBtn" class="music-btn-nav w-10 h-10 flex items-center justify-center bg-[#0e1629] border border-slate-800 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95">
                            <svg id="playIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        <button id="nextBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center bg-[#0e1629] border border-slate-800 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-10.5 12l8.5-6-8.5-6z"/></svg>
                        </button>
                        <button id="playlistToggleBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center bg-[#0e1629] border border-slate-800 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                    </div>
                </div>
                
                <div id="playlistPanel" class="music-playlist-border hidden mt-4 pt-4 border-t border-slate-800/60 max-h-40 overflow-y-auto space-y-1">
                </div>
            </div>
        </header>

        <div class="mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint berdasarkan nama, path, atau kategori..."
                    class="search-input w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-blue-500 transition-all code-font"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">🔍</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-gray-700 light-mode:border-gray-300 text-center text-xs">
            ${footer}
        </footer>
    </div>
<script class="notranslate" translate="no">
    window.musicPlaylist = ${JSON.stringify(playlist)};
</script>
<script src="script.js"></script>
</body>
</html>
    `);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;