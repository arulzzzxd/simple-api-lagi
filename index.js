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
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
    <link id="faviconLink" rel="icon" type="image/x-icon" href="${favicon}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
    
    <style>
        /* === TEMA SINKRONISASI === */
        body { transition: background-color 0.3s, color 0.3s; }
        
        /* DARK MODE (Default) */
        .api-card { background-color: #111111; border-color: #1e293b; color: #ffffff; }
        .api-input { background-color: #020617; border-color: #334155; color: #ffffff; }
        .api-response { background-color: #000000; border-color: #1e293b; color: #4ade80; }
        .api-panel { background-color: rgba(100, 116, 139, 0.05); }

        /* LIGHT MODE OVERRIDES */
        .light-mode { background-color: #f8fafc !important; color: #0f172a !important; }
        .light-mode .api-card { background-color: #ffffff !important; border-color: #e2e8f0 !important; color: #0f172a !important; }
        .light-mode .api-card button { color: #0f172a !important; }
        .light-mode .api-input { background-color: #ffffff !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
        .light-mode .api-input:focus { border-color: #eab308 !important; }
        .light-mode .api-response { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
        .light-mode .api-panel { background-color: #f8fafc !important; }
        .light-mode .filter-btn { border-color: #cbd5e1; color: #475569; }
        .light-mode .filter-btn:hover { border-color: #0f172a; color: #0f172a; }
        .light-mode .filter-btn.active { background-color: #2ecc71; color: #ffffff; border-color: #2ecc71; }
        
        /* Brutalist Language Switcher */
        .lang-btn { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: bold; padding: 3px 10px; border: 2px solid #000000; background-color: #1a1a1a; color: #ffffff; transition: all 0.15s ease; }
        .lang-btn.active { background-color: #eab308; color: #000000; box-shadow: 2px 2px 0px #000000; }

        /* Filter Buttons Style */
        .filter-btn { font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 6px 12px; border: 1px solid #334155; background-color: transparent; color: #94a3b8; transition: all 0.2s ease; border-radius: 4px; cursor: pointer; }
        .filter-btn:hover { border-color: #ffffff; color: #ffffff; }
        .filter-btn.active { background-color: #2ecc71; color: #000000; border-color: #2ecc71; font-weight: bold; }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased bg-[#0f141c] text-white">

    <div id="toast" class="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-3 rounded shadow-lg transform transition-transform translate-y-20 opacity-0 z-50">
        <span id="toastMessage" class="text-sm font-medium"></span>
    </div>

    <div class="fixed top-6 right-6 z-50">
        <button id="themeToggle" class="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 shadow-xl text-white transition-all">
            <span id="theme-toggle-dark-icon">🌙</span>
            <span id="theme-toggle-light-icon" class="hidden text-yellow-500">☀️</span>
        </button>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-8">
        <header id="api" class="relative mb-8 rounded-[2rem] overflow-hidden bg-cover bg-center shadow-2xl border border-slate-700/50" 
                style="background-image: url('https://images.unsplash.com/photo-1682687982501-1e5898cb8f4b?auto=format&fit=crop&q=80&w=1000');">
            <div class="absolute inset-0 bg-[#061121]/70 backdrop-blur-sm z-0"></div>
            
            <div class="relative z-10 p-8 text-white">
                <div class="flex items-center gap-4 mb-8">
                    <img id="dynamicLogo" src="${logo}" alt="Logo" class="w-12 h-12 rounded-full border border-white/20">
                    <div>
                        <h2 class="text-xl font-black tracking-widest uppercase">${headertitle}</h2>
                        <p class="text-[11px] text-gray-300 font-mono tracking-wide">v2.0 · REST Documentation</p>
                    </div>
                </div>

                <h1 class="text-4xl md:text-5xl font-black mb-8 uppercase tracking-wide">API Explorer</h1>

                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-xl p-4">
                        <div id="totalEndpoints" class="text-2xl font-black mb-1 text-white">0</div>
                        <div class="font-mono text-[10px] text-gray-400">// Endpoints</div>
                    </div>
                    <div class="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-xl p-4">
                        <div class="text-2xl font-black mb-1 text-[#00b4d8]">REST</div>
                        <div class="font-mono text-[10px] text-gray-400">// Protocol</div>
                    </div>
                    <div class="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-xl p-4">
                        <div id="batteryStatus" class="text-2xl font-black mb-1 text-yellow-400">...</div>
                        <div class="font-mono text-[10px] text-gray-400">// Baterai</div>
                    </div>
                </div>
            </div>
        </header>

        <div class="mb-8">
            <input type="text" id="searchInput" placeholder="Cari endpoint..." class="api-input w-full px-4 py-3 text-sm rounded-lg focus:outline-none transition-all code-font border">
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 pb-2 scrollbar-hide"></div>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer class="mt-12 pt-6 border-t border-slate-700 text-center text-xs text-gray-500">
            ${footer}
        </footer>
    </div>
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
