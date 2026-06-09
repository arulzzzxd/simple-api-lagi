const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();
const scale = ['2', '4', '8', '16'];

// --- SCRAPER FUNCTIONS ---

async function upimg(imgUrl) {
    // 1. Download gambar dari URL yang diberikan menjadi Buffer
    const imageRes = await axios.get(imgUrl, { responseType: 'arraybuffer' }).catch(() => {
        throw new Error("Gagal mengunduh gambar dari URL yang diberikan. Pastikan URL valid!");
    });
    
    const buffer = Buffer.from(imageRes.data, 'binary');
    
    // Ambil nama file dari URL atau buat nama acak jika tidak ada
    const filename = imgUrl.split('/').pop().split('?')[0] || `${crypto.randomBytes(6).toString('hex')}.jpg`;

    // 2. Request URL Upload ke API UnblurImage
    const upload = await axios.post('https://api.unblurimage.ai/api/common/upload/upload-image',
        new URLSearchParams({ file_name: filename }).toString(),
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
                origin: 'https://unblurimage.ai',
                referer: 'https://unblurimage.ai/',
                'Product-Serial': crypto.randomUUID()
            }
        }
    );
  
    const { url, object_name } = upload.data.result;

    // 3. Upload Buffer gambar ke Storage menggunakan PUT
    await axios.put(url, buffer, {
        headers: {
            'content-type': 'image/jpeg',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
        }
    });

    return object_name;
}

async function createjob(objectName, upscale) {
    const r = await axios.post('https://api.unblurimage.ai/api/imgupscaler/v1/ai-image-upscaler-v2/create-job',
        new URLSearchParams({
            original_image_url: `https://cdn.unblurimage.ai/${objectName}`,
            upscale_type: upscale
        }).toString(),
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
                origin: 'https://unblurimage.ai',
                referer: 'https://unblurimage.ai/',
                authorization: '',
                'Product-Serial': crypto.randomUUID()
            }
        }
    );

    return r.data.result;
}

// --- ENDPOINT ROUTE ---

router.get('/', async (req, res) => {
    try {
        const imgUrl = req.query.url?.trim();
        // Otomatis set scale ke '16' jika parameter &scale tidak diisi
        const upscale = req.query.scale?.trim() || '2';

        // Validasi input URL
        if (!imgUrl) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter ?url= wajib diisi!",
                example: "/api/upscale?url=https://example.com/foto.jpg&scale=16"
            });
        }

        // Validasi tingkatan Scale
        if (!scale.includes(String(upscale))) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: `Scale tidak valid! Gunakan salah satu dari: ${scale.join(', ')}`
            });
        }

        // Eksekusi proses upscaler
        const objectName = await upimg(imgUrl);
        const job = await createjob(objectName, String(upscale));

        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            result: {
                job_id: job.job_id,
                input: job.input_url,
                output: job.output_url
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Internal Server Error saat memproses HD foto",
            error: err.message
        });
    }
});

module.exports = router;