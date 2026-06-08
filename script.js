const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'light';
let currentLang = 'id';
let totalEndpoints = 0;
let totalCategories = 0;
let activeCategory = 'all';

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const themeBg = document.getElementById('themeBg');

const i18n = {
    id: {
        searchPlaceholder: "Cari endpoint berdasarkan nama atau path...",
        noResultsTitle: "Endpoint tidak ditemukan",
        noResultsDesc: "Coba gunakan kata kunci lain",
        batteryTitle: "Statistik Baterai",
        endpointsTitle: "Total Endpoints",
        categoriesTitle: "Total Kategori",
        btnExecute: "Eksekusi",
        endpointNotAvailable: "⚠️ Endpoint tidak tersedia",
        toastRequestWait: "Harap tunggu proses selesai",
        toastRequestSuccess: "Permintaan berhasil!",
        toastRequestFailed: "Permintaan gagal!"
    },
    en: {
        searchPlaceholder: "Search endpoints by name or path...",
        noResultsTitle: "No endpoints found",
        noResultsDesc: "Try another keyword",
        batteryTitle: "Battery Stats",
        endpointsTitle: "Total Endpoints",
        categoriesTitle: "Total Categories",
        btnExecute: "Execute",
        endpointNotAvailable: "⚠️ Endpoint not available",
        toastRequestWait: "Please wait for current request",
        toastRequestSuccess: "Request successful!",
        toastRequestFailed: "Request failed!"
    }
};

function updateThemeBackground(theme) {
    if (themeBg) {
        if (theme === 'light') {
            themeBg.className = "fixed inset-0 -z-50 bg-gradient-to-tr from-[#ffeef0] via-[#fff5f6] to-[#fceedf] transition-all duration-500";
            body.classList.remove('dark-mode');
        } else {
            themeBg.className = "fixed inset-0 -z-50 bg-gradient-to-br from-[#1a1113] via-[#24171a] to-[#150d0f] transition-all duration-500";
            body.classList.add('dark-mode');
        }
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    updateThemeBackground(currentTheme);
}

function toggleTheme() {
    if (currentTheme === 'light') {
        currentTheme = 'dark';
    } else {
        currentTheme = 'light';
    }
    localStorage.setItem('theme', currentTheme);
    updateThemeBackground(currentTheme);
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    document.getElementById('lang-id').className = lang === 'id' ? 'px-3 py-1 text-xs font-bold bg-rose-500 text-white' : 'px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700';
    document.getElementById('lang-en').className = lang === 'en' ? 'px-3 py-1 text-xs font-bold bg-rose-500 text-white' : 'px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700';
    
    document.getElementById('searchInput').placeholder = i18n[lang].searchPlaceholder;
    document.getElementById('no-results-title').textContent = i18n[lang].noResultsTitle;
    document.getElementById('no-results-desc').textContent = i18n[lang].noResultsDesc;
    
    if (apiData) loadApis();
}

function initBatteryDetection() {
    const batteryPercentageElement = document.getElementById('batteryPercentage');
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryInfo() {
                batteryPercentageElement.textContent = `${Math.round(battery.level * 100)} %`;
            }
            updateBatteryInfo();
            battery.addEventListener('levelchange', updateBatteryInfo);
        }).catch(() => { fallbackBattery(); });
    } else {
        fallbackBattery();
    }
    function fallbackBattery() {
        batteryPercentageElement.textContent = '10.9 %';
    }
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 16px)';
    }, 3000);
}

function loadApis() {
    const apiList = document.getElementById('apiList');
    const filtersContainer = document.getElementById('categoryFilters');
    apiList.innerHTML = '';
    filtersContainer.innerHTML = '';

    // Render Filter Category Atas
    let filterHtml = `<button onclick="filterCategory('all')" class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeCategory === 'all' ? 'bg-rose-500 text-white' : 'bg-white border text-slate-600 border-rose-100'}">All Filter</button>`;
    
    totalEndpoints = 0;
    totalCategories = apiData.categories.length;

    apiData.categories.forEach((cat) => {
        const catName = cat.name.toLowerCase();
        totalEndpoints += cat.items.length;

        filterHtml += `<button onclick="filterCategory('${catName}')" class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeCategory === catName ? 'bg-rose-500 text-white' : 'bg-white border text-slate-600 border-rose-100'}">${cat.name}</button>`;

        if (activeCategory !== 'all' && activeCategory !== catName) return;

        // Render Panel Utama Cards
        let catHtml = `
            <div class="theme-card p-5">
                <h2 class="text-lg font-bold text-rose-600 border-b-2 border-rose-100 pb-2 mb-4 uppercase tracking-wider">${cat.name} Endpoints</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        `;

        cat.items.forEach((item, itemIdx) => {
            let paramsFields = '';
            Object.keys(item.params).forEach(p => {
                paramsFields += `
                    <div class="mb-2">
                        <label class="block text-xs font-semibold text-slate-500 mb-1">${p}:</label>
                        <input type="text" name="${p}" required class="w-full px-3 py-1.5 text-xs bg-white border border-rose-100 rounded-lg focus:outline-none focus:border-rose-400" placeholder="Masukkan ${p}...">
                    </div>
                `;
            });

            catHtml += `
                <div class="theme-badge flex-col items-start gap-2 block">
                    <div class="flex items-center justify-between w-full mb-1">
                        <span class="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">${item.methods[0] || 'GET'}</span>
                        <span class="text-xs text-rose-400 font-semibold">Status</span>
                    </div>
                    <h4 class="font-bold text-sm text-slate-800 dark-mode:text-white">${item.name}</h4>
                    <p class="text-xs text-slate-400 mb-2">${item.desc || ''}</p>
                    
                    <form id="form-${catName}-${itemIdx}" onsubmit="executeRequest(event, '${catName}', '${itemIdx}', '${item.path}')" class="w-full mt-2">
                        ${paramsFields}
                        <div class="flex gap-2 mt-3">
                            <input type="text" readonly class="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-400 select-all" value="${item.path}">
                            <button type="submit" class="px-4 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors">${i18n[currentLang].btnExecute}</button>
                        </div>
                    </form>
                    <div id="response-${catName}-${itemIdx}" class="w-full mt-3 hidden p-2 bg-slate-900 rounded-lg text-rose-300 font-mono text-[10px] overflow-x-auto max-h-40"></div>
                </div>
            `;
        });

        catHtml += `</div></div>`;
        apiList.innerHTML += catHtml;
    });

    filtersContainer.innerHTML = filterHtml;
    document.getElementById('totalEndpoints').textContent = totalEndpoints;
    document.getElementById('totalCategories').textContent = totalCategories;
}

function filterCategory(catName) {
    activeCategory = catName;
    loadApis();
}

async function executeRequest(e, catName, itemIdx, path) {
    e.preventDefault();
    if (isRequestInProgress) {
        showToast(i18n[currentLang].toastRequestWait, true);
        return;
    }

    const form = document.getElementById(`form-${catName}-${itemIdx}`);
    const responseDiv = document.getElementById(`response-${catName}-${itemIdx}`);
    
    isRequestInProgress = true;
    responseDiv.classList.remove('hidden');
    responseDiv.textContent = 'Memuat data...';

    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }

    const fullUrl = params.toString() ? `${BASE_URL}${path}?${params.toString()}` : `${BASE_URL}${path}`;

    try {
        const res = await fetch(fullUrl);
        const data = await res.json();
        responseDiv.textContent = JSON.stringify(data, null, 2);
        showToast(i18n[currentLang].toastRequestSuccess);
    } catch (err) {
        responseDiv.textContent = 'Gagal memuat respon dari API endpoint ini.';
        showToast(i18n[currentLang].toastRequestFailed, true);
    } finally {
        isRequestInProgress = false;
    }
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const badges = document.querySelectorAll('.theme-badge');
    let found = false;

    badges.forEach(badge => {
        const text = badge.innerText.toLowerCase();
        if (text.includes(query)) {
            badge.style.display = 'block';
            found = true;
        } else {
            badge.style.display = 'none';
        }
    });

    document.getElementById('noResults').classList.toggle('hidden', found || query === '');
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initBatteryDetection();
    
    const bioMenuBtn = document.getElementById('bioMenuBtn');
    const bioDropdown = document.getElementById('bioDropdown');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (bioMenuBtn && bioDropdown && menuOverlay) {
        bioMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bioDropdown.style.transform = 'translateX(0)';
            menuOverlay.classList.remove('hidden');
        });
        
        const closeMenu = () => {
            bioDropdown.style.transform = 'translateX(100%)';
            menuOverlay.classList.add('hidden');
        };

        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
        menuOverlay.addEventListener('click', closeMenu);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    document.getElementById('searchInput').addEventListener('input', performSearch);
    
    // Fetch data endpoint dari backend
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(() => {
            document.getElementById('apiList').innerHTML = `<div class="text-center p-4 bg-red-100 text-red-700 rounded-xl border border-red-200 text-sm font-semibold">⚠️ Gagal memuat daftar endpoint API.</div>`;
        });
});
