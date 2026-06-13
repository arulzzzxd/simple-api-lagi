const express = require('express');
const router = express.Router();
const { createCanvas, registerFont } = require('@napi-rs/canvas');
const fs = require('fs-extra');
const path = require('path');

// Fungsi untuk memuat font
const loadFonts = () => {
    const fonts = [
        { name: 'Aptos', file: 'Aptos.ttf' },
        { name: 'SFUI', file: 'SFUIDisplay-Semibold.otf' },
        { name: 'NotoColorEmoji', file: 'NotoColorEmoji.ttf' }
    ];

    fonts.forEach(font => {
        const fontPath = path.resolve(__dirname, '../font', font.file);
        if (fs.existsSync(fontPath)) {
            registerFont(fontPath, { family: font.name });
        }
    });
};

loadFonts();

const CONFIG = {
    bgColor: 'white',      
    textColor: 'black',    
    padding: 40,           
    startFontSize: 130,
    minFontSize: 10
};

// Fungsi pembantu untuk memecah teks ke dalam baris
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function getFinalFontSize(text, width = 512, height = 512) {
    const maxTextWidth = width - (CONFIG.padding * 2);
    const maxTextHeight = height - (CONFIG.padding * 2);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    let fontSize = CONFIG.startFontSize;

    while (fontSize >= CONFIG.minFontSize) {
        ctx.font = `${fontSize}px "Aptos", "NotoColorEmoji", Arial`;
        const lines = wrapText(ctx, text, maxTextWidth);
        const lineHeight = fontSize * 1.2;

        if (lines.length * lineHeight <= maxTextHeight) break;
        fontSize -= 5;
    }
    return fontSize;
}

function drawFrame(text, fontSize, width = 512, height = 512) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const maxTextWidth = width - (CONFIG.padding * 2);

    // Background
    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, width, height);

    // Konfigurasi Teks
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = `${fontSize}px "Aptos", "NotoColorEmoji", Arial`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    const lineHeight = fontSize * 1.2;
    const lines = wrapText(ctx, text, maxTextWidth);

    // Render Teks
    let startY = CONFIG.padding;
    lines.forEach((line) => {
        ctx.fillText(line, CONFIG.padding, startY);
        startY += lineHeight;
    });

    return canvas.toBuffer('image/png');
}

async function makeBrat(text) {
    let finalFontSize = getFinalFontSize(text, 512, 512);
    return drawFrame(text, finalFontSize, 512, 512);
}

router.get('/', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' wajib diisi. Contoh: ?text=Halo Dunia"
        });
    }

    try {
        const buffer = await makeBrat(text);
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    } catch (error) {
        console.error("Error generating brat:", error);
        res.status(500).json({
            status: false,
            message: "Gagal membuat gambar Brat.",
            error: error.message
        });
    }
});

module.exports = router;