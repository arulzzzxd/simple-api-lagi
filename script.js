const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'biru'; // Default tema awal
let activeCategory = 'all';

// Elemen Sidebar & Utama
const themeToggleBtn = document.getElementById('themeToggle');
const bioMenuBtn = document.getElementById('bioMenuBtn');
const bioDropdown = document.getElementById('bioDropdown');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const themeBg = document.getElementById('themeBg');

// Elemen Modal Tema Baru
const themeModalOverlay = document.getElementById('themeModalOverlay');
const closeThemeModalBtn = document.getElementById('closeThemeModal');
const themeDialog = document.getElementById('themeDialog');
const themeRows = document.querySelectorAll('.theme-item-row');

// Fungsi menutup Sidebar Menu
function closeSidebarMenu() {
    if (bioDropdown && menuOverlay) {
        bioDropdown.style.transform = 'translateX(-100%)';
        menuOverlay.classList.add('hidden');
    }
}

// Fungsi membuka Modal Pilihan Warna Tema
function openThemeModal() {
    closeSidebarMenu(); // Tutup sidebar dulu biar rapi
    if (themeModalOverlay) {
        themeModalOverlay.classList.remove('hidden');
        setTimeout(() => {
            themeDialog.classList.remove('scale-95');
            themeDialog.classList.add('scale-100');
        }, 10);
    }
}

// Fungsi menutup Modal Pilihan Warna Tema
function closeThemeModal() {
    if (themeModalOverlay) {
        themeDialog.classList.remove('scale-100');
        themeDialog.classList.add('scale-95');
        setTimeout(() => {
            themeModalOverlay.classList.add('hidden');
        }, 150);
    }
}

// Fungsi Mengubah Class Tema pada Background
function setTheme(themeName) {
    currentTheme = themeName;
    
    // Reset seluruh class background tema lama
    themeBg.className = "fixed inset-0 z-0 transition-all duration-700 ease-in-out";
    
    // Tambahkan class tema baru yang dipilih
    themeBg.classList.add(`bg-theme-${themeName}`);
    
    // Simpan preferensi di LocalStorage supaya tidak hilang saat reload
    localStorage.setItem('selected-theme', themeName);
}

// Inisialisasi Event Listener setelah DOM Siap
document.addEventListener('DOMContentLoaded', () => {
    
    // Muat tema tersimpan dari localStorage jika ada
    const savedTheme = localStorage.getItem('selected-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    // Event Sidebar Menu Toggle
    if (bioMenuBtn && bioDropdown && menuOverlay) {
        bioMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bioDropdown.style.transform = 'translateX(0)';
            menuOverlay.classList.remove('hidden');
        });
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebarMenu);
        menuOverlay.addEventListener('click', closeSidebarMenu);
        bioDropdown.addEventListener('click', (e) => { e.stopPropagation(); });
    }

    // Klik Tombol Ganti Tema di dalam Menu -> Buka Modal
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', openThemeModal);
    }

    // Event Tutup Modal Tema
    if (closeThemeModalBtn) closeThemeModalBtn.addEventListener('click', closeThemeModal);
    if (themeModalOverlay) {
        themeModalOverlay.addEventListener('click', closeThemeModal);
        themeDialog.addEventListener('click', (e) => e.stopPropagation());
    }

    // Klik pada setiap baris pilihan warna tema
    themeRows.forEach(row => {
        row.addEventListener('click', () => {
            const selectedColor = row.getAttribute('data-theme');
            setTheme(selectedColor);
            closeThemeModal(); // Otomatis tutup setelah milih warna
        });
    });

    // Ambil Data List API
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(err => {
            const apiListEl = document.getElementById('apiList');
            if(apiListEl) {
                apiListEl.innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><div class="text-4xl mb-4">⚠️</div><h3 class="font-bold text-lg mb-2">Failed to load API data</h3></div>`;
            }
        });
});

// Fungsi pembantu render API di halaman utama
function loadApis() {
    const apiListEl = document.getElementById('apiList');
    if (!apiListEl || !apiData) return;
    
    apiListEl.innerHTML = '';
    apiData.forEach(api => {
        apiListEl.innerHTML += `
            <div class="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/10 transition">
                <div>
                    <h4 class="font-bold text-sm text-white">${api.name}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">${api.description}</p>
                </div>
                <span class="px-2 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase font-bold rounded-md tracking-wider">${api.category}</span>
            </div>
        `;
    });
}
