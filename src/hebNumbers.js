// מספרים → מילים בעברית, לקריינות בלבד (התצוגה לא משתנה).
// מנוע הקול טועה במספרים ("שתים" במקום "שתיים", "שתים עשר"), לכן כותבים לו את המילים בעצמנו,
// עם התאמת מין לשם העצם שאחרי המספר. בלי ניקוד: קול הענן משבש מילים מנוקדות.

const FEM = ["אפס", "אחת", "שתיים", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע", "עשר"];
const MASC = ["אפס", "אחד", "שניים", "שלושה", "ארבעה", "חמישה", "שישה", "שבעה", "שמונה", "תשעה", "עשרה"];
const FEM_TEENS = ["", "אחת עשרה", "שתים עשרה", "שלוש עשרה", "ארבע עשרה", "חמש עשרה", "שש עשרה", "שבע עשרה", "שמונה עשרה", "תשע עשרה"];
const MASC_TEENS = ["", "אחד עשר", "שנים עשר", "שלושה עשר", "ארבעה עשר", "חמישה עשר", "שישה עשר", "שבעה עשר", "שמונה עשר", "תשעה עשר"];
const TENS = ["", "", "עשרים", "שלושים", "ארבעים", "חמישים", "שישים", "שבעים", "שמונים", "תשעים"];
const HUNDREDS = ["", "מאה", "מאתיים", "שלוש מאות", "ארבע מאות", "חמש מאות", "שש מאות", "שבע מאות", "שמונה מאות", "תשע מאות"];
const THOUSANDS = ["", "אלף", "אלפיים", "שלושת אלפים", "ארבעת אלפים", "חמשת אלפים", "ששת אלפים", "שבעת אלפים", "שמונת אלפים", "תשעת אלפים", "עשרת אלפים"];

// זכר/נקבה לפי שם העצם שאחרי המספר. בלי שם עצם (תרגיל, ספירה) — נקבה, כמו שסופרים בעברית.
const FEM_IM = new Set(["שנים", "מילים", "ביצים", "ערים", "אבנים", "דבורים", "ציפורים", "יונים", "נשים", "פעמים",
  "ידיים", "רגליים", "עיניים", "אוזניים", "שיניים", "כנפיים", "נעליים", "צפרדעים", "נמלים", "תאנים", "כבשים"]);
const MASC_OT = new Set(["אבות", "חלונות", "שולחנות", "מקומות", "לילות", "קירות", "כיסאות", "כסאות", "ארונות", "רחובות",
  "קולות", "חלומות", "עפרונות", "אוצרות", "שבועות", "דורות", "זוגות", "מזלות", "סודות", "רעיונות", "פתרונות"]);

function genderOf(nextWord) {
  const w = (nextWord || "").replace(/[֑-ׇ]/g, "");
  if (!/^[א-ת]{2,}$/.test(w)) return null;
  if (FEM_IM.has(w)) return "f";
  if (MASC_OT.has(w)) return "m";
  if (w.endsWith("ים")) return "m";
  if (w.endsWith("ות")) return "f";
  return null;
}

// 0–999,999. noun = האם יש שם עצם אחרי המספר (משנה רק את 2: שתי/שני)
export function numberWords(n, gender = "f", noun = false) {
  n = Math.floor(Math.abs(n));
  const m = gender === "m";
  if (n === 0) return "אפס";
  if (n === 2 && noun) return m ? "שני" : "שתי";
  const parts = [];
  const th = Math.floor(n / 1000);
  const rest = n % 1000;
  if (th) parts.push(th <= 10 ? THOUSANDS[th] : numberWords(th, "m") + " אלף");
  const h = Math.floor(rest / 100);
  if (h) parts.push(HUNDREDS[h]);
  const tu = rest % 100;
  if (tu) {
    if (tu <= 10) parts.push((m ? MASC : FEM)[tu]);
    else if (tu < 20) parts.push((m ? MASC_TEENS : FEM_TEENS)[tu - 10]);
    else {
      const t = Math.floor(tu / 10), u = tu % 10;
      parts.push(u ? `${TENS[t]} ו${(m ? MASC : FEM)[u]}` : TENS[t]);
    }
  }
  // ו' החיבור לפני הרכיב האחרון ("מאה ועשרים"), אלא אם כבר יש בו ו' ("מאה עשרים ושלוש")
  if (parts.length > 1 && !/ ו/.test(parts[parts.length - 1])) {
    parts[parts.length - 1] = "ו" + parts[parts.length - 1];
  }
  return parts.join(" ");
}

// שברים: 1/2 → חצי, 3/4 → שלושה רבעים, 2/5 → שתי חמישיות
const DENOMS = {
  2: ["חצי", "חצאים", "m"], 3: ["שליש", "שלישים", "m"], 4: ["רבע", "רבעים", "m"], 5: ["חמישית", "חמישיות", "f"],
  6: ["שישית", "שישיות", "f"], 7: ["שביעית", "שביעיות", "f"], 8: ["שמינית", "שמיניות", "f"], 9: ["תשיעית", "תשיעיות", "f"],
  10: ["עשירית", "עשיריות", "f"],
};
export function fractionWords(n, d) {
  const D = DENOMS[d];
  if (!D || n <= 0) return `${numberWords(n)} חלקי ${numberWords(d)}`;
  return n === 1 ? D[0] : `${numberWords(n, D[2], true)} ${D[1]}`;
}

// סימנים מתמטיים שקול הענן לא יודע לקרוא בעברית
const VAR_NAMES = { x: "איקס", y: "וואי", a: "איי", b: "בי" };
const SUP_WORDS = { "²": "בריבוע", "³": "בחזקת שלוש", "⁴": "בחזקת ארבע", "⁵": "בחזקת חמש", "⁶": "בחזקת שש" };
function mathSymbolsToHebrew(s) {
  return s
    .replace(/(\d)([xy])(?![A-Za-z])/g, (m, d, v) => `${d} ${VAR_NAMES[v]}`)
    .replace(/(?<![A-Za-z])([xy])(?![A-Za-z])/g, (m, v) => VAR_NAMES[v])
    .replace(/(\d)([ab])(?![A-Za-z])/g, (m, d, v) => `${d} ${VAR_NAMES[v]}`)
    .replace(/(?<![A-Za-z])([ab])(?=\s*(?:=|שווה)\s*\d)/g, (m, v) => VAR_NAMES[v])
    .replace(/√\s*/g, "שורש של ")
    .replace(/([²³⁴⁵⁶])/g, (m, s2) => ` ${SUP_WORDS[s2]}`)
    .replace(/≈/g, " בערך ")
    .replace(/°/g, " מעלות")
    .replace(/_{2,}\s*\/\s*(\d+)/g, "כמה חלקי $1")
    .replace(/(\d+):(\d+)/g, "$1 ל-$2")
    .replace(/(^|[\s(=,])[−-](?=\d)/g, "$1מינוס ")
    .replace(/(^|[^\d/.])(\d{1,3})\/(\d{1,3})(?![\d/])/g, (m, pre, n, d) => pre + fractionWords(+n, +d))
    .replace(/(\d+)\.(\d+)/g, (m, i, f) =>
      `${numberWords(+i)} נקודה ${f.startsWith("0") ? f.split("").map((x) => numberWords(+x)).join(" ") : numberWords(+f)}`);
}

// מחליף כל מספר בטקסט עברי במילים: "12 סוכריות" → "שתים עשרה סוכריות", "ו-3 חברים" → "ושלושה חברים"
export function numbersToHebrew(text) {
  return mathSymbolsToHebrew(String(text))
    .replace(/(\d+)\s*%/g, "$1 אחוז")
    .replace(/(^|[^א-ת\d])([והבלמשכ]{1,2})?-?(\d{1,6})(?![\d.,]\d)(\s+([א-ת֑-ׇ]+))?/g,
      (all, pre, prefix, digits, gap, next) => {
        const n = parseInt(digits, 10);
        const g = genderOf(next);
        const noun = !!g;
        const words = numberWords(n, g || "f", noun);
        return pre + (prefix || "") + words + (gap || "");
      });
}
