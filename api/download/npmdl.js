const express = require('express');
const router = express.Router();
const axios = require('axios');

// ======================================================
// HELPER: AMBIL STATISTIK DOWNLOAD DARI NPMJS
// ======================================================
async function getNpmDownloads(packageName) {
    try {
        // 1. Ambil data download untuk rentang waktu populer (hari ini, minggu ini, bulan ini, & total tahun ini)
        const endpoints = {
            day: `https://api.npmjs.org/downloads/point/last-day/${packageName}`,
            week: `https://api.npmjs.org/downloads/point/last-week/${packageName}`,
            month: `https://api.npmjs.org/downloads/point/last-month/${packageName}`,
            year: `https://api.npmjs.org/downloads/point/last-year/${packageName}`
        };

        // Menjalankan request secara paralel agar lebih cepat
        const [dayRes, weekRes, monthRes, yearRes] = await Promise.all([
            axios.get(endpoints.day).catch(() => ({ data: { downloads: 0 } })),
            axios.get(endpoints.week).catch(() => ({ data: { downloads: 0 } })),
            axios.get(endpoints.month).catch(() => ({ data: { downloads: 0 } })),
            axios.get(endpoints.year).catch(() => ({ data: { downloads: 0 } }))
        ]);

        // 2. Ambil metadata tambahan (seperti versi terakhir, deskripsi, dll) dari registry resmi
        let metadata = { description: "-", version: "-", author: "-" };
        try {
            const { data: regData } = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
            metadata.description = regData.description || "-";
            metadata.version = regData.version || "-";
            metadata.author = regData.author?.name || "-";
        } catch (e) {
            // Abaikan jika package tidak memiliki metadata lengkap
        }

        return {
            package: packageName,
            deskripsi: metadata.description,
            versi_terbaru: metadata.version,
            author: metadata.author,
            downloads: {
                terakhir_24jam: dayRes.data.downloads,
                terakhir_minggu: weekRes.data.downloads,
                terakhir_bulan: monthRes.data.downloads,
                terakhir_tahun: yearRes.data.downloads
            },
            url_npm: `https://www.npmjs.com/package/${packageName}`
        };

    } catch (error) {
        throw new Error("Package tidak ditemukan atau nama package salah.");
    }
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================
router.get('/', async (req, res) => {
    // Menggunakan query parameter 'package' (Contoh: ?package=axios)
    const packageName = req.query.package;

    if (!packageName) {
        return res.status(400).json({
            status: false,
            error: "Missing 'package' parameter. Contoh: ?package=express"
        });
    }

    try {
        const result = await getNpmDownloads(packageName);

        return res.status(200).json({
            status: true,
            creator: 'Arulzxd',
            result
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message || "Terjadi kesalahan pada server."
        });
    }
});

module.exports = router;
