const express = require('express');
const router = express.Router();
const axios = require('axios');

/*
// Rule34Video Scraper - Automated Latest Videos
// Author: Nimzz
// Jgn sange wok
*/

// ======================================================
// CORE SCRAPER FUNCTION (RULE34VIDEO - AUTOMATIC LATEST)
// ======================================================
async function scrapeRule34VideoLatest() {
    const BASE = 'https://rule34video.com';
    const UA = 'Mozilla/5.0 (Linux; Android 10; M2006C3MG Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/148.0.7778.178 Mobile Safari/537.36';
    const LIMIT = 10; // Otomatis dibatasi 10 video terbaru

    try {
        // Langsung mengambil data dari halaman utama (tanpa /search/query)
        const response = await axios.get(`${BASE}/`, {
            headers: { 'User-Agent': UA }
        });
        
        const html = response.data;
        const videos = [];
        const blocks = html.split(/<a\s+class="th"/gi).slice(1);

        for (const block of blocks) {
            const idMatch = block.match(/\/video\/(\d+)\//);
            const slugMatch = block.match(/\/video\/\d+\/([^/]+)\//);
            const titleMatch = block.match(/title="([^"]*)"/);
            const imgMatch = block.match(/data-original="([^"]*)"/);
            const durMatch = block.match(/<span[^>]*>(\d+:\d+(?::\d+)?)<\/span>/);
            const viewsMatch = block.match(/<span[^>]*>([\d,.KMB]+)\s+views?<\/span>/i);

            if (!idMatch) continue;
            
            const id = idMatch[1];
            const pad = Math.floor(id / 1000) * 1000;
            const hash = id.slice(-2);

            videos.push({
                id,
                title: titleMatch?.[1]?.replace(/&amp;/g, '&').replace(/&#039;/g, "'") || 'Untitled',
                thumbnail: imgMatch?.[1] || null,
                duration: durMatch?.[1] || null,
                views: viewsMatch?.[1] || null,
                post_url: `${BASE}/video/${id}/${slugMatch?.[1] || ''}/`,
                download_urls: {
                    '360p': `${BASE}/get_file/51/${hash}/${pad}/${id}/${id}_360p.mp4/`,
                    '480p': `${BASE}/get_file/51/${hash}/${pad}/${id}/${id}_480p.mp4/`,
                    '720p': `${BASE}/get_file/51/${hash}/${pad}/${id}/${id}_720p.mp4/`,
                    '1080p': `${BASE}/get_file/51/${hash}/${pad}/${id}/${id}_1080p.mp4/`
                }
            });
        }

        // Selalu potong mengambil 10 video teratas/terbaru
        return videos.slice(0, LIMIT);

    } catch (error) {
        throw error;
    }
}

// ======================================================
// ENDPOINT GET UTAMA (BERJALAN OTOMATIS)
// ======================================================
router.get('/', async (req, res) => {
    try {
        // Langsung panggil fungsi tanpa parameter input apa pun
        const result = await scrapeRule34VideoLatest();

        if (!result.length) {
            return res.status(404).json({
                status: false,
                message: 'Tidak ada video terbaru yang ditemukan di halaman utama.'
            });
        }

        return res.status(200).json({
            status: true,
            creator: 'Arulzxd',
            result: {
                total: result.length, // Nilainya otomatis pas 10
                videos: result
            },
            metadata: {
                source: 'Rule34Video',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Gagal mengambil feed data terbaru dari Rule34Video',
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;