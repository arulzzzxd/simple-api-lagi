const axios = require('axios'); 
const express = require('express');
const router = express.Router();

// Fungsi untuk mencari video berdasarkan query jika input bukan URL
async function search(q) {
  try {
    const r = await axios.get('https://yt-extractor.y2mp3.co/api/youtube/search?q=' + encodeURIComponent(q), {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept': 'application/json, text/plain, */*',
        'origin': 'https://ytmp3.gg',
        'referer': 'https://ytmp3.gg/'
      },
      timeout: 5000 
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

  try {
    // FIX: Kirim sebagai objek langsung, biarkan Axios yang mengelola stringify & content-length secara native
    const r = await axios.post('https://hub.y2mp3.co', payload, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'content-type': 'application/json',
        'accept': 'application/json, text/plain, */*',
        'origin': 'https://ytmp3.gg',
        'referer': 'https://ytmp3.gg/'
      },
      timeout: 9000 
    });

    if (!r.data || !r.data.url) {
      throw new Error('API Converter tidak mengembalikan link download.');
    }
    return r.data;
  } catch (err) {
    // Mengambil pesan error internal dari server target jika ada
    const errMsg = err.response?.data?.message || err.response?.statusText || err.message;
    throw new Error('Converter Error: ' + errMsg);
  }
}

// Fungsi utama penentu input (URL atau Judul)
async function ytmp3(input) {
  let info = null;
  let url = input.trim();

  const isUrl = /^https?:\/\//i.test(url);

  if (!isUrl) {
    info = await search(url);
    url = info.id; 
  }

  const dl = await download(url);

  if (!info) {
    info = {
      title: dl.title || "YouTube Audio Download",
      thumbnailUrl: dl.thumbnail || "https://i.ytimg.com/vi/default/0.jpg",
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
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'url' wajib diisi! Contoh: ?url=https://www.youtube.com/watch?v=J1TFFzbCIiM"
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
    // Log mendetail ke server terminal (Vercel logs) untuk melacak respons error dari Axios
    console.error("LOG DETAIL ERROR:", error);

    return res.status(500).json({
      status: false,
      message: "Gagal memproses audio YouTube.",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
