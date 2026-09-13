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
E.colors = (lv) => {
  const kind = pick(["color", "thing", "num"]);
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
E.be = (lv) => {
  const S = pick(SUBJECTS), [adj, ae] = pick(ADJS);
  const scene = { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e: ae, cap: adj }] };
  if (lv >= 3 && Math.random() < 0.4) {
    const ans = cap(S.be);
    return { q: "השלם את השאלה:", en: `___ ${S.lo} ${adj}?`, ...opts(ans, ["Am", "Is", "Are", "Be"]), ex: `${S.lo} → ${S.be}, ובשאלה מתחילים ב-${ans}`, scene };
  }
  const ex = S.en === "I" ? "I תמיד עם am" : S.be === "is" ? `${S.en} — אחד (he / she / it) → is` : `${S.en} — רבים או you → are`;
  return { q: "השלם את המשפט:", en: `${S.en} ___ ${adj}.`, ...opts(S.be, ["am", "is", "are", "be"]), ex, scene };
};

const PREP_THINGS = [["cat", "🐱", "החתול"], ["ball", "⚽", "הכדור"], ["book", "📖", "הספר"], ["dog", "🐶", "הכלב"], ["teddy bear", "🧸", "הדובי"]];
const PREP_REFS = [["box", "📦", "הקופסה", "לקופסה"], ["table", "TABLE", "השולחן", "לשולחן"], ["bed", "🛏️", "המיטה", "למיטה"], ["chair", "🪑", "הכיסא", "לכיסא"]];
E.prep = () => {
  const [t, te, the] = pick(PREP_THINGS), r = pick(PREP_REFS);
  const where = pick(r[0] === "box" ? ["in", "on", "under"] : ["on", "under"]);
  const heWhere = where === "in" ? `בתוך ${r[2]}` : where === "on" ? `על ${r[2]}` : `מתחת ${r[3]}`;
  return { q: `${the} נמצא ${heWhere}. השלם:`, en: `The ${t} is ___ the ${r[0]}.`, ...opts(where, ["in", "on", "under", "next to"]),
    ex: `${where === "in" ? "בתוך" : where === "on" ? "על" : "מתחת"} = ${where}`, scene: { type: "place", thing: te, ref: r[1], where } };
};

const OPP = [["big", "small", "גדול", "קטן"], ["hot", "cold", "חם", "קר"], ["fast", "slow", "מהיר", "איטי"], ["happy", "sad", "שמח", "עצוב"],
  ["tall", "short", "גבוה", "נמוך"], ["old", "young", "זקן", "צעיר"], ["open", "closed", "פתוח", "סגור"], ["full", "empty", "מלא", "ריק"],
  ["easy", "difficult", "קל", "קשה"], ["clean", "dirty", "נקי", "מלוכלך"], ["loud", "quiet", "רועש", "שקט"], ["strong", "weak", "חזק", "חלש"],
  ["early", "late", "מוקדם", "מאוחר"], ["light", "heavy", "קל", "כבד"], ["rich", "poor", "עשיר", "עני"]];
const ANIMATED_OPP = ["big", "small", "hot", "cold", "fast", "slow", "happy", "sad", "easy"];
E.opp = (lv) => {
  const row = pick(lv <= 2 ? OPP.slice(0, 8) : OPP);
  const [a, b, ha, hb] = Math.random() < 0.5 ? row : [row[1], row[0], row[3], row[2]];
  return { w: a, q: `מה ההפך מ-${a}?`, en: `${a} ↔ ___`, ...opts(b, OPP.flatMap((x) => [x[0], x[1]]).filter((x) => x !== a)),
    ex: `${a} ${ha} ↔ ${b} ${hb}`, ...(ANIMATED_OPP.includes(a) ? {} : { scene: { type: "fact", tokens: [a, "↔", "___"], answer: b } }) };
};

const HAVE_THINGS = [["a new bike", "🚲"], ["a big bag", "🎒"], ["a pet cat", "🐱"], ["two brothers", "👦"], ["a red ball", "⚽"], ["a lot of books", "📚"]];
const PLURALS = [["cat", "cats", "מוסיפים s"], ["box", "boxes", "אחרי x מוסיפים es"], ["bus", "buses", "אחרי s מוסיפים es"],
  ["baby", "babies", "y אחרי עיצור הופכת ל-ies"], ["watch", "watches", "אחרי ch מוסיפים es"], ["dish", "dishes", "אחרי sh מוסיפים es"],
  ["child", "children", "צורה מיוחדת"], ["mouse", "mice", "צורה מיוחדת"], ["foot", "feet", "צורה מיוחדת"], ["tooth", "teeth", "צורה מיוחדת"],
  ["man", "men", "צורה מיוחדת"], ["leaf", "leaves", "f הופכת ל-ves"], ["knife", "knives", "f הופכת ל-ves"], ["city", "cities", "y אחרי עיצור הופכת ל-ies"],
  ["sheep", "sheep", "לא משתנה"], ["person", "people", "צורה מיוחדת"]];
E.have = (lv) => {
  if (Math.random() < 0.5) {
    const S = pick(SUBJECTS), [n, e] = pick(HAVE_THINGS);
    return { q: "השלם את המשפט:", en: `${S.en} ___ ${n}.`, ...opts(S.have, ["have", "has", "is", "are"]),
      ex: S.have === "has" ? "he / she / it (או שם של אחד) → has" : "I / you / we / they → have",
      scene: { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e }] } };
  }
  const [s, p, rule] = pick(lv <= 2 ? PLURALS.slice(0, 6) : PLURALS);
  const wrongs = [s + "s", s + "es", s.replace(/y$/, "ies"), s.replace(/fe?$/, "ves"), s + "en", s].filter((x) => x !== p);
  return { w: s, q: `מה צורת הרבים של ${s}?`, en: `one ${s} → two ___`, ...opts(p, wrongs), ex: `${s} → ${p} (${rule})`,
    scene: { type: "fact", tokens: [`1 ${s}`, "→", "___"], answer: p } };
};

const WH = [["___ is your name?", "What", "שואלים על דבר או שם → What"], ["___ do you live?", "Where", "שואלים על מקום → Where"],
  ["___ is your birthday?", "When", "שואלים על זמן → When"], ["___ is your best friend?", "Who", "שואלים על אדם → Who"],
  ["___ are you crying?", "Why", "שואלים על סיבה → Why"], ["___ old are you?", "How", "כמה / איך → How"],
  ["___ is the cat? It is under the bed.", "Where", "התשובה היא מקום → Where"], ["___ did you eat? A sandwich.", "What", "התשובה היא דבר → What"],
  ["___ does the movie start? At five.", "When", "התשובה היא זמן → When"], ["___ made this cake? Grandma did.", "Who", "התשובה היא אדם → Who"]];
const WH_E = { What: "📦", Where: "📍", When: "⏰", Who: "🧑", Why: "🤔", How: "🛠️" };
E.wh = () => {
  const [s, a, ex] = pick(WH);
  return { q: "איזו מילת שאלה מתאימה?", en: s, ...opts(a, Object.keys(WH_E)), ex, scene: { type: "fact", items: ["❓"], answer: a, ansE: WH_E[a] } };
};

E.prog = () => {
  const S = pick(SUBJECTS), V = pick(VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e: V[6], anim: "bob", cap: "now" }] };
  if (Math.random() < 0.5) {
    return { q: "השלם — מה קורה עכשיו?", en: `${S.en} ___ ${V[2]} ${obj} now.`, ...opts(S.be, ["am", "is", "are", "be"]),
      ex: `עכשיו = am / is / are + ing: ${S.lo} ${S.be} ${V[2]}`, scene };
  }
  return { q: "השלם — מה קורה עכשיו?", en: `${S.en} ${S.be} ___ ${obj} now.`, ...opts(V[2], [V[0], V[1], V[3]]), ex: `${V[0]} + ing = ${V[2]}`, scene };
};

E.tense = (lv) => {
  const S = pick(SUBJECTS), V = pick(VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "time", who: S.e, act: V[6], when: "always" };
  if (lv >= 3 && Math.random() < 0.35) {
    const aux = S.third ? "Does" : "Do";
    return { q: "השלם את השאלה:", en: `___ ${S.lo} ${V[0]} ${obj}?`, ...opts(aux, ["Do", "Does", "Is", "Are"]),
      ex: `${S.lo} → ${aux}, והפועל חוזר לצורת הבסיס: ${V[0]}`, scene };
  }
  const ans = S.third ? V[1] : V[0];
  return { q: "השלם את המשפט:", en: `${S.en} ___ ${obj} every day.`, ...opts(ans, [V[0], V[1], V[2], V[3]]),
    ex: S.third ? `${S.en} — he / she / it → מוסיפים s: ${V[1]}` : `${S.en} → בלי s: ${V[0]}`, scene };
};

E.past = (lv) => {
  const S = pick(SUBJECTS), V = pick(VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "time", who: S.e, act: V[6], when: "past" };
  if (lv >= 4 && Math.random() < 0.3) {
    return { q: "השלם את השאלה בעבר:", en: `___ ${S.lo} ${V[0]} ${obj} yesterday?`, ...opts("Did", ["Do", "Does", "Was"]),
      ex: "שאלה בעבר מתחילה ב-Did, והפועל חוזר לצורת הבסיס", scene };
  }
  const wrongReg = V[0].endsWith("e") ? V[0] + "d" : V[0] + "ed";
  return { q: "השלם את המשפט בעבר:", en: `Yesterday ${S.lo} ___ ${obj}.`, ...opts(V[3], [V[0], V[1], wrongReg, V[2]]),
    ex: isRegular(V) ? `עבר רגיל: ${V[0]} + ed = ${V[3]}` : `${V[0]} הוא פועל שובב: ${V[0]} → ${V[3]}`, scene };
};

E.future = (lv) => {
  const S = pick(SUBJECTS), V = pick(VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "time", who: S.e, act: V[6], when: "future" };
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
E.comp = (lv) => {
  if (lv >= 3 && Math.random() < 0.45) {
    const [s, sup, base, cmp, e] = pick(SUPERL);
    return { q: "השלם — הכי...:", en: s, ...opts(sup, [base, cmp, "most " + base]), ex: `the + ${sup}: הכי ${base} מכולם`, scene: { type: "fact", items: [e, "🏆"], answer: sup, ansE: "🥇" } };
  }
  const [adj, cmp, sup, A, B, eA, eB] = pick(COMP);
  const wrong = cmp.startsWith("more") ? adj + "er" : "more " + adj;
  return { q: "השלם — השוואה בין שניים:", en: `${A} is ___ than ${B}.`, ...opts(cmp, [adj, sup, wrong]),
    ex: `משווים בין שניים: ${adj} → ${cmp} + than`, scene: { type: "seq", arrows: false, frames: [{ e: eA, s: 1 }, { e: "⚖️" }, { e: eB }] } };
};

const MODAL = [["You ___ wear a helmet when you ride a bike.", "should", "כדאי → should", "🚲"], ["I ___ swim very well.", "can", "יכול → can", "🏊"],
  ["You ___ stop at a red light.", "must", "חובה → must", "🚦"], ["Birds ___ fly.", "can", "יכולים → can", "🐦"],
  ["You ___ eat so much candy.", "shouldn't", "לא כדאי → shouldn't", "🍬"], ["We ___ be quiet in the library.", "must", "חובה → must", "📚"],
  ["Penguins ___ fly.", "can't", "לא יכולים → can't", "🐧"], ["You look tired. You ___ go to bed.", "should", "כדאי → should", "🛏️"]];
E.modal = () => {
  const [s, a, ex, e] = pick(MODAL);
  return { q: "בחר את המילה המתאימה:", en: s, ...opts(a, ["can", "must", "should", "can't", "shouldn't"]), ex, scene: { type: "fact", items: [e], answer: a, ansE: "✅" } };
};

const PERFECT_VERBS = VERBS.filter((v) => v[4] !== v[3]);
E.perfect = () => {
  const S = pick(SUBJECTS), V = pick(PERFECT_VERBS), obj = pick(OBJ[V[0]]);
  const scene = { type: "seq", arrows: false, frames: [{ e: S.e, cap: S.lo }, { e: V[6] }, { e: "✅" }] };
  if (Math.random() < 0.5) {
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
E.cond = () => {
  const [s, a, wrongs, ex, e] = pick(COND);
  return { q: "השלם את משפט התנאי:", en: s, ...opts(a, wrongs), ex, scene: { type: "seq", arrows: true, frames: [{ e: "🔀", cap: "If" }, { e }] } };
};

const PASSIVE = [["The cake ___ made by Grandma yesterday.", "was", "🎂", "עבר, יחיד → was + V3"], ["English ___ spoken in many countries.", "is", "🌍", "הווה, יחיד → is + V3"],
  ["These cars ___ made in Japan.", "are", "🚗", "הווה, רבים → are + V3"], ["The letters ___ written last week.", "were", "✉️", "עבר, רבים → were + V3"],
  ["The window ___ broken by the ball.", "was", "🪟", "עבר, יחיד → was + V3"], ["Bread ___ baked here every morning.", "is", "🍞", "הווה, יחיד → is + V3"],
  ["The songs ___ sung by the children.", "were", "🎤", "עבר, רבים → were + V3"], ["Honey ___ made by bees.", "is", "🍯", "הווה, יחיד → is + V3"]];
const PASSIVE_V3 = [["The house was ___ in 1990.", "built", ["build", "building", "builded"], "🏠"], ["The book was ___ by a famous writer.", "written", ["wrote", "write", "writing"], "📖"],
  ["The cookies were ___ by the kids.", "eaten", ["ate", "eat", "eating"], "🍪"], ["The phone was ___ in the park.", "found", ["find", "finded", "finding"], "📱"]];
E.passive = () => {
  if (Math.random() < 0.35) {
    const [s, a, wrongs, e] = pick(PASSIVE_V3);
    return { q: "השלם (סביל — צורה שלישית):", en: s, ...opts(a, wrongs), ex: `בסביל: be + V3 → ${a}`, scene: { type: "seq", arrows: false, frames: [{ e }, { e: "🔁" }] } };
  }
  const [s, a, e, ex] = pick(PASSIVE);
  return { q: "השלם (סביל):", en: s, ...opts(a, ["is", "are", "was", "were"]), ex, scene: { type: "seq", arrows: false, frames: [{ e }, { e: "🔁" }] } };
};

const R_NAMES = [["Tom", "he", "👦"], ["Maya", "she", "👧"], ["Ben", "he", "👦"], ["Lily", "she", "👧"]];
const R_THINGS = [["dog", "🐶", "כלב", "הכלב"], ["cat", "🐱", "חתול", "החתול"], ["kite", "🪁", "עפיפון", "העפיפון"], ["ball", "⚽", "כדור", "הכדור"]];
const R_PLACES = [["park", "בפארק", "🌳"], ["garden", "בגינה", "🌷"], ["yard", "בחצר", "🏡"]];
E.read = () => {
  const [nm, pr, ne] = pick(R_NAMES), [th, te, thHe, theHe] = pick(R_THINGS), [col, colHe, ce] = pick(COLORS.slice(0, 8)), [pl, plHe, pe] = pick(R_PLACES);
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
