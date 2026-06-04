const express = require('express');
const router = express.Router();
const axios = require('axios');

// Fungsi scraper emojimix yang mengembalikan data berupa arraybuffer (gambar mentah)
const emojimixBuffer = async (emoji1, emoji2) => {
    const urlTenor = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
    
    // 1. Ambil metadata dari Tenor API menggunakan Axios
    const response = await axios.get(urlTenor);
    
    // 2. Periksa apakah kombinasi emoji ditemukan
    if (response.data.results && response.data.results.length > 0) {
        const imgUrl = response.data.results[0].url;
        
        // 3. Mengambil gambar dalam bentuk arraybuffer
        const imageResponse = await axios.get(imgUrl, {
            responseType: 'arraybuffer'
        });
        
        return imageResponse.data;
    } else {
        throw new Error("Kombinasi emojimix tidak ditemukan atau tidak didukung oleh Google.");
    }
};

// Endpoint API GET
router.get('/', async (req, res) => {
    const { emoji1, emoji2 } = req.query;

    // Validasi parameter query
    if (!emoji1 || !emoji2) {
        return res.status(400).json({
            status: 400,
            creator: "Arulz-XD",
            message: "Parameter 'emoji1' dan 'emoji2' salah atau tidak diisi. Contoh: ?emoji1=😎&emoji2=🔥"
        });
    }

    try {
        // Memanggil fungsi scraper emojimix
        const emojimixData = await emojimixBuffer(emoji1, emoji2);
        
        // Mengubah hasil scraper menjadi Buffer Node.js
        const buffernya = Buffer.from(emojimixData);
        
        // Memasang header image/png murni
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buffernya.length
        });
        
        // Kirimkan buffernya sebagai response utama
        res.end(buffernya);
        
    } catch (error) {
        // Jika gagal, tetap keluarkan response JSON berupa error info
        res.status(500).json({
            status: 500,
            creator: "Arulz-XD",
            message: "Gagal mengambil gambar emojimix.",
            error: error.message || String(error)
        });
    }
});

module.exports = router;