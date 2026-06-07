const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let currentLang = 'id';
let allApiElements = [];
let totalEndpoints = 0;
let totalCategories = 0;
let batteryMonitor = null;
let activeCategory = 'all';

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

// Video links matching each theme as required
const themeVideos = {
    dark: 'https://assets.mixkit.co/videos/preview/mixkit-sea-turtle-swimming-underwater-42994-large.mp4',
    light: 'https://assets.mixkit.co/videos/preview/mixkit-underwater-light-rays-and-bubbles-43015-large.mp4'
};

// Pemetaan Ikon Kategori (SVG Teal modern diselaraskan dengan gambar)
const categoryIcons = {
    'ai': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-cyan-400"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 1 1 12 2zm-2 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-cyan-400"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9 4H3v-2h18v2z"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-cyan-400"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-cyan-400"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    'tools': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-cyan-400"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.1L9 6 6 9 1.8 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    'default': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-cyan-400"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
};

const i18n = {
    id: {
        searchPlaceholder: "Cari endpoint...",
        noResultsTitle: "Endpoint tidak ditemukan",
        noResultsDesc: "Coba gunakan kata kunci lain",
        batteryTitle: "Baterai Anda",
        endpointsTitle: "Total Endpoint",
        categoriesTitle: "Total Kategori",
        batteryDetecting: "Mendeteksi...",
        batteryCharging: "Mengisi Daya",
        batteryFull: "Penuh",
        batteryDischarging: "Menguras Daya",
        endpointsCount: "endpoints",
        btnExecute: "Eksekusi",
        btnClear: "Bersihkan",
        toastRequestWait: "Harap tunggu permintaan selesai",
        toastRequestSuccess: "Permintaan berhasil!",
        toastRequestFailed: "Permintaan gagal!"
    },
    en: {
        searchPlaceholder: "Search endpoints...",
        noResultsTitle: "No endpoints found",
        noResultsDesc: "Try a different search term",
        batteryTitle: "Your Battery",
        endpointsTitle: "Total Endpoints",
        categoriesTitle: "Total Categories",
        batteryDetecting: "Detecting...",
        batteryCharging: "Charging",
        batteryFull: "Fully charged",
        batteryDischarging: "Discharging",
        endpointsCount: "endpoints",
        btnExecute: "Execute",
        btnClear: "Clear",
        toastRequestWait: "Please wait for current request",
        toastRequestSuccess: "Request completed!",
        toastRequestFailed: "Request failed!"
    }
};

function updateVideoSource(theme) {
    const video = document.getElementById('bg-video');
    if (video) {
        video.style.opacity = '0';
        setTimeout(() => {
            video.src = themeVideos[theme];
            video.load();
            video.play().catch(e => console.log("Video autoplay blocked or ready: ", e));
            video.style.opacity = '1';
        }, 300);
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
    } else {
        body.classList.remove('light-mode');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
    }
    updateVideoSource(currentTheme);
}

function toggleTheme() {
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
        currentTheme = 'dark';
    } else {
        body.classList.add('light-mode');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
        currentTheme = 'light';
    }
    
    localStorage.setItem('theme', currentTheme);
    updateVideoSource(currentTheme);
    if (apiData) loadApis();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    const idBtn = document.getElementById('lang-id');
    const enBtn = document.getElementById('lang-en');
    if (idBtn && enBtn) {
        idBtn.classList.toggle('active', lang === 'id');
        enBtn.classList.toggle('active', lang === 'en');
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = i18n[lang].searchPlaceholder;
    
    if (batteryMonitor) {
        window.dispatchEvent(new Event('batteryupdate-hook'));
    }
}

function initBatteryDetection() {
    const batteryLevelElement = document.getElementById('batteryLevel');
    const batteryPercentageElement = document.getElementById('batteryPercentage');
    const batteryStatusElement = document.getElementById('batteryStatus');
    
    if (!batteryLevelElement || !batteryPercentageElement) return;

    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryInfo() {
                const level = battery.level * 100;
                const isCharging = battery.charging;
                const roundedLevel = Math.round(level);
                
                batteryPercentageElement.textContent = `${roundedLevel}%`;
                batteryLevelElement.style.width = `${level}%`;
                
                if (isCharging) {
                    if (batteryStatusElement) batteryStatusElement.textContent = i18n[currentLang].batteryCharging;
                } else {
                    if (batteryStatusElement) {
                        batteryStatusElement.textContent = battery.dischargingTime === Infinity 
                            ? i18n[currentLang].batteryFull 
                            : i18n[currentLang].batteryDischarging;
                    }
                }
            }
            
            updateBatteryInfo();
            battery.addEventListener('levelchange', updateBatteryInfo);
            battery.addEventListener('chargingchange', updateBatteryInfo);
            window.addEventListener('batteryupdate-hook', updateBatteryInfo);
            batteryMonitor = battery;
            
        }).catch(function() { fallbackBattery(); });
    } else {
        fallbackBattery();
    }
    
    function fallbackBattery() {
        if (batteryStatusElement) batteryStatusElement.textContent = 'Simulated';
        batteryPercentageElement.textContent = '100%';
        batteryLevelElement.style.width = '100%';
    }
}

function cleanupBatteryMonitor() {
    if (batteryMonitor) batteryMonitor = null;
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.transform = 'translateY(80px)';
        toast.style.opacity = '0';
    }, 3000);
}

function copyText(text, type = 'path') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${type} berhasil disalin!`);
    }).catch(() => {
        showToast('Gagal menyalin', true);
    });
}

function toggleCategory(index) {
    const content = document.getElementById(`cat-${index}`);
    const icon = document.getElementById(`cat-icon-${index}`);
    if (content) content.classList.toggle('hidden');
    if (icon) icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function closeSidebarMenu() {
    const bioDropdown = document.getElementById('bioDropdown');
    const menuOverlay = document.getElementById('menuOverlay');
    if (bioDropdown) bioDropdown.style.transform = 'translateX(100%)';
    if (menuOverlay) menuOverlay.classList.add('hidden');
}

function toggleEndpoint(catIdx, epIdx) {
    const content = document.getElementById(`ep-${catIdx}-${epIdx}`);
    const icon = document.getElementById(`ep-icon-${catIdx}-${epIdx}`);
    if (content) content.classList.toggle('hidden');
    if (icon) icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

async function executeRequest(e, catIdx, epIdx, method, path) {
    e.preventDefault();
    if (isRequestInProgress) {
        showToast(i18n[currentLang].toastRequestWait, true);
        return;
    }

    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`);
    const responseContent = document.getElementById(`response-content-${catIdx}-${epIdx}`);
    const executeBtn = form.querySelector('button[type="submit"]');
    
    isRequestInProgress = true;
    if (executeBtn) executeBtn.disabled = true;
    
    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }

    const fullPath = `${BASE_URL}${path.split('?')[0]}?${params.toString()}`;
    if (responseDiv) responseDiv.classList.remove('hidden');
    if (responseContent) responseContent.innerHTML = '<div class="text-xs text-cyan-400 code-font animate-pulse">Executing request...</div>';

    try {
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            const data = await response.json();
            responseContent.innerHTML = `<pre class="code-font text-xs overflow-auto text-cyan-300 max-h-64 p-2 bg-black/40 rounded">${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            const text = await response.text();
            responseContent.innerHTML = `<pre class="code-font text-xs overflow-auto text-slate-300 max-h-64 p-2 bg-black/40 rounded">${text}</pre>`;
        }
        showToast(i18n[currentLang].toastRequestSuccess);
    } catch (error) {
        responseContent.innerHTML = `<pre class="text-red-400 code-font text-xs">Error: ${error.message}</pre>`;
        showToast(i18n[currentLang].toastRequestFailed, true);
    } {
        isRequestInProgress = false;
        if (executeBtn) executeBtn.disabled = false;
    }
}

function clearResponse(catIdx, epIdx) {
    const el = document.getElementById(`response-${catIdx}-${epIdx}`);
    if (el) el.classList.add('hidden');
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container || !apiData || !apiData.categories) return;

    let html = `<button class="filter-btn active" data-filter="all" onclick="filterByCategory('all')">ALL (${totalEndpoints})</button>`;
    apiData.categories.forEach(category => {
        const catName = category.name.toLowerCase();
        html += `<button class="filter-btn" data-filter="${catName}" onclick="filterByCategory('${catName}')">${category.name} (${category.items.length})</button>`;
    });
    container.innerHTML = html;
}

function filterByCategory(catName) {
    activeCategory = catName;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === catName);
    });
    performSearch();
}

function loadApis() {
    const apiList = document.getElementById('apiList');
    if (!apiData || !apiData.categories) return;
    
    totalEndpoints = 0;
    apiData.categories.forEach(c => { totalEndpoints += c.items.length; });
    
    const totalEndpointsEl = document.getElementById('totalEndpoints');
    if (totalEndpointsEl) totalEndpointsEl.textContent = totalEndpoints;
    
    renderCategoryFilters();
    
    let html = '';
    apiData.categories.forEach((category, catIdx) => {
        const catNameLower = category.name.toLowerCase();
        let iconSvg = categoryIcons.default;
        for (const [key, svg] of Object.entries(categoryIcons)) {
            if (catNameLower.includes(key)) { iconSvg = svg; break; }
        }

        html += `
        <div class="category-group" data-category="${catNameLower}">
            <div class="glass-card rounded-xl overflow-hidden mb-4">
                <button onclick="toggleCategory(${catIdx})" class="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 flex items-center justify-center bg-black/40 rounded-lg border border-white/5">
                            ${iconSvg}
                        </div>
                        <div class="text-left">
                            <h3 class="font-bold text-xs tracking-wider uppercase text-white">${category.name}</h3>
                        </div>
                    </div>
                    <svg id="cat-icon-${catIdx}" class="w-4 h-4 text-slate-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div id="cat-${catIdx}" class="hidden px-2 pb-2 space-y-1">`;
        
        category.items.forEach((item, epIdx) => {
            const method = item.methods && item.methods.length ? item.methods[0] : 'GET';
            html += `
            <div class="api-item rounded-lg overflow-hidden border border-white/5 bg-black/10" data-path="${item.path.toLowerCase()}" data-category="${catNameLower}">
                <button onclick="toggleEndpoint(${catIdx}, ${epIdx})" class="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/5 text-left">
                    <div class="flex items-center gap-2 truncate flex-1">
                        <span class="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[9px] font-bold code-font">${method}</span>
                        <span class="code-font text-xs truncate text-slate-200">${item.path}</span>
                    </div>
                </button>
                <div id="ep-${catIdx}-${epIdx}" class="hidden p-3 bg-black/20 border-t border-white/5 space-y-3">
                    <p class="text-slate-400 text-xs">${item.desc}</p>
                    <div class="flex gap-2">
                        <button onclick="copyText('${BASE_URL}${item.path}', 'URL')" class="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] code-font text-slate-300">Copy URL</button>
                    </div>
                    <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${method}', '${item.path}')" class="space-y-3">
                        <div class="space-y-2">`;
            
            if (item.params) {
                Object.keys(item.params).forEach(pName => {
                    html += `
                    <div>
                        <label class="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 code-font">${pName}</label>
                        <input type="text" name="${pName}" class="w-full px-3 py-1.5 rounded-lg bg-black text-cyan-400 border border-white/10 text-xs code-font focus:outline-none focus:border-cyan-400" placeholder="Masukkan parameter...">
                    </div>`;
                });
            }
            
            html += `
                        </div>
                        <div class="flex gap-2">
                            <button type="submit" class="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded font-bold text-xs uppercase tracking-wider transition-all">Execute</button>
                            <button type="button" onclick="clearResponse(${catIdx}, ${epIdx})" class="px-4 py-1.5 bg-white/5 text-slate-300 rounded text-xs transition-colors">Clear</button>
                        </div>
                    </form>
                    <div id="response-${catIdx}-${epIdx}" class="hidden mt-2">
                        <div class="p-2 rounded bg-black/40 border border-white/5" id="response-content-${catIdx}-${epIdx}"></div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div></div></div>`;
    });
    apiList.innerHTML = html;
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    let dynamicMatchCount = 0;

    document.querySelectorAll('.category-group').forEach(group => {
        const catName = group.dataset.category;
        if (activeCategory !== 'all' && catName !== activeCategory) {
            group.classList.add('hidden');
            return;
        }

        let innerMatch = false;
        group.querySelectorAll('.api-item').forEach(item => {
            const pathMatch = item.dataset.path.includes(query);
            item.classList.toggle('hidden', !pathMatch);
            if (pathMatch) { innerMatch = true; dynamicMatchCount++; }
        });
        group.classList.toggle('hidden', !innerMatch);
    });
    if (noResults) noResults.classList.toggle('hidden', dynamicMatchCount > 0);
}

function initMultiMusicPlayer() {
    const playlist = window.musicPlaylist || [];
    if (!playlist.length) return;

    let trackIdx = 0;
    const audio = document.getElementById('audioElement');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const currentTimeEl = document.getElementById('currentTime');
    const totalDurationEl = document.getElementById('totalDuration');
    const coverImg = document.getElementById('musicCoverImg');
    const titleEl = document.getElementById('musicTitle');
    const artistEl = document.getElementById('musicArtist');

    function loadTrack(idx) {
        trackIdx = idx;
        const t = playlist[idx];
        audio.src = t.url;
        titleEl.textContent = t.title;
        artistEl.textContent = t.artist;
        coverImg.src = t.cover;
    }

    playBtn.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
    audio.addEventListener('play', () => { playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; });
    audio.addEventListener('pause', () => { playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'; });
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            currentTimeEl.textContent = `${Math.floor(audio.currentTime/60)}:${String(Math.floor(audio.currentTime%60)).padStart(2,'0')}`;
        }
    });
    audio.addEventListener('loadedmetadata', () => {
        totalDurationEl.textContent = `${Math.floor(audio.duration/60)}:${String(Math.floor(audio.duration%60)).padStart(2,'0')}`;
    });
    progressContainer.addEventListener('click', (e) => {
        if (audio.duration) audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration;
    });
    document.getElementById('prevBtn').addEventListener('click', () => { loadTrack(trackIdx - 1 < 0 ? playlist.length - 1 : trackIdx - 1); audio.play(); });
    document.getElementById('nextBtn').addEventListener('click', () => { loadTrack(trackIdx + 1 >= playlist.length ? 0 : trackIdx + 1); audio.play(); });
    
    loadTrack(0);
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initBatteryDetection();
    initMultiMusicPlayer();
    
    const bioMenuBtn = document.getElementById('bioMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (bioMenuBtn && menuOverlay) {
        bioMenuBtn.addEventListener('click', () => {
            document.getElementById('bioDropdown').style.transform = 'translateX(0)';
            menuOverlay.classList.remove('hidden');
        });
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebarMenu);
        menuOverlay.addEventListener('click', closeSidebarMenu);
    }
    
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        });
});

themeToggleBtn.addEventListener('click', toggleTheme);
document.getElementById('searchInput').addEventListener('input', performSearch);
window.addEventListener('beforeunload', cleanupBatteryMonitor);