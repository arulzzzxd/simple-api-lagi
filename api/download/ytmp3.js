const axios = require("axios");
const express = require("express");

const router = express.Router();

async function ytdownDl(url) {
  try {
    // TAHAP 1: Ambil data metadata video dan daftar mediaUrl
    const response = await axios.post('https://app.ytdown.to/proxy.php', 
      new URLSearchParams({ url: url }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://ytdown.to',
          'Referer': 'https://ytdown.to/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        }
      }
    );

    if (!response.data || response.data.api?.status !== 'ok') {
      return { 
        status: false, 
        message: 'Gagal mengambil data dari ytdown. Server merespon tidak OK.',
        debug: response.data 
      };
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
      const audioItems = apiData.mediaItems.filter(item => item.type === 'Audio');

      // TAHAP 2: Menggunakan Promise.all (Dibatasi maks 3 kali polling agar tidak timeout di Vercel)
      const audioPromises = audioItems.map(async (item) => {
        let fileUrl = '';

        if (item.mediaUrl) {
          try {
            for (let i = 0; i < 3; i++) { 
              const fileResponse = await axios.post('https://app.ytdown.to/proxy.php', 
                new URLSearchParams({ url: item.mediaUrl }), 
                {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Origin': 'https://ytdown.to',
                    'Referer': 'https://ytdown.to/',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
                  }
                }
              );

              const fileApiData = fileResponse.data?.api;

              if (fileApiData && fileApiData.fileUrl && fileApiData.fileUrl !== 'Waiting...') {
                fileUrl = fileApiData.fileUrl;
                break; 
              }

              // Jeda jeda diturunkan ke 1 detik agar hemat waktu di Vercel
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (err) {
            fileUrl = `Error Fetch: ${err.message}`;
          }
        }

        return {
          quality: item.mediaQuality || '-',
          size: item.mediaFileSize || '-',
          ext: item.mediaExtension || 'MP3',
          fileUrl: fileUrl
        };
      });

      result.audios = await Promise.all(audioPromises);
    }

    return result;

  } catch (e) {
    return {
      status: false,
      message: `Sistem Error: ${e.message}`
    };
  }
}

// ======================================================
// ENDPOINT GET UTAMA (AUDIO ONLY)
// ======================================================

router.get("/", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(200).json({ // Diubah ke 200 agar pesan terbaca di UI
      status: false,
      message: "Parameter 'url' wajib diisi!"
    });
  }

  try {
    const result = await ytdownDl(url);

    // Diubah sementara ke status 200 agar log text error-nya muncul di UI kamu!
    if (!result.status) {
      return res.status(200).json(result); 
    }

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
    return res.status(200).json({ // Diubah ke 200 agar tidak tertutup pesan HTTP 400 global
      status: false,
      message: "Gagal mengambil audio YouTube global",
      error: error.message
    });
  }
});

module.exports = router;