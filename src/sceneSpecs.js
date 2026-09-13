// איור אוטומטי לכל תרגיל: מזהה מספרים, חפצים, דמויות ופעולות — ומחזיר תיאור סצנה מונפשת.
// מבנה: { type, ...פרמטרים }. הסצנה מוצגת במצב "setup" (הנתונים) ובמצב "solve" (הפתרון מונפש).

import { heEmoji, enEmoji, enPerson, enVerb, enTime } from "./sceneLexicon.js";

const EQ_RE = /^\s*(\d+|½|¼)\s*([+−×÷\-x*])\s*(\d+)\s*=\s*(_{2,}|\?|\d+)\s*$/;
const HEB = /[א-ת]/;

// ---- חשבון: תרגיל → סצנה ----
export function mathScene(a, op, b, item) {
  if (op === "-") op = "−";
  if (op === "x" || op === "*") op = "×";
  if (a === "½") return { type: "fracOf", parts: 2, n: b, item: item || "🍎" };
  if (a === "¼") return { type: "fracOf", parts: 4, n: b, item: item || "🍪" };
  a = +a; b = +b;
  const eq = `${a} ${op} ${b} = ${op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : a / b}`;
  if (op === "+") return a + b <= 20 ? { type: "add", a, b, item: item || "🍎", eq } : { type: "blocks", a, b, op, eq };
  if (op === "−") return a <= 20 ? { type: "sub", a, b, item: item || "🎈", eq } : { type: "blocks", a, b, op, eq };
  if (op === "×") return a * b <= 30 ? { type: "groups", g: a, per: b, item: item || "🍪", eq } : { type: "array", rows: a, cols: b, eq };
  if (op === "÷") return { type: "share", n: a, k: b, item: item || "🍬", who: "🧒", eq };
  return null;
}

const graphemes = (s) =>
  typeof Intl !== "undefined" && Intl.Segmenter ? [...new Intl.Segmenter().segment(s)].length : Array.from(s).length;

function eqScene(text, item) {
  const t = String(text || "");
  const m = t.match(EQ_RE);
  if (m) return mathScene(m[1], m[2], m[3], item);
  // תרגיל ציורי: "⚽⚽⚽ + ⚽⚽ = ___"
  const e = t.match(/^\s*(\S+)\s*\+\s*(\S+)\s*=\s*_{2,}\s*$/);
  if (e && !/\d/.test(t)) {
    const first = Array.from(new Intl.Segmenter().segment(e[1]))[0].segment;
    return { type: "add", a: graphemes(e[1]), b: graphemes(e[2]), item: first };
  }
  return null;
}

// תרגיל בתוך טקסט השאלה: "מה זה 2 × 5 בתור חיבור?"
function inlineEq(text) {
  const m = String(text || "").match(/(\d+)\s*([×÷+−])\s*(\d+)/);
  return m ? mathScene(m[1], m[2], m[3]) : null;
}

const FRAC_PARTS = { "½": 2, "⅓": 3, "¼": 4, "⅕": 5 };
function piesScene(q) {
  const parts = (q.options || []).map((o) => FRAC_PARTS[(String(o).match(/[½⅓¼⅕]/) || [])[0]]);
  if (parts.filter(Boolean).length < 2) return null;
  return { type: "pies", parts: parts.map((p) => p || 0), answer: q.c };
}

function orbitScene(text) {
  if (/להקיף את השמש|מקיף את השמש/.test(text)) return { type: "orbit", mode: "year" };
  if (/יום ולילה/.test(text)) return { type: "orbit", mode: "day" };
  if (/הירח/.test(text) && /(אור|מאיר|גאות)/.test(text)) return { type: "orbit", mode: "moon" };
  return null;
}

const HE_NUM = { אחת: 1, אחד: 1, שתיים: 2, שניים: 2, שלוש: 3, ארבע: 4, חמש: 5, שש: 6, שבע: 7, שמונה: 8, תשע: 9, עשר: 10 };
function countScene(q) {
  const m = String(q.q || "").match(/'([א-ת]+)'/);
  return m && HE_NUM[m[1]] ? { type: "count", n: HE_NUM[m[1]], item: "⭐" } : null;
}

// ברירת מחדל: הדמויות/החפצים מהשאלה, והתשובה נחשפת בפתרון
function factScene(q) {
  const answer = (q.options || [])[q.c];
  const ansE = String(answer || "").split(/\s+/).map((w) => heEmoji(w) || enEmoji(w)).find(Boolean) || null;
  if (/·/.test(q.en || "")) {
    const tokens = q.en.split("·").map((s) => s.trim());
    return { type: "fact", tokens, answer, ansE };
  }
  const items = [];
  for (const w of String(q.q || "").split(/\s+/)) {
    const e = heEmoji(w) || enEmoji(w);
    if (e && !items.includes(e)) items.push(e);
  }
  if (!items.length && q.pic) items.push(q.pic);
  if (!items.length) return null;
  return { type: "fact", items: items.slice(0, 3), answer, ansE };
}

// ---- חשבון בסיפור (עברית): "יש 10 בלונים ו-2 ילדים" ----
function storyMath(text) {
  const t = String(text || "");
  const nums = [...t.matchAll(/(\d+)(?:\s+([א-ת]+))?/g)].map((m) => ({ n: +m[1], e: heEmoji(m[2]) }));
  if (!nums.length) return null;
  const itemOf = (i) => (nums[i] && nums[i].e) || nums.find((x) => x.e)?.e || heEmoji((t.match(/[א-ת]+/g) || []).find((w) => heEmoji(w)));
  let m;
  if ((m = t.match(/חצי מ-?(\d+)/))) return { type: "fracOf", parts: 2, n: +m[1], item: itemOf(0) || "🍎" };
  if ((m = t.match(/רבע מ-?(\d+)/))) return { type: "fracOf", parts: 4, n: +m[1], item: itemOf(0) || "🍪" };
  if (/חלקים/.test(t) && /(חלק אחד|לקחת)/.test(t) && nums[0]) return { type: "frac", parts: nums[0].n, take: 1, whole: "🍕" };
  if ((m = t.match(/(?:ל-?)(\d+)\s+כדי להגיע ל-?(\d+)/))) return { type: "hops", from: +m[1], to: +m[2] };
  if (nums.length < 2) return null;
  const [x, y] = nums;
  if (/(לכל|לחלק|כל אחד|שווה בשווה)/.test(t)) return { type: "share", n: x.n, k: y.n, item: x.e || "🍬", who: y.e || "🧒" };
  if (/(בכל|שורות של)/.test(t)) return { type: "groups", g: x.n, per: y.n, item: y.e || x.e || "🍫", box: /קופס/.test(t) ? "📦" : null };
  if (/(עפו|נתן|נתנה|נתת|נשאר|נשארו|אכל|הלכו)/.test(t)) return x.n <= 20 ? { type: "sub", a: x.n, b: y.n, item: x.e || "🎈" } : { type: "blocks", a: x.n, b: y.n, op: "−" };
  if (/(קיבל|עוד|ביחד|סך הכול)/.test(t)) return x.n + y.n <= 20 ? { type: "add", a: x.n, b: y.n, item: x.e || "🍎" } : { type: "blocks", a: x.n, b: y.n, op: "+" };
  return null;
}

// ---- אנגלית: מילות מקום ----
function placeScene(q) {
  const en = String(q.en || "");
  if (!/_{2,}/.test(en)) return null;
  const answer = q.options && q.options[q.c];
  if (!/^(in|on|under)$/.test(answer || "")) return null;
  const words = en.split(/\s+/);
  const blank = words.findIndex((w) => /_{2,}/.test(w));
  const thing = words.slice(0, blank).map(enEmoji).filter(Boolean).pop() || "⚽";
  const refWord = words.slice(blank + 1).map((w) => w.replace(/[^a-z]/gi, "").toLowerCase()).filter((w) => w && w !== "the").pop();
  return { type: "place", thing, ref: refWord === "table" ? "TABLE" : enEmoji(refWord) || "📦", where: answer };
}

// ---- אנגלית: משפט → מי + פעולה + מה + מתי ----
function sentenceScene(q) {
  const answer = q.options && q.options[q.c];
  const en = String(q.en || "").replace(/_{2,}/, answer || "");
  if (!en || HEB.test(en) || !/[a-z]/i.test(en)) return null;
  const words = en.split(/\s+/).map((w) => w.replace(/[^a-z']/gi, ""));
  const who = words.map((w, i) => enPerson(w) || (i < 3 ? enEmoji(w) : null)).find(Boolean);
  const act = words.map(enVerb).find(Boolean);
  const objs = words.slice(1).map(enEmoji).filter((e) => e && e !== who && e !== act);
  const when = enTime(en);
  if (!who && !objs.length) return null;
  return { type: "time", who: who || "🙋", act: act || null, obj: objs[0] || null, when };
}

// ---- תשובות מאוירות: כל אפשרות מקבלת תמונה, בפתרון הנכונה קופצת ----
function choicesScene(q) {
  const opts = q.options || [];
  const items = opts.map((o) => {
    const words = String(o).split(/\s+/);
    const e = HEB.test(o) ? words.map(heEmoji).find(Boolean) : enEmoji(o) || words.map(enEmoji).find(Boolean);
    return { e, cap: o };
  });
  if (items.filter((x) => x.e).length < Math.min(2, opts.length)) return null;
  return { type: "choices", items: items.map((x) => ({ ...x, e: x.e || "❔" })), answer: q.c };
}

// ---- קטע קריאה → חלוניות קומיקס, אחת לכל משפט ----
function storyScene(q) {
  const text = String(q.en || "");
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  if (!sentences.length || (!HEB.test(text) && sentences.length < 2 && !q.q.includes("קרא"))) return null;
  const toEmoji = HEB.test(text) ? heEmoji : (w) => enPerson(w) || enEmoji(w);
  const panels = sentences.map((s) => {
    const es = [];
    for (const w of s.split(/\s+/)) {
      const e = toEmoji(w);
      if (e && !es.includes(e)) es.push(e);
    }
    return es.slice(0, 4);
  }).filter((p) => p.length);
  if (panels.flat().length < 2) return null;
  const ansWords = String((q.options || [])[q.c] || "").split(/\s+/);
  const ans = ansWords.map((w) => heEmoji(w) || enEmoji(w)).find(Boolean) || null;
  return { type: "story", panels, ans };
}

// ---- הפכים ----
const OPPOSITES = {
  big: ["🐘", "big", "🐭", "small", "size"], small: ["🐘", "big", "🐭", "small", "size"],
  hot: ["🔥", "hot", "🧊", "cold", "temp"], cold: ["🔥", "hot", "🧊", "cold", "temp"],
  fast: ["🐇", "fast", "🐢", "slow", "speed"], slow: ["🐇", "fast", "🐢", "slow", "speed"],
  happy: ["😊", "happy", "😢", "sad", "mood"], sad: ["😊", "happy", "😢", "sad", "mood"],
  easy: ["😌", "easy", "🧗", "difficult", "mood"],
};
function oppositeScene(q) {
  const m = String(q.q || "").match(/ההפך מ-?([a-z]+)/i) || String(q.en || "").match(/^([a-z]+)\s*↔/i);
  const p = m && OPPOSITES[m[1].toLowerCase()];
  return p ? { type: "pairs", pairs: [p] } : null;
}

// ---- נקודת הכניסה ----
export function sceneFor(q) {
  if (!q) return null;
  if (q.scene) return q.scene;
  const text = (q.q || "") + " " + (HEB.test(q.en || "") ? q.en : "");
  return (
    eqScene(q.en, q.item) ||
    piesScene(q) ||
    orbitScene(text) ||
    storyMath(text) ||
    inlineEq(q.q) ||
    placeScene(q) ||
    oppositeScene(q) ||
    (HEB.test(q.en || "") || /\.\s+[A-Z]/.test(q.en || "") || /קרא/.test(q.q || "") ? storyScene(q) : null) ||
    sentenceScene(q) ||
    countScene(q) ||
    choicesScene(q) ||
    factScene(q) ||
    (q.pic ? { type: "seq", frames: [{ e: q.pic, anim: "float" }] } : null)
  );
}
