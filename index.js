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
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;600;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css" />
    
    <style>
        /* Glassmorphism Classes */
        .glass-panel {
            background: rgba(15, 30, 45, 0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        .light-mode .glass-panel {
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        }
        .glass-text {
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .light-mode .glass-text {
            text-shadow: none;
            color: #111 !important;
        }

        /* Lang switchers */
        .lang-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 10px;
            border: 2px solid #000;
            background-color: #1a1a1a;
            color: #fff;
            transition: all 0.15s ease;
        }
        .lang-btn.active {
            background-color: #eab308;
            color: #000;
            box-shadow: 2px 2px 0px #000;
        }

        /* Filter Buttons Style */
        .filter-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: normal;
            padding: 6px 12px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(5px);
            color: #ccc;
            transition: all 0.2s ease;
            border-radius: 4px;
            white-space: nowrap;
            cursor: pointer;
        }
        .filter-btn:hover {
            border-color: #fff;
            color: #fff;
        }
        .filter-btn.active {
            background-color: #2ecc71; 
            color: #000;
            border-color: #2ecc71;
            font-weight: bold;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased text-white relative">
    
    <video id="bg-video" autoplay loop muted playsinline class="fixed top-0 left-0 w-full h-full object-cover z-[-2] transition-opacity duration-500"></video>
    <div class="fixed top-0 left-0 w-full h-full bg-[#040f1a]/50 z-[-1] light-mode:bg-white/40 transition-colors duration-500 backdrop-blur-sm"></div>

    <div id="toast" class="toast">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-50 flex gap-3">
        <button id="themeToggle" class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0a1526]/80 backdrop-blur-md text-[#17a2b8] hover:text-white border border-[#17a2b8]/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 focus:outline-none" aria-label="Toggle theme">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4 11 4.67 11 5.5 10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4 16 4.67 16 5.5 15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S18.33 8 17.5 8 16 8.67 16 9.5 16.67 11 17.5 11z"/></svg>
        </button>
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0a1526]/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 focus:outline-none" aria-label="Open Navigation Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#06101c]/95 backdrop-blur-xl border-l border-slate-800 transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col p-6 font-['Space_Grotesk']">
        <div class="flex items-center justify-between mb-8">
            <div class="flex gap-0 border border-black p-0.5 bg-[#111]">
                <button id="lang-id" class="lang-btn active" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn" onclick="setLanguage('en')">EN</button>
            </div>
            <button id="closeMenuBtn" class="text-white hover:text-red-400 transition-colors p-1.5 border border-slate-800 rounded bg-[#111622]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>

        <nav class="flex flex-col gap-5 text-sm font-bold tracking-wider uppercase text-gray-300">
            <a href="#api" class="menu-link hover:text-[#17a2b8] transition-colors flex items-center gap-2">HOME</a>
            <a href="#apiList" class="menu-link hover:text-[#17a2b8] transition-colors flex items-center gap-2">DOCUMENTATION</a>
            <a href="#" class="menu-link hover:text-[#17a2b8] transition-colors flex items-center gap-2">FILE UPLOADER</a>
            <a href="#" class="menu-link hover:text-[#17a2b8] transition-colors flex items-center gap-2">PASTEBIN</a>
            
            <hr class="border-slate-800 my-2">
            
            <a href="#" class="menu-link hover:text-[#17a2b8] transition-colors flex items-center gap-2 text-xs opacity-80">BUG REPORT</a>
            <a href="#" class="menu-link hover:text-[#17a2b8] transition-colors flex items-center gap-2 text-xs opacity-80">PRIVACY POLICY</a>
            <a href="#" class="menu-link hover:text-[#17a2b8] transition-colors flex items-center gap-2 text-xs opacity-80">TERMS OF SERVICE</a>
        </nav>

        <div class="mt-8 flex-1 overflow-y-auto">
            <h3 class="text-[10px] font-bold tracking-widest uppercase mb-3 text-slate-500 code-font">DYNAMIC LINK BIO</h3>
            <div id="socialContainer" class="flex flex-col gap-2">
                <div id="socialLoading" class="text-center py-2 w-full"><p class="text-xs text-slate-500">Loading...</p></div>
                <div id="socialError" class="text-center py-2 w-full hidden"><p class="text-[10px] text-red-400">Link bio tidak tersedia.</p></div>
            </div>
        </div>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-40 transition-opacity duration-300"></div>

    <div class="max-w-4xl mx-auto px-4 py-8 relative mt-10">
        <header id="api" class="mb-12 glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div class="flex justify-between items-start mb-10">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-yellow-500/10 rounded-full flex justify-center items-center backdrop-blur-md border border-yellow-500/20">
                        <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3L4 14h7v7l9-11h-7V3z"/></svg>
                    </div>
                    <div>
                        <h2 class="font-black text-xl tracking-widest text-white glass-text uppercase">NANZZAAPI</h2>
                        <p class="text-xs text-gray-300 code-font">v2.0 · REST Documentation</p>
                    </div>
                </div>
                <div class="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2">
                    <div class="w-2 h-2 bg-[#17a2b8] rounded-full shadow-[0_0_8px_#17a2b8] animate-pulse"></div>
                    <span class="text-xs font-bold text-[#17a2b8] code-font opacity-90">ONLINE</span>
                </div>
            </div>

            <h1 class="text-5xl md:text-6xl font-black mb-4 text-white glass-text font-['Space_Grotesk'] leading-tight tracking-wide">API Explorer<br>& Tester</h1>
            <p class="text-[#17a2b8] code-font text-sm md:text-base mb-10 flex gap-2 glass-text">
                <span class="opacity-70">$</span> <span>Browse, inspect & fire requests<br>against live endpoints._</span>
            </p>

            <div class="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                <div class="glass-panel p-5 rounded-2xl relative">
                    <h3 class="text-4xl font-black text-white glass-text mb-2 font-['Space_Grotesk']" id="totalEndpoints">0</h3>
                    <p class="text-gray-300 text-sm code-font">// Endpoints</p>
                </div>
                <div class="glass-panel p-5 rounded-2xl relative">
                    <h3 class="text-4xl font-black text-[#17a2b8] mb-2 font-['Space_Grotesk']" id="totalCategories">0</h3>
                    <p class="text-gray-300 text-sm code-font">// Protocol</p>
                </div>
                
                <div id="batteryContainer" class="glass-panel p-5 rounded-2xl relative col-span-2 flex flex-col justify-center">
                    <div class="flex items-center gap-4">
                        <h3 class="text-3xl font-black text-white glass-text w-16" id="batteryPercentage">0%</h3>
                        <div class="flex-1 h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div id="batteryLevel" class="h-full bg-green-500 shadow-[0_0_10px_#22c55e] transition-all duration-500" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="flex justify-between items-center mt-3">
                        <p class="text-gray-300 text-sm code-font">// <span id="stat-battery-title">Battery</span></p>
                        <span id="batteryStatus" class="text-xs text-[#17a2b8] code-font">Detecting...</span>
                    </div>
                </div>
            </div>

            <div class="glass-panel p-4 rounded-2xl mb-6 flex items-center gap-3">
                <svg class="w-5 h-5 text-[#17a2b8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <code class="text-[#17a2b8] text-sm flex-1 truncate opacity-90">https://api-nanzz.my.id/docs/api/</code>
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </div>

            <button class="w-full bg-[#17a2b8] hover:bg-[#138496] text-black font-black tracking-wide py-4 px-4 rounded-xl mb-6 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                Request New Feature
            </button>

            <div class="grid grid-cols-2 gap-4">
                <button class="glass-panel py-3.5 rounded-xl flex items-center justify-center gap-2 text-white hover:bg-white/10 transition-colors font-bold text-sm tracking-wide">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.098.824z"/></svg>
                    Channel
                </button>
                <button class="glass-panel py-3.5 rounded-xl flex items-center justify-center gap-2 text-white hover:bg-white/10 transition-colors font-bold text-sm tracking-wide">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                    Group
                </button>
            </div>
        </header>

        <div class="glass-panel mb-8 rounded-2xl p-4 transition-all duration-300">
            <audio id="audioElement"></audio>
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                        <img id="musicCoverImg" src="" alt="Cover" class="w-full h-full object-cover transition-transform duration-500">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 id="musicTitle" class="text-white glass-text font-bold text-sm tracking-wider uppercase truncate m-0">Loading...</h3>
                        <p id="musicArtist" class="text-[#17a2b8] text-xs font-semibold tracking-wide truncate mt-0.5">-</p>
                        
                        <div class="flex items-center gap-2 mt-2">
                            <span id="currentTime" class="text-[10px] text-gray-300 code-font w-7 text-left">0:00</span>
                            <div id="progressContainer" class="flex-1 h-1 bg-white/20 rounded-full relative cursor-pointer group">
                                <div id="progressBar" class="h-full bg-[#17a2b8] rounded-full w-0 transition-all duration-300 shadow-[0_0_8px_#17a2b8]"></div>
                            </div>
                            <span id="totalDuration" class="text-[10px] text-gray-300 code-font w-7 text-right">0:00</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <button id="prevBtn" class="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button id="playBtn" class="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95">
                        <svg id="playIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <button id="nextBtn" class="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-10.5 12l8.5-6-8.5-6z"/></svg>
                    </button>
                    <button id="playlistToggleBtn" class="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                </div>
            </div>
            
            <div id="playlistPanel" class="hidden mt-4 pt-4 border-t border-white/10 max-h-40 overflow-y-auto space-y-1">
            </div>
        </div>

        <div class="mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint berdasarkan nama, path, atau kategori..."
                    class="w-full glass-panel px-4 py-4 text-sm rounded-xl focus:outline-none focus:border-[#17a2b8] transition-all code-font text-white placeholder-gray-400"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden glass-panel rounded-2xl">
            <div class="text-4xl mb-2">🔍</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1 text-white">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-gray-400">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/10 text-center text-xs text-gray-400">
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
