const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

const title = "API Arulz-XD";
const favicon = "https://arulz-uploader.vercel.app/files/C5VYmq.jpg";
const logo = "https://arulz-uploader.vercel.app/files/SnhJe3.png";
const headertitle = "API Explorer <br>& Tester";
const headerdescription = "$ Browse, inspect & fire requests<br>against live endpoints._";
const footer = "© Arulz-XD";

const playlist = [
  { title: "PAMIT KERJO", artist: "NDX. AKA", cover: "https://raw.githubusercontent.com/upload-file-lab/fileupload7/main/uploads/1764494355026.jpeg", url: "https://files.catbox.moe/gfuwnv.mp3" },
  { title: "TANPO HUBUNGAN", artist: "LA TASYA", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop", url: "https://files.catbox.moe/xd5oq3.mp3" },
  { title: "DJ CIDRO 2", artist: "TIDAK DIKETAHUI", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop", url: "https://files.catbox.moe/u30w9k.mp3" }
];

const router = express.Router();
const apiPath = path.join(__dirname, 'api');

if (!fs.existsSync(apiPath)) {
    fs.mkdirSync(apiPath, { recursive: true });
}

function getEndpointsFromRouter(category, file) {
  const endpoints = [];
  const fullPath = path.join(apiPath, category, file);
  
  try {
    delete require.cache[require.resolve(fullPath)];
    const route = require(fullPath);
    const subRouter = route.router || route;
    
    if (subRouter && subRouter.stack) {
      subRouter.stack.forEach(layer => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
          // Ambil detail parameter statis jika ada di file, jika tidak pakai objek kosong
          const params = route.params || {}; 
          endpoints.push({
            name: file.replace('.js', ''),
            path: `/api/${category}${layer.route.path === '/' ? '' : layer.route.path}`,
            desc: route.desc || `Endpoint internal untuk fungsi ${file.replace('.js', '')}`,
            status: route.status || "ready",
            params: params,
            methods: methods
          });
        }
      });
    }
  } catch (e) {
    console.error(`Gagal mengekstrak endpoint dari ${category}/${file}:`, e);
  }
  return endpoints;
}

const endpointDirs = fs.readdirSync(apiPath).filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());

for (const category of endpointDirs) {
  const categoryPath = path.join(apiPath, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    try {
      const route = require(path.join(categoryPath, file));
      const subRouter = route.router || route;
      if (typeof subRouter === 'function' || subRouter.stack) {
        // Daftarkan base path agar routing express aktif secara global
        app.use(`/api/${category}`, subRouter);
      }
    } catch (err) {
      console.error(`Gagal memuat file router /api/${category}/${file}:`, err);
    }
  }
}

app.get('/api/apilist', (req, res) => {
  const categoriesStructure = [];
  
  for (const category of endpointDirs) {
    const categoryPath = path.join(apiPath, category);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    const items = [];
    
    for (const file of files) {
      const endpoints = getEndpointsFromRouter(category, file);
      items.push(...endpoints);
    }
    
    if (items.length > 0) {
      categoriesStructure.push({
        name: category,
        items: items
      });
    }
  }
  
  res.json({ categories: categoriesStructure });
});

app.get('/', (req, res) => {
  fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, html) => {
    if (err) return res.status(500).send('Error loading index.html');
    
    let modifiedHtml = html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(/<link rel="icon" text\/html.*?href=".*?"/, `<link rel="icon" type="image/jpeg" href="${favicon}"`)
      .replace(/id="logoImg" src=".*?"/, `id="logoImg" src="${logo}"`)
      .replace(/id="headerTitle">.*?<\/h1>/s, `id="headerTitle">${headertitle}</h1>`)
      .replace(/id="headerDesc">.*?<\/p>/s, `id="headerDesc">${headerdescription}</p>`)
      .replace(/<footer.*?>.*?<\/footer>/s, `<footer id="siteFooter" class="mt-12 pt-6 border-t border-white/20 light-mode:border-gray-300 text-center text-xs text-gray-500 code-font">${footer}</footer>`);
      
    const playlistScript = `<script>window.musicPlaylist = ${JSON.stringify(playlist)};</script>`;
    modifiedHtml = modifiedHtml.replace('</head>', `${playlistScript}</head>`);
    
    res.send(modifiedHtml);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});