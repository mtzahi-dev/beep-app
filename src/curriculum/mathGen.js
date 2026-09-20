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

M.add = (lv) => {
  if (lv <= 2) {
    const a = rnd(1, 6), b = rnd(1, Math.min(5, 10 - a));
    const item = pick(["🍎", "🎈", "⭐", "🍪", "⚽", "🐤", "🍓", "🚗"]);
    return { q: "כמה יש ביחד?", en: `${a} + ${b} = ___`, ...opts(a + b, [a + b + 1, a + b - 1, a, b + 2]),
      ex: `${a} + ${b} = ${a + b} — סופרים את כולם יחד`, scene: { type: "add", a, b, item } };
  }
  const a = rnd(6, 9), b = rnd(11 - a, 9), need = 10 - a;
  return { q: "חיבור עם מעבר עשר:", en: `${a} + ${b} = ___`, ...opts(a + b, [a + b - 1, a + b + 1, a + b - 10, a + b + 10]),
    ex: `${a} + ${need} = 10, ונשאר עוד ${b - need} → ${a + b}`, scene: { type: "ten", a, b, eq: `${a} + ${b} = ${a + b}` } };
};

M.sub = (lv) => {
  if (lv <= 2) {
    const a = rnd(4, 10), b = rnd(1, a - 1);
    const item = pick(["🎈", "🍎", "🐦", "🍪"]);
    return { q: "כמה נשארו?", en: `${a} − ${b} = ___`, ...opts(a - b, [a - b + 1, a - b - 1, a + b, b]),
      ex: `היו ${a}, הלכו ${b}, ונשארו ${a - b}`, scene: { type: "sub", a, b, item } };
  }
  const a = rnd(11, 18), b = rnd(a - 9, 9);
  return { q: "חיסור בעזרת השלמה:", en: `${a} − ${b} = ___`, ...opts(a - b, [a - b + 1, a - b - 1, a + b, 10 - b]),
    ex: `שואלים: כמה צריך להוסיף ל-${b} כדי להגיע ל-${a}? ${b} + ${a - b} = ${a}`, scene: { type: "hops", from: b, to: a } };
};

const PLACE_NAMES = ["היחידות", "העשרות", "המאות", "האלפים"];
M.place = (lv) => {
  const n = lv <= 2 ? rnd(12, 99) : lv <= 4 ? rnd(102, 999) : rnd(1002, 9999);
  const ds = String(n).split("").map(Number).reverse();
  const pos = rnd(0, ds.length - 1);
  const d = ds[pos];
  const val = d * 10 ** pos;
  const parts = ds.map((x, i) => `${x} ${PLACE_NAMES[i].slice(1)}`).reverse().join(", ");
  const scene = n <= 999 ? { type: "placevalue", n }
    : { type: "steps", lines: [String(n), ds.map((x, i) => x * 10 ** i).reverse().filter(Boolean).join(" + ")] };
  if (d === 0 || Math.random() < 0.5) {
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
  if (kind === "add") {
    const a = rnd(3, big ? 60 : 12), b = rnd(2, big ? 40 : 8), r = a + b;
    return { q: `ל${name} יש ${a} ${it.he}. ${f ? "היא קיבלה" : "הוא קיבל"} עוד ${b}. כמה ${it.he} יש ${f ? "לה" : "לו"} עכשיו?`,
      ...opts(r, [r + 1, r - 1, Math.abs(a - b), r + 10]), ex: `"קיבל עוד" = חיבור: ${a} + ${b} = ${r}`,
      scene: r <= 20 ? { type: "add", a, b, item: it.e } : { type: "blocks", a, b, op: "+" } };
  }
  if (kind === "sub") {
    const a = rnd(big ? 25 : 6, big ? 90 : 15), b = rnd(2, a - 1), r = a - b;
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

M.mul = (lv) => {
  const a = rnd(2, lv <= 2 ? 5 : 10), b = rnd(2, 10), r = a * b;
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

M.addbig = (lv) => {
  const digits = lv <= 2 ? 2 : lv <= 4 ? 3 : 4;
  const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
  const unit = digits === 2 ? 10 : 100;
  const kind = pick(["add", "add", "sub", "sub", "comp", "est"]);
  if (kind === "comp") {
    const base = rnd(2, 8) * unit, gap = rnd(1, 3), a = base - gap, b = rnd(lo, hi), r = a + b;
    return { q: "חשבון חכם — עיגול ופיצוי:", en: `${a} + ${b} = ___`, ...opts(r, [r + gap, r - gap, base + b, r + 10]),
      ex: `${a} זה ${base} פחות ${gap}: ${base} + ${b} = ${base + b}, ואז מורידים ${gap} → ${r}`,
      scene: { type: "steps", lines: [`${a} + ${b}`, `${base} + ${b} − ${gap}`, `${base + b} − ${gap}`, `${r}`] } };
  }
  if (kind === "est") {
    const a = rnd(lo, hi), b = rnd(lo, hi);
    const ra = Math.round(a / unit) * unit, rb = Math.round(b / unit) * unit, r = ra + rb;
    return { q: `בערך כמה זה ${a} + ${b}?`, ...opts(r, [r + unit, r - unit, r + 2 * unit, r - 2 * unit]),
      ex: `מעגלים: ${a} בערך ${ra}, ${b} בערך ${rb} → בערך ${r}`,
      scene: { type: "steps", lines: [`${a} + ${b}`, `≈ ${ra} + ${rb}`, `≈ ${r}`] } };
  }
  const add = kind === "add";
  let a = rnd(lo, hi), b = rnd(lo, hi);
  if (!add && b > a) [a, b] = [b, a];
  const r = add ? a + b : a - b;
  return { q: add ? "חיבור במאונך:" : "חיסור במאונך:", en: `${a} ${add ? "+" : "−"} ${b} = ___`,
    ...opts(r, add ? [r - 10, r + 10, r - 100, r + 1] : [r + 10, r - 10, r + 100, r - 1].filter((x) => x >= 0)),
    ex: columnHint(a, b, add), scene: { type: "column", a, b, op: add ? "+" : "−" } };
};

M.frac = (lv) => {
  const kind = pick(lv <= 2 ? ["pie", "of"] : ["pie", "of", "cmp"]);
  if (kind === "pie") {
    const parts = pick([2, 3, 4, 6, 8]), take = rnd(1, parts - 1);
    return { q: "איזה חלק מהפיצה צבוע?", ...opts(`${take}/${parts}`, [`${parts - take}/${parts}`, `${take}/${parts + 1}`, `${parts}/${take}`]),
      ex: `הפיצה חולקה ל-${parts} חלקים שווים ו-${take} צבועים → ${take}/${parts}`, scene: { type: "frac", parts, take } };
  }
  if (kind === "of") {
    const parts = pick([2, 3, 4]), per = rnd(2, lv <= 2 ? 4 : 6), n = parts * per;
    return { q: `כמה זה 1/${parts} מ-${n}?`, ...opts(per, [per + 1, per - 1, n - per, parts]),
      ex: `מחלקים ${n} ל-${parts} קבוצות שוות: ${n} ÷ ${parts} = ${per}`,
      scene: { type: "fracOf", parts, n, item: pick(["🍎", "🍪", "🍬", "⭐"]) } };
  }
  const ds = shuffle([2, 3, 4, 5, 6, 8]).slice(0, 4);
  const best = Math.min(...ds);
  return { q: "איזה שבר הכי גדול?", options: ds.map((d) => `1/${d}`), c: ds.indexOf(best),
    ex: `כשמחלקים לפחות חלקים, כל חלק גדול יותר — לכן 1/${best} הכי גדול`, scene: { type: "pies", parts: ds, answer: ds.indexOf(best) } };
};

M.div = (lv) => {
  const k = rnd(2, lv <= 3 ? 5 : 9);
  if (lv >= 3 && Math.random() < 0.4) {
    const ans = rnd(2, 9), r = rnd(1, k - 1), n = k * ans + r;
    return { q: "חילוק עם שארית:", en: `${n} ÷ ${k} = ___`,
      ...opts(`${ans} שארית ${r}`, [`${ans + 1} שארית ${r}`, `${ans} שארית ${r === 1 ? 2 : r - 1}`, `${ans - 1} שארית ${r}`]),
      ex: `${k} × ${ans} = ${k * ans}, ונשארים עוד ${r}`,
      scene: n <= 30 ? { type: "share", n, k, item: "🍬", who: "🧒" }
        : { type: "steps", lines: [`${n} ÷ ${k}`, `${k} × ${ans} = ${k * ans}`, `${n} − ${k * ans} = ${r}`] } };
  }
  const ans = rnd(2, lv <= 3 ? 10 : 12), n = k * ans;
  return { q: "כמה זה?", en: `${n} ÷ ${k} = ___`, ...opts(ans, [ans + 1, ans - 1, n - k, k]),
    ex: `${k} × ${ans} = ${n}, לכן ${n} ÷ ${k} = ${ans}`,
    scene: n <= 30 ? { type: "share", n, k, item: pick(["🍬", "🎈", "🍪"]), who: "🧒" } : { type: "array", rows: k, cols: ans } };
};

M.geo = (lv) => {
  const kind = pick(lv <= 2 ? ["per", "area"] : ["per", "area", "sq", "tri"]);
  if (kind === "sq") {
    const s = rnd(2, 10), per = Math.random() < 0.5, r = per ? 4 * s : s * s;
    return { q: per ? `מה ההיקף של ריבוע שאורך הצלע שלו ${s} סנטימטרים?` : `מה השטח של ריבוע שאורך הצלע שלו ${s}?`,
      ...opts(r, per ? [s * s, 2 * s, r + 4] : [4 * s, 2 * s, r + s]),
      ex: per ? `לריבוע 4 צלעות שוות: 4 × ${s} = ${r}` : `שטח ריבוע = צלע × צלע = ${s} × ${s} = ${r}`,
      scene: { type: "rect", w: s, h: s, mode: per ? "per" : "area" } };
  }
  if (kind === "tri") {
    const b = rnd(3, 12);
    let h = rnd(2, 10);
    if ((b * h) % 2) h += 1;
    const r = (b * h) / 2;
    return { q: `מה השטח של משולש שהבסיס שלו ${b} והגובה שלו ${h}?`, ...opts(r, [b * h, b + h, r + b]),
      ex: `שטח משולש = בסיס × גובה ÷ 2 = ${b} × ${h} ÷ 2 = ${r}`, scene: { type: "rect", w: b, h, mode: "tri" } };
  }
  const w = rnd(3, 12), h = rnd(2, Math.min(9, w));
  if (kind === "per") {
    const r = 2 * (w + h);
    return { q: `מה ההיקף של מלבן שאורכו ${w} סנטימטרים ורוחבו ${h} סנטימטרים?`, ...opts(r, [w * h, w + h, r + 2]),
      ex: `היקף = סכום כל הצלעות: ${w} + ${h} + ${w} + ${h} = ${r}`, scene: { type: "rect", w, h, mode: "per" } };
  }
  const r = w * h;
  return { q: `מה השטח של מלבן שאורכו ${w} ורוחבו ${h}? (ביחידות ריבועיות)`, ...opts(r, [2 * (w + h), w + h, r + w]),
    ex: `שטח = אורך × רוחב = ${w} × ${h} = ${r}`, scene: { type: "rect", w, h, mode: "area" } };
};

M.mulbig = (lv) => {
  const kind = pick(lv <= 3 ? ["2x1", "2x1", "x10"] : ["2x1", "2x2", "2x2", "x10"]);
  if (kind === "x10") {
    const a = rnd(3, 99), z = pick([10, 100, 1000]), zeros = String(z).length - 1, r = a * z;
    return { q: `כפל ב-${z}:`, en: `${a} × ${z} = ___`, ...opts(r, [r / 10, r * 10, a + z]),
      ex: `כופלים ב-${z} → מוסיפים ${zeros === 1 ? "אפס אחד" : `${zeros} אפסים`} בסוף: ${r}`,
      scene: { type: "steps", lines: [`${a} × ${z}`, `${a}${"0".repeat(zeros)}`] } };
  }
  if (kind === "2x1") {
    let a = rnd(12, lv <= 3 ? 49 : 99);
    if (a % 10 === 0) a += rnd(1, 9);
    const b = rnd(3, 9), r = a * b, t = a - (a % 10), o = a % 10;
    return { q: "כפל בשיטת הפירוק:", en: `${a} × ${b} = ___`, ...opts(r, [t * b + o, r + b, r - 10, t * b]),
      ex: `מפרקים: ${a} × ${b} = ${t} × ${b} + ${o} × ${b} = ${t * b} + ${o * b} = ${r}`, scene: { type: "area", a, b } };
  }
  const a = rnd(12, 39);
  let b = rnd(11, 29);
  if (b % 10 === 0) b += 1;
  const r = a * b, bt = b - (b % 10), bo = b % 10;
  return { q: "כפל דו-ספרתי:", en: `${a} × ${b} = ___`, ...opts(r, [a * bt + bo, a * bo + bt, r + a, r - 10]),
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

M.longdiv = (lv) => {
  const k = rnd(3, 9);
  const withRem = lv >= 3 && Math.random() < 0.35;
  const ans = rnd(lv <= 2 ? 12 : 21, lv <= 3 ? 60 : 160);
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

M.fracops = (lv) => {
  const kinds = ["eq", "simp", "same"];
  if (lv >= 3) kinds.push("unlike");
  if (lv >= 4) kinds.push("minus");
  const kind = pick(kinds);
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

M.decimal = (lv) => {
  const kind = pick(lv <= 2 ? ["cmp", "add", "conv"] : ["cmp", "add", "mul10", "conv"]);
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
  const f = pick(forms)();
  return { q: "פתרו לפי סדר פעולות החשבון:", en: `${f.expr} = ___`, ...opts(f.v, [f.w, f.v + 1, f.v - 1, f.v + 10]),
    ex: `קודם ${f.paren ? "מה שבסוגריים" : "כפל וחילוק"}, אחר כך חיבור וחיסור: ${f.lines.join(" = ")}`, scene: { type: "steps", lines: f.lines } };
};

M.angles = (lv) => {
  const kind = pick(lv <= 2 ? ["tri", "line", "type"] : ["tri", "tri", "line", "type"]);
  if (kind === "tri") {
    const A = rnd(30, 90), B = rnd(20, 150 - A), C = 180 - A - B;
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

M.stats = (lv) => {
  const kind = pick(lv <= 2 ? ["avg", "prob"] : ["avg", "prob", "range"]);
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

M.percent = (lv) => {
  const kind = pick(lv <= 3 ? ["of", "of", "disc"] : ["of", "disc", "what"]);
  const barOf = (p) => (p % 25 === 0 ? { den: 4, a: p / 25 } : { den: 10, a: p / 10 });
  if (kind === "of") {
    const p = pick([10, 20, 25, 50, 75]);
    const base = pick(p % 25 === 0 ? [40, 60, 80, 120, 200] : [40, 50, 80, 120, 200, 300]);
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

M.ratio = () => {
  const kind = pick(["split", "scale", "simp"]);
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

M.neg = (lv) => {
  const kind = pick(lv <= 2 ? ["add", "sub", "cmp"] : ["add", "sub", "mul", "cmp"]);
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

M.algebra = (lv) => {
  const kind = pick(lv <= 2 ? ["plus", "times"] : ["plus", "times", "two", "eval"]);
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
M.powers = (lv) => {
  const kind = pick(lv <= 2 ? ["sq", "root"] : ["sq", "root", "cube", "ten"]);
  if (kind === "sq") {
    const n = rnd(2, lv <= 3 ? 10 : 15), r = n * n;
    return { q: "חזקה שנייה (בריבוע):", en: `${n}² = ___`, ...opts(r, [2 * n, r + n, (n + 1) * (n + 1)]),
      ex: `${n}² = ${n} × ${n} = ${r}`, scene: { type: "array", rows: n, cols: n } };
  }
  if (kind === "root") {
    const n = rnd(2, 12), s = n * n;
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

M.pyth = () => {
  const [p, q, h] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]]);
  if (Math.random() < 0.6) {
    return { q: `במשולש ישר זווית הניצבים הם ${p} ו-${q}. מה אורך היתר?`, ...opts(h, [p + q, h + 1, h * h, h - 1]),
      ex: `${p}² + ${q}² = ${p * p} + ${q * q} = ${h * h}, והיתר = √${h * h} = ${h}`, scene: { type: "angle", mode: "right", a: p, b: q, c: h, missing: "c" } };
  }
  return { q: `במשולש ישר זווית היתר ${h} וניצב אחד ${p}. מה אורך הניצב השני?`, ...opts(q, [h - p, q + 1, h + p, q - 1]),
    ex: `${h}² − ${p}² = ${h * h} − ${p * p} = ${q * q}, והניצב = √${q * q} = ${q}`, scene: { type: "angle", mode: "right", a: p, b: q, c: h, missing: "b" } };
};

const lin = (m, b) => `y = ${m === 1 ? "" : m === -1 ? "−" : m}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
M.linear = (lv) => {
  const m = rnd(1, 3) * (lv >= 4 && Math.random() < 0.3 ? -1 : 1);
  const b = rnd(-4, 5) || 1;
  const kind = pick(["value", "slope", "icept"]);
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
