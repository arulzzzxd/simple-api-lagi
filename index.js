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
const title = "API Arulz-XD";
const favicon = "https://arulz-uploader.vercel.app/files/C5VYmq.jpg";
const logo = "https://arulz-uploader.vercel.app/files/SnhJe3.png";
const headertitle = "NANZAPI"; 
const headerdescription = "Kumpulan API Endpoint yang mungkin berguna.";
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
let endpointDirs = [];
if (fs.existsSync(apiPath)) {
    endpointDirs = fs.readdirSync(apiPath).filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());
    for (const category of endpointDirs) {
      const categoryPath = path.join(apiPath, category);
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
      for (const file of files) {
        const routeName = path.basename(file, '.js');
        const route = require(path.join(categoryPath, file));
        router.use(`/${category}/${routeName}`, route);
      }
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
  res.json({ categories });
});

app.use('/api', router);

app.get('/script.js', (req, res) => { res.sendFile(path.join(__dirname, 'script.js')); });
app.get('/linkbio.json', (req, res) => { res.sendFile(path.join(__dirname, 'linkbio.json')); });
app.get('/styles.css', (req, res) => { res.sendFile(path.join(__dirname, 'styles.css')); });

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
        /* Light mode global overrides */
        .light-mode {
            background-color: #f8fafc !important;
            color: #0f172a !important;
        }
        .light-mode .music-player-card {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
        }
        .light-mode .music-text-title { color: #1e293b !important; }
        .light-mode .music-text-artist { color: #64748b !important; }
        .light-mode .music-progress-bar-bg { background-color: #e2e8f0 !important; }
        .light-mode .music-btn-nav {
            background-color: #f8fafc !important;
            border-color: #e2e8f0 !important;
            color: #475569 !important;
        }
        .light-mode .music-btn-nav:hover { background-color: #f1f5f9 !important; color: #0f172a !important; }
        .light-mode .music-playlist-border { border-color: #e2e8f0 !important; }
        
        /* Brutalist Language Switcher */
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

        /* Filter Buttons Style */
        .filter-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: normal;
            padding: 6px 12px;
            border: 1px solid var(--border-color);
            background-color: transparent;
            color: var(--text-secondary);
            transition: all 0.2s ease;
            border-radius: 4px;
            white-space: nowrap;
            cursor: pointer;
        }
        .filter-btn:hover {
            border-color: var(--text-primary);
            color: var(--text-primary);
        }
        .filter-btn.active {
            background-color: #2ecc71; 
            color: #000000;
            border-color: #2ecc71;
            font-weight: bold;
        }
        .light-mode .filter-btn {
            border-color: #cbd5e1;
            color: #475569;
        }
        .light-mode .filter-btn:hover {
            border-color: #0f172a;
            color: #0f172a;
        }
        .light-mode .filter-btn.active {
            background-color: #2ecc71;
            color: #ffffff;
            border-color: #2ecc71;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased bg-[#0f141c] text-white">
    <div id="toast" class="toast">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-50">
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0f141c] light-mode:bg-white text-slate-400 hover:text-white light-mode:hover:text-slate-800 border border-slate-800/60 light-mode:border-slate-200 shadow-xl transition-all active:scale-95 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#0a0f18] light-mode:bg-white border-l-2 border-[#161f30] light-mode:border-slate-200 transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col p-6 font-['Space_Grotesk']">
        <div class="flex items-center justify-between mb-8">
            <div class="flex gap-0 border border-black p-0.5 bg-[#111]">
                <button id="lang-id" class="lang-btn active" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn" onclick="setLanguage('en')">EN</button>
            </div>
            
            <div class="flex items-center gap-2">
                <button id="themeToggle" class="flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-95 focus:outline-none border border-slate-800 light-mode:border-slate-200">
                    <svg id="theme-toggle-dark-icon" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                    <svg id="theme-toggle-light-icon" class="w-4 h-4 text-black hidden" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
                    </svg>
                </button>

                <button id="closeMenuBtn" class="text-white light-mode:text-slate-800 hover:text-red-400 p-1.5 border border-slate-800 light-mode:border-slate-200 rounded bg-[#111622] light-mode:bg-slate-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <nav class="flex flex-col gap-5 text-sm font-bold tracking-wider uppercase text-gray-300 light-mode:text-slate-600">
            <a href="#api" class="menu-link hover:text-yellow-400 transition-colors">HOME</a>
            <a href="#apiList" class="menu-link hover:text-yellow-400 transition-colors">DOCUMENTATION</a>
            <a href="#" class="menu-link hover:text-yellow-400 transition-colors">FILE UPLOADER</a>
            <a href="#" class="menu-link hover:text-yellow-400 transition-colors">PASTEBIN</a>
            <hr class="border-slate-800 light-mode:border-slate-200 my-2">
            <a href="#" class="menu-link hover:text-yellow-400 transition-colors text-xs opacity-80">BUG REPORT</a>
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

    <div class="max-w-4xl mx-auto px-4 py-8">
        <header id="api" class="relative mb-8 rounded-[2rem] overflow-hidden bg-cover bg-center shadow-2xl border border-slate-700/50" 
                style="background-image: url('https://images.unsplash.com/photo-1682687982501-1e5898cb8f4b?auto=format&fit=crop&q=80&w=1000');">
            
            <div class="absolute inset-0 bg-[#061121]/60 backdrop-blur-[4px] z-0"></div>

            <div class="relative z-10 p-8 text-white">
                <div class="flex justify-between items-start mb-10">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center border border-white/10 overflow-hidden">
                            <img id="dynamicLogo" src="${logo}" alt="Logo" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h2 class="text-xl font-black tracking-widest text-white uppercase">${headertitle}</h2>
                            <p class="text-[11px] text-gray-300 font-mono tracking-wide">v2.0 · REST Documentation</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span class="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">Online</span>
                    </div>
                </div>

                <h1 class="text-5xl md:text-[5.5rem] font-black mb-6 leading-[1.05] uppercase tracking-wide">
                    API Explorer<br>& Tester
                </h1>
                <p class="font-mono text-[13px] text-gray-300 mb-8 opacity-90 leading-relaxed max-w-sm">
                    <span class="text-[#00b4d8] font-bold">$</span> Browse, inspect & fire requests against live endpoints._
                </p>

                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-slate-800/30 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <div id="totalEndpoints" class="text-2xl md:text-3xl font-black mb-1 text-white">0</div>
                        <div class="font-mono text-[10px] text-gray-400 font-medium">// Endpoints</div>
                    </div>
                    <div class="bg-slate-800/30 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <div class="text-2xl md:text-3xl font-black mb-1 text-[#00b4d8]">REST</div>
                        <div class="font-mono text-[10px] text-gray-400 font-medium">// Protocol</div>
                    </div>
                    <div class="bg-slate-800/30 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                        <div id="batteryStatus" class="text-2xl md:text-3xl font-black mb-1 text-yellow-400">...</div>
                        <div id="batteryLabel" class="font-mono text-[10px] text-gray-400 font-medium">// Baterai</div>
                    </div>
                </div>

                <div class="flex items-center bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-4 mb-6">
                    <svg class="w-5 h-5 text-[#00b4d8] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                    </svg>
                    <div class="font-mono text-[13px] flex-1 truncate text-gray-300">
                        <span class="text-[#00b4d8]">https://api-nanzz.my.id</span>/docs/api/
                    </div>
                </div>

                <button class="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-black font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all duration-300 mb-4 shadow-[0_0_15px_rgba(0,180,216,0.4)]">
                    Request New Feature
                </button>
            </div>
        </header>

        <div class="music-player-card mb-12 max-w-4xl mx-auto bg-[#090e1a] border border-slate-800/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden transition-all duration-300">
            <audio id="audioElement"></audio>
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-800">
                        <img id="musicCoverImg" src="" alt="Cover" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 id="musicTitle" class="music-text-title text-white font-bold text-sm tracking-wider uppercase truncate m-0">Loading...</h3>
                        <p id="musicArtist" class="music-text-artist text-gray-400 text-xs font-semibold tracking-wide truncate mt-0.5">-</p>
                        <div class="flex items-center gap-2 mt-2">
                            <span id="currentTime" class="text-[10px] text-gray-500 code-font">0:00</span>
                            <div id="progressContainer" class="music-progress-bar-bg flex-1 h-1 bg-slate-800 rounded-full relative cursor-pointer">
                                <div id="progressBar" class="h-full bg-blue-600 rounded-full w-0"></div>
                            </div>
                            <span id="totalDuration" class="text-[10px] text-gray-500 code-font">0:00</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <button id="prevBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center bg-[#0e1629] border border-slate-800 rounded-xl text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                    <button id="playBtn" class="music-btn-nav w-10 h-10 flex items-center justify-center bg-[#0e1629] border border-slate-800 rounded-xl text-gray-400 hover:text-white"><svg id="playIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
                    <button id="nextBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center bg-[#0e1629] border border-slate-800 rounded-xl text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-10.5 12l8.5-6-8.5-6z"/></svg></button>
                    <button id="playlistToggleBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center bg-[#0e1629] border border-slate-800 rounded-xl text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
                </div>
            </div>
            <div id="playlistPanel" class="music-playlist-border hidden mt-4 pt-4 border-t border-slate-800/60 max-h-40 overflow-y-auto space-y-1"></div>
        </div>

        <div class="mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint..."
                    class="search-input w-full px-4 py-3 text-sm rounded-lg focus:outline-none transition-all code-font bg-slate-900 light-mode:bg-white border border-slate-800 light-mode:border-slate-300 text-white light-mode:text-slate-900"
                >
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start overflow-x-auto pb-2 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <h3 id="no-results-title" class="text-sm font-bold mb-1">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-gray-400">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-slate-800 light-mode:border-slate-200 text-center text-xs text-gray-500">
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
