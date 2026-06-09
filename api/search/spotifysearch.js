const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Session Cache agar tidak boros request token
const session = {
    accessToken: null,
    expiresAt: 0
};

// --- FUNGSI MENGAMBIL ACCESS TOKEN ANONIM RESMI ---
async function getAnonymousToken() {
    // Jika token masih ada dan belum expired, gunakan yang di cache
    if (session.accessToken && Date.now() < session.expiresAt) {
        return session.accessToken;
    }

    try {
        // Ambil token langsung dari config web player
        const res = await fetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player", {
            headers: {
                "User-Agent": UA,
                "referer": "https://open.spotify.com/"
            }
        });
        
        const data = await res.json();
        
        if (!data.accessToken) throw new Error("Gagal mengenerate Access Token");

        session.accessToken = data.accessToken;
        // Set kadaluwarsa token (biasanya 1 jam dari Spotify, kita kurangi 5 menit aman)
        session.expiresAt = data.accessTokenExpirationTimestampMs - 300000; 
        
        return session.accessToken;
    } catch (err) {
        throw new Error("Otentikasi Token Spotify Gagal: " + err.message);
    }
}

// --- FUNGSI FORMAT MENIT ---
function fmtDuration(ms) {
    const total = Math.floor((ms || 0) / 1000);
    return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
}

// --- FUNGSI SEARCH UTAMA ---
async function spotifySearch(query, limit = 10) {
    try {
        const token = await getAnonymousToken();
        
        // Menggunakan Endpoint API Web resmi Spotify (Jauh lebih aman dari 404 dibanding GraphQL Pathfinder)
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`;
        
        const res = await fetch(searchUrl, {
            headers: {
                "User-Agent": UA,
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            // Jika token hangus ditengah jalan, reset cache dan coba sekali lagi
            session.accessToken = null;
            return spotifySearch(query, limit);
        }

        const data = await res.json();
        const items = data.tracks?.items || [];

        return items.map(track => {
            // Cari thumbnail resolusi tertinggi
            const images = track.album?.images || [];
            const thumb = images.length > 0 ? images[0].url : null;

            return {
                artist: track.artists.map(a => a.name).join(", "),
                title: track.name,
                duration: fmtDuration(track.duration_ms),
                thumb: thumb,
                url: `https://open.spotify.com/track/${track.id}`,
                urlpreview: track.preview_url || null // Preview audio MP3 jika tersedia resmi
            };
        });

    } catch (err) {
        console.error("Scraper Error: ", err);
        return [];
    }
}

// --- ENDPOINT ROUTE ---

router.get("/", async (req, res) => {
    try {
        const query = req.query.query?.trim();
        const limit = 10; // Dikunci otomatis ke 10 sesuai request

        if (!query) {
            return res.status(400).json({
                status: false,
                creator: "Arulzxd",
                message: "Parameter ?query= wajib diisi!",
                example: "/api/spotify?query=introvert lirik"
            });
        }

        const result = await spotifySearch(query, limit);

        if (!result || result.length === 0) {
            return res.status(404).json({
                status: false,
                creator: "Arulzxd",
                message: "Lagu tidak ditemukan atau pencarian sedang limit!"
            });
        }

        return res.status(200).json({
            status: true,
            creator: "Arulzxd",
            count: result.length,
            result: result
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Internal Server Error",
            error: err.message
        });
    }
});

module.exports = router;