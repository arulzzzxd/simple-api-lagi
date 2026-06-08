const axios = require('axios'); 
const express = require('express');
const router = express.Router();

// Fungsi khusus download mp3 128kbps (Hanya menerima URL YouTube langsung)
async function download(url) {
  const payload = {
    url: url,
    downloadMode: 'audio',
    brandName: 'ytmp3.gg',
    audioFormat: 'mp3',
    audioBitrate: '128'
  };

  try {
    const r = await axios.post('https://hub.y2mp3.co', payload, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://ytmp3.gg/',
        'Origin': 'https://ytmp3.gg'
      },
      timeout: 9000 // Batasi 9 detik agar tidak mendahului timeout Vercel
    });

    if (!r.data || !r.data.url) {
      throw new Error('API Converter pihak ketiga gagal menghasilkan link download.');
    }
    return r.data;
  } catch (err) {
    // Membongkar pesan error asli dari API target agar bisa didebug dengan jelas
    const serverResponse = err.response?.data ? JSON.stringify(err.response.data) : '';
    throw new Error(`${err.response?.status || 'ERROR'} - ${err.message} ${serverResponse}`);
  }
}

// Endpoint GET /api/download/ytmp3
router.get("/", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'url' wajib diisi! Contoh: ?url=https://youtube.com/watch?v=J1TFFzbCIiM"
    });
  }

  try {
    // Langsung tembak fungsi download menggunakan URL dari query
    const dl = await download(url.trim());

    // Susun response JSON menggunakan metadata yang dikembalikan oleh API target
    return res.status(200).json({
      status: true,
      creator: "Arulzxd",
      result: {
        title: dl.title || "YouTube Audio Download",
        thumbnail: dl.thumbnail || null,
        uploader: dl.uploader || "Unknown",
        duration: dl.duration || "N/A",
        viewCount: null,
        uploadDate: null,
        type: 'mp3',
        quality: '128',
        downloadUrl: dl.url, // Link MP3 yang siap diunduh
        filename: dl.filename || `${(dl.title || 'audio').replace(/[/\\?%*:|"<>]/g, '-')}.mp3`
      },
      metadata: {
        source: "YouTube - Ytmp3 Direct",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // Cetak log asli di terminal Vercel Anda
    console.error("LOG ERROR YTMP3:", error.message);

    // Kembalikan detail error asli ke client untuk mempermudah tracking (misal jika diblokir Cloudflare)
    return res.status(500).json({
      status: false,
      message: "Gagal mengambil atau mengonversi audio YouTube.",
      error_detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
