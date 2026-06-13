const { createCanvas, registerFont, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();


try {
    const fontPath = path.join(__dirname, './font/Aptos.ttf');
    if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: 'Aptos' });
    }

    const sfPath = path.join(__dirname, './font/SFUIDisplay-Semibold.otf');
    if (fs.existsSync(sfPath)) {
        registerFont(sfPath, { family: 'SFUI' });
    }

    const emojiPath = path.join(__dirname, './font/NotoColorEmoji.ttf');
    if (fs.existsSync(emojiPath)) {
        registerFont(emojiPath, { family: 'NotoColorEmoji' });
    }
} catch (e) {}

const CONFIG = {
    bgColor: 'white',      
    textColor: 'black',    
    padding: 40,           
    startFontSize: 130,
    minFontSize: 10,       
    quality: 50,
    vidFps: '5/3'
};

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

function drawFrame(text, fontSize, width = 512, height = 512) {
    const maxTextWidth = width - (CONFIG.padding * 2);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "Aptos", "NotoColorEmoji", Arial`;
    const lineHeight = fontSize * 1.1;

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

    ctx.fillStyle = CONFIG.textColor;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    let startY = CONFIG.padding;

    for (let i = 0; i < lines.length; i++) {
        let textY = startY + (i * lineHeight);
        ctx.fillText(lines[i], CONFIG.padding, textY);
    }

    return canvas.toBuffer('image/png');
}

async function makeBrat(text) {
    let finalFontSize = getFinalFontSize(text, 512, 512);
    return drawFrame(text, finalFontSize, 512, 512);
}

router.get('/', async (req, res) => {
    const text = req.query.text;

    // 1. Validasi input
    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' wajib diisi. Contoh: ?text=Halo Dunia"
        });
    }

    try {
        // 2. Proses pembuatan gambar
        // Fungsi makeBrat mengembalikan Buffer
        const buffer = await makeBrat(text);

        // 3. Kirim hasil sebagai gambar PNG
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

module.exports = router;;