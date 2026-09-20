// מילון תמונות לאנימציות: מילה (עברית/אנגלית) → אימוג'י.
// משמש לאיור אוטומטי של כל תרגיל — מספרים, חפצים, דמויות ופעולות שמוזכרים בו.

const HE_PAIRS = [
  // בעלי חיים
  ["כלב כלבים גור גורים כלבלב רקסי", "🐶"], ["חתול חתולים חתלתול חתלתולים", "🐱"], ["פרה פרות", "🐮"],
  ["ציפור ציפורים", "🐦"], ["דג דגים", "🐟"], ["דג זהב", "🐠"], ["תרנגולת תרנגולות", "🐔"], ["סוס סוסים", "🐴"],
  ["ארנב ארנבים", "🐰"], ["ברווז ברווזים", "🦆"], ["צב צבים", "🐢"], ["נחש נחשים", "🐍"], ["לטאה לטאות", "🦎"],
  ["דולפין דולפינים", "🐬"], ["ינשוף ינשופים", "🦉"], ["דבורה דבורים", "🐝"], ["פרפר פרפרים", "🦋"], ["זחל", "🐛"],
  ["צפרדע צפרדעים", "🐸"], ["פיל פילים", "🐘"], ["עכבר עכברים", "🐭"], ["אריה אריות", "🦁"], ["תוכי", "🦜"],
  ["פינגווין", "🐧"], ["עטלף", "🦇"], ["כבש כבשים", "🐑"], ["נוצות נוצה", "🪶"],
  // אוכל
  ["סוכריה סוכריות ממתק ממתקים", "🍬"], ["עוגיה עוגיות", "🍪"], ["תפוח תפוחים", "🍎"], ["שוקולד שוקולדים", "🍫"],
  ["פיצה פיצות", "🍕"], ["עוגה עוגות עוגת", "🎂"], ["לחם", "🍞"], ["חלב", "🥛"], ["גלידה גלידות", "🍦"],
  ["בננה בננות", "🍌"], ["ביצה ביצים", "🥚"], ["דבש", "🍯"], ["פירות פרי", "🍇"], ["ירקות ירק", "🥕"], ["אוכל ארוחה", "🍽️"],
  // חפצים
  ["בלון בלונים", "🎈"], ["כדור כדורים", "⚽"], ["קופסה קופסאות קופסה", "📦"], ["ספר ספרים", "📖"], ["כובע", "🧢"],
  ["מטרייה", "☔"], ["תיק", "🎒"], ["מדליה", "🏅"], ["מזוודות מזוודה", "🧳"], ["דרכונים דרכון", "🛂"],
  ["מכתב מכתבים דואר", "✉️"], ["מחשב", "💻"], ["אופניים", "🚲"], ["אוטובוס", "🚌"], ["מכונית מכוניות", "🚗"],
  ["כרטיס כרטיסים", "🎟️"], ["מעיל", "🧥"], ["מפתח מפתחות", "🔑"], ["צעצוע צעצועים", "🧸"], ["מיטה", "🛏️"],
  ["מתנה מתנות", "🎁"], ["מדבקה מדבקות", "⭐"], ["עיפרון עפרונות", "✏️"], ["חלליות חללית", "🚀"], ["שירים שיר", "🎵"],
  ["משחקים משחק", "🎮"], ["ציורים ציור", "🖼️"], ["צלוחית", "🥣"], ["כסף", "💰"],
  // טבע ומקומות
  ["גשם", "🌧️"], ["שמש", "☀️"], ["ירח", "🌙"], ["כוכבים כוכב", "⭐"], ["ים", "🏖️"], ["גינה פארק", "🌷"],
  ["פרח פרחים", "🌸"], ["עץ עצים", "🌳"], ["עלה עלים", "🍃"], ["זרע", "🌰"], ["צמח צמחים", "🌱"], ["שורש", "🫚"],
  ["בית הביתה", "🏠"], ["בית ספר", "🏫"], ["כיתה", "🏫"], ["גן", "🎠"], ["חנות סופר", "🏪"], ["בריכה", "🏊"],
  ["חצר", "🏡"], ["גדר", "🚧"], ["הר", "⛰️"], ["נהר", "🏞️"], ["כדור הארץ", "🌍"], ["חלל", "🚀"], ["כוכבי לכת", "🪐"],
  ["מים", "💧"], ["אש", "🔥"], ["קרח", "🧊"], ["אדים", "♨️"], ["חמצן אוויר", "💨"], ["קיץ", "☀️"], ["חורף", "❄️"],
  ["לילה", "🌙"], ["בוקר", "🌅"], ["צל", "🌳"], ["קן", "🪺"],
  // אנשים
  ["אימא", "👩"], ["אבא", "👨"], ["סבתא", "👵"], ["סבא", "👴"], ["ילד ילדים", "🧒"], ["ילדה ילדות", "👧"],
  ["חבר חברים חברה", "🧒"], ["תינוק", "👶"], ["מורה", "🧑‍🏫"], ["שומר", "💂"], ["מאמנת מאמן", "🧑‍🏫"],
  ["משפחה", "👨‍👩‍👧"], ["הורים", "👨‍👩‍👧"], ["שכנים", "🏘️"], ["תושבים", "👥"], ["ממציאים", "🧑‍🔬"], ["אסטרונאוט", "👨‍🚀"],
  // גוף
  ["לב", "🫀"], ["ריאות", "🫁"], ["מוח", "🧠"], ["אוזניים אוזן", "👂"], ["עיניים עין", "👀"], ["אף", "👃"],
  ["ידיים יד", "✋"], ["רגליים רגל", "🦵"], ["שיניים", "🦷"], ["דם", "🩸"], ["שריר", "💪"], ["עור", "🖐️"], ["חיידקים", "🦠"],
  // צבעים
  ["אדום אדומה", "🔴"], ["כחול כחולה", "🔵"], ["צהוב צהובה", "🟡"], ["ירוק ירוקה", "🟢"], ["שחור שחורה", "⚫"],
  ["לבן לבנה", "⚪"], ["סגול סגולה", "🟣"], ["כתום כתומה", "🟠"], ["חום חומה", "🟤"], ["ורוד ורודה", "🩷"],
  // מדע
  ["זימים", "🫧"], ["סנפירים", "🐠"], ["ברך", "🦵"], ["שיער", "💇"], ["קיבה", "🍽️"], ["עצמות עצם", "🦴"],
  ["כבד", "🫘"], ["עננים ענן", "☁️"], ["רוח", "🌬️"], ["חול", "🏜️"], ["מזון", "🍎"], ["אבנים", "🪨"], ["נורות", "💡"],
  ["אור", "💡"], ["גלגול", "🦋"], ["נדידה", "🦢"], ["שינה", "😴"], ["קפיצה", "🤸"], ["הליום", "🎈"], ["מוצק", "🧊"],
  ["נוזל", "💧"], ["גז", "♨️"], ["נוגה מאדים צדק", "🪐"], ["גאות שפל", "🌊"], ["סירות", "⛵"], ["ממתקים", "🍬"],
  ["נשימה", "💨"], ["חושך", "🌑"], ["נבוט", "🌱"], ["איבר", "🫀"], ["שעה", "⏰"], ["שבוע", "🗓️"], ["חודש", "📆"], ["שנה", "🎆"],
  // אירועים ורגשות
  ["יום הולדת", "🎂"], ["מבחן", "📝"], ["מסיבה", "🎉"], ["תחרות", "🏆"], ["אימונים", "🏋️"], ["חיוך", "😊"],
  ["כדורגל", "⚽"], ["שחייה", "🏊"], ["טלוויזיה", "📺"], ["קופה", "🎟️"],
];

export const HE_EMOJI = new Map();
for (const [words, e] of HE_PAIRS) {
  if (words.includes(" ") && ["בית ספר", "דג זהב", "כדור הארץ", "כוכבי לכת", "יום הולדת"].includes(words)) HE_EMOJI.set(words, e);
  else for (const w of words.split(" ")) HE_EMOJI.set(w, e);
}

export const BOY_NAMES = new Set(["דן", "דני", "יובל", "עומר", "רון", "יוסי", "איתי", "גיל", "עידו", "טום", "בן", "יונתן"]);
export const GIRL_NAMES = new Set(["רוני", "מיכל", "טלי", "נועה", "דנה", "תמר", "שירה", "מאיה", "רותם"]);

// מילה עברית → אימוג'י, כולל הסרת תחיליות (ו/ה/ב/ל/מ/ש/כ) ושמות פרטיים
export function heEmoji(word) {
  const w = String(word || "").replace(/[֑-ׇ"'׳״.,!?:;()]/g, "");
  if (!w) return null;
  const tries = [w];
  for (let i = 1; i <= 2 && i < w.length - 1; i++) if (/[והבלמשכ]/.test(w[i - 1])) tries.push(w.slice(i));
  else break;
  for (const t of tries) {
    if (HE_EMOJI.has(t)) return HE_EMOJI.get(t);
    if (BOY_NAMES.has(t)) return "👦";
    if (GIRL_NAMES.has(t)) return "👧";
  }
  return null;
}

// צירוף של שתי מילים ("כדור הארץ", "בבית הספר") — מילה-מילה יצא ⚽ לכדור הארץ ו-🏠📖 לבית הספר
const HE_PHRASES = {
  "גן חיות": "🦁", "גן ילדים": "🧸", "כוכב לכת": "🪐", "כוכב חמה": "🪐", "מערכת השמש": "🪐",
  "ארוחת בוקר": "🍳", "ארוחת ערב": "🍽️", "בית חולים": "🏥", "קשת בענן": "🌈", "חוף הים": "🏖️",
};
function phraseEmoji(a, b) {
  const clean = (s) => String(s || "").replace(/[֑-ׇ"'׳״.,!?:;()]/g, "");
  const A = clean(a);
  const B = clean(b);
  if (A.length < 2 || B.length < 2) return null;
  const firsts = [A];
  for (let i = 1; i <= 2 && i < A.length - 1; i++) if (/[והבלמשכ]/.test(A[i - 1])) firsts.push(A.slice(i));
  else break;
  const seconds = B[0] === "ה" && B.length > 2 ? [B, B.slice(1)] : [B];
  for (const f of firsts) {
    for (const s of seconds) {
      const k = `${f} ${s}`;
      if (HE_EMOJI.has(k)) return HE_EMOJI.get(k);
      if (HE_PHRASES[k]) return HE_PHRASES[k];
    }
  }
  return null;
}

// כל התמונות שבטקסט לפי הסדר: קודם צירופים, ואז מילה בודדת (עברית או אנגלית)
export function emojisIn(text) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const p = i + 1 < words.length ? phraseEmoji(words[i], words[i + 1]) : null;
    if (p) { out.push(p); i++; continue; }
    const e = heEmoji(words[i]) || enEmoji(words[i]);
    if (e) out.push(e);
  }
  return out;
}

const EN_EXTRA = {
  school: "🏫", pizza: "🍕", soccer: "⚽", box: "📦", toys: "🧸", beach: "🏖️", movie: "🎬", sandcastle: "🏰",
  homework: "📚", grandma: "👵", music: "🎵", class: "🎒", sky: "⛅", grass: "🌿", roof: "🏠", tv: "📺",
  keys: "🔑", bus: "🚌", plane: "✈️", london: "🇬🇧", eilat: "🏖️", bag: "🎒", boy: "🧒", sister: "👧",
  student: "🧑‍🎓", world: "🌍", dinner: "🍽️", toy: "🧸", cats: "🐱", dogs: "🐶", garden: "🌷", table: "🪑",
  friends: "🤝", outside: "🌳", candy: "🍬", balloon: "🎈",
  red: "🔴", blue: "🔵", purple: "🟣", pink: "🩷", orange: "🟠", brown: "🟤", gray: "🩶", grey: "🩶",
  one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣", five: "5️⃣", six: "6️⃣", ten: "🔟",
};
const EN_PEOPLE = { i: "🙋", you: "🫵", he: "👦", she: "👧", it: "🐾", we: "👨‍👩‍👧", they: "👫", tom: "👦", maya: "👧", dana: "👧", ben: "👦", my: null };
const EN_VERBS = {
  play: "⚽", plays: "⚽", played: "⚽", go: "🚶", goes: "🚶", went: "🚶", eat: "🍽️", eats: "🍽️", ate: "🍽️",
  drink: "🥤", drinks: "🥤", watch: "📺", watches: "📺", watched: "📺", build: "🏗️", built: "🏗️", run: "🏃",
  runs: "🏃", ran: "🏃", like: "❤️", likes: "❤️", visit: "🏠", win: "🏆", finish: "✅", finished: "✅", come: "👋",
  forget: "💭", sleep: "😴", lost: "🔍", stay: "🏠", buy: "🛒", missed: "😬", woke: "⏰", swim: "🏊", read: "📖",
};

let EN_WORDS = {};
export function registerWords(WORDS) {
  for (const list of Object.values(WORDS)) for (const [en, he, e] of list) {
    EN_WORDS[en.toLowerCase()] = e;
    if (!HE_EMOJI.has(he)) HE_EMOJI.set(he, e);
  }
}

export function enEmoji(word) {
  const w = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return null;
  return EN_WORDS[w] || EN_EXTRA[w] || EN_VERBS[w] || EN_EXTRA[w.replace(/s$/, "")] || EN_WORDS[w.replace(/s$/, "")] || null;
}
export const enPerson = (word) => EN_PEOPLE[String(word || "").toLowerCase()] || null;
export const enVerb = (word) => EN_VERBS[String(word || "").toLowerCase()] || null;

// מילות תיאור: לאימוג'י שלהן ("small" → 🐭) יש מקום בשאלות אוצר מילים, אבל הן לא החפץ שבמשפט
const EN_MODIFIERS = new Set(["small", "smaller", "smallest", "big", "bigger", "biggest", "little", "tall", "taller",
  "short", "shorter", "long", "longer", "old", "older", "new", "newer", "young", "younger", "happy", "happier",
  "sad", "sadder", "fast", "faster", "fastest", "slow", "slower", "hot", "hotter", "cold", "colder", "warm",
  "strong", "stronger", "weak", "easy", "easier", "difficult", "hard", "harder", "funny", "funnier", "boring",
  "brave", "tired", "hungry", "thirsty", "angry", "cheap", "cheaper", "expensive", "dangerous", "beautiful",
  "pretty", "clean", "dirty", "loud", "quiet", "heavy", "always", "never", "sometimes", "usually", "often",
  "suddenly", "early", "earlier", "late", "later", "quickly", "slowly", "very", "really"]);
export const enModifier = (word) => EN_MODIFIERS.has(String(word || "").toLowerCase().replace(/[^a-z]/g, ""));
// החפץ שבמשפט: "Tom has a small dog" צריך לצייר כלב, לא את העכבר של small
export const enThing = (word) => (enModifier(word) ? null : enEmoji(word));

// זמן במשפט באנגלית: עבר / הווה קבוע / עתיד
export function enTime(sentence) {
  const s = String(sentence || "").toLowerCase();
  if (/\b(yesterday|ago|last)\b/.test(s)) return "past";
  if (/\b(tomorrow|next|will|won't)\b/.test(s)) return "future";
  if (/\b(every|always|on friday|in the evening|usually)\b/.test(s)) return "always";
  return null;
}
