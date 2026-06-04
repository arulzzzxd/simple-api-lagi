const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');

/*
- HARGAI WOY JANGAN DIHAPUS!
- Skrep by *JH a.k.a DHIKA - FIONY BOT*
- Credits to all Fiony's Bot Admin. 
- Maaf kalo kurang maksimal atau berantakan
- Hasil gabut saja xixixi. 
*/

// ======================================================
// CORE SCRAPER FUNCTION (WAIFU2X IMAGE ENHANCER)
// ======================================================
async function JHWaifu2x(imageUrl) {
    const jantung = {
        referer: "https://waifu2x.pro/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    try {
        // 1. Download gambar asal dari URL input
        const { data: file } = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: { "user-agent": jantung["user-agent"] }
        });

        // 2. Buat payload form-data untuk dikirim ke API waifu2x
        const form = new FormData();
        [
            ["denoise", "3"],
            ["format", "PNG"],
            ["type", "PHOTO"],
            ["scale", "true"] // Mengaktifkan upscale (biasanya 2x)
        ].forEach(([k, v]) => form.append(k, v));

        form.append("file", file, {
            filename: "image.jpg",
            contentType: "image/jpeg"
        });

        // 3. Daftarkan antrean proses upscale ke server
        const { data: init } = await axios.post(
            "https://api.waifu2x.pro/api/v1/upscale",
            form,
            { headers: { ...jantung, ...form.getHeaders() } }
        );

        const hash = init.hash;
        if (!hash) throw new Error("Gagal mendapatkan hash antrean dari Waifu2x");

        // 4. Polling/Check status berkala sampai proses selesai (dibatasi maks 15x biar anti-stuck)
        let attempts = 0;
        while (attempts < 15) {
            await new Promise(r => setTimeout(r, 2000));
            const { data } = await axios.get(
                `https://api.waifu2x.pro/api/v1/check?hash=${hash}`,
                { headers: jantung }
            );
            if (data.isFinished) break;
            attempts++;
        }

        // 5. Unduh hasil akhir gambar berekstensi PNG yang sudah HD
        const { data: result } = await axios.get(
            `https://api.waifu2x.pro/api/v1/get?hash=${hash}&format=PNG`,
            {
                responseType: "arraybuffer",
                headers: jantung
            }
        );

        return Buffer.from(result);
    } catch (error) {
        throw error;
    }
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================
router.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'url' (link gambar) wajib diisi! Contoh: ?url=https://files.catbox.moe/xxxxxx.jpg"
        });
    }

    try {
        // Jalankan fungsi penjernih gambar
        const imageBuffer = await JHWaifu2x(url);

        // Set header agar browser membaca response langsung sebagai gambar fisik PNG
        res.set('Content-Type', 'image/png');
        return res.send(imageBuffer);

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Gagal menjernihkan/upscale gambar via Waifu2x',
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;