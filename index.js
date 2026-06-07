const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

const title = "API Arulz-XD";
const favicon = "https://arulz-uploader.vercel.app/files/C5VYmq.jpg";
const logo = "https://arulz-uploader.vercel.app/files/SnhJe3.png";
const headertitle = "API Explorer <br>& Tester";
const headerdescription = "$ Browse, inspect & fire requests<br>against live endpoints._";
const footer = "© Arulz-XD";

const playlist = [
  { title: "PAMIT KERJO", artist: "NDX. AKA", cover: "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg", url: "https://files.catbox.moe/gfuwnv.mp3" },
  { title: "TANPO HUBUNGAN", artist: "LA TASYA", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop", url: "https://files.catbox.moe/xd5oq3.mp3" },
  { title: "DJ CIDRO 2", artist: "TIDAK DIKETAHUI", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop", url: "https://files.catbox.moe/u30w9k.mp3" }
];

const router = express.Router();
const apiPath = path.join(__dirname, 'api');

if (!fs.existsSync(apiPath)) {
    fs.mkdirSync(apiPath, { recursive: true });
}

// FIX: Filter direktori dengan pengecekan apakah folder ada isinya
const endpointDirs = fs.readdirSync(apiPath).filter(f => {
    const p = path.join(apiPath, f);
    return fs.statSync(p).isDirectory() && fs.readdirSync(p).length > 0;
});

for (const category of endpointDirs) {
  const categoryPath = path.join(apiPath, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    try {
        const routeName = path.basename(file, '.js');
        const route = require(path.join(categoryPath, file));
        // Memastikan route adalah middleware yang valid
        if (route) {
            router.use(`/${category}/${routeName}`, route);
        }
    } catch (e) {
        console.error(`Gagal memuat route ${category}/${file}:`, e);
    }
  }
}

function getEndpointsFromRouter(category, file) {
  const endpoints = [];
  const fullPath = path.join(apiPath, category, file);
  
  // Hapus cache agar perubahan terbaca saat server restart
  delete require.cache[require.resolve(fullPath)];
  const route = require(fullPath);
  
  // Mendukung export router langsung atau object dengan properti 'router'
  const subRouter = route.router || route;
  
  if (!subRouter || !subRouter.stack) return endpoints;

  subRouter.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      endpoints.push({
        name: `/${category}/${file.replace(/\.js$/,"")}`,
        path: `/api/${category}/${file.replace(/\.js$/,"")}`,
        desc: `Endpoint: ${layer.route.path}`,
        status: "ready",
        params: {}, // Jika Anda ingin deteksi otomatis, gunakan regex di sini
        methods
      });
    }
  });
  return endpoints;
}

app.get('/api/apilist', (req, res) => {
    let endpoints = [];
    
    // Scan ulang folder api
    const categories = fs.readdirSync(apiPath);
    categories.forEach(category => {
        const catPath = path.join(apiPath, category);
        if (fs.statSync(catPath).isDirectory()) {
            const files = fs.readdirSync(catPath);
            files.forEach(file => {
                if (file.endsWith('.js')) {
                    endpoints.push({
                        category: category,
                        name: file.replace('.js', ''),
                        path: `/api/${category}/${file.replace('.js', '')}`
                    });
                }
            });
        }
    });
    
    res.json(endpoints);
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
        /* Glassmorphism Styles */
        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .light-mode .glass-card {
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .light-mode .text-teal-400 {
            color: #0d9488 !important;
        }
        .glass-btn {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .light-mode .glass-btn {
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(0, 0, 0, 0.1);
            color: #1f2937;
        }

        .light-mode .music-player-card {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
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
        .light-mode .music-playlist-border { border-color: #e2e8f0 !important; }
        
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
        .filter-btn:hover { border-color: var(--text-primary); color: var(--text-primary); }
        .filter-btn.active {
            background-color: #2ecc71;
            color: #000000;
            border-color: #2ecc71;
            font-weight: bold;
        }
        .light-mode .filter-btn { border-color: #d1d5db; }
        .light-mode .filter-btn:hover { border-color: #374151; color: #000000; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased text-white relative z-0">
    
    <div id="video-bg-container" class="fixed inset-0 z-[-1] overflow-hidden bg-slate-900">
        <video id="bg-video" autoplay loop muted playsinline class="w-full h-full object-cover opacity-60">
            <source src="https://cdn.pixabay.com/video/2020/02/24/32773-393278239_tiny.mp4" type="video/mp4">
        </video>
    </div>

    <div id="toast" class="toast">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-50">
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl bg-black/50 backdrop-blur-md text-slate-200 hover:text-white border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 focus:outline-none" aria-label="Open Navigation Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#0a0f18]/95 backdrop-blur-xl border-l-2 border-[#161f30] transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col p-6 font-['Space_Grotesk']">
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

    <div class="max-w-5xl mx-auto px-4 py-8 relative z-10">
        
        <header id="api" class="mb-12 glass-card rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl">
            <div class="flex items-center justify-between mb-10">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                        <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <div>
                        <h2 class="text-white font-bold tracking-widest text-lg uppercase light-mode:text-gray-900">NANZZAPI</h2>
                        <p class="text-gray-300 text-[11px] code-font light-mode:text-gray-600">v2.0 · REST Documentation</p>
                    </div>
                </div>
                <div class="bg-black/30 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <div class="w-2 h-2 bg-teal-400 rounded-full animate-pulse shadow-[0_0_10px_#2dd4bf]"></div>
                    <span class="text-teal-400 text-[10px] font-bold tracking-widest uppercase">ONLINE</span>
                </div>
            </div>

            <h1 id="mainTitle" class="text-5xl md:text-6xl font-black text-white leading-[1.1] mb-6 tracking-wide light-mode:text-gray-900" style="font-family: 'Arial Black', Impact, sans-serif;">
                ${headertitle}
            </h1>
            <p id="mainDescription" class="text-teal-300/90 code-font text-sm mb-10 leading-relaxed light-mode:text-teal-700 font-semibold">
                ${headerdescription}
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="glass-btn rounded-xl p-4 hover:bg-white/5 transition-colors flex flex-col justify-center text-center">
                    <h3 id="totalEndpoints" class="text-3xl font-black text-white mb-1 light-mode:text-gray-900">0</h3>
                    <p id="stat-endpoints-title" class="text-gray-300 text-xs code-font light-mode:text-gray-600">// Endpoints</p>
                </div>
                <div class="glass-btn rounded-xl p-4 hover:bg-white/5 transition-colors flex flex-col justify-center text-center">
                    <h3 id="totalCategories" class="text-3xl font-black text-blue-400 mb-1">0</h3>
                    <p id="stat-categories-title" class="text-gray-300 text-xs code-font light-mode:text-gray-600">// Protocol</p>
                </div>
                <div class="glass-btn rounded-xl p-4 hover:bg-white/5 transition-colors flex flex-col items-center justify-center">
                     <p id="stat-battery-title" class="text-gray-300 text-xs code-font mb-2 light-mode:text-gray-600">Baterai</p>
                     <div class="flex flex-col items-center gap-1">
                        <div id="batteryContainer" class="battery-container scale-75 origin-center">
                            <div id="batteryLevel" class="battery-level bg-green-500" style="width: 0%"></div>
                            <div class="battery-tip"></div>
                        </div>
                        <span id="batteryPercentage" class="text-xs font-bold text-white light-mode:text-gray-900">0%</span>
                    </div>
                    <span id="batteryStatus" class="text-[9px] text-gray-400 mt-1 uppercase">Mendeteksi</span>
                </div>
            </div>

            <div class="glass-btn rounded-xl p-4 flex items-center gap-3 mb-6 overflow-hidden">
                <svg class="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                <code class="text-teal-400 text-sm flex-1 truncate font-medium">https://api-nanzz.my.id<span class="text-white/50 light-mode:text-gray-500">/docs/api/</span></code>
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
            </div>

            <button class="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] mb-6 text-sm uppercase tracking-wider">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Request New Feature
            </button>

            <div class="grid grid-cols-2 gap-4">
                <button class="glass-btn hover:bg-white/10 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-bold tracking-wider">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    CHANNEL
                </button>
                <button class="glass-btn hover:bg-white/10 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-bold tracking-wider">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    GROUP
                </button>
            </div>
        </header>

        <div class="music-player-card max-w-2xl mx-auto glass-card rounded-2xl p-4 shadow-2xl relative overflow-hidden transition-all duration-300 mb-12">
            <audio id="audioElement"></audio>
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/20">
                        <img id="musicCoverImg" src="" alt="Cover" class="w-full h-full object-cover transition-transform duration-500">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 id="musicTitle" class="music-text-title text-white font-bold text-sm tracking-wider uppercase truncate m-0">Loading...</h3>
                        <p id="musicArtist" class="music-text-artist text-gray-300 text-xs font-semibold tracking-wide truncate mt-0.5">-</p>
                        <div class="flex items-center gap-2 mt-2">
                            <span id="currentTime" class="text-[10px] text-gray-300 code-font w-7 text-left">0:00</span>
                            <div id="progressContainer" class="music-progress-bar-bg flex-1 h-1 bg-white/20 rounded-full relative cursor-pointer group">
                                <div id="progressBar" class="h-full bg-teal-400 rounded-full w-0 transition-all duration-300"></div>
                            </div>
                            <span id="totalDuration" class="text-[10px] text-gray-300 code-font w-7 text-right">0:00</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <button id="prevBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-btn rounded-xl text-gray-300 hover:text-white transition-all active:scale-95">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button id="playBtn" class="music-btn-nav w-10 h-10 flex items-center justify-center glass-btn rounded-xl text-gray-300 hover:text-white transition-all active:scale-95">
                        <svg id="playIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <button id="nextBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-btn rounded-xl text-gray-300 hover:text-white transition-all active:scale-95">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-10.5 12l8.5-6-8.5-6z"/></svg>
                    </button>
                    <button id="playlistToggleBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-btn rounded-xl text-gray-300 hover:text-white transition-all active:scale-95">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                </div>
            </div>
            
            <div id="playlistPanel" class="music-playlist-border hidden mt-4 pt-4 border-t border-white/20 max-h-40 overflow-y-auto space-y-1">
            </div>
        </div>

        <div class="mb-8 max-w-2xl mx-auto glass-card rounded-2xl p-4">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint berdasarkan nama, path, atau kategori..."
                    class="search-input w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-teal-400 transition-all code-font bg-black/40 border border-white/10 text-white placeholder-gray-400"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start overflow-x-auto pb-2 scrollbar-hide">
            </div>
        </div>

        <div id="noResults" class="text-center py-12 hidden glass-card rounded-2xl max-w-2xl mx-auto">
            <div class="text-4xl mb-2">🔍</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-gray-400">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4 max-w-2xl mx-auto"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/20 light-mode:border-gray-300 text-center text-xs text-gray-400">
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