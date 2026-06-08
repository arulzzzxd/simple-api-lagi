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
const headertitle = "REST API ARULZ XD ";
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
        /* == Unified Light Base for Multi-Themes == */
        body {
            transition: background 0.25s ease, color 0.25s ease;
            color: #0f172a !important; /* Default dark text for all themes */
        }

        /* Fixed Top Gradient Bar that changes per theme */
        #themeTopGradient {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 120px; /* Specific area to change gradient as per image description */
            z-index: 0;
            transition: background 0.5s ease;
        }

        /* --- Default Glass Panel (Base style is light) --- */
        .glass-panel {
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border: 1px solid rgba(15, 23, 42, 0.12) !important;
            will-change: transform, opacity;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03) !important;
        }

        /* --- Core Element Colors for Base Light Look --- */
        #mainTitle { color: #0f172a !important; }
        #mainDescription { color: #334155 !important; }
        #stat-battery-title,
        #stat-endpoints-title,
        #stat-categories-title { color: #475569 !important; }
        #siteFooter { color: #64748b !important; border-color: rgba(0,0,0,0.1); }
        #no-results-title { color: #0f172a !important; }

        /* Music Player Core in Light Look */
        .music-player-card {
            background: rgba(255, 255, 255, 0.85) !important;
            border-color: rgba(0, 0, 0, 0.12) !important;
        }
        .music-text-title { color: #0f172a !important; }
        .music-text-artist { color: #475569 !important; }
        .music-progress-bar-bg { background-color: rgba(0,0,0,0.1) !important; }
        
        .music-btn-nav {
            background-color: rgba(255, 255, 255, 0.9) !important;
            border-color: rgba(0,0,0,0.12) !important;
            color: #1e293b !important;
        }
        .music-btn-nav:hover {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
        }

        /* Social Badges Core Light Look */
        .social-badge > div {
            px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border
            bg-white/80 text-slate-900 hover:bg-slate-100 border-black/10 shadow-sm
        }
        
        /* Brutalist Toggle Language Switcher */
        .lang-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 10px;
            border: 2px solid #000000;
            background-color: #ffffff;
            color: #000000;
            transition: all 0.15s ease;
        }
        .lang-btn.active {
            background-color: #0f172a;
            color: #ffffff;
            box-shadow: 2px 2px 0px #000000;
        }

        /* Filter Buttons Style */
        .filter-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            padding: 6px 12px;
            border: 1px solid rgba(0,0,0,0.15);
            background: rgba(0,0,0,0.04);
            color: #334155;
            transition: all 0.2s ease;
            border-radius: 8px;
            white-space: nowrap;
            cursor: pointer;
        }
        .filter-btn:hover {
            background: rgba(0,0,0,0.08);
        }
        .filter-btn.active {
            background-color: #0f172a !important;
            color: #ffffff !important;
            border-color: #0f172a !important;
            font-weight: bold;
        }

        /* --- THEME VARIATIONS (Backgrounds and Top Gradients) --- */
        /* Change overall bg and fixed top gradient */
        
        /* Biru (Asli) - Base Lightish Blue */
        .theme-biru { background-color: #f0f9ff; }
        .theme-biru #themeTopGradient { background: linear-gradient(to right, #7dd3fc, #0ea5e9); }
        
        /* Merah - Lightish Red-Pink like target image */
        .theme-merah { background-color: #fff1f2; }
        .theme-merah #themeTopGradient { background: linear-gradient(to right, #fecdd3, #ec4899); }
        
        /* Kuning - Lightish Orange/Amber */
        .theme-kuning { background-color: #fffbeb; }
        .theme-kuning #themeTopGradient { background: linear-gradient(to right, #fde68a, #f59e0b); }
        
        /* Hijau - Lightish Emerald/Teal */
        .theme-hijau { background-color: #ecfdf5; }
        .theme-hijau #themeTopGradient { background: linear-gradient(to right, #a7f3d0, #10b981); }
        
        /* Ungu - Lightish Violet/Indigo */
        .theme-ungu { background-color: #f5f3ff; }
        .theme-ungu #themeTopGradient { background: linear-gradient(to right, #ddd6fe, #8b5cf6); }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased text-slate-900 relative theme-biru">

    <div id="themeTopGradient"></div>

    <div id="toast" class="toast z-50">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-40">
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl glass-panel text-slate-700 hover:text-slate-900 shadow-lg transition-all active:scale-95 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-lg border-l border-slate-200 transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col p-6 font-['Space_Grotesk'] overflow-y-auto">
        
        <div class="flex items-center justify-between mb-8">
            <div class="flex gap-0 border border-black p-0.5 bg-white">
                <button id="lang-id" class="lang-btn active" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn" onclick="setLanguage('en')">EN</button>
            </div>
            
            <div class="flex items-center gap-2">
                <div class="flex items-center justify-center w-8 h-8 border border-slate-300 bg-slate-100 rounded-lg">
                    <div id="currentThemeIcon" class="w-4 h-4 rounded-full bg-cyan-400"></div>
                </div>

                <button id="closeMenuBtn" class="text-slate-700 hover:text-red-500 transition-colors p-1.5 border border-slate-300 rounded bg-slate-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <nav class="flex flex-col gap-5 text-sm font-bold tracking-wider uppercase text-slate-700">
            <a href="#api" class="menu-link hover:text-cyan-700 transition-colors flex items-center gap-2">HOME</a>
            <a href="#apiList" class="menu-link hover:text-cyan-700 transition-colors flex items-center gap-2">DOCUMENTATION</a>
            <a href="#" class="menu-link hover:text-cyan-700 transition-colors flex items-center gap-2">FILE UPLOADER</a>
            <a href="#" class="menu-link hover:text-cyan-700 transition-colors flex items-center gap-2">PASTEBIN</a>
            <hr class="border-slate-200 my-2">
            <a href="#" class="menu-link hover:text-cyan-700 transition-colors flex items-center gap-2 text-xs opacity-80">BUG REPORT</a>
            <a href="#" class="menu-link hover:text-cyan-700 transition-colors flex items-center gap-2 text-xs opacity-80">PRIVACY POLICY</a>
        </nav>

        <div class="mt-8">
            <h3 id="themeTitle" class="text-sm font-bold uppercase tracking-wider text-slate-500 mb-5">Tema</h3>
            <div id="themeListContainer" class="flex flex-col gap-4">
                
                <button type="button" onclick="setTheme('biru')" class="theme-option flex gap-3 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <div class="w-16 h-8 rounded-full bg-cyan-500 border border-black shadow-inner flex-shrink-0"></div>
                    <div class="text-left flex-1">
                        <h4 id="themeTitle_biru" class="text-sm font-bold">Biru (Asli)</h4>
                        <p id="themeDesc_biru" class="text-xs text-slate-600 font-semibold mt-0.5">Ubah gradasi area atas</p>
                    </div>
                </button>

                <button type="button" onclick="setTheme('merah')" class="theme-option flex gap-3 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <div class="w-16 h-8 rounded-full bg-pink-500 border border-black shadow-inner flex-shrink-0"></div>
                    <div class="text-left flex-1">
                        <h4 id="themeTitle_merah" class="text-sm font-bold">Merah</h4>
                        <p id="themeDesc_merah" class="text-xs text-slate-600 font-semibold mt-0.5">Ubah gradasi area atas</p>
                    </div>
                </button>

                <button type="button" onclick="setTheme('kuning')" class="theme-option flex gap-3 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <div class="w-16 h-8 rounded-full bg-amber-500 border border-black shadow-inner flex-shrink-0"></div>
                    <div class="text-left flex-1">
                        <h4 id="themeTitle_kuning" class="text-sm font-bold">Kuning</h4>
                        <p id="themeDesc_kuning" class="text-xs text-slate-600 font-semibold mt-0.5">Ubah gradasi area atas</p>
                    </div>
                </button>

                <button type="button" onclick="setTheme('hijau')" class="theme-option flex gap-3 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <div class="w-16 h-8 rounded-full bg-emerald-500 border border-black shadow-inner flex-shrink-0"></div>
                    <div class="text-left flex-1">
                        <h4 id="themeTitle_hijau" class="text-sm font-bold">Hijau</h4>
                        <p id="themeDesc_hijau" class="text-xs text-slate-600 font-semibold mt-0.5">Ubah gradasi area atas</p>
                    </div>
                </button>

                <button type="button" onclick="setTheme('ungu')" class="theme-option flex gap-3 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <div class="w-16 h-8 rounded-full bg-violet-500 border border-black shadow-inner flex-shrink-0"></div>
                    <div class="text-left flex-1">
                        <h4 id="themeTitle_ungu" class="text-sm font-bold">Ungu</h4>
                        <p id="themeDesc_ungu" class="text-xs text-slate-600 font-semibold mt-0.5">Ubah gradasi area atas</p>
                    </div>
                </button>

            </div>
        </div>

        <div class="mt-8 flex-1">
            <h3 class="text-[10px] font-bold tracking-widest uppercase mb-3 text-slate-500 code-font">DYNAMIC LINK BIO</h3>
            <div id="socialContainer" class="flex flex-col gap-2">
                <div id="socialLoading" class="text-center py-2 w-full"><p class="text-xs text-slate-500">Loading...</p></div>
                <div id="socialError" class="text-center py-2 w-full hidden"><p class="text-[10px] text-red-500">Link bio tidak tersedia.</p></div>
            </div>
        </div>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-30 transition-opacity duration-300"></div>

    <div class="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <header id="api" class="mb-12 text-center">
            <div class="flex items-center justify-center gap-3 mb-2">
                <span class="bg-cyan-100 text-cyan-700 border border-cyan-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">● ONLINE</span>
            </div>
            <h1 id="mainTitle" class="text-5xl md:text-6xl font-black mb-4 tracking-tight font-['Space_Grotesk'] text-white">${headertitle}</h1>
            <p id="mainDescription" class="text-md md:text-lg font-medium tracking-wide text-slate-300 max-w-xl mx-auto">${headerdescription}</p>
            
            <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <span id="stat-battery-title" class="text-xs font-bold uppercase tracking-wider text-slate-600">Baterai Anda</span>
                    <div class="flex items-center gap-3 mt-2">
                        <div id="batteryContainer" class="battery-container border border-slate-400">
                            <div id="batteryLevel" class="battery-level bg-green-500" style="width: 0%"></div>
                            <div class="battery-tip"></div>
                        </div>
                        <div class="text-left">
                            <span id="batteryPercentage" class="text-lg font-bold block leading-none text-slate-900">0%</span>
                            <span id="batteryStatus" class="text-[10px] uppercase text-slate-500 font-medium">Mendeteksi...</span>
                        </div>
                    </div>
                </div>
                
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <span id="stat-endpoints-title" class="text-xs font-bold uppercase tracking-wider text-slate-600">Total Endpoint</span>
                    <span id="totalEndpoints" class="text-3xl font-black text-cyan-600 mt-1">0</span>
                </div>
                
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <span id="stat-categories-title" class="text-xs font-bold uppercase tracking-wider text-slate-600">Total Kategori</span>
                    <span id="totalCategories" class="text-3xl font-black text-cyan-600 mt-1">0</span>
                </div>
            </div>

            <div class="glass-panel max-w-3xl mx-auto mt-4 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-300 shadow">
    <div class="flex items-center gap-2 text-sm text-cyan-700 code-font">
        <span>🔗</span> <span class="underline break-all font-semibold">https://simple-api-lagi.vercel.app/</span>
    </div>
    <a href="https://wa.me/6285122629940?text=Halo%20Arulz,%20saya%20ingin%20request%20fitur%20baru%20di%20REST%20API%20:" 
       target="_blank" 
       class="w-full sm:w-auto px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase rounded-lg shadow transition-all active:scale-95 text-center flex items-center justify-center">
        + Request New Feature
    </a>
</div>

<div class="flex justify-center gap-4 mt-4 max-w-3xl mx-auto">
    <a href="https://wa.me/6285122629940?text=Halo%20Arulz,%20boleh%20minta%20link%20Channel%20kamu%3F" 
       target="_blank" 
       class="flex-1 glass-panel py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors text-slate-700 text-center block">
       💬 Channel
    </a>
    <a href="https://wa.me/6285122629940?text=Halo%20Arulz,%20boleh%20minta%20link%20Group%20kamu%3F" 
       target="_blank" 
       class="flex-1 glass-panel py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors text-slate-700 text-center block">
       👥 Group
    </a>
</div>

            <div class="music-player-card glass-panel mt-8 max-w-2xl mx-auto rounded-2xl p-4 shadow-2xl relative overflow-hidden border border-slate-200">
                <audio id="audioElement"></audio>
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-200/50">
                            <img id="musicCoverImg" src="" alt="Cover" class="w-full h-full object-cover transition-transform duration-500">
                        </div>
                        <div class="flex-1 min-w-0 text-left">
                            <h3 id="musicTitle" class="music-text-title text-slate-950 font-bold text-sm tracking-wider uppercase truncate m-0">Loading...</h3>
                            <p id="musicArtist" class="music-text-artist text-slate-600 text-xs font-semibold tracking-wide truncate mt-0.5">-</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span id="currentTime" class="text-[10px] text-slate-500 code-font w-7 text-left">0:00</span>
                                <div id="progressContainer" class="music-progress-bar-bg flex-1 h-1 bg-black/10 rounded-full relative cursor-pointer group">
                                    <div id="progressBar" class="h-full bg-cyan-600 rounded-full w-0 transition-all duration-300"></div>
                                </div>
                                <span id="totalDuration" class="text-[10px] text-slate-500 code-font w-7 text-right">0:00</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <button id="prevBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl transition-all active:scale-95 text-slate-700 hover:text-slate-950 hover:bg-slate-100">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>
                        <button id="playBtn" class="music-btn-nav w-10 h-10 flex items-center justify-center glass-panel rounded-xl transition-all active:scale-95 text-slate-700 hover:text-slate-950 hover:bg-slate-100">
                            <svg id="playIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        <button id="nextBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl transition-all active:scale-95 text-slate-700 hover:text-slate-950 hover:bg-slate-100">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-10.5 12l8.5-6-8.5-6z"/></svg>
                        </button>
                        <button id="playlistToggleBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl transition-all active:scale-95 text-slate-700 hover:text-slate-950 hover:bg-slate-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                    </div>
                </div>
                <div id="playlistPanel" class="music-playlist-border hidden mt-4 pt-4 border-t border-slate-200 max-h-40 overflow-y-auto space-y-1"></div>
            </div>
        </header>

        <div class="mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint berdasarkan nama, path, atau kategori..."
                    class="search-input w-full px-4 py-3 text-sm rounded-xl focus:outline-none transition-all code-font glass-panel text-slate-900 placeholder-slate-500 focus:border-cyan-600 shadow"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">🔍</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1 text-slate-900">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-slate-500">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
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
