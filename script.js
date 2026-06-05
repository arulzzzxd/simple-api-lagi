const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let currentLang = 'id'; // Standar awal Bahasa Indonesia
let allApiElements = [];
let totalEndpoints = 0;
let totalCategories = 0;
let batteryMonitor = null;

const themeToggleBtn = document.getElementById('themeToggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
const body = document.body;
const langSelect = document.getElementById('langSelect');

// Kamus Translasi Bahasa Indonesia & Inggris
const i18n = {
    id: {
        description: "Kumpulan API Endpoint yang mungkin berguna.",
        batteryCard: "Baterai Kamu",
        endpointsCard: "Total Endpoint",
        categoriesCard: "Total Kategori",
        searchPlaceholder: "Cari endpoint berdasarkan nama, jalur, atau kategori...",
        noResultTitle: "Endpoint tidak ditemukan",
        noResultDesc: "Coba gunakan kata kunci pencarian yang lain",
        bioTitle: "Link Bio",
        loading: "Memuat...",
        errorBio: "Link bio tidak tersedia.",
        batFull: "Penuh",
        batCharging: "Mengisi Daya",
        batDischarging: "Sisa Waktu",
        batLow: "Lemah"
    },
    en: {
        description: "A collection of API Endpoints that might be useful.",
        batteryCard: "Your Battery",
        endpointsCard: "Total Endpoints",
        categoriesCard: "Total Categories",
        searchPlaceholder: "Search endpoints by name, path, or category...",
        noResultTitle: "No endpoints found",
        noResultDesc: "Try a different search term",
        bioTitle: "Link Bio",
        loading: "Loading...",
        errorBio: "Link bio is unavailable.",
        batFull: "Full",
        batCharging: "Charging",
        batDischarging: "Discharging",
        batLow: "Low"
    }
};

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggleDarkIcon.classList.add('hidden');
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        body.classList.remove('light-mode');
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
    }
    
    updateSocialBadges();
}

function toggleTheme() {
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
        currentTheme = 'dark';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        themeToggleDarkIcon.classList.add('hidden');
        themeToggleLightIcon.classList.remove('hidden');
        currentTheme = 'light';
        localStorage.setItem('theme', 'light');
    }
}

// FUNGSI UNTUK MERUBAH BAHASA PADA HALAMAN
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    // Update teks elemen berdasarkan i18n
    document.getElementById('mainDescription').innerText = i18n[lang].description;
    document.getElementById('lang-stat-battery').innerText = i18n[lang].batteryCard;
    document.getElementById('lang-stat-endpoints').innerText = i18n[lang].endpointsCard;
    document.getElementById('lang-stat-categories').innerText = i18n[lang].categoriesCard;
    document.getElementById('searchInput').placeholder = i18n[lang].searchPlaceholder;
    document.getElementById('lang-no-result-title').innerText = i18n[lang].noResultTitle;
    document.getElementById('lang-no-result-desc').innerText = i18n[lang].noResultDesc;
    document.getElementById('lang-bio-title').innerText = i18n[lang].bioTitle;
    document.getElementById('lang-loading').innerText = i18n[lang].loading;
    document.getElementById('lang-error-bio').innerText = i18n[lang].errorBio;
    
    // Perbarui teks status baterai saat ini jika terdeteksi
    if (batteryMonitor) {
        updateBatteryStatusText(batteryMonitor);
    }
}

function initLanguage() {
    const savedLang = localStorage.getItem('lang') || 'id';
    langSelect.value = savedLang;
    applyLanguage(savedLang);
}

langSelect.addEventListener('change', (e) => {
    applyLanguage(e.target.value);
});

// SISTEM UTAMA DROPDOWN MENU LINK BIO
const bioMenuBtn = document.getElementById('bioMenuBtn');
const bioDropdown = document.getElementById('bioDropdown');

bioMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    bioDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!bioDropdown.contains(e.target) && e.target !== bioMenuBtn) {
        bioDropdown.classList.add('hidden');
    }
});

// KODE UNTUK AUDIO DAN LAIN-LAIN TETAP BERJALAN NORMAL SAMA SEPERTI SEBELUMNYA
let currentTrackIndex = 0;
const playlist = window.musicPlaylist || [];
const audioElement = document.getElementById('audioElement');
const musicCoverImg = document.getElementById('musicCoverImg');
const musicTitle = document.getElementById('musicTitle');
const musicArtist = document.getElementById('musicArtist');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const playlistToggleBtn = document.getElementById('playlistToggleBtn');
const playlistPanel = document.getElementById('playlistPanel');

function loadTrack(index) {
    if (!playlist || playlist.length === 0) return;
    const track = playlist[index];
    audioElement.src = track.url;
    musicCoverImg.src = track.cover;
    musicTitle.textContent = track.title;
    musicArtist.textContent = track.artist;
    
    // Reset progress bar
    progressBar.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    totalDurationEl.textContent = '0:00';
    
    updatePlaylistActiveUI();
}

function playTrack() {
    audioElement.play().then(() => {
        playIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
        musicCoverImg.classList.add('animate-spin');
    }).catch(err => console.log("Playback error:", err));
}

function pauseTrack() {
    audioElement.pause();
    playIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
    musicCoverImg.classList.remove('animate-spin');
}

function togglePlay() {
    if (audioElement.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

if(playlist.length > 0) {
    loadTrack(currentTrackIndex);
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    
    audioElement.addEventListener('timeupdate', () => {
        const current = audioElement.currentTime;
        const duration = audioElement.duration || 0;
        if (duration > 0) {
            const percentage = (current / duration) * 100;
            progressBar.style.width = `${percentage}%`;
            
            let currMin = Math.floor(current / 60);
            let currSec = Math.floor(current % 60);
            if (currSec < 10) currSec = `0${currSec}`;
            currentTimeEl.textContent = `${currMin}:${currSec}`;
            
            let durMin = Math.floor(duration / 60);
            let durSec = Math.floor(duration % 60);
            if (durSec < 10) durSec = `0${durSec}`;
            totalDurationEl.textContent = `${durMin}:${durSec}`;
        }
    });
    
    audioElement.addEventListener('ended', nextTrack);
    
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audioElement.duration;
        if(duration) {
            audioElement.currentTime = (clickX / width) * duration;
        }
    });
    
    // Membangun Panel Daftar Musik
    playlistPanel.innerHTML = '';
    playlist.forEach((track, i) => {
        const item = document.createElement('div');
        item.className = `playlist-item flex items-center gap-3 p-2 rounded-xl cursor-pointer text-xs transition-all hover:bg-slate-800/40 light-mode:hover:bg-gray-100`;
        item.innerHTML = `
            <img src="${track.cover}" class="w-8 h-8 rounded-lg object-cover">
            <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-200 light-mode:text-gray-800 truncate m-0">${track.title}</p>
                <p class="text-[10px] text-gray-500 truncate m-0 mt-0.5">${track.artist}</p>
            </div>
        `;
        item.addEventListener('click', () => {
            currentTrackIndex = i;
            loadTrack(currentTrackIndex);
            playTrack();
        });
        playlistPanel.appendChild(item);
    });
    
    playlistToggleBtn.addEventListener('click', () => {
        playlistPanel.classList.toggle('hidden');
    });
}

function updatePlaylistActiveUI() {
    const items = playlistPanel.querySelectorAll('.playlist-item');
    items.forEach((item, idx) => {
        if(idx === currentTrackIndex) {
            item.classList.add('bg-blue-600/10', 'border', 'border-blue-500/20');
        } else {
            item.classList.remove('bg-blue-600/10', 'border', 'border-blue-500/20');
        }
    });
}

// FUNGSI UPDATE STATUS BATERAI MULTI-BAHASA
function updateBatteryStatusText(battery) {
    const statusTextEl = document.getElementById('batteryStatus');
    if (battery.charging) {
        statusTextEl.textContent = i18n[currentLang].batCharging;
    } else {
        if (battery.level === 1) {
            statusTextEl.textContent = i18n[currentLang].batFull;
        } else {
            statusTextEl.textContent = i18n[currentLang].batDischarging;
        }
    }
}

function initBattery() {
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            batteryMonitor = battery;
            const level = Math.round(battery.level * 100);
            document.getElementById('batteryLevel').style.width = `${level}%`;
            document.getElementById('batteryPercentage').textContent = `${level}%`;
            updateBatteryStatusText(battery);
            
            battery.addEventListener('levelchange', () => {
                const currentLevel = Math.round(battery.level * 100);
                document.getElementById('batteryLevel').style.width = `${currentLevel}%`;
                document.getElementById('batteryPercentage').textContent = `${currentLevel}%`;
            });
            
            battery.addEventListener('chargingchange', () => {
                updateBatteryStatusText(battery);
            });
        });
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function updateSocialBadges() {
    const container = document.getElementById('socialContainer');
    const loading = document.getElementById('socialLoading');
    const errorEl = document.getElementById('socialError');
    
    fetch('/linkbio.json')
        .then(res => res.json())
        .then(data => {
            loading.classList.add('hidden');
            // Bersihkan sisa elemen di luar loading & error
            Array.from(container.children).forEach(child => {
                if(child !== loading && child !== errorEl) child.remove();
            });
            
            data.forEach(item => {
                const a = document.createElement('a');
                a.href = item.url;
                a.target = "_blank";
                a.className = "flex items-center gap-3 p-2.5 rounded-xl border border-slate-800 light-mode:border-gray-200 bg-[#0e1629]/50 light-mode:bg-gray-50 hover:bg-[#15223e] light-mode:hover:bg-gray-100 transition-all text-xs font-bold text-gray-300 light-mode:text-gray-700 decoration-none";
                a.innerHTML = `<span>${item.icon || '🔗'}</span> <span class="truncate">${item.name}</span>`;
                container.appendChild(a);
            });
        })
        .catch(err => {
            loading.classList.add('hidden');
            errorEl.classList.remove('hidden');
        });
}

function loadApiList() {
    const listContainer = document.getElementById('apiList');
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            listContainer.innerHTML = '';
            allApiElements = [];
            totalEndpoints = 0;
            totalCategories = data.categories.length;
            
            data.categories.forEach(cat => {
                const catSection = document.createElement('div');
                catSection.className = "mb-8 bg-[#090e1a] light-mode:bg-white border border-slate-800/60 light-mode:border-gray-200 rounded-2xl p-4 shadow-xl";
                
                const catTitle = document.createElement('h2');
                catTitle.className = "text-sm font-black tracking-widest text-blue-500 uppercase mb-4 pb-2 border-b border-slate-800/40 light-mode:border-gray-100";
                catTitle.textContent = cat.name;
                catSection.appendChild(catTitle);
                
                const grid = document.createElement('div');
                grid.className = "grid grid-cols-1 md:grid-cols-2 gap-3";
                
                cat.items.forEach(item => {
                    totalEndpoints++;
                    const card = document.createElement('div');
                    card.className = "p-3 rounded-xl bg-[#0e1629]/40 light-mode:bg-gray-50 border border-slate-800/40 light-mode:border-gray-200/60 flex items-center justify-between gap-2 hover:border-blue-500/40 transition-all";
                    
                    const info = document.createElement('div');
                    info.className = "min-w-0 flex-1";
                    
                    const name = document.createElement('h3');
                    name.className = "text-xs font-bold text-white light-mode:text-gray-800 uppercase truncate m-0 tracking-wider";
                    name.textContent = item.name.replace(/^\//, '');
                    
                    const pathSpan = document.createElement('p');
                    pathSpan.className = "text-[10px] text-gray-500 code-font truncate mt-1 m-0";
                    pathSpan.textContent = item.path;
                    
                    info.appendChild(name);
                    info.appendChild(pathSpan);
                    
                    const btn = document.createElement('a');
                    btn.href = item.path;
                    btn.target = "_blank";
                    btn.className = "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg tracking-wider transition-all shadow-md shadow-blue-600/10 active:scale-95 whitespace-nowrap decoration-none";
                    btn.textContent = "TRY";
                    
                    card.appendChild(info);
                    card.appendChild(btn);
                    grid.appendChild(card);
                    
                    allApiElements.push({
                        element: card,
                        categoryName: cat.name.toLowerCase(),
                        itemName: item.name.toLowerCase(),
                        itemPath: item.path.toLowerCase()
                    });
                });
                
                catSection.appendChild(grid);
                listContainer.appendChild(catSection);
            });
            
            document.getElementById('totalEndpoints').textContent = totalEndpoints;
            document.getElementById('totalCategories').textContent = totalCategories;
        });
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    let hasResults = false;
    
    allApiElements.forEach(item => {
        if (item.itemName.includes(query) || item.itemPath.includes(query) || item.categoryName.includes(query)) {
            item.element.classList.remove('hidden');
            hasResults = true;
        } else {
            item.element.classList.add('hidden');
        }
    });
    
    // Periksa apakah ada kategori kosong untuk disembunyikan
    document.querySelectorAll('#apiList > div').forEach(catSection => {
        const cards = catSection.querySelectorAll('.grid > div:not(.hidden)');
        if (cards.length === 0 && query !== '') {
            catSection.classList.add('hidden');
        } else {
            catSection.classList.remove('hidden');
        }
    });
    
    const noResultsEl = document.getElementById('noResults');
    if (!hasResults && query !== '') {
        noResultsEl.classList.remove('hidden');
    } else {
        noResultsEl.classList.add('hidden');
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
});

// Shortcut pencarian Ctrl + K
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// Inisialisasi awal aplikasi saat dokumen dimuat
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initBattery();
    loadApiList();
});