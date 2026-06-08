const express = require('express');
const router = express.Router();
const vreden = require('@vreden/youtube_scraper');
const yts = require('yt-search');

// ======================================================
// MAIN YTMP3 FUNCTION WITH YT-SEARCH INTEGRATION
// ======================================================
async function ytmp3(url) {
    // 1. Ambil metadata detail dari yt-search terlebih dahulu
    let metadata = { title: "-", duration: "-", thumbnail: "-" };
    try {
        const videoId = yts.getVideoID(url); // Mengekstrak ID video dari URL
        const videoInfo = await yts({ videoId: videoId });
        
        if (videoInfo) {
            metadata.title = videoInfo.title;
            metadata.duration = videoInfo.duration.timestamp; // Format 03:45
            metadata.thumbnail = videoInfo.thumbnail;
        }
    } catch (e) {
        console.log("Gagal mengambil metadata dari yt-search, menggunakan default.");
    }

    // 2. Ambil link download dari vreden scraper
    const scraperResult = await vreden.ytmp3(url);

    if (!scraperResult || !scraperResult.status) {
        throw new Error("Gagal mengambil data audio dari YouTube. Pastikan URL benar.");
    }

    // Struktur bersarang (nested) untuk menyamakan dengan format output yang Anda inginkan
    const downloadData = scraperResult.download;

    return {
        judul: metadata.title,
        durasi: metadata.duration,
        ukuran: scraperResult.size || (downloadData ? "Unknown" : "-"),
        thumbnail: metadata.thumbnail,
        download: {
            status: true,
            quality: downloadData?.quality || "128kbps",
            url: downloadData?.url || scraperResult.download, // Menyesuaikan jika strukturnya objek atau string langsung
            filename: downloadData?.filename || `${metadata.title}.mp3`
        }
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
