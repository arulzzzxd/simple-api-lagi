const BASE_URL = window.location.origin;
let isRequestInProgress = false;
let apiData = null;
let currentTheme = 'dark';
let activeCategory = 'all';

const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

// MENGEMBALIKAN FUNGSI MONITOR BATERAI
function initBatteryMonitor() {
    const batteryStatusEl = document.getElementById('batteryStatus');
    if (!batteryStatusEl) return;

    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryInfo() {
                const level = Math.round(battery.level * 100);
                batteryStatusEl.textContent = level + "%";
                
                // Ubah warna hijau jika sedang di-charge
                if (battery.charging) {
                    batteryStatusEl.style.color = '#4ade80'; // text-green-400
                } else {
                    batteryStatusEl.style.color = '#facc15'; // text-yellow-400
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
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggleDarkIcon?.classList.add('hidden');
        themeToggleLightIcon?.classList.remove('hidden');
    } else {
        body.classList.remove('light-mode');
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
    }
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
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}

function toggleCategory(index) {
    const content = document.getElementById(`cat-${index}`);
    content.classList.toggle('hidden');
}

function toggleEndpoint(catIdx, epIdx) {
    const content = document.getElementById(`ep-${catIdx}-${epIdx}`);
    content.classList.toggle('hidden');
}

async function executeRequest(e, catIdx, epIdx, method, path) {
    e.preventDefault();
    if (isRequestInProgress) return showToast("Harap tunggu permintaan saat ini selesai");

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
        showToast("Permintaan berhasil!");
    } catch (error) {
        responseContent.innerHTML = `Error: ${error.message}`;
    } finally {
        isRequestInProgress = false;
    }
}

function clearResponse(catIdx, epIdx) { 
    document.getElementById(`response-${catIdx}-${epIdx}`).classList.add('hidden'); 
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container || !apiData) return;
    let totalEndpoints = 0;
    apiData.categories.forEach(c => totalEndpoints += c.items.length);
    document.getElementById('totalEndpoints').textContent = totalEndpoints;

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
    
    renderCategoryFilters();
    let html = '';

    apiData.categories.forEach((category, catIdx) => {
        const catNameLower = category.name.toLowerCase();
        
        // PENGGUNAAN CLASS TEMA SINKRON (.api-card)
        html += `
        <div class="category-group api-card border rounded-xl overflow-hidden mb-4 shadow-sm" data-category="${catNameLower}">
            <button onclick="toggleCategory(${catIdx})" class="w-full px-4 py-4 flex items-center justify-between hover:opacity-80 transition-opacity">
                <h3 class="font-bold text-sm uppercase tracking-wider">📂 ${category.name}</h3>
            </button>
            <div id="cat-${catIdx}" class="hidden p-2 space-y-2">`;

        category.items.forEach((item, epIdx) => {
            const method = item.methods?.[0] || 'GET';
            const path = item.path.split('?')[0];

            html += `
            <div class="api-item border-t border-slate-700/50 pt-2" data-path="${path}">
                <button onclick="toggleEndpoint(${catIdx}, ${epIdx})" class="w-full text-left font-mono text-xs p-2 rounded hover:bg-slate-500/10">
                    <span class="text-green-500 font-bold mr-2">${method}</span>${path}
                </button>
                <div id="ep-${catIdx}-${epIdx}" class="hidden api-panel p-3 rounded mt-1 space-y-3 border border-slate-700/30">
                    <p class="text-xs opacity-70">${item.desc}</p>
                    
                    <form id="form-${catIdx}-${epIdx}" onsubmit="executeRequest(event, ${catIdx}, ${epIdx}, '${method}', '${path}')">
                        <div class="space-y-2">`;
            if (item.params) {
                Object.keys(item.params).forEach(p => {
                    // INPUT FIELD MENGGUNAKAN CLASS .api-input AGAR WARNA OTOMATIS BERUBAH
                    html += `
                    <div>
                        <label class="block text-[11px] font-bold mb-1">${p}</label>
                        <input type="text" name="${p}" class="api-input w-full text-xs p-2 rounded border focus:outline-none">
                    </div>`;
                });
            }
            html += `
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button type="submit" class="bg-yellow-500 text-black font-bold text-xs px-4 py-1.5 rounded">EXECUTE</button>
                            <button type="button" onclick="clearResponse(${catIdx},${epIdx})" class="border border-slate-500 text-xs px-4 py-1.5 rounded opacity-80">CLEAR</button>
                        </div>
                    </form>
                    <div id="response-${catIdx}-${epIdx}" class="hidden p-3 rounded text-xs border api-response">
                        <div id="response-content-${catIdx}-${epIdx}"></div>
                    </div>
                </div>
            </div>`;
        });

        html += `</div></div>`;
    });
    apiList.innerHTML = html;
}

function performSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    document.querySelectorAll('.category-group').forEach(cat => {
        const catName = cat.dataset.category;
        if (activeCategory !== 'all' && catName !== activeCategory) {
            cat.style.display = 'none';
            return;
        }
        let hasVisible = false;
        cat.querySelectorAll('.api-item').forEach(item => {
            if (item.dataset.path.toLowerCase().includes(q)) {
                item.style.display = 'block';
                hasVisible = true;
            } else {
                item.style.display = 'none';
            }
        });
        cat.style.display = hasVisible ? 'block' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initBatteryMonitor(); // FUNGSI BATERAI DIPANGGIL SAAT WEB DIMUAT
    
    fetch('/api/apilist')
        .then(res => res.json())
        .then(data => { apiData = data; loadApis(); })
        .catch(err => console.error("Gagal load API:", err));
});

themeToggleBtn?.addEventListener('click', toggleTheme);
document.getElementById('searchInput')?.addEventListener('input', performSearch);
