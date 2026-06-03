const express = require('express');
const router = express.Router();
const axios = require('axios'); // Menggunakan axios agar lebih stabil dan seragam
const cheerio = require('cheerio');

// ======================================================
// CORE DOWNLOADER FUNCTION (FIXED SYNTAX & REGEX)
// ======================================================
async function xnxxdl2(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('meta[property="og:title"]').attr('content');
        const duration = $('meta[property="og:duration"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        const videoType = $('meta[property="og:video:type"]').attr('content');
        const videoWidth = $('meta[property="og:video:width"]').attr('content');
        const videoHeight = $('meta[property="og:video:height"]').attr('content');
        const info = $('span.metadata').text();
        const videoScript = $('#video-player-bg > script:nth-child(6)').html() || '';

        // PERBAIKAN: Menggunakan regex literal dan meletakkan ( || [] ) di luar agar aman dari crash null
        const files = {
            low: (videoScript.match(/html5player\.setVideoUrlLow\('([^']+)'\)/) || [])[1] || '',
            high: (videoScript.match(/html5player\.setVideoUrlHigh\('([^']+)'\)/) || [])[1] || '',
            HLS: (videoScript.match(/html5player\.setVideoHLS\('([^']+)'\)/) || [])[1] || '',
            thumb: (videoScript.match(/html5player\.setThumbUrl\('([^']+)'\)/) || [])[1] || '',
            thumb69: (videoScript.match(/html5player\.setThumbUrl169\('([^']+)'\)/) || [])[1] || '',
            thumbSlide: (videoScript.match(/html5player\.setThumbSlide\('([^']+)'\)/) || [])[1] || '',
            thumbSlideBig: (videoScript.match(/html5player\.setThumbSlideBig\('([^']+)'\)/) || [])[1] || '',
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
