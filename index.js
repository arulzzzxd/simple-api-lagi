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
const headertitle = "NANZZA PI";
const headerdescription = "v2.0 • REST Documentation";
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
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --teal-primary: #00bcd4;
            --teal-dark: #006064;
        }
        body {
            font-family: 'Space Grotesk', sans-serif;
            background-color: #030a16;
            color: #ffffff;
            transition: background-color 0.3s, color 0.3s;
        }
        .code-font {
            font-family: 'JetBrains Mono', monospace;
        }
        
        /* Video Background */
        #video-bg-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            overflow: hidden;
        }
        #bg-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.5s ease-in-out;
        }
        #video-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: linear-gradient(to right, rgba(3,10,22,0.95) 50%, rgba(3,10,22,0.4) 50%);
            transition: background 0.3s ease;
        }
        
        /* Light Mode Adjustments */
        body.light-mode {
            background-color: #f0f4f8;
            color: #0f172a;
        }
        body.light-mode #video-overlay {
            background: linear-gradient(to right, rgba(240,244,248,0.95) 50%, rgba(240,244,248,0.3) 50%);
        }

        /* Glassmorphism Cards */
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        body.light-mode .glass-card {
            background: rgba(15, 23, 42, 0.04);
            border: 1px solid rgba(15, 23, 42, 0.08);
        }

        /* Battery Styling preserved from original */
        .battery-container {
            width: 28px;
            height: 14px;
            border: 1.5px solid currentColor;
            border-radius: 3px;
            padding: 1px;
            position: relative;
            display: flex;
            align-items: center;
        }
        .battery-level {
            height: 100%;
            border-radius: 1px;
            transition: width 0.3s, background-color 0.3s;
        }
        .battery-tip {
            width: 2px;
            height: 6px;
            background-color: currentColor;
            position: absolute;
            right: -3px;
            top: 50%;
            transform: translateY(-50%);
            border-radius: 0 1px 1px 0;
        }
        
        /* Language switcher brutalist */
        .lang-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 10px;
            border: 1px solid rgba(255,255,255,0.2);
            background-color: rgba(0,0,0,0.4);
            color: #ffffff;
        }
        .lang-btn.active {
            background-color: #00bcd4;
            color: #000000;
        }
        
        .filter-btn {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            padding: 6px 12px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.02);
            color: #94a3b8;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .filter-btn.active {
            background-color: #00bcd4;
            color: #000000;
            border-color: #00bcd4;
            font-weight: bold;
        }
        body.light-mode .filter-btn {
            border-color: rgba(0,0,0,0.1);
            background: rgba(0,0,0,0.02);
            color: #475569;
        }
        body.light-mode .filter-btn.active {
            background-color: #00bcd4;
            color: #000000;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased relative">

    <div id="video-bg-container">
        <video autoplay loop muted playsinline id="bg-video">
            <source src="" type="video/mp4">
        </video>
    </div>
    <div id="video-overlay"></div>

    <div id="toast" class="fixed bottom-5 right-5 z-50 transform translate-y-20 opacity-0 transition-all duration-300 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
        <svg id="toastIcon" class="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span id="toastMessage" class="text-sm font-medium">Action completed</span>
    </div>

    <div class="fixed top-6 right-6 z-50 flex items-center gap-3">
        <button id="themeToggle" class="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900/60 backdrop-blur border border-white/10 text-cyan-400 shadow-lg hover:scale-105 transition-all">
            <svg id="theme-toggle-dark-icon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg id="theme-toggle-light-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
            </svg>
        </button>
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900/60 backdrop-blur border border-white/10 text-cyan-400 shadow-lg hover:scale-105 transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-slate-950/95 border-l border-white/10 transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col p-6">
        <div class="flex items-center justify-between mb-8">
            <div class="flex gap-0 border border-white/10 p-0.5 bg-black/40 rounded-md overflow-hidden">
                <button id="lang-id" class="lang-btn active" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn" onclick="setLanguage('en')">EN</button>
            </div>
            <button id="closeMenuBtn" class="text-white hover:text-cyan-400 transition-colors p-1.5 border border-white/10 rounded-lg bg-slate-900">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        <nav class="flex flex-col gap-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
            <a href="#api" class="hover:text-cyan-400 transition-colors">HOME</a>
            <a href="#apiList" class="hover:text-cyan-400 transition-colors">DOCUMENTATION</a>
            <hr class="border-white/10 my-2">
        </nav>
        <div class="mt-8 flex-1 overflow-y-auto">
            <h3 class="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3 code-font">DYNAMIC LINK BIO</h3>
            <div id="socialContainer" class="flex flex-col gap-2">
                <div id="socialLoading" class="text-center py-2"><p class="text-xs text-slate-600">Loading...</p></div>
            </div>
        </div>
    </div>
    <div id="menuOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-40"></div>

    <div class="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <div class="space-y-8 lg:sticky lg:top-12">
            <div class="flex items-start gap-4">
                <div class="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h2 class="text-xl font-bold tracking-widest text-white uppercase">${headertitle}</h2>
                        <div class="flex items-center gap-1.5 text-slate-400 code-font text-xs" id="batteryApplet">
                            <span id="batteryPercentage">0%</span>
                            <div id="batteryContainer" class="battery-container">
                                <div id="batteryLevel" class="battery-level bg-cyan-400" style="width: 0%"></div>
                                <div class="battery-tip"></div>
                            </div>
                            <span id="batteryStatus" class="text-[10px] opacity-60 hidden md:inline">Mendeteksi...</span>
                        </div>
                    </div>
                    <p class="text-xs text-cyan-400/80 mt-0.5 code-font">${headerdescription}</p>
                </div>
            </div>

            <div class="space-y-3">
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                    API Explorer <br>& Tester
                </h1>
                <p id="mainDescription" class="text-sm text-cyan-400/70 code-font max-w-lg leading-relaxed">
                    $ Browse, inspect & fire requests against live endpoints._
                </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="glass-card rounded-xl p-5 relative overflow-hidden group">
                    <span id="totalEndpoints" class="text-3xl md:text-4xl font-bold text-white block">0</span>
                    <span id="stat-endpoints-title" class="text-xs text-cyan-400 code-font block mt-2">// Endpoints</span>
                    <svg class="w-8 h-8 text-cyan-400/20 absolute right-4 bottom-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l2-2 1-1V9.757A6 6 0 1118 8zm-3.449 1.422A3.998 3.998 0 0012 7.5a1 1 0 000 2c.454 0 .866.244 1.086.637a1 1 0 101.465-1.365z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="glass-card rounded-xl p-5 relative overflow-hidden">
                    <span class="text-3xl md:text-4xl font-bold text-cyan-400 block">REST</span>
                    <span id="stat-categories-title" class="text-xs text-slate-400 code-font block mt-2">// Protocol</span>
                    <span class="text-[10px] text-slate-500 absolute right-4 bottom-4 code-font">v2.0</span>
                </div>
            </div>

            <div class="glass-card rounded-xl p-3 flex items-center gap-3 border border-cyan-500/20">
                <svg class="w-5 h-5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span class="text-xs text-slate-300 code-font truncate flex-1 select-all">https://api-nanzz.my.id/docs/api/</span>
                <svg class="w-4 h-4 text-slate-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
            </div>

            <button class="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                Request New Feature
            </button>

            <div class="glass-card rounded-2xl p-4 relative overflow-hidden transition-all">
                <audio id="audioElement"></audio>
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <img id="musicCoverImg" src="" alt="Cover" class="w-12 h-12 rounded-lg object-cover bg-black flex-shrink-0 border border-white/10">
                        <div class="flex-1 min-w-0">
                            <h3 id="musicTitle" class="text-white font-bold text-xs truncate uppercase tracking-wider">Loading...</h3>
                            <p id="musicArtist" class="text-slate-400 text-[10px] truncate mt-0.5">-</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span id="currentTime" class="text-[9px] text-slate-500 code-font">0:00</span>
                                <div id="progressContainer" class="flex-1 h-1 bg-slate-800 rounded-full relative cursor-pointer">
                                    <div id="progressBar" class="h-full bg-cyan-400 rounded-full w-0"></div>
                                </div>
                                <span id="totalDuration" class="text-[9px] text-slate-500 code-font">0:00</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <button id="prevBtn" class="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                        <button id="playBtn" class="w-9 h-9 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"><svg id="playIcon" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
                        <button id="nextBtn" class="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-10.5 12l8.5-6-8.5-6z"/></svg></button>
                        <button id="playlistToggleBtn" class="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
                    </div>
                </div>
                <div id="playlistPanel" class="hidden mt-3 pt-3 border-t border-white/5 max-h-32 overflow-y-auto space-y-1 scrollbar-hide"></div>
            </div>
        </div>
        
        <div class="space-y-6 lg:border-l lg:border-white/5 lg:pl-8">
            <div class="flex items-center justify-between">
                <h2 class="text-xs font-bold uppercase tracking-widest text-cyan-400 code-font">// Endpoints Hub</h2>
                <div class="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2.5 py-1 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    Online
                </div>
            </div>

            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint..."
                    class="w-full px-4 py-3 pl-11 text-xs code-font rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
                >
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            
            <div id="categoryFilters" class="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-hide"></div>

            <div id="noResults" class="text-center py-16 hidden class-card rounded-xl border border-dashed border-white/10">
                <div class="text-3xl mb-2">🔍</div>
                <h3 id="no-results-title" class="text-xs font-bold mb-1">Endpoint tidak ditemukan</h3>
                <p id="no-results-desc" class="text-[11px] text-slate-500">Coba gunakan kata kunci lain</p>
            </div>

            <div id="apiList" class="space-y-4"></div>

            <footer id="siteFooter" class="pt-8 border-t border-white/5 text-center text-[10px] text-slate-600 code-font uppercase tracking-widest">
                ${footer}
            </footer>
        </div>
        
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