const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'Accept-Language': 'id-ID,id;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6'
};

async function getwebtoken() {
    const r = await axios.get('https://removal.ai/wp-admin/admin-ajax.php', {
        headers,
        params: {
            action: 'ajax_get_webtoken',
            security: '4acc8a2f93'
        }
    });
    return r.data.data.webtoken;
}

async function removebg(imgUrl) {
    // 1. Ambil WebToken
    const webToken = await getwebtoken();

    // 2. Download gambar dari URL ke Buffer
    const imageRes = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageRes.data, 'binary');

    // 3. Siapkan FormData
    const form = new FormData();
    form.append('image_file', buffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
    });

    // 4. Kirim ke API Removal.ai
    const r = await axios.post('https://api.removal.ai/3.0/remove', form, {
        headers: {
            ...headers,
            ...form.getHeaders(),
            'Web-Token': webToken
        },
    });

    return r.data;
}

// --- ENDPOINT ROUTE ---

router.get('/', async (req, res) => {
    try {
        const imgUrl = req.query.url?.trim();

        if (!imgUrl) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter ?url= wajib diisi!",
                example: "/api/removebg?url=https://example.com/foto.jpg"
            });
        }

        const result = await removebg(imgUrl);

        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: result
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Gagal memproses gambar, pastikan URL valid.",
            error: err.message
        });
    }
});

module.exports = router;