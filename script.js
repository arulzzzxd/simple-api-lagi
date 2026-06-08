const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'biru';
let activeCategory = 'all';

// Audio Player Settings
let currentTrackIndex = 0;
let isPlaying = false;
const audio = new Audio();
const playlist = window.DASHBOARD_PLAYLIST || [];

// Ambil element DOM asli Anda
const bioMenuBtn = document.getElementById('bioMenuBtn');
const bioDropdown = document.getElementById('bioDropdown');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const themeBg = document.getElementById('themeBg');
const themeToggleBtn = document.getElementById('themeToggle');

// Element Modal Baru
const themeModalOverlay = document.getElementById('themeModalOverlay');
const closeThemeModalBtn = document.getElementById('closeThemeModal');
const themeDialog = document.getElementById('themeDialog');
const themeRows = document.querySelectorAll('.theme-item-row');

// Fungsi Sidebar Menu
function closeSidebarMenu() {
    if (bioDropdown && menuOverlay) {
        bioDropdown.style.transform = 'translateX(-100%)';
        menuOverlay.classList.add('hidden');
    }
}

// Fungsi Modal Pilihan Tema
function openThemeModal() {
    closeSidebarMenu(); // Tutup sidebar dulu biar bersih
    if (themeModalOverlay) {
        themeModalOverlay.classList.remove('hidden');
        setTimeout(() => {
            themeDialog.classList.remove('scale-95');
            themeDialog.classList.add('scale-100');
        }, 10);
    }
}

function closeThemeModal() {
    if (themeModalOverlay) {
        themeDialog.classList.remove('scale-100');
        themeDialog.classList.add('scale-95');
        setTimeout(() => {
            themeModalOverlay.classList.add('hidden');
        }, 150);
    }
}

// Mengganti gradasi background berdasarkan pilihan warna
function setTheme(themeName) {
    currentTheme = themeName;
    if (themeBg) {
        themeBg.className = "fixed inset-0 z-0 transition-all duration-700 ease-in-out";
        themeBg.classList.add(`bg-theme-${themeName}`);
    }
    localStorage.setItem('selected-theme', themeName);
}

// === FITUR MUSIK UTAMA (DISEMATKAN KEMBALI AGAR TIDAK BUG) ===
function initMusic() {
    if (playlist.length === 0) return;
    
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    function loadTrack(index) {
        const track = playlist[index];
        audio.src = track.url;
        document.getElementById('music-title').textContent = track.title;
        document.getElementById('music-artist').textContent = track.artist;
        document.getElementById('music-cover').src = track.cover;
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            document.getElementById('playIcon').innerHTML = '<path d="M8 5v14l11-7z"/>';
        } else {
            audio.play().catch(err => console.log("User interaction required"));
            document.getElementById('playIcon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        }
        isPlaying = !isPlaying;
    }

    if(playBtn) playBtn.addEventListener('click', togglePlay);
    if(prevBtn) prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) audio.play();
    });
    if(nextBtn) nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) audio.play();
    });

    loadTrack(currentTrackIndex);
}

// === PROSES AMBIL DATA DAN LIVE SEARCH ===
function loadApis() {
    const apiListEl = document.getElementById('apiList');
    if (!apiListEl || !apiData) return;
    
    apiListEl.innerHTML = '';
    
    // Tampilkan total counter stats
    document.getElementById('stat-total').textContent = apiData.length;
    const categories = [...new Set(apiData.map(item => item.category))];
    document.getElementById('stat-categories').textContent = categories.length;

    apiData.forEach(api => {
        apiListEl.innerHTML += `
            <div class="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/10 transition">
                <div>
                    <h4 class="font-bold text-sm text-white">${api.name}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">${api.description}</p>
                </div>
                <span class="px-2 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase font-bold rounded-md tracking-wider">${api.category}</span>
            </div>`;
    });
}

// Inisialisasi Utama saat Halaman Selesai Dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // Ambil preferensi tema terakhir dari storage
    const savedTheme = localStorage.getItem('selected-theme');
    if (savedTheme) setTheme(savedTheme);

    // Setup Battery Stats Simulator
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            document.getElementById('stat-battery').textContent = `${Math.round(battery.level * 100)}%`;
        });
    } else {
        document.getElementById('stat-battery').textContent = '100%';
    }

    // Hubungkan Event Sidebar Menu
    if (bioMenuBtn) {
        bioMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bioDropdown.style.transform = 'translateX(0)';
            menuOverlay.classList.remove('hidden');
        });
    }
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebarMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeSidebarMenu);

    // Event Listener Membuka Modal Pilihan Tema lewat Menu Sidebar
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', openThemeModal);

    // Event Listener Menutup Modal Tema
    if (closeThemeModalBtn) closeThemeModalBtn.addEventListener('click', closeThemeModal);
    if (themeModalOverlay) {
        themeModalOverlay.addEventListener('click', closeThemeModal);
        themeDialog.addEventListener('click', (e) => e.stopPropagation());
    }

    // Logika pemilihan warna di dalam row modal
    themeRows.forEach(row => {
        row.addEventListener('click', () => {
            const targetColor = row.getAttribute('data-theme');
            setTheme(targetColor);
            closeThemeModal();
        });
    });

    // Jalankan Music Player bawaan
    initMusic();

    // Fetch API List Data asli
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(err => {
            const el = document.getElementById('apiList');
            if(el) el.innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><p>Gagal memuat data API</p></div>`;
        });
});
