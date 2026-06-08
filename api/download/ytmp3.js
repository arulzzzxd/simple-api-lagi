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
      title: apiData.title || '-',
      id: apiData.id || '-',
      thumbnail: apiData.imagePreviewUrl || '-',
      duration: apiData.mediaItems?.[0]?.mediaDuration || '-',
      channel: apiData.userInfo?.name || '-',
      audios: []
    };

    if (Array.isArray(apiData.mediaItems)) {
      // PERBAIKAN: Menggunakan for...of agar bisa menggunakan await di dalamnya
      for (const item of apiData.mediaItems) {
        if (item.type === 'Audio') {
          let finalDownloadUrl = item.mediaUrl;

          // Mengambil direct link dari properti "fileUrl"
          try {
            if (item.mediaUrl) {
              const resFile = await axios.get(item.mediaUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
                }
              });
              
              // Jika response memiliki properti fileUrl, gunakan itu
              if (resFile.data && resFile.data.fileUrl) {
                finalDownloadUrl = resFile.data.fileUrl;
              }
            }
          } catch (err) {
            // Jika gagal mengambil fileUrl, fallback/tetap gunakan link asli bawaan
            console.error("Gagal mendapatkan direct fileUrl:", err.message);
          }

          result.audios.push({
            quality: item.mediaQuality || '-',
            size: item.mediaFileSize || '-',
            ext: item.mediaExtension || 'M4A',
            url: finalDownloadUrl // SEKARANG BERISI LINK DL.IAMWORKER.COM
          });
        }
      }
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
// ENDPOINT GET UTAMA (AUDIO ONLY - DIRECT DOWNLOAD)
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

    if (!result.status) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      status: true,
      creator: "Arulzxd",
      result,
      metadata: {
        source: "YouTube - Ytmp3 (Direct Link)",
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