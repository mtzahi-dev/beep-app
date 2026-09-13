// נושאי לימוד לכל מקצוע, מותאמים לכיתה.
// g = [מכיתה, עד כיתה] באינדקס 0=א' ... 8=ט'. photo = מפתח לתמונה אמיתית (photos.js).

export const GRADE_NAMES = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'", "ט'"];

const T = (id, label, emoji, g, extra = {}) => ({ id, label, emoji, g, min: 1, ...extra });

export const TOPICS = {
  math: [
    T("add", "חיבור עד 20", "➕", [0, 1]),
    T("sub", "חיסור עד 20", "➖", [0, 1]),
    T("place", "ערך הספרה", "🧱", [1, 3]),
    T("word", "בעיות מילוליות", "🧩", [0, 4]),
    T("mul", "לוח הכפל", "✖️", [2, 3]),
    T("addbig", "חיבור וחיסור במספרים גדולים", "🏗️", [2, 5]),
    T("frac", "מה זה שבר?", "🍕", [2, 4], { photo: "pizza" }),
    T("div", "חילוק ושארית", "➗", [3, 4]),
    T("geo", "היקף ושטח", "📐", [3, 6], { photo: "ruler" }),
    T("mulbig", "כפל במספרים גדולים", "🚀", [3, 6]),
    T("longdiv", "חילוק ארוך", "🧮", [4, 6]),
    T("fracops", "פעולות בשברים", "🥧", [4, 6]),
    T("decimal", "מספרים עשרוניים", "🔹", [4, 6]),
    T("order", "סדר פעולות חשבון", "🎯", [4, 7]),
    T("angles", "זוויות ומשולשים", "📏", [4, 7], { photo: "protractor" }),
    T("stats", "ממוצע והסתברות", "🎲", [4, 8]),
    T("percent", "אחוזים", "💯", [5, 7]),
    T("ratio", "יחס ופרופורציה", "⚖️", [6, 7]),
    T("neg", "מספרים שליליים", "🌡️", [6, 8]),
    T("algebra", "משוואות", "🔤", [6, 8]),
    T("powers", "חזקות ושורשים", "⚡", [6, 8]),
    T("pyth", "משפט פיתגורס", "📐", [7, 8]),
    T("linear", "פונקציה קווית", "📈", [7, 8]),
    T("mix", "הפתעה!", "🎲", [0, 8]),
  ],
  en: [
    T("abc", "אותיות וצלילים ABC", "🔤", [0, 1], { ai: "letters of the alphabet, first sounds, very simple words" }),
    T("vocab", "אוצר מילים", "🧠", [0, 8], { ai: "vocabulary: word meanings, opposites, matching a word to an emoji picture" }),
    T("colors", "צבעים ומספרים", "🌈", [0, 2], { ai: "colors and numbers one to twenty" }),
    T("be", "am / is / are", "🗝️", [1, 3], { ai: "the verb to be: am, is, are" }),
    T("prep", "מילות מקום", "📦", [1, 3], { ai: "prepositions of place: in, on, under, next to, behind" }),
    T("opp", "הפכים ותארים", "↔️", [2, 4], { ai: "adjectives and their opposites" }),
    T("have", "have / has ורבים", "🎒", [2, 4], { ai: "have and has, plural nouns" }),
    T("wh", "מילות שאלה", "❓", [3, 5], { ai: "question words: who, what, where, when, why, how" }),
    T("prog", "Present Progressive", "🏃", [3, 5], { ai: "present progressive: am/is/are + verb-ing" }),
    T("tense", "Present Simple", "⏰", [3, 5], { ai: "present simple: routines, he/she/it + s, do/does questions" }),
    T("past", "Past Simple", "⏮️", [4, 6], { ai: "past simple: regular -ed and irregular verbs" }),
    T("future", "עתיד: will / going to", "🔮", [4, 6], { ai: "future with will and going to" }),
    T("read", "קריאה באנגלית", "📖", [4, 8], { photo: "books", ai: "short reading comprehension: a 1-3 line text with a question about it" }),
    T("comp", "השוואות: bigger / the biggest", "🏆", [5, 7], { ai: "comparatives and superlatives" }),
    T("modal", "can / must / should", "🚦", [5, 7], { ai: "modal verbs: can, must, should" }),
    T("perfect", "Present Perfect", "✅", [6, 8], { ai: "present perfect: have/has + past participle, ever/never/already/yet" }),
    T("cond", "משפטי תנאי If", "🔀", [7, 8], { ai: "first and second conditionals" }),
    T("passive", "סביל Passive", "🔁", [7, 8], { ai: "passive voice in present and past" }),
    T("mix", "הפתעה!", "🎲", [0, 8], { ai: "a fun varied mix of vocabulary, sentences and level-appropriate grammar" }),
  ],
  heb: [
    T("words", "קריאת מילים ומשפטים", "🔠", [0, 1]),
    T("wh", "מי? מה? איפה? מתי?", "🕵️", [0, 2]),
    T("story", "סיפורים קצרים", "📖", [0, 4], { photo: "books" }),
    T("seq", "מה קרה קודם?", "🔢", [1, 4]),
    T("punct", "סימני פיסוק", "❗", [1, 4]),
    T("cause", "סיבה ותוצאה", "🔗", [2, 5]),
    T("info", "קטעי מידע", "📰", [2, 6], { photo: "library" }),
    T("tenses", "עבר, הווה ועתיד", "⏳", [2, 5]),
    T("vocab", "מילים חדשות מההקשר", "💡", [2, 8]),
    T("main", "רעיון מרכזי וכותרת", "🎯", [3, 8]),
    T("infer", "בין השורות", "🔍", [3, 8]),
    T("root", "שורש ומשפחות מילים", "🌳", [3, 6]),
    T("fact", "עובדה או דעה", "⚖️", [4, 8]),
    T("fig", "שפה ציורית", "🎨", [5, 8]),
    T("argue", "טקסט טיעוני", "📣", [6, 8]),
    T("mix", "הפתעה!", "🎲", [0, 8]),
  ],
  sci: [
    T("senses", "חמשת החושים", "👀", [0, 2], { photo: "eye" }),
    T("animals", "בעלי חיים", "🦁", [0, 3], { photo: "lion" }),
    T("plants", "צמחים", "🌻", [0, 3], { photo: "sunflower" }),
    T("weather", "מזג אוויר ועונות", "🌦️", [0, 2], { photo: "rainbow" }),
    T("body", "גוף האדם", "🫀", [1, 4], { photo: "skeleton" }),
    T("earth", "כדור הארץ והחלל", "🌍", [1, 5], { photo: "earth" }),
    T("habitats", "בתי גידול ושרשרת מזון", "🌳", [2, 5], { photo: "rainforest" }),
    T("matter", "מצבי צבירה ומחזור המים", "💧", [2, 5], { photo: "ice" }),
    T("light", "אור, צל וקול", "🔦", [3, 5], { photo: "prism" }),
    T("forces", "כוחות ומגנטים", "🧲", [3, 6], { photo: "magnet" }),
    T("electricity", "חשמל", "💡", [4, 7], { photo: "bulb" }),
    T("volcano", "הרי געש ורעידות אדמה", "🌋", [4, 7], { photo: "volcano" }),
    T("energy", "אנרגיה וסביבה", "♻️", [4, 8], { photo: "solar" }),
    T("cells", "תאים ומיקרוסקופ", "🔬", [5, 8], { photo: "cells" }),
    T("photosyn", "פוטוסינתזה", "🍃", [5, 8], { photo: "leaf" }),
    T("systems", "מערכות בגוף", "🫁", [5, 8], { photo: "heart" }),
    T("chem", "חומרים ותגובות", "🧪", [6, 8], { photo: "lab" }),
    T("mix", "הפתעה!", "🎲", [0, 8]),
  ],
};

// נושא מתאים לכיתה? (בלי כיתה — הכול מתאים)
export function inGrade(t, grade) {
  if (grade == null || !t.g) return true;
  return grade >= t.g[0] && grade <= t.g[1];
}

export function gradeLabel(t) {
  if (!t.g || t.id === "mix") return "";
  return t.g[0] === t.g[1] ? `כיתה ${GRADE_NAMES[t.g[0]]}` : `כיתות ${GRADE_NAMES[t.g[0]]}–${GRADE_NAMES[t.g[1]]}`;
}

// שמות נושאים ישנים (להיסטוריה של משתמשים קיימים)
export const TOPIC_ALIASES = { en: { sent: "משפטים 💬" } };
