const express = require('express');
const router = express.Router();
const ytdl = require('@distube/ytdl-core');

router.get("/", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'url' wajib diisi!"
    });
  }

  try {
    // Validasi apakah URL tersebut merupakan tautan YouTube yang benar
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ status: false, message: "URL YouTube tidak valid!" });
    }

    // Ambil metadata info video langsung dari YouTube
    const info = await ytdl.getInfo(url);
    
    // Cari format yang hanya audio (audioonly) dengan kualitas terbaik yang tersedia
    const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

    if (!audioFormat || !audioFormat.url) {
      throw new Error("Gagal mendapatkan format audio dari video ini.");
    }

    return res.status(200).json({
      status: true,
      creator: "Arulzxd",
      result: {
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0]?.url || null,
        uploader: info.videoDetails.author.name,
        duration: info.videoDetails.lengthSeconds,
        viewCount: info.videoDetails.viewCount,
        uploadDate: info.videoDetails.uploadDate,
        type: 'mp3',
        quality: '128', 
        downloadUrl: audioFormat.url, // URL audio mentah langsung dari Google Video Server
        filename: `${info.videoDetails.title.replace(/[/\\?%*:|"<>]/g, '-')}.mp3`
      },
      metadata: {
        source: "YouTube Native Scraper",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("LOG SC_ERROR:", error.message);
    return res.status(500).json({
      status: false,
      message: "Gagal memproses audio YouTube.",
      error_detail: error.message
    });
  }
});

module.exports = router;
