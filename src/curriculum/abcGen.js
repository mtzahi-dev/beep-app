// אותיות ומילים לכיתה א': הכרת האותיות, האות הפותחת, הברות ומילים ראשונות.
// בגיל הזה עוד לא קוראים הוראות — לכן בכל שאלה יש ציור או האות עצמה בגדול, והשאלה מוקראת.

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[rnd(0, a.length - 1)];

// אות, שם האות
const LETTERS = [
  ["א", "אלף"], ["ב", "בית"], ["ג", "גימל"], ["ד", "דלת"], ["ה", "הא"], ["ו", "וו"], ["ז", "זין"],
  ["ח", "חית"], ["ט", "טית"], ["י", "יוד"], ["כ", "כף"], ["ל", "למד"], ["מ", "מם"], ["נ", "נון"],
  ["ס", "סמך"], ["ע", "עין"], ["פ", "פא"], ["צ", "צדי"], ["ק", "קוף"], ["ר", "ריש"], ["ש", "שין"], ["ת", "תו"],
];

// מילה, ציור, מספר הברות
const WORDS = [
  ["כלב", "🐶", 2], ["חתול", "🐱", 2], ["שמש", "☀️", 2], ["ירח", "🌙", 3], ["בית", "🏠", 2],
  ["ספר", "📖", 2], ["עץ", "🌳", 1], ["דג", "🐟", 1], ["פרח", "🌸", 2], ["תפוח", "🍎", 3],
  ["בננה", "🍌", 3], ["עוגה", "🎂", 2], ["חלב", "🥛", 2], ["כדור", "⚽", 2], ["מטוס", "✈️", 2],
  ["ילד", "🧒", 2], ["ילדה", "👧", 2], ["אמא", "👩", 2], ["אבא", "👨", 2], ["פרפר", "🦋", 2],
  ["אריה", "🦁", 2], ["פיל", "🐘", 1], ["סוס", "🐴", 1], ["ציפור", "🐦", 2], ["ביצה", "🥚", 2],
  ["גלידה", "🍦", 3], ["פיצה", "🍕", 2], ["כיסא", "🪑", 2], ["מיטה", "🛏️", 2], ["שעון", "⏰", 2],
  ["תיק", "🎒", 1], ["בלון", "🎈", 2], ["כוכב", "⭐", 2], ["לחם", "🍞", 2], ["גזר", "🥕", 2],
  ["פרה", "🐮", 2], ["ברווז", "🦆", 2], ["צפרדע", "🐸", 3], ["גשם", "🌧️", 2], ["שלג", "❄️", 2],
  ["רכבת", "🚆", 3], ["מכונית", "🚗", 3], ["אופניים", "🚲", 4], ["תרנגולת", "🐔", 4], ["עיפרון", "✏️", 3],
  ["מפתח", "🔑", 3],
];
const EASY = WORDS.filter((w) => w[2] <= 2 && w[0].length <= 4);

const letterOpts = (correct) => {
  const wrongs = shuffle(LETTERS.filter((l) => l[0] !== correct)).slice(0, 3).map((l) => l[0]);
  return shuffle([correct, ...wrongs]);
};

const G = {};

// האות בגדול על הבמה, והתשובות הן שמות האותיות (או להפך)
G.letters = (lv) => {
  const pool = lv <= 2 ? LETTERS.slice(0, 11) : LETTERS;
  const kind = rnd(0, 2);
  if (kind === 0) {
    const [ch, name] = pick(pool);
    const wrongs = shuffle(pool.filter((l) => l[0] !== ch)).slice(0, 3).map((l) => l[1]);
    const options = shuffle([name, ...wrongs]);
    return {
      q: "איזו אות זאת?", options, c: options.indexOf(name), ex: `זאת האות ${name}`,
      scene: { type: "fact", tokens: [ch, "___"], answer: name },
    };
  }
  if (kind === 1) {
    const [ch, name] = pick(pool);
    const options = letterOpts(ch);
    return {
      q: `איזו אות היא ${name}?`, options, c: options.indexOf(ch), ex: `${name} נכתבת ככה: ${ch}`,
      scene: { type: "fact", items: ["🔡"], answer: ch },
    };
  }
  const i = rnd(0, (lv <= 2 ? 9 : LETTERS.length - 2));
  const a = LETTERS[i][0];
  const b = LETTERS[i + 1][0];
  const options = letterOpts(b);
  return {
    q: `איזו אות באה אחרי ${a}?`, options, c: options.indexOf(b), ex: `אחרי ${a} באה ${b}`,
    scene: { type: "fact", tokens: [a, "___"], answer: b },
  };
};

// האות שפותחת את המילה שבציור
G.sounds = (lv) => {
  const pool = lv <= 2 ? EASY : WORDS;
  const [w, e] = pick(pool);
  const first = w[0];
  if (rnd(0, 1) === 0) {
    const options = letterOpts(first);
    return {
      q: `באיזו אות מתחילה המילה ${w}?`, options, c: options.indexOf(first), ex: `${w} מתחילה באות ${first}`,
      pic: e, scene: { type: "seq", frames: [{ e, anim: "float" }] },
    };
  }
  const others = shuffle(pool.filter((x) => x[0][0] !== first)).slice(0, 3).map((x) => x[0]);
  const options = shuffle([w, ...others]);
  return {
    q: `איזו מילה מתחילה באות ${first}?`, options, c: options.indexOf(w), ex: `${w} מתחילה באות ${first}`,
    scene: { type: "fact", items: [first], answer: w },
  };
};

// מוחאים כפיים לכל הברה וסופרים
G.syll = (lv) => {
  const pool = lv <= 2 ? WORDS.filter((w) => w[2] <= 2) : WORDS;
  const [w, e, n] = pick(pool);
  const nums = [];
  for (const cand of [n, n + 1, n - 1, n + 2, n + 3]) {
    if (cand >= 1 && !nums.includes(cand)) nums.push(cand);
    if (nums.length === 4) break;
  }
  const options = shuffle(nums).map(String);
  return {
    q: `כמה הברות יש במילה ${w}?`, options, c: options.indexOf(String(n)),
    ex: `${w} — ${n} הברות. מוחאים כף לכל הברה 👏`,
    pic: e, scene: { type: "seq", frames: [{ e, anim: "float" }] },
  };
};

// מילים ראשונות: מילה לתמונה, או אות חסרה במילה
G.words = (lv) => {
  const pool = lv <= 2 ? EASY : WORDS;
  const [w, e] = pick(pool);
  if (rnd(0, 1) === 0) {
    const others = shuffle(pool.filter((x) => x[0] !== w)).slice(0, 3).map((x) => x[0]);
    const options = shuffle([w, ...others]);
    return { q: "איזו מילה מתאימה לתמונה?", options, c: options.indexOf(w), ex: `${e} = ${w}`, pic: e };
  }
  const i = rnd(0, Math.min(1, w.length - 1));
  const masked = w.slice(0, i) + "_" + w.slice(i + 1);
  const options = letterOpts(w[i]);
  return {
    q: `איזו אות חסרה במילה ${masked}?`, options, c: options.indexOf(w[i]), ex: `${w} ${e}`,
    pic: e, scene: { type: "fact", tokens: [masked, "___"], answer: w },
  };
};

export const ABC_TOPIC_IDS = ["letters", "sounds", "syll", "words"];
export function genAbcTopic(topicId, level = 1) {
  const g = G[topicId] || G[pick(ABC_TOPIC_IDS)];
  return g(level);
}
