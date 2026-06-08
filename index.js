const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

/*
Setting nama API & Metadata
*/
const title = "API-ARULZXD - REST";
const favicon = "https://arulz-uploader.vercel.app/files/C5VYmq.jpg";
const logo = "https://arulz-uploader.vercel.app/files/SnhJe3.png";
const headertitle = "REST API";
const headerdescription = "Solomat datanng di REST API documentasian.";
const footer = "© Arulz-XD";

// === KONFIGURASI PLAYLIST MUSIK ===
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

// Pastikan folder api ada
if (!fs.existsSync(apiPath)) {
  fs.mkdirSync(apiPath);
}

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
            [...fnString.matchAll(/req\.query\.([a-zA-Z0-9_]+)/g)].forEach(match => {
              params[match[1]] = "";
            });
            [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
              params[match[1]] = "";
            });
          });
        }
        endpoints.push({
          name: `${file.replace(/\.js$/,"")}`,
          path: `/api/${category}/${file.replace(/\.js$/,"")}`,
          desc: `Get information from ${file.replace(/\.js$/,"")} endpoint`,
          status: "ready",
          params,
          methods
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
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
        name: category.toLowerCase(),
        items: endpoints
      });
    }
  }
  res.json({ categories });
});

app.use('/api', router);

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="id" class="notranslate" translate="no">
<head>
    <meta charset="UTF-8" />
    <meta name="google" content="notranslate" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
    <link id="faviconLink" rel="icon" type="image/x-icon" href="${favicon}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            transition: background 0.5s ease, color 0.3s ease;
        }
        
        /* Pastel Theme Style Matcher */
        .theme-card {
            background: #fff5f6;
            border: 2px solid #ffe3e6;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(254, 219, 222, 0.5);
            transition: all 0.3s ease;
        }

        .theme-badge {
            background: #fff;
            border: 1px solid #ffe3e6;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* Dark Mode Override (Soft Pastel Dark Pink/Slate) */
        body.dark-mode {
            background-color: #1a1214;
            color: #ffe4e6;
        }
        .dark-mode .theme-card {
            background: #25181b;
            border: 2px solid #3d252a;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .dark-mode .theme-badge {
            background: #1f1416;
            border: 1px solid #3d252a;
            color: #fecdd3;
        }
        .dark-mode input, .dark-mode textarea {
            background: #180f11 !important;
            border-color: #3d252a !important;
            color: #ffe4e6 !important;
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .toggle-switch {
            position: relative;
            width: 48px;
            height: 24px;
            background: #cbd5e1;
            border-radius: 9999px;
            transition: background 0.3s;
            cursor: pointer;
        }
        .toggle-dot {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s;
        }
        .dark-mode .toggle-switch { background: #f43f5e; }
        .dark-mode .toggle-dot { transform: translateX(24px); }
    </style>
</head>
<body class="antialiased text-slate-800 relative">

    <div id="themeBg" class="fixed inset-0 -z-50 bg-gradient-to-tr from-[#ffeef0] via-[#fff5f6] to-[#fceedf] transition-all duration-500"></div>

    <div class="fixed top-6 right-6 z-40">
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl border-2 border-[#ffe3e6] bg-white/90 text-rose-500 hover:bg-rose-50 shadow-md transition-all active:scale-95 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/20 backdrop-blur-sm hidden z-40 transition-opacity"></div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md border-l-2 border-[#ffe3e6] transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col p-6 dark-mode:bg-[#25181b]/95 dark-mode:border-[#3d252a]">
        <div class="flex items-center justify-between pb-4 border-b border-rose-100 dark-mode:border-[#3d252a] mb-6">
            <h3 class="font-bold text-lg text-slate-800 dark-mode:text-rose-200">Settings</h3>
            <button id="closeMenuBtn" class="text-slate-400 hover:text-rose-500 font-bold text-xl">&times;</button>
        </div>

        <div class="flex items-center justify-between mb-6">
            <span class="font-medium text-sm text-slate-600 dark-mode:text-slate-300">Language</span>
            <div class="flex border rounded-lg overflow-hidden border-rose-200 dark-mode:border-[#3d252a]">
                <button id="lang-id" class="px-3 py-1 text-xs font-bold bg-rose-500 text-white" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700" onclick="setLanguage('en')">EN</button>
            </div>
        </div>

        <div class="flex items-center justify-between mb-8">
            <span class="font-medium text-sm text-slate-600 dark-mode:text-slate-300">Theme</span>
            <div id="themeToggle" class="toggle-switch">
                <div class="toggle-dot"></div>
            </div>
        </div>
        
        <div class="mt-auto border-t border-rose-100 pt-4 dark-mode:border-[#3d252a] text-center text-xs text-slate-400">
            ${footer}
        </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        <header class="mb-10">
            <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2 dark-mode:text-white">${headertitle}</h1>
            <p id="mainDescription" class="text-sm text-slate-600 dark-mode:text-slate-400">${headerdescription}</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="theme-card p-4 flex items-center justify-between">
                <div>
                    <p id="stat-battery-title" class="text-xs font-semibold text-slate-500 uppercase tracking-wider dark-mode:text-slate-400">Statistik Baterai</p>
                    <h3 id="batteryPercentage" class="text-2xl font-bold mt-1 text-slate-800 dark-mode:text-white">-- %</h3>
                </div>
                <div class="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-xl shadow-inner">🔋</div>
            </div>

            <div class="theme-card p-4 flex items-center justify-between">
                <div>
                    <p id="stat-endpoints-title" class="text-xs font-semibold text-slate-500 uppercase tracking-wider dark-mode:text-slate-400">Total Endpoints</p>
                    <h3 id="totalEndpoints" class="text-2xl font-bold mt-1 text-slate-800 dark-mode:text-white">0</h3>
                </div>
                <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-xl shadow-inner">⚙️</div>
            </div>

            <div class="theme-card p-4 flex items-center justify-between">
                <div>
                    <p id="stat-categories-title" class="text-xs font-semibold text-slate-500 uppercase tracking-wider dark-mode:text-slate-400">Total Kategori</p>
                    <h3 id="totalCategories" class="text-2xl font-bold mt-1 text-slate-800 dark-mode:text-white">0</h3>
                </div>
                <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shadow-inner">🗂️</div>
            </div>
        </div>

        <div class="theme-card p-4 mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint berdasarkan nama atau path..." 
                    class="w-full px-4 py-3 bg-white/80 border-2 border-rose-100 rounded-xl focus:outline-none focus:border-rose-400 transition-all text-sm shadow-inner"
                >
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start overflow-x-auto pb-1 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">🔍</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1 text-slate-700 dark-mode:text-rose-300">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-slate-400">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-6"></div>

        <footer id="siteFooter" class="mt-16 pt-6 border-t border-rose-100 text-center text-xs text-slate-400 dark-mode:border-[#3d252a]">
            <p>${footer} - Documentations Panel</p>
        </footer>
    </div>

    <div id="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl transition-all duration-300 opacity-0 pointer-events-none transform translate-y-4 z-50 flex items-center gap-2">
        <span id="toastMessage">Selesai!</span>
    </div>

    <script src="/script.js"></script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
