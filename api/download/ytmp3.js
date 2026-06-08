const express = require('express');
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");

// ======================================================
// MODUL INTERNAL SAVETUBE (MP3 ONLY)
// ======================================================
const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    cdn: "/random-cdn",
    info: "/v2/info", 
    download: "/download"
  },
  headers: {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'referer': 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  },

  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g);
      return Buffer.from(matches.join(''), 'hex');
    },

    decrypt: async (enc) => {
      try {
        const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
        const data = Buffer.from(enc, 'base64');
        const iv = data.slice(0, 16);
        const content = data.slice(16);
        const key = savetube.crypto.hexToBuffer(secretKey);
        
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(content);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return JSON.parse(decrypted.toString());
      } catch (error) {
        throw new Error(`${error.message}`);
      }
    }
  },

  isUrl: str => { 
    try { 
      new URL(str); 
      return true; 
    } catch (_) { 
      return false; 
    } 
  },

  youtube: url => {
    if (!url) return null;
    const regexes = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let regex of regexes) {
      if (regex.test(url)) return url.match(regex)[1];
    }
    return null;
  },

  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      });
      return { status: true, data: response };
    } catch (error) {
      return { status: false, error: error.message };
    }
  },

  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, 'get');
    if (!response.status) return response;
    return { status: true, data: response.data.cdn };
  },

  downloadMP3: async (link) => {
    if (!link) throw new Error("Infokan linknya cik");
    if (!savetube.isUrl(link)) throw new Error("Itu bukan link youtube kocak");

    const id = savetube.youtube(link);
    if (!id) throw new Error("Yaelah link youtubenya ada yang salah cik");

    const cdnx = await savetube.getCDN();
    if (!cdnx.status) throw new Error("Gagal mengambil server CDN");
    const cdn = cdnx.data;

    const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
      url: `https://www.youtube.com/watch?v=${id}`
    });
    if (!result.status) throw new Error("Gagal mengambil informasi video dari Savetube");
    
    const decrypted = await savetube.crypto.decrypt(result.data.data);

    const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
      id: id,
      downloadType: 'audio',
      quality: '128',
      key: decrypted.key
    });

    if (!dl.status || !dl.data?.data?.downloadUrl) {
      throw new Error("Gagal mengenerate link download");
    }

    const formatDuration = (seconds) => {
      if (!seconds) return "-";
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      judul: decrypted.title || "-",
      durasi: formatDuration(decrypted.duration),
      download: {
        status: true,
        quality: "128kbps",
        url: dl.data.data.downloadUrl,
        filename: `${decrypted.title || 'audio'}.mp3`
      }
    };
  }
};

// ======================================================
// ENDPOINT ROUTER GET UTAMA
// ======================================================
router.get('/', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      status: false,
      error: "Missing 'url' parameter"
    });
  }

  try {
    const result = await savetube.downloadMP3(url);

    return res.status(200).json({
      status: true,
      creator: 'Arulzxd',
      result
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Terjadi kesalahan pada server internal."
    });
  }
});

module.exports = router;
