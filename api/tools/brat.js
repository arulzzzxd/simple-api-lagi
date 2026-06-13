

const express = require('express');
const router = express.Router();
// Gunakan @napi-rs/canvas agar tidak perlu kompilasi native
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

// ... (Kode CONFIG, getFinalFontSize, drawFrame, dan router Anda tetap sama)

const CONFIG = {
    bgColor: 'white',      
    textColor: 'black',    
    padding: 40,           
    startFontSize: 130,
    minFontSize: 10
};

function getFinalFontSize(text, width = 512, height = 512) {
    const maxTextWidth = width - (CONFIG.padding * 2);
    const maxTextHeight = height - (CONFIG.padding * 2);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    let fontSize = CONFIG.startFontSize;
    
    while (fontSize >= CONFIG.minFontSize) {
        ctx.font = `${fontSize}px "Aptos", "NotoColorEmoji", Arial`;
        const lineHeight = fontSize * 1.1; 
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
    
    let startY = CONFIG.padding;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], CONFIG.padding, startY + (i * lineHeight));
    }

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