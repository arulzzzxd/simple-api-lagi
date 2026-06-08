const express = require("express");
const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");

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
                example: "/ytmp3?url=https://www.youtube.com/watch?v=J1TFFzbCIiM"
            });
        }

        // Validasi apakah format URL YouTube benar
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "URL YouTube tidak valid!"
            });
        }

        // 2. Ambil Metadata Video menggunakan yt-search (Cepat & Stabil)
        const search = await yts(url);
        const videoMeta = search.videos && search.videos.length > 0 ? search.videos[0] : null;

        if (!videoMeta) {
            return res.status(404).json({
                status: false,
                creator: "Arulzxd",
                message: "Informasi video tidak ditemukan."
            });
        }

        // 3. Ambil Direct Link Audio menggunakan ytdl-core
        // Mengambil info streaming langsung dari server Google/YouTube
        const info = await ytdl.getInfo(url);
        
        // Memilih format audio saja dengan kualitas tertinggi yang tersedia
        const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
        const topAudio = ytdl.chooseFormat(audioFormats, { quality: "highestaudio" });

        if (!topAudio || !topAudio.url) {
            return res.status(500).json({
                status: false,
                creator: "Arulzxd",
                message: "Gagal mengekstrak direct link audio dari YouTube."
            });
        }

        // 4. Kirim Output Struktur Data Sukses
        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: {
                title: videoMeta.title,
                duration: videoMeta.timestamp,
                thumbnail: videoMeta.thumbnail,
                youtube_url: videoMeta.url,
                download_url: topAudio.url, // Ini adalah direct link audio berkecepatan tinggi
                info: {
                    author: videoMeta.author?.name || "Unknown",
                    views: videoMeta.views,
                    uploaded: videoMeta.ago,
                    mimeType: topAudio.mimeType,
                    bitrate: topAudio.audioBitrate ? `${topAudio.audioBitrate}kbps` : "Unknown"
                }
            },
            metadata: {
                source: "@distube/ytdl-core + yt-search",
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Terjadi kesalahan internal pada sistem serverless",
            error: err.message
        });
    }
});

module.exports = router;
