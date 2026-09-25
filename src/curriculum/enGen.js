// מחוללי תרגול באנגלית לפי נושא — משפט להשלמה, הסבר קצר בעברית ואיור לכל שאלה.
// כל שאלה: { q (הנחיה בעברית), en (המשפט), options, c, ex, scene? }

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[rnd(0, arr.length - 1)];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const FILL = ["the", "a", "an", "to", "be", "do", "not", "so"];

function opts(correct, pool) {
  const list = [correct];
  for (const w of shuffle(pool)) {
    if (!list.includes(w)) list.push(w);
    if (list.length === 4) break;
  }
  for (const w of FILL) {
    if (list.length === 4) break;
    if (!list.includes(w)) list.push(w);
  }
  const o = shuffle(list);
  return { options: o, c: o.indexOf(correct) };
}

const SUBJECTS = [
  { en: "I", lo: "I", be: "am", have: "have", third: false, e: "🙋" },
  { en: "You", lo: "you", be: "are", have: "have", third: false, e: "🫵" },
  { en: "He", lo: "he", be: "is", have: "has", third: true, e: "👦" },
  { en: "She", lo: "she", be: "is", have: "has", third: true, e: "👧" },
  { en: "We", lo: "we", be: "are", have: "have", third: false, e: "👨‍👩‍👧" },
  { en: "They", lo: "they", be: "are", have: "have", third: false, e: "👫" },
  { en: "My dog", lo: "my dog", be: "is", have: "has", third: true, e: "🐶" },
  { en: "Tom", lo: "Tom", be: "is", have: "has", third: true, e: "👦" },
  { en: "The kids", lo: "the kids", be: "are", have: "have", third: false, e: "🧒" },
];

// [בסיס, s, ing, עבר, V3, עברית, אימוג'י]
const VERBS = [
  ["play", "plays", "playing", "played", "played", "לשחק", "⚽"], ["eat", "eats", "eating", "ate", "eaten", "לאכול", "🍽️"],
  ["drink", "drinks", "drinking", "drank", "drunk", "לשתות", "🥤"], ["read", "reads", "reading", "read", "read", "לקרוא", "📖"],
  ["write", "writes", "writing", "wrote", "written", "לכתוב", "✍️"], ["swim", "swims", "swimming", "swam", "swum", "לשחות", "🏊"],
  ["run", "runs", "running", "ran", "run", "לרוץ", "🏃"], ["go", "goes", "going", "went", "gone", "ללכת", "🚶"],
  ["watch", "watches", "watching", "watched", "watched", "לצפות", "📺"], ["sing", "sings", "singing", "sang", "sung", "לשיר", "🎤"],
  ["cook", "cooks", "cooking", "cooked", "cooked", "לבשל", "🍳"], ["jump", "jumps", "jumping", "jumped", "jumped", "לקפוץ", "🤸"],
  ["see", "sees", "seeing", "saw", "seen", "לראות", "👀"], ["make", "makes", "making", "made", "made", "להכין", "🧁"],
  ["dance", "dances", "dancing", "danced", "danced", "לרקוד", "💃"], ["study", "studies", "studying", "studied", "studied", "ללמוד", "📚"],
  ["buy", "buys", "buying", "bought", "bought", "לקנות", "🛒"],
];
const OBJ = {
  play: ["soccer", "a game"], eat: ["an apple", "pizza"], drink: ["milk", "water"], read: ["a book", "a story"],
  write: ["a letter", "a story"], swim: ["in the pool", "in the sea"], run: ["in the park", "fast"], go: ["to school", "to the park"],
  watch: ["TV", "a movie"], sing: ["a song", "at school"], cook: ["dinner", "pasta"], jump: ["on the bed", "high"],
  see: ["a bird", "the moon"], make: ["a cake", "a sandwich"], dance: ["at the party", "together"], study: ["English", "math"],
  buy: ["bread", "a new bag"],
};
const isRegular = (v) => [v[0] + "ed", v[0] + "d", v[0].replace(/y$/, "ied")].includes(v[3]);

const E = {};

const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const FIRST_WORDS = [["dog", "🐶"], ["cat", "🐱"], ["sun", "☀️"], ["ball", "⚽"], ["apple", "🍎"], ["fish", "🐟"], ["car", "🚗"], ["egg", "🥚"],
  ["hat", "🎩"], ["moon", "🌙"], ["tree", "🌳"], ["bed", "🛏️"], ["book", "📖"], ["milk", "🥛"], ["key", "🔑"], ["duck", "🦆"], ["lion", "🦁"],
  ["pig", "🐷"], ["zebra", "🦓"], ["rabbit", "🐰"]];
E.abc = (lv) => {
  const kind = pick(lv <= 1 ? ["next", "first"] : ["next", "first", "case"]);
  if (kind === "next") {
    const i = rnd(1, 23), ans = ABC[i + 1];
    return { q: `איזו אות באה אחרי ${ABC[i]}?`, en: `${ABC[i - 1]} · ${ABC[i]} · ___`, ...opts(ans, [ABC[i + 2], ABC[i - 1], ABC[(i + 5) % 26], ABC[(i + 9) % 26]]),
      ex: `הסדר הוא ${ABC.slice(i - 1, i + 3).join(", ")}`, scene: { type: "fact", tokens: [ABC[i - 1], ABC[i], "___"], answer: ans } };
  }
  if (kind === "first") {
    const [w, e] = pick(FIRST_WORDS), ans = w[0].toUpperCase();
    return { w, q: "באיזו אות מתחילה המילה?", en: w, ...opts(ans, shuffle(ABC).slice(0, 6)), ex: `${w} מתחילה באות ${ans}`,
      scene: { type: "fact", items: [e], answer: ans, ansE: "🔤" } };
  }
  const L = pick(ABC), l = L.toLowerCase();
  return { q: `איזו אות קטנה מתאימה ל-${L}?`, en: L, ...opts(l, ["b", "d", "p", "q", "g", "j", "y", "i", "l"].filter((x) => x !== l)),
    ex: `${L} גדולה = ${l} קטנה`, scene: { type: "fact", tokens: [L, "=", "___"], answer: l } };
};

const COLORS = [["red", "אדום", "🔴"], ["blue", "כחול", "🔵"], ["yellow", "צהוב", "🟡"], ["green", "ירוק", "🟢"], ["black", "שחור", "⚫"],
  ["white", "לבן", "⚪"], ["purple", "סגול", "🟣"], ["orange", "כתום", "🟠"], ["brown", "חום", "🟤"], ["pink", "ורוד", "🩷"]];
const COLOR_THINGS = [["The banana is", "yellow", "🍌"], ["The grass is", "green", "🌿"], ["The sky is", "blue", "🌤️"], ["The strawberry is", "red", "🍓"],
  ["Snow is", "white", "❄️"], ["The orange is", "orange", "🍊"], ["Chocolate is", "brown", "🍫"], ["The grapes are", "purple", "🍇"]];
const NUMS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen",
  "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
// רמה 1: מספרים עד 10 · רמה 2: עד 20 · רמה 3 ומעלה: גם עשרות (twenty, thirty ...)
const TENS = [["twenty", 20], ["thirty", 30], ["forty", 40], ["fifty", 50], ["sixty", 60], ["seventy", 70], ["eighty", 80], ["ninety", 90], ["one hundred", 100]];
E.colors = (lv) => {
  const kinds = ["color", "thing", "num"];
  if (lv >= 3) kinds.push("tens", "tens");
  const kind = pick(kinds);
  if (kind === "tens") {
    const [w, n] = pick(TENS);
    return { w, q: `איך כותבים ${n} באנגלית?`, ...opts(w, TENS.map((t) => t[0])), ex: `${n} = ${w}`,
      scene: { type: "fact", items: ["🔢"], answer: w } };
  }
  if (kind === "color") {
    const [en, he, e] = pick(COLORS);
    return { w: en, q: `מה הפירוש של ${en}?`, en, ...opts(he, COLORS.map((c) => c[1])), ex: `${en} = ${he}`, scene: { type: "fact", items: ["🎨"], answer: he, ansE: e } };
  }
  if (kind === "thing") {
    const [s, col, e] = pick(COLOR_THINGS), row = COLORS.find((c) => c[0] === col);
    return { q: "השלם את המשפט:", en: `${s} ___`, ...opts(col, COLORS.map((c) => c[0])), ex: `${col} = ${row[1]}`, scene: { type: "fact", items: [e], answer: col, ansE: row[2] } };
  }
  const n = rnd(1, lv <= 1 ? 10 : 20);
  return { w: NUMS[n], q: `איך כותבים ${n} באנגלית?`, ...opts(NUMS[n], [NUMS[n + 1] || NUMS[n - 2], NUMS[n - 1], NUMS[(n + 7) % 21]]),
    ex: `${n} = ${NUMS[n]}`, scene: n <= 10 ? { type: "count", n, item: "⭐" } : { type: "fact", items: ["🔢"], answer: NUMS[n] } };
};

const ADJS = [["happy", "😊"], ["tired", "🥱"], ["hungry", "🍽️"], ["tall", "🦒"], ["cold", "🧊"], ["hot", "🔥"], ["kind", "💛"], ["busy", "📚"], ["late", "⏰"], ["ready", "✅"]];
// רמה 1: רק I / You / He / She · רמה 2: כל הגופים · רמה 3: גם שאלות · רמה 4 ומעלה: גם שלילה ותשובה קצרה
E.be = (lv) => {
  const S = pick(lv <= 1 ? SUBJECTS.slice(0, 4) : SUBJECTS), [adj, ae] = pick(ADJS);
  const scene = { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e: ae, cap: adj }] };
  if (lv >= 4 && Math.random() < 0.45) {
    if (Math.random() < 0.5) {
      return { q: "השלם את המשפט בשלילה:", en: `${S.en} ___ not ${adj}.`, ...opts(S.be, ["am", "is", "are", "be"]),
        ex: `גם בשלילה: ${S.lo} → ${S.be}, ואחריו not`, scene };
    }
    return { q: "השלם את התשובה הקצרה:", en: `${cap(S.be)} ${S.lo} ${adj}? Yes, ${S.lo} ___.`, ...opts(S.be, ["am", "is", "are", "be"]),
      ex: `בתשובה קצרה חוזרים על הפועל: ${S.lo} ${S.be}`, scene };
  }
  if (lv >= 3 && Math.random() < 0.4) {
    const ans = cap(S.be);
    return { q: "השלם את השאלה:", en: `___ ${S.lo} ${adj}?`, ...opts(ans, ["Am", "Is", "Are", "Be"]), ex: `${S.lo} → ${S.be}, ובשאלה מתחילים ב-${ans}`, scene };
  }
  const ex = S.en === "I" ? "I תמיד עם am" : S.be === "is" ? `${S.en} — אחד (he / she / it) → is` : `${S.en} — רבים או you → are`;
  return { q: "השלם את המשפט:", en: `${S.en} ___ ${adj}.`, ...opts(S.be, ["am", "is", "are", "be"]), ex, scene };
};

const PREP_THINGS = [["cat", "🐱", "החתול"], ["ball", "⚽", "הכדור"], ["book", "📖", "הספר"], ["dog", "🐶", "הכלב"], ["teddy bear", "🧸", "הדובי"]];
const PREP_REFS = [["box", "📦", "הקופסה", "לקופסה"], ["table", "TABLE", "השולחן", "לשולחן"], ["bed", "🛏️", "המיטה", "למיטה"], ["chair", "🪑", "הכיסא", "לכיסא"]];
// רמה 1: in / on בתוך קופסה · רמה 2: גם under · רמה 3: גם next to ו-behind · רמה 4 ומעלה: גם שאלת פירוש
const PREP_HE = { in: "בתוך", on: "על", under: "מתחת", "next to": "ליד", behind: "מאחורי" };
E.prep = (lv = 2) => {
  const [t, te, the] = pick(PREP_THINGS), r = lv <= 1 ? PREP_REFS[0] : pick(PREP_REFS);
  if (lv >= 4 && Math.random() < 0.3) {
    const w = pick(Object.keys(PREP_HE));
    return { w, q: `מה הפירוש של ${w}?`, en: w, ...opts(PREP_HE[w], Object.values(PREP_HE)), ex: `${w} = ${PREP_HE[w]}`,
      scene: { type: "place", thing: te, ref: r[1], where: w } };
  }
  const box = r[0] === "box";
  const pool = lv <= 1 ? ["in", "on"]
    : lv <= 2 ? (box ? ["in", "on", "under"] : ["on", "under"])
    : (box ? ["in", "on", "under", "next to", "behind"] : ["on", "under", "next to", "behind"]);
  const where = pick(pool);
  const heWhere = where === "under" ? `מתחת ${r[3]}` : `${PREP_HE[where]} ${r[2]}`;
  return { q: `${the} נמצא ${heWhere}. השלם:`, en: `The ${t} is ___ the ${r[0]}.`,
    ...opts(where, lv <= 2 ? ["in", "on", "under", "next to"] : Object.keys(PREP_HE)),
    ex: `${PREP_HE[where]} = ${where}`, scene: { type: "place", thing: te, ref: r[1], where } };
};

const OPP = [["big", "small", "גדול", "קטן"], ["hot", "cold", "חם", "קר"], ["fast", "slow", "מהיר", "איטי"], ["happy", "sad", "שמח", "עצוב"],
  ["tall", "short", "גבוה", "נמוך"], ["old", "young", "זקן", "צעיר"], ["open", "closed", "פתוח", "סגור"], ["full", "empty", "מלא", "ריק"],
  ["easy", "difficult", "קל", "קשה"], ["clean", "dirty", "נקי", "מלוכלך"], ["loud", "quiet", "רועש", "שקט"], ["strong", "weak", "חזק", "חלש"],
  ["early", "late", "מוקדם", "מאוחר"], ["light", "heavy", "קל", "כבד"], ["rich", "poor", "עשיר", "עני"]];
const ANIMATED_OPP = ["big", "small", "hot", "cold", "fast", "slow", "happy", "sad", "easy"];
// רמה 1: חמישה זוגות בסיסיים · רמה 2: שמונה · רמה 3: כל הזוגות · רמה 4: גם הפכים בתוך משפט · רמה 5 ומעלה: גם זוגות מתקדמים
const OPP_HARD = [["cheap", "expensive", "זול", "יקר"], ["safe", "dangerous", "בטוח", "מסוכן"], ["remember", "forget", "לזכור", "לשכוח"],
  ["win", "lose", "לנצח", "להפסיד"], ["buy", "sell", "לקנות", "למכור"], ["first", "last", "ראשון", "אחרון"],
  ["always", "never", "תמיד", "אף פעם"], ["push", "pull", "לדחוף", "למשוך"], ["borrow", "lend", "לשאול", "להשאיל"]];
const OPP_SENT = [["The soup is not hot. It is ___.", "cold", "קר", "🍲"], ["My bag is not heavy. It is ___.", "light", "קל", "🎒"],
  ["The turtle is not fast. It is ___.", "slow", "איטי", "🐢"], ["The room is not dirty. It is ___.", "clean", "נקי", "🧹"],
  ["The test was not easy. It was ___.", "difficult", "קשה", "📝"], ["The bottle is not full. It is ___.", "empty", "ריק", "🍾"],
  ["Grandpa is not young. He is ___.", "old", "זקן", "👴"], ["The baby is not sad. She is ___.", "happy", "שמח", "👶"]];
E.opp = (lv) => {
  if (lv >= 4 && Math.random() < 0.4) {
    const [s, a, he, e] = pick(OPP_SENT);
    return { w: a, q: "השלם עם ההפך:", en: s, ...opts(a, OPP.flatMap((x) => [x[0], x[1]]).filter((x) => x !== a)),
      ex: `ההפך נכתב כאן: ${a} = ${he}`, scene: { type: "fact", items: [e], answer: a } };
  }
  const table = lv <= 1 ? OPP.slice(0, 5) : lv <= 2 ? OPP.slice(0, 8) : lv >= 5 ? [...OPP, ...OPP_HARD, ...OPP_HARD] : OPP;
  const row = pick(table);
  const [a, b, ha, hb] = Math.random() < 0.5 ? row : [row[1], row[0], row[3], row[2]];
  return { w: a, q: `מה ההפך מ-${a}?`, en: `${a} ↔ ___`, ...opts(b, table.flatMap((x) => [x[0], x[1]]).filter((x) => x !== a && x !== b)),
    ex: `${a} ${ha} ↔ ${b} ${hb}`, ...(ANIMATED_OPP.includes(a) ? {} : { scene: { type: "fact", tokens: [a, "↔", "___"], answer: b } }) };
};

const HAVE_THINGS = [["a new bike", "🚲"], ["a big bag", "🎒"], ["a pet cat", "🐱"], ["two brothers", "👦"], ["a red ball", "⚽"], ["a lot of books", "📚"]];
const PLURALS = [["cat", "cats", "מוסיפים s"], ["box", "boxes", "אחרי x מוסיפים es"], ["bus", "buses", "אחרי s מוסיפים es"],
  ["baby", "babies", "y אחרי עיצור הופכת ל-ies"], ["watch", "watches", "אחרי ch מוסיפים es"], ["dish", "dishes", "אחרי sh מוסיפים es"],
  ["child", "children", "צורה מיוחדת"], ["mouse", "mice", "צורה מיוחדת"], ["foot", "feet", "צורה מיוחדת"], ["tooth", "teeth", "צורה מיוחדת"],
  ["man", "men", "צורה מיוחדת"], ["leaf", "leaves", "f הופכת ל-ves"], ["knife", "knives", "f הופכת ל-ves"], ["city", "cities", "y אחרי עיצור הופכת ל-ies"],
  ["sheep", "sheep", "לא משתנה"], ["person", "people", "צורה מיוחדת"]];
// רמה 1: רק have / has · רמה 2: גם רבים רגילים · רמה 3: כל צורות הרבים · רמה 4: גם שאלה ושלילה
// · רמה 5 ומעלה: רק צורות רבים מיוחדות (children, mice, feet ...)
E.have = (lv) => {
  if (lv >= 4 && Math.random() < 0.4) {
    const S = pick(SUBJECTS), [n, e] = pick(HAVE_THINGS);
    const scene = { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e }] };
    if (Math.random() < 0.5) {
      const aux = S.third ? "Does" : "Do";
      return { q: "השלם את השאלה:", en: `___ ${S.lo} have ${n}?`, ...opts(aux, ["Do", "Does", "Is", "Are"]),
        ex: `${S.lo} → ${aux}, ואחריו have בצורת הבסיס`, scene };
    }
    const neg = S.third ? "doesn't" : "don't";
    return { q: "השלם את המשפט בשלילה:", en: `${S.en} ___ have ${n}.`, ...opts(neg, ["don't", "doesn't", "isn't", "aren't"]),
      ex: `${S.lo} → ${neg} have`, scene };
  }
  // ברמות הגבוהות have/has כבר מוכר — מתמקדים בצורות הרבים המיוחדות ובשאלות
  if (lv <= 1 || (lv <= 4 && Math.random() < 0.5)) {
    const S = pick(SUBJECTS), [n, e] = pick(HAVE_THINGS);
    return { q: "השלם את המשפט:", en: `${S.en} ___ ${n}.`, ...opts(S.have, ["have", "has", "is", "are"]),
      ex: S.have === "has" ? "he / she / it (או שם של אחד) → has" : "I / you / we / they → have",
      scene: { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e }] } };
  }
  const [s, p, rule] = pick(lv <= 2 ? PLURALS.slice(0, 6) : lv >= 5 ? PLURALS.slice(6) : PLURALS);
  const wrongs = [s + "s", s + "es", s.replace(/y$/, "ies"), s.replace(/fe?$/, "ves"), s + "en", s].filter((x) => x !== p);
  return { w: s, q: `מה צורת הרבים של ${s}?`, en: `one ${s} → two ___`, ...opts(p, wrongs), ex: `${s} → ${p} (${rule})`,
    scene: { type: "fact", tokens: [`1 ${s}`, "→", "___"], answer: p } };
};

const WH = [["___ is your name?", "What", "שואלים על דבר או שם → What"], ["___ do you live?", "Where", "שואלים על מקום → Where"],
  ["___ is your birthday?", "When", "שואלים על זמן → When"], ["___ is your best friend?", "Who", "שואלים על אדם → Who"],
  ["___ are you crying?", "Why", "שואלים על סיבה → Why"], ["___ old are you?", "How", "כמה / איך → How"],
  ["___ is the cat? It is under the bed.", "Where", "התשובה היא מקום → Where"], ["___ did you eat? A sandwich.", "What", "התשובה היא דבר → What"],
  ["___ does the movie start? At five.", "When", "התשובה היא זמן → When"], ["___ made this cake? Grandma did.", "Who", "התשובה היא אדם → Who"]];
// רמה 2 ומטה: שש מילות השאלה הבסיסיות · רמה 3: גם משפטים שהתשובה בהם נתונה · רמה 4 ומעלה: גם Which, Whose, How many/much
const WH_MORE = [["___ many brothers do you have?", "How", "כמה שאפשר לספור → How many"], ["___ bag is this? It is Dana's.", "Whose", "של מי → Whose"],
  ["___ one do you want, the red or the blue?", "Which", "איזה מבין כמה → Which"], ["___ do you go to school? By bus.", "How", "באיזו דרך → How"],
  ["___ much does it cost? Ten shekels.", "How", "כמה עולה → How much"], ["___ book is on the table? Mine.", "Whose", "של מי → Whose"]];
const WH_E = { What: "📦", Where: "📍", When: "⏰", Who: "🧑", Why: "🤔", How: "🛠️", Which: "🔀", Whose: "🎒" };
const WH_BASIC = ["What", "Where", "When", "Who", "Why", "How"];
E.wh = (lv = 3) => {
  const rows = lv <= 2 ? WH.slice(0, 6) : lv <= 3 ? WH : lv >= 5 ? [...WH.slice(6), ...WH_MORE, ...WH_MORE] : [...WH, ...WH_MORE];
  const [s, a, ex] = pick(rows);
  const pool = lv <= 3 ? WH_BASIC : Object.keys(WH_E);
  return { q: "איזו מילת שאלה מתאימה?", en: s, ...opts(a, pool), ex, scene: { type: "fact", items: ["❓"], answer: a, ansE: WH_E[a] } };
};

// רמה 2 ומטה: רק am / is / are · רמה 3: גם צורת ing · רמה 4: גם כתיב מיוחד (swim → swimming)
// · רמה 5 ומעלה: גם שאלה
const ING_SPECIAL = VERBS.filter((v) => v[2] !== v[0] + "ing");
const ingWrongs = (v) => [...new Set([v[0] + "ing", v[0].replace(/e$/, "") + "ing", v[0] + "eing", v[1] + "ing", v[3] + "ing"])].filter((x) => x !== v[2]);
E.prog = (lv = 3) => {
  const S = pick(SUBJECTS), V = pick(VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e: V[6], anim: "bob", cap: "now" }] };
  if (lv >= 5 && Math.random() < 0.4) {
    return { q: "השלם את השאלה:", en: `___ ${S.lo} ${V[2]} ${obj} now?`, ...opts(cap(S.be), ["Am", "Is", "Are", "Do"]),
      ex: `שאלה על מה שקורה עכשיו מתחילה ב-${cap(S.be)}: ${S.lo} ${S.be} ${V[2]}`, scene };
  }
  if (lv >= 4 && Math.random() < 0.4) {
    const v = pick(ING_SPECIAL), o = pick(OBJ[v[0]]);
    return { q: "השלם — שימו לב איך כותבים:", en: `${S.en} ${S.be} ___ ${o} now.`, ...opts(v[2], ingWrongs(v)),
      ex: `${v[0]} + ing = ${v[2]} — האותיות משתנות קצת`,
      scene: { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e: v[6], anim: "bob", cap: "now" }] } };
  }
  if (lv <= 2 || Math.random() < 0.5) {
    return { q: "השלם — מה קורה עכשיו?", en: `${S.en} ___ ${V[2]} ${obj} now.`, ...opts(S.be, ["am", "is", "are", "be"]),
      ex: `עכשיו = am / is / are + ing: ${S.lo} ${S.be} ${V[2]}`, scene };
  }
  return { q: "השלם — מה קורה עכשיו?", en: `${S.en} ${S.be} ___ ${obj} now.`, ...opts(V[2], [V[0], V[1], V[3]]), ex: `${V[0]} + ing = ${V[2]}`, scene };
};

// רמה 2 ומטה: משפט רגיל · רמה 3: גם שאלות · רמה 4: גם שלילה · רמה 5 ומעלה: גם כתיב של גוף שלישי (goes, watches)
const S_SPECIAL = VERBS.filter((v) => v[1] !== v[0] + "s");
E.tense = (lv) => {
  const S = pick(SUBJECTS), V = pick(VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "time", who: S.e, act: V[6], when: "always" };
  if (lv >= 5 && Math.random() < 0.4) {
    const v = pick(S_SPECIAL), o = pick(OBJ[v[0]]), T = pick(SUBJECTS.filter((x) => x.third));
    return { q: "השלם — שימו לב איך כותבים:", en: `${T.en} ___ ${o} every day.`, ...opts(v[1], [v[0] + "s", v[0], v[2], v[3]]),
      ex: `${v[0]} → ${v[1]} — בגוף שלישי כותבים אחרת`, scene: { type: "time", who: T.e, act: v[6], when: "always" } };
  }
  if (lv >= 4 && Math.random() < 0.4) {
    const neg = S.third ? "doesn't" : "don't";
    return { q: "השלם את המשפט בשלילה:", en: `${S.en} ___ ${V[0]} ${obj} on Fridays.`, ...opts(neg, ["don't", "doesn't", "isn't", "aren't"]),
      ex: `${S.lo} → ${neg}, והפועל נשאר בצורת הבסיס: ${V[0]}`, scene };
  }
  if (lv >= 3 && Math.random() < 0.35) {
    const aux = S.third ? "Does" : "Do";
    return { q: "השלם את השאלה:", en: `___ ${S.lo} ${V[0]} ${obj}?`, ...opts(aux, ["Do", "Does", "Is", "Are"]),
      ex: `${S.lo} → ${aux}, והפועל חוזר לצורת הבסיס: ${V[0]}`, scene };
  }
  const ans = S.third ? V[1] : V[0];
  return { q: "השלם את המשפט:", en: `${S.en} ___ ${obj} every day.`, ...opts(ans, [V[0], V[1], V[2], V[3]]),
    ex: S.third ? `${S.en} — he / she / it → מוסיפים s: ${V[1]}` : `${S.en} → בלי s: ${V[0]}`, scene };
};

// רמה 3 ומטה: רק פעלים רגילים (ed) · רמה 4: גם פעלים שובבים ושאלות · רמה 5: גם שלילה · רמה 6: רק פעלים שובבים
E.past = (lv) => {
  const S = pick(SUBJECTS);
  const pool = lv <= 3 ? VERBS.filter(isRegular) : lv >= 6 ? VERBS.filter((v) => !isRegular(v)) : VERBS;
  const V = pick(pool.length ? pool : VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "time", who: S.e, act: V[6], when: "past" };
  if (lv >= 5 && Math.random() < 0.35) {
    return { q: "השלם את המשפט בשלילה:", en: `${S.en} didn't ___ ${obj} yesterday.`, ...opts(V[0], [V[3], V[1], V[2]]),
      ex: `אחרי didn't הפועל חוזר לצורת הבסיס: ${V[0]}`, scene };
  }
  if (lv >= 4 && Math.random() < 0.3) {
    return { q: "השלם את השאלה בעבר:", en: `___ ${S.lo} ${V[0]} ${obj} yesterday?`, ...opts("Did", ["Do", "Does", "Was"]),
      ex: "שאלה בעבר מתחילה ב-Did, והפועל חוזר לצורת הבסיס", scene };
  }
  const wrongReg = V[0].endsWith("e") ? V[0] + "d" : V[0] + "ed";
  return { q: "השלם את המשפט בעבר:", en: `Yesterday ${S.lo} ___ ${obj}.`, ...opts(V[3], [V[0], V[1], wrongReg, V[2]]),
    ex: isRegular(V) ? `עבר רגיל: ${V[0]} + ed = ${V[3]}` : `${V[0]} הוא פועל שובב: ${V[0]} → ${V[3]}`, scene };
};

// רמה 2 ומטה: רק will · רמה 3: גם going to · רמה 4: גם won't · רמה 5: גם שאלות · רמה 6: גם שלילה של going to
const FUT_NEG = [["It is Saturday, so tomorrow I ___ go to school.", "won't", "☀️"], ["Don't worry, I ___ forget your birthday.", "won't", "🎂"],
  ["She is sick, so she ___ come to the party.", "won't", "🤒"], ["The sky is clear — it ___ rain today.", "won't", "🌤️"]];
E.future = (lv) => {
  const S = pick(SUBJECTS), V = pick(VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "time", who: S.e, act: V[6], when: "future" };
  if (lv >= 6 && Math.random() < 0.4) {
    const neg = S.be === "am" ? "am not" : S.be === "is" ? "isn't" : "aren't";
    return { q: "השלם בשלילה (going to):", en: `${S.en} ___ going to ${V[0]} ${obj} tomorrow.`, ...opts(neg, ["am not", "isn't", "aren't", "won't"]),
      ex: `${S.lo} → ${S.be}, ובשלילה: ${neg} going to`, scene };
  }
  if (lv >= 5 && Math.random() < 0.4) {
    if (Math.random() < 0.5) {
      return { q: "השלם את השאלה:", en: `___ ${S.lo} ${V[0]} ${obj} tomorrow?`, ...opts("Will", ["Do", "Did", "Was", "Are"]),
        ex: "שאלה בעתיד מתחילה ב-Will, והפועל בצורת הבסיס", scene };
    }
    return { q: "השלם את השאלה (going to):", en: `___ ${S.lo} going to ${V[0]} ${obj}?`, ...opts(cap(S.be), ["Am", "Is", "Are", "Will"]),
      ex: `${S.lo} → ${cap(S.be)} ... going to`, scene };
  }
  if (lv >= 4 && Math.random() < 0.35) {
    const [s, a, e] = pick(FUT_NEG);
    return { q: "השלם בשלילה:", en: s, ...opts(a, ["will", "didn't", "isn't", "don't"]),
      ex: "מה שלא יקרה בעתיד: won't (קיצור של will not)", scene: { type: "fact", items: [e], answer: a } };
  }
  if (lv >= 3 && Math.random() < 0.45) {
    return { q: "השלם (going to):", en: `${S.en} ___ going to ${V[0]} ${obj} tomorrow.`, ...opts(S.be, ["am", "is", "are", "be"]),
      ex: `going to: ${S.lo} ${S.be} going to + פועל בצורת הבסיס`, scene };
  }
  return { q: "השלם את המשפט בעתיד:", en: `Tomorrow ${S.lo} ___ ${V[0]} ${obj}.`, ...opts("will", ["did", "does", "was"]),
    ex: "מחר = עתיד: will + פועל בצורת הבסיס, לכל הגופים", scene };
};

const COMP = [
  ["big", "bigger", "biggest", "An elephant", "a mouse", "🐘", "🐭"], ["tall", "taller", "tallest", "A giraffe", "a dog", "🦒", "🐶"],
  ["fast", "faster", "fastest", "A car", "a bike", "🏎️", "🚲"], ["hot", "hotter", "hottest", "The sun", "a candle", "☀️", "🕯️"],
  ["heavy", "heavier", "heaviest", "A truck", "a ball", "🚚", "⚽"], ["small", "smaller", "smallest", "An ant", "a cat", "🐜", "🐱"],
  ["beautiful", "more beautiful", "most beautiful", "A rainbow", "a gray wall", "🌈", "🧱"], ["good", "better", "best", "A sunny day", "a rainy day", "☀️", "🌧️"],
  ["cold", "colder", "coldest", "Ice", "water", "🧊", "💧"],
];
const SUPERL = [["The cheetah is the ___ animal on land.", "fastest", "fast", "faster", "🐆"], ["The blue whale is the ___ animal in the sea.", "biggest", "big", "bigger", "🐋"],
  ["Mount Everest is the ___ mountain in the world.", "highest", "high", "higher", "🏔️"], ["This is the ___ day of my life!", "best", "good", "better", "🎉"],
  ["Antarctica is the ___ place on Earth.", "coldest", "cold", "colder", "🥶"], ["The giraffe is the ___ animal.", "tallest", "tall", "taller", "🦒"]];
// רמה 3 ומטה: תארים קצרים · רמה 4: גם more / better / best · רמה 5: גם as ... as · רמה 6: גם בחירה לפי ההקשר
const AS_AS = [["My bag is as heavy ___ your bag.", "as", "⚖️"], ["He is as tall ___ his brother.", "as", "🧍"],
  ["This book is as good ___ the movie.", "as", "📖"], ["The lake is as cold ___ the sea.", "as", "🏞️"]];
const COMP_CTX = [["Dana is the ___ girl in the class.", "tallest", ["taller", "tall", "more tall"], "📏"],
  ["My brother is ___ than me.", "older", ["oldest", "old", "more old"], "👦"],
  ["This is the ___ day of the year.", "hottest", ["hotter", "hot", "most hot"], "🔥"],
  ["A bike is ___ than a car.", "cheaper", ["cheapest", "cheap", "more cheap"], "🚲"]];
E.comp = (lv) => {
  if (lv >= 6 && Math.random() < 0.45) {
    const [s, a, wrongs, e] = pick(COMP_CTX);
    return { q: "השלם — השוואה או הכי:", en: s, ...opts(a, wrongs),
      ex: "אחרי the באה צורת ההכי, ולפני than באה צורת ההשוואה", scene: { type: "fact", items: [e], answer: a } };
  }
  if (lv >= 5 && Math.random() < 0.35) {
    const [s, a, e] = pick(AS_AS);
    return { q: "השלם — שני דברים שווים:", en: s, ...opts(a, ["than", "like", "so", "that"]),
      ex: "as ... as = בדיוק כמו", scene: { type: "fact", items: [e], answer: a } };
  }
  if (lv >= 3 && Math.random() < 0.45) {
    const [s, sup, base, cmp, e] = pick(SUPERL);
    return { q: "השלם — הכי...:", en: s, ...opts(sup, [base, cmp, "most " + base]), ex: `the + ${sup}: הכי ${base} מכולם`, scene: { type: "fact", items: [e, "🏆"], answer: sup, ansE: "🥇" } };
  }
  // רמה 3 ומטה: רק תארים קצרים (bigger) · רמה 4 ומעלה: גם more beautiful ו-good → better
  const longer = COMP.filter((r) => r[1].startsWith("more") || r[0] === "good");
  const rows = lv <= 3 ? COMP.filter((r) => !longer.includes(r)) : [...COMP, ...longer, ...longer];
  const [adj, cmp, sup, A, B, eA, eB] = pick(rows);
  const wrong = cmp.startsWith("more") ? adj + "er" : "more " + adj;
  return { q: "השלם — השוואה בין שניים:", en: `${A} is ___ than ${B}.`, ...opts(cmp, [adj, sup, wrong]),
    ex: `משווים בין שניים: ${adj} → ${cmp} + than`, scene: { type: "seq", arrows: false, frames: [{ e: eA, s: 1 }, { e: "⚖️" }, { e: eB }] } };
};

const MODAL = [["A baby ___ walk yet.", "can't", "לא יכול → can't", "👶"], ["Fish ___ live out of the water.", "can't", "לא יכולים → can't", "🐟"],
  ["My sister ___ play the piano.", "can", "יכולה → can", "🎹"], ["I ___ speak a little English.", "can", "יכול → can", "🗣️"],
  ["You ___ wear a helmet when you ride a bike.", "should", "כדאי → should", "🚲"], ["I ___ swim very well.", "can", "יכול → can", "🏊"],
  ["You ___ stop at a red light.", "must", "חובה → must", "🚦"], ["Birds ___ fly.", "can", "יכולים → can", "🐦"],
  ["You ___ eat so much candy.", "shouldn't", "לא כדאי → shouldn't", "🍬"], ["We ___ be quiet in the library.", "must", "חובה → must", "📚"],
  ["Penguins ___ fly.", "can't", "לא יכולים → can't", "🐧"], ["You look tired. You ___ go to bed.", "should", "כדאי → should", "🛏️"]];
// רמה 3 ומטה: רק can / can't · רמה 4: גם must / should · רמה 5: גם mustn't ו-don't have to · רמה 6: גם might
const MODAL_MORE = [["You ___ touch the hot stove!", "mustn't", "אסור → mustn't", "🔥"],
  ["It is Saturday. You ___ get up early.", "don't have to", "לא חייבים → don't have to", "🛌"],
  ["You ___ run next to the pool.", "mustn't", "אסור → mustn't", "🏊"],
  ["We have a lot of time. We ___ hurry.", "don't have to", "לא חייבים → don't have to", "⏳"]];
const MODAL_MAY = [["Take an umbrella — it ___ rain later.", "might", "אולי יקרה → might", "☂️"],
  ["I am not sure, but I ___ come to the party.", "might", "אולי → might", "🎉"]];
E.modal = (lv = 4) => {
  const easy = MODAL.filter((m) => m[1] === "can" || m[1] === "can't");
  const rows = lv <= 3 ? easy
    : lv === 4 ? MODAL
    : lv === 5 ? [...MODAL, ...MODAL_MORE, ...MODAL_MORE]
    : [...MODAL, ...MODAL_MORE, ...MODAL_MAY, ...MODAL_MAY];
  const pool = lv <= 3 ? ["can", "can't", "must", "should"]
    : lv === 4 ? ["can", "must", "should", "can't", "shouldn't"]
    : lv === 5 ? ["can", "must", "should", "can't", "shouldn't", "mustn't", "don't have to"]
    : ["can", "must", "should", "mustn't", "don't have to", "might", "shouldn't"];
  const [s, a, ex, e] = pick(rows);
  return { q: "בחר את המילה המתאימה:", en: s, ...opts(a, pool.filter((w) => w !== a)), ex, scene: { type: "fact", items: [e], answer: a, ansE: "✅" } };
};

const PERFECT_VERBS = VERBS.filter((v) => v[4] !== v[3]);
// רמה 4 ומטה: רק have / has · רמה 5: גם צורה שלישית (V3) · רמה 6: גם since / for / ever / never / already / yet
const PERF_WORDS = [["I have lived here ___ 2015.", "since", ["for", "ago", "yet"], "since = מאז נקודת זמן", "🏠"],
  ["She has worked here ___ five years.", "for", ["since", "ago", "already"], "for = במשך תקופה", "💼"],
  ["Have you ___ been to Eilat?", "ever", ["never", "yet", "since"], "ever = אי פעם, בשאלה", "🌴"],
  ["I have ___ finished my homework!", "already", ["yet", "ever", "since"], "already = כבר", "📚"],
  ["He hasn't eaten lunch ___.", "yet", ["already", "ever", "since"], "yet = עדיין, בסוף משפט שלילה", "🍽️"],
  ["We have ___ seen snow.", "never", ["ever", "yet", "for"], "never = אף פעם לא", "❄️"]];
E.perfect = (lv = 5) => {
  const S = pick(SUBJECTS), V = pick(PERFECT_VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e: V[6] }, { e: "✅" }] };
  if (lv >= 6 && Math.random() < 0.5) {
    const [s, a, wrongs, ex, e] = pick(PERF_WORDS);
    return { q: "בחר את המילה המתאימה:", en: s, ...opts(a, wrongs), ex, scene: { type: "fact", items: [e], answer: a } };
  }
  if (lv <= 4 || Math.random() < 0.5) {
    return { q: "השלם (Present Perfect):", en: `${S.en} ___ already ${V[4]} ${obj}.`, ...opts(S.have, ["have", "has", "is", "did"]),
      ex: `Present Perfect = have / has + V3. ${S.lo} → ${S.have}`, scene };
  }
  return { q: "בחר את הצורה השלישית (V3):", en: `${S.en} ${S.have} never ___ ${obj}.`, ...opts(V[4], [V[3], V[0], V[2]]),
    ex: `${V[0]} → ${V[3]} → ${V[4]}`, scene };
};

const COND = [["If it rains, we ___ stay at home.", "will", ["would", "are", "did"], "תנאי אפשרי: If + הווה, ואז will + פועל", "🌧️"],
  ["If you heat ice, it ___.", "melts", ["melt", "melted", "melting"], "עובדה קבועה: If + הווה, ואז הווה", "🧊"],
  ["If I ___ a bird, I would fly.", "were", ["am", "will be", "is"], "תנאי דמיוני: If + were, ואז would + פועל", "🐦"],
  ["If I had a million shekels, I ___ buy a boat.", "would", ["will", "am", "did"], "תנאי דמיוני: If + עבר, ואז would + פועל", "⛵"],
  ["If you study, you ___ pass the test.", "will", ["would", "did", "are"], "תנאי אפשרי: If + הווה, ואז will + פועל", "📚"],
  ["If she ___ early, she will catch the bus.", "leaves", ["leave", "left", "will leave"], "אחרי If בתנאי אפשרי בא הווה (she + s)", "🚌"],
  ["If we ___ a dog, we would walk it every day.", "had", ["have", "has", "will have"], "תנאי דמיוני: If + עבר", "🐶"],
  ["If you mix red and blue, you ___ purple.", "get", ["got", "getting", "will got"], "עובדה קבועה: If + הווה, ואז הווה", "🟣"]];
// רמה 4 ומטה: תנאי אפשרי ועובדות (If + הווה) · רמה 5: גם תנאי דמיוני · רמה 6: בעיקר תנאי דמיוני
const SECOND_COND = (r) => ["were", "would", "had"].includes(r[1]);
E.cond = (lv = 5) => {
  const second = COND.filter(SECOND_COND);
  const rows = lv <= 4 ? COND.filter((r) => !SECOND_COND(r))
    : lv >= 6 ? [...second, ...second, ...second, COND[0], COND[1]] : COND;
  const [s, a, wrongs, ex, e] = pick(rows);
  return { q: "השלם את משפט התנאי:", en: s, ...opts(a, wrongs), ex, scene: { type: "seq", arrows: true, frames: [{ e: "🔀", cap: "If" }, { e }] } };
};

const PASSIVE = [["Coffee ___ grown in Brazil.", "is", "☕", "הווה, יחיד → is + V3"], ["The classrooms ___ cleaned every evening.", "are", "🧹", "הווה, רבים → are + V3"],
  ["Milk ___ sold in every shop.", "is", "🥛", "הווה, יחיד → is + V3"],
  ["The cake ___ made by Grandma yesterday.", "was", "🎂", "עבר, יחיד → was + V3"], ["English ___ spoken in many countries.", "is", "🌍", "הווה, יחיד → is + V3"],
  ["These cars ___ made in Japan.", "are", "🚗", "הווה, רבים → are + V3"], ["The letters ___ written last week.", "were", "✉️", "עבר, רבים → were + V3"],
  ["The window ___ broken by the ball.", "was", "🪟", "עבר, יחיד → was + V3"], ["Bread ___ baked here every morning.", "is", "🍞", "הווה, יחיד → is + V3"],
  ["The songs ___ sung by the children.", "were", "🎤", "עבר, רבים → were + V3"], ["Honey ___ made by bees.", "is", "🍯", "הווה, יחיד → is + V3"]];
const PASSIVE_V3 = [["The house was ___ in 1990.", "built", ["build", "building", "builded"], "🏠"], ["The book was ___ by a famous writer.", "written", ["wrote", "write", "writing"], "📖"],
  ["The cookies were ___ by the kids.", "eaten", ["ate", "eat", "eating"], "🍪"], ["The phone was ___ in the park.", "found", ["find", "finded", "finding"], "📱"]];
// רמה 4 ומטה: סביל בהווה (is / are) · רמה 5: גם עבר (was / were) · רמה 6: גם צורה שלישית וסביל בעתיד
const PASSIVE_FUT = [["The new school ___ built next year.", "will be", ["will", "is", "was"], "🏫"],
  ["The cake ___ eaten at the party tomorrow.", "will be", ["will", "is", "was"], "🎂"],
  ["The room ___ cleaned tomorrow morning.", "will be", ["will", "is", "was"], "🧹"]];
E.passive = (lv = 5) => {
  if (lv >= 6 && Math.random() < 0.35) {
    const [s, a, wrongs, e] = pick(PASSIVE_FUT);
    return { q: "השלם (סביל בעתיד):", en: s, ...opts(a, wrongs), ex: "סביל בעתיד: will be + V3",
      scene: { type: "seq", arrows: false, frames: [{ e }, { e: "🔁" }] } };
  }
  if (lv >= 5 && Math.random() < 0.35) {
    const [s, a, wrongs, e] = pick(PASSIVE_V3);
    return { q: "השלם (סביל — צורה שלישית):", en: s, ...opts(a, wrongs), ex: `בסביל: be + V3 → ${a}`, scene: { type: "seq", arrows: false, frames: [{ e }, { e: "🔁" }] } };
  }
  const rows = lv <= 4 ? PASSIVE.filter((r) => r[1] === "is" || r[1] === "are") : PASSIVE;
  const [s, a, e, ex] = pick(rows);
  return { q: "השלם (סביל):", en: s, ...opts(a, ["is", "are", "was", "were"]), ex, scene: { type: "seq", arrows: false, frames: [{ e }, { e: "🔁" }] } };
};

const R_NAMES = [["Tom", "he", "👦"], ["Maya", "she", "👧"], ["Ben", "he", "👦"], ["Lily", "she", "👧"]];
const R_THINGS = [["dog", "🐶", "כלב", "הכלב"], ["cat", "🐱", "חתול", "החתול"], ["kite", "🪁", "עפיפון", "העפיפון"], ["ball", "⚽", "כדור", "הכדור"]];
const R_PLACES = [["park", "בפארק", "🌳"], ["garden", "בגינה", "🌷"], ["yard", "בחצר", "🏡"]];
// רמה 3 ומטה: משפט אחד · רמה 4: שני משפטים · רמה 5: שלושה משפטים ושאלת "מתי" · רמה 6: גם שאלה שהתשובה לא כתובה ישירות
const R_DAYS = [["Sunday", "ביום ראשון"], ["Monday", "ביום שני"], ["Friday", "ביום שישי"]];
const R_GIVERS = [["Grandma", "סבתא"], ["Dad", "אבא"], ["Mom", "אמא"], ["Grandpa", "סבא"]];
E.read = (lv = 4) => {
  const [nm, pr, ne] = pick(R_NAMES), [th, te, thHe, theHe] = pick(R_THINGS), [col, colHe, ce] = pick(COLORS.slice(0, 8)), [pl, plHe, pe] = pick(R_PLACES);
  const f = pr === "she";
  if (lv <= 3) {
    const en1 = `${nm} has a ${col} ${th}.`;
    const sc1 = { type: "story", panels: [[ne, te, ce]] };
    if (Math.random() < 0.5) {
      return { q: `קרא וענה: מה הצבע של ${theHe}?`, en: en1, ...opts(colHe, COLORS.slice(0, 8).map((c) => c[1])),
        ex: `a ${col} ${th} = ${colHe}`, scene: { ...sc1, ans: ce } };
    }
    return { q: `קרא וענה: מה יש ל${nm}?`, en: en1, ...opts(thHe, R_THINGS.map((t) => t[2])), ex: `a ${th} = ${thHe}`, scene: { ...sc1, ans: te } };
  }
  if (lv >= 5) {
    const [day, dayHe] = pick(R_DAYS);
    const [giver, giverHe] = pick(R_GIVERS);
    const en3 = `${nm} has a ${col} ${th}. On ${day}, ${pr} plays with it in the ${pl}. It is a present from ${giver}.`;
    const sc3 = { type: "story", panels: [[ne, te, ce], [ne, pe]] };
    const kind3 = pick(lv >= 6 ? ["who", "who", "when", "place"] : ["when", "when", "place", "color"]);
    if (kind3 === "who") {
      return { q: `קרא וענה: מי ${giverHe === "סבתא" || giverHe === "אמא" ? "נתנה" : "נתן"} ל${nm} את ${theHe} במתנה?`, en: en3,
        ...opts(giverHe, R_GIVERS.map((g) => g[1])), ex: `a present from ${giver} = מתנה מ${giverHe}`, scene: { ...sc3, ans: "🎁" } };
    }
    if (kind3 === "when") {
      return { q: `קרא וענה: מתי ${nm} ${f ? "משחקת" : "משחק"} עם ${theHe}?`, en: en3,
        ...opts(dayHe, R_DAYS.map((d) => d[1]).concat(["בשבת"])), ex: `On ${day} = ${dayHe}`, scene: { ...sc3, ans: "📅" } };
    }
    if (kind3 === "place") {
      return { q: `קרא וענה: איפה ${nm} ${f ? "משחקת" : "משחק"}?`, en: en3,
        ...opts(plHe, R_PLACES.map((p) => p[1]).concat(["בבית הספר"])), ex: `in the ${pl} = ${plHe}`, scene: { ...sc3, ans: pe } };
    }
    return { q: `קרא וענה: מה הצבע של ${theHe}?`, en: en3, ...opts(colHe, COLORS.slice(0, 8).map((c) => c[1])),
      ex: `a ${col} ${th} = ${colHe}`, scene: { ...sc3, ans: ce } };
  }
  const en = `${nm} has a ${col} ${th}. ${cap(pr)} likes to play with it in the ${pl}.`;
  const scene = { type: "story", panels: [[ne, te, ce], [ne, pe]] };
  const kind = pick(["color", "place", "thing"]);
  if (kind === "color") return { q: `קרא וענה: מה הצבע של ${theHe}?`, en, ...opts(colHe, COLORS.slice(0, 8).map((c) => c[1])), ex: `a ${col} ${th} = ${colHe}`, scene: { ...scene, ans: ce } };
  if (kind === "place") return { q: `קרא וענה: איפה ${nm} ${pr === "she" ? "אוהבת" : "אוהב"} לשחק?`, en, ...opts(plHe, R_PLACES.map((p) => p[1]).concat(["בבית הספר"])), ex: `in the ${pl} = ${plHe}`, scene: { ...scene, ans: pe } };
  return { q: `קרא וענה: מה יש ל${nm}?`, en, ...opts(thHe, R_THINGS.map((t) => t[2])), ex: `a ${th} = ${thHe}`, scene: { ...scene, ans: te } };
};

export function genEnTopic(topicId, level) {
  const g = E[topicId];
  return g ? g(Math.max(1, Math.min(6, level || 1))) : null;
}

export const EN_TOPIC_IDS = Object.keys(E);
