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
        batteryLeft: "tersisa",
        endpointsCount: "endpoints",
        btnExecute: "Eksekusi",
        btnClear: "Bersihkan",
        toastMediaCopy: "Media URL disalin ke papan klip!",
        toastMediaFail: "Gagal menyalin URL",
        endpointNotAvailable: "⚠️ Endpoint ini tidak tersedia untuk pengujian",
        toastRequestWait: "Harap tunggu permintaan saat ini selesai",
        toastRequestSuccess: "Permintaan berhasil diselesaikan!",
        toastRequestFailed: "Permintaan gagal!"
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
        batteryLeft: "left",
        endpointsCount: "endpoints",
        btnExecute: "Execute",
        btnClear: "Clear",
        toastMediaCopy: "Media URL copied to clipboard!",
        toastMediaFail: "Failed to copy URL",
        endpointNotAvailable: "⚠️ This endpoint is not available for testing",
        toastRequestWait: "Please wait for current request",
        toastRequestSuccess: "Request completed successfully!",
        toastRequestFailed: "Request failed!"
    }
};

function updateThemeBackground(theme) {
    if (themeBg) {
        themeBg.className = "fixed inset-0 -z-50 transition-all duration-300";
        if (theme === 'light') {
            document.body.style.backgroundColor = "#ffffff";
            themeBg.style.backgroundColor = "#ffffff";
            themeBg.style.backgroundImage = "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)";
            themeBg.style.backgroundSize = "24px 24px";
        } else {
            document.body.style.backgroundColor = "#030712";
            themeBg.style.backgroundColor = "#030712";
            themeBg.style.backgroundImage = "radial-gradient(rgba(255, 255, 255, 0.12) 1.5px, transparent 1.5px)";
            themeBg.style.backgroundSize = "24px 24px";
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

    // Perbarui bahasa teks tanggal secara real-time saat bahasa diubah
    const dateElement = document.getElementById('liveDate');
    if (dateElement && typeof moment !== 'undefined') {
        const now = moment().tz("Asia/Jakarta");
        const formatLang = lang === 'id' ? 'id' : 'en';
        dateElement.textContent = now.locale(formatLang).format('dddd, D MMMM YYYY');
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

// ==================== FITUR JAM & TANGGAL MOMENT-TIMEZONE ====================
function initDigitalClock() {
    const clockElement = document.getElementById('liveClock');
    const dateElement = document.getElementById('liveDate');

    if (!clockElement || !dateElement) return;

    function updateClock() {
        if (typeof moment === 'undefined') return;
        
        // Ambil waktu wilayah Asia/Jakarta
        const now = moment().tz("Asia/Jakarta");

        // Format Jam -> Jam:Menit:Detik (HH:mm:ss)
        clockElement.textContent = now.format('HH:mm:ss');

        // Format Tanggal sesuai Lokalisasi Bahasa (id / en)
        const formatLang = currentLang === 'id' ? 'id' : 'en';
        dateElement.textContent = now.locale(formatLang).format('dddd, D MMMM YYYY');
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function updateTotalEndpoints() { document.getElementById('totalEndpoints').textContent = totalEndpoints; }
function updateTotalCategories() { document.getElementById('totalCategories').textContent = totalCategories; }

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

function copyText(text, type = 'path') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${type} berhasil disalin ke papan klip!`);
    }).catch(() => {
        showToast('Gagal menyalin text', true);
    });
}

function copyFromElement(elementId, type) {
    const el = document.getElementById(elementId);
    if (el) {
        copyText(el.innerText || el.textContent, type);
    }
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
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
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
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

function getContentType(url, contentType) {
    if (contentType) {
        if (contentType.includes('image/')) return 'image';
        if (contentType.includes('video/')) return 'video';
        if (contentType.includes('audio/')) return 'audio';
        if (contentType.includes('application/pdf')) return 'pdf';
    }
    if (url.includes('.jpg') || url.includes('.png')) return 'image';
    if (url.includes('.mp4')) return 'video';
    if (url.includes('.mp3')) return 'audio';
    if (url.includes('.pdf')) return 'pdf';
    return 'unknown';
}

function createMediaPreview(url, contentType, originalUrl = '') {
    const type = getContentType(url, contentType);
    let previewHtml = '';
    
    switch(type) {
        case 'image':
            previewHtml = `<div class="media-preview"><img src="${url}" class="media-image" alt="Response Image"></div>`;
            break;
        case 'video':
            previewHtml = `<div class="media-preview"><video controls class="media-iframe"><source src="${url}">Your browser does not support the video tag.</video></div>`;
            break;
        case 'audio':
            previewHtml = `<div class="media-preview"><audio controls class="w-full"><source src="${url}">Your browser does not support the audio tag.</audio></div>`;
            break;
        default:
            previewHtml = `<div class="media-preview"><iframe src="${url}" class="media-iframe" frameborder="0"></iframe></div>`;
    }
    
    const isLightMode = body.classList.contains('light-mode');
    const btnClass = isLightMode 
        ? 'px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5' 
        : 'px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5';
    
    return `<div class="w-full">${previewHtml}<div class="flex gap-2 mt-3"><button type="button" onclick="copyText('${originalUrl || url}', 'Media URL')" class="${btnClass}">📋 Copy URL</button><a href="${url}" download class="${btnClass}">📥 Download</a></div></div>`;
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
    
    let spinner = executeBtn.querySelector('.local-spinner');
    if (!spinner) {
        spinner = document.createElement('span');
        spinner.className = 'local-spinner ml-2';
        executeBtn.appendChild(spinner);
    }
    
    isRequestInProgress = true;
    executeBtn.disabled = true;
    executeBtn.classList.add('btn-loading');
    spinner.classList.add('active');
    
    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }

    const fullPath = `${BASE_URL}${path.split('?')[0]}?${params.toString()}`;
    let curlCommand = `curl -X ${method} "${fullPath}"`;
    if (method !== 'GET') {
        curlCommand = `curl -X ${method} "${BASE_URL}${path.split('?')[0]}" `;
        const bodyParams = [];
        for (const [key, value] of formData.entries()) {
            if (value) bodyParams.push(`"${key}": "${value}"`);
        }
        if (bodyParams.length) {
            curlCommand += `-H "Content-Type: application/json" -d '{${bodyParams.join(', ')}}'`;
        }
    }

    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = '<div class="spinner mx-auto"></div>';

    try {
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentType = response.headers.get("content-type");
        let rawResponseText = "";
        let isMedia = false;

        if (contentType?.includes("application/json")) {
            const data = await response.json();
            rawResponseText = JSON.stringify(data, null, 2);
            responseContent.innerHTML = `<pre id="raw-text-${catIdx}-${epIdx}" class="code-font text-sm overflow-auto text-cyan-400">${rawResponseText}</pre>`;
        } else if (contentType?.startsWith("image/") || contentType?.startsWith("video/") || contentType?.startsWith("audio/") || contentType?.includes("application/pdf")) {
            isMedia = true;
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            responseContent.innerHTML = createMediaPreview(url, contentType, fullPath);
        } else {
            rawResponseText = await response.text();
            responseContent.innerHTML = `<pre id="raw-text-${catIdx}-${epIdx}" class="code-font text-sm overflow-auto">${rawResponseText}</pre>`;
        }

        const isLightMode = body.classList.contains('light-mode');
        const btnStyle = isLightMode 
            ? 'px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-semibold transition-colors code-font border border-black/5'
            : 'px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-semibold transition-colors code-font border border-white/5';

        const actionContainer = document.createElement('div');
        actionContainer.className = "flex flex-wrap gap-2 mb-3 border-b border-white/10 light-mode:border-slate-200 pb-3";

        const copyUrlBtn = document.createElement('button');
        copyUrlBtn.type = "button";
        copyUrlBtn.className = btnStyle;
        copyUrlBtn.innerHTML = "🔗 Copy URL Request";
        copyUrlBtn.onclick = () => copyText(fullPath, "URL Request");
        actionContainer.appendChild(copyUrlBtn);

        const copyCurlBtn = document.createElement('button');
        copyCurlBtn.type = "button";
        copyCurlBtn.className = btnStyle;
        copyCurlBtn.innerHTML = "💻 Copy cURL";
        copyCurlBtn.onclick = () => copyText(curlCommand, "cURL Command");
        actionContainer.appendChild(copyCurlBtn);

        if (!isMedia) {
            const copyResponseBtn = document.createElement('button');
            copyResponseBtn.type = "button";
            copyResponseBtn.className = btnStyle;
            copyResponseBtn.innerHTML = "📋 Copy Response";
            copyResponseBtn.onclick = () => copyText(rawResponseText, "Response");
            actionContainer.appendChild(copyResponseBtn);
        }

        responseContent.insertBefore(actionContainer, responseContent.firstChild);
        showToast(i18n[currentLang].toastRequestSuccess);
    } catch (error) {
        responseContent.innerHTML = `<pre class="text-red-400 code-font text-sm">Error: ${error.message}</pre>`;
        showToast(i18n[currentLang].toastRequestFailed, true);
    } finally {
        isRequestInProgress = false;
        executeBtn.disabled = false;
        executeBtn.classList.remove('btn-loading');
        spinner.classList.remove('active');
    }
}

// ==================== FITUR BERSIHKAN RESPONSE + PARAMS INPUT ====================
function clearResponse(catIdx, epIdx) {
    // 1. Sembunyikan container hasil response
    const responseDiv = document.getElementById(`response-${catIdx}-${epIdx}`);
    if (responseDiv) {
        responseDiv.classList.add('hidden');
    }

    // 2. Kosongkan semua teks parameter di dalam form input
    const form = document.getElementById(`form-${catIdx}-${epIdx}`);
    if (form) {
        form.reset(); // Mereset elemen <form> membersihkan semua kolom input sekaligus
        
        // 3. Kembalikan Tampilan Live URL ke path awal tanpa parameter query
        const urlContainer = document.getElementById(`live-url-${catIdx}-${epIdx}`);
        if (urlContainer) {
            const basePath = urlContainer.textContent.split('?')[0];
            urlContainer.textContent = basePath;
        }
        
        // 4. Kembalikan Tampilan Live cURL ke wujud awal
        const curlContainer = document.getElementById(`live-curl-${catIdx}-${epIdx}`);
        if (curlContainer) {
            const method = curlContainer.textContent.split(' ')[1] || 'GET';
            const baseUrl = curlContainer.textContent.split('"')[1] || '';
            curlContainer.textContent = `curl -X ${method} "${baseUrl.split('?')[0]}"`;
        }
    }
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container || !apiData || !apiData.categories) return;

    let html = `<button class="filter-btn active" data-filter="all" onclick="filterByCategory('all')">semua (${totalEndpoints})</button>`;

    apiData.categories.forEach(category => {
        const catName = category.name.toLowerCase();
        const count = category.items.length;
        html += `<button class="filter-btn" data-filter="${catName}" onclick="filterByCategory('${catName}')">${catName} (${count})</button>`;
    });

    container.innerHTML = html;
}

function filterByCategory(catName) {
    activeCategory = catName;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === catName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    performSearch();
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    let hasVisibleItems = false;

    requestAnimationFrame(() => {
        document.querySelectorAll('.category-group').forEach(category => {
            const catName = category.dataset.category;
            
            if (activeCategory !== 'all' && catName !== activeCategory) {
                category.classList.add('hidden');
                return;
            }

            let categoryHasVisibleItems = false;
            const items = category.querySelectorAll('.api-item');
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const matches = item.dataset.path.includes(searchTerm) || 
                                item.dataset.alias.includes(searchTerm) || 
                                item.dataset.description.includes(searchTerm) ||
                                item.dataset.category.includes(searchTerm);
                if (matches) {
                    item.classList.remove('hidden');
                    categoryHasVisibleItems = true;
                    hasVisibleItems = true;
                } else {
                    item.classList.add('hidden');
                }
            }
            
            category.classList.toggle('hidden', !categoryHasVisibleItems);
        });
        
        noResults.classList.toggle('hidden', hasVisibleItems);
    });
}

function loadApis() {
    const apiList = document.getElementById('apiList');
    if (!apiData || !apiData.categories) {
        apiList.innerHTML = '<p class="text-center">No API data loaded.</p>';
        return;
    }
    
    totalEndpoints = 0;
    totalCategories = apiData.categories.length;
    apiData.categories.forEach(category => { totalEndpoints += category.items.length; });
    
    updateTotalEndpoints();
    updateTotalCategories();
    renderCategoryFilters();
    
    const isLightMode = body.classList.contains('light-mode');
    const pathColorClass = isLightMode ? 'text-cyan-700' : 'text-cyan-200';
    const subTextColorClass = isLightMode ? 'text-slate-600' : 'opacity-70';

    let html = '';
    apiData.categories.forEach((category, catIdx) => {
        const catNameLower = category.name.toLowerCase();
        
        let iconSvg = categoryIcons.default;
        for (const [key, svg] of Object.entries(categoryIcons)) {
            if (catNameLower.includes(key)) {
                iconSvg = svg;
                break;
            }
        }

        html += `
        <div class="category-group" data-category="${catNameLower}">
            <div class="glass-panel border rounded-xl overflow-hidden shadow-lg mb-4">
                <button onclick="toggleCategory(${catIdx})" class="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 light-mode:hover:bg-black/5 transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 flex items-center justify-center bg-slate-950/40 light-mode:bg-slate-200/50 rounded-xl border border-white/10 light-mode:border-slate-300 shadow-inner flex-shrink-0">
                            ${iconSvg}
                        </div>
                        <div class="text-left">
                            <h3 class="font-bold text-sm tracking-widest text-cyan-400 light-mode:text-cyan-600 uppercase font-['Space_Grotesk']">${category.name}</h3>
                            <p class="text-[11px] code-font ${subTextColorClass}">${category.items.length} ${i18n[currentLang].endpointsCount}</p>
                        </div>
                    </div>
                    <svg id="cat-icon-${catIdx}" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div id="cat-${catIdx}" class="hidden">`;
        
        category.items.forEach((item, epIdx) => {
            const method = item.methods && item.methods.length ? item.methods[0] : 'GET';
            const pathParts = item.path.split('?');
            const path = pathParts[0];
            const queryParams = new URLSearchParams(pathParts[1] || '');
            let statusClass = item.status === 'update' ? 'status-update' : (item.status === 'error' ? 'status-error' : 'status-ready');

            html += `
            <div class="api-item border-t border-white/10 light-mode:border-slate-200" 
                data-method="${method}" data-path="${path}" data-alias="${item.name.toLowerCase()}" data-description="${item.desc.toLowerCase()}" data-category="${category.name.toLowerCase()}">
                <button onclick="toggleEndpoint(${catIdx}, ${epIdx})" class="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 light-mode:hover:bg-black/5 transition-colors">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <span class="bg-cyan-500 light-mode:bg-cyan-600 text-slate-950 light-mode:text-white px-2 py-0.5 rounded text-[10px] flex-shrink-0 code-font font-black">${method}</span>
                        <div class="text-left flex-1 min-w-0">
                            <p class="code-font font-semibold text-[13px] ${pathColorClass} truncate">${path}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <p class="text-xs ${subTextColorClass} truncate">${item.name}</p>
                                <span class="px-1.5 py-0.5 text-[9px] rounded-sm ${statusClass} flex-shrink-0 uppercase tracking-wider font-bold">${item.status || 'ready'}</span>
                            </div>
                        </div>
                    </div>
                </button>
                <div id="ep-${catIdx}-${epIdx}" class="hidden bg-slate-950/40 light-mode:bg-slate-50/50 px-4 py-4 border-t border-white/10 light-mode:border-slate-200 backdrop-blur-sm">
                    <p class="text-xs mb-4 ${isLightMode ? 'text-slate-700' : 'opacity-80'}">${item.desc}</p>
                    
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-400 light-mode:text-slate-600 code-font">ENDPOINT / REQUEST URL</h4>
                            <button type="button" onclick="copyFromElement('live-url-${catIdx}-${epIdx}', 'URL')" class="px-3 py-1 bg-white/5 hover:bg-white/10 light-mode:bg-slate-200 light-mode:hover:bg-slate-300 border border-white/10 light-mode:border-slate-300 rounded-lg text-[10px] transition-all active:scale-95 code-font text-slate-300 light-mode:text-slate-800">Copy URL</button>
                        </div>
                        <div class="bg-slate-900/40 light-mode:bg-slate-200/60 border border-white/10 light-mode:border-slate-300 px-4 py-3 rounded-xl backdrop-blur-md shadow-inner">
                            <code id="live-url-${catIdx}-${epIdx}" class="code-font text-xs text-cyan-400 light-mode:text-cyan-700 font-medium break-all">${BASE_URL}${path}</code>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-400 light-mode:text-slate-600 code-font">cURL Command</h4>
                            <button type="button" onclick="copyFromElement('live-curl-${catIdx}-${epIdx}', 'cURL')" class="px-3 py-1 bg-white/5 hover:bg-white/10 light-mode:bg-slate-200 light-mode:hover:bg-slate-300 border border-white/10 light-mode:border-slate-300 rounded-lg text-[10px] transition-all active:scale-95 code-font text-slate-300 light-mode:text-slate-800">Copy cURL</button>
                        </div>
                        <div class="bg-slate-900/40 light-mode:bg-slate-200/60 border border-white/10 light-mode:border-slate-300 px-4 py-3 rounded-xl backdrop-blur-md shadow-inner">
                            <code id="live-curl-${catIdx}-${epIdx}" class="code-font text-xs text-slate-300 light-mode:text-slate-700 block overflow-x-auto whitespace-pre">curl -X ${method} "${BASE_URL}${path}"</code>
                        </div>
                    </div>`;

            if (item.status === 'ready') {
                html += `
                    <div>
                        <h4 class="font-bold text-[11px] uppercase tracking-wider text-slate-400 light-mode:text-slate-600 mb-3">Parameter</h4>
                        <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${method}', '${path}')">
                            <div class="space-y-3 mb-4">`;
                if (item.params) {
                    Object.keys(item.params).forEach(paramName => {
                        const isRequired = !queryParams.has(paramName) || queryParams.get(paramName) === '';
                        html += `
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 light-mode:text-slate-700 mb-1.5 code-font">
                                    ${paramName} ${isRequired ? '<span class="text-red-500">*</span>' : ''}
                                </label>
                                <input type="text" name="${paramName}" oninput="updateLivePreview(${catIdx}, ${epIdx}, '${method}', '${path}')" class="w-full px-3 py-2 rounded-lg bg-black/40 light-mode:bg-white border border-white/10 light-mode:border-slate-300 text-white light-mode:text-slate-900 focus:outline-none focus:border-cyan-500 code-font text-sm" placeholder="${item.params[paramName]}" ${isRequired ? 'required' : ''}>
                            </div>`;
                    });
                }
                html += `
                            </div>
                            <div class="flex gap-3">
                                <button type="submit" class="px-5 py-2 bg-cyan-500 light-mode:bg-cyan-600 hover:bg-cyan-400 light-mode:hover:bg-cyan-500 text-slate-950 light-mode:text-white rounded-md font-bold text-xs tracking-wider transition-all flex items-center justify-center">EKSEKUSI</button>
                                <button type="button" onclick="clearResponse(${catIdx}, ${epIdx})" class="px-5 py-2 bg-transparent border border-white/20 light-mode:border-slate-300 hover:border-white/40 light-mode:hover:bg-slate-100 text-slate-300 light-mode:text-slate-700 rounded-md font-bold text-xs transition-colors">BERSIHKAN</button>
                            </div>
                        </form>

                        <div id="response-${catIdx}-${epIdx}" class="hidden mt-6 space-y-4">
                            <div>
                                <h5 class="text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-400 light-mode:text-slate-500">Response</h5>
                                <div class="bg-slate-950/80 light-mode:bg-slate-100 border border-white/10 light-mode:border-slate-300 p-3 rounded-lg min-h-[100px] overflow-x-auto" id="response-content-${catIdx}-${epIdx}"></div>
                            </div>
                        </div>
                    </div>`;
            } else {
                html += `<div class="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 font-medium">${i18n[currentLang].endpointNotAvailable}</div>`;
            }
            html += `</div></div>`;
        });
        html += `</div></div></div>`;
    });
    apiList.innerHTML = html;
    allApiElements = Array.from(document.querySelectorAll('.api-item'));
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
    const playlistPanel = document.getElementById('playlistPanel');

    function formatTime(secs) {
        if (isNaN(secs)) return "0:00";
        const mins = Math.floor(secs / 60);
        const remainingSecs = Math.floor(secs % 60);
        return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
    }

    function loadTrack(index) {
        currentTrackIdx = index;
        const track = playlist[index];
        audio.src = track.url;
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;
        coverImg.src = track.cover;
        progressBar.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        renderPlaylistItems();
    }

    function renderPlaylistItems() {
        playlistPanel.innerHTML = '';
        playlist.forEach((track, idx) => {
            const isActive = idx === currentTrackIdx;
            const itemBtn = document.createElement('button');
            itemBtn.className = `w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-all ${isActive ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 light-mode:text-cyan-700 font-bold' : 'hover:bg-white/5 light-mode:hover:bg-black/5 text-slate-400 light-mode:text-slate-600'}`;
            itemBtn.innerHTML = `<div class="flex items-center gap-2 truncate"><span class="opacity-50 text-[10px] code-font">${String(idx + 1).padStart(2, '0')}</span><span class="truncate">${track.title} <span class="opacity-60 font-normal">- ${track.artist}</span></span></div>${isActive ? '<span class="text-[9px] tracking-wider text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded animate-pulse font-bold">PLAYING</span>' : ''}`;
            itemBtn.addEventListener('click', () => {
                loadTrack(idx);
                audio.play().catch(e => console.log(e));
            });
            playlistPanel.appendChild(itemBtn);
        });
    }

    playBtn.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
    audio.addEventListener('play', () => {
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        coverImg.classList.add('scale-105', 'rotate-3');
    });
    audio.addEventListener('pause', () => {
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        coverImg.classList.remove('scale-105', 'rotate-3');
    });
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });
    audio.addEventListener('loadedmetadata', () => { totalDurationEl.textContent = formatTime(audio.duration); });
    progressContainer.addEventListener('click', (e) => { if (audio.duration) audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration; });
    document.getElementById('prevBtn').addEventListener('click', () => { loadTrack(currentTrackIdx - 1 < 0 ? playlist.length - 1 : currentTrackIdx - 1); audio.play(); });
    document.getElementById('nextBtn').addEventListener('click', () => { loadTrack(currentTrackIdx + 1 >= playlist.length ? 0 : currentTrackIdx + 1); audio.play(); });
    audio.addEventListener('ended', () => { loadTrack(currentTrackIdx + 1 >= playlist.length ? 0 : currentTrackIdx + 1); audio.play(); });
    document.getElementById('playlistToggleBtn').addEventListener('click', () => { playlistPanel.classList.toggle('hidden'); });

    loadTrack(0);
}

document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('lang') || 'id';
    
    initTheme();
    initBatteryDetection();
    initDigitalClock(); // Aktifkan jam digital real-time saat DOM siap
    initMultiMusicPlayer();
    setLanguage(savedLang);
    
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
        bioDropdown.addEventListener('click', (e) => { e.stopPropagation(); });
    }
    
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(err => {
            document.getElementById('apiList').innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><div class="text-4xl mb-4">⚠️</div><h3 class="font-bold text-lg mb-2">Failed to load API data</h3></div>`;
        });
});

themeToggleBtn.addEventListener('click', toggleTheme);

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 150);
});

window.addEventListener('beforeunload', cleanupBatteryMonitor);