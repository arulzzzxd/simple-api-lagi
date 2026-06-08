const express = require('express');
const router = express.Router();
const vreden = require('@vreden/youtube_scraper');

// ======================================================
// MAIN YTMP3 FUNCTION USING VREDEN SCRAPER
// ======================================================
async function ytmp3(url) {
    // Memanggil fungsi ytmp3 dari library vreden
    const result = await vreden.ytmp3(url);

    // Validasi respons dari library
    if (!result || !result.status) {
        throw new Error("Gagal mengambil data audio dari YouTube. Pastikan URL benar.");
    }

    // Mengembalikan data sesuai struktur yang rapi
    return {
        judul: result.title || "-",
        durasi: result.duration || "-",
        ukuran: result.size || "-",
        quality: "MP3 128kbps", // Umumnya default kualitas library scraper ini
        download: result.download
    };
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================
router.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({
            status: false,
            error: "Missing 'url' parameter"
        });
    }

    try {
        const result = await ytmp3(url);

        return res.status(200).json({
            status: true,
            creator: 'Arulzxd',
            result
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message || "Terjadi kesalahan pada server."
        });
    }
});

module.exports = router;
