const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// ======================================================
// CORE SCRAPER FUNCTION (BMKG GEMPA DIRASAKAN)
// ======================================================
async function getGempaDirasakan() {
    try {
        const response = await axios.get('https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);

        // Langsung tembak baris pertama (tr) dari tbody tabel gempa dirasakan
        const targetRow = $('table.table-hover.table-striped tbody tr').first();
        
        if (!targetRow.length) {
            throw new Error('Gagal menemukan data tabel gempa di situs BMKG');
        }

        const td = targetRow.find('td');
        const kapan = $(td[1]).text().trim();
        const letak = $(td[2]).text().trim();
        const magnitudo = $(td[3]).text().trim();
        const kedalaman = $(td[4]).text().replace(/\t/g, '').replace(/I/g, '').trim();
        const wilayah = $(td[5]).text().replace(/\t/g, '').replace(/I/g, '').replace('-', '').replace(/\r/g, '').split('\n')[0].trim();
        
        const lintang = letak.split(' ')[0] || '';
        const bujur = letak.split(' ')[2] || '';
        
        // Ambil link gambar peta/map penunjuk lokasi gempa
        let mapImg = $('div.row > div > img').attr('src') || '';
        if (mapImg && !mapImg.startsWith('http')) {
            // Otomatis ubah URL relatif menjadi URL absolut BMKG agar gambar bisa dibuka
            mapImg = `https://www.bmkg.go.id/${mapImg.replace(/^\//, '')}`;
        }

        return {
            waktu: kapan,
            lintang,
            bujur,
            magnitudo,
            kedalaman,
            wilayah,
            map: mapImg
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
        const result = await getGempaDirasakan();

        return res.status(200).json({
            status: true,
            creator: 'Arulzxd',
            result,
            metadata: {
                source: 'BMKG Info Gempa',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Gagal mengambil data gempa dari BMKG',
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;