const axios = require("axios");
const express = require("express");

const router = express.Router();

async function yt2mp3Dl(youtubeUrl) {
  try {
    // TAHAP 1: Inisialisasi konversi / Ambil Data awal
    // Catatan: Ganti '/api/convert' atau '/ajax.php' jika kamu menemukan endpoint aslinya di tab Network F12
    const initResponse = await axios.post('https://yt2mp3.gs/api/ajax.php', 
      new URLSearchParams({
        url: youtubeUrl,
        format: 'mp3',
        lang: 'en'
      }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://yt2mp3.gs',
          'Referer': 'https://yt2mp3.gs/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        }
      }
    );

    const data = initResponse.data;

    // Validasi respons dari server target
    if (!data || data.status !== 'success' && !data.url) {
      return { 
        status: false, 
        message: 'Gagal mendapatkan respons valid dari yt2mp3.gs',
        debug: data // Membantu kamu melihat isi asli respons jika error
      };
    }

    // TAHAP 2: Susun output sesuai format yang kamu inginkan sebelumnya
    return {
      status: true,
      title: data.title || 'YouTube Audio',
      id: data.id || '-',
      thumbnail: data.thumbnail || '-',
      duration: data.duration || '-',
      channel: data.channel || '-',
      audios: [
        {
          quality: data.quality || '128K',
          size: data.size || '-',
          ext: 'MP3',
          fileUrl: data.url || data.fileUrl || '' // Mengambil link download langsung (.mp3)
        }
      ]
    };

  } catch (error) {
    return {
      status: false,
      message: `Scrape Error: ${error.message}`
    };
  }
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================
router.get("/", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(200).json({
      status: false,
      message: "Parameter 'url' wajib diisi!"
    });
  }

  const result = await yt2mp3Dl(url);

  if (!result.status) {
    return res.status(200).json(result); // Menggunakan 200 agar log error terbaca di UI Dashboard
  }

  return res.status(200).json({
    status: true,
    creator: "Arulzxd",
    result,
    metadata: {
      source: "yt2mp3.gs",
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;