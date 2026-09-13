// שרת הקריינות של ביפ — משותף לפונקציית Netlify ולשרת הפיתוח של Vite.
// המפתח נקרא ממשתני סביבה ולא נחשף לדפדפן.
//   GET  → { enabled, provider, voices, defaultVoice }
//   POST { text, lang: "he"|"en", voice } → audio/mpeg

import { synthesize, listVoices, defaultVoice, MAX_TTS_CHARS } from "../src/ttsProviders.js";
import { addNiqqud } from "./niqqud.js";

function configFromEnv(env) {
  const googleKey = (env.GOOGLE_TTS_KEY || "").trim();
  const azureKey = (env.AZURE_TTS_KEY || "").trim();
  let provider = (env.TTS_PROVIDER || "").trim().toLowerCase();
  if (!provider) provider = googleKey ? "google" : azureKey ? "azure" : "";
  const key = provider === "google" ? googleKey : provider === "azure" ? azureKey : "";
  return { provider, key, region: (env.AZURE_TTS_REGION || "").trim() };
}

let voicesMemo = null; // { at, sig, list }

const json = (status, obj) => ({
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(obj),
});

export async function handleTts(method, rawBody, env) {
  const cfg = configFromEnv(env);

  if (method === "GET") {
    if (!cfg.key) return json(200, { enabled: false });
    try {
      const sig = cfg.provider + "|" + cfg.key.slice(-6);
      if (!voicesMemo || voicesMemo.sig !== sig || Date.now() - voicesMemo.at > 3600e3) {
        voicesMemo = { at: Date.now(), sig, list: await listVoices(cfg) };
      }
      const voices = voicesMemo.list;
      if (!voices.length) return json(200, { enabled: false, error: "no Hebrew voices" });
      const wanted = (env.TTS_DEFAULT_VOICE || "").trim() || defaultVoice(cfg.provider);
      const def = voices.some((v) => v.id === wanted) ? wanted : voices[0].id;
      return json(200, { enabled: true, provider: cfg.provider, voices, defaultVoice: def });
    } catch (e) {
      voicesMemo = null;
      console.error("tts voices:", e.message);
      return json(200, { enabled: false, error: e.message });
    }
  }

  if (method !== "POST") return json(405, { error: "method not allowed" });
  if (!cfg.key) return json(503, { error: "not configured" });

  let req;
  try {
    req = JSON.parse(rawBody || "{}");
  } catch {
    return json(400, { error: "bad json" });
  }
  const text = String(req.text || "").trim();
  const lang = req.lang === "en" ? "en" : "he";
  if (!text || text.length > MAX_TTS_CHARS) return json(400, { error: "bad text length" });

  try {
    // עברית: ניקוד מלא לפני ההקראה, כדי שההגייה תהיה לפי כללי הניקוד (אפשר לכבות: TTS_NIQQUD=0)
    let spoken = text;
    let niqqud = "off";
    if (lang === "he" && (env.TTS_NIQQUD || "1") !== "0") {
      const r = await addNiqqud(text);
      spoken = r.text;
      niqqud = r.applied ? "1" : "fallback";
    }
    const audio = await synthesize(cfg, { text: spoken, lang, voice: req.voice || defaultVoice(cfg.provider) });
    return {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "X-TTS-Niqqud": niqqud },
      body: audio,
    };
  } catch (e) {
    // לא רושמים את הטקסט עצמו (עשוי לכלול את שם הילד)
    console.error("tts:", e.message);
    return json(502, { error: e.message });
  }
}
