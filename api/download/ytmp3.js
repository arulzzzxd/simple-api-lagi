const axios = require('axios'); // FIX: Mengubah 'Const' menjadi 'const'
const express = require('express');
const router = express.Router();

// Fungsi untuk mencari video berdasarkan query jika input bukan URL
async function search(q) {
  try {
    const r = await axios.get('https://yt-extractor.y2mp3.co/api/youtube/search?q=' + encodeURIComponent(q), {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'accept': 'application/json',
        'origin': 'https://ytmp3.gg',
        'referer': 'https://ytmp3.gg/'
      },
      timeout: 5000 // Batasi 5 detik agar tidak memicu Vercel Timeout
    });
    
    const i = r.data?.items?.find(v => v.type === 'stream');
    if (!i) throw new Error('Video tidak ditemukan melalui pencarian.');
    return i;
  } catch (err) {
    throw new Error('Pencarian gagal: ' + (err.response?.data?.message || err.message));
  }
}

// Fungsi khusus download mp3 128kbps
async function download(url) {
  const payload = {
    url: url,
    downloadMode: 'audio',
    brandName: 'ytmp3.gg',
    audioFormat: 'mp3',
    audioBitrate: '128'
  };

  const dataString = JSON.stringify(payload);

  try {
    const r = await axios.post('https://hub.y2mp3.co', dataString, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'content-type': 'application/json',
        'accept': 'application/json',
        'origin': 'https://ytmp3.gg',
        'referer': 'https://ytmp3.gg/',
        'content-length': Buffer.byteLength(dataString) // FIX: Membantu server target membaca payload bypass proteksi
      },
      timeout: 8000 // Batasi waktu tunggu respon dari server converter
    });

    if (!r.data || !r.data.url) {
      throw new Error('API Converter tidak mengembalikan link download (Gagal Convert).');
    }
    return r.data;
  } catch (err) {
    throw new Error('Converter Error: ' + (err.response?.data?.message || err.message));
  }
}

// Fungsi utama penentu input (URL atau Judul)
async function ytmp3(input) {
  let info = null;
  let url = input;

  // Deteksi regex URL yang lebih aman termasuk link youtube/googleusercontent Anda
  const isUrl = /^https?:\/\//i.test(input.trim());

  if (!isUrl) {
    info = await search(input);
    url = info.id; 
  }

  // Ambil data download
  const dl = await download(url);

  // Fallback metadata jika input berupa URL langsung agar respon JSON tidak bernilai null
  if (!info) {
    info = {
      title: dl.title || "YouTube Audio Download",
      thumbnailUrl: dl.thumbnail || "https://i.ytimg.com/vi/" + (url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : 'default') + "/0.jpg",
      uploaderName: dl.uploader || "Unknown",
      duration: dl.duration || "N/A",
      viewCount: null,
      uploadDate: null
    };
  }

  return {
    title: info.title,
    thumbnail: info.thumbnailUrl,
    uploader: info.uploaderName,
    duration: info.duration,
    viewCount: info.viewCount,
    uploadDate: info.uploadDate,
    type: 'mp3',
    quality: '128',
    downloadUrl: dl.url,
    filename: dl.filename || `${info.title.replace(/[/\\?%*:|"<>]/g, '-')}.mp3`
  };
}

// Endpoint GET /api/download/ytmp3
router.get("/", async (req, res) => {
  const url = req.query.url || req.query.q; // FIX: Mendukung fallback jika user tidak sengaja mengisi ?q=

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'url' wajib diisi! Contoh: ?url=https://youtube.com/watch?v=J1TFFzbCIiM"
    });
  }

  try {
    const result = await ytmp3(url);
    return res.status(200).json({
      status: true,
      creator: "Arulzxd",
      result,
      metadata: {
        source: "YouTube - Ytmp3 Bypass",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // Memberikan log mendetail ke console Vercel agar Anda tahu letak error aslinya
    console.error("LOG ERROR YTMP3:", error.message);

    return res.status(500).json({
      status: false,
      message: "Gagal memproses audio YouTube.",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
