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
const headertitle = "REST API ARULZ XD"; 
const headerdescription = "Kumpulan API Endpoint yang mungkin berguna.";
const footer = "© Arulz-XD";

// === KONFIGURASI PLAYLIST ===
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
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css" />
    
    <style>
        .hero-card {
            background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .font-syne {
            font-family: 'Syne', sans-serif;
        }
        
        .light-mode .hero-card {
            background-image: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.4)), url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000&auto=format&fit=crop');
            border-color: #cbd5e1;
        }
        .light-mode .glass-panel {
            background: rgba(0, 0, 0, 0.05);
            border-color: rgba(0, 0, 0, 0.1);
            color: #1e293b;
        }
        .light-mode .hero-text-white {
            color: #0f172a !important;
        }
        .light-mode .hero-text-cyan {
            color: #0284c7 !important;
        }
        
        .light-mode .music-player-card {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }
        .light-mode .music-text-title { color: #1e293b !important; }
        .light-mode .music-text-artist { color: #475569 !important; }
        .light-mode .music-progress-bar-bg { background-color: #e2e8f0 !important; }
        .light-mode .music-btn-nav {
            background-color: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #334155 !important;
        }
        .light-mode .music-btn-nav:hover {
            background-color: #e2e8f0 !important;
            color: #0f172a !important;
        }

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

        .filter-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            padding: 6px 12px;
            border: 1px solid var(--border-color);
            background-color: transparent;
            color: var(--text-secondary);
            transition: all 0.2s ease;
            border-radius: 4px;
            white-space: nowrap;
        }
        .filter-btn.active {
            background-color: #2ecc71;
            color: #000000;
            border-color: #2ecc71;
            font-weight: bold;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased bg-[#070b12] text-white">

    <div class="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button id="themeToggle" class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white border border-slate-800">
            <svg id="theme-toggle-dark-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            <svg id="theme-toggle-light-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clip-rule="evenodd"></path></svg>
        </button>
        
        <div class="flex border-2 border-black rounded overflow-hidden">
            <button id="lang-id" class="lang-btn active" onclick="switchLanguage('id')">ID</button>
            <button id="lang-en" class="lang-btn" onclick="switchLanguage('en')">EN</button>
        </div>

        <button id="bioMenuBtn" class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white border border-slate-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-80 bg-[#0b1019] text-white z-50 shadow-2xl border-l border-slate-800 p-6 flex flex-col transition-transform duration-300 translate-x-full">
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg tracking-wider">CREATOR BIO</h3>
            <button id="closeMenuBtn" class="text-gray-400 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <div class="flex flex-col items-center text-center mb-6">
            <img src="https://arulz-uploader.vercel.app/files/C5VYmq.jpg" alt="Owner" class="w-24 h-24 rounded-full border-2 border-cyan-500 shadow-xl mb-3">
            <h4 class="font-bold text-xl tracking-wide text-white">Arulz-XD</h4>
            <p class="text-xs text-cyan-400 font-mono">Fullstack Developer</p>
        </div>
        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
            <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">WhatsApp</span>
                <a href="https://wa.me/6285122629940" target="_blank" class="text-xs font-mono text-cyan-400 hover:underline break-all">+62 851-2262-9940</a>
            </div>
            <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Instagram</span>
                <a href="https://instagram.com/arul_zxd" target="_blank" class="text-xs font-mono text-cyan-400 hover:underline break-all">@arul_zxd</a>
            </div>
        </div>
    </div>
    <div id="menuOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-40 transition-opacity duration-300"></div>

    <div class="max-w-5xl mx-auto px-4 py-8">
        
        <header id="api" class="mb-12 hero-card rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-cyan-500/20">
            
            <div class="flex justify-between items-start mb-8">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center overflow-hidden shadow-inner">
                        <img id="logoImg" src="${logo}" alt="Logo" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h2 class="hero-text-white text-white font-bold tracking-wider text-sm uppercase m-0">ARULZ-XD</h2>
                        <p class="hero-text-cyan text-cyan-400 text-[11px] code-font opacity-80 mt-0.5">v2.0 • REST Documentation</p>
                    </div>
                </div>
                <span class="bg-teal-500/20 text-teal-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-500/30 tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span> ONLINE
                </span>
            </div>

            <h1 id="mainTitle" class="hero-text-white text-4xl md:text-5xl font-extrabold mb-3 leading-none font-syne tracking-tight text-white uppercase max-w-xl">
                API Explorer <br>& Tester
            </h1>
            <p id="mainDescription" class="hero-text-white text-xs md:text-sm font-normal tracking-wide text-cyan-100/70 code-font mb-8 max-w-lg">
                <span class="hero-text-cyan text-cyan-400 font-bold">$</span> ${headerdescription}
            </p>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="glass-panel p-4 rounded-xl">
                    <span id="totalEndpoints" class="hero-text-white text-2xl md:text-3xl font-black font-syne text-white block">0</span>
                    <span id="stat-endpoints-title" class="text-[10px] uppercase font-bold tracking-wider text-cyan-300/60 code-font">// Endpoints</span>
                </div>
                <div class="glass-panel p-4 rounded-xl">
                    <span id="totalCategories" class="hero-text-cyan text-2xl md:text-3xl font-black font-syne text-sky-400 block">REST</span>
                    <span id="stat-categories-title" class="text-[10px] uppercase font-bold tracking-wider text-cyan-300/60 code-font">// Protocol</span>
                </div>
            </div>

            <div class="glass-panel px-4 py-3 rounded-xl flex items-center justify-between mb-6 text-xs code-font">
                <div class="flex items-center gap-2 text-cyan-400 truncate hero-text-cyan">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                    </svg>
                    <span class="text-white/90 truncate hero-text-white">${BASE_URL}/api/</span>
                </div>
                <svg class="w-3.5 h-3.5 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
            </div>

            <div class="space-y-3 relative z-10">
                <a href="https://wa.me/6285122629940" target="_blank" class="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/></svg>
                    Request New Feature
                </a>
                <div class="grid grid-cols-2 gap-3">
                    <a href="https://whatsapp.com/channel/0029Vb3XoZfJ93wXUo6D1P2x" target="_blank" class="glass-panel py-2.5 rounded-xl text-center text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                        <span>💬</span> Channel
                    </a>
                    <a href="https://chat.whatsapp.com/E5Jb3xV9zZfL93wXUo6D1P" target="_blank" class="glass-panel py-2.5 rounded-xl text-center text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                        <span>👥</span> Group
                    </a>
                </div>
            </div>

            <div class="hidden">
                <div id="batteryContainer"></div><div id="batteryLevel"></div>
                <span id="batteryPercentage">0%</span><span id="batteryStatus"></span>
                <span id="stat-battery-title"></span>
            </div>
        </header>

        <div class="music-player-card mb-8 max-w-2xl mx-auto bg-[#090e1a] border border-slate-800/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div class="relative z-10 flex flex-col md:flex-row items-center gap-4">
                <div class="relative group flex-shrink-0">
                    <img id="musicCover" src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop" alt="Cover" class="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-md transition-transform duration-500 group-hover:scale-105">
                    <div id="musicVinylDisc" class="absolute inset-0 rounded-full border-4 border-black/40 animate-spin hidden"></div>
                </div>
                <div class="flex-1 w-full text-center md:text-left min-w-0">
                    <div class="mb-1 flex items-center justify-center md:justify-between">
                        <span class="text-[10px] font-mono tracking-widest text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded uppercase">Now Playing</span>
                    </div>
                    <h3 id="musicTitle" class="music-text-title font-bold text-base text-white truncate m-0">Memuat musik...</h3>
                    <p id="musicArtist" class="music-text-artist text-xs text-gray-400 truncate mt-0.5 mb-3">Artis</p>
                    <div class="flex items-center gap-2">
                        <span id="musicCurrentTime" class="text-[10px] font-mono text-gray-500 w-9 text-right">0:00</span>
                        <div id="musicProgressBarBg" class="music-progress-bar-bg flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative">
                            <div id="musicProgressBar" class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100" style="width: 0%"></div>
                        </div>
                        <span id="musicDuration" class="text-[10px] font-mono text-gray-500 w-9">0:00</span>
                    </div>
                </div>
                <div class="flex md:flex-col items-center justify-center gap-2 flex-shrink-0 mt-2 md:mt-0">
                    <div class="flex items-center gap-1.5">
                        <button id="musicBtnPrev" class="music-btn-nav w-9 h-9 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 flex items-center justify-center text-sm transition-all active:scale-90">⏮️</button>
                        <button id="musicBtnPlay" class="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20 text-white transition-all active:scale-90">▶️</button>
                        <button id="musicBtnNext" class="music-btn-nav w-9 h-9 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 flex items-center justify-center text-sm transition-all active:scale-90">⏭️</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="mb-8">
            <div class="relative">
                <input type="text" id="searchInput" placeholder="Cari endpoint..." class="search-input w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-blue-500 transition-all code-font bg-[#0f141c] text-white border border-slate-800">
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">🔍</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1">Not Found</h3>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-gray-800 text-center text-xs opacity-60">
            ${footer}
        </footer>
    </div>
</body>
</html>`);
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
