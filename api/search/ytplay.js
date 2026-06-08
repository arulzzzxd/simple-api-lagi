const express = require("express");
const axios = require("axios");
const yts = require("yt-search");
const { createDecipheriv } = require('crypto');

const router = express.Router();

// --- KUMPULAN UTILITY FUNCTIONS ---

function get_id(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|v\/|embed\/|user\/[^\/\n\s]+\/)?(?:watch\?v=|v%3D|embed%2F|video%2F)?|youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function format_duration(seconds) {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const decode = (enc) => {
    try {
        const secret_key = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
        const data = Buffer.from(enc, 'base64');
        const iv = data.slice(0, 16);
        const content = data.slice(16);
        const key = Buffer.from(secret_key, 'hex');

        const decipher = createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = Buffer.concat([decipher.update(content), decipher.final()]);

        return JSON.parse(decrypted.toString());
    } catch (error) {
        throw new Error(error.message);
    }
};

async function savetube(link, quality, value) {
    try {
        const cdn = (await axios.get("https://media.savetube.vip/api/random-cdn")).data.cdn;
        const infoget = (await axios.post('https://' + cdn + '/v2/info', {
            'url': link
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://save-tube.com/'
            }
        })).data;
        
        const info = decode(infoget.data);
        
        const response = (await axios.post('https://' + cdn + '/download', {
            'downloadType': value,
            'quality': `${quality}`,
            'key': info.key
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://save-tube.com/'
            }
        })).data;
        
        return {
            status: true,
            title: info.title || "YouTube Audio",
            url: response.data.downloadUrl,
            filename: `${info.title || "audio"} (${quality}kbps).mp3`,
            durationRaw: info.duration 
        };
    } catch (error) {
        console.error("Converting error:", error);
        return {
            status: false,
            message: "Converting error"
        };
    }
}

// --- ENDPOINT ROUTE ---

router.get("/", async (req, res) => {
    try {
        const query = req.query.query?.trim();

        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter ?query= wajib diisi",
                example: "/api/ytplay?query=denok la tasya"
            });
        }

        let id = get_id(query);
        let videoMeta = null;

        // 1. Cek Pencarian
        if (id) {
            try {
                videoMeta = await yts({ videoId: id });
            } catch (e) {
                console.error("Lookup ID error:", e.message);
            }
        } else {
            const searchData = await yts(query);
            if (searchData && searchData.videos && searchData.videos.length > 0) {
                videoMeta = searchData.videos[0];
                id = videoMeta.videoId;
            }
        }

        // Jika pencarian benar-benar zonk dan tidak ada ID yang bisa diproses
        if (!id) {
            return res.status(404).json({
                status: false,
                creator: "Arulzxd",
                message: "Video tidak ditemukan, silakan gunakan kata kunci lain!"
            });
        }

        const cleanUrl = "https://youtube.com/watch?v=" + id;

        // 2. Jalankan Engine Converter SaveTube
        const formatSaves = 128;
        const responseSaveTube = await savetube(cleanUrl, formatSaves, "audio");

        if (!responseSaveTube || !responseSaveTube.status || !responseSaveTube.url) {
            return res.status(500).json({
                status: false,
                creator: "Arulzxd",
                message: "Gagal memproses konversi audio dari server pihak ketiga (SaveTube Error)"
            });
        }

        // 3. Ambil Durasi Pas Sesuai Isi Link
        const durationResult = format_duration(responseSaveTube.durationRaw);

        // Proteksi Penamaan: Menggunakan data YouTube, jika null/blank pindah ke data SaveTube
        const finalTitle = videoMeta?.title || responseSaveTube.title || "YouTube Audio";
        const cleanTitle = finalTitle.replace(/[/\\?%*:|"<>]/g, '');

        // 4. Kembalikan Response Sukses dengan Proteksi Objek (?.)
        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: {
                title: finalTitle,
                duration: durationResult, 
                thumbnail: videoMeta?.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                youtube_url: cleanUrl,
                download_url: responseSaveTube.url,
                filename: `${cleanTitle} (128kbps).mp3`,
                quality: "128kbps",
                info: {
                    author: videoMeta?.author?.name || "Unknown Channel",
                    views: videoMeta?.views || 0,
                    uploaded: videoMeta?.ago || "Unknown Date",
                    seconds_total: responseSaveTube.durationRaw || 0
                }
            },
            metadata: {
                source: "savetube.vip + yt-search (play mode protected)",
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error("CRITICAL ERROR IN YTPLAY:", err);

        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Terjadi kesalahan fatal pada sistem internal server!",
            error: err.message
        });
    }
});

module.exports = router;