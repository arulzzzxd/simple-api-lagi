const axios = require("axios");
const express = require("express");

const router = express.Router();

const BASE = "https://app.ytdown.to";
const API = `${BASE}/proxy.php`;
const PAGE = `${BASE}/en27/`;

const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

const MAX_POLL = 120;
const POLL_DELAY = 2500;

let cookieJar = "";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseSetCookie(setCookie = []) {
  if (!Array.isArray(setCookie)) return "";
  return setCookie
    .map(v => v.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

function randomGa() {
  const a = Math.floor(Math.random() * 1e10);
  const b = Math.floor(Date.now() / 1000);
  return `GA1.1.${a}.${b}`;
}

function buildCookie(extra = "") {
  const now = Math.floor(Date.now() / 1000);
  const ga = `_ga=${randomGa()}`;
  const ga2 = `_ga_2K69M9RN1B=GS2.1.s${now}$o1$g1$t${now}$j49$l0$h0`;
  return [cookieJar, ga, ga2, extra].filter(Boolean).join("; ");
}

// Validasi & ambil ID YouTube
function isUrl(str) {
  try { new URL(str); return true; } catch (_) { return false; }
}

function getVideoId(url) {
  if (!url) return null;
  const patterns = [
    new RegExp("youtube\\.com/watch\\?v=([a-zA-Z0-9_-]{11})"),
    new RegExp("youtube\\.com/embed/([a-zA-Z0-9_-]{11})"),
    new RegExp("youtube\\.com/v/([a-zA-Z0-9_-]{11})"),
    new RegExp("youtube\\.com/shorts/([a-zA-Z0-9_-]{11})"),
    new RegExp("youtu\\.be/([a-zA-Z0-9_-]{11})")
  ];
  for (const regex of patterns) {
    const m = url.match(regex);
    if (m && m[1]) return m[1];
  }
  return null;
}

// ======================================================
// CORE YTMP3 FUNCTION (TANPA SEARCH)
// ======================================================

async function warmup() {
  const res = await axios.get(PAGE, {
    headers: {
      "user-agent": UA,
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });
  const cookie = parseSetCookie(res.headers["set-cookie"]);
  if (cookie) cookieJar = cookie;
}

async function requestDownload(videoUrl) {
  const body = new URLSearchParams({ url: videoUrl });
  const { data } = await axios.post(API, body.toString(), {
    headers: {
      "user-agent": UA,
      "accept": "*/*",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "origin": BASE,
      "referer": PAGE,
      "x-requested-with": "XMLHttpRequest",
      "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": `"Android"`,
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "cookie": buildCookie()
    }
  });
  return data;
}

function pickMp3(downloadJson) {
  const items = downloadJson?.api?.mediaItems || [];
  const mp3 =
    items.find(x => x.type === "Audio" && x.mediaExtension === "MP3") ||
    items.find(x => x.type === "Audio" && x.mediaQuality === "128K") ||
    items.find(x => x.type === "Audio");
  if (!mp3) return null;
  return {
    quality: mp3.mediaQuality,
    extension: mp3.mediaExtension,
    size: mp3.mediaFileSize,
    duration: mp3.mediaDuration,
    url: mp3.mediaUrl
  };
}

function isFinalUrl(value) {
  return (
    typeof value === "string" &&
    value.startsWith("http") &&
    value !== "Waiting..." &&
    value !== "In Processing..."
  );
}

async function resolveAudioUrl(mediaUrl) {
  let lastJson = null;
  for (let i = 1; i <= MAX_POLL; i++) {
    const { data } = await axios.get(mediaUrl, {
      headers: {
        "user-agent": UA,
        "accept": "application/json, text/plain, */*",
        "referer": PAGE
      }
    });
    lastJson = data;
    const fileUrl = data?.fileUrl || data?.url || data?.downloadUrl;
    if (isFinalUrl(fileUrl)) return fileUrl;
    if (data?.status === "error" || data?.status === "failed") {
      throw new Error("Render audio gagal");
    }
    await sleep(POLL_DELAY);
  }
  throw new Error(`Audio belum selesai diproses: ${JSON.stringify(lastJson)}`);
}

async function ytmp3(link) {
  if (!link) throw new Error("Infokan linknya cik");
  if (!isUrl(link)) throw new Error("Itu bukan link youtube kocak");

  const videoId = getVideoId(link);
  if (!videoId) throw new Error("Yaelah link youtubenya ada yang salah cik");

  await warmup();
  const download = await requestDownload(link);
  const audio = pickMp3(download);
  if (!audio?.url) throw new Error("URL audio tidak ditemukan");

  audio.url = await resolveAudioUrl(audio.url);

  return {
    title: download?.api?.title || "Tidak diketahui",
    videoId: videoId,
    url: link,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    audio
  };
}

// ======================================================
// ENDPOINT GET UTAMA
// ======================================================

router.get("/", async (req, res) => {
  const link = req.query.link;

  if (!link) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'link' wajib diisi! Contoh: ?link=https://youtu.be/xxxxxx"
    });
  }

  try {
    const result = await ytmp3(link);
    return res.status(200).json({
      status: true,
      creator: "Arulzxd",
      result,
      metadata: {
        source: "YouTube - Ytmp3",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Gagal mengambil audio YouTube",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
