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
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        }
      }
    );

    if (!response.data || response.data.api?.status !== 'ok') {
      return { status: false, message: 'Gagal mengambil data dari ytdown.' };
    }

    const apiData = response.data.api;
    
    // Struktur respons Audio Only
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
      // Filter hanya item yang bertipe Audio
      const audioItems = apiData.mediaItems.filter(item => item.type === 'Audio');

      // TAHAP 2: Menggunakan Promise.all agar proses menembak fileUrl berjalan paralel (bersamaan)
      const audioPromises = audioItems.map(async (item) => {
        let fileUrl = '-';

        if (item.mediaUrl) {
          try {
            // Lakukan polling maksimal 5 kali jika server membutuhkan waktu untuk convert file
            for (let i = 0; i < 5; i++) {
              const fileResponse = await axios.post('https://app.ytdown.to/proxy.php', 
                new URLSearchParams({ url: item.mediaUrl }), 
                {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
                  }
                }
              );

              const fileApiData = fileResponse.data?.api;

              // Pastikan fileUrl sudah ter-generate dan bukan berstatus "Waiting..."
              if (fileApiData && fileApiData.fileUrl && fileApiData.fileUrl !== 'Waiting...') {
                fileUrl = fileApiData.fileUrl;
                break; // Keluar dari loop polling jika sukses mendapatkan link s30.worker03
              }

              // Jeda waktu 1.5 detik sebelum mencoba hit ulang (polling)
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } catch (err) {
            // Jika terjadi error pada item audio tertentu, set default '-'
            fileUrl = '-';
          }
        }

        return {
          quality: item.mediaQuality || '-',
          size: item.mediaFileSize || '-',
          ext: item.mediaExtension || 'M4A',
          url: item.mediaUrl,
          fileUrl: fileUrl // <--- Tambahan Link unduhan langsung dari worker / s30
        };
      });

      // Tunggu hingga seluruh kualitas audio selesai mendapatkan fileUrl masing-masing
      result.audios = await Promise.all(audioPromises);
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
// ENDPOINT GET UTAMA (AUDIO ONLY)
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