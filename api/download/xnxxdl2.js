const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// ======================================================
// CORE DOWNLOADER FUNCTION (ROBUST & ANTI-PATAH)
// ======================================================
async function xnxxdl2(url) {
    try {
        // Tambahkan User-Agent agar tidak diblokir oleh sistem proteksi situs
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);

        const title = $('meta[property="og:title"]').attr('content') || '';
        const duration = $('meta[property="og:duration"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';
        const videoType = $('meta[property="og:video:type"]').attr('content') || '';
        const videoWidth = $('meta[property="og:video:width"]').attr('content') || '';
        const videoHeight = $('meta[property="og:video:height"]').attr('content') || '';
        const info = $('span.metadata').text().trim() || '';
        
        // JALUR AMAN: Cari ke semua tag script yang mengandung variabel video player
        let videoScript = '';
        $('script').each((index, element) => {
            const scriptContent = $(element).html();
            if (scriptContent && scriptContent.includes('html5player.setVideoUrlLow')) {
                videoScript = scriptContent;
            }
        });

        // Ekstraksi menggunakan regex yang lebih fleksibel
        const files = {
            low: (videoScript.match(/html5player\.setVideoUrlLow\(\s*'([^']+)'\s*\)/) || [])[1] || '',
            high: (videoScript.match(/html5player\.setVideoUrlHigh\(\s*'([^']+)'\s*\)/) || [])[1] || '',
            HLS: (videoScript.match(/html5player\.setVideoHLS\(\s*'([^']+)'\s*\)/) || [])[1] || '',
            thumb: (videoScript.match(/html5player\.setThumbUrl\(\s*'([^']+)'\s*\)/) || [])[1] || '',
            thumb69: (videoScript.match(/html5player\.setThumbUrl169\(\s*'([^']+)'\s*\)/) || [])[1] || '',
            thumbSlide: (videoScript.match(/html5player\.setThumbSlide\(\s*'([^']+)'\s*\)/) || [])[1] || '',
            thumbSlideBig: (videoScript.match(/html5player\.setThumbSlideBig\(\s*'([^']+)'\s*\)/) || [])[1] || '',
        };

        return {
            title,
            url,
            duration,
            image,
            videoType,
            videoWidth,
            videoHeight,
            info,
            files
        };
    } catch (error) {
        throw error;
    }
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================
router.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'url' wajib diisi! Contoh: ?url=https://www.xnxx.com/video-xxxxxx/..."
        });
    }

    try {
        const result = await xnxxdl2(url);

        return res.status(200).json({
            status: true,
            creator: 'Arulzxd',
            result,
            metadata: {
                source: 'XNXX2 Downloader',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Gagal mengambil data video XNXX',
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;