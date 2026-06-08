const axios = require('axios'); // Perbaikan: 'Const' diubah menjadi 'const' (lowercase)
const express = require('express');
const router = express.Router();

// Fungsi untuk mencari video berdasarkan query jika input bukan URL
async function search(q) {
  try {
    const r = await axios.get('https://yt-extractor.y2mp3.co/api/youtube/search?q=' + encodeURIComponent(q), {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        accept: 'application/json',
        origin: 'https://ytmp3.gg',
        referer: 'https://ytmp3.gg/'
      }
    });
    
    const i = r.data?.items?.find(v => v.type === 'stream');
    if (!i) throw new Error('Video tidak ditemukan melalui pencarian');
    return i;
  } catch (err) {
    throw new Error('Gagal melakukan pencarian: ' + err.message);
  }
}

// Fungsi khusus download mp3 128kbps
async function download(url) {
  const payload = {
    url,
    downloadMode: 'audio',
    brandName: 'ytmp3.gg',
    audioFormat: 'mp3',
    audioBitrate: '128' // Dikunci ke kualitas 128kbps
  };

  try {
    const r = await axios.post('https://hub.y2mp3.co', payload, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'content-type': 'application/json',
        accept: 'application/json',
        origin: 'https://ytmp3.gg',
        referer: 'https://ytmp3.gg/'
      }
    });

    if (!r.data?.url) throw new Error('Respon API tidak menyertakan link download');
    return r.data;
  } catch (err) {
    throw new Error('Gagal memproses ke server pengonversi: ' + err.message);
  }
}

// Fungsi utama (Menerima parameter: URL atau Judul Lagu)
async function ytmp3(input) {
  let info = null;
  let url = input;

  // Cek apakah input berupa URL (Termasuk URL pengujian Anda)
  const isUrl = /^https?:\/\//i.test(input);

  if (!isUrl) {
    info = await search(input);
    url = info.id; // Menggunakan ID hasil pencarian
  }

  // Eksekusi penembakan ke API converter
  const dl = await download(url);

  // Fallback: Jika input berupa URL langsung, objek 'info' belum terisi dari fungsi search.
  // Kita isi menggunakan data dari response download (jika tersedia), atau memberikan teks default.
  if (!info) {
    info = {
      title: dl.title || "YouTube Audio (Direct URL)",
      thumbnailUrl: dl.thumbnail || null,
      uploaderName: dl.uploader || "Unknown Uploader",
      duration: dl.duration || "00:00",
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
    downloadUrl: dl.url, // Link MP3 siap pakai
    filename: dl.filename || `${info.title.replace(/[/\\?%*:|"<>]/g, '-')}.mp3`
  };
}

// Route API
router.get("/", async (req, res) => {
  const url = req.query.url;

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
        source: "YouTube - Ytmp3",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Gagal mengambil audio YouTube",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
