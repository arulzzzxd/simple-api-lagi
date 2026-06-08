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

// Fungsi konversi detik langsung dari API SaveTube ke format "Menit:Detik"
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

// Modifikasi fungsi savetube agar ikut mengembalikan info metadata asli dari link
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
            url: response.data.downloadUrl,
            filename: `${info.title} (${quality}kbps).mp3`,
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
        const url = req.query.url?.trim();

        if (!url) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter ?url= wajib diisi",
                example: "/api/download/ytmp3?url=https://www.youtube.com/watch?v=J1TFFzbCIiM"
            });
        }

        const id = get_id(url);
        if (!id) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter link tidak valid!"
            });
        }

        const cleanUrl = "https://youtube.com/watch?v=" + id;

        // 1. Jalankan Engine Converter SaveTube berdasarkan link murni
        const formatSaves = 128;
        const responseSaveTube = await savetube(cleanUrl, formatSaves, "audio");

        if (!responseSaveTube.status || !responseSaveTube.url) {
            return res.status(500).json({
                status: false,
                creator: "Arulzxd",
                message: "Gagal memproses konversi audio dari server pihak ketiga"
            });
        }

        // 2. Ambil Durasi Pas Sesuai Isi Link
        const durationResult = format_duration(responseSaveTube.durationRaw);

        // 3. PERBAIKAN UTAMA: Mencari metadata spesifik berdasarkan objek videoId (Bukan teks string URL)
        let videoMeta = {};
        try {
            videoMeta = await yts({ videoId: id });
        } catch (e) {
            console.error("yt-search videoId error:", e.message);
        }

        // 4. Kembalikan Response Sukses (Data dijamin sinkron)
        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: {
                title: videoMeta.title || responseSaveTube.filename.replace(" (128kbps).mp3", ""),
                duration: durationResult, 
                thumbnail: videoMeta.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                youtube_url: cleanUrl,
                download_url: responseSaveTube.url,
                filename: responseSaveTube.filename,
                quality: "128kbps",
                info: {
                    author: videoMeta.author?.name || "Unknown",
                    views: videoMeta.views || 0,
                    uploaded: videoMeta.ago || "Unknown",
                    seconds_total: responseSaveTube.durationRaw || 0
                }
            },
            metadata: {
                source: "savetube.vip + yt-search (fixed id)",
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Terjadi kesalahan pada sistem internal!",
            error: err.message
        });
    }
});

module.exports = router;