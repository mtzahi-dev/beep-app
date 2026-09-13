// ספקי קול טבעי (Google Chirp 3 HD / Microsoft Azure Neural) — קוד משותף לדפדפן ולשרת.
// מחזירים קובץ MP3; המפתח מגיע מהשרת (משתני סביבה) או ממפתח פרטי במכשיר.

export const MAX_TTS_CHARS = 700;

// קולות Chirp 3 HD מומלצים (מסוננים לפי מה ש-Google באמת מציע לעברית)
export const GOOGLE_PICKS = [
  "Leda", "Aoede", "Kore", "Zephyr", "Sulafat", "Despina",
  "Puck", "Achird", "Charon", "Orus", "Umbriel", "Fenrir",
];

export const AZURE_VOICES = {
  Hila: { gender: "FEMALE", he: "he-IL-HilaNeural", en: "en-US-JennyNeural" },
  Avri: { gender: "MALE", he: "he-IL-AvriNeural", en: "en-US-AndrewNeural" },
};

export function defaultVoice(provider) {
  return provider === "azure" ? "Hila" : "Charon";
}

export function cleanVoice(provider, voice) {
  if (provider === "azure") return AZURE_VOICES[voice] ? voice : "Hila";
  return /^[A-Za-z]{2,24}$/.test(voice || "") ? voice : "Charon";
}

async function errDetail(res) {
  try {
    const j = await res.json();
    const m = j && j.error && (j.error.message || j.error);
    return m ? ": " + String(m).slice(0, 120) : "";
  } catch {
    return "";
  }
}

// מחזיר את השמע כ-Uint8Array (MP3)
export async function synthesize({ provider, key, region }, { text, lang, voice }) {
  const he = lang === "he";
  const v = cleanVoice(provider, voice);
  if (provider === "azure") {
    const av = AZURE_VOICES[v];
    const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const ssml =
      `<speak version='1.0' xml:lang='${he ? "he-IL" : "en-US"}'>` +
      `<voice name='${he ? av.he : av.en}'><prosody rate='${he ? "-8%" : "-12%"}'>${esc}</prosody></voice></speak>`;
    const res = await fetch(`https://${region || "westeurope"}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      },
      body: ssml,
    });
    if (!res.ok) throw new Error("Azure " + res.status);
    return new Uint8Array(await res.arrayBuffer());
  }
  const locale = he ? "he-IL" : "en-US";
  const res = await fetch(
    "https://texttospeech.googleapis.com/v1/text:synthesize?key=" + encodeURIComponent(key),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: locale, name: `${locale}-Chirp3-HD-${v}` },
        // קצב רגוע מעט — נוח לילדים עם קשיי קשב
        audioConfig: { audioEncoding: "MP3", speakingRate: he ? 0.92 : 0.88 },
      }),
    }
  );
  if (!res.ok) throw new Error("Google " + res.status + (await errDetail(res)));
  const data = await res.json();
  const bin = atob(data.audioContent);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// רשימת הקולות הטבעיים בעברית: [{ id, gender }]
export async function listVoices({ provider, key }) {
  if (provider === "azure") {
    return Object.entries(AZURE_VOICES).map(([id, v]) => ({ id, gender: v.gender }));
  }
  const res = await fetch(
    "https://texttospeech.googleapis.com/v1/voices?languageCode=he-IL&key=" + encodeURIComponent(key)
  );
  if (!res.ok) throw new Error("Google " + res.status + (await errDetail(res)));
  const data = await res.json();
  const all = (data.voices || [])
    .filter((v) => /^he-IL-Chirp3-HD-/.test(v.name))
    .map((v) => ({ id: v.name.slice("he-IL-Chirp3-HD-".length), gender: v.ssmlGender }));
  const picks = all
    .filter((v) => GOOGLE_PICKS.includes(v.id))
    .sort((a, b) => GOOGLE_PICKS.indexOf(a.id) - GOOGLE_PICKS.indexOf(b.id));
  return picks.length >= 2 ? picks : all;
}
