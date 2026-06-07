const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let currentLang = 'id';
let totalEndpoints = 0;
let totalCategories = 0;
let batteryMonitor = null;
let activeCategory = 'all';

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

const videoBg = document.getElementById('bg-video');
const bgDarkSource = 'https://cdn.pixabay.com/video/2020/02/24/32773-393278239_tiny.mp4'; 
const bgLightSource = 'https://cdn.pixabay.com/video/2019/03/28/22373-328940142_tiny.mp4'; 

const categoryIcons = {
    'ai': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M12 2c-.55 0-1 .45-1 1v1H9c-.55 0-1 .45-1 1v1H6c-.55 0-1 .45-1 1v2H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2v2c0 .55.45 1 1 1h2v1c0 .55.45 1 1 1h2v1c0 .55.45 1 1 1s1-.45 1-1v-1h2c.55 0 1-.45 1-1v-1h2c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-2V9c0-.55-.45-1-1-1h-2V7c0-.55-.45-1-1-1h-2V4c0-.55-.45-1-1-1h-1V3c0-.55-.45-1-1-1zm0 4c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    'islam': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
    'tools': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    'random': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/></svg>',
    'default': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-yellow-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
};

const i18n = {
    id: {
        searchPlaceholder: "Cari endpoint berdasarkan nama, path, atau kategori...",
        noResultsTitle: "Endpoint tidak ditemukan",
        noResultsDesc: "Coba gunakan kata kunci lain",
        batteryTitle: "Baterai",
        endpointsTitle: "Total Endpoint",
        categoriesTitle: "Total Kategori",
        batteryCharging: "Mengisi",
        batteryFull: "Penuh",
        batteryDischarging: "Sisa",
        endpointsCount: "endpoints",
        endpointNotAvailable: "⚠️ Endpoint ini tidak tersedia untuk pengujian",
        toastRequestWait: "Harap tunggu permintaan saat ini selesai",
        toastRequestSuccess: "Permintaan berhasil diselesaikan!",
        toastRequestFailed: "Permintaan gagal!"
    },
    en: {
        searchPlaceholder: "Search endpoints by name, path, or category...",
        noResultsTitle: "No endpoints found",
        noResultsDesc: "Try a different search term",
        batteryTitle: "Battery",
        endpointsTitle: "Total Endpoints",
        categoriesTitle: "Total Categories",
        batteryCharging: "Charging",
        batteryFull: "Full",
        batteryDischarging: "Left",
        endpointsCount: "endpoints",
        endpointNotAvailable: "⚠️ This endpoint is not available for testing",
        toastRequestWait: "Please wait for current request",
        toastRequestSuccess: "Request completed successfully!",
        toastRequestFailed: "Request failed!"
    }
};

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
        themeToggleBtn.className = "flex items-center justify-center w-8 h-8 rounded-lg bg-white text-black transition-all active:scale-95 focus:outline-none border border-slate-200 shadow-sm";
        if (videoBg) videoBg.src = bgLightSource;
    } else {
        body.classList.remove('light-mode');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
        themeToggleBtn.className = "flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white transition-all active:scale-95 focus:outline-none border border-slate-800";
        if (videoBg) videoBg.src = bgDarkSource;
    }
    updateSocialBadges();
}

function toggleTheme() {
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
        themeToggleBtn.className = "flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white transition-all active:scale-95 focus:outline-none border border-slate-800";
        currentTheme = 'dark';
        if (videoBg) { videoBg.src = bgDarkSource; videoBg.load(); videoBg.play(); }
    } else {
        body.classList.add('light-mode');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
        themeToggleBtn.className = "flex items-center justify-center w-8 h-8 rounded-lg bg-white text-black transition-all active:scale-95 focus:outline-none border border-slate-200 shadow-sm";
        currentTheme = 'light';
        if (videoBg) { videoBg.src = bgLightSource; videoBg.load(); videoBg.play(); }
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
    document.getElementById('stat-battery-title').textContent = i18n[lang].batteryTitle;
    document.getElementById('stat-endpoints-title').textContent = i18n[lang].endpointsTitle;

    if (batteryMonitor) { window.dispatchEvent(new Event('batteryupdate-hook')); }
    if (apiData) loadApis();
}

function updateSocialBadges() {
    const isLightMode = body.classList.contains('light-mode');
    document.querySelectorAll('.social-badge > div').forEach(badge => {
        badge.className = 'px-4 py-2 rounded-lg text-xs font-medium transition-colors text-center border light-mode:border-gray-200 border-slate-800/60';
        if (isLightMode) {
            badge.classList.add('bg-gray-100', 'text-gray-800', 'hover:bg-gray-200');
        } else {
            badge.classList.add('bg-gray-800/50', 'text-gray-300', 'hover:bg-gray-700');
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
                const isLightMode = body.classList.contains('light-mode');

                batteryPercentageElement.textContent = `${roundedLevel}%`;
                batteryLevelElement.style.width = `${level}%`;

                if (level > 60) {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-green-600' : 'bg-green-500');
                } else if (level > 20) {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-yellow-600' : 'bg-yellow-500');
                } else {
                    batteryLevelElement.className = 'battery-level ' + (isLightMode ? 'bg-red-600' : 'bg-red-500');
                }

                if (isCharging) {
                    batteryContainer.classList.add('charging');
                    batteryStatusElement.textContent = i18n[currentLang].batteryCharging;
                    batteryLevelElement.classList.add('battery-charging');
                } else {
                    batteryContainer.classList.remove('charging');
                    batteryLevelElement.classList.remove('battery-charging');
                    batteryStatusElement.textContent = battery.dischargingTime === Infinity ? i18n[currentLang].batteryFull : i18n[currentLang].batteryDischarging;
                }
            }
            updateBatteryInfo();
            battery.addEventListener('levelchange', updateBatteryInfo);
            battery.addEventListener('chargingchange', updateBatteryInfo);
            window.addEventListener('batteryupdate-hook', updateBatteryInfo);
            batteryMonitor = battery;
        }).catch(fallbackBattery);
    } else {
        fallbackBattery();
    }

    function fallbackBattery() {
        batteryStatusElement.textContent = 'Simulated';
        batteryPercentageElement.textContent = '85%';
        batteryLevelElement.style.width = '85%';
        batteryLevelElement.className = 'battery-level bg-green-500';
    }
}

function cleanupBatteryMonitor() { if (batteryMonitor) batteryMonitor = null; }
function updateTotalEndpoints() { document.getElementById('totalEndpoints').textContent = totalEndpoints; }
function updateTotalCategories() { document.getElementById('totalCategories').textContent = 'REST'; }

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
        showToast(`${type} copied to clipboard!`);
    }).catch(() => {
        showToast('Failed to copy', true);
    });
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
        ? 'px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5' 
        : 'px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5';

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
    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = '<div class="spinner mx-auto"></div>';

    try {
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            const data = await response.json();
            responseContent.innerHTML = `<pre class="code-font text-sm overflow-auto">${JSON.stringify(data, null, 2)}</pre>`;
        } else if (contentType?.startsWith("image/") || contentType?.startsWith("video/") || contentType?.startsWith("audio/") || contentType?.includes("application/pdf")) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            responseContent.innerHTML = createMediaPreview(url, contentType, fullPath);
        } else {
            const text = await response.text();
            responseContent.innerHTML = `<pre class="code-font text-sm overflow-auto">${text}</pre>`;
        }
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

function clearResponse(catIdx, epIdx) {
    document.getElementById(`response-${catIdx}-${epIdx}`).classList.add('hidden');
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

function loadApis() {
    const apiList = document.getElementById('apiList');
    if (!apiList || !apiData || !apiData.categories) return;

    const isLightMode = body.classList.contains('light-mode');
    totalEndpoints = 0;
    totalCategories = apiData.categories.length;
    apiData.categories.forEach(category => { totalEndpoints += category.items.length; });

    updateTotalEndpoints();
    updateTotalCategories();
    renderCategoryFilters(); 

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
        <div class="category-group fade-in" data-category="${catNameLower}">
            <div class="${isLightMode ? 'bg-white/80 border-gray-300 backdrop-blur-md' : 'bg-black/40 border-white/10 backdrop-blur-md'} border rounded-xl overflow-hidden card-hover">
                <button onclick="toggleCategory(${catIdx})" class="w-full px-4 py-4 flex items-center justify-between ${isLightMode ? 'hover:bg-gray-100/50' : 'hover:bg-white/5'} transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 flex items-center justify-center bg-black/40 rounded-lg border border-white/10 shadow-sm flex-shrink-0">
                            ${iconSvg}
                        </div>
                        <div class="text-left">
                            <h3 class="font-bold text-sm tracking-widest text-white light-mode:text-gray-900 uppercase">${category.name}</h3>
                            <p class="text-[11px] code-font ${isLightMode ? 'text-gray-500' : 'text-gray-400'}">${category.items.length} ${i18n[currentLang].endpointsCount}</p>
                        </div>
                    </div>
                    <svg id="cat-icon-${catIdx}" class="w-5 h-5 ${isLightMode ? 'text-gray-500' : 'text-gray-400'} transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div class="api-item border-t ${isLightMode ? 'border-gray-200' : 'border-white/10'}" 
                data-method="${method}" data-path="${path}" data-alias="${item.name.toLowerCase()}" data-description="${item.desc.toLowerCase()}" data-category="${category.name.toLowerCase()}">
                <button onclick="toggleEndpoint(${catIdx}, ${epIdx})" class="w-full px-4 py-3 flex items-center justify-between ${isLightMode ? 'hover:bg-gray-50/50' : 'hover:bg-white/5'} transition-colors">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <span class="${isLightMode ? 'bg-gray-200 text-gray-800' : 'bg-white/10 text-white border border-white/10'} px-2 py-1 rounded text-[10px] flex-shrink-0 code-font font-bold">${method}</span>
                        <div class="text-left flex-1 min-w-0">
                            <p class="code-font font-semibold text-[13px] text-white light-mode:text-gray-900 truncate">${path}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <p class="text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-400'} truncate">${item.name}</p>
                                <span class="px-1.5 py-0.5 text-[9px] rounded-sm ${statusClass} flex-shrink-0 uppercase tracking-wider border border-white/10">${item.status || 'ready'}</span>
                            </div>
                        </div>
                    </div>
                </button>
                <div id="ep-${catIdx}-${epIdx}" class="hidden ${isLightMode ? 'bg-gray-50/80' : 'bg-black/50'} px-4 py-4 border-t ${isLightMode ? 'border-gray-200' : 'border-white/10'}">
                    <p class="${isLightMode ? 'text-gray-600' : 'text-gray-300'} mb-4 text-xs">${item.desc}</p>
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-bold text-[11px] uppercase tracking-wider ${isLightMode ? 'text-gray-500' : 'text-gray-400'}">Endpoint</h4>
                            <button onclick="copyText('${BASE_URL}${path}', 'URL')" class="px-2 py-1 ${isLightMode ? 'bg-gray-200 hover:bg-gray-300 text-black' : 'bg-white/10 hover:bg-white/20 text-white'} rounded text-[10px] transition-colors code-font">Copy URL</button>
                        </div>
                        <div class="${isLightMode ? 'bg-white border-gray-300' : 'bg-black/60 border-white/10'} border px-3 py-2 rounded-lg">
                            <code class="code-font text-xs ${isLightMode ? 'text-gray-800' : 'text-teal-400'}">${path}</code>
                        </div>
                    </div>`;

            if (item.status === 'ready') {
                html += `
                    <div>
                        <h4 class="font-bold text-[11px] uppercase tracking-wider ${isLightMode ? 'text-gray-500' : 'text-gray-400'} mb-3">Parameter</h4>
                        <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${method}', '${path}')">
                            <div class="space-y-3 mb-4">`;
                if (item.params) {
                    Object.keys(item.params).forEach(paramName => {
                        const isRequired = !queryParams.has(paramName) || queryParams.get(paramName) === '';
                        html += `
                            <div>
                                <label class="block text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-1.5 code-font">
                                    ${paramName} ${isRequired ? '<span class="text-red-500">*</span>' : ''}
                                </label>
                                <input type="text" name="${paramName}" class="search-input w-full px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 code-font text-sm ${isLightMode ? 'bg-white text-black' : 'bg-black/60 text-white border-white/10'}" placeholder="${item.params[paramName]}" ${isRequired ? 'required' : ''}>
                            </div>`;
                    });
                }
                html += `
                            </div>
                            <div class="flex gap-3">
                                <button type="submit" class="px-5 py-2 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-black rounded-md font-bold text-xs transition-all flex items-center justify-center">EKSEKUSI</button>
                                <button type="button" onclick="clearResponse(${catIdx}, ${epIdx})" class="px-5 py-2 bg-transparent border border-gray-500 hover:border-gray-300 text-gray-300 rounded-md font-bold text-xs transition-colors">BERSIHKAN</button>
                            </div>
                        </form>
                        <div id="response-${catIdx}-${epIdx}" class="hidden mt-6 space-y-4">
                            <div>
                                <h5 class="text-[11px] uppercase tracking-wider font-bold mb-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}">Response</h5>
                                <div class="${isLightMode ? 'bg-white border-gray-300' : 'bg-black/60 border-white/10'} border p-3 rounded-lg min-h-[100px] overflow-x-auto" id="response-content-${catIdx}-${epIdx}"></div>
                            </div>
                        </div>
                    </div>`;
            } else {
                html += `<div class="px-4 py-3 status-warning border border-yellow-500/30 rounded-lg text-xs bg-yellow-500/10">${i18n[currentLang].endpointNotAvailable}</div>`;
            }
            html += `</div></div></div>`;
        });
        html += `</div></div></div>`;
    });
    apiList.innerHTML = html;
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');
    let hasVisibleItems = false;

    document.querySelectorAll('.category-group').forEach(category => {
        const catName = category.dataset.category;

        if (activeCategory !== 'all' && catName !== activeCategory) {
            category.classList.add('hidden');
            return;
        }

        let categoryHasVisibleItems = false;
        category.querySelectorAll('.api-item').forEach(item => {
            const matches = item.dataset.path.toLowerCase().includes(searchTerm) || 
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
        });

        category.classList.toggle('hidden', !categoryHasVisibleItems);
    });

    noResults.classList.toggle('hidden', hasVisibleItems);
}

async function loadLinkBio() {
    try {
        const response = await fetch('linkbio.json');
        if (!response.ok) throw new Error('Failed');
        const socialData = await response.json();

        document.getElementById('socialLoading').classList.add('hidden');
        const socialContainer = document.getElementById('socialContainer');
        const isLightMode = body.classList.contains('light-mode');

        socialContainer.innerHTML = '';

        socialData.link_bio.forEach(social => {
            const socialElement = document.createElement('a');
            socialElement.href = social.url;
            socialElement.target = '_blank';
            socialElement.className = 'social-badge w-full';

            const innerDiv = document.createElement('div');
            innerDiv.className = 'px-4 py-2 rounded-lg text-xs font-medium transition-colors text-center border light-mode:border-gray-200 border-slate-800/60';

            if (isLightMode) {
                innerDiv.classList.add('bg-gray-100', 'text-gray-800', 'hover:bg-gray-200');
            } else {
                innerDiv.classList.add('bg-gray-800/50', 'text-gray-300', 'hover:bg-gray-700');
            }
            innerDiv.textContent = social.name;
            socialElement.appendChild(innerDiv);
            socialContainer.appendChild(socialElement);
        });
    } catch (error) {
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
            itemBtn.className = `w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-all ${isActive ? 'bg-teal-500/20 border border-teal-500/30 text-teal-400 font-bold' : 'hover:bg-white/5 text-gray-400'}`;
            itemBtn.innerHTML = `<div class="flex items-center gap-2 truncate"><span class="opacity-50 text-[10px] code-font">${String(idx + 1).padStart(2, '0')}</span><span class="truncate">${track.title} <span class="opacity-60 font-normal">- ${track.artist}</span></span></div>${isActive ? '<span class="text-[9px] tracking-wider text-teal-400 bg-teal-500/20 px-1.5 py-0.5 rounded animate-pulse font-bold border border-teal-500/30">PLAYING</span>' : ''}`;
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
    loadLinkBio();
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
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => {
            apiData = data;
            loadApis();
        })
        .catch(err => {
            document.getElementById('apiList').innerHTML = `<div class="text-center p-8 bg-red-900/20 border border-red-700 rounded-lg"><div class="text-4xl mb-4">⚠️</div><h3 class="font-bold text-lg mb-2 text-white">Failed to load API data</h3></div>`;
        });
});

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
});

window.addEventListener('beforeunload', cleanupBatteryMonitor);