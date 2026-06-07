const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let currentLang = 'id';
let allApiElements = [];
let totalEndpoints = 0;
let totalCategories = 0;
let activeCategory = 'all';

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

// === URL GIF LOGO ===
const GIF_LOGO_DARK = "https://media.giphy.com/media/26tn33aiTi1jIGsO4/giphy.gif"; 
const GIF_LOGO_LIGHT = "https://media.giphy.com/media/11ISwbgCxEzMyY/giphy.gif";

const categoryIcons = {
    'ai': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 1 1 12 2zm-2 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9 4H3v-2h18v2z"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    'tools': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.1L9 6 6 9 1.8 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    'default': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
};

const i18n = {
    id: {
        searchPlaceholder: "Cari endpoint berdasarkan nama, path, atau kategori...",
        noResultsTitle: "Endpoint tidak ditemukan",
        noResultsDesc: "Coba gunakan kata kunci lain",
        batteryLabel: "// Baterai",
        endpointNotAvailable: "⚠️ Endpoint ini tidak tersedia untuk pengujian",
        toastRequestWait: "Harap tunggu permintaan saat ini selesai",
        toastRequestSuccess: "Permintaan berhasil diselesaikan!",
        toastRequestFailed: "Permintaan gagal!"
    },
    en: {
        searchPlaceholder: "Search endpoints by name, path, or category...",
        noResultsTitle: "No endpoints found",
        noResultsDesc: "Try a different search term",
        batteryLabel: "// Battery",
        endpointNotAvailable: "⚠️ This endpoint is not available for testing",
        toastRequestWait: "Please wait for current request",
        toastRequestSuccess: "Request completed successfully!",
        toastRequestFailed: "Request failed!"
    }
};

// === FUNGSI MONITOR BATERAI (DIKEMBALIKAN) ===
function initBatteryMonitor() {
    const batteryStatusEl = document.getElementById('batteryStatus');
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryInfo() {
                const level = Math.round(battery.level * 100);
                batteryStatusEl.textContent = level + "%";
                if (battery.charging) {
                    batteryStatusEl.classList.add('text-green-400');
                } else {
                    batteryStatusEl.classList.remove('text-green-400');
                }
            }
            updateBatteryInfo();
            battery.addEventListener('levelchange', updateBatteryInfo);
            battery.addEventListener('chargingchange', updateBatteryInfo);
        });
    } else {
        batteryStatusEl.textContent = "N/A";
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const dynamicLogo = document.getElementById('dynamicLogo');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
    } else {
        body.classList.remove('light-mode');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
    }
    
    if (dynamicLogo) {
        dynamicLogo.src = savedTheme === 'light' ? GIF_LOGO_LIGHT : GIF_LOGO_DARK;
    }
    updateSocialBadges();
}

function toggleTheme() {
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const dynamicLogo = document.getElementById('dynamicLogo');
    
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
        currentTheme = 'dark';
        if(dynamicLogo) dynamicLogo.src = GIF_LOGO_DARK; 
    } else {
        body.classList.add('light-mode');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
        currentTheme = 'light';
        if(dynamicLogo) dynamicLogo.src = GIF_LOGO_LIGHT;
    }
    
    localStorage.setItem('theme', currentTheme);
    updateSocialBadges();
    if (apiData) loadApis();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    document.getElementById('lang-id').classList.toggle('active', lang === 'id');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    
    document.getElementById('searchInput').placeholder = i18n[lang].searchPlaceholder;
    document.getElementById('no-results-title').textContent = i18n[lang].noResultsTitle;
    document.getElementById('no-results-desc').textContent = i18n[lang].noResultsDesc;
    document.getElementById('batteryLabel').textContent = i18n[lang].batteryLabel;
    
    if (apiData) loadApis();
}

function updateSocialBadges() {
    const isLightMode = body.classList.contains('light-mode');
    document.querySelectorAll('.social-badge > div').forEach(badge => {
        badge.className = 'px-4 py-2 rounded-lg text-xs font-medium transition-colors text-center border';
        if (isLightMode) {
            badge.classList.add('bg-gray-100', 'text-gray-800', 'border-gray-200', 'hover:bg-gray-200');
        } else {
            badge.classList.add('bg-gray-800/50', 'text-gray-300', 'border-slate-800/60', 'hover:bg-gray-700');
        }
    });
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function copyText(text, type = 'path') {
    navigator.clipboard.writeText(text).then(() => { showToast(`${type} copied!`); });
}

function toggleCategory(index) {
    const content = document.getElementById(`cat-${index}`);
    const icon = document.getElementById(`cat-icon-${index}`);
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function closeSidebarMenu() {
    document.getElementById('bioDropdown').style.transform = 'translateX(100%)';
    document.getElementById('menuOverlay').classList.add('hidden');
}

function toggleEndpoint(catIdx, epIdx) {
    const content = document.getElementById(`ep-${catIdx}-${epIdx}`);
    const icon = document.getElementById(`ep-icon-${catIdx}-${epIdx}`);
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

async function executeRequest(e, catIdx, epIdx, method, path) {
    e.preventDefault();
    if (isRequestInProgress) { return showToast(i18n[currentLang].toastRequestWait, true); }

    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`);
    const responseContent = document.getElementById(`response-content-${catIdx}-${epIdx}`);
    
    isRequestInProgress = true;
    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) { if (value) params.append(key, value); }

    const fullPath = `${BASE_URL}${path.split('?')[0]}?${params.toString()}`;
    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = 'Loading...';

    try {
        const response = await fetch(fullPath);
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            const data = await response.json();
            responseContent.innerHTML = `<pre class="text-xs overflow-auto">${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            const text = await response.text();
            responseContent.innerHTML = `<pre class="text-xs overflow-auto">${text}</pre>`;
        }
        showToast(i18n[currentLang].toastRequestSuccess);
    } catch (error) {
        responseContent.innerHTML = `Error: ${error.message}`;
    } finally {
        isRequestInProgress = false;
    }
}

function clearResponse(catIdx, epIdx) { document.getElementById(`response-${catIdx}-${epIdx}`).classList.add('hidden'); }

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container || !apiData) return;
    let html = `<button class="filter-btn ${activeCategory==='all'?'active':''}" onclick="filterByCategory('all')">semua (${totalEndpoints})</button>`;
    apiData.categories.forEach(category => {
        const name = category.name.toLowerCase();
        html += `<button class="filter-btn ${activeCategory===name?'active':''}" onclick="filterByCategory('${name}')">${name}</button>`;
    });
    container.innerHTML = html;
}

function filterByCategory(catName) {
    activeCategory = catName;
    renderCategoryFilters();
    performSearch();
}

function loadApis() {
    const apiList = document.getElementById('apiList');
    if (!apiData) return;
    
    const isLightMode = body.classList.contains('light-mode');
    totalEndpoints = 0;
    apiData.categories.forEach(c => totalEndpoints += c.items.length);
    document.getElementById('totalEndpoints').textContent = totalEndpoints;
    
    renderCategoryFilters();
    let html = '';

    apiData.categories.forEach((category, catIdx) => {
        const catNameLower = category.name.toLowerCase();
        let iconSvg = categoryIcons.default;
        
        html += `
        <div class="category-group" data-category="${catNameLower}">
            <div class="${isLightMode ? 'bg-white border-gray-200 text-slate-900' : 'bg-[#111111] border-slate-800 text-white'} border rounded-xl overflow-hidden mb-4 shadow-sm">
                <button onclick="toggleCategory(${catIdx})" class="w-full px-4 py-4 flex items-center justify-between hover:opacity-80 transition-opacity">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-lg">${iconSvg}</div>
                        <div class="text-left">
                            <h3 class="font-bold text-sm uppercase tracking-wider">${category.name}</h3>
                        </div>
                    </div>
                </button>
                <div id="cat-${catIdx}" class="hidden p-2 space-y-2">`;

        category.items.forEach((item, epIdx) => {
            const method = item.methods?.[0] || 'GET';
            const path = item.path.split('?')[0];

            html += `
            <div class="api-item border-t ${isLightMode?'border-gray-100':'border-slate-800'} pt-2" data-path="${path}" data-category="${catNameLower}">
                <button onclick="toggleEndpoint(${catIdx}, ${epIdx})" class="w-full text-left font-mono text-xs flex justify-between p-2 rounded hover:bg-slate-500/10">
                    <span><span class="text-green-500 font-bold mr-2">${method}</span>${path}</span>
                </button>
                <div id="ep-${catIdx}-${epIdx}" class="hidden p-3 bg-slate-500/5 rounded mt-1 space-y-3">
                    <p class="text-xs opacity-70">${item.desc}</p>
                    
                    <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${method}', '${path}')">
                        <div class="space-y-2">`;
            if (item.params) {
                Object.keys(item.params).forEach(p => {
                    html += `
                    <div>
                        <label class="block text-[11px] font-bold mb-1">${p}</label>
                        <input type="text" name="${p}" class="w-full text-xs p-2 rounded border border-slate-700 bg-slate-950 text-white light-mode:bg-white light-mode:text-slate-900 light-mode:border-gray-300 focus:outline-none focus:border-yellow-500">
                    </div>`;
                });
            }
            html += `
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button type="submit" class="bg-yellow-500 text-black font-bold text-xs px-4 py-1.5 rounded">EXECUTE</button>
                            <button type="button" onclick="clearResponse(${catIdx},${epIdx})" class="border border-slate-600 text-xs px-4 py-1.5 rounded">CLEAR</button>
                        </div>
                    </form>
                    <div id="response-${catIdx}-${epIdx}" class="hidden p-3 bg-black text-green-400 rounded text-xs border border-slate-800" id="response-content-${catIdx}-${epIdx}">
                        <div id="response-content-${catIdx}-${epIdx}"></div>
                    </div>
                </div>
            </div>`;
        });

        html += `</div></div></div>`;
    });
    apiList.innerHTML = html;
}

function performSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    document.querySelectorAll('.category-group').forEach(cat => {
        const catName = cat.dataset.category;
        if (activeCategory !== 'all' && catName !== activeCategory) {
            cat.classList.add('hidden');
            return;
        }
        let hasVisible = false;
        cat.querySelectorAll('.api-item').forEach(item => {
            if (item.dataset.path.toLowerCase().includes(q)) {
                item.classList.remove('hidden');
                hasVisible = true;
            } else {
                item.classList.add('hidden');
            }
        });
        cat.classList.toggle('hidden', !hasVisible);
    });
}

async function loadLinkBio() {
    try {
        const response = await fetch('linkbio.json');
        const socialData = await response.json();
        document.getElementById('socialLoading').classList.add('hidden');
        const container = document.getElementById('socialContainer');
        container.innerHTML = '';
        socialData.link_bio.forEach(social => {
            const a = document.createElement('a');
            a.href = social.url; a.target = '_blank'; a.className = 'social-badge w-full';
            const d = document.createElement('div');
            d.textContent = social.name;
            a.appendChild(d); container.appendChild(a);
        });
        updateSocialBadges();
    } catch (e) {
        document.getElementById('socialLoading').classList.add('hidden');
        document.getElementById('socialError').classList.remove('hidden');
    }
}

function initMultiMusicPlayer() {
    const playlist = window.musicPlaylist || [];
    if (!playlist.length) return;
    let currentTrackIdx = 0;
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

    function loadTrack(index) {
        currentTrackIdx = index;
        const track = playlist[index];
        audio.src = track.url;
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;
        coverImg.src = track.cover;
    }

    playBtn.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
    audio.addEventListener('play', () => { playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; });
    audio.addEventListener('pause', () => { playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'; });
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            currentTimeEl.textContent = Math.floor(audio.currentTime/60) + ":" + String(Math.floor(audio.currentTime%60)).padStart(2,'0');
        }
    });
    audio.addEventListener('loadedmetadata', () => {
        totalDurationEl.textContent = Math.floor(audio.duration/60) + ":" + String(Math.floor(audio.duration%60)).padStart(2,'0');
    });
    document.getElementById('prevBtn').addEventListener('click', () => { loadTrack(currentTrackIdx - 1 < 0 ? playlist.length - 1 : currentTrackIdx - 1); audio.play(); });
    document.getElementById('nextBtn').addEventListener('click', () => { loadTrack(currentTrackIdx + 1 >= playlist.length ? 0 : currentTrackIdx + 1); audio.play(); });
    
    loadTrack(0);
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initBatteryMonitor(); // Panggil fungsi baterai saat dokumen siap
    loadLinkBio();
    initMultiMusicPlayer();
    setLanguage(localStorage.getItem('lang') || 'id');
    
    const bioMenuBtn = document.getElementById('bioMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    if (bioMenuBtn) {
        bioMenuBtn.addEventListener('click', () => {
            document.getElementById('bioDropdown').style.transform = 'translateX(0)';
            menuOverlay.classList.remove('hidden');
        });
    }
    if (menuOverlay) menuOverlay.addEventListener('click', closeSidebarMenu);
    document.getElementById('closeMenuBtn')?.addEventListener('click', closeSidebarMenu);

    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => { apiData = data; loadApis(); });
});

themeToggleBtn.addEventListener('click', toggleTheme);
document.getElementById('searchInput').addEventListener('input', performSearch);
