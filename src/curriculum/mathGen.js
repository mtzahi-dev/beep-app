// מחוללי תרגול בחשבון לפי נושא — כל נושא מותאם לכיתות שלו, והקושי עולה עם הרמה (1–6).
// כל שאלה: { q, en?, options, c, ex, scene }. תרגילים מוצגים משמאל לימין בשדה en.

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[rnd(0, arr.length - 1)];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a, b) => (a * b) / gcd(a, b);
const show = (v) => (typeof v === "number" ? String(+v.toFixed(4)).replace("-", "−") : String(v));
const round2 = (v) => Math.round(v * 100) / 100;

// ארבע תשובות: הנכונה + טעויות נפוצות (בלי כפילויות)
function opts(correct, wrongs = []) {
  const c = show(correct);
  const list = [c];
  for (const w of wrongs) {
    const s = show(w);
    if (!/NaN|Infinity/.test(s) && !list.includes(s)) list.push(s);
    if (list.length === 4) break;
  }
  const n = Number(correct);
  for (let k = 1; list.length < 4 && k < 40; k++) {
    const s = Number.isFinite(n) ? show(n + (k % 2 ? k : -k) * Math.max(1, Math.round(Math.abs(n) / 10))) : `${c} (${k})`;
    const neg = Number(s.replace("−", "-")) < 0;
    if (!list.includes(s) && !(Number.isFinite(n) && n >= 0 && neg)) list.push(s);
  }
  const o = shuffle(list);
  return { options: o, c: o.indexOf(c) };
}

const ITEMS = [
  { he: "תפוחים", e: "🍎" }, { he: "בלונים", e: "🎈" }, { he: "עוגיות", e: "🍪" }, { he: "מדבקות", e: "⭐" },
  { he: "כדורים", e: "⚽" }, { he: "ספרים", e: "📖" }, { he: "פרחים", e: "🌸" }, { he: "סוכריות", e: "🍬" },
];
const NAMES = [["נועה", "f"], ["דני", "m"], ["מאיה", "f"], ["יובל", "m"], ["תמר", "f"], ["עומר", "m"]];

const M = {};

// ---------- כיתות א'–ב' ----------

// רמה 1: עד 6 · רמה 2: עד 10 · רמה 3: מעבר עשר · רמה 4 ומעלה: גם שלושה מספרים (מחפשים שניים שיחד הם 10)
M.add = (lv) => {
  if (lv <= 2) {
    const top = lv <= 1 ? 6 : 10;
    const a = rnd(1, top - 2), b = rnd(1, Math.min(lv <= 1 ? 3 : 5, top - a));
    const item = pick(["🍎", "🎈", "⭐", "🍪", "⚽", "🐤", "🍓", "🚗"]);
    return { q: "כמה יש ביחד?", en: `${a} + ${b} = ___`, ...opts(a + b, [a + b + 1, a + b - 1, a, b + 2]),
      ex: `${a} + ${b} = ${a + b} — סופרים את כולם יחד`, scene: { type: "add", a, b, item } };
  }
  if (lv >= 4 && Math.random() < 0.5) {
    const a = rnd(1, 9), b = 10 - a, c = rnd(2, 9), r = 10 + c;
    const [x, y, z] = shuffle([a, b, c]);
    return { q: "חיבור של שלושה מספרים:", en: `${x} + ${y} + ${z} = ___`, ...opts(r, [r + 1, r - 1, a + c, r + 10]),
      ex: `מחפשים שני מספרים שיחד הם 10: ${a} + ${b} = 10, ועוד ${c} → ${r}`,
      scene: { type: "steps", lines: [`${x} + ${y} + ${z}`, `10 + ${c}`, `${r}`] } };
  }
  const a = rnd(6, 9), b = rnd(11 - a, 9), need = 10 - a;
  return { q: "חיבור עם מעבר עשר:", en: `${a} + ${b} = ___`, ...opts(a + b, [a + b - 1, a + b + 1, a + b - 10, a + b + 10]),
    ex: `${a} + ${need} = 10, ונשאר עוד ${b - need} → ${a + b}`, scene: { type: "ten", a, b, eq: `${a} + ${b} = ${a + b}` } };
};

// רמה 1: עד 6 · רמה 2: עד 10 · רמה 3: מ-11 עד 18 בעזרת השלמה · רמה 4 ומעלה: גם שני מספרים דו-ספרתיים (17 − 12)
M.sub = (lv) => {
  if (lv <= 2) {
    const a = lv <= 1 ? rnd(3, 6) : rnd(4, 10), b = rnd(1, a - 1);
    const item = pick(["🎈", "🍎", "🐦", "🍪"]);
    return { q: "כמה נשארו?", en: `${a} − ${b} = ___`, ...opts(a - b, [a - b + 1, a - b - 1, a + b, b]),
      ex: `היו ${a}, הלכו ${b}, ונשארו ${a - b}`, scene: { type: "sub", a, b, item } };
  }
  if (lv >= 4 && Math.random() < 0.5) {
    const a = rnd(13, 20), b = rnd(11, a - 2), r = a - b;
    return { q: "חיסור בעזרת השלמה:", en: `${a} − ${b} = ___`, ...opts(r, [r + 1, r - 1, r + 10, a + b]),
      ex: `שואלים: כמה צריך להוסיף ל-${b} כדי להגיע ל-${a}? ${b} + ${r} = ${a}`, scene: { type: "hops", from: b, to: a } };
  }
  const a = rnd(11, 18), b = rnd(a - 9, 9);
  return { q: "חיסור בעזרת השלמה:", en: `${a} − ${b} = ___`, ...opts(a - b, [a - b + 1, a - b - 1, a + b, 10 - b]),
    ex: `שואלים: כמה צריך להוסיף ל-${b} כדי להגיע ל-${a}? ${b} + ${a - b} = ${a}`, scene: { type: "hops", from: b, to: a } };
};

const PLACE_NAMES = ["היחידות", "העשרות", "המאות", "האלפים"];
// רמה 1–2: דו-ספרתי (ברמה 1 רק "איזו ספרה") · רמה 3: תלת-ספרתי · רמה 4: תלת-ספרתי עם אפס (406, 750) · רמה 5 ומעלה: ארבע ספרות
const withZero = () => {
  const h = rnd(1, 9);
  return Math.random() < 0.5 ? h * 100 + rnd(1, 9) : h * 100 + rnd(1, 9) * 10;
};
M.place = (lv) => {
  const n = lv <= 2 ? rnd(12, 99) : lv === 3 ? rnd(102, 999) : lv === 4 ? withZero() : rnd(1002, 9999);
  const ds = String(n).split("").map(Number).reverse();
  const pos = rnd(0, ds.length - 1);
  const d = ds[pos];
  const val = d * 10 ** pos;
  const parts = ds.map((x, i) => `${x} ${PLACE_NAMES[i].slice(1)}`).reverse().join(", ");
  const scene = n <= 999 ? { type: "placevalue", n }
    : { type: "steps", lines: [String(n), ds.map((x, i) => x * 10 ** i).reverse().filter(Boolean).join(" + ")] };
  if (d === 0 || lv <= 1 || Math.random() < 0.5) {
    return { q: `איזו ספרה נמצאת בספרת ${PLACE_NAMES[pos]} במספר ${n}?`, en: String(n),
      ...opts(d, ds.filter((_, i) => i !== pos).concat([(d + 1) % 10, (d + 8) % 10])), ex: `${n} = ${parts}`, scene };
  }
  return { q: `מה הערך של ספרת ${PLACE_NAMES[pos]} במספר ${n}?`, en: String(n),
    ...opts(val, [d, d * 10 ** (pos + 1), pos ? d * 10 ** (pos - 1) : d * 100]),
    ex: `הספרה ${d} נמצאת בספרת ${PLACE_NAMES[pos]}, לכן הערך שלה ${val}`, scene };
};

M.word = (lv) => {
  const it = pick(ITEMS);
  const [name, g] = pick(NAMES);
  const f = g === "f";
  const kinds = ["add", "sub"];
  if (lv >= 3) kinds.push("mul", "div");
  if (lv >= 5) kinds.push("two", "two");
  const kind = pick(kinds);
  const big = lv >= 4;
  const tiny = lv <= 1; // רמה 1: מספרים קטנים, התוצאה עד 10
  if (kind === "add") {
    const a = rnd(tiny ? 1 : 3, big ? 60 : tiny ? 5 : 12), b = rnd(tiny ? 1 : 2, big ? 40 : tiny ? 4 : 8), r = a + b;
    return { q: `ל${name} יש ${a} ${it.he}. ${f ? "היא קיבלה" : "הוא קיבל"} עוד ${b}. כמה ${it.he} יש ${f ? "לה" : "לו"} עכשיו?`,
      ...opts(r, [r + 1, r - 1, Math.abs(a - b), r + 10]), ex: `"קיבל עוד" = חיבור: ${a} + ${b} = ${r}`,
      scene: r <= 20 ? { type: "add", a, b, item: it.e } : { type: "blocks", a, b, op: "+" } };
  }
  if (kind === "sub") {
    const a = rnd(big ? 25 : tiny ? 4 : 6, big ? 90 : tiny ? 9 : 15), b = rnd(tiny ? 1 : 2, a - 1), r = a - b;
    return { q: `בקופסה היו ${a} ${it.he}. ${name} ${f ? "לקחה" : "לקח"} ${b}. כמה ${it.he} נשארו בקופסה?`,
      ...opts(r, [r + 1, r - 1, a + b, b]), ex: `"נשארו" = חיסור: ${a} − ${b} = ${r}`,
      scene: a <= 20 ? { type: "sub", a, b, item: it.e } : { type: "blocks", a, b, op: "−" } };
  }
  if (kind === "mul") {
    const bags = rnd(2, 6), per = rnd(2, big ? 12 : 6), r = bags * per;
    return { q: `יש ${bags} שקיות, ובכל שקית ${per} ${it.he}. כמה ${it.he} יש בסך הכול?`,
      ...opts(r, [bags + per, r + per, r - bags, r + 1]), ex: `"בכל שקית" = כפל: ${bags} × ${per} = ${r}`,
      scene: r <= 30 ? { type: "groups", g: bags, per, item: it.e } : { type: "array", rows: bags, cols: per } };
  }
  if (kind === "div") {
    const k = rnd(2, 5), per = rnd(2, big ? 9 : 5), n = k * per;
    return { q: `${n} ${it.he} מחולקים שווה בשווה בין ${k} ילדים. כמה ${it.he} מקבל כל ילד?`,
      ...opts(per, [per + 1, per - 1, n - k, k]), ex: `"שווה בשווה" = חילוק: ${n} ÷ ${k} = ${per}`,
      scene: n <= 30 ? { type: "share", n, k, item: it.e, who: "🧒" } : { type: "array", rows: k, cols: per } };
  }
  const a = rnd(20, 60), b = rnd(5, 30), c = rnd(5, a + b - 5), r = a + b - c;
  return { q: `ל${name} היו ${a} ${it.he}. ${f ? "היא קנתה" : "הוא קנה"} עוד ${b}, ו${f ? "נתנה" : "נתן"} לחברים ${c}. כמה ${it.he} ${f ? "נשארו לה" : "נשארו לו"}?`,
    ...opts(r, [a + b + c, a - c, r + 10, a + b]), ex: `שני שלבים: ${a} + ${b} = ${a + b}, ואז ${a + b} − ${c} = ${r}`,
    scene: { type: "steps", lines: [`${a} + ${b} − ${c}`, `${a + b} − ${c}`, `${r}`] } };
};

// ---------- כיתות ג'–ו' ----------

// רמה 1: לוח ה-2, ה-5 וה-10 · רמה 2: עד 5 · רמה 3: כל הלוח · רמה 4: העובדות הקשות (6–9 כפול 6–9)
// · רמה 5 ומעלה: גם גורם חסר ("7 כפול איזה מספר שווה 42?")
M.mul = (lv) => {
  if (lv >= 5 && Math.random() < 0.5) {
    const a = rnd(3, 9), b = rnd(3, 9), r = a * b;
    return { q: `${a} כפול איזה מספר שווה ${r}?`, ...opts(b, [b + 1, b - 1, r - a, a]),
      ex: `מחלקים: ${r} ÷ ${a} = ${b}, כי ${a} × ${b} = ${r}`,
      scene: { type: "steps", lines: [`${a} × ? = ${r}`, `${r} ÷ ${a} = ${b}`] } };
  }
  const hard = lv === 4 || (lv >= 5 && Math.random() < 0.6);
  const a = lv <= 1 ? pick([2, 5, 10]) : hard ? rnd(6, 9) : rnd(2, lv <= 2 ? 5 : 10);
  const b = hard ? rnd(6, 9) : rnd(2, 10), r = a * b;
  const rep = a <= 5 ? Array(a).fill(b).join(" + ") : `${b} + ${b} + ... (${a} פעמים)`;
  return { q: "כמה זה?", en: `${a} × ${b} = ___`, ...opts(r, [r + a, r - a, r + b, a + b]), ex: `${a} × ${b} = ${rep} = ${r}`,
    scene: r <= 30 ? { type: "groups", g: a, per: b, item: pick(["🍪", "⭐", "🍓", "🌸"]) } : { type: "array", rows: a, cols: b } };
};

function columnHint(a, b, add) {
  const A = String(a).split("").reverse().map(Number);
  const B = String(b).split("").reverse().map(Number);
  if (add) {
    const s = A[0] + (B[0] || 0);
    return s >= 10
      ? `מתחילים מהיחידות: ${A[0]} + ${B[0]} = ${s} → כותבים ${s - 10} ונושאים 1 לעשרות`
      : `מתחילים מהיחידות: ${A[0]} + ${B[0]} = ${s}, ואז עשרות ומאות`;
  }
  return A[0] < (B[0] || 0)
    ? `ביחידות ${A[0]} קטן מ-${B[0]}, אז פורטים עשרת: ${A[0] + 10} − ${B[0]} = ${A[0] + 10 - B[0]}`
    : `מתחילים מהיחידות: ${A[0]} − ${B[0]} = ${A[0] - B[0]}, ואז עשרות ומאות`;
}

// רמה 1: דו-ספרתי בלי המרה (בלי לשאת ובלי לפרוט) · רמה 2: דו-ספרתי · רמה 3: תלת-ספרתי ודו-ספרתי
// · רמה 4: שני תלת-ספרתיים · רמה 5 ומעלה: ארבע ספרות
M.addbig = (lv) => {
  if (lv <= 1) {
    const add = Math.random() < 0.5;
    const t1 = rnd(2, 8), u1 = rnd(1, 8);
    const t2 = add ? rnd(1, 9 - t1) : rnd(1, t1 - 1), u2 = add ? rnd(0, 9 - u1) : rnd(0, u1);
    const a = t1 * 10 + u1, b = t2 * 10 + u2, r = add ? a + b : a - b;
    return { q: add ? "חיבור במאונך:" : "חיסור במאונך:", en: `${a} ${add ? "+" : "−"} ${b} = ___`,
      ...opts(r, add ? [r - 10, r + 10, r + 1, r - 1] : [r + 10, r - 10, r + 1, r - 1].filter((x) => x >= 0)),
      ex: columnHint(a, b, add), scene: { type: "column", a, b, op: add ? "+" : "−" } };
  }
  const digits = lv <= 2 ? 2 : lv <= 4 ? 3 : 4;
  const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
  const blo = lv === 3 ? 10 : lo, bhi = lv === 3 ? 99 : hi; // ברמה 3 המספר השני דו-ספרתי
  const unit = digits === 2 ? 10 : 100;
  const kind = pick(["add", "add", "sub", "sub", "comp", "est"]);
  if (kind === "comp") {
    const base = rnd(2, 8) * unit, gap = rnd(1, 3), a = base - gap, b = rnd(blo, bhi), r = a + b;
    return { q: "חשבון חכם — עיגול ופיצוי:", en: `${a} + ${b} = ___`, ...opts(r, [r + gap, r - gap, base + b, r + 10]),
      ex: `${a} זה ${base} פחות ${gap}: ${base} + ${b} = ${base + b}, ואז מורידים ${gap} → ${r}`,
      scene: { type: "steps", lines: [`${a} + ${b}`, `${base} + ${b} − ${gap}`, `${base + b} − ${gap}`, `${r}`] } };
  }
  if (kind === "est") {
    const a = rnd(lo, hi), b = rnd(blo, bhi), u = lv === 3 ? 10 : unit;
    const ra = Math.round(a / u) * u, rb = Math.round(b / u) * u, r = ra + rb;
    return { q: `בערך כמה זה ${a} + ${b}?`, ...opts(r, [r + u, r - u, r + 2 * u, r - 2 * u]),
      ex: `מעגלים: ${a} בערך ${ra}, ${b} בערך ${rb} → בערך ${r}`,
      scene: { type: "steps", lines: [`${a} + ${b}`, `≈ ${ra} + ${rb}`, `≈ ${r}`] } };
  }
  const add = kind === "add";
  let a = rnd(lo, hi), b = rnd(blo, bhi);
  if (!add && b > a) [a, b] = [b, a];
  const r = add ? a + b : a - b;
  return { q: add ? "חיבור במאונך:" : "חיסור במאונך:", en: `${a} ${add ? "+" : "−"} ${b} = ___`,
    ...opts(r, add ? [r - 10, r + 10, r - 100, r + 1] : [r + 10, r - 10, r + 100, r - 1].filter((x) => x >= 0)),
    ex: columnHint(a, b, add), scene: { type: "column", a, b, op: add ? "+" : "−" } };
};

// רמה 1: חצאים, שלישים ורבעים · רמה 2: עד שמיניות · רמה 3: גם השוואת שברים
// · רמה 4: גם חלק שאינו 1 (2/3 מ-12) · רמה 5 ומעלה: גם "איזה שבר שווה לחצי?" ועוגות של עד 12 חלקים
M.frac = (lv) => {
  const kinds = lv <= 2 ? ["pie", "of"] : ["pie", "of", "cmp"];
  if (lv >= 4) kinds.push("ofk", "ofk");
  if (lv >= 5) kinds.push("half", "half");
  const kind = pick(kinds);
  if (kind === "ofk") {
    const parts = pick([3, 4, 5]), k = rnd(2, parts - 1), per = rnd(2, lv >= 5 ? 9 : 6), n = parts * per, r = k * per;
    return { q: `כמה זה ${k}/${parts} מ-${n}?`, ...opts(r, [per, r + per, n - r, r + 1]),
      ex: `קודם 1/${parts} מ-${n}: ${n} ÷ ${parts} = ${per}. ואז כפול ${k}: ${per} × ${k} = ${r}`,
      scene: { type: "steps", lines: [`${n} ÷ ${parts} = ${per}`, `${per} × ${k} = ${r}`] } };
  }
  if (kind === "half") {
    const k = rnd(2, 6), right = `${k}/${2 * k}`;
    const wrongs = shuffle([`${k}/${2 * k + 1}`, `${k + 1}/${2 * k}`, `${k}/${k + 1}`, `${2 * k}/${k}`, `${k - 1}/${2 * k}`]);
    return { q: "איזה שבר שווה לחצי?", ...opts(right, wrongs),
      ex: `${k} הוא בדיוק חצי מ-${2 * k}, לכן ${right} = 1/2`, scene: { type: "frac", parts: 2, take: 1 } };
  }
  if (kind === "pie") {
    const parts = pick(lv <= 1 ? [2, 3, 4] : lv >= 5 ? [4, 5, 6, 8, 10, 12] : [2, 3, 4, 6, 8]), take = rnd(1, parts - 1);
    return { q: "איזה חלק מהפיצה צבוע?", ...opts(`${take}/${parts}`, [`${parts - take}/${parts}`, `${take}/${parts + 1}`, `${parts}/${take}`]),
      ex: `הפיצה חולקה ל-${parts} חלקים שווים ו-${take} צבועים → ${take}/${parts}`, scene: { type: "frac", parts, take } };
  }
  if (kind === "of") {
    const parts = lv <= 1 ? pick([2, 3]) : pick([2, 3, 4]), per = rnd(2, lv <= 2 ? 5 : 6), n = parts * per;
    return { q: `כמה זה 1/${parts} מ-${n}?`, ...opts(per, [per + 1, per - 1, n - per, parts]),
      ex: `מחלקים ${n} ל-${parts} קבוצות שוות: ${n} ÷ ${parts} = ${per}`,
      scene: { type: "fracOf", parts, n, item: pick(["🍎", "🍪", "🍬", "⭐"]) } };
  }
  const ds = shuffle([2, 3, 4, 5, 6, 8]).slice(0, 4);
  const best = Math.min(...ds);
  return { q: "איזה שבר הכי גדול?", options: ds.map((d) => `1/${d}`), c: ds.indexOf(best),
    ex: `כשמחלקים לפחות חלקים, כל חלק גדול יותר — לכן 1/${best} הכי גדול`, scene: { type: "pies", parts: ds, answer: ds.indexOf(best) } };
};

// רמה 2 ומטה: עד 5 · רמה 3: גם שארית · רמה 4: מחלק עד 9 · רמה 5 ומעלה: מנה דו-ספרתית (84 ÷ 4) ויותר שאריות
M.div = (lv) => {
  const k = rnd(2, lv <= 3 ? 5 : lv >= 5 ? 7 : 9);
  if (lv >= 3 && Math.random() < (lv >= 5 ? 0.5 : 0.4)) {
    const ans = rnd(lv >= 5 ? 6 : 2, lv >= 5 ? 14 : 9), r = rnd(1, k - 1), n = k * ans + r;
    return { q: "חילוק עם שארית:", en: `${n} ÷ ${k} = ___`,
      ...opts(`${ans} שארית ${r}`, [`${ans + 1} שארית ${r}`, `${ans} שארית ${r === 1 ? 2 : r - 1}`, `${ans - 1} שארית ${r}`]),
      ex: `${k} × ${ans} = ${k * ans}, ונשארים עוד ${r}`,
      scene: n <= 30 ? { type: "share", n, k, item: "🍬", who: "🧒" }
        : { type: "steps", lines: [`${n} ÷ ${k}`, `${k} × ${ans} = ${k * ans}`, `${n} − ${k * ans} = ${r}`] } };
  }
  const ans = lv >= 5 ? rnd(11, 20) : rnd(2, lv <= 3 ? 10 : 12), n = k * ans;
  return { q: "כמה זה?", en: `${n} ÷ ${k} = ___`, ...opts(ans, [ans + 1, ans - 1, n - k, k]),
    ex: `${k} × ${ans} = ${n}, לכן ${n} ÷ ${k} = ${ans}`,
    scene: n <= 30 ? { type: "share", n, k, item: pick(["🍬", "🎈", "🍪"]), who: "🧒" }
      : n <= 90 ? { type: "array", rows: k, cols: ans }
      : { type: "steps", lines: [`${n} ÷ ${k}`, `${k} × ${ans} = ${n}`, `${ans}`] } };
};

// רמה 2 ומטה: מלבנים קטנים · רמה 3: גם ריבוע ומשולש · רמה 4: גם צלע חסרה (מהשטח או מההיקף)
// · רמה 5: צורה משני מלבנים וצלעות ארוכות יותר · רמה 6: גם מהשטח של ריבוע להיקף שלו
M.geo = (lv) => {
  const kinds = lv <= 2 ? ["per", "area"] : ["per", "area", "sq", "tri"];
  if (lv >= 4) kinds.push("inv", "inv");
  if (lv >= 5) kinds.push("two", "two");
  if (lv >= 6) kinds.push("sqper", "sqper");
  const kind = pick(kinds);
  const big = lv >= 5;
  if (kind === "inv") {
    if (Math.random() < 0.5) {
      const w = rnd(3, big ? 15 : 10), h = rnd(2, 9), A = w * h;
      return { q: `השטח של מלבן הוא ${A}, והאורך שלו ${w}. מה הרוחב שלו?`, ...opts(h, [A - w, h + 1, h - 1, w]),
        ex: `שטח = אורך × רוחב, לכן הרוחב = ${A} ÷ ${w} = ${h}`,
        scene: { type: "steps", lines: [`${w} × ? = ${A}`, `${A} ÷ ${w} = ${h}`] } };
    }
    const s = rnd(3, big ? 15 : 12), P = 4 * s;
    return { q: `ההיקף של ריבוע הוא ${P} סנטימטרים. מה אורך הצלע שלו?`, ...opts(s, [2 * s, s + 1, s - 1, P - 4]),
      ex: `לריבוע 4 צלעות שוות: ${P} ÷ 4 = ${s}`, scene: { type: "steps", lines: [`4 × ? = ${P}`, `${P} ÷ 4 = ${s}`] } };
  }
  if (kind === "two") {
    const w1 = rnd(4, 10), h1 = rnd(3, 8), w2 = rnd(2, 6), h2 = rnd(2, 5), r = w1 * h1 + w2 * h2;
    return { q: `צורה בנויה משני מלבנים: אחד ${w1} על ${h1}, והשני ${w2} על ${h2}. מה השטח של כל הצורה?`,
      ...opts(r, [w1 * h1, (w1 + w2) * (h1 + h2), r + 10, w1 + h1 + w2 + h2]),
      ex: `מחשבים כל מלבן לחוד ומחברים: ${w1} × ${h1} = ${w1 * h1}, ${w2} × ${h2} = ${w2 * h2}, ביחד ${r}`,
      scene: { type: "steps", lines: [`${w1} × ${h1} + ${w2} × ${h2}`, `${w1 * h1} + ${w2 * h2}`, `${r}`] } };
  }
  if (kind === "sqper") {
    const s = rnd(3, 12), A = s * s, P = 4 * s;
    return { q: `השטח של ריבוע הוא ${A}. מה ההיקף שלו?`, ...opts(P, [2 * s, s, A, P + 4]),
      ex: `קודם מוצאים את הצלע: ${s} × ${s} = ${A}, לכן הצלע ${s}. ואז ההיקף: 4 × ${s} = ${P}`,
      scene: { type: "steps", lines: [`? × ? = ${A}`, `${s} × ${s} = ${A}`, `4 × ${s} = ${P}`] } };
  }
  if (kind === "sq") {
    const s = rnd(2, big ? 15 : 10), per = Math.random() < 0.5, r = per ? 4 * s : s * s;
    return { q: per ? `מה ההיקף של ריבוע שאורך הצלע שלו ${s} סנטימטרים?` : `מה השטח של ריבוע שאורך הצלע שלו ${s}?`,
      ...opts(r, per ? [s * s, 2 * s, r + 4] : [4 * s, 2 * s, r + s]),
      ex: per ? `לריבוע 4 צלעות שוות: 4 × ${s} = ${r}` : `שטח ריבוע = צלע × צלע = ${s} × ${s} = ${r}`,
      scene: { type: "rect", w: s, h: s, mode: per ? "per" : "area" } };
  }
  if (kind === "tri") {
    const b = rnd(3, big ? 20 : 12);
    let h = rnd(2, big ? 14 : 10);
    if ((b * h) % 2) h += 1;
    const r = (b * h) / 2;
    return { q: `מה השטח של משולש שהבסיס שלו ${b} והגובה שלו ${h}?`, ...opts(r, [b * h, b + h, r + b]),
      ex: `שטח משולש = בסיס × גובה ÷ 2 = ${b} × ${h} ÷ 2 = ${r}`, scene: { type: "rect", w: b, h, mode: "tri" } };
  }
  const w = rnd(3, big ? 20 : lv <= 2 ? 8 : 12), h = rnd(2, Math.min(big ? 12 : lv <= 2 ? 6 : 9, w));
  if (kind === "per") {
    const r = 2 * (w + h);
    return { q: `מה ההיקף של מלבן שאורכו ${w} סנטימטרים ורוחבו ${h} סנטימטרים?`, ...opts(r, [w * h, w + h, r + 2]),
      ex: `היקף = סכום כל הצלעות: ${w} + ${h} + ${w} + ${h} = ${r}`, scene: { type: "rect", w, h, mode: "per" } };
  }
  const r = w * h;
  return { q: `מה השטח של מלבן שאורכו ${w} ורוחבו ${h}? (ביחידות ריבועיות)`, ...opts(r, [2 * (w + h), w + h, r + w]),
    ex: `שטח = אורך × רוחב = ${w} × ${h} = ${r}`, scene: { type: "rect", w, h, mode: "area" } };
};

// רמה 2 ומטה: דו-ספרתי כפול 2–5 וכפל ב-10 · רמה 3: דו-ספרתי עד 49, כפל ב-10 וב-100 · רמה 4: גם דו-ספרתי כפול דו-ספרתי
// · רמה 5: מספרים גדולים יותר ותלת-ספרתי כפול חד-ספרתי · רמה 6: גם תלת-ספרתי כפול דו-ספרתי
M.mulbig = (lv) => {
  const kind = pick(lv <= 3 ? ["2x1", "2x1", "x10"] : lv === 4 ? ["2x1", "2x2", "2x2", "x10"]
    : lv === 5 ? ["2x2", "2x2", "3x1", "3x1", "x10"] : ["2x2", "3x1", "3x2", "3x2"]);
  if (kind === "x10") {
    const a = rnd(3, 99), z = pick(lv <= 2 ? [10] : lv === 3 ? [10, 100] : [10, 100, 1000]), zeros = String(z).length - 1, r = a * z;
    return { q: `כפל ב-${z}:`, en: `${a} × ${z} = ___`, ...opts(r, [r / 10, r * 10, a + z]),
      ex: `כופלים ב-${z} → מוסיפים ${zeros === 1 ? "אפס אחד" : `${zeros} אפסים`} בסוף: ${r}`,
      scene: { type: "steps", lines: [`${a} × ${z}`, `${a}${"0".repeat(zeros)}`] } };
  }
  if (kind === "2x1" || kind === "3x1") {
    let a = kind === "3x1" ? rnd(102, 989) : rnd(12, lv <= 2 ? 29 : lv <= 3 ? 49 : 99);
    if (a % 10 === 0) a += rnd(1, 9);
    const b = lv <= 2 ? rnd(2, 5) : rnd(3, 9), r = a * b, t = a - (a % 10), o = a % 10;
    return { q: "כפל בשיטת הפירוק:", en: `${a} × ${b} = ___`, ...opts(r, [t * b + o, r + b, r - 10, t * b]),
      ex: `מפרקים: ${a} × ${b} = ${t} × ${b} + ${o} × ${b} = ${t * b} + ${o * b} = ${r}`, scene: { type: "area", a, b } };
  }
  const three = kind === "3x2";
  let a = three ? rnd(102, 399) : rnd(lv >= 5 ? 21 : 12, lv >= 5 ? 79 : 39);
  if (a % 10 === 0) a += 1;
  let b = rnd(three ? 12 : 11, lv >= 5 ? 49 : 29);
  if (b % 10 === 0) b += 1;
  const r = a * b, bt = b - (b % 10), bo = b % 10;
  return { q: three ? "כפל תלת-ספרתי בדו-ספרתי:" : "כפל דו-ספרתי:", en: `${a} × ${b} = ___`, ...opts(r, [a * bt + bo, a * bo + bt, r + a, r - 10]),
    ex: `${a} × ${b} = ${a} × ${bt} + ${a} × ${bo} = ${a * bt} + ${a * bo} = ${r}`, scene: { type: "area", a, b } };
};

function longDivSteps(n, k) {
  const steps = [];
  let cur = 0;
  let started = false;
  for (const d of String(n)) {
    cur = cur * 10 + +d;
    const t = Math.floor(cur / k);
    if (t > 0) started = true;
    if (started && steps.length < 3) steps.push(`${cur} ÷ ${k} = ${t}${cur - t * k ? ` (נשאר ${cur - t * k})` : ""}`);
    cur -= t * k;
  }
  return steps;
}

// רמה 2 ומטה: מנה עד 60 בלי שארית · רמה 3: גם שארית · רמה 4: מנה עד 160 · רמה 5: מנה תלת-ספרתית
// · רמה 6: מחלק דו-ספרתי (11–19)
M.longdiv = (lv) => {
  const k = lv >= 6 ? rnd(11, 19) : rnd(3, 9);
  const withRem = lv >= 3 && Math.random() < (lv >= 5 ? 0.45 : 0.35);
  const ans = lv >= 6 ? rnd(12, 60) : lv === 5 ? rnd(101, 399) : rnd(lv <= 2 ? 12 : 21, lv <= 3 ? 60 : 160);
  const r = withRem ? rnd(1, k - 1) : 0;
  const n = k * ans + r;
  const correct = r ? `${ans} שארית ${r}` : ans;
  const wrongs = r
    ? [`${ans + 1} שארית ${r}`, `${ans} שארית ${r === k - 1 ? r - 1 : r + 1}`, `${ans - 1} שארית ${r}`]
    : [ans + 1, ans - 1, ans + 10, Math.floor(ans / 10) || ans + 2];
  return { q: r ? "חילוק ארוך עם שארית:" : "חילוק ארוך:", en: `${n} ÷ ${k} = ___`, ...opts(correct, wrongs),
    ex: `מחלקים ספרה אחרי ספרה משמאל: ${longDivSteps(n, k).join(" · ")}`, scene: { type: "longdiv", n, k } };
};

function divisorsOf(d) {
  const out = [];
  for (let i = 2; i < d; i++) if (d % i === 0) out.push(i);
  return out;
}

// רמה 2 ומטה: שבר שקול, צמצום וחיבור עם אותו מכנה · רמה 3: גם מכנה משותף · רמה 4: גם חיסור
// · רמה 5: גם כפל שבר במספר שלם · רמה 6: גם כפל שברים
M.fracops = (lv) => {
  const kinds = ["eq", "simp", "same"];
  if (lv >= 3) kinds.push("unlike");
  if (lv >= 4) kinds.push("minus", "minus");
  if (lv >= 5) kinds.push("mulw", "mulw");
  if (lv >= 6) kinds.push("mulf", "mulf");
  const kind = pick(kinds);
  if (kind === "mulw") {
    let w, n, d;
    do { w = rnd(2, 5); d = rnd(3, 9); n = rnd(1, d - 1); } while (gcd(w * n, d) !== 1);
    const r = `${w * n}/${d}`;
    return { q: "כפל שבר במספר שלם:", en: `${w} × ${n}/${d} = ___`,
      ...opts(r, [`${w * n}/${w * d}`, `${n}/${w * d}`, `${w + n}/${d}`, `${n}/${d}`]),
      ex: `כופלים רק את המונה: ${w} × ${n} = ${w * n}, והמכנה נשאר ${d} → ${r}`,
      scene: { type: "steps", lines: [`${w} × ${n}/${d}`, r] } };
  }
  if (kind === "mulf") {
    let a, b, c, e;
    do { b = rnd(2, 6); e = rnd(2, 6); a = rnd(1, b - 1); c = rnd(1, e - 1); } while (gcd(a * c, b * e) !== 1);
    const r = `${a * c}/${b * e}`;
    return { q: "כפל שברים:", en: `${a}/${b} × ${c}/${e} = ___`,
      ...opts(r, [`${a + c}/${b + e}`, `${a * e}/${b * c}`, `${a * c}/${b + e}`, `${a + c}/${b * e}`]),
      ex: `כופלים מונה במונה ומכנה במכנה: ${a} × ${c} = ${a * c}, ${b} × ${e} = ${b * e} → ${r}`,
      scene: { type: "steps", lines: [`${a}/${b} × ${c}/${e}`, r] } };
  }
  if (kind === "eq") {
    const d = pick([2, 3, 4, 5]), n = rnd(1, d - 1), m = rnd(2, 4);
    return { q: "השלימו שבר שקול:", en: `${n}/${d} = ___/${d * m}`, ...opts(n * m, [n + m, n * m + 1, d * m - n * m, n]),
      ex: `כופלים את המונה ואת המכנה באותו מספר (${m}): ${n} × ${m} = ${n * m}`, scene: { type: "fracbar", den: d, a: n, den2: d * m } };
  }
  if (kind === "simp") {
    const d = pick([4, 6, 8, 9, 10, 12]);
    const f = pick(divisorsOf(d));
    const n = f * rnd(1, d / f - 1);
    const g = gcd(n, d);
    return { q: "צמצמו את השבר:", en: `${n}/${d} = ___`,
      ...opts(`${n / g}/${d / g}`, [`${n}/${d / g}`, `${d / g}/${n / g}`, `1/${d / g}`, `${n / g}/${d}`]),
      ex: `מחלקים את המונה ואת המכנה ב-${g}: ${n} ÷ ${g} = ${n / g}, ${d} ÷ ${g} = ${d / g}`, scene: { type: "fracbar", den: d, a: n, den2: d / g } };
  }
  if (kind === "same") {
    const d = rnd(5, 12), a = rnd(1, d - 3), b = rnd(1, d - a - 1);
    return { q: "חיבור שברים עם אותו מכנה:", en: `${a}/${d} + ${b}/${d} = ___`,
      ...opts(`${a + b}/${d}`, [`${a + b}/${d * 2}`, `${a + b + 1}/${d}`, `${a * b}/${d}`]),
      ex: `המכנה זהה, אז מחברים רק את המונים: ${a} + ${b} = ${a + b} → ${a + b}/${d}`, scene: { type: "fracbar", den: d, a, b } };
  }
  const [d1, d2] = pick([[2, 4], [2, 6], [3, 6], [4, 8], [2, 8], [3, 9], [2, 3], [3, 4]]);
  const L = lcm(d1, d2);
  const n1 = rnd(1, d1 - 1), n2 = rnd(1, d2 - 1);
  const v1 = (n1 * L) / d1, v2 = (n2 * L) / d2;
  if (kind === "minus" && v1 !== v2) {
    const [bn, bd, bv, sn, sd, sv] = v1 > v2 ? [n1, d1, v1, n2, d2, v2] : [n2, d2, v2, n1, d1, v1];
    const r = bv - sv;
    return { q: "חיסור שברים — מכנה משותף:", en: `${bn}/${bd} − ${sn}/${sd} = ___`,
      ...opts(`${r}/${L}`, [`${Math.abs(bn - sn)}/${Math.abs(bd - sd) || L}`, `${r}/${L * 2}`, `${r + 1}/${L}`]),
      ex: `מכנה משותף ${L}: ${bv}/${L} − ${sv}/${L} = ${r}/${L}`, scene: { type: "fracbar", den: L, a: bv, label: `${bv}/${L} − ${sv}/${L} = ${r}/${L}` } };
  }
  return { q: "חיבור שברים — מכנה משותף:", en: `${n1}/${d1} + ${n2}/${d2} = ___`,
    ...opts(`${v1 + v2}/${L}`, [`${n1 + n2}/${d1 + d2}`, `${v1 + v2}/${L * 2}`, `${v1 + v2 + 1}/${L}`]),
    ex: `מכנה משותף ${L}: ${n1}/${d1} = ${v1}/${L}, ${n2}/${d2} = ${v2}/${L} → ${v1 + v2}/${L}`, scene: { type: "fracbar", den: L, a: v1, b: v2 } };
};

// רמה 2 ומטה: השוואה, חיבור ושבר פשוט · רמה 3: גם כפל ב-10 · רמה 4: חיבור עם שתי ספרות אחרי הנקודה
// · רמה 5: גם חיסור וחילוק ב-10 · רמה 6: גם כפל מספר עשרוני במספר שלם
M.decimal = (lv) => {
  const kinds = lv <= 2 ? ["cmp", "add", "conv"] : ["cmp", "add", "mul10", "conv"];
  if (lv >= 5) kinds.push("sub", "div10");
  if (lv >= 6) kinds.push("mulk", "mulk");
  const kind = pick(kinds);
  if (kind === "sub") {
    const a = rnd(300, 999) / 100, b = rnd(100, Math.round(a * 100) - 50) / 100;
    const as = a.toFixed(2), bs = b.toFixed(2), r = round2(a - b), rs = r.toFixed(2);
    return { q: "חיסור מספרים עשרוניים:", en: `${as} − ${bs} = ___`,
      ...opts(rs, [(r + 0.1).toFixed(2), (r - 0.1).toFixed(2), (r + 0.01).toFixed(2)]),
      ex: `מיישרים את הנקודות אחת מתחת לשנייה ומחשבים כרגיל: ${as} − ${bs} = ${rs}`, scene: { type: "column", a: as, b: bs, op: "−" } };
  }
  if (kind === "div10") {
    const a = rnd(11, 999) / 10, r = round2(a / 10);
    return { q: "חילוק ב-10:", en: `${a} ÷ 10 = ___`, ...opts(String(r), [String(round2(a * 10)), String(round2(a / 100)), String(round2(r + 1))]),
      ex: `מחלקים ב-10 → הנקודה זזה ספרה אחת שמאלה: ${a} → ${r}`, scene: { type: "steps", lines: [`${a} ÷ 10`, `${r}`] } };
  }
  if (kind === "mulk") {
    const a = Math.random() < 0.5 ? rnd(2, 9) / 10 : rnd(11, 49) / 10, k = rnd(2, 9), r = round2(a * k), whole = Math.round(a * 10) * k;
    return { q: "כפל מספר עשרוני במספר שלם:", en: `${a} × ${k} = ___`, ...opts(String(r), [String(round2(r * 10)), String(round2(r / 10)), String(round2(r + a))]),
      ex: `מתעלמים מהנקודה: ${Math.round(a * 10)} × ${k} = ${whole}, ומחזירים ספרה אחת אחרי הנקודה → ${r}`,
      scene: { type: "steps", lines: [`${a} × ${k}`, `${Math.round(a * 10)} × ${k} = ${whole}`, `${r}`] } };
  }
  if (kind === "cmp") {
    const a = rnd(2, 9);
    const vals = [`0.${a}`, `0.${a - 1}${rnd(5, 9)}`, `0.0${a}`, `0.${a - 1}${rnd(0, 4)}${rnd(1, 9)}`];
    const o = shuffle(vals);
    return { q: "איזה מספר הכי גדול?", options: o, c: o.indexOf(`0.${a}`),
      ex: `משווים ספרה אחרי ספרה אחרי הנקודה: 0.${a}0 גדול מכל האחרים`,
      scene: { type: "numline", min: 0, max: 1, step: 0.1, marks: vals.map((v) => ({ v: +v, good: v === `0.${a}` })) } };
  }
  if (kind === "add") {
    const d = lv <= 3 ? 1 : 2, unit = 10 ** -d;
    const a = rnd(10, 99) / 10 ** d, b = rnd(10, 99) / 10 ** d;
    const as = a.toFixed(d), bs = b.toFixed(d), r = round2(a + b), rs = r.toFixed(d);
    return { q: "חיבור מספרים עשרוניים:", en: `${as} + ${bs} = ___`,
      ...opts(rs, [(r + 10 * unit).toFixed(d), (r - 10 * unit).toFixed(d), (r + unit).toFixed(d)]),
      ex: `מיישרים את הנקודות אחת מתחת לשנייה ומחברים כרגיל: ${as} + ${bs} = ${rs}`, scene: { type: "column", a: as, b: bs, op: "+" } };
  }
  if (kind === "mul10") {
    const a = rnd(11, 999) / 100, r = round2(a * 10);
    return { q: "כפל ב-10:", en: `${a} × 10 = ___`, ...opts(String(r), [String(round2(a * 100)), String(round2(a / 10)), String(round2(a + 10))]),
      ex: `כופלים ב-10 → הנקודה זזה ספרה אחת ימינה: ${a} → ${r}`, scene: { type: "steps", lines: [`${a} × 10`, `${r}`] } };
  }
  const pairs = [["0.5", "1/2"], ["0.25", "1/4"], ["0.75", "3/4"], ["0.2", "1/5"], ["0.1", "1/10"]];
  const [dv, fv] = pick(pairs);
  return { q: `איזה שבר שווה ל-${dv}?`, ...opts(fv, shuffle(pairs.map((p) => p[1]).filter((x) => x !== fv))), ex: `${dv} = ${fv}`,
    scene: { type: "numline", min: 0, max: 1, step: 0.1, marks: [{ v: +dv, good: true }] } };
};

M.order = (lv) => {
  const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 6);
  const forms = [
    () => ({ expr: `${a} + ${b} × ${c}`, v: a + b * c, w: (a + b) * c, lines: [`${a} + ${b} × ${c}`, `${a} + ${b * c}`, `${a + b * c}`], paren: false }),
    () => ({ expr: `(${a} + ${b}) × ${c}`, v: (a + b) * c, w: a + b * c, lines: [`(${a} + ${b}) × ${c}`, `${a + b} × ${c}`, `${(a + b) * c}`], paren: true }),
    () => {
      const y = b * c, x = y + rnd(3, 20);
      return { expr: `${x} − ${y} ÷ ${c}`, v: x - b, w: x - y, lines: [`${x} − ${y} ÷ ${c}`, `${x} − ${b}`, `${x - b}`], paren: false };
    },
  ];
  if (lv >= 4) forms.push(() => {
    const d = rnd(2, 5);
    const [p, q] = a * b >= c * d ? [[a, b], [c, d]] : [[c, d], [a, b]];
    const v = p[0] * p[1] - q[0] * q[1];
    return { expr: `${p[0]} × ${p[1]} − ${q[0]} × ${q[1]}`, v, w: (p[0] * p[1] - q[0]) * q[1],
      lines: [`${p[0]} × ${p[1]} − ${q[0]} × ${q[1]}`, `${p[0] * p[1]} − ${q[0] * q[1]}`, `${v}`], paren: false };
  });
  if (lv >= 5) forms.push(() => {
    const d = rnd(1, c - 1);
    return { expr: `${a} + ${b} × (${c} − ${d})`, v: a + b * (c - d), w: (a + b) * (c - d),
      lines: [`${a} + ${b} × (${c} − ${d})`, `${a} + ${b} × ${c - d}`, `${a} + ${b * (c - d)}`, `${a + b * (c - d)}`], paren: true };
  });
  // רמה 6: שני זוגות סוגריים
  const twoParens = () => {
    const d = rnd(1, c - 1);
    return { expr: `(${a} + ${b}) × (${c} − ${d})`, v: (a + b) * (c - d), w: a + b * c - d,
      lines: [`(${a} + ${b}) × (${c} − ${d})`, `${a + b} × ${c - d}`, `${(a + b) * (c - d)}`], why: "קודם מה שבתוך כל זוג סוגריים, ואז הכפל" };
  };
  if (lv >= 6) forms.push(twoParens, twoParens);
  const f = pick(forms)();
  const why = f.why || `קודם ${f.paren ? "מה שבסוגריים" : "כפל וחילוק"}, אחר כך חיבור וחיסור`;
  return { q: "פתרו לפי סדר פעולות החשבון:", en: `${f.expr} = ___`, ...opts(f.v, [f.w, f.v + 1, f.v - 1, f.v + 10]),
    ex: `${why}: ${f.lines.join(" = ")}`, scene: { type: "steps", lines: f.lines } };
};

// רמה 3 ומטה: מספרים עגולים (כפולות של 10) · רמה 4: כל מספר · רמה 5: גם משולש שווה שוקיים
// · רמה 6: גם זווית ראש → זוויות בסיס, וסכום הזוויות במרובע (360°)
M.angles = (lv) => {
  const kinds = lv <= 2 ? ["tri", "line", "type"] : ["tri", "tri", "line", "type"];
  if (lv >= 4) kinds.push("comp90", "comp90");
  if (lv >= 5) kinds.push("iso", "iso");
  if (lv >= 6) kinds.push("base", "quad", "quad");
  const kind = pick(kinds);
  const round = lv <= 3; // מספרים עגולים ברמות הנמוכות
  if (kind === "comp90") {
    const A = rnd(15, 75), B = 90 - A;
    return { q: `שתי זוויות משלימות יחד ל-90°. אחת מהן ${A}°. מה גודל השנייה?`, ...opts(B, [180 - A, B + 10, B - 10, A]),
      ex: `זוויות משלימות: 90 − ${A} = ${B}`, scene: { type: "angle", mode: "one", A } };
  }
  if (kind === "iso") {
    const Y = round ? pick([40, 50, 60, 70, 80]) : rnd(25, 85), C = 180 - 2 * Y;
    return { q: `במשולש שווה שוקיים כל אחת מזוויות הבסיס היא ${Y}°. מה גודל זווית הראש?`, ...opts(C, [180 - Y, 90 - Y, Y, C + 10]),
      ex: `שתי זוויות הבסיס שוות: ${Y} + ${Y} = ${2 * Y}, ו-180 − ${2 * Y} = ${C}`, scene: { type: "angle", mode: "tri", A: Y, B: Y, C } };
  }
  if (kind === "base") {
    const X = 2 * rnd(10, 70), Y = (180 - X) / 2;
    return { q: `במשולש שווה שוקיים זווית הראש היא ${X}°. מה גודל כל אחת מזוויות הבסיס?`, ...opts(Y, [180 - X, X, Y + 10, 90 - X / 2 + 5]),
      ex: `מורידים את זווית הראש: 180 − ${X} = ${180 - X}, ומחלקים לשתי זוויות שוות: ${180 - X} ÷ 2 = ${Y}`,
      scene: { type: "steps", lines: [`180 − ${X} = ${180 - X}`, `${180 - X} ÷ 2 = ${Y}`] } };
  }
  if (kind === "quad") {
    const a = rnd(60, 120), b = rnd(60, 120), c = rnd(50, Math.min(130, 340 - a - b)), d = 360 - a - b - c;
    return { q: `במרובע יש זוויות של ${a}°, ${b}° ו-${c}°. מה גודל הזווית הרביעית?`, ...opts(d, [180 - (a + b + c - 180), d + 10, d - 10, 360 - a - b]),
      ex: `סכום הזוויות במרובע הוא 360°: 360 − ${a} − ${b} − ${c} = ${d}`,
      scene: { type: "steps", lines: [`360 − ${a} − ${b} − ${c}`, `${d}`] } };
  }
  if (kind === "tri") {
    const A = round ? 10 * rnd(3, 9) : rnd(30, 90), B = round ? 10 * rnd(2, (150 - A) / 10) : rnd(20, 150 - A), C = 180 - A - B;
    return { q: `במשולש יש זוויות של ${A}° ושל ${B}°. מה גודל הזווית השלישית?`, ...opts(C, [C + 10, C - 10, 360 - A - B, 90]),
      ex: `סכום הזוויות במשולש הוא 180°: 180 − ${A} − ${B} = ${C}`, scene: { type: "angle", mode: "tri", A, B, C } };
  }
  if (kind === "line") {
    const A = rnd(25, 155), B = 180 - A;
    return { q: `שתי זוויות צמודות על קו ישר. אחת מהן ${A}°. מה גודל השנייה?`, ...opts(B, [B + 10, B - 10, 360 - A, Math.abs(90 - A) || B + 20]),
      ex: `זוויות צמודות על קו ישר משלימות ל-180°: 180 − ${A} = ${B}`, scene: { type: "angle", mode: "line", A, B } };
  }
  const A = pick([30, 45, 60, 90, 120, 135, 150, 180]);
  const name = A < 90 ? "חדה" : A === 90 ? "ישרה" : A < 180 ? "קהה" : "שטוחה";
  return { q: `איך נקראת זווית של ${A}°?`, ...opts(name, ["חדה", "ישרה", "קהה", "שטוחה"]),
    ex: "חדה — פחות מ-90°, ישרה — בדיוק 90°, קהה — בין 90° ל-180°, שטוחה — בדיוק 180°", scene: { type: "angle", mode: "one", A } };
};

// רמה 3 ומטה: ממוצע והסתברות · רמה 4: גם טווח ומספרים גדולים · רמה 5: גם הסיכוי שלא יקרה, וחציון
// · רמה 6: גם מציאת המספר החסר לפי ממוצע נתון
M.stats = (lv) => {
  const kinds = lv <= 2 ? ["avg", "prob"] : ["avg", "prob", "range"];
  if (lv >= 5) kinds.push("noprob", "median");
  if (lv >= 6) kinds.push("missing", "missing");
  const kind = pick(kinds);
  if (kind === "noprob") {
    const r = rnd(1, 5), b = rnd(1, 5), g = rnd(0, 4), t = r + b + g, rest = t - r;
    return { q: `בשקית ${r} כדורים אדומים, ${b} כחולים${g ? ` ו-${g} ירוקים` : ""}. מה הסיכוי להוציא כדור שאינו אדום?`,
      ...opts(`${rest}/${t}`, [`${r}/${t}`, `${rest}/${rest + 1}`, `1/${t}`, `${b}/${t}`]),
      ex: `${rest} כדורים אינם אדומים מתוך ${t} כדורים → ${rest}/${t}`,
      scene: { type: "items", items: shuffle([...Array(r).fill("🔴"), ...Array(b).fill("🔵"), ...Array(g).fill("🟢")]), hl: "🔴" } };
  }
  if (kind === "median") {
    const vals = [];
    while (vals.length < 5) {
      const v = rnd(2, 40);
      if (!vals.includes(v)) vals.push(v);
    }
    const sorted = [...vals].sort((x, y) => x - y), med = sorted[2];
    return { q: `מסדרים את המספרים ${vals.join(", ")} לפי הגודל. מה המספר האמצעי (החציון)?`,
      ...opts(med, [sorted[0], sorted[4], Math.round(vals.reduce((x, y) => x + y, 0) / 5)]),
      ex: `מסדרים לפי הגודל: ${sorted.join(", ")} — והמספר האמצעי הוא ${med}`, scene: { type: "bars", vals } };
  }
  if (kind === "missing") {
    const k = 4, avg = rnd(10, 20), sum = avg * k;
    // שלושה מספרים סביב הממוצע — כך שהמספר הרביעי תמיד יוצא חיובי והגיוני
    const first = [rnd(-3, 3), rnd(-3, 3), rnd(-3, 3)].map((d) => avg + d);
    const last = sum - first.reduce((x, y) => x + y, 0);
    return { q: `הממוצע של ${k} מספרים הוא ${avg}. שלושה מהם הם ${first.join(", ")}. מה המספר הרביעי?`,
      ...opts(last, [avg, sum, last + 1, last - 1]),
      ex: `הסכום של כולם: ${k} × ${avg} = ${sum}. פחות מה שיש: ${sum} − ${first.join(" − ")} = ${last}`,
      scene: { type: "steps", lines: [`${k} × ${avg} = ${sum}`, `${sum} − ${first.join(" − ")}`, `${last}`] } };
  }
  if (kind === "prob") {
    const r = rnd(1, 5), b = rnd(1, 5), g = rnd(0, 4), t = r + b + g;
    return { q: `בשקית ${r} כדורים אדומים, ${b} כחולים${g ? ` ו-${g} ירוקים` : ""}. מה הסיכוי להוציא כדור אדום?`,
      ...opts(`${r}/${t}`, [`${r}/${t - r || t + 1}`, `${b}/${t}`, `1/${t}`, `${r}/${t + 1}`]), ex: `${r} כדורים אדומים מתוך ${t} כדורים → ${r}/${t}`,
      scene: { type: "items", items: shuffle([...Array(r).fill("🔴"), ...Array(b).fill("🔵"), ...Array(g).fill("🟢")]), hl: "🔴" } };
  }
  const k = rnd(3, lv <= 3 ? 4 : 5);
  const vals = Array.from({ length: k }, () => rnd(2, lv <= 3 ? 12 : 40));
  if (kind === "range") {
    const mx = Math.max(...vals), mn = Math.min(...vals), r = mx - mn;
    return { q: `מה הטווח של המספרים ${vals.join(", ")}?`, ...opts(r, [mx, r + 1, mn]),
      ex: `טווח = הגדול פחות הקטן: ${mx} − ${mn} = ${r}`, scene: { type: "bars", vals } };
  }
  const sum0 = vals.reduce((x, y) => x + y, 0), fix = (k - (sum0 % k)) % k;
  vals[0] += fix;
  const sum = sum0 + fix, avg = sum / k;
  return { q: `מה הממוצע של המספרים ${vals.join(", ")}?`, ...opts(avg, [avg + 1, avg - 1, sum, Math.max(...vals)]),
    ex: `מחברים: ${vals.join(" + ")} = ${sum}, ומחלקים ב-${k}: ${sum} ÷ ${k} = ${avg}`, scene: { type: "bars", vals, avg } };
};

// ---------- כיתות ו'–ט' ----------

// רמה 3 ומטה: אחוז ממספר והנחה · רמה 4: גם "כמה אחוזים" · רמה 5: גם ייקור ואחוזים שאינם עגולים (15%, 35%)
// · רמה 6: גם הכיוון ההפוך — מהחלק אל השלם
M.percent = (lv) => {
  const kinds = lv <= 3 ? ["of", "of", "disc"] : ["of", "disc", "what"];
  if (lv >= 5) kinds.push("inc", "inc");
  if (lv >= 6) kinds.push("rev", "rev");
  const kind = pick(kinds);
  const barOf = (p) => (p % 25 === 0 ? { den: 4, a: p / 25 } : { den: 10, a: Math.round(p / 10) });
  if (kind === "inc") {
    const price = pick([80, 120, 160, 200, 240]), p = pick([10, 20, 25, 50]), up = (price * p) / 100, r = price + up;
    return { q: `מחיר של ${price} שקלים עלה ב-${p}%. מה המחיר החדש?`, ...opts(r, [up, price - up, r + 10, price + p]),
      ex: `${p}% מ-${price} = ${up}, ומוסיפים למחיר: ${price} + ${up} = ${r}`,
      scene: { type: "steps", lines: [`${p}% מ-${price} = ${up}`, `${price} + ${up}`, `${r}`] } };
  }
  if (kind === "rev") {
    const p = pick([10, 20, 25, 50]), whole = pick([40, 60, 80, 120, 200]), part = (whole * p) / 100;
    return { q: `בכיתה ${part} ילדים, והם ${p}% מכל התלמידים בשכבה. כמה תלמידים יש בשכבה?`,
      ...opts(whole, [part * 2, part + p, whole / 2, part * 10]),
      ex: `אם ${p}% הם ${part}, אז 100% הם ${part} ÷ ${p} × 100 = ${whole}`,
      scene: { type: "steps", lines: [`${p}% = ${part}`, `100% = ${part} ÷ ${p} × 100`, `${whole}`] } };
  }
  if (kind === "of") {
    const p = pick(lv >= 5 ? [10, 15, 20, 25, 35, 50, 75] : [10, 20, 25, 50, 75]);
    const base = pick(p % 25 === 0 ? [40, 60, 80, 120, 200] : [20, 40, 60, 80, 120, 200]);
    const r = (base * p) / 100;
    return { q: `כמה זה ${p}% מ-${base}?`, ...opts(r, [base - r, r * 2, p, r + 10]),
      ex: `${p}% פירושו ${p} מתוך 100: ${base} ÷ 100 × ${p} = ${r}`, scene: { type: "fracbar", ...barOf(p), label: `${p}% מ-${base} = ${r}` } };
  }
  if (kind === "disc") {
    const price = pick([80, 120, 160, 200, 240]), p = pick([10, 20, 25, 50]), off = (price * p) / 100, pay = price - off;
    return { q: `חולצה עולה ${price} שקלים, ויש הנחה של ${p}%. כמה משלמים?`, ...opts(pay, [off, price - p, price + off, pay + 10]),
      ex: `${p}% מ-${price} = ${off}, ומורידים: ${price} − ${off} = ${pay}`,
      scene: { type: "fracbar", den: barOf(p).den, a: barOf(p).den - barOf(p).a, label: `משלמים ${100 - p}% = ${pay}` } };
  }
  const p = pick([10, 20, 25, 50, 75]), whole = pick([20, 40, 60, 80, 200]), part = (whole * p) / 100;
  return { q: `${part} מתוך ${whole} — כמה אחוזים זה?`, ...opts(`${p}%`, [`${p * 2 > 100 ? p / 2 : p * 2}%`, `${part}%`, `${100 - p}%`]),
    ex: `${part} ÷ ${whole} = ${p / 100} = ${p}%`, scene: { type: "steps", lines: [`${part} ÷ ${whole}`, `${p / 100}`, `${p}%`] } };
};

function coprimePair() {
  const a = rnd(1, 4);
  let b = rnd(a + 1, 7);
  for (let i = 0; gcd(a, b) > 1 && i < 20; i++) b = rnd(a + 1, 7);
  return gcd(a, b) > 1 ? [1, b] : [a, b];
}

// רמה 4 ומטה: צמצום יחס ושאלת קנה מידה · רמה 5: גם חלוקה ביחס · רמה 6: גם חלוקה ביחס של שלושה חלקים
M.ratio = (lv) => {
  const kinds = lv <= 4 ? ["scale", "scale", "simp"] : ["split", "scale", "simp"];
  if (lv >= 6) kinds.push("split3", "split3");
  const kind = pick(kinds);
  if (kind === "split3") {
    const [a, b] = coprimePair(), c = rnd(1, 5), unit = rnd(2, 5), sum = a + b + c, total = sum * unit;
    const mx = Math.max(a, b, c), mn = Math.min(a, b, c);
    return { q: `מחלקים ${total} מדבקות ביחס ${a}:${b}:${c}. כמה מדבקות מקבל החלק הגדול ביותר?`,
      ...opts(mx * unit, [mn * unit, unit, total - mx * unit, mx + unit]),
      ex: `${a} + ${b} + ${c} = ${sum} חלקים. ${total} ÷ ${sum} = ${unit} בכל חלק → ${mx} × ${unit} = ${mx * unit}`,
      scene: { type: "steps", lines: [`${total} ÷ ${sum} = ${unit}`, `${mx} × ${unit} = ${mx * unit}`] } };
  }
  if (kind === "split") {
    const [a, b] = coprimePair(), unit = rnd(2, 6), total = (a + b) * unit;
    return { q: `מחלקים ${total} סוכריות ביחס ${a}:${b}. כמה סוכריות מקבל הצד הראשון?`, ...opts(a * unit, [b * unit, unit, a + unit, total - b]),
      ex: `${a} + ${b} = ${a + b} חלקים. ${total} ÷ ${a + b} = ${unit} בכל חלק → ${a} × ${unit} = ${a * unit}`, scene: { type: "ratio", a, b, unit } };
  }
  if (kind === "scale") {
    const k = rnd(2, 5), m = rnd(2, 4);
    let t = rnd(2, 10);
    if (t === k) t += 1;
    return { q: `כדי להכין ${k} עוגות צריך ${k * m} ביצים. כמה ביצים צריך ל-${t} עוגות?`, ...opts(t * m, [t * m + k, k * m + t, t + m]),
      ex: `לעוגה אחת: ${k * m} ÷ ${k} = ${m} ביצים. ל-${t} עוגות: ${t} × ${m} = ${t * m}`,
      scene: { type: "steps", lines: [`${k} → ${k * m}`, `1 → ${m}`, `${t} → ${t * m}`] } };
  }
  const [a, b] = coprimePair(), f = rnd(2, 5);
  return { q: "צמצמו את היחס:", en: `${a * f}:${b * f} = ___`, ...opts(`${a}:${b}`, [`${b}:${a}`, `${a + 1}:${b + 1}`, `${a * f}:${b}`]),
    ex: `מחלקים את שני המספרים ב-${f}: ${a * f} ÷ ${f} = ${a}, ${b * f} ÷ ${f} = ${b}`,
    scene: { type: "steps", lines: [`${a * f}:${b * f}`, `(${a * f} ÷ ${f}):(${b * f} ÷ ${f})`, `${a}:${b}`] } };
};

// רמה 4 ומטה: חיבור, חיסור, כפל והשוואה · רמה 5: גם חיסור של מספר שלילי וחילוק · רמה 6: גם ביטוי בן שלושה שלבים
M.neg = (lv) => {
  const kinds = lv <= 2 ? ["add", "sub", "cmp"] : ["add", "sub", "mul", "cmp"];
  if (lv >= 5) kinds.push("minusneg", "divneg");
  if (lv >= 6) kinds.push("three", "three");
  const kind = pick(kinds);
  if (kind === "minusneg") {
    const a = rnd(-6, 8), b = rnd(2, 9), r = a + b;
    return { q: "חיסור של מספר שלילי:", en: `${show(a)} − (${show(-b)}) = ___`, ...opts(r, [a - b, -r, r + 1, b - a]),
      ex: `מינוס של מינוס הופך לפלוס: ${show(a)} + ${b} = ${show(r)}`,
      scene: { type: "numline", min: Math.min(a, r) - 1, max: Math.max(a, r) + 1, hop: { from: a, to: r } } };
  }
  if (kind === "divneg") {
    const x = rnd(2, 9), y = rnd(2, 6), sx = pick([-1, 1]), sy = sx === 1 ? -1 : pick([-1, 1]);
    const A = x * y * sx, B = y * sy, r = A / B;
    return { q: "חילוק מספרים מכוונים:", en: `(${show(A)}) ÷ (${show(B)}) = ___`, ...opts(r, [-r, r + 1, A - B]),
      ex: `${sx === sy ? "מינוס חלקי מינוס זה פלוס" : "סימנים שונים נותנים מינוס"}: ${x * y} ÷ ${y} = ${x} → ${show(r)}`,
      scene: { type: "steps", lines: [`(${show(A)}) ÷ (${show(B)})`, `${sx === sy ? "+" : "−"}(${x * y} ÷ ${y})`, show(r)] } };
  }
  if (kind === "three") {
    const a = rnd(2, 9), b = rnd(2, 6), c = rnd(2, 9), r = -(a * b) + c;
    return { q: "שלושה שלבים:", en: `(${show(-a)}) × ${b} + ${c} = ___`, ...opts(r, [a * b + c, -(a * b) - c, r + 1, r - 1]),
      ex: `קודם הכפל: ${show(-a)} × ${b} = ${show(-a * b)}, ואז ${show(-a * b)} + ${c} = ${show(r)}`,
      scene: { type: "steps", lines: [`(${show(-a)}) × ${b} + ${c}`, `${show(-a * b)} + ${c}`, show(r)] } };
  }
  if (kind === "add") {
    const a = rnd(-9, -1), b = rnd(2, 12), r = a + b;
    return { q: "חיבור עם מספר שלילי:", en: `${show(a)} + ${b} = ___`, ...opts(r, [-r, a - b, r + 1, b]),
      ex: `מתחילים ב-${show(a)} וזזים ${b} צעדים ימינה על ישר המספרים → ${show(r)}`,
      scene: { type: "numline", min: Math.min(a, r) - 1, max: Math.max(a, r) + 1, hop: { from: a, to: r } } };
  }
  if (kind === "sub") {
    const a = rnd(1, 6), b = rnd(a + 1, 12), r = a - b;
    return { q: "חיסור שנותן מספר שלילי:", en: `${a} − ${b} = ___`, ...opts(r, [-r, r - 1, r + 1, b - a + 1]),
      ex: `מתחילים ב-${a} וזזים ${b} צעדים שמאלה → ${show(r)}`, scene: { type: "numline", min: r - 1, max: a + 1, hop: { from: a, to: r } } };
  }
  if (kind === "mul") {
    const x = rnd(2, 9), y = rnd(2, 9), sx = pick([-1, 1]), sy = sx === 1 ? -1 : pick([-1, 1]);
    const A = x * sx, B = y * sy, r = A * B;
    const rule = sx === sy ? "מינוס כפול מינוס זה פלוס" : "מינוס כפול פלוס זה מינוס";
    return { q: "כפל מספרים מכוונים:", en: `(${show(A)}) × (${show(B)}) = ___`, ...opts(r, [-r, A + B, r + 1]),
      ex: `${rule}: ${x} × ${y} = ${x * y} → ${show(r)}`,
      scene: { type: "steps", lines: [`(${show(A)}) × (${show(B)})`, `${sx === sy ? "+" : "−"}(${x} × ${y})`, show(r)] } };
  }
  const uniq = [];
  while (uniq.length < 4) {
    const v = rnd(-12, 4);
    if (!uniq.includes(v)) uniq.push(v);
  }
  if (!uniq.some((v) => v < 0)) uniq[0] = -rnd(1, 9);
  const best = Math.max(...uniq);
  return { q: "איזה מספר הכי גדול?", options: uniq.map(show), c: uniq.indexOf(best),
    ex: `על ישר המספרים, מה שיותר ימינה גדול יותר — ${show(best)} הכי ימני`,
    scene: { type: "numline", min: Math.min(...uniq) - 1, max: Math.max(...uniq) + 1, marks: uniq.map((v) => ({ v, good: v === best })) } };
};

// רמה 4 ומטה: x + a = b, ax = b, שני שלבים והצבה · רמה 5: גם ax − c = b · רמה 6: גם x משני צדי המשוואה
M.algebra = (lv) => {
  const kinds = lv <= 2 ? ["plus", "times"] : ["plus", "times", "two", "eval"];
  if (lv >= 5) kinds.push("minus", "minus");
  if (lv >= 6) kinds.push("both", "both");
  const kind = pick(kinds);
  if (kind === "minus") {
    const a = rnd(2, 6), x = rnd(2, 9), c = rnd(1, 12), b = a * x - c;
    return { q: "מצאו את x:", en: `${a}x − ${c} = ${b}`, ...opts(x, [b - c, round2((b - c) / a), x + 1, x - 1]),
      ex: `מוסיפים ${c} לשני הצדדים: ${a}x = ${b + c}, ואז מחלקים ב-${a}: x = ${x}`,
      scene: { type: "steps", lines: [`${a}x − ${c} = ${b}`, `${a}x = ${b + c}`, `x = ${x}`] } };
  }
  if (kind === "both") {
    const x = rnd(2, 9), d = rnd(1, 4), a = d + rnd(2, 5), c = rnd(1, 9), e = (a - d) * x + c;
    return { q: "מצאו את x:", en: `${a}x + ${c} = ${d}x + ${e}`, ...opts(x, [e - c, x + 1, round2(e / a), x - 1]),
      ex: `מעבירים את ה-x לצד אחד: ${a - d}x + ${c} = ${e}, ואז ${a - d}x = ${e - c}, ולכן x = ${x}`,
      scene: { type: "steps", lines: [`${a}x + ${c} = ${d}x + ${e}`, `${a - d}x = ${e - c}`, `x = ${x}`] } };
  }
  if (kind === "plus") {
    const x = rnd(2, 15), a = rnd(2, 15), b = x + a;
    return { q: "מצאו את x:", en: `x + ${a} = ${b}`, ...opts(x, [b + a, a, b, x + 1]),
      ex: `מורידים ${a} משני הצדדים: x = ${b} − ${a} = ${x}`, scene: { type: "balance", lx: 1, ln: a, rn: b, x } };
  }
  if (kind === "times") {
    const a = rnd(2, 6), x = rnd(2, 9), b = a * x;
    return { q: "מצאו את x:", en: `${a}x = ${b}`, ...opts(x, [b - a, b + a, a, x + 1]),
      ex: `מחלקים את שני הצדדים ב-${a}: x = ${b} ÷ ${a} = ${x}`, scene: { type: "balance", lx: a, ln: 0, rn: b, x } };
  }
  if (kind === "two") {
    const a = rnd(2, 5), x = rnd(2, 9), c = rnd(1, 12), b = a * x + c;
    return { q: "מצאו את x:", en: `${a}x + ${c} = ${b}`, ...opts(x, [round2((b + c) / a), b - c, x + 1, x - 1]),
      ex: `קודם מורידים ${c} משני הצדדים: ${a}x = ${b - c}, ואז מחלקים ב-${a}: x = ${x}`, scene: { type: "balance", lx: a, ln: c, rn: b, x } };
  }
  const k = rnd(2, 6), m = rnd(1, 9), v = rnd(2, 8), r = k * v + m;
  return { q: `מה הערך של הביטוי ${k}a + ${m} כאשר a = ${v}?`, ...opts(r, [k + v + m, k * (v + m), r + k]),
    ex: `מציבים ${v} במקום a: ${k} × ${v} + ${m} = ${k * v} + ${m} = ${r}`,
    scene: { type: "steps", lines: [`${k}a + ${m}`, `${k} × ${v} + ${m}`, `${k * v} + ${m}`, `${r}`] } };
};

const SUP = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };
// רמה 4 ומטה: ריבוע, שורש, חזקה שלישית וחזקות של 10 · רמה 5: גם ריבוע של מספר שלילי ומספרים גדולים יותר
// · רמה 6: גם הערכת שורש בין שני מספרים שלמים
M.powers = (lv) => {
  const kinds = lv <= 2 ? ["sq", "root"] : ["sq", "root", "cube", "ten"];
  if (lv >= 5) kinds.push("negsq", "negsq");
  if (lv >= 6) kinds.push("between", "between");
  const kind = pick(kinds);
  if (kind === "negsq") {
    const n = rnd(2, 12), r = n * n;
    return { q: "חזקה של מספר שלילי:", en: `(${show(-n)})² = ___`, ...opts(r, [-r, 2 * n, -2 * n, r + n]),
      ex: `מינוס כפול מינוס זה פלוס: ${show(-n)} × ${show(-n)} = ${r}`,
      scene: { type: "steps", lines: [`(${show(-n)})²`, `(${show(-n)}) × (${show(-n)})`, `${r}`] } };
  }
  if (kind === "between") {
    const n = rnd(2, 12), base = n * n, v = base + rnd(1, 2 * n);
    return { q: `בין אילו שני מספרים שלמים נמצא השורש של ${v}?`,
      ...opts(`${n} ל-${n + 1}`, [`${n - 1} ל-${n}`, `${n + 1} ל-${n + 2}`, `${n + 2} ל-${n + 3}`]),
      ex: `${n} × ${n} = ${base}, ו-${n + 1} × ${n + 1} = ${(n + 1) * (n + 1)}. ${v} נמצא ביניהם`,
      scene: { type: "steps", lines: [`${n} × ${n} = ${base}`, `${n + 1} × ${n + 1} = ${(n + 1) * (n + 1)}`] } };
  }
  if (kind === "sq") {
    const n = rnd(2, lv <= 3 ? 10 : lv >= 5 ? 20 : 15), r = n * n;
    return { q: "חזקה שנייה (בריבוע):", en: `${n}² = ___`, ...opts(r, [2 * n, r + n, (n + 1) * (n + 1)]),
      ex: `${n}² = ${n} × ${n} = ${r}`, scene: { type: "array", rows: n, cols: n } };
  }
  if (kind === "root") {
    const n = rnd(2, lv >= 5 ? 20 : 12), s = n * n;
    return { q: "שורש ריבועי:", en: `√${s} = ___`, ...opts(n, [n + 1, n - 1, 2 * n, s / 2]),
      ex: `${n} × ${n} = ${s}, לכן √${s} = ${n}`, scene: { type: "steps", lines: [`√${s}`, `? × ? = ${s}`, `${n} × ${n} = ${s}`, `${n}`] } };
  }
  if (kind === "cube") {
    const n = rnd(2, 5), r = n ** 3;
    return { q: "חזקה שלישית:", en: `${n}³ = ___`, ...opts(r, [3 * n, n * n, r + n]),
      ex: `${n}³ = ${n} × ${n} × ${n} = ${r}`, scene: { type: "steps", lines: [`${n}³`, `${n} × ${n} × ${n}`, `${n * n} × ${n}`, `${r}`] } };
  }
  const k = rnd(2, 6), r = 10 ** k;
  return { q: "חזקות של 10:", en: `10${SUP[k]} = ___`, ...opts(r, [10 * k, 10 ** (k - 1), 10 ** (k + 1)]),
    ex: `10${SUP[k]} = 1 ואחריו ${k} אפסים = ${r}`, scene: { type: "steps", lines: [`10${SUP[k]}`, Array(k).fill("10").join(" × "), `${r}`] } };
};

// רמה 4 ומטה: רק חישוב יתר, עם השלשות המוכרות · רמה 5: גם ניצב חסר · רמה 6: גם בעיות מילוליות (סולם, אלכסון)
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]];
M.pyth = (lv = 5) => {
  const [p, q, h] = pick(TRIPLES);
  if (lv >= 6 && Math.random() < 0.5) {
    if (Math.random() < 0.5) {
      return { q: `סולם באורך ${h} מטרים נשען על קיר. המרחק בין תחתית הסולם לקיר הוא ${p} מטרים. לאיזה גובה מגיע הסולם?`,
        ...opts(q, [h - p, q + 1, h + p, p + q]),
        ex: `${h}² − ${p}² = ${h * h} − ${p * p} = ${q * q}, והגובה הוא ${q}`,
        scene: { type: "angle", mode: "right", a: p, b: q, c: h, missing: "b" } };
    }
    return { q: `מלבן שאורכו ${q} ורוחבו ${p}. מה אורך האלכסון שלו?`, ...opts(h, [p + q, h + 1, q - p, h * 2]),
      ex: `האלכסון הוא היתר במשולש ישר זווית: ${p}² + ${q}² = ${p * p} + ${q * q} = ${h * h}, והאלכסון ${h}`,
      scene: { type: "angle", mode: "right", a: p, b: q, c: h, missing: "c" } };
  }
  if (lv <= 4 || Math.random() < 0.6) {
    return { q: `במשולש ישר זווית הניצבים הם ${p} ו-${q}. מה אורך היתר?`, ...opts(h, [p + q, h + 1, h * h, h - 1]),
      ex: `${p}² + ${q}² = ${p * p} + ${q * q} = ${h * h}, והיתר = √${h * h} = ${h}`, scene: { type: "angle", mode: "right", a: p, b: q, c: h, missing: "c" } };
  }
  return { q: `במשולש ישר זווית היתר ${h} וניצב אחד ${p}. מה אורך הניצב השני?`, ...opts(q, [h - p, q + 1, h + p, q - 1]),
    ex: `${h}² − ${p}² = ${h * h} − ${p * p} = ${q * q}, והניצב = √${q * q} = ${q}`, scene: { type: "angle", mode: "right", a: p, b: q, c: h, missing: "b" } };
};

const lin = (m, b) => `y = ${m === 1 ? "" : m === -1 ? "−" : m}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
// רמה 4 ומטה: ערך, שיפוע ונקודת חיתוך עם ציר y · רמה 5: גם שיפוע משתי נקודות · רמה 6: גם חיתוך עם ציר x
M.linear = (lv) => {
  const m = rnd(1, 3) * (lv >= 4 && Math.random() < 0.3 ? -1 : 1);
  const b = rnd(-4, 5) || 1;
  const kinds = ["value", "slope", "icept"];
  if (lv >= 5) kinds.push("twopts", "twopts");
  if (lv >= 6) kinds.push("xzero", "xzero");
  const kind = pick(kinds);
  if (kind === "twopts") {
    const x1 = rnd(0, 2), x2 = x1 + rnd(1, 3), y1 = m * x1 + b, y2 = m * x2 + b;
    return { q: `ישר עובר בנקודות (${x1}, ${show(y1)}) ו-(${x2}, ${show(y2)}). מה השיפוע שלו?`,
      ...opts(m, [-m, m + 1, y2 - y1, x2 - x1]),
      ex: `שיפוע = ההפרש ב-y חלקי ההפרש ב-x: (${show(y2)} − ${show(y1)}) ÷ (${x2} − ${x1}) = ${show(y2 - y1)} ÷ ${x2 - x1} = ${show(m)}`,
      scene: { type: "graph", m, b, pts: [[x1, y1], [x2, y2]] } };
  }
  if (kind === "xzero") {
    const mm = rnd(1, 3), k = rnd(1, 4), bb = -mm * k;
    return { q: "מה ערכו של x בנקודה שבה הישר חותך את ציר ה-x?", en: lin(mm, bb), ...opts(k, [-k, bb, mm, k + 1]),
      ex: `מציבים y = 0: ${mm}x = ${mm * k}, ולכן x = ${k}`, scene: { type: "graph", m: mm, b: bb } };
  }
  if (kind === "value") {
    const x = rnd(0, 3), y = m * x + b;
    return { q: `מה ערכו של y כאשר x = ${x}?`, en: lin(m, b), ...opts(y, [m + x + b, m * (x + b), y + 1, y - m]),
      ex: `מציבים x = ${x}: y = ${m} × ${x} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${show(y)}`, scene: { type: "graph", m, b, x } };
  }
  if (kind === "slope") {
    const ys = [0, 1, 2].map((x) => m * x + b);
    return { q: `כש-x שווה 0, 1, 2 — הערכים של y הם ${ys.map(show).join(", ")}. מה השיפוע של הישר?`, ...opts(m, [b, m + 1, ys[2], -m]),
      ex: `בכל צעד x גדל ב-1, ו-y משתנה ב-${show(m)} → השיפוע ${show(m)}`, scene: { type: "graph", m, b, pts: [0, 1, 2].map((x) => [x, m * x + b]) } };
  }
  return { q: "באיזו נקודה הישר חותך את ציר ה-y?", en: lin(m, b), ...opts(b, [m, -b, b + m]),
    ex: `כש-x = 0 נשאר רק המספר החופשי: y = ${show(b)}`, scene: { type: "graph", m, b, x: 0 } };
};

// שאלה אחת לנושא (או null אם אין מחולל לנושא הזה)
export function genMathTopic(topicId, level) {
  const g = M[topicId];
  return g ? g(Math.max(1, Math.min(6, level || 1))) : null;
}

export const MATH_TOPIC_IDS = Object.keys(M);
