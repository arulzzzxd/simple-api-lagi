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

        // 1. Jika inputnya adalah Link/URL, langsung lookup ID-nya
        if (id) {
            try {
                videoMeta = await yts({ videoId: id });
            } catch (e) {
                console.error("Lookup ID error:", e.message);
            }
        } else {
            // Jika input berupa kata kunci teks biasa, lakukan pencarian search
            const searchData = await yts(query);
            if (searchData.videos && searchData.videos.length > 0) {
                videoMeta = searchData.videos[0];
                id = videoMeta.videoId;
            }
        }

        // Validasi jika video benar-benar tidak ditemukan
        if (!id || !videoMeta) {
            return res.status(404).json({
                status: false,
                creator: "Arulzxd",
                message: "Video tidak ditemukan, coba kata kunci lain!"
            });
        }

        const cleanUrl = "https://youtube.com/watch?v=" + id;

        // 2. Jalankan Engine Converter SaveTube berdasarkan video yang didapat
        const formatSaves = 128;
        const responseSaveTube = await savetube(cleanUrl, formatSaves, "audio");

        if (!responseSaveTube.status || !responseSaveTube.url) {
            return res.status(500).json({
                status: false,
                creator: "Arulzxd",
                message: "Gagal memproses konversi audio dari server pihak ketiga"
            });
        }

        // 3. Ambil Durasi Murni Sesuai Isi Link
        const durationResult = format_duration(responseSaveTube.durationRaw);

        // Bersihkan karakter ilegal dari judul asli untuk penulisan filename yang rapi
        const cleanTitle = videoMeta.title.replace(/[/\\?%*:|"<>]/g, '');

        // 4. Kembalikan Response Sukses Fitur Play
        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: {
                title: videoMeta.title,
                duration: durationResult, 
                thumbnail: videoMeta.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                youtube_url: cleanUrl,
                download_url: responseSaveTube.url, // Link murni asli bawaan CDN
                filename: `${cleanTitle} (128kbps).mp3`, // Nama file rapi menyesuaikan judul asli
                quality: "128kbps",
                info: {
                    author: videoMeta.author?.name || "Unknown",
                    views: videoMeta.views || 0,
                    uploaded: videoMeta.ago || "Unknown",
                    seconds_total: responseSaveTube.durationRaw || 0
                }
            },
            metadata: {
                source: "savetube.vip + yt-search (play mode)",
                timestamp: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Terjadi kesalahan pada sistem internal ytplay!",
            error: err.message
        });
    }
});

module.exports = router;