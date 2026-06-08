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
const themeBg = document.getElementById('themeBg');

// Pemetaan Ikon Kategori (SVG Kuning/Cyan)
const categoryIcons = {
    'ai': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 1 1 12 2zm-2 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9 4H3v-2h18v2z"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    'tools': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.1L9 6 6 9 1.8 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    'maker': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
    'stalker': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    'canvas': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
    'security': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
    'news': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H5V5h14v14zm-9-2h8v-2h-8v2zm0-4h8v-2h-8v2zm0-4h8V7h-8v2zm-4 8h2v-8H6v8z"/></svg>',
    'random': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
    'islam': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
    'default': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-400"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>'
};

// Objek Internasionalisasi Kamus Multi-Bahasa (i18n)
const i18n = {
    id: {
        searchPlaceholder: "Cari endpoint berdasarkan nama, path, atau kategori...",
        noResultsTitle: "Endpoint tidak ditemukan",
        noResultsDesc: "Coba gunakan kata kunci lain",
        batteryTitle: "Baterai Anda",
        endpointsTitle: "Total Endpoint",
        categoriesTitle: "Total Kategori",
        batteryDetecting: "Mendeteksi...",
        batteryCharging: "Mengisi Daya",
        batteryFull: "Penuh",
        batteryDischarging: "Menguras Daya",
        toastRequestWait: "Harap tunggu permintaan saat ini selesai",
    },
    en: {
        searchPlaceholder: "Search endpoints by name, path, or category...",
        noResultsTitle: "No endpoints found",
        noResultsDesc: "Try a different search term",
        batteryTitle: "Your Battery",
        endpointsTitle: "Total Endpoints",
        categoriesTitle: "Total Categories",
        batteryDetecting: "Detecting...",
        batteryCharging: "Charging",
        batteryFull: "Fully charged",
        batteryDischarging: "Discharging",
        toastRequestWait: "Please wait for current request",
    }
};

function updateThemeBackground(theme) {
    if (themeBg) {
        if (theme === 'light') {
            themeBg.className = "fixed inset-0 -z-50 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 transition-all duration-500";
        } else {
            themeBg.className = "fixed inset-0 -z-50 bg-gradient-to-br from-[#070b12] via-[#0f172a] to-[#070b12] transition-all duration-500";
        }
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        body.classList.remove('text-slate-100');
        body.classList.add('text-slate-900');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
    } else {
        body.classList.remove('light-mode');
        body.classList.remove('text-slate-900');
        body.classList.add('text-slate-100');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
    }
    updateThemeBackground(currentTheme);
    updateSocialBadges();
}

function toggleTheme() {
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.remove('text-slate-900');
        body.classList.add('text-slate-100');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
        currentTheme = 'dark';
    } else {
        body.classList.add('light-mode');
        body.classList.remove('text-slate-100');
        body.classList.add('text-slate-900');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
        currentTheme = 'light';
    }
    
    localStorage.setItem('theme', currentTheme);
    updateThemeBackground(currentTheme);
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
    document.getElementById('stat-battery-title').textContent = i18n[lang].batteryTitle;
    document.getElementById('stat-endpoints-title').textContent = i18n[lang].endpointsTitle;
    document.getElementById('stat-categories-title').textContent = i18n[lang].categoriesTitle;
    
    if (batteryMonitor) {
        window.dispatchEvent(new Event('batteryupdate-hook'));
    }
    if (apiData) loadApis();
}

function updateSocialBadges() {
    const isLightMode = body.classList.contains('light-mode');
    const socialBadges = document.querySelectorAll('.social-badge > div');
    
    socialBadges.forEach(badge => {
        if (isLightMode) {
            badge.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-white/80 text-slate-900 hover:bg-slate-100 border-black/10 shadow-sm';
        } else {
            badge.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-colors text-center border bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 border-white/10';
        }
    });
}

function initBatteryDetection() {
    const batteryLevelElement = document.getElementById('batteryLevel');
    const batteryPercentageElement = document.getElementById('batteryPercentage');
    const batteryStatusElement = document.getElementById('batteryStatus');
    const batteryContainer = document.getElementById('batteryContainer');
    
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryInfo() {
                const level = battery.level * 100;
                const isCharging = battery.charging;
                const roundedLevel = Math.round(level);
                
                batteryPercentageElement.textContent = `${roundedLevel}%`;
                batteryLevelElement.style.width = `${level}%`;
                
                if (level > 60) {
                    batteryLevelElement.className = 'battery-level bg-green-500';
                } else if (level > 20) {
                    batteryLevelElement.className = 'battery-level bg-yellow-500';
                } else {
                    batteryLevelElement.className = 'battery-level bg-red-500';
                }
                
                if (isCharging) {
                    batteryContainer.classList.add('charging');
                    batteryStatusElement.textContent = i18n[currentLang].batteryCharging;
                } else {
                    batteryContainer.classList.remove('charging');
                    if (battery.dischargingTime === Infinity) {
                        batteryStatusElement.textContent = i18n[currentLang].batteryFull;
                    } else {
                        batteryStatusElement.textContent = i18n[currentLang].batteryDischarging;
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
        batteryStatusElement.textContent = 'Simulated';
        batteryPercentageElement.textContent = '85%';
        batteryLevelElement.style.width = '85%';
        batteryLevelElement.className = 'battery-level bg-green-400';
    }
}

function cleanupBatteryMonitor() {
    if (batteryMonitor) batteryMonitor = null;
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    toastMessage.textContent = message;
    if (isError) {
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>';
    } else {
        toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>';
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function copyText(text, type = 'Path') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${type} berhasil disalin ke papan klip!`);
    }).catch(() => {
        showToast('Gagal menyalin teks', true);
    });
}

function updateLivePreview(catIdx, epIdx, method, basePath) {
    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    if (!form) return;

    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }

    const queryStr = params.toString();
    const finalUrl = queryStr ? `${BASE_URL}${basePath}?${queryStr}` : `${BASE_URL}${basePath}`;
    
    const urlContainer = document.getElementById(`live-url-${catIdx}-${epIdx}`);
    const curlContainer = document.getElementById(`live-curl-${catIdx}-${epIdx}`);

    if (urlContainer) urlContainer.textContent = finalUrl;
    if (curlContainer) {
        if (method === 'GET') {
            curlContainer.textContent = `curl -X GET "${finalUrl}"`;
        } else {
            const bodyParams = [];
            for (const [key, value] of formData.entries()) {
                if (value) bodyParams.push(`"${key}": "${value}"`);
            }
            const dataString = bodyParams.length ? ` -H "Content-Type: application/json" -d '{${bodyParams.join(', ')}}'` : '';
            curlContainer.textContent = `curl -X ${method} "${BASE_URL}${basePath}"${dataString}`;
        }
    }
}

function toggleCategory(index) {
    const content = document.getElementById(`cat-${index}`);
    const icon = document.getElementById(`cat-icon-${index}`);
    if(content) content.classList.toggle('hidden');
    if(icon) icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function toggleEndpoint(catIdx, epIdx) {
    const content = document.getElementById(`ep-${catIdx}-${epIdx}`);
    const icon = document.getElementById(`ep-icon-${catIdx}-${epIdx}`);
    if(content) content.classList.toggle('hidden');
    if(icon) icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function closeSidebarMenu() {
    const bioDropdown = document.getElementById('bioDropdown');
    const menuOverlay = document.getElementById('menuOverlay');
    if (bioDropdown) bioDropdown.style.transform = 'translateX(100%)';
    if (menuOverlay) menuOverlay.classList.add('hidden');
}

// Fungsi Utama Me-render Data Komponen dari API internal server
function loadApis() {
    const listContainer = document.getElementById('apiList');
    const filterContainer = document.getElementById('categoryFilters');
    if (!apiData || !apiData.categories) return;

    totalEndpoints = 0;
    totalCategories = apiData.categories.length - 1; // Kecuali Kategori utilitas "OTHER"
    
    let listHtml = '';
    let filterHtml = `<button class="filter-btn ${activeCategory === 'all' ? 'active' : ''}" onclick="filterCategory('all')">ALL</button>`;

    apiData.categories.forEach((cat, catIdx) => {
        const catKey = cat.name.toLowerCase();
        const iconSvg = categoryIcons[catKey] || categoryIcons['default'];
        
        if(cat.name !== "OTHER") {
            totalEndpoints += cat.items.length;
            filterHtml += `<button class="filter-btn ${activeCategory === catKey ? 'active' : ''}" onclick="filterCategory('${catKey}')">${cat.name}</button>`;
        }

        const isCatHidden = (activeCategory !== 'all' && activeCategory !== catKey) ? 'hidden' : '';

        listHtml += `
        <div id="container-cat-${catIdx}" class="glass-panel rounded-2xl overflow-hidden transition-all duration-300 mb-4 ${isCatHidden}">
            <div class="px-5 py-4 flex items-center justify-between cursor-pointer border-b border-white/5 bg-white/[0.02]" onclick="toggleCategory(${catIdx})">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">${iconSvg}</div>
                    <h2 class="font-bold tracking-wide text-sm font-['Space_Grotesk']">${cat.name}</h2>
                </div>
                <svg id="cat-icon-${catIdx}" class="w-5 h-5 text-slate-400 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            <div id="cat-${catIdx}" class="p-4 space-y-3">`;

        cat.items.forEach((ep, epIdx) => {
            const methodColor = ep.methods.includes('POST') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            listHtml += `
                <div class="border border-white/5 rounded-xl overflow-hidden bg-slate-950/20">
                    <div class="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]" onclick="toggleEndpoint(${catIdx}, ${epIdx})">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <span class="text-[10px] px-2 py-0.5 rounded font-bold border ${methodColor}">${ep.methods.join('/')}</span>
                            <span class="text-xs font-medium font-['JetBrains_Mono'] truncate text-slate-300">${ep.path}</span>
                        </div>
                        <svg id="ep-icon-${catIdx}-${epIdx}" class="w-4 h-4 text-slate-500 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div id="ep-${catIdx}-${epIdx}" class="hidden p-4 border-t border-white/5 bg-slate-950/40 font-['JetBrains_Mono'] space-y-4">
                        <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${ep.methods[0]}', '${ep.path}')" oninput="updateLivePreview(${catIdx}, ${epIdx}, '${ep.methods[0]}', '${ep.path}')">
                            <div class="grid grid-cols-1 gap-3 mb-3">`;
            
            Object.keys(ep.params).forEach(param => {
                listHtml += `
                                <div>
                                    <label class="text-[11px] text-slate-400 block mb-1 font-semibold">${param} (Query)</label>
                                    <input type="text" name="${param}" class="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                                </div>`;
            });

            listHtml += `
                            </div>
                            <button type="submit" class="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center">Kirim Permintaan</button>
                        </form>
                        <div class="space-y-2 text-[11px]">
                            <div class="p-2 bg-slate-900 rounded-lg border border-white/5 relative">
                                <span class="absolute top-1 right-2 text-[9px] text-slate-500 uppercase font-bold">URL Preview</span>
                                <code id="live-url-${catIdx}-${epIdx}" class="text-cyan-400 block break-all pt-2">${BASE_URL}${ep.path}</code>
                            </div>
                            <div class="p-2 bg-slate-900 rounded-lg border border-white/5 relative">
                                <span class="absolute top-1 right-2 text-[9px] text-slate-500 uppercase font-bold">cURL Command</span>
                                <code id="live-curl-${catIdx}-${epIdx}" class="text-purple-400 block break-all pt-2">curl -X GET "${BASE_URL}${ep.path}"</code>
                            </div>
                        </div>
                        <div id="response-${catIdx}-${epIdx}" class="hidden space-y-2">
                            <div class="flex items-center justify-between text-xs text-slate-400">
                                <span>Response JSON:</span>
                                <button type="button" onclick="copyFromElement('response-content-${catIdx}-${epIdx}', 'JSON Object')" class="text-cyan-400 hover:underline">Copy</button>
                            </div>
                            <pre id="response-content-${catIdx}-${epIdx}" class="p-3 bg-black/50 border border-white/10 rounded-lg text-xs overflow-x-auto text-emerald-400 max-h-64"></pre>
                        </div>
                    </div>
                </div>`;
        });

        listHtml += `</div></div>`;
    });

    listContainer.innerHTML = listHtml;
    filterContainer.innerHTML = filterHtml;
    document.getElementById('totalEndpoints').textContent = totalEndpoints;
    document.getElementById('totalCategories').textContent = totalCategories;
}

function filterCategory(categoryKey) {
    activeCategory = categoryKey;
    loadApis();
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const categoriesContainers = document.querySelectorAll('[id^="container-cat-"]');
    let dynamicTotalResults = 0;

    categoriesContainers.forEach(container => {
        const catTitle = container.querySelector('h2').textContent.toLowerCase();
        const items = container.querySelectorAll('.border-white\\/5');
        let matchedInCat = 0;

        items.forEach(item => {
            const pathText = item.querySelector('.truncate').textContent.toLowerCase();
            if (pathText.includes(query) || catTitle.includes(query)) {
                item.classList.remove('hidden');
                matchedInCat++;
                dynamicTotalResults++;
            } else {
                item.classList.add('hidden');
            }
        });

        if (matchedInCat > 0 && (activeCategory === 'all' || container.id.includes(activeCategory))) {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    });

    document.getElementById('noResults').classList.toggle('hidden', dynamicTotalResults > 0);
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
    executeBtn.disabled = true;
    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = 'Memuat data...';

    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }

    const fullPath = `${BASE_URL}${path.split('?')[0]}?${params.toString()}`;

    try {
        const response = await fetch(fullPath);
        const data = await response.json();
        responseContent.textContent = JSON.stringify(data, null, 4);
    } catch (err) {
        responseContent.textContent = `Error: ${err.message}`;
    } finally {
        isRequestInProgress = false;
        executeBtn.disabled = false;
    }
}

// Event Listeners Initialization on DOM Content Loaded
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
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebarMenu);
        menuOverlay.addEventListener('click', closeSidebarMenu);
    }
    
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(() => {
            document.getElementById('apiList').innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><h3 class="font-bold text-lg">Gagal memuat API data</h3></div>`;
        });
        
    themeToggleBtn.addEventListener('click', toggleTheme);
    document.getElementById('searchInput').addEventListener('input', performSearch);
});

window.addEventListener('beforeunload', cleanupBatteryMonitor);
