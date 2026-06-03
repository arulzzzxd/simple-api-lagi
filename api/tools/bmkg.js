const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// ======================================================
// CORE GEMPA SCRAPER FUNCTION
// ======================================================
async function gempa() {
    try {
        const { data } = await axios.get('https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg');
        const $ = cheerio.load(data);
        
        const drasa = [];
        // Menggunakan .each() khas cheerio untuk looping data skala MMI yang dirasakan
        $('table > tbody > tr:nth-child(1) > td:nth-child(6) > span').each((index, rest) => {
            const dir = $(rest).text().replace(/\t/g, ' ').trim();
            if (dir) drasa.push(dir);
        });
        
        // Menggabungkan array teks dengan baris baru (\n) agar lebih rapi
        const rasa = drasa.join('\n');
        const imagemap = $('div.modal-body > div > div:nth-child(1) > img').attr('src') || '';

        // Menyusun properti format data asli sesuai struktur awal kamu
        const format = {
            imagemap: imagemap,
            magnitude: $('table > tbody > tr:nth-child(1) > td:nth-child(4)').text().trim(),
            kedalaman: $('table > tbody > tr:nth-child(1) > td:nth-child(5)').text().trim(),
            wilayah: $('table > tbody > tr:nth-child(1) > td:nth-child(6) > a').text().trim(),
            waktu: $('table > tbody > tr:nth-child(1) > td:nth-child(2)').text().trim(),
            lintang_bujur: $('table > tbody > tr:nth-child(1) > td:nth-child(3)').text().trim(),
            dirasakan: rasa
        };

        return {
            source: 'www.bmkg.go.id',
            data: format
        };
    } catch (error) {
        throw error;
    }
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================
router.get('/', async (req, res) => {
    try {
        const result = await gempa();

        return res.status(200).json({
            status: true,
            creator: 'Arulzxd',
            result: result.data,
            metadata: {
                source: result.source,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Gagal mengambil data gempa bumi terbaru dari BMKG',
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;