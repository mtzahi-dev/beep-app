// ניקוד אוטומטי לפני הקראה — מנוע הקול מנחש תנועות בטקסט לא מנוקד וטועה;
// עם ניקוד מלא (הנקדן של דיקטה) ההגייה נגזרת מכללי הניקוד.
// בכל כשל או איטיות — חוזרים לטקסט המקורי, כדי שההקראה לא תיתקע.

const NAKDAN_URL = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
const memo = new Map(); // טקסט → טקסט מנוקד (חוסך קריאות חוזרות באותו שרת)

const METEG = "ֽ";
const HOLAM = "ֹ";
const KUBUTZ = "ֻ";
const DAGESH = "ּ";

// מנרמל לכתיב מלא מנוקד רגיל: בלי מתגים, "סֻוכָּר" → "סוּכָּר", "שֹׁורֶשׁ" → "שׁוֹרֶשׁ"
export function normalizeNiqqud(s) {
  const clusters = String(s).replace(/\|/g, "").split(METEG).join("").match(/[^֑-ׇ][֑-ׇ]*|[֑-ׇ]+/g) || [];
  for (let i = 0; i < clusters.length - 1; i++) {
    const cur = clusters[i];
    if (clusters[i + 1] !== "ו") continue; // ו' בלי סימנים = אם קריאה
    if (cur.includes(KUBUTZ)) {
      clusters[i] = cur.replace(KUBUTZ, "");
      clusters[i + 1] = "ו" + DAGESH;
    } else if (cur.includes(HOLAM)) {
      clusters[i] = cur.replace(HOLAM, "");
      clusters[i + 1] = "ו" + HOLAM;
    }
  }
  return clusters.join("");
}

function pickWord(item) {
  const nk = item && item.nakdan;
  if (!nk) return item && (item.str || item.word) ? item.str || item.word : "";
  const opts = nk.options;
  if (!opts || !opts.length) return nk.word || "";
  const best = opts.find((o) => o.levelChoice === 1) || opts[0];
  return String(best.w || nk.word || "");
}

export async function addNiqqud(text, { timeoutMs = 2500 } = {}) {
  const src = String(text || "");
  if (!/[א-ת]/.test(src)) return { text: src, applied: false };
  if (memo.has(src)) return { text: memo.get(src), applied: true };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(NAKDAN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify({
        task: "nakdan", data: src, genre: "modern", addmorph: true, keepmetagim: true,
        keepqq: false, nodageshdefmem: false, patachma: false, useTokenization: true,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error("nakdan " + res.status);
    const j = await res.json();
    const items = Array.isArray(j) ? j : j && j.data;
    if (!Array.isArray(items) || !items.length) throw new Error("nakdan empty");
    const out = normalizeNiqqud(items.map(pickWord).join(""));
    // בדיקת שפיות: בלי הניקוד, הטקסט חייב להישאר זהה למקור
    const bare = (s) => s.replace(/[֑-ׇ|]/g, "").replace(/\s+/g, " ").trim();
    if (bare(out) !== bare(src)) throw new Error("nakdan mismatch");
    if (memo.size > 800) memo.delete(memo.keys().next().value);
    memo.set(src, out);
    return { text: out, applied: true };
  } catch (e) {
    console.error("niqqud:", e.name === "AbortError" ? "timeout" : e.message);
    return { text: src, applied: false };
  } finally {
    clearTimeout(timer);
  }
}
