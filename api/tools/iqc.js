const express = require("express");
const { createCanvas, GlobalFonts, loadImage } = require("@napi-rs/canvas");
const EmojiDbLib = require("emoji-db");
const fetch = require("node-fetch");
const moment = require("moment-timezone");

const router = express.Router();
const emojiDb = new EmojiDbLib({ useDefaultDb: true });

const EMOJI_URLS = {
    apple:     'https://raw.githubusercontent.com/SaurusAraAra/mentahan/refs/heads/main/lainnya/emoji-apple-image.json',
    blob:      'https://raw.githubusercontent.com/SaurusAraAra/mentahan/refs/heads/main/lainnya/emoji-blob-image.json',
    google:    'https://raw.githubusercontent.com/SaurusAraAra/mentahan/refs/heads/main/lainnya/emoji-google-image.json',
    joypixels: 'https://raw.githubusercontent.com/SaurusAraAra/mentahan/refs/heads/main/lainnya/emoji-joypixels-image.json',
    twitter:   'https://raw.githubusercontent.com/SaurusAraAra/mentahan/refs/heads/main/lainnya/emoji-twitter-image.json',
};
const BG_URL   = 'https://raw.githubusercontent.com/SaurusAraAra/mentahan/main/images/background-iqc.png';
const FONT_URL = 'https://raw.githubusercontent.com/SaurusAraAra/mentahan/main/font/SFPRODISPLAYREGULAR.otf';

let fontRegistered = false;

// --- UTILITY FUNCTIONS ---
function getSegments(txt, ems) {
    const segs = [], sorted = [...ems].sort((a,b) => a.offset - b.offset);
    let cur = 0;
    for (const e of sorted) {
        if (cur < e.offset) for (const ch of txt.substring(cur, e.offset)) segs.push({ type:'text', value:ch });
        segs.push({ type:'emoji', value:e.found, code:e.found });
        cur = e.offset + e.length;
    }
    if (cur < txt.length) for (const ch of txt.substring(cur)) segs.push({ type:'text', value:ch });
    return segs;
}

// --- ICON DRAWING FUNCTIONS ---
const drawIcon = {
    star: (ctx, x, y) => {
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.5; ctx.lineJoin='miter';
        ctx.beginPath();
        for (let i=0;i<5;i++) {
            const o=(i*2*Math.PI)/5-Math.PI/2, inn=((i*2+1)*Math.PI)/5-Math.PI/2;
            const ox=x+Math.cos(o)*16, oy=y+Math.sin(o)*16, ix=x+Math.cos(inn)*7, iy=y+Math.sin(inn)*7;
            i===0?ctx.moveTo(ox,oy):ctx.lineTo(ox,oy); ctx.lineTo(ix,iy);
        }
        ctx.closePath(); ctx.stroke();
    },
    reply: (ctx, x, y) => {
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.8; ctx.lineCap='round'; ctx.lineJoin='round';
        const ox=x-3;
        ctx.beginPath();
        ctx.moveTo(ox,y-6); ctx.lineTo(ox,y-13); ctx.lineTo(ox-13,y); ctx.lineTo(ox,y+13); ctx.lineTo(ox,y+6);
        ctx.bezierCurveTo(ox+9,y+6,ox+16,y+9,ox+20,y+16);
        ctx.bezierCurveTo(ox+18,y+7,ox+14,y-2,ox,y-6);
        ctx.stroke();
    },
    forward: (ctx, x, y) => {
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.8; ctx.lineCap='round'; ctx.lineJoin='round';
        const ox=x+3;
        ctx.beginPath();
        ctx.moveTo(ox,y-6); ctx.lineTo(ox,y-13); ctx.lineTo(ox+13,y); ctx.lineTo(ox,y+13); ctx.lineTo(ox,y+6);
        ctx.bezierCurveTo(ox-9,y+6,ox-16,y+9,ox-20,y+16);
        ctx.bezierCurveTo(ox-18,y+7,ox-14,y-2,ox,y-6);
        ctx.stroke();
    },
    copy: (ctx, x, y) => {
        ctx.save(); ctx.strokeStyle='#ffffff'; ctx.lineWidth=10; ctx.lineCap='round'; ctx.lineJoin='round';
        const sc=0.23, cx2=-127, cy2=-105;
        ctx.translate(x,y); ctx.scale(sc,sc);
        ctx.beginPath();
        ctx.moveTo(cx2+164,cy2+156); ctx.bezierCurveTo(cx2+164,cy2+164,cx2+158,cy2+170,cx2+150,cy2+170);
        ctx.lineTo(cx2+74,cy2+170); ctx.bezierCurveTo(cx2+66,cy2+170,cx2+60,cy2+164,cx2+60,cy2+156);
        ctx.lineTo(cx2+60,cy2+80); ctx.bezierCurveTo(cx2+60,cy2+72,cx2+66,cy2+66,cx2+74,cy2+66);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx2+90,cy2+54); ctx.bezierCurveTo(cx2+90,cy2+46,cx2+96,cy2+40,cx2+104,cy2+40);
        ctx.lineTo(cx2+180,cy2+40); ctx.bezierCurveTo(cx2+188,cy2+40,cx2+194,cy2+46,cx2+194,cy2+54);
        ctx.lineTo(cx2+194,cy2+130); ctx.bezierCurveTo(cx2+194,cy2+138,cx2+188,cy2+144,cx2+180,cy2+144);
        ctx.lineTo(cx2+104,cy2+144); ctx.bezierCurveTo(cx2+96,cy2+144,cx2+90,cy2+138,cx2+90,cy2+130);
        ctx.closePath(); ctx.stroke();
        ctx.restore();
    },
    comment: (ctx, x, y) => {
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.lineJoin='round';
        const w=30,h=22,r=4;
        ctx.beginPath();
        ctx.moveTo(x-w/2+r,y-h/2); ctx.lineTo(x+w/2-r,y-h/2);
        ctx.quadraticCurveTo(x+w/2,y-h/2,x+w/2,y-h/2+r); ctx.lineTo(x+w/2,y+h/2-r);
        ctx.quadraticCurveTo(x+w/2,y+h/2,x+w/2-r,y+h/2); ctx.lineTo(x-w/2+8,y+h/2);
        ctx.lineTo(x-w/2+3,y+h/2+6); ctx.lineTo(x-w/2+4,y+h/2); ctx.lineTo(x-w/2+r,y+h/2);
        ctx.quadraticCurveTo(x-w/2,y+h/2,x-w/2,y+h/2-r); ctx.lineTo(x-w/2,y-h/2+r);
        ctx.quadraticCurveTo(x-w/2,y-h/2,x-w/2+r,y-h/2);
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle='#ffffff';
        [-6,0,6].forEach(d => { ctx.beginPath(); ctx.arc(x+d,y,2,0,Math.PI*2); ctx.fill(); });
    },
    report: (ctx, x, y) => {
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=3.5; ctx.lineCap='round'; ctx.lineJoin='round';
        ctx.beginPath(); ctx.moveTo(x,y-15); ctx.lineTo(x-15,y+12); ctx.lineTo(x+15,y+12);
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle='#ffffff'; ctx.fillRect(x-1,y-5,2,11);
        ctx.beginPath(); ctx.arc(x,y+8,1.5,0,Math.PI*2); ctx.fill();
    },
    trash: (ctx, x, y) => {
        ctx.strokeStyle='#ff3b30'; ctx.lineWidth=3.5; ctx.lineCap='round'; ctx.lineJoin='round';
        ctx.beginPath(); ctx.moveTo(x-15,y-13); ctx.lineTo(x+15,y-13); ctx.stroke();
        ctx.strokeRect(x-8,y-18,16,5);
        ctx.beginPath(); ctx.moveTo(x-12,y-11); ctx.lineTo(x-9,y+13); ctx.lineTo(x+9,y+13); ctx.lineTo(x+12,y-11);
        ctx.closePath(); ctx.stroke();
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(x,y-7); ctx.lineTo(x,y+11);
        ctx.moveTo(x-7,y-5); ctx.lineTo(x-5,y+11);
        ctx.moveTo(x+7,y-5); ctx.lineTo(x+5,y+11);
        ctx.stroke();
    }
};

// --- ROUTE ---
router.get('/', async (req, res) => {
    try {
        const text = req.query.text?.trim();
        if (!text) return res.status(400).json({ status: false, message: "Parameter ?text= wajib diisi" });

        const time = moment().tz("Asia/Jakarta").format("HH:mm");
        const [emojiRes, bgRes, fontRes] = await Promise.all([
            fetch(EMOJI_URLS.apple),
            fetch(BG_URL),
            fetch(FONT_URL)
        ]);

        const emojiMap = await emojiRes.json();
        const bgBuf = Buffer.from(await bgRes.arrayBuffer());
        const fontBuf = Buffer.from(await fontRes.arrayBuffer());

        if (!fontRegistered) {
            GlobalFonts.register(fontBuf, 'SFPRODISPLAYREGULAR');
            fontRegistered = true;
        }

        const emojis = emojiDb.searchFromText({ input: text, fixCodePoints: true });
        const emojiCache = new Map();

        await Promise.all(emojis.map(async (e) => {
            const b64 = emojiMap[e.found];
            if (b64) emojiCache.set(e.found, await loadImage(Buffer.from(b64, 'base64')));
        }));

        const canvas = createCanvas(680, 1100);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(await loadImage(bgBuf), 0, 0, 680, 1100);
        ctx.fillStyle = 'rgba(13,13,13,0.7)';
        ctx.fillRect(0, 0, 680, 1100);

        // ... (sisanya sama dengan logika canvas di atas)
        
        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer('image/png'));

    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
});

module.exports = router;