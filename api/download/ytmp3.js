const axios = require("axios");
const express = require("express");

const router = express.Router();

async function ytdownDl(url) {
  try {
    const response = await axios.post('https://app.ytdown.to/proxy.php', 
      new URLSearchParams({ url: url }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        }
      }
    );

    if (!response.data || response.data.api?.status !== 'ok') {
      return { status: false, message: 'Gagal mengambil data dari ytdown.' };
    }

    const apiData = response.data.api;
    
    const result = {
      status: true,
      title: apiData.title || 'audio_youtube',
      id: apiData.id || '-',
      thumbnail: apiData.imagePreviewUrl || '-',
      duration: apiData.mediaItems?.[0]?.mediaDuration || '-',
      channel: apiData.userInfo?.name || '-',
      audios: []
    };

    if (Array.isArray(apiData.mediaItems)) {
      apiData.mediaItems.forEach(item => {
        if (item.type === 'Audio') {
          result.audios.push({
            quality: item.mediaQuality || '-',
            size: item.mediaFileSize || '-',
            ext: item.mediaExtension || 'M4A',
            url: item.mediaUrl
          });
        }
      });
    }

    return result;

  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  }
}

// ======================================================
// ENDPOINT GET UTAMA (DIRECT DOWNLOAD)
// ======================================================

router.get("/", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'url' wajib diisi! Contoh: ?url=https://youtu.be/xxxxxx"
    });
  }

  try {
    const result = await ytdownDl(url);

    if (!result.status || !result.audios || result.audios.length === 0) {
      return res.status(400).json({
        status: false,
        message: result.message || "Audio tidak ditemukan atau link tidak valid."
      });
    }

    // 1. Ambil URL download langsung dari hasil scraping (dl.iamworker.com)
    const directDownloadUrl = result.audios[0].url;

    // 2. Bersihkan judul video untuk dijadikan nama file .mp3 saat didownload
    const safeTitle = result.title.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safeTitle}.mp3`;

    // 3. Lakukan request stream ke link download tersebut
    const audioStream = await axios({
      method: 'GET',
      url: directDownloadUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
      }
    });

    // 4. Set Header agar Browser otomatis mendownloadnya sebagai file, bukan memutarnya
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    // 5. Alirkan file langsung ke user
    return audioStream.data.pipe(res);

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Gagal memproses download langsung",
      error: error.message
    });
  }
  
});

module.exports = router;