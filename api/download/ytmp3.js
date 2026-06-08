const express = require('express');
const router = express.Router();
const { youtube } = require('@vreden/youtube_scraper');

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
    // Eksekusi scraper langsung menggunakan URL murni
    const data = await youtube(url.trim());

    if (!data || !data.mp3) {
      throw new Error("Gagal mengekstrak format MP3 dari video ini.");
    }

    return res.status(200).json({
      status: true,
      creator: "Arulzxd",
      result: {
        title: data.title || "YouTube Audio Download",
        thumbnail: data.thumbnail || null,
        uploader: data.author || "Unknown",
        duration: data.duration || "N/A",
        viewCount: null,
        uploadDate: null,
        type: 'mp3',
        quality: '128', // Kualitas standar dari hasil stream scraper
        downloadUrl: data.mp3, // Link download MP3 langsung siap pakai
        filename: `${(data.title || 'audio').replace(/[/\\?%*:|"<>]/g, '-')}.mp3`
      },
      metadata: {
        source: "YouTube - Vreden Scraper Direct",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // Log error asli ke console Vercel untuk mempermudah monitoring
    console.error("LOG ERROR VREDEN_YTMP3:", error.message);

    return res.status(500).json({
      status: false,
      message: "Gagal memproses atau mengonversi audio YouTube.",
      error_detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
