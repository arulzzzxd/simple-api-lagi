const axios = require("axios");
const express = require("express");

const router = express.Router();

// Fungsi murni untuk mengambil data mentah dari ytdown
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

    return { status: true, data: response.data.api };

  } catch (e) {
    return { status: false, message: e.message };
  }
}

// ======================================================
// ENDPOINT GET UTAMA (MENGHASILKAN LINK BYPASS INTERNAL)
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
    const searchResult = await ytdownDl(url);

    if (!searchResult.status) {
      return res.status(400).json(searchResult);
    }

    const apiData = searchResult.data;
    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = req.baseUrl || ''; // Otomatis mendeteksi path mounting router (/api/download/ytmp3)

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
      apiData.mediaItems.forEach(item => {
        if (item.type === 'Audio') {
          // PERBAIKAN: Link diubah mengarah ke endpoint /bypass milik kita sendiri
          const bypassUrl = `${protocol}://${host}${baseUrl}/bypass?fetchUrl=${encodeURIComponent(item.mediaUrl)}`;
          
          result.audios.push({
            quality: item.mediaQuality || '-',
            size: item.mediaFileSize || '-',
            ext: item.mediaExtension || 'M4A',
            url: bypassUrl // User akan menerima link internal yang aman
          });
        }
      });
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

// ======================================================
// ENDPOINT BYPASS (TEMBAK TOKEN FRESH & REDIRECT INSTAN)
// ======================================================
router.get("/bypass", async (req, res) => {
  const fetchUrl = req.query.fetchUrl;

  if (!fetchUrl) {
    return res.status(400).send("Parameter 'fetchUrl' tidak ditemukan.");
  }

  try {
    // Teruskan IP dan User-Agent asli dari perangkat user yang mengklik link
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientUserAgent = req.headers['user-agent'];

    // Ambil fileUrl secara real-time (0 milidetik saat link diklik)
    const resFile = await axios.get(fetchUrl, {
      headers: {
        'User-Agent': clientUserAgent || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'X-Forwarded-For': clientIp,
        'X-Real-IP': clientIp
      }
    });

    if (resFile.data && resFile.data.fileUrl) {
      // LANGSUNG DOWNLOAD: Alihkan browser user ke link download dl.iamworker.com yang valid
      return res.redirect(resFile.data.fileUrl);
    } else {
      return res.status(400).send("Gagal mendapatkan direct download url dari server worker.");
    }
  } catch (error) {
    return res.status(500).send("Error Passthrough: " + error.message);
  }
});

module.exports = router;