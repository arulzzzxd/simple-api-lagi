const express = require("express");
const axios = require("axios");
const yts = require("yt-search");

const router = express.Router();

// Helper untuk memberikan jeda waktu (delay) saat memantau status konversi
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/", async (req, res) => {
    try {
        const url = req.query.url?.trim();

        // 1. Validasi Input Parameter URL
        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter ?url= wajib diisi",
                example: "/ytmp3?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            });
        }

        // 2. Ambil Metadata Video (Duration, Thumbnail, dll) via yt-search
        const search = await yts(url);
        const videoMeta = search.videos && search.videos.length > 0 ? search.videos[0] : null;

        if (!videoMeta) {
            return res.status(404).json({
                status: false,
                creator: "Arulzxd",
                message: "Informasi video tidak ditemukan. Pastikan link YouTube valid."
            });
        }

        // 3. Proses Tembak API yt2mp3.gs
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Origin": "https://yt2mp3.gs",
            "Referer": "https://yt2mp3.gs/",
            "Content-Type": "application/json"
        };

        // Langkah A: Inisialisasi Tugas Konversi
        const initUrl = "https://api.yt2mp3.gs/v1/init";
        const payload = {
            url: url,
            format: "mp3",
            quality: "320" // Kualitas tertinggi
        };

        const initResponse = await axios.post(initUrl, payload, { headers });
        const taskId = initResponse.data.taskId || initResponse.data.id;

        if (!taskId) {
            return res.status(500).json({
                status: false,
                creator: "Arulzxd",
                message: "Gagal menginisialisasi konversi dari server yt2mp3.gs"
            });
        }

        // Langkah B: Polling Status untuk Mengambil Link Download Akhir
        const statusUrl = "https://api.yt2mp3.gs/v1/status";
        let downloadUrl = null;
        let attempts = 0;
        const maxAttempts = 15; // Berhenti jika dalam 30 detik server tidak merespon

        while (attempts < maxAttempts) {
            const statusResponse = await axios.get(`${statusUrl}?id=${taskId}`, { headers });
            const statusData = statusResponse.data;
            const status = statusData.status;

            if (status === "completed" || statusData.downloadUrl || statusData.url) {
                downloadUrl = statusData.downloadUrl || statusData.url;
                break;
            } else if (status === "failed") {
                return res.status(500).json({
                    status: false,
                    creator: "Arulzxd",
                    message: "Proses konversi MP3 gagal di server pihak ketiga"
                });
            }

            await sleep(2000); // Tunggu 2 detik sebelum ngecek lagi
            attempts++;
        }

        if (!downloadUrl) {
            return res.status(408).json({
                status: false,
                creator: "Arulzxd",
                message: "Waktu permintaan habis (Timeout), server converter terlalu lama merespon"
            });
        }

        // 4. Kirim Output Hasil Gabungan yang Lengkap
        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: {
                title: videoMeta.title,
                duration: videoMeta.timestamp, // Contoh: "3:45"
                thumbnail: videoMeta.thumbnail,
                youtube_url: videoMeta.url,
                download_url: downloadUrl,
                info: {
                    author: videoMeta.author?.name || "Unknown",
                    views: videoMeta.views,
                    uploaded: videoMeta.ago
                }
            },
            metadata: {
                source: "yt2mp3.gs + yt-search",
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Terjadi kesalahan internal pada sistem scraper",
            error: err.message
        });
    }
});

module.exports = router;
