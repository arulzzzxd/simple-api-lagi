const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();

const BASE = 'https://rule34video.com';
const UA = 'Mozilla/5.0 (Linux; Android 10; M2006C3MG Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/148.0.7778.178 Mobile Safari/537.36';

// ======================================================
// CORE RULE34 SEARCH FUNCTION WITH AUTO LIMIT
// ======================================================
async function rule34Search(searchQuery) {
    const parts = searchQuery.trim().split(/\s+/);

    // Mengambil angka di akhir teks untuk limit, default adalah 10 jika tidak diisi
    const limit = /^\d+$/.test(parts[parts.length - 1])
        ? Math.min(20, Math.max(1, parseInt(parts.pop()))) // Batas maksimum diatur ke 20 video
        : 10;

    const query = parts.join(' ').trim();

    const headers = {
        'User-Agent': UA
    };

    const url = `${BASE}/search/${encodeURIComponent(query)}/`;

    const { data: html } = await fetch.get(url, { headers });
    const results = [];
    
    // Parsing HTML menggunakan Regex (Metode bawaan kode asli tanpa menghapus tanda)
    const blocks = html.split(/<a\s+class="th"/gi).slice(1);

    for (const block of blocks) {
        if (results.length >= limit) break;

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

        results.push({
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

    return {
        query,
        limit,
        total_found: results.length,
        results
    };
}

// ======================================================
// ENDPOINT GET UTAMA (MENGGUNAKAN ?query=)
// ======================================================
router.get('/', async (req, res) => {
    const queryParam = req.query.query;

    if (!queryParam) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'query' wajib diisi! Contoh: ?query=Hutao 10"
        });
    }

    try {
        const result = await rule34Search(queryParam);

        return res.status(200).json({
            status: true,
            creator: 'Arulzxd',
            result,
            metadata: {
                source: 'Rule34Video',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Gagal mengambil data Rule34Video',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;