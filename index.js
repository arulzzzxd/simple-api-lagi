<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Arulz-XD</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --font-sans: 'Plus Jakarta Sans', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }
        body {
            font-family: var(--font-sans);
            background-color: #0b0f19;
            color: #f8fafc;
            transition: background-color 0.3s, color 0.3s;
            overflow-x: hidden;
        }
        body.light-mode {
            background-color: #f1f5f9;
            color: #0f172a;
        }
        .code-font {
            font-family: var(--font-mono);
        }
        .video-bg-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            overflow: hidden;
        }
        .video-bg-container video {
            min-width: 100%;
            min-height: 100%;
            width: auto;
            height: auto;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            object-fit: cover;
            opacity: 0.15;
        }
        body.light-mode .video-bg-container video {
            opacity: 0.25;
        }
        .overlay-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: radial-gradient(circle at top right, rgba(20, 30, 55, 0.6), transparent),
                        radial-gradient(circle at bottom left, rgba(10, 15, 30, 0.8), #0b0f19);
        }
        body.light-mode .overlay-bg {
            background: radial-gradient(circle at top right, rgba(219, 234, 254, 0.5), transparent),
                        radial-gradient(circle at bottom left, rgba(241, 245, 249, 0.8), #f1f5f9);
        }
        .glass-card {
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        body.light-mode .glass-card {
            background: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
        }
        .filter-btn {
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            font-family: var(--font-mono);
            text-transform: uppercase;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
            color: #94a3b8;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        body.light-mode .filter-btn {
            border: 1px solid rgba(15, 23, 42, 0.1);
            background: rgba(0, 0, 0, 0.03);
            color: #475569;
        }
        .filter-btn.active, .filter-btn:hover {
            background: #14b8a6;
            color: #000000;
            border-color: #14b8a6;
            box-shadow: 0 0 12px rgba(20, 184, 166, 0.4);
        }
        .status-ready { background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.3); }
        .status-update { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border-color: rgba(59, 130, 246, 0.3); }
        .status-error { background: rgba(239, 68, 68, 0.15); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
        .status-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }
        
        /* Toast Notification Styling */
        .toast-box {
            position: fixed;
            bottom: 24px;
            right: 24px;
            transform: translateY(150%);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 9999;
        }
        .toast-box.show { transform: translateY(0); }
        
        /* Media Player disk rotation styling */
        .music-rotate { animation: spin 12s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .spinner {
            width: 24px;
            height: 24px;
            border: 3px solid rgba(20, 184, 166, 0.2);
            border-top-color: #14b8a6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        .local-spinner {
            display: none;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(0,0,0,0.2);
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        .local-spinner.active { display: inline-block; }
    </style>
</head>
<body class="p-4 md:p-8 min-h-screen">

    <div class="video-bg-container">
        <video id="bg-video" autoplay loop muted playsinline src="https://cdn.pixabay.com/video/2020/02/24/32773-393278239_tiny.mp4"></video>
    </div>
    <div class="overlay-bg"></div>

    <header class="max-w-2xl mx-auto mb-6 flex items-center justify-between glass-card p-4 rounded-2xl relative">
        <div class="flex items-center gap-3">
            <img id="logoImg" src="https://arulz-uploader.vercel.app/files/SnhJe3.png" alt="Logo" class="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-md">
            <div>
                <h1 id="headerTitle" class="text-sm font-bold tracking-tight uppercase text-white light-mode:text-gray-900 leading-tight">API Explorer <br>& Tester</h1>
                <p id="headerDescription" class="text-[10px] text-gray-400 light-mode:text-gray-600 code-font mt-0.5">$ Browse, inspect & fire requests<br>against live endpoints._</p>
            </div>
        </div>
        
        <div class="flex items-center gap-2">
            <div class="flex bg-black/40 light-mode:bg-gray-200/60 rounded-lg p-0.5 border border-white/5 light-mode:border-gray-300">
                <button onclick="setLanguage('id')" id="lang-id" class="px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer opacity-50 [&.active]:opacity-100 [&.active]:bg-teal-500 [&.active]:text-black active">ID</button>
                <button onclick="setLanguage('en')" id="lang-en" class="px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer opacity-50 [&.active]:opacity-100 [&.active]:bg-teal-500 [&.active]:text-black">EN</button>
            </div>
            
            <button id="themeToggle" class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white transition-all active:scale-95 focus:outline-none border border-slate-800 cursor-pointer">
                <svg id="theme-toggle-dark-icon" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 00-1.414 0l-.707.707a1 1 0 001.414 1.414l.707-.707a1 1 0 000-1.414zM5.05 14.95l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zm-2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm11.314 2.12a1 1 0 101.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707zm-10.606 0a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707z"></path></svg>
                <svg id="theme-toggle-light-icon" class="w-4 h-4 text-indigo-600 hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            </button>
            
            <button id="bioMenuBtn" class="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500 text-black font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer">BIO</button>
        </div>
    </header>

    <section class="max-w-2xl mx-auto mb-6 grid grid-cols-3 gap-3">
        <div id="batteryContainer" class="glass-card p-3 rounded-xl flex flex-col justify-between relative overflow-hidden">
            <span id="stat-battery-title" class="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-2">Baterai</span>
            <div class="flex items-baseline gap-1 mt-1 z-10">
                <span id="batteryPercentage" class="text-xl font-black code-font text-white light-mode:text-gray-900">--%</span>
                <span id="batteryStatus" class="text-[9px] code-font text-gray-400 uppercase">Checking</span>
            </div>
            <div class="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden relative">
                <div id="batteryLevel" class="h-full bg-teal-500 rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
        </div>
        
        <div class="glass-card p-3 rounded-xl flex flex-col justify-between">
            <span id="stat-endpoints-title" class="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-2">Total Endpoint</span>
            <div class="mt-1">
                <span id="totalEndpoints" class="text-xl font-black code-font text-teal-400">0</span>
                <span class="text-[9px] code-font text-gray-400 block uppercase mt-1">Endpoints Active</span>
            </div>
        </div>

        <div class="glass-card p-3 rounded-xl flex flex-col justify-between">
            <span id="stat-categories-title" class="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-2">Total Kategori</span>
            <div class="mt-1">
                <span id="totalCategories" class="text-xl font-black code-font text-purple-400">REST</span>
                <span class="text-[9px] code-font text-gray-400 block uppercase mt-1">Structured Group</span>
            </div>
        </div>
    </section>

    <div class="max-w-2xl mx-auto mb-6 glass-card p-4 rounded-2xl">
        <div class="relative">
            <input 
                type="text" 
                id="searchInput" 
                placeholder="Cari endpoint berdasarkan nama, path, atau kategori..." 
                class="w-full bg-black/40 light-mode:bg-white text-sm px-4 py-3 pl-4 pr-10 rounded-xl border border-white/10 light-mode:border-gray-300 focus:outline-none focus:border-teal-500 transition-all code-font text-white light-mode:text-black placeholder-gray-400 light-mode:placeholder-gray-500"
            >
            <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
        </div>
        
        <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start overflow-x-auto pb-1 scrollbar-hide"></div>
    </div>

    <div id="noResults" class="text-center py-12 hidden glass-card rounded-2xl max-w-2xl mx-auto mb-6">
        <div class="text-4xl mb-2">🔍</div>
        <h3 id="no-results-title" class="text-sm font-bold mb-1">Endpoint tidak ditemukan</h3>
        <p id="no-results-desc" class="text-xs text-gray-400">Coba gunakan kata kunci lain</p>
    </div>

    <main id="apiList" class="space-y-4 max-w-2xl mx-auto mb-32"></main>

    <div id="toast" class="toast-box glass-card px-4 py-3 rounded-xl border border-teal-500/30 flex items-center gap-3 text-sm font-semibold text-white light-mode:text-gray-900 shadow-xl">
        <svg id="toastIcon" class="w-5 h-5 text-teal-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"></svg>
        <span id="toastMessage">Permintaan sukses dilakukan!</span>
    </div>

    <section class="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto glass-card rounded-2xl p-3 border border-white/10 shadow-2xl z-40">
        <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
                <img id="musicCoverImg" src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150" alt="Cover" class="w-10 h-10 rounded-lg object-cover border border-white/10 transition-transform duration-500 music-rotate">
                <div class="min-w-0">
                    <h4 id="musicTitle" class="text-xs font-bold text-white light-mode:text-gray-900 truncate uppercase tracking-wider">Loading Audio...</h4>
                    <p id="musicArtist" class="text-[10px] text-gray-400 light-mode:text-gray-500 code-font truncate mt-0.5">Please wait</p>
                </div>
            </div>
            
            <div class="flex items-center gap-3 flex-shrink-0">
                <button id="prevBtn" class="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Previous Track">
                    <svg class="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button id="playBtn" class="w-8 h-8 rounded-full bg-teal-500 text-black flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer" title="Play / Pause">
                    <svg id="playIcon" class="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <button id="nextBtn" class="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Next Track">
                    <svg class="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6z"/></svg>
                </button>
                <button id="playlistToggleBtn" class="p-1 text-gray-400 hover:text-teal-400 transition-colors cursor-pointer" title="Toggle Playlist">
                    <svg class="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h12v2H4z"/></svg>
                </button>
            </div>
        </div>

        <audio id="audioElement" preload="auto" class="hidden"></audio>

        <div id="progressContainer" class="w-full h-1 bg-white/10 light-mode:bg-gray-300 rounded-full mt-2.5 cursor-pointer relative overflow-hidden">
            <div id="progressBar" class="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transition-all duration-100" style="width: 0%"></div>
        </div>
        <div class="flex justify-between items-center text-[9px] text-gray-500 code-font mt-1">
            <span id="currentTime">0:00</span>
            <span id="totalDuration">0:00</span>
        </div>

        <div id="playlistPanel" class="hidden mt-3 max-h-32 overflow-y-auto pt-2 border-t border-white/10 light-mode:border-gray-200 space-y-1 pr-1"></div>
    </section>

    <div id="menuOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden transition-opacity duration-300"></div>

    <aside id="bioDropdown" class="fixed top-0 right-0 h-full w-64 glass-card border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between translate-x-full transition-transform duration-300 ease-in-out">
        <div>
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-black text-sm tracking-widest text-teal-400 uppercase code-font">Social Connect</h3>
                <button id="closeMenuBtn" class="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 text-gray-400 hover:text-white transition-colors text-xs font-bold cursor-pointer">×</button>
            </div>
            
            <div id="socialLoading" class="text-center py-8">
                <div class="spinner mx-auto mb-2"></div>
                <p class="text-[10px] text-gray-400 code-font">Loading links...</p>
            </div>
            
            <div id="socialError" class="text-center py-6 hidden">
                <p class="text-xs text-red-400">Failed to load social bio</p>
            </div>

            <div id="socialContainer" class="space-y-2.5"></div>
        </div>

        <footer id="siteFooter" class="pt-4 border-t border-white/10 text-center text-[10px] text-gray-500 code-font uppercase tracking-wider">© Arulz-XD</footer>
    </aside>

    <script src="script.js"></script>
</body>
</html>