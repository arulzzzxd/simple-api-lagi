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
    url: "https://files.catbox.moe/gfuwnv.mp3"
  }
];

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
    <link rel="stylesheet" href="styles.css" />
    <style>
        /* Base Smooth Transition & Theme Backgrounds */
        body {
            transition: background-color 0.5s ease, color 0.3s ease;
        }
        
        /* Definisi Gradasi Background Tema */
        .bg-theme-biru   { background: linear-gradient(135deg, #0f172a 0%, #0284c7 100%); }
        .bg-theme-merah  { background: linear-gradient(135deg, #18000a 0%, #be123c 100%); }
        .bg-theme-kuning { background: linear-gradient(135deg, #1e1b4b 0%, #d97706 100%); }
        .bg-theme-hijau  { background: linear-gradient(135deg, #022c22 0%, #059669 100%); }
        .bg-theme-ungu   { background: linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%); }

        /* Custom Styles untuk Modal Tema sesuai Gambar */
        .theme-dialog-panel {
            background-color: #ffffff;
            border-radius: 24px;
            width: 100%;
            max-width: 420px;
            padding: 24px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        }
        .theme-item-row {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 0;
            border-bottom: 1px dashed #e2e8f0;
            cursor: pointer;
            transition: all 0.2s;
        }
        .theme-item-row:last-child {
            border-bottom: none;
        }
        .theme-item-row:hover {
            opacity: 0.8;
            transform: translateX(4px);
        }
        .theme-swatch {
            width: 70px;
            height: 30px;
            border-radius: 8px;
            flex-shrink: 0;
        }
        /* Swatches gradasi di dalam modal */
        .swatch-biru   { background: linear-gradient(to right, #0ea5e9, #0284c7); }
        .swatch-merah  { background: linear-gradient(to right, #e11d48, #be123c); }
        .swatch-kuning { background: linear-gradient(to right, #f59e0b, #d97706); }
        .swatch-hijau  { background: linear-gradient(to right, #10b981, #059669); }
        .swatch-ungu   { background: linear-gradient(to right, #8b5cf6, #7c3aed); }
    </style>
</head>
<body class="text-slate-100 min-h-screen relative font-sans antialiased selection:bg-cyan-500 selection:text-white">

    <div id="themeBg" class="fixed inset-0 bg-theme-biru z-0 transition-all duration-700 ease-in-out"></div>

    <div class="relative z-10 max-w-4xl mx-auto px-4 py-8 flex flex-col min-h-screen justify-between">
        
        <header class="text-center mb-8 relative">
            <button id="bioMenuBtn" class="absolute left-0 top-0 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition backdrop-blur-md">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 6h16M4 12h16M4 18h16\"/>
                </svg>
            </button>
            <div class="inline-block p-1 bg-white/10 rounded-full backdrop-blur-md shadow-xl mb-4 animate-bounce">
                <img src="${logo}" alt="Logo" class="w-20 h-20 rounded-full border-2 border-white/20 object-cover" />
            </div>
            <h1 class="text-3xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">${headertitle}</h1>
            <p class="text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed opacity-90">${headerdescription}</p>
        </header>

        <div class="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint API..." 
                    class="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-5 pr-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2\" d=\"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\"/>
                </svg>
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">🔍</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1 text-white">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-slate-400">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-400 font-medium">
            <p>${footer}</p>
        </footer>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/60 z-40 hidden backdrop-blur-sm transition-opacity duration-300"></div>

    <div id="bioDropdown" class="fixed top-0 left-0 h-full w-80 bg-slate-900/95 border-r border-white/10 z-50 p-6 shadow-2xl transform -translate-x-full transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col justify-between backdrop-blur-xl">
        <div>
            <div class="flex justify-between items-center mb-8">
                <h3 class="font-bold text-lg text-white">Main Menu</h3>
                <button id="closeMenuBtn" class="p-2 text-slate-400 hover:text-white transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <nav class="space-y-2">
                <button id="themeToggle" class="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl transition text-left text-sm font-medium border border-white/5">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                    </svg>
                    <span>Ganti Warna Tema</span>
                </button>
            </nav>
        </div>
        
        <div class="text-xs text-slate-500 border-t border-white/10 pt-4">
            Dashboard Version 2.0
        </div>
    </div>

    <div id="themeModalOverlay" class="fixed inset-0 bg-black/70 z-50 hidden flex items-center justify-center p-4 backdrop-blur-md">
        <div class="theme-dialog-panel transform scale-95 transition-all duration-300" id="themeDialog">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-slate-900 font-bold text-lg mx-auto">Tema</h2>
                <button id="closeThemeModal" class="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div class="theme-item-row" data-theme="biru">
                <div class="theme-swatch swatch-biru"></div>
                <div>
                    <p class="text-slate-800 font-bold text-sm">Biru (Asli)</p>
                    <p class="text-slate-400 text-xs">Ubah gradasi area atas</p>
                </div>
            </div>

            <div class="theme-item-row" data-theme="merah">
                <div class="theme-swatch swatch-merah"></div>
                <div>
                    <p class="text-slate-800 font-bold text-sm">Merah</p>
                    <p class="text-slate-400 text-xs">Ubah gradasi area atas</p>
                </div>
            </div>

            <div class="theme-item-row" data-theme="kuning">
                <div class="theme-swatch swatch-kuning"></div>
                <div>
                    <p class="text-slate-800 font-bold text-sm">Kuning</p>
                    <p class="text-slate-400 text-xs">Ubah gradasi area atas</p>
                </div>
            </div>

            <div class="theme-item-row" data-theme="hijau">
                <div class="theme-swatch swatch-hijau"></div>
                <div>
                    <p class="text-slate-800 font-bold text-sm">Hijau</p>
                    <p class="text-slate-400 text-xs">Ubah gradasi area atas</p>
                </div>
            </div>

            <div class="theme-item-row" data-theme="ungu">
                <div class="theme-swatch swatch-ungu"></div>
                <div>
                    <p class="text-slate-800 font-bold text-sm">Ungu</p>
                    <p class="text-slate-400 text-xs">Ubah gradasi area atas</p>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>`);
});

// Endpoint dummy untuk kelancaran fetch dashboard Anda
app.get('/api/apilist', (req, res) => {
    res.json([
        { name: "Gemini AI", category: "ai", endpoint: "/api/gemini", description: "Tanya jawab bersama AI" },
        { name: "TikTok Downloader", category: "downloader", endpoint: "/api/tt", description: "Download video tanpa watermark" }
    ]);
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:\${PORT}`);
});
