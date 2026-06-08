const express = require("express");
const yts = require("yt-search");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const url = req.query.url?.trim();

        // 1. Validasi Parameter URL
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter ?url= wajib diisi",
                example: "/ytmp3?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            });
        }

        // 2. Lakukan pencarian berdasarkan URL video
        // yt-search secara cerdas bisa mendeteksi jika input berupa URL
        const search = await yts(url);

        // Jika input berupa URL spesifik, biasanya yt-search mengembalikan objek video langsung atau di dalam array videos[0]
        const video = search.videos && search.videos.length > 0 ? search.videos[0] : null;

        if (!video) {
            return res.status(404).json({
                status: false,
                creator: "Arulzxd",
                message: "Video atau durasi tidak ditemukan dari link tersebut"
            });
        }

        // 3. Struktur Response Sukses dengan data Durasi Lengkap
        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: {
                title: video.title,
                videoId: video.videoId,
                url: video.url,
                // Mengambil durasi dalam berbagai format yang disediakan yt-search
                duration: {
                    timestamp: video.timestamp, // Format teks: "3:45"
                    seconds: video.seconds      // Format angka detik: 225
                },
                views: video.views,
                uploaded: video.ago,
                thumbnail: video.thumbnail,
                author: video.author?.name || "Unknown"
            },
            metadata: {
                source: "yt-search-link",
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Terjadi kesalahan saat mengekstrak informasi video",
            error: err.message
        });
    }
});

module.exports = router;
