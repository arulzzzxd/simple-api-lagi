const express = require('express');
const router = express.Router();
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CONFIG = {
    bgColor: 'white',      
    textColor: 'black',    
    padding: 40,           
    startFontSize: 130,
    minFontSize: 10,       
    quality: 50,
    vidFps: '5/3'
};

// ======================================================
// HELPER: DOWNLOAD & DAFTARKAN FONT DARI RAW GITHUB
// ======================================================
let fontsLoaded = false;

async function muatFontDariGithub() {
    if (fontsLoaded) return;

    // Menggunakan URL database repo GitHub milikmu
    const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/arulzzzxd/database/heads/main/font';

    const listFont = [
        { namaFile: 'Aptos.ttf', family: 'Aptos' },
        { namaFile: 'SFUIDisplay-Semibold.otf', family: 'SFUI' },
        { namaFile: 'NotoColorEmoji.ttf', family: 'NotoColorEmoji' }
    ];

    for (const font of listFont) {
        try {
            const tmpFontPath = path.join('/tmp', font.namaFile);

            if (!fs.existsSync(tmpFontPath)) {
                const urlTarget = `${GITHUB_BASE_URL}/${font.namaFile}`;
                const response = await axios.get(urlTarget, { responseType: 'arraybuffer' });
                fs.writeFileSync(tmpFontPath, Buffer.from(response.data));
            }

            registerFont(tmpFontPath, { family: font.family });
            
        } catch (error) {
            console.error(`[Font Error] Gagal mengunduh/mendaftar font ${font.family}:`, error.message);
        }
    }
    
    fontsLoaded = true;
}

function getFinalFontSize(text, width = 512, height = 512) {
    const maxTextWidth = width - (CONFIG.padding * 2);
    const maxTextHeight = height - (CONFIG.padding * 2);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    let fontSize = CONFIG.startFontSize;
    let lineHeight = 0;

    while (fontSize >= CONFIG.minFontSize) {
        ctx.font = `${fontSize}px "Aptos", "NotoColorEmoji", Arial`;
        lineHeight = fontSize * 1.1; 

        const words = text.replace(/\n/g, ' \n ').split(' ');
        let lines = [];
        let currentLine = words[0];
        let wordTooLong = false;

        for (let word of words) {
            if (word !== '\n' && ctx.measureText(word).width > maxTextWidth) {
                wordTooLong = true; break;
            }
        }

        if (wordTooLong) { fontSize -= 1; continue; }

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            if (word === '\n') {
                lines.push(currentLine); currentLine = ''; continue;
            }
            const testLine = currentLine === '' ? word : currentLine + " " + word;
            if (ctx.measureText(testLine).width <= maxTextWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine); currentLine = word;
            }
        }
        if (currentLine !== '') lines.push(currentLine);

        if (lines.length * lineHeight <= maxTextHeight) break; 
        fontSize -= 1; 
    }
    return fontSize;
}

// ======================================================
// HELPER: MENGGAMBAR FRAME CANVAS (PELENGKAP)
// ======================================================
function drawFrame(text, fontSize, width = 512, height = 512) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Warnai Background
    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, width, height);

    // Set Gaya Teks
    ctx.font = `${fontSize}px "Aptos", "NotoColorEmoji", Arial`;
    ctx.fillStyle = CONFIG.textColor;
    ctx.textBaseline = 'top';

    const maxTextWidth = width - (CONFIG.padding * 2);
    const lineHeight = fontSize * 1.1;

    // Pecah baris kembali sesuai logika getFinalFontSize
    const words = text.replace(/\n/g, ' \n ').split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        if (word === '\n') {
            lines.push(currentLine); currentLine = ''; continue;
        }
        const testLine = currentLine === '' ? word : currentLine + " " + word;
        if (ctx.measureText(testLine).width <= maxTextWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine); currentLine = word;
        }
    }
    if (currentLine !== '') lines.push(currentLine);

    // Kalkulasi posisi Y agar teks berada di tengah vertical (Center-aligned)
    const totalHeight = lines.length * lineHeight;
    let startY = (height - totalHeight) / 2;

    // Gambar teks baris demi baris (rata kiri sesuai style Brat, namun berjarak padding)
    for (let line of lines) {
        ctx.fillText(line, CONFIG.padding, startY);
        startY += lineHeight;
    }

    return canvas.toBuffer('image/png');
}

async function makeBrat(text) {
    await muatFontDariGithub();
    let finalFontSize = getFinalFontSize(text, 512, 512);
    return drawFrame(text, finalFontSize, 512, 512);
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================
router.get('/', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: "Arulzxd",
            message: "Parameter 'text' wajib diisi! Contoh: ?text=Brat style"
        });
    }

    try {
        const imageBuffer = await makeBrat(text);

        // Pasang header output gambar png langsung ke browser
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imageBuffer.length
        });
        
        res.end(imageBuffer);

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: "Arulzxd",
            message: "Gagal memproses gambar Brat canvas.",
            error: error.message || error
        });
    }
});

module.exports = router;