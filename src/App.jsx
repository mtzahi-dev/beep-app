import React, { useState, useEffect, useRef, useMemo } from "react";
import { synthesize, cleanVoice, defaultVoice } from "./ttsProviders.js";
import { numbersToHebrew } from "./hebNumbers.js";
import { Scene, SceneOverlay, sceneFor, registerWords } from "./Scenes.jsx";

/* ─────────────────────────  בִּיפּ · לומדים בצעדים קטנים  ─────────────────────────
   אב-טיפוס: אפליקציית לימוד לילדים עם קשיי קשב וריכוז (כיתות א'-ט')
   מקצועות: אנגלית + חשבון. עקרונות: מיקרו-צעדים, גירוי אחד בכל רגע, עידוד מתמיד,
   בחירת נושא לפני כל שיעור, אנימציות קצרות לכל מילה ומשפט, אבחון אדפטיבי.
──────────────────────────────────────────────────────────────────────────────────── */

// ---------- נתונים קבועים ----------

const LEVELS = [
  null,
  { name: "ניצנים", emoji: "🌱", ai: "beginner: letter recognition, first sight-words with emoji hints (grade 1-2)" },
  { name: "מגלים", emoji: "🔎", ai: "basic vocabulary: colors, numbers, animals, family words (grade 2-3)" },
  { name: "חוקרים", emoji: "🧭", ai: "simple sentences, am/is/are, basic word meaning, prepositions (grade 3-4)" },
  { name: "טייסים", emoji: "✈️", ai: "present simple, everyday vocabulary, simple questions (grade 4-6)" },
  { name: "אלופים", emoji: "🏆", ai: "past simple, short reading sentences, richer vocabulary (grade 5-7)" },
  { name: "כוכבים", emoji: "🌟", ai: "grammar (conditionals, passive), short reading comprehension (grade 7-9)" },
];

const GRADES = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'", "ט'"];
const GRADE_SEED = [1, 1, 2, 3, 4, 4, 5, 5, 5];

const INTERESTS = [
  { id: "soccer", label: "⚽ כדורגל" },
  { id: "animals", label: "🐶 חיות" },
  { id: "space", label: "🚀 חלל" },
  { id: "music", label: "🎵 מוזיקה" },
  { id: "games", label: "🎮 משחקי מחשב" },
  { id: "food", label: "🍕 אוכל" },
  { id: "nature", label: "🌳 טבע" },
  { id: "art", label: "🎨 יצירה" },
];

const SUBJECTS = {
  en: { label: "אנגלית", emoji: "🔤" },
  math: { label: "חשבון", emoji: "🔢" },
  heb: { label: "הבנת הנקרא", emoji: "📚" },
  sci: { label: "מדעים", emoji: "🔬" },
};

const SUBJECT_IDS = Object.keys(SUBJECTS);

const PARENT_CODE = "1254";

// נושאי לימוד לבחירה לפני כל שיעור — מסוננים לפי רמת הילד (min)
const TOPICS = {
  en: [
    { id: "vocab", label: "אוצר מילים", emoji: "🧠", min: 1, ai: "vocabulary: word meanings, opposites, matching a word to an emoji picture" },
    { id: "sent", label: "משפטים", emoji: "💬", min: 2, ai: "sentence building: fill-in-the-blank, correct word order, prepositions" },
    { id: "tense", label: "זמנים", emoji: "⏰", min: 4, ai: "verb tenses fitting the level (present simple, past simple, etc.)" },
    { id: "read", label: "קריאה", emoji: "📖", min: 5, ai: "short reading comprehension: a 1-2 line text with a question about it" },
    { id: "mix", label: "הפתעה!", emoji: "🎲", min: 1, ai: "a fun varied mix of vocabulary, sentences and level-appropriate grammar" },
  ],
  math: [
    { id: "add", label: "חיבור", emoji: "➕", min: 1 },
    { id: "sub", label: "חיסור", emoji: "➖", min: 1 },
    { id: "word", label: "בעיות בסיפור", emoji: "🧩", min: 2 },
    { id: "mul", label: "כפל", emoji: "✖️", min: 3 },
    { id: "div", label: "חילוק", emoji: "➗", min: 4 },
    { id: "frac", label: "שברים", emoji: "🍕", min: 5 },
    { id: "mix", label: "הפתעה!", emoji: "🎲", min: 1 },
  ],
  heb: [
    { id: "story", label: "סיפורים", emoji: "📖", min: 1 },
    { id: "info", label: "קטעי מידע", emoji: "📰", min: 3 },
    { id: "infer", label: "בין השורות", emoji: "🕵️", min: 4 },
    { id: "mix", label: "הפתעה!", emoji: "🎲", min: 1 },
  ],
  sci: [
    { id: "animals", label: "בעלי חיים", emoji: "🐾", min: 1 },
    { id: "plants", label: "צמחים", emoji: "🌱", min: 1 },
    { id: "body", label: "גוף האדם", emoji: "🫀", min: 2 },
    { id: "earth", label: "כדור הארץ והחלל", emoji: "🌍", min: 2 },
    { id: "mix", label: "הפתעה!", emoji: "🎲", min: 1 },
  ],
};

const PRAISE = ["מעולה! ✨", "בדיוק! 🎯", "אלוף! 🏆", "יש! 💥", "מושלם! 🌟", "כל הכבוד! 👏"];

const ENCOURAGE = [
  "יוצאים לדרך! 🚀",
  "צעד ראשון מאחורינו — ממשיכים!",
  "עברנו את האמצע! 💪",
  "עוד מעט סיימת — צעד וחצי!",
  "צעד אחרון!! 🔥",
];

const GENTLE = ["לא נורא — ככה לומדים 💛", "כמעט! בוא נראה יחד 🤝", "טעות זה חלק מהדרך 💚"];

const LOADING_MSGS = [
  "בִּיפּ מכין שאלות בדיוק בשבילך...",
  "בוחר משהו כיפי במיוחד...",
  "עוד רגע קטן ומתחילים!",
];

// מאגר שאלות אנגלית מובנה — משמש לאבחון וכגיבוי כשה-AI לא זמין
// t = נושא (vocab/sent/tense/read), pic = אילוסטרציית אימוג'י
const BANK = {
  1: [
    { q: "איזו מילה מתאימה לתמונה?", en: "", pic: "🐶", t: "vocab", options: ["dog", "cat", "sun", "ball"], c: 0, ex: "dog = כלב 🐶" },
    { q: "איזו מילה מתאימה לתמונה?", en: "", pic: "🐱", t: "vocab", options: ["fish", "cat", "car", "hat"], c: 1, ex: "cat = חתול 🐱" },
    { q: "איזו מילה מתאימה לתמונה?", en: "", pic: "☀️", t: "vocab", options: ["moon", "star", "sun", "rain"], c: 2, ex: "sun = שמש ☀️" },
    { q: "איזו אות באה אחרי B?", en: "A · B · ___", pic: "🔤", t: "vocab", options: ["A", "C", "D", "E"], c: 1, ex: "הסדר הוא A, B, C" },
    { q: "איזו מילה מתאימה לתמונה?", en: "", pic: "🍎", t: "vocab", options: ["apple", "bread", "milk", "egg"], c: 0, ex: "apple = תפוח 🍎" },
    { q: "איזו מילה מתאימה לתמונה?", en: "", pic: "⚽", t: "vocab", options: ["book", "ball", "bag", "bed"], c: 1, ex: "ball = כדור ⚽" },
  ],
  2: [
    { q: "השלם את המשפט:", en: "The sky is ___", pic: "⛅", t: "sent", options: ["blue", "red", "green", "black"], c: 0, ex: "blue = כחול, כמו השמיים" },
    { q: "איך אומרים 'שלוש' באנגלית?", en: "", pic: "3️⃣", t: "vocab", options: ["two", "three", "four", "five"], c: 1, ex: "three = שלוש" },
    { q: "מה ההפך מ-big?", en: "big ↔ ___", pic: "🐘", t: "vocab", options: ["tall", "hot", "small", "fast"], c: 2, ex: "big = גדול, small = קטן" },
    { q: "כמה אצבעות יש בכף יד?", en: "", pic: "🖐️", t: "vocab", options: ["four", "five", "six", "ten"], c: 1, ex: "five = חמש" },
    { q: "איך אומרים 'בית' באנגלית?", en: "", pic: "🏠", t: "vocab", options: ["house", "horse", "mouse", "hand"], c: 0, ex: "house = בית 🏠" },
    { q: "השלם את המשפט:", en: "The banana is ___", pic: "🍌", t: "sent", options: ["yellow", "blue", "black", "white"], c: 0, ex: "בננה היא צהובה = yellow" },
    { q: "השלם את המשפט:", en: "I have a ___", pic: "🐶", t: "sent", options: ["dog", "sun", "rain", "door"], c: 0, ex: "בתמונה כלב = dog 🐶" },
    { q: "השלם את המשפט:", en: "The grass is ___", pic: "🌿", t: "sent", options: ["green", "red", "purple", "orange"], c: 0, ex: "דשא ירוק = green" },
  ],
  3: [
    { q: "השלם את המשפט:", en: "I ___ a boy", pic: "🧒", t: "sent", options: ["am", "is", "are", "be"], c: 0, ex: "אחרי I תמיד בא am" },
    { q: "מה הפירוש של המילה water?", en: "water", pic: "💧", t: "vocab", options: ["אש", "מים", "רוח", "אדמה"], c: 1, ex: "water = מים 💧" },
    { q: "בחר את המשפט הנכון:", en: "", pic: "🎒", t: "sent", options: ["She has a red bag.", "She have a red bag.", "She has bag red.", "Her has a red bag."], c: 0, ex: "she + has, והצבע לפני שם העצם" },
    { q: "השלם את המשפט:", en: "The cat is ___ the table", pic: "🐈", t: "sent", options: ["in", "on", "at", "to"], c: 1, ex: "on = על. החתול על השולחן 🐱" },
    { q: "איך אומרים 'אני אוהב פיצה'?", en: "", pic: "🍕", t: "sent", options: ["I like pizza", "Me pizza like", "I liking pizza", "Pizza like I"], c: 0, ex: "I like pizza 🍕" },
    { q: "השלם את המשפט:", en: "She ___ my sister", pic: "👧", t: "sent", options: ["is", "am", "are", "be"], c: 0, ex: "אחרי she בא is" },
    { q: "השלם את המשפט:", en: "We ___ good friends", pic: "🤝", t: "sent", options: ["are", "is", "am", "be"], c: 0, ex: "אחרי we בא are" },
    { q: "השלם את המשפט:", en: "The ball is ___ the box", pic: "📦", t: "sent", options: ["in", "on", "at", "to"], c: 0, ex: "in = בתוך הקופסה" },
    { q: "השלם את המשפט:", en: "The cat is ___ the roof", pic: "🏠", t: "sent", options: ["on", "in", "to", "of"], c: 0, ex: "on = על הגג" },
  ],
  4: [
    { q: "השלם את המשפט:", en: "He ___ to school every day", pic: "🏫", t: "tense", options: ["go", "goes", "going", "gone"], c: 1, ex: "he/she/it מקבלים s: goes" },
    { q: "מה הפירוש של always?", en: "always", pic: "⏰", t: "vocab", options: ["לפעמים", "אף פעם", "תמיד", "מחר"], c: 2, ex: "always = תמיד" },
    { q: "בחר את השאלה הנכונה:", en: "", pic: "🎧", t: "sent", options: ["Do you like music?", "Does you like music?", "You like music do?", "Like you music?"], c: 0, ex: "שאלה עם you מתחילה ב-Do" },
    { q: "מה ההפך מ-easy?", en: "easy ↔ ___", pic: "🧗", t: "vocab", options: ["soft", "difficult", "simple", "slow"], c: 1, ex: "easy = קל, difficult = קשה" },
    { q: "השלם את המשפט:", en: "We ___ TV in the evening", pic: "📺", t: "tense", options: ["watches", "watch", "watching", "watched"], c: 1, ex: "we + watch, בלי s" },
    { q: "השלם את המשפט:", en: "She ___ TV every evening", pic: "📺", t: "tense", options: ["watches", "watch", "watching", "watched"], c: 0, ex: "she מקבלת es: watches" },
    { q: "השלם את המשפט:", en: "They ___ soccer on Friday", pic: "⚽", t: "tense", options: ["play", "plays", "playing", "played"], c: 0, ex: "they + play, בלי s" },
    { q: "השלם את המשפט:", en: "My dog ___ very fast", pic: "🐕", t: "tense", options: ["runs", "run", "running", "ran"], c: 0, ex: "הכלב = he, לכן runs" },
    { q: "בחר את השאלה הנכונה:", en: "___ she like pizza?", pic: "🍕", t: "tense", options: ["Does", "Do", "Is", "Are"], c: 0, ex: "שאלה עם she מתחילה ב-Does" },
  ],
  5: [
    { q: "השלם את המשפט:", en: "Yesterday I ___ to the beach", pic: "🏖️", t: "tense", options: ["go", "goes", "went", "going"], c: 2, ex: "עבר של go הוא went" },
    { q: "מה הפירוש של suddenly?", en: "suddenly", pic: "⚡", t: "vocab", options: ["לאט", "פתאום", "בשקט", "שוב"], c: 1, ex: "suddenly = פתאום" },
    { q: "השלם את המשפט:", en: "She ___ her homework an hour ago", pic: "📚", t: "tense", options: ["finish", "finishes", "finished", "finishing"], c: 2, ex: "ago = עבר, לכן finished" },
    { q: "קרא וענה: מה צבע הכלב?", en: "Tom has a dog. The dog is brown.", pic: "🐕", t: "read", options: ["black", "white", "brown", "gray"], c: 2, ex: "brown = חום" },
    { q: "השלם את המשפט:", en: "I ___ never been to London", pic: "🇬🇧", t: "tense", options: ["have", "has", "am", "was"], c: 0, ex: "I + have (Present Perfect)" },
    { q: "השלם את המשפט:", en: "We ___ a movie last night", pic: "🎬", t: "tense", options: ["watched", "watch", "watches", "watching"], c: 0, ex: "last night = עבר: watched" },
    { q: "השלם את המשפט:", en: "He ___ his keys yesterday", pic: "🔑", t: "tense", options: ["lost", "lose", "loses", "losing"], c: 0, ex: "עבר של lose הוא lost" },
    { q: "השלם את המשפט:", en: "They ___ to Eilat last summer", pic: "🏖️", t: "tense", options: ["went", "go", "goes", "going"], c: 0, ex: "עבר של go הוא went" },
    { q: "קרא וענה: כמה חתולים יש למאיה?", en: "Maya has two cats. They sleep on her bed.", pic: "🐱", t: "read", options: ["one", "two", "three", "four"], c: 1, ex: "two = שניים" },
  ],
  6: [
    { q: "השלם את המשפט:", en: "If it rains, we ___ stay home", pic: "🌧️", t: "tense", options: ["will", "would", "did", "were"], c: 0, ex: "תנאי ראשון: if + הווה, will" },
    { q: "מה הפירוש של although?", en: "although", pic: "🤔", t: "vocab", options: ["בגלל ש...", "למרות ש...", "כדי ש...", "לפני ש..."], c: 1, ex: "although = למרות ש..." },
    { q: "השלם את המשפט:", en: "English ___ spoken all over the world", pic: "🌍", t: "tense", options: ["is", "are", "does", "has"], c: 0, ex: "סביל: is spoken" },
    { q: "השלם את המשפט:", en: "She is interested ___ science", pic: "🔬", t: "sent", options: ["on", "at", "in", "for"], c: 2, ex: "interested in — תמיד עם in" },
    { q: "קרא וענה: למה דנה פספסה את האוטובוס?", en: "Dana woke up late, so she missed the bus.", pic: "🚌", t: "read", options: ["ירד גשם", "היא התעוררה מאוחר", "האוטובוס לא הגיע", "היא הייתה חולה"], c: 1, ex: "woke up late = התעוררה מאוחר" },
    { q: "השלם את המשפט:", en: "If I ___ rich, I would buy a plane", pic: "✈️", t: "tense", options: ["were", "am", "is", "be"], c: 0, ex: "תנאי שני: If I were..." },
    { q: "השלם את המשפט:", en: "The homework ___ finished an hour ago", pic: "📚", t: "tense", options: ["was", "is", "were", "has"], c: 0, ex: "סביל בעבר: was finished" },
    { q: "השלם את המשפט:", en: "She has lived here ___ 2020", pic: "🏠", t: "sent", options: ["since", "for", "from", "at"], c: 0, ex: "since + נקודת זמן (2020)" },
    { q: "קרא וענה: מה בן עשה לפני ארוחת הערב?", en: "Ben was tired, but he finished his homework before dinner.", pic: "📖", t: "read", options: ["הלך לישון", "סיים שיעורי בית", "שיחק בחוץ", "צפה בטלוויזיה"], c: 1, ex: "finished his homework = סיים שיעורי בית" },
  ],
};

// מאגר הבנת הנקרא — קטע בעברית בשדה en (מוצג RTL), שאלה עליו
const HEB_BANK = {
  1: [
    { q: "עם מי הלך דן לגן?", en: "דן הלך לגן עם אימא.", pic: "🧒", t: "story", options: ["עם אבא", "עם אימא", "עם סבתא", "לבד"], c: 1, ex: "כתוב בקטע: עם אימא" },
    { q: "איזו חיה יש לרוני?", en: "לרוני יש חתול לבן וקטן.", pic: "🐱", t: "story", options: ["כלב", "דג", "חתול", "תוכי"], c: 2, ex: "כתוב בקטע: חתול לבן" },
    { q: "למה נשארנו בבית?", en: "היום ירד גשם חזק, ולכן נשארנו בבית.", pic: "🌧️", t: "story", options: ["כי ירד גשם", "כי היה חם", "כי היה חג", "כי ישנו"], c: 0, ex: "'ולכן' — בגלל הגשם נשארנו" },
    { q: "מה מיכל אוהבת לצייר?", en: "מיכל אוהבת לצייר פרחים יפים.", pic: "🎨", t: "story", options: ["בתים", "פרחים", "חיות", "מכוניות"], c: 1, ex: "כתוב בקטע: פרחים" },
    { q: "מה קנה אבא בחנות?", en: "אבא קנה בחנות לחם ותפוחים.", pic: "🛒", t: "story", options: ["עוגה", "חלב", "לחם ותפוחים", "גלידה"], c: 2, ex: "כתוב בקטע: לחם ותפוחים" },
  ],
  2: [
    { q: "מה עשה יובל לפני שיצא לבית הספר?", en: "יובל קם מוקדם בבוקר. הוא צחצח שיניים ויצא לבית הספר.", pic: "🪥", t: "story", options: ["שיחק כדורגל", "צחצח שיניים", "צפה בטלוויזיה", "אכל גלידה"], c: 1, ex: "כתוב: צחצח שיניים ואז יצא" },
    { q: "מה רקסי אוהב לעשות?", en: "לטלי יש כלב בשם רקסי. רקסי אוהב לרוץ בפארק.", pic: "🐕", t: "story", options: ["לישון כל היום", "לאכול עצמות", "לרוץ בפארק", "לשחות בים"], c: 2, ex: "כתוב בקטע: לרוץ בפארק" },
    { q: "מתי אנחנו הולכים לים?", en: "בקיץ חם מאוד, ולכן אנחנו הולכים לים.", pic: "🏖️", t: "story", options: ["בקיץ", "בחורף", "בסתיו", "בלילה"], c: 0, ex: "כתוב בקטע: בקיץ" },
    { q: "מי אפה את העוגה?", en: "סבתא אפתה עוגת שוקולד, וכל המשפחה באה לטעום.", pic: "🎂", t: "story", options: ["אימא", "הילדים", "השכן", "סבתא"], c: 3, ex: "כתוב בקטע: סבתא אפתה" },
    { q: "איפה נמצא הכובע של עומר?", en: "עומר איבד את הכובע שלו. חבר מצא אותו בחצר.", pic: "🧢", t: "story", options: ["בכיתה", "בחצר", "בבית", "באוטובוס"], c: 1, ex: "כתוב בקטע: בחצר" },
  ],
  3: [
    { q: "מה נועה הבטיחה להורים?", en: "נועה רצתה גור כלבים. היא הבטיחה להורים לטפל בו כל יום, וביום הולדתה קיבלה גור קטן.", pic: "🐶", t: "story", options: ["לסדר את החדר", "לטפל בגור כל יום", "להכין שיעורים", "לחסוך כסף"], c: 1, ex: "כתוב: הבטיחה לטפל בו כל יום" },
    { q: "ממה הדבורים מכינות דבש?", en: "הדבורים מכינות דבש מצוף של פרחים. בלי דבורים לא היו לנו הרבה פירות וירקות.", pic: "🐝", t: "info", options: ["ממים", "מעלים", "מצוף של פרחים", "מסוכר"], c: 2, ex: "כתוב: מצוף של פרחים" },
    { q: "מי החזיר לילדים את הכדור?", en: "בהפסקה שיחקו הילדים כדורגל. הכדור עף מעבר לגדר, והשומר החזיר אותו עם חיוך.", pic: "⚽", t: "story", options: ["השומר", "המורה", "ילד אחר", "אף אחד"], c: 0, ex: "כתוב: השומר החזיר אותו" },
    { q: "מה מגן על הצב מסכנות?", en: "הצב הוא חיה איטית. יש לו שריון קשה שמגן עליו מסכנות.", pic: "🐢", t: "info", options: ["המהירות שלו", "השיניים", "השריון הקשה", "הצבע"], c: 2, ex: "כתוב: שריון קשה שמגן עליו" },
    { q: "למה רון כמעט נרטב בדרך?", en: "רון שכח את המטרייה בבית. בדרך התחיל גשם, וחבר הזמין אותו להתחלק במטרייה.", pic: "☔", t: "story", options: ["כי שכח מטרייה", "כי קפץ לשלולית", "כי הלך לים", "כי שפך מים"], c: 0, ex: "הוא שכח את המטרייה וירד גשם" },
  ],
  4: [
    { q: "מה כנראה קרה לדנה?", en: "דנה חזרה הביתה עם מדליה נוצצת ועם חיוך ענק על הפנים.", pic: "🏅", t: "infer", options: ["היא איבדה משהו", "היא ניצחה בתחרות", "היא חלתה", "היא קיבלה עונש"], c: 1, ex: "מדליה + חיוך = ניצחון! זה כתוב 'בין השורות'" },
    { q: "איך כנראה מזג האוויר בחוץ?", en: "יוסי הציץ מהחלון, לבש מעיל עבה, לקח מטרייה ויצא.", pic: "🧥", t: "infer", options: ["חם ושמשי", "קר וגשום", "שרב כבד", "רוח חמה"], c: 1, ex: "מעיל + מטרייה = קר וגשום" },
    { q: "מתי הלב שלנו פועם?", en: "הלב שלנו פועם כל הזמן, גם כשאנחנו ישנים, ושולח דם לכל הגוף.", pic: "🫀", t: "info", options: ["רק ביום", "רק בספורט", "כל הזמן", "רק בלילה"], c: 2, ex: "כתוב: פועם כל הזמן" },
    { q: "מה ההבדל בין פעם להיום?", en: "בעבר שלחו מכתבים בדואר וזה לקח ימים. היום הודעה במחשב מגיעה ברגע.", pic: "📨", t: "info", options: ["היום ההודעות מגיעות מהר יותר", "פעם היה מהיר יותר", "אין שום הבדל", "היום לא כותבים"], c: 0, ex: "פעם ימים, היום ברגע" },
    { q: "מה כנראה מרגיש איתי?", en: "איתי ישב לבד בפינה, חיבק את התיק שלו והסתכל על הרצפה בשקט.", pic: "😔", t: "infer", options: ["שמחה גדולה", "עצב או ביישנות", "רעב", "גאווה"], c: 1, ex: "לבד, בשקט, מסתכל למטה — סימני עצב" },
  ],
  5: [
    { q: "מה אפשר להגיד על תמר?", en: "תמר התאמנה כל השבוע לקראת מבחן השחייה. ביום המבחן קמה מוקדם והגיעה ראשונה לבריכה. המאמנת אמרה שלא ראתה מישהי מוכנה כל כך.", pic: "🏊", t: "infer", options: ["היא מתמידה ורצינית", "היא מפחדת ממים", "היא תמיד מאחרת", "היא לא אוהבת ספורט"], c: 0, ex: "התאמנה כל השבוע והגיעה ראשונה = התמדה" },
    { q: "מה הרעיון המרכזי של הקטע?", en: "העצים נותנים לנו חמצן, צל ופירות, ומשמשים בית לציפורים. לכן חשוב לנטוע עצים ולשמור עליהם.", pic: "🌳", t: "info", options: ["פירות זה טעים", "העצים חשובים וצריך לשמור עליהם", "ציפורים בונות קנים", "צל זה נעים בקיץ"], c: 1, ex: "כל הקטע מסביר למה העצים חשובים" },
    { q: "למה גיל נרדם עם חיוך?", en: "בבוקר גיל נפל מהאופניים ונשרט. בצהריים קיבל 100 במבחן, ובערב חברים הפתיעו אותו במסיבה. בלילה נרדם עם חיוך.", pic: "🚲", t: "story", options: ["כי היה לו יום עם סוף טוב", "כי הוא נפל", "כי לא היה מבחן", "כי הלך לישון מוקדם"], c: 0, ex: "אחרי התחלה קשה — מבחן מעולה ומסיבה!" },
    { q: "מה למדנו על הינשוף?", en: "הינשוף ישן ביום וצד בלילה. עיניו הגדולות רואות מצוין בחושך, וכנפיו שקטות במיוחד.", pic: "🦉", t: "info", options: ["הוא פעיל בלילה", "הוא ישן בלילה", "הוא לא יודע לעוף", "הוא אוכל צמחים"], c: 0, ex: "ישן ביום וצד בלילה = פעיל בלילה" },
    { q: "מה כנראה מתכננת המשפחה?", en: "אימא הוציאה את המזוודות, אבא בדק את הדרכונים, והילדים בחרו בגדים למזג אוויר חם.", pic: "🧳", t: "infer", options: ["טיול לחוץ לארץ", "קניות בסופר", "סידור הבית", "ערב סרטים"], c: 0, ex: "מזוודות + דרכונים = נסיעה לחו\"ל" },
  ],
  6: [
    { q: "מהו המסר של הקטע?", en: "כישלון הוא לא סוף הדרך. ממציאים גדולים נכשלו מאות פעמים לפני שהצליחו, ובכל כישלון למדו משהו חדש שקירב אותם למטרה.", pic: "💡", t: "info", options: ["עדיף לא לנסות", "מכישלונות לומדים ומתקדמים", "ממציאים לא נכשלים", "הצלחה היא מזל"], c: 1, ex: "בכל כישלון למדו משהו — זה המסר" },
    { q: "מדוע נבחרה דווקא שירה לקפטנית?", en: "למרות ששירה הייתה הצעירה בקבוצה, המאמנת בחרה בה לקפטנית: היא עודדה את כולם גם בהפסדים, ותמיד הגיעה ראשונה לאימונים.", pic: "⚽", t: "infer", options: ["כי היא הצעירה ביותר", "כי הבקיעה הכי הרבה", "בזכות ההתמדה והיחס שלה", "כי אף אחד לא רצה"], c: 2, ex: "עידוד + התמדה — אלה הסיבות שכתובות" },
    { q: "מה שינה את דעת התושבים?", en: "בתחילה התנגדו התושבים לגינה הקהילתית. אבל אחרי שראו את הילדים שותלים ירקות ואת השכנים נפגשים בה כל ערב, הצטרפו גם הם.", pic: "🌱", t: "story", options: ["הם ראו כמה טוב היא עושה לשכונה", "הם קיבלו כסף", "העירייה הכריחה אותם", "הם לא שינו את דעתם"], c: 0, ex: "הם ראו את הילדים והשכנים נהנים" },
    { q: "איזו השוואה עושה הקטע?", en: "המוח דומה לשריר: ככל שמתאמנים בו יותר — בלימוד, במשחקי חשיבה ובקריאה — כך הוא מתחזק.", pic: "🧠", t: "info", options: ["בין המוח למחשב", "בין המוח לשריר", "בין ספר לשריר", "בין משחק לעבודה"], c: 1, ex: "כתוב: המוח דומה לשריר" },
    { q: "מה פירוש הביטוי 'ליבו נפל'?", en: "כשראה עידו את התור הארוך לקופה, ליבו נפל. אבל אז נזכר שהזמין כרטיסים מראש, וחיוך עלה על פניו.", pic: "🎟️", t: "infer", options: ["הוא התאכזב", "הלב שלו כאב", "הוא שמח מאוד", "הוא התעייף"], c: 0, ex: "ליבו נפל = התאכזב; החיוך חזר כשנזכר בכרטיסים" },
  ],
};

// מאגר מדעים
const SCI_BANK = {
  1: [
    { q: "איזו חיה נובחת?", en: "", pic: "🐶", t: "animals", options: ["חתול", "כלב", "פרה", "ציפור"], c: 1, ex: "הכלב נובח: הב הב!" },
    { q: "מה צריך צמח כדי לגדול?", en: "", pic: "🌱", t: "plants", options: ["מים ושמש", "ממתקים", "רק חול", "קרח"], c: 0, ex: "צמחים צריכים מים, שמש ואדמה" },
    { q: "כמה רגליים יש לחתול?", en: "", pic: "🐱", t: "animals", options: ["2", "6", "4", "8"], c: 2, ex: "לחתול 4 רגליים" },
    { q: "מה רואים בשמיים בלילה?", en: "", pic: "🌙", t: "earth", options: ["ירח וכוכבים", "שמש", "קשת בענן", "ציפורים בלבד"], c: 0, ex: "בלילה זורחים הירח והכוכבים" },
    { q: "איזו חיה מטילה ביצים?", en: "", pic: "🐔", t: "animals", options: ["כלב", "פרה", "חתול", "תרנגולת"], c: 3, ex: "התרנגולת מטילה ביצים" },
  ],
  2: [
    { q: "מאיפה מגיע החלב שאנחנו שותים?", en: "", pic: "🐮", t: "animals", options: ["מפרה", "מעץ", "מהים", "מהאדמה"], c: 0, ex: "החלב מגיע מהפרה" },
    { q: "באיזה צבע רוב העלים של הצמחים?", en: "", pic: "🍃", t: "plants", options: ["כחול", "ירוק", "אדום", "צהוב"], c: 1, ex: "העלים ירוקים" },
    { q: "בעזרת מה אנחנו שומעים?", en: "", pic: "👂", t: "body", options: ["עיניים", "אף", "אוזניים", "ידיים"], c: 2, ex: "שומעים באוזניים" },
    { q: "מה מחמם ומאיר את כדור הארץ?", en: "", pic: "☀️", t: "earth", options: ["השמש", "הירח", "העננים", "הרוח"], c: 0, ex: "השמש נותנת אור וחום" },
    { q: "איזו חיה יכולה לעוף?", en: "", pic: "🐦", t: "animals", options: ["דג", "צב", "ציפור", "חתול"], c: 2, ex: "לציפור יש כנפיים והיא עפה" },
  ],
  3: [
    { q: "איזה איבר שולח דם לכל הגוף?", en: "", pic: "🫀", t: "body", options: ["הלב", "המוח", "הקיבה", "הריאות"], c: 0, ex: "הלב מזרים את הדם בגוף" },
    { q: "מה הצמח מייצר בעלים בעזרת אור השמש?", en: "", pic: "🌿", t: "plants", options: ["חול", "מזון", "מים", "אבנים"], c: 1, ex: "בעלים מיוצר מזון לצמח (פוטוסינתזה)" },
    { q: "כמה כוכבי לכת יש במערכת השמש?", en: "", pic: "🪐", t: "earth", options: ["3", "5", "12", "8"], c: 3, ex: "8 כוכבי לכת מקיפים את השמש" },
    { q: "איזו חיה היא יונק?", en: "", pic: "🐬", t: "animals", options: ["דולפין", "תוכי", "דג זהב", "צפרדע"], c: 0, ex: "הדולפין יונק — גוריו שותים חלב" },
    { q: "בעזרת מה הדג נושם מתחת למים?", en: "", pic: "🐟", t: "animals", options: ["ריאות", "אף", "זימים", "סנפירים"], c: 2, ex: "הדג נושם בזימים" },
  ],
  4: [
    { q: "איזה איבר אחראי על חשיבה וזיכרון?", en: "", pic: "🧠", t: "body", options: ["הלב", "המוח", "הכבד", "העצמות"], c: 1, ex: "המוח הוא מרכז החשיבה" },
    { q: "מה קורה למים כשמרתיחים אותם?", en: "", pic: "♨️", t: "earth", options: ["הופכים לאדים", "קופאים", "נעלמים לתמיד", "הופכים לשמן"], c: 0, ex: "מים רותחים הופכים לאדים (גז)" },
    { q: "למה חשוב לשטוף ידיים לפני האוכל?", en: "", pic: "🧼", t: "body", options: ["כדי לקרר את הידיים", "כדי להרחיק חיידקים", "זה לא באמת חשוב", "כדי שהאוכל יהיה רטוב"], c: 1, ex: "סבון מרחיק חיידקים שגורמים למחלות" },
    { q: "איך נקרא התהליך שבו זחל הופך לפרפר?", en: "", pic: "🦋", t: "animals", options: ["נדידה", "שינה", "גלגול", "קפיצה"], c: 2, ex: "גלגול: ביצה ← זחל ← גולם ← פרפר" },
    { q: "כמה זמן לוקח לכדור הארץ להקיף את השמש?", en: "", pic: "🌍", t: "earth", options: ["יום", "חודש", "שעה", "שנה"], c: 3, ex: "הקפה שלמה = שנה אחת" },
  ],
  5: [
    { q: "מהו האיבר הגדול ביותר בגוף האדם?", en: "", pic: "🫧", t: "body", options: ["העור", "הלב", "המוח", "הכבד"], c: 0, ex: "העור עוטף את כל הגוף — האיבר הגדול ביותר" },
    { q: "איזה גז אנחנו חייבים לנשום כדי לחיות?", en: "", pic: "💨", t: "body", options: ["חמצן", "פחמן דו-חמצני", "הליום", "מימן"], c: 0, ex: "אנחנו נושמים חמצן" },
    { q: "מה גורם לגאות ולשפל בים?", en: "", pic: "🌊", t: "earth", options: ["הרוח", "משיכת הירח", "הדגים", "הסירות"], c: 1, ex: "כוח המשיכה של הירח מזיז את מי הים" },
    { q: "איזה בעל חיים ישן בעמידה?", en: "", pic: "🐴", t: "animals", options: ["כלב", "סוס", "חתול", "נחש"], c: 1, ex: "סוסים יכולים לישון בעמידה" },
    { q: "מאיזה חלק של הצמח נוצר הפרי?", en: "", pic: "🌸", t: "plants", options: ["מהשורש", "מהגבעול", "מהפרח", "מהעלה"], c: 2, ex: "הפרח הופך לפרי" },
  ],
  6: [
    { q: "מהו כוכב הלכת הקרוב ביותר לשמש?", en: "", pic: "🪐", t: "earth", options: ["נוגה", "כוכב חמה", "מאדים", "צדק"], c: 1, ex: "כוכב חמה (מרקורי) הכי קרוב לשמש" },
    { q: "מה תפקיד הכדוריות הלבנות בדם?", en: "", pic: "🩸", t: "body", options: ["להוביל חמצן", "לצבוע את הדם", "להילחם בחיידקים", "לאגור סוכר"], c: 2, ex: "הכדוריות הלבנות הן צבא ההגנה של הגוף" },
    { q: "איזה תהליך מייצר את החמצן באוויר?", en: "", pic: "🌿", t: "plants", options: ["פוטוסינתזה של צמחים", "התאדות מים", "רעידות אדמה", "גשם"], c: 0, ex: "הצמחים מייצרים חמצן בפוטוסינתזה" },
    { q: "איזו חיה היא זוחל?", en: "", pic: "🦎", t: "animals", options: ["עטלף", "דולפין", "פינגווין", "לטאה"], c: 3, ex: "הלטאה זוחלת ויש לה קשקשים" },
    { q: "מהו מצב הצבירה של קרח?", en: "", pic: "🧊", t: "earth", options: ["מוצק", "נוזל", "גז", "פלזמה"], c: 0, ex: "קרח = מים במצב מוצק" },
  ],
};

// מאגרי שאלות לפי מקצוע (לאבחון ולתרגול)
const SUBJECT_BANKS = { en: BANK, heb: HEB_BANK, sci: SCI_BANK };

// ---------- עזרים ----------

const isHeb = (s) => /[֐-׿]/.test(s || "");
const hasEnglish = (s) => /[A-Za-z]/.test(s || "");
const qKey = (q) => (q.w || "") + "|" + (q.en || "") + "|" + (q.q || ""); // מזהה שאלה למניעת חזרות
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

// ---------- דיבור: אנגלית + קריינות עברית ----------

let SPEECH_ON = true; // מתג הקראה נפרד (בנוסף להשתקה הכללית)

// בחירת הקולות הכי טבעיים שזמינים במכשיר (Natural/Neural/Online לפני קולות בסיסיים)
let hebVoice = null;
let enVoice = null;
function pickVoices() {
  try {
    const vs = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const score = (v) =>
      (/natural/i.test(v.name) ? 8 : 0) +
      (/neural|online/i.test(v.name) ? 4 : 0) +
      (/google/i.test(v.name) ? 2 : 0);
    const hebs = vs.filter(
      (v) => (v.lang || "").toLowerCase().startsWith("he") || /hebrew|עברית/i.test(v.name)
    );
    hebVoice =
      hebs.sort((a, b) => score(b) + (/avri|hila/i.test(b.name) ? 3 : 0) - (score(a) + (/avri|hila/i.test(a.name) ? 3 : 0)))[0] || null;
    const ens = vs.filter((v) => (v.lang || "").toLowerCase().startsWith("en"));
    enVoice =
      ens.sort((a, b) => score(b) + ((b.lang || "").toLowerCase() === "en-us" ? 1 : 0) - (score(a) + ((a.lang || "").toLowerCase() === "en-us" ? 1 : 0)))[0] || null;
  } catch {}
}
try {
  if (window.speechSynthesis) {
    pickVoices();
    window.speechSynthesis.onvoiceschanged = pickVoices;
  }
} catch {}

// ניקוי טקסט לפני הקראה: אימוג'ים החוצה, קווי השלמה ותווים מיוחדים → הפסקות
function cleanForSpeech(s) {
  return String(s)
    .replace(/_{2,}/g, ", ")
    .replace(/[·•]/g, ", ")
    .replace(/[↔→←]/g, ", ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// לקסיקון הגייה: מילים שמנועי TTS בעברית נוטים לשבש — מוחלפות בכתיב מנוקד מלא,
// כדי שההגייה (כולל מלעיל/מלרע) תיגזר מהניקוד הנכון. מורחב לפי הצורך.
const HEB_FIX = [
  ["בית הספר", "בֵּית הַסֵּפֶר"],
  ["בית ספר", "בֵּית סֵפֶר"],
  ["את המספרים", "אֶת הַמִּסְפָּרִים"],
  ["ככה מספרים", "כָּכָה מְסַפְּרִים"],
  ["אוצר המילים", "אוֹצַר הַמִּלִּים"],
  ["אוצר מילים", "אוֹצַר מִלִּים"],
  ["הפכים", "הֲפָכִים"],
  ["שברים", "שְׁבָרִים"],
  ["כפל", "כֶּפֶל"],
  ["בלשים", "בַּלָּשִׁים"],
  ["חצי", "חֲצִי"],
  ["רבע", "רֶבַע"],
];

// ---------- קול טבעי (ענן) ----------
// ברירת מחדל: שרת הקריינות של ביפ (פונקציית Netlify, ובפיתוח — שרת Vite). המפתח שמור בשרת בלבד,
// כך שכל מכשיר מקבל קול טבעי בלי הגדרות. אפשרות מתקדמת: מפתח פרטי במכשיר (אזור ההורים).
// בכל כשל — נפילה שקטה לקול הדפדפן.

const TTS_API = "/.netlify/functions/tts";
let TTS_CFG = null; // מפתח פרטי במכשיר: { provider: "google"|"azure", key, region }
let SERVER_TTS = null; // מצב השרת: { enabled, provider, voices: [{ id, gender }], defaultVoice, error }
let TTS_VOICE = null; // הקול שנבחר באזור ההורים (lomi:voice)
const ttsCache = new Map(); // מפתח → כתובת שמע בזיכרון

const serverTtsReady = fetch(TTS_API)
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null)
  .then((st) => {
    SERVER_TTS = st && typeof st.enabled === "boolean" ? st : { enabled: false };
    if (!SERVER_TTS.voices) SERVER_TTS.voices = [];
    return SERVER_TTS.enabled;
  });

// מטמון קבוע בדפדפן: משפט שכבר נשמע נטען מיד בפעם הבאה — בלי המתנה, בלי רשת ובלי עלות
const TTS_DISK = "beep-tts-v1";
const TTS_DISK_MAX = 1500;
let diskPuts = 0;

async function diskReq(k) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(k));
  const hex = Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, "0")).join("");
  return new Request(location.origin + "/__tts/" + hex);
}

async function diskGet(k) {
  try {
    if (!window.caches || !window.crypto || !crypto.subtle) return null;
    const c = await caches.open(TTS_DISK);
    const r = await c.match(await diskReq(k));
    return r ? await r.blob() : null;
  } catch {
    return null;
  }
}

async function diskPut(k, blob) {
  try {
    if (!window.caches || !window.crypto || !crypto.subtle) return;
    const c = await caches.open(TTS_DISK);
    await c.put(await diskReq(k), new Response(blob, { headers: { "Content-Type": "audio/mpeg" } }));
    if (++diskPuts % 50 === 0) {
      const keys = await c.keys();
      for (const old of keys.slice(0, Math.max(0, keys.length - TTS_DISK_MAX))) await c.delete(old);
    }
  } catch {}
}

async function fetchTTS(text, lang, voice) {
  const device = TTS_CFG && TTS_CFG.key ? TTS_CFG : null;
  if (!device && !(await serverTtsReady)) throw new Error("no tts");
  const provider = device ? device.provider : SERVER_TTS.provider;
  let wanted = voice || TTS_VOICE;
  if (!device && !SERVER_TTS.voices.some((x) => x.id === wanted)) wanted = SERVER_TTS.defaultVoice;
  const v = cleanVoice(provider, wanted || defaultVoice(provider));
  const cacheKey = provider + "|" + v + "|" + lang + "|" + text;
  if (ttsCache.has(cacheKey)) return ttsCache.get(cacheKey);
  let blob = await diskGet(cacheKey);
  if (!blob) {
    if (device) {
      blob = new Blob([await synthesize(device, { text, lang, voice: v })], { type: "audio/mpeg" });
    } else {
      const res = await fetch(TTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang, voice: v }),
      });
      if (!res.ok) {
        let msg = "TTS " + res.status;
        try {
          const j = await res.json();
          if (j && j.error) msg += ": " + j.error;
        } catch {}
        throw new Error(msg);
      }
      blob = await res.blob();
    }
    diskPut(cacheKey, blob);
  }
  const url = URL.createObjectURL(blob);
  if (ttsCache.size > 150) ttsCache.delete(ttsCache.keys().next().value);
  ttsCache.set(cacheKey, url);
  return url;
}

// תור שמע אחיד — שומר על סדר ההקראות (עברית ואז אנגלית וכו')
let audioQ = [];
let curAudio = null;
let audioBusy = false;
let audioGen = 0; // עולה בכל עצירה — מבטל שמע שהגיע באיחור

function stopAllSpeech() {
  audioGen++;
  audioQ = [];
  if (curAudio) {
    try { curAudio.pause(); } catch {}
    curAudio = null;
  }
  audioBusy = false;
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
}

function pumpAudio() {
  if (audioBusy || !audioQ.length) return;
  audioBusy = true;
  const gen = audioGen;
  const item = audioQ.shift();
  item.p.then((url) => {
    if (gen !== audioGen) return; // בינתיים עברו הלאה — לא משמיעים משפט ישן
    let done = false;
    const next = () => {
      if (done || gen !== audioGen) return;
      done = true;
      audioBusy = false;
      curAudio = null;
      pumpAudio();
    };
    if (!url) {
      // הענן נכשל — נופלים לקול הדפדפן עבור המשפט הזה
      webSpeakRaw(item.text, item.lang);
      next();
      return;
    }
    const a = new Audio(url);
    curAudio = a;
    a.onended = next;
    a.onerror = next;
    a.play().catch(next);
  });
}

function cloudSpeak(text, lang, opts = {}) {
  const device = TTS_CFG && TTS_CFG.key;
  if (!device && SERVER_TTS && !SERVER_TTS.enabled) return false; // אין קול ענן — קול הדפדפן
  if (!opts.queue) stopAllSpeech();
  audioQ.push({
    text,
    lang,
    p: fetchTTS(text, lang).catch((e) => {
      const m = e && e.message ? e.message : String(e);
      if (m !== "no tts") console.warn("cloud TTS:", m);
      return null;
    }),
  });
  pumpAudio();
  return true;
}

// קול הדפדפן (fallback) — איטי ונעים יותר מברירת המחדל
function webSpeakRaw(text, lang) {
  try {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    if (lang === "he") {
      u.lang = "he-IL";
      if (hebVoice) u.voice = hebVoice;
      u.rate = 0.85;
      u.pitch = 1;
    } else {
      u.lang = "en-US";
      if (enVoice) u.voice = enVoice;
      u.rate = 0.85;
    }
    window.speechSynthesis.speak(u);
  } catch {}
}

// תרגילי חשבון בקריינות עברית: "12 ÷ 3 = 4" → "12 חלקי 3 שווה 4", "½" → "חצי".
// סימן מוחלף רק כשיש מספר (או קו השלמה) משני צדדיו — כדי לא לגעת ב-"cat = חתול" או ב"ה-3".
const MATH_N = "[0-9½¼¾]|_{2,}";
const MATH_WORDS = { "+": "ועוד", "−": "פחות", "×": "כפול", "÷": "חלקי", "=": "שווה" };
const MATH_OP_RE = new RegExp(`(${MATH_N})\\s*([+−×÷=])\\s*(?=${MATH_N})`, "g");
const MATH_ASK_RE = /([0-9½¼¾])\s*=\s*(?:_{2,}|\?)/g;

function mathToHebrew(s) {
  return String(s)
    .replace(MATH_ASK_RE, "$1 שווה כמה?")
    .replace(MATH_OP_RE, (m, a, op) => `${a} ${MATH_WORDS[op]} `)
    .replace(/½/g, " חצי ")
    .replace(/¼/g, " רבע ")
    .replace(/¾/g, " שלושה רבעים ");
}

// קריינות בעברית — ענן אם מוגדר, אחרת קול הדפדפן
function speakHe(text, opts = {}) {
  if (MUTED || !SPEECH_ON) return;
  let t = String(text);
  for (const [from, to] of HEB_FIX) t = t.split(from).join(to);
  t = cleanForSpeech(numbersToHebrew(mathToHebrew(t)));
  if (!/[0-9A-Za-z\u0590-\u05FF]/.test(t)) return; // רק סימנים ואימוג'ים — אין מה להקריא
  if (cloudSpeak(t, "he", opts)) return;
  if (!opts.queue) stopAllSpeech();
  webSpeakRaw(t, "he");
}

// הקראה באנגלית — מילים בודדות או משפטים מלאים
function speak(text, opts = {}) {
  if (MUTED || !SPEECH_ON) return;
  const t = cleanForSpeech(text);
  if (!t) return;
  if (cloudSpeak(t, "en", opts)) return;
  if (!opts.queue) stopAllSpeech();
  webSpeakRaw(t, "en");
}

// הקראת תוכן בשפה המתאימה: אנגלית רק כשיש אותיות באנגלית ואין עברית —
// תרגיל חשבון (מספרים וסימנים בלבד) נקרא בעברית
function speakAny(text, opts = {}) {
  if (hasEnglish(text) && !isHeb(text)) speak(text, opts);
  else speakHe(text, opts);
}

// ---------- צלילי חיווי (Web Audio — מסונתזים, בלי קבצים, עובד גם offline) ----------

let MUTED = false;
let audioCtx = null;
function actx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function tone(freq, start, dur, type = "triangle", vol = 0.12) {
  if (MUTED) return;
  try {
    const c = actx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch {}
}
const sfx = {
  click: () => tone(620, 0, 0.09, "triangle", 0.07),
  pop: () => tone(880, 0, 0.12, "sine", 0.1),
  correct: () => { tone(523.25, 0, 0.16); tone(659.25, 0.1, 0.16); tone(783.99, 0.2, 0.3); },
  wrong: () => { tone(320, 0, 0.18, "sine", 0.09); tone(262, 0.13, 0.28, "sine", 0.07); },
  fanfare: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.12, 0.28));
    tone(1318.5, 0.5, 0.55, "triangle", 0.14);
  },
};

// ---------- אחסון: כמה לומדים במכשיר אחד ----------

const USERS_KEY = "lomi:users";
const CURRENT_KEY = "lomi:current";
const OLD_KEY = "lomi:profile";

async function storGet(k) {
  try {
    if (!window.storage) return null;
    const r = await window.storage.get(k);
    return r && r.value != null ? r.value : null;
  } catch {
    return null;
  }
}
async function storSet(k, v) {
  try {
    if (window.storage) await window.storage.set(k, v);
  } catch (e) {
    console.error("storage", e);
  }
}
async function storDel(k) {
  try {
    if (window.storage) await window.storage.delete(k);
  } catch {}
}

async function loadUsers() {
  const raw = await storGet(USERS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw).map(migrateProfile);
    } catch {
      return [];
    }
  }
  // הגירה מגרסה ישנה של משתמש יחיד
  const old = await storGet(OLD_KEY);
  if (old) {
    try {
      const p = migrateProfile(JSON.parse(old));
      const users = [p];
      await storSet(USERS_KEY, JSON.stringify(users));
      await storSet(CURRENT_KEY, p.id);
      await storDel(OLD_KEY);
      return users;
    } catch {}
  }
  return [];
}
async function persistUsers(users) {
  await storSet(USERS_KEY, JSON.stringify(users));
}

// פרופילים ישנים החזיקו רמה אחת — עכשיו רמה נפרדת לכל מקצוע
function migrateProfile(p) {
  if (!p) return p;
  if (!p.id) p.id = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const seed = GRADE_SEED[p.grade ?? 3] || 3;
  if (!p.levels) p.levels = { en: p.level || seed, math: seed };
  if (typeof p.perfect !== "object" || p.perfect === null)
    p.perfect = { en: p.perfect || 0, math: 0 };
  for (const s of SUBJECT_IDS) {
    if (p.levels[s] == null) p.levels[s] = seed;
    if (p.perfect[s] == null) p.perfect[s] = 0;
  }
  if (!Array.isArray(p.history)) p.history = [];
  if (p.days == null) p.days = p.totalSessions ? Math.max(1, p.streak || 1) : 0;
  if (!p.seen) p.seen = {};
  for (const s of SUBJECT_IDS) if (!Array.isArray(p.seen[s])) p.seen[s] = [];
  if (!Array.isArray(p.lessonsDone)) p.lessonsDone = [];
  if (!p.activity || typeof p.activity !== "object") p.activity = {};
  // משתמשים ותיקים כבר עברו אבחון באנגלית והרמות שלהם מכוילות
  if (!p.diagDone) p.diagDone = { en: true, math: true };
  return p;
}

// ---------- Claude API: יצירת שאלות אנגלית דינמיות ----------

async function generateLessonAI(profile, topicObj) {
  const lvl = LEVELS[profile.levels.en];
  const interests = profile.interests
    .map((id) => (INTERESTS.find((i) => i.id === id) || {}).label || "")
    .join(", ");
  const prompt = `You create English-learning questions for a Hebrew-speaking child named ${profile.name}.
Level: ${lvl.ai}.
Focus topic: ${topicObj.ai}.
Child's interests: ${interests || "general kid topics"} — weave them in naturally when possible.
Create EXACTLY 5 varied multiple-choice questions on the focus topic.
Respond with ONLY a JSON array, no markdown, no extra text:
[{"q":"הנחיה קצרה בעברית","en":"English content or empty string","pic":"one fitting emoji","options":["a","b","c","d"],"c":0,"ex":"הסבר מעודד קצר בעברית, עד 12 מילים"}]
Rules: exactly 4 options, exactly one correct (index in "c"), mark a missing word with exactly ___ (one blank, never several), always include "pic", keep everything short and friendly.`;

  // מניעת חזרות: מוסרים ל-AI מה כבר נשאל לאחרונה
  const recentQs = ((profile.seen && profile.seen.en) || [])
    .slice(-10)
    .map((k) => k.split("|")[0])
    .filter(Boolean);
  const avoid = recentQs.length
    ? `\nDo NOT repeat any of these recently used questions: ${JSON.stringify(recentQs)}`
    : "";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt + avoid }],
    }),
  });
  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const s = text.indexOf("[");
  const e = text.lastIndexOf("]");
  if (s === -1 || e === -1) throw new Error("no JSON");
  const arr = JSON.parse(text.slice(s, e + 1));
  const valid = arr
    .filter(
      (it) =>
        it && typeof it.q === "string" && Array.isArray(it.options) &&
        it.options.length === 4 && it.c >= 0 && it.c <= 3
    )
    .map((it) => ({ ...it, pic: typeof it.pic === "string" && it.pic ? it.pic : "✨" }));
  if (valid.length < 3) throw new Error("bad JSON");
  return valid.slice(0, 5);
}

// מפצל מאגר לשאלות "טריות" (שלא נראו לאחרונה) ולישנות, מהוותיקה לחדשה
function splitFresh(pool, seen) {
  const fresh = pool.filter((q) => !seen.includes(qKey(q)));
  const stale = pool
    .filter((q) => seen.includes(qKey(q)))
    .sort((a, b) => seen.indexOf(qKey(a)) - seen.indexOf(qKey(b)));
  return { fresh: shuffle(fresh), stale };
}

function fallbackLesson(bank, level, topicId, seen = []) {
  const pool = bank[level] || bank[3];
  const topical = topicId && topicId !== "mix" ? pool.filter((q) => q.t === topicId) : [...pool];
  const rest = pool.filter((q) => !topical.includes(q));
  const a = splitFresh(topical, seen);
  const b = splitFresh(rest, seen);
  // עדיפות: טריות בנושא → טריות אחרות → ישנות (מהוותיקה ביותר)
  return shuffle([...a.fresh, ...b.fresh, ...a.stale, ...b.stale].slice(0, 5));
}

// ---------- אנגלית: מחולל אוצר מילים — מאגר גדול, בלי מילים שחוזרות ----------

// [אנגלית, עברית, אימוג'י] — 20 מילים לכל רמה × 3 סוגי שאלות = מאות שילובים
const WORDS = {
  1: [
    ["dog", "כלב", "🐶"], ["cat", "חתול", "🐱"], ["sun", "שמש", "☀️"], ["ball", "כדור", "⚽"],
    ["apple", "תפוח", "🍎"], ["milk", "חלב", "🥛"], ["car", "מכונית", "🚗"], ["fish", "דג", "🐟"],
    ["bird", "ציפור", "🐦"], ["book", "ספר", "📖"], ["tree", "עץ", "🌳"], ["star", "כוכב", "⭐"],
    ["egg", "ביצה", "🥚"], ["moon", "ירח", "🌙"], ["hand", "יד", "✋"], ["bed", "מיטה", "🛏️"],
    ["hat", "כובע", "🎩"], ["cake", "עוגה", "🎂"], ["duck", "ברווז", "🦆"], ["key", "מפתח", "🔑"],
  ],
  2: [
    ["house", "בית", "🏠"], ["water", "מים", "💧"], ["bread", "לחם", "🍞"], ["mother", "אימא", "👩"],
    ["father", "אבא", "👨"], ["baby", "תינוק", "👶"], ["green", "ירוק", "🟢"], ["yellow", "צהוב", "🟡"],
    ["black", "שחור", "⚫"], ["white", "לבן", "⚪"], ["horse", "סוס", "🐴"], ["cow", "פרה", "🐮"],
    ["rabbit", "ארנב", "🐰"], ["banana", "בננה", "🍌"], ["school", "בית ספר", "🏫"], ["door", "דלת", "🚪"],
    ["chair", "כיסא", "🪑"], ["shoe", "נעל", "👟"], ["rain", "גשם", "🌧️"], ["ice cream", "גלידה", "🍦"],
  ],
  3: [
    ["morning", "בוקר", "🌅"], ["night", "לילה", "🌙"], ["friend", "חבר", "🤝"], ["happy", "שמח", "😊"],
    ["sad", "עצוב", "😢"], ["big", "גדול", "🐘"], ["small", "קטן", "🐭"], ["hot", "חם", "🔥"],
    ["cold", "קר", "🧊"], ["fast", "מהיר", "🏎️"], ["slow", "איטי", "🐢"], ["family", "משפחה", "👨‍👩‍👧‍👦"],
    ["teacher", "מורה", "🧑‍🏫"], ["garden", "גינה", "🌷"], ["kitchen", "מטבח", "🍳"], ["window", "חלון", "🪟"],
    ["clean", "נקי", "🧼"], ["dirty", "מלוכלך", "🐷"], ["run", "לרוץ", "🏃"], ["jump", "לקפוץ", "🤸"],
  ],
  4: [
    ["always", "תמיד", "🔁"], ["never", "אף פעם", "🚫"], ["sometimes", "לפעמים", "🎲"], ["today", "היום", "📅"],
    ["tomorrow", "מחר", "⏭️"], ["yesterday", "אתמול", "⏮️"], ["easy", "קל", "😌"], ["difficult", "קשה", "🧗"],
    ["beautiful", "יפה", "🌸"], ["angry", "כועס", "😠"], ["hungry", "רעב", "🍽️"], ["thirsty", "צמא", "🥤"],
    ["tired", "עייף", "🥱"], ["week", "שבוע", "🗓️"], ["month", "חודש", "📆"], ["year", "שנה", "🎆"],
    ["money", "כסף", "💰"], ["funny", "מצחיק", "🤣"], ["smart", "חכם", "🧠"], ["brave", "אמיץ", "🦁"],
  ],
  5: [
    ["suddenly", "פתאום", "⚡"], ["quietly", "בשקט", "🤫"], ["quickly", "במהירות", "💨"], ["dangerous", "מסוכן", "⚠️"],
    ["important", "חשוב", "❗"], ["interesting", "מעניין", "🔍"], ["boring", "משעמם", "🥱"], ["expensive", "יקר", "💎"],
    ["cheap", "זול", "🪙"], ["strong", "חזק", "💪"], ["weak", "חלש", "🍃"], ["early", "מוקדם", "🌅"],
    ["late", "מאוחר", "🌃"], ["remember", "לזכור", "🧠"], ["forget", "לשכוח", "💭"], ["understand", "להבין", "💡"],
    ["question", "שאלה", "❓"], ["answer", "תשובה", "✅"], ["mountain", "הר", "⛰️"], ["river", "נהר", "🏞️"],
  ],
  6: [
    ["although", "למרות ש...", "🤔"], ["because", "בגלל ש...", "➡️"], ["however", "עם זאת", "↔️"], ["decision", "החלטה", "⚖️"],
    ["environment", "סביבה", "🌍"], ["science", "מדע", "🔬"], ["future", "עתיד", "🔮"], ["probably", "כנראה", "🎯"],
    ["necessary", "הכרחי", "📌"], ["improve", "לשפר", "📈"], ["succeed", "להצליח", "🏆"], ["fail", "להיכשל", "📉"],
    ["choose", "לבחור", "☑️"], ["describe", "לתאר", "🖊️"], ["explain", "להסביר", "🗣️"], ["opinion", "דעה", "💬"],
    ["experience", "ניסיון", "🎒"], ["discover", "לגלות", "🧭"], ["protect", "להגן", "🛡️"], ["journey", "מסע", "🗺️"],
  ],
};

registerWords(WORDS);

function genVocabQ(level) {
  const list = WORDS[level] || WORDS[3];
  const [en, he, emoji] = list[rnd(0, list.length - 1)];
  const others = shuffle(list.filter((w) => w[0] !== en)).slice(0, 3);
  const kind = rnd(0, 2);
  if (kind === 0) {
    const opts = shuffle([he, ...others.map((w) => w[1])]);
    return { w: en, q: `מה הפירוש של המילה ${en}?`, en, pic: emoji, options: opts, c: opts.indexOf(he), ex: `${en} = ${he} ${emoji}` };
  }
  if (kind === 1) {
    const opts = shuffle([en, ...others.map((w) => w[0])]);
    return { w: en, q: `איך אומרים "${he}" באנגלית?`, en: "", pic: emoji, options: opts, c: opts.indexOf(en), ex: `${he} = ${en} ${emoji}` };
  }
  const opts = shuffle([en, ...others.map((w) => w[0])]);
  return { w: en, q: "איזו מילה מתאימה לתמונה?", en: "", pic: emoji, options: opts, c: opts.indexOf(en), ex: `${en} = ${he} ${emoji}` };
}

function vocabLesson(level, seen = []) {
  const qs = [];
  const usedKeys = new Set();
  const usedWords = new Set();
  let guard = 0;
  while (qs.length < 5 && guard++ < 250) {
    const q = genVocabQ(level);
    const key = qKey(q);
    if (usedKeys.has(key) || usedWords.has(q.w)) continue;
    // עדיפות למילים שלא נראו לאחרונה בכלל; מוותרים בהדרגה כשהמאגר מוצה
    if (guard < 100 && seen.some((k) => k.split("|")[0] === q.w)) continue;
    if (guard < 180 && seen.includes(key)) continue;
    usedKeys.add(key);
    usedWords.add(q.w);
    qs.push(q);
  }
  return qs;
}

// ---------- שיעורים: הסבר אינטראקטיבי + שאלות בדיקה משולבות ----------
// step: { t:"teach", title, body, en?, pic } או { t:"q", q, en?, pic, options, c, ex }

const LESSONS = {
  en: {
    tense: [
      {
        id: "en-present-simple", title: "Present Simple — הווה פשוט", emoji: "🕐", min: 4,
        steps: [
          { t: "teach", title: "מה זה Present Simple?", body: "היי חבר! 👋 אני אגלה לך סוד: זה הזמן של דברים שקורים תמיד או כל יום — כמו לשחק כדורגל אחרי בית הספר. בוא נלמד אותו יחד!", en: "I play soccer every day", art: ["🔁", "📅", "⚽"], scene: {"type":"time","who":"🙋","act":"⚽","when":"always"} },
          { t: "q", q: "מתי משתמשים ב-Present Simple?", options: ["בדברים שקרו אתמול", "בדברים שקורים תמיד או כל יום", "בדברים שיקרו מחר", "רק בסיפורים"], c: 1, ex: "הווה פשוט = הרגלים ודברים קבועים", pic: "🧠" },
          { t: "teach", title: "הכלל הכי חשוב: s", body: "עם he, she או it מוסיפים s לפועל. עם I, you, we, they — בלי s.", en: "He plays · I play", pic: "✨", scene: {"type":"seq","frames":[{"e":"👦","cap":"He plays"},{"e":"👧","cap":"She plays"},{"e":"🙋","cap":"I play"}]} },
          { t: "q", q: "השלם את המשפט:", en: "She ___ to school every day", options: ["go", "goes", "going", "gone"], c: 1, ex: "she מקבלת es: goes", pic: "🏫" },
          { t: "q", q: "השלם את המשפט:", en: "They ___ pizza on Friday", options: ["eats", "ate", "eat", "eating"], c: 2, ex: "they בלי s: eat", pic: "🍕" },
          { t: "q", q: "השלם את המשפט:", en: "The cat ___ milk every morning", options: ["drink", "drinks", "drinking", "drank"], c: 1, ex: "החתול = it, לכן drinks", pic: "🐱" },
          { t: "teach", title: "שאלות עם Do / Does", body: "עכשיו טריק של אלופים: שאלה על he/she/it מתחילה ב-Does, וכל השאר עם Do. ואחרי Does — הפועל חוזר להיות בלי s!", en: "Does he play? · Do you play?", pic: "❓", scene: {"type":"seq","frames":[{"e":"👦","cap":"Does he play?"},{"e":"🫵","cap":"Do you play?"}]} },
          { t: "q", q: "בחר את השאלה הנכונה:", options: ["Do she like music?", "Does she likes music?", "Does she like music?", "She like music?"], c: 2, ex: "Does + she + פועל בלי s", pic: "🎵" },
          { t: "q", q: "השלם את השאלה:", en: "___ they play outside?", options: ["Do", "Does", "Is", "Am"], c: 0, ex: "they → שאלה עם Do", pic: "🌳" },
          { t: "teach", title: "איזה אלוף אתה! 🎉", body: "תראה כמה למדת: הווה פשוט לדברים קבועים, s ל-he/she/it, ושאלות עם Do/Does. אני ממש גאה בך — בוא נתרגל יחד!", art: ["🏆", "⭐", "🤖"], scene: {"type":"seq","frames":[{"e":"🔁","cap":"every day"},{"e":"✨","cap":"he / she / it + s"},{"e":"❓","cap":"Do / Does"}]} },
        ],
      },
      {
        id: "en-past-simple", title: "Past Simple — עבר פשוט", emoji: "⏮️", min: 5,
        steps: [
          { t: "teach", title: "מה זה Past Simple?", body: "בוא נסע יחד במכונת זמן! 🚀 ככה מספרים באנגלית על משהו שכבר קרה ונגמר: אתמול, לפני שעה, או בשנה שעברה.", en: "Yesterday I played soccer", art: ["🕰️", "⬅️", "🏃"], scene: {"type":"time","who":"🙋","act":"⚽","when":"past"} },
          { t: "teach", title: "הכלל: מוסיפים ed", body: "ברוב הפעלים פשוט מוסיפים ed בסוף — לכל הגופים, בלי יוצאים מהכלל!", en: "play → played · jump → jumped", pic: "✨", scene: {"type":"seq","frames":[{"e":"⚽","cap":"play → played"},{"e":"🤸","cap":"jump → jumped"}]} },
          { t: "q", q: "השלם את המשפט:", en: "Last night we ___ a movie", options: ["watch", "watched", "watches", "watching"], c: 1, ex: "עבר: watch + ed = watched", pic: "🎬" },
          { t: "teach", title: "פעלים שובבים 😜", body: "יש פעלים מיוחדים שמשתנים לגמרי בעבר. את אלה פשוט זוכרים:", en: "go → went · eat → ate · see → saw", pic: "🎭", scene: {"type":"seq","frames":[{"e":"🚶","cap":"go → went"},{"e":"🍽️","cap":"eat → ate"},{"e":"👀","cap":"see → saw"}]} },
          { t: "q", q: "השלם את המשפט:", en: "Yesterday I ___ to the beach", options: ["goed", "go", "went", "gone"], c: 2, ex: "go הוא פועל שובב: go → went", pic: "🏖️" },
          { t: "q", q: "השלם את המשפט:", en: "She ___ a big pizza", options: ["ate", "eated", "eating", "eats"], c: 0, ex: "eat → ate (פועל שובב)", pic: "🍕" },
          { t: "q", q: "השלם את המשפט:", en: "We ___ a sandcastle at the beach", options: ["build", "built", "builds", "building"], c: 1, ex: "build → built (עוד שובב!)", pic: "🏰" },
          { t: "teach", title: "איך מזהים שצריך עבר?", body: "מילים כמו yesterday, ago ו-last night הן רמז ענק שצריך Past Simple!", en: "yesterday · last week · an hour ago", pic: "🕵️", scene: {"type":"seq","frames":[{"e":"⏮️","cap":"yesterday"},{"e":"🗓️","cap":"last week"},{"e":"⏰","cap":"an hour ago"}]} },
          { t: "q", q: "השלם את המשפט:", en: "He finished his homework an hour ___", options: ["now", "tomorrow", "ago", "late"], c: 2, ex: "an hour ago = לפני שעה", pic: "📚" },
          { t: "teach", title: "כל הכבוד! 🎉", body: "עבר פשוט: ed בסוף, פעלים שובבים זוכרים, ו-yesterday מסגיר אותו. לתרגול!", pic: "🏆", scene: {"type":"time","who":"🙋","act":"🏆","when":"past"} },
        ],
      },
      {
        id: "en-future-will", title: "העתיד עם will", emoji: "🔮", min: 5,
        steps: [
          { t: "teach", title: "מדברים על העתיד", body: "יש לי כדור בדולח! 🔮 כשמשהו יקרה מחר או בעתיד — פשוט שמים will לפני הפועל. וזה עובד אותו דבר לכל הגופים, קל!", en: "I will win · She will win", art: ["🔮", "➡️", "🌟"], scene: {"type":"time","who":"🙋","act":"🏆","when":"future"} },
          { t: "q", q: "השלם את המשפט:", en: "Tomorrow I ___ visit my grandma", options: ["was", "will", "did", "am"], c: 1, ex: "מחר = עתיד: will", pic: "👵" },
          { t: "teach", title: "שלילה: won't", body: "כדי להגיד שמשהו לא יקרה: will not, ובקיצור — won't.", en: "I won't be late", pic: "🚫", scene: {"type":"seq","frames":[{"e":"✅","cap":"I will"},{"e":"🚫","cap":"I won't"}]} },
          { t: "q", q: "השלם את המשפט:", en: "Don't worry, we ___ forget you", options: ["will", "don't", "won't", "didn't"], c: 2, ex: "won't = will not, שלילה בעתיד", pic: "💛" },
          { t: "q", q: "איך שואלים 'האם תבוא מחר?'", options: ["Do you come tomorrow?", "Will you come tomorrow?", "Did you come tomorrow?", "You come tomorrow?"], c: 1, ex: "שאלה בעתיד מתחילה ב-Will", pic: "❓" },
          { t: "q", q: "השלם את המשפט:", en: "Next year I ___ be in a new class", options: ["will", "was", "did", "have"], c: 0, ex: "שנה הבאה = עתיד: will", pic: "🎒" },
          { t: "teach", title: "סיכום! 🎉", body: "will לפני הפועל = עתיד. won't = שלילה. שאלה מתחילה ב-Will. קדימה לתרגול!", pic: "🏆", scene: {"type":"time","who":"👧","act":"🚶","when":"future"} },
        ],
      },
    ],
    sent: [
      {
        id: "en-be", title: "am / is / are — משפחת to be", emoji: "🗝️", min: 3,
        steps: [
          { t: "teach", title: "משפחת to be", body: "בוא תכיר את המשפחה הכי חשובה באנגלית! 👋 שלוש מילים קטנות — am, is, are — וכל גוף מקבל בדיוק את שלו. אחרי השיעור הזה הן יהיו חברות שלך.", en: "I am · he is · they are", art: ["👦", "👧", "👨‍👩‍👧"], scene: {"type":"seq","frames":[{"e":"🙋","cap":"I am"},{"e":"👦","cap":"he is"},{"e":"👫","cap":"they are"}]} },
          { t: "teach", title: "מי מקבל מה?", body: "I תמיד עם am. he, she ו-it עם is. you, we ו-they עם are.", en: "I am happy · She is happy · We are happy", pic: "🗝️", scene: {"type":"seq","frames":[{"e":"🙋","cap":"am"},{"e":"👦👧","cap":"is"},{"e":"👫","cap":"are"}]} },
          { t: "q", q: "השלם את המשפט:", en: "I ___ a student", options: ["is", "are", "am", "be"], c: 2, ex: "I תמיד עם am", pic: "🧑‍🎓" },
          { t: "q", q: "השלם את המשפט:", en: "My dog ___ very cute", options: ["is", "am", "are", "be"], c: 0, ex: "הכלב = it, לכן is", pic: "🐶" },
          { t: "q", q: "השלם את המשפט:", en: "You ___ my best friend", options: ["is", "am", "are", "be"], c: 2, ex: "you תמיד עם are", pic: "🤝" },
          { t: "q", q: "בחר את המשפט הנכון:", options: ["They are happy.", "They is happy.", "They am happy.", "Them are happy."], c: 0, ex: "they תמיד עם are", pic: "😊" },
          { t: "teach", title: "סיכום! 🎉", body: "am–is–are זו המשפחה הכי חשובה באנגלית: I am, he is, you are. עכשיו לתרגול!", pic: "🏆", scene: {"type":"seq","frames":[{"e":"🙋","cap":"I am"},{"e":"👧","cap":"she is"},{"e":"🫵","cap":"you are"}]} },
        ],
      },
      {
        id: "en-prepositions", title: "in / on / under — איפה זה?", emoji: "📦", min: 3,
        steps: [
          { t: "teach", title: "מילות מקום", body: "בוא נשחק במחבואים! 🙈 שלוש מילים קטנות מגלות איפה הכול מתחבא: in = בתוך, on = על, under = מתחת. תדמיין את התמונה בראש וזה יישאר איתך לתמיד!", en: "in the box · on the table · under the bed", art: ["📦", "⬆️", "⬇️"], scene: {"type":"place","thing":"🐱","ref":"📦","cycle":true} },
          { t: "q", q: "מה הפירוש של under?", options: ["על", "בתוך", "מתחת", "ליד"], c: 2, ex: "under = מתחת", pic: "🛏️" },
          { t: "q", q: "החתול נמצא על השולחן. השלם:", en: "The cat is ___ the table", options: ["in", "on", "under", "at"], c: 1, ex: "על = on", pic: "🐱" },
          { t: "q", q: "הצעצועים בתוך הקופסה. השלם:", en: "The toys are ___ the box", options: ["on", "under", "in", "at"], c: 2, ex: "בתוך = in", pic: "🧸" },
          { t: "q", q: "הכלב מתחבא מתחת למיטה. השלם:", en: "The dog is ___ the bed", options: ["on", "in", "under", "at"], c: 2, ex: "מתחת = under", pic: "🐶" },
          { t: "teach", title: "סיכום! 🎉", body: "in בתוך, on על, under מתחת. תמיד לדמיין את התמונה בראש! לתרגול!", pic: "🏆", scene: {"type":"place","thing":"⚽","ref":"TABLE","cycle":true} },
        ],
      },
    ],
    vocab: [
      {
        id: "en-colors", title: "צבעים באנגלית", emoji: "🌈", min: 1, max: 3,
        steps: [
          { t: "teach", title: "צבעים באנגלית 🌈", body: "בוא נצבע את העולם יחד! 🎨 נתחיל בשלושה צבעים: red אדום, blue כחול, yellow צהוב. לחץ על המילים באנגלית ותשמע איך הן נשמעות!", en: "red · blue · yellow", art: ["🔴", "🔵", "🟡"], scene: {"type":"seq","frames":[{"e":"🔴","cap":"red"},{"e":"🔵","cap":"blue"},{"e":"🟡","cap":"yellow"}]} },
          { t: "q", q: "מה הפירוש של red?", options: ["כחול", "אדום", "צהוב", "ירוק"], c: 1, ex: "red = אדום 🔴", pic: "🔴" },
          { t: "teach", title: "עוד צבעים!", body: "green ירוק, black שחור, white לבן. טיפ: השמיים blue, הדשא green!", en: "green · black · white", pic: "🎨", scene: {"type":"seq","frames":[{"e":"🟢","cap":"green"},{"e":"⚫","cap":"black"},{"e":"⚪","cap":"white"}]} },
          { t: "q", q: "איך אומרים 'ירוק' באנגלית?", options: ["black", "white", "blue", "green"], c: 3, ex: "green = ירוק 🟢", pic: "🟢" },
          { t: "q", q: "השמש צהובה! השלם:", en: "The sun is ___", options: ["yellow", "blue", "black", "green"], c: 0, ex: "yellow = צהוב ☀️", pic: "☀️" },
          { t: "teach", title: "בונוס: עוד צבע יפה!", body: "עוד אחד ואתה אלוף הצבעים: purple = סגול. כמו הצבע של בִּיפּ בכפתורים! 💜", en: "purple", art: ["🟣", "💜", "🍇"], scene: {"type":"seq","frames":[{"e":"🟣","cap":"purple"},{"e":"🍇","cap":"purple"}]} },
          { t: "q", q: "איך אומרים 'סגול' באנגלית?", options: ["purple", "pink", "orange", "brown"], c: 0, ex: "purple = סגול 🟣", pic: "🟣" },
          { t: "teach", title: "כל הכבוד! 🎉", body: "וואו, 7 צבעים באנגלית בכיס! אני גאה בך. בוא נלך לתרגול לחזק אותם יחד!", art: ["🌈", "🏆", "🤖"], scene: {"type":"seq","arrows":false,"frames":[{"e":"🔴","anim":"float"},{"e":"🔵","anim":"float"},{"e":"🟡","anim":"float"},{"e":"🟢","anim":"float"},{"e":"⚫","anim":"float"},{"e":"⚪","anim":"float"},{"e":"🟣","anim":"float"}]} },
        ],
      },
      {
        id: "en-opposites", title: "הפכים — Opposites", emoji: "↔️", min: 3,
        steps: [
          { t: "teach", title: "לכל מילה יש חבר הפוך!", body: "אני אגלה לך טריק של אלופים: מילים באות בזוגות של הפכים, כמו פיל ועכבר! ככה זוכרים שתי מילים במחיר של אחת 😉", en: "big ↔ small · hot ↔ cold", art: ["🐘", "↔️", "🐭"], scene: {"type":"pairs","pairs":[["🐘","big","🐭","small","size"],["🔥","hot","🧊","cold","temp"]]} },
          { t: "q", q: "מה ההפך מ-big?", options: ["tall", "hot", "small", "fast"], c: 2, ex: "big גדול ↔ small קטן", pic: "🐭" },
          { t: "q", q: "מה ההפך מ-hot?", options: ["cold", "warm", "wet", "dry"], c: 0, ex: "hot חם ↔ cold קר", pic: "🧊" },
          { t: "teach", title: "עוד זוג חשוב", body: "fast מהיר ↔ slow איטי. כמו ארנב וצב!", en: "fast ↔ slow", pic: "🐢", scene: {"type":"pairs","pairs":[["🐇","fast","🐢","slow","speed"]]} },
          { t: "q", q: "מה ההפך מ-fast?", options: ["quick", "slow", "tiny", "cold"], c: 1, ex: "fast מהיר ↔ slow איטי", pic: "🏎️" },
          { t: "q", q: "מה ההפך מ-happy?", options: ["sad", "angry", "tired", "hot"], c: 0, ex: "happy שמח ↔ sad עצוב", pic: "😢" },
          { t: "teach", title: "מעולה! 🎉", body: "טיפ: לכל מילה חדשה — חפשו חבר הפוך. עכשיו לתרגול!", pic: "🏆", scene: {"type":"pairs","pairs":[["😊","happy","😢","sad","mood"]]} },
        ],
      },
    ],
    read: [
      {
        id: "en-reading", title: "איך קוראים סיפור קצר", emoji: "🗺️", min: 5,
        steps: [
          { t: "teach", title: "קוראים בלי להילחץ", body: "3 צעדים: קוראים הכול בנחת, קוראים את השאלה, וחוזרים לחפש את התשובה בטקסט.", pic: "🗺️", scene: {"type":"seq","frames":[{"e":"📖","cap":"1 · קוראים"},{"e":"❓","cap":"2 · השאלה"},{"e":"🔍","cap":"3 · מחפשים"}]} },
          { t: "teach", title: "בואו ננסה יחד!", body: "קראו את המשפט לאט. אפשר ללחוץ על כל מילה כדי לשמוע אותה:", en: "Tom has a small dog. The dog likes to play in the garden.", pic: "🐕", scene: {"type":"story","panels":[["👦","🐶"],["🐶","🌷"]]} },
          { t: "q", q: "מה יש לטום?", en: "Tom has a small dog.", options: ["חתול גדול", "כלב קטן", "ציפור", "דג"], c: 1, ex: "a small dog = כלב קטן", pic: "🐶" },
          { t: "q", q: "איפה הכלב אוהב לשחק?", en: "The dog likes to play in the garden.", options: ["בבית", "בים", "בגינה", "בבית הספר"], c: 2, ex: "in the garden = בגינה", pic: "🌷" },
          { t: "q", q: "האם הכלב של טום גדול או קטן?", en: "Tom has a small dog.", options: ["קטן", "גדול", "ענק", "לא כתוב"], c: 0, ex: "small = קטן", pic: "🐕" },
          { t: "teach", title: "טיפ של אלופים 🕵️", body: "לא חייבים להבין כל מילה! מחפשים את המילים המוכרות — הן בדרך כלל מספיקות לתשובה.", pic: "💡", scene: {"type":"seq","frames":[{"e":"🔍","cap":"מילים מוכרות"},{"e":"💡","cap":"מספיק!"}]} },
          { t: "teach", title: "מוכנים! 🎉", body: "קוראים בנחת, שאלה, חוזרים לטקסט. עכשיו לתרגול קריאה אמיתי!", pic: "🏆", scene: {"type":"seq","frames":[{"e":"📖"},{"e":"❓"},{"e":"🔍"},{"e":"🏆"}]} },
        ],
      },
    ],
  },
  math: {
    add: [
      {
        id: "math-ten", title: "הטריק של העשר", emoji: "🔟", min: 2, max: 4,
        steps: [
          { t: "teach", title: "הטריק של העשר 🔟", body: "אני אגלה לך את הטריק הסודי של אלופי החשבון: תמיד לעבור דרך 10! למשל 8+5: לוקחים 2 מתוך ה-5 כדי להשלים ל-10, ונשאר עוד 3. בוא ננסה יחד!", en: "8 + 5 = 8 + 2 + 3 = 13", art: ["8️⃣", "➕", "🔟"], scene: {"type":"ten","a":8,"b":5} },
          { t: "q", q: "כמה חסר ל-8 כדי להגיע ל-10?", options: ["1", "2", "3", "4"], c: 1, ex: "8 + 2 = 10", pic: "🎯" },
          { t: "q", q: "וכמה חסר ל-7 כדי להגיע ל-10?", options: ["3", "2", "4", "5"], c: 0, ex: "7 + 3 = 10", pic: "🎯" },
          { t: "q", q: "עכשיו עם הטריק! השלם:", en: "9 + 4 = ___", options: ["12", "13", "14", "11"], c: 1, ex: "9+1=10, נשארו עוד 3 → 13", pic: "✨" },
          { t: "teach", title: "למה זה עובד?", body: "כי עם 10 קל לחשב! 10 ועוד משהו = פשוט מוסיפים את הספרה: 10+3=13, 10+7=17.", en: "10 + 3 = 13", pic: "💡", scene: {"type":"add","a":10,"b":3,"item":"⭐","eq":"10 + 3 = 13"} },
          { t: "q", q: "השלם:", en: "7 + 6 = ___", options: ["12", "14", "13", "11"], c: 2, ex: "7+3=10, נשארו עוד 3 → 13", pic: "🎯" },
          { t: "teach", title: "אלופים! 🎉", body: "תמיד לחפש את הדרך ל-10 — זה הופך כל חיבור לקל. עכשיו לתרגול!", pic: "🏆", scene: {"type":"ten","a":7,"b":6} },
        ],
      },
    ],
    sub: [
      {
        id: "math-sub-trick", title: "חיסור בלי פחד", emoji: "🤔", min: 2, max: 4,
        steps: [
          { t: "teach", title: "חיסור = כמה חסר?", body: "חיסור נראה מפחיד? יש לי טריק בשבילך! 🤖 במקום 12−9 פשוט שואלים: כמה צריך להוסיף ל-9 כדי להגיע ל-12? אותה תשובה — הרבה יותר קל!", en: "9 + ? = 12", art: ["9️⃣", "❓", "1️⃣2️⃣"], scene: {"type":"hops","from":9,"to":12,"eq":"12 − 9 = 3"} },
          { t: "q", q: "כמה צריך להוסיף ל-9 כדי להגיע ל-12?", options: ["2", "3", "4", "5"], c: 1, ex: "9+3=12, אז 12−9=3", pic: "🎯" },
          { t: "q", q: "השלם:", en: "14 − 9 = ___", options: ["4", "5", "6", "3"], c: 1, ex: "9+5=14 → התשובה 5", pic: "✨" },
          { t: "q", q: "השלם:", en: "12 − 8 = ___", options: ["3", "4", "5", "6"], c: 1, ex: "8+4=12 → התשובה 4", pic: "🎯" },
          { t: "teach", title: "הטריק של העשר גם כאן!", body: "15−8: קודם יורדים ל-10 (מורידים 5), ואז מורידים עוד 3. נשאר 7!", en: "15 − 5 − 3 = 7", pic: "🔟", scene: {"type":"sub","a":15,"b":8,"item":"🍎","eq":"15 − 8 = 7"} },
          { t: "q", q: "השלם:", en: "13 − 7 = ___", options: ["5", "6", "7", "4"], c: 1, ex: "13−3=10, מורידים עוד 4 → 6", pic: "🎯" },
          { t: "teach", title: "כל הכבוד! 🎉", body: "חיסור = כמה חסר, ותמיד אפשר לעצור ב-10 בדרך. לתרגול!", pic: "🏆", scene: {"type":"hops","from":8,"to":12,"eq":"12 − 8 = 4"} },
        ],
      },
    ],
    mul: [
      {
        id: "math-mul-intro", title: "מה זה בכלל כפל?", emoji: "🧮", min: 3,
        steps: [
          { t: "teach", title: "כפל = חיבור בקיצור ✖️", body: "פששש... בוא אספר לך סוד: כפל זה בכלל לא דבר חדש! 3×4 זה פשוט 4+4+4 — שלוש פעמים ארבע. כפל הוא קיצור דרך שחוסך המון פלוסים!", en: "3 × 4 = 4 + 4 + 4 = 12", art: ["🍪🍪🍪🍪", "✖️", "3️⃣"], scene: {"type":"groups","g":3,"per":4,"item":"🍪","eq":"3 × 4 = 4 + 4 + 4 = 12"} },
          { t: "q", q: "מה זה 2 × 5 בתור חיבור?", options: ["5+2", "2+2", "5+5", "5+5+5"], c: 2, ex: "פעמיים חמש: 5+5=10", pic: "🖐️" },
          { t: "q", q: "השלם:", en: "4 × 3 = ___", options: ["7", "12", "9", "15"], c: 1, ex: "3+3+3+3 = 12", pic: "🎯" },
          { t: "q", q: "השלם:", en: "5 × 4 = ___", options: ["15", "20", "25", "9"], c: 1, ex: "4+4+4+4+4 = 20", pic: "🖐️" },
          { t: "teach", title: "טריק: מותר להפוך!", body: "3×6 שווה בדיוק ל-6×3. תמיד מותר להפוך — בוחרים את הצד שקל יותר!", en: "3 × 6 = 6 × 3 = 18", pic: "🔄", scene: {"type":"groups","g":3,"per":6,"item":"🍓","eq":"3 × 6 = 6 × 3 = 18"} },
          { t: "q", q: "אם 7×2=14, כמה זה 2×7?", options: ["12", "16", "7", "14"], c: 3, ex: "בכפל מותר להפוך — אותה תשובה!", pic: "🔄" },
          { t: "teach", title: "מעולה! 🎉", body: "כפל = חיבור חוזר, ומותר להפוך. עכשיו טבלת הכפל תהיה קלה! לתרגול!", pic: "🏆", scene: {"type":"groups","g":4,"per":3,"item":"⭐","eq":"4 × 3 = 12"} },
        ],
      },
    ],
    div: [
      {
        id: "math-div-intro", title: "מה זה חילוק?", emoji: "🍬", min: 4,
        steps: [
          { t: "teach", title: "חילוק = לחלק שווה בשווה", body: "דמיין: יש לך 12 סוכריות ו-3 חברים, וכולם רוצים אותו דבר בדיוק! 🍬 זה בדיוק חילוק — 12÷3, כל אחד מקבל 4. הוגן ופשוט!", en: "12 ÷ 3 = 4", art: ["🍬", "➗", "🧒🧒🧒"], scene: {"type":"share","n":12,"k":3,"item":"🍬","who":"🧒","eq":"12 ÷ 3 = 4"} },
          { t: "q", q: "יש 10 בלונים ו-2 ילדים. כמה בלונים לכל ילד?", options: ["4", "5", "6", "2"], c: 1, ex: "10÷2=5", pic: "🎈" },
          { t: "q", q: "יש 12 עוגיות ו-4 ילדים. כמה עוגיות לכל אחד?", options: ["3", "4", "2", "6"], c: 0, ex: "12÷4=3", pic: "🍪" },
          { t: "teach", title: "הסוד: חילוק הוא כפל הפוך!", body: "15÷3=? פשוט שואלים: 3 כפול כמה נותן 15? התשובה 5!", en: "3 × 5 = 15 → 15 ÷ 3 = 5", pic: "🔄", scene: {"type":"groups","g":3,"per":5,"item":"🍬","eq":"3 × 5 = 15 → 15 ÷ 3 = 5"} },
          { t: "q", q: "השלם:", en: "18 ÷ 3 = ___", options: ["5", "6", "7", "8"], c: 1, ex: "3×6=18, לכן 18÷3=6", pic: "🎯" },
          { t: "q", q: "השלם:", en: "20 ÷ 4 = ___", options: ["4", "5", "6", "10"], c: 1, ex: "4×5=20, לכן 20÷4=5", pic: "✨" },
          { t: "teach", title: "אלופים! 🎉", body: "חילוק = לחלק שווה, או כפל הפוך. מי שיודע כפל — יודע גם חילוק! לתרגול!", pic: "🏆", scene: {"type":"share","n":10,"k":2,"item":"🎈","who":"🧒","eq":"10 ÷ 2 = 5"} },
        ],
      },
    ],
    frac: [
      {
        id: "math-frac-intro", title: "מה זה שבר?", emoji: "🍕", min: 5,
        steps: [
          { t: "teach", title: "שבר = חלק משלם 🍕", body: "מי רעב? 😋 דמיין פיצה שלמה. חותכים אותה ל-2 חלקים שווים ולוקחים אחד — זה חצי (½). שבר הוא פשוט חלק ממשהו שלם!", en: "½ = 1 out of 2", art: ["🍕", "🔪", "½"], scene: {"type":"frac","parts":2,"take":1} },
          { t: "q", q: "פיצה נחתכה ל-4 חלקים שווים ולקחת חלק אחד. איזה שבר אכלת?", options: ["חצי ½", "רבע ¼", "שליש ⅓", "שלם אחד"], c: 1, ex: "חלק 1 מתוך 4 = רבע", pic: "🍕" },
          { t: "teach", title: "המספר למטה קובע!", body: "המספר למטה אומר לכמה חלקים חילקנו. מחלקים ליותר — כל חלק קטן יותר! לכן ½ גדול מ-¼.", en: "½ > ¼", pic: "⚖️", scene: {"type":"compare","left":2,"right":4} },
          { t: "q", q: "מה גדול יותר?", options: ["¼ רבע", "½ חצי", "⅕ חמישית", "כולם שווים"], c: 1, ex: "מחלקים לפחות חלקים = חלק גדול יותר", pic: "🍰" },
          { t: "q", q: "כמה זה חצי מ-10?", options: ["4", "5", "6", "2"], c: 1, ex: "10 ÷ 2 = 5", pic: "🔟" },
          { t: "q", q: "וכמה זה רבע מ-8?", options: ["2", "4", "1", "3"], c: 0, ex: "8 ÷ 4 = 2", pic: "🍰" },
          { t: "teach", title: "מעולה! 🎉", body: "שבר = חלק משלם, והמספר למטה אומר לכמה חילקנו. לתרגול שברים!", pic: "🏆", scene: {"type":"frac","parts":4,"take":1} },
        ],
      },
    ],
    word: [
      {
        id: "math-word-method", title: "איך פותרים בעיה בסיפור", emoji: "🗺️", min: 2,
        steps: [
          { t: "teach", title: "יש שיטה! 🧩", body: "בעיה בסיפור זה כמו חידת בלשים, ואני אתן לך את המפה! 🗺️ 4 צעדים: קוראים לאט, מסמנים את המספרים, שואלים 'מוסיפים או מורידים?', ופותרים. בוא נצא לדרך!", art: ["🔍", "🔢", "✅"], scene: {"type":"seq","frames":[{"e":"📖","cap":"קוראים"},{"e":"🔢","cap":"מספרים"},{"e":"🤔","cap":"➕ או ➖?"},{"e":"✅","cap":"פותרים"}]} },
          { t: "teach", title: "מילים מסגירות!", body: "'קיבל עוד', 'ביחד', 'סך הכול' = חיבור ➕. 'נתן', 'נשאר', 'עפו' = חיסור ➖.", pic: "🕵️", scene: {"type":"seq","frames":[{"e":"🎁","cap":"קיבל עוד ➕"},{"e":"🎈","cap":"עפו ➖"}]} },
          { t: "q", q: "לדנה 5 תפוחים 🍎 והיא קיבלה עוד 3. מה עושים?", options: ["מחסרים: 5−3", "מחברים: 5+3", "כופלים: 5×3", "מחלקים"], c: 1, ex: "'קיבלה עוד' = חיבור!", pic: "🍎" },
          { t: "q", q: "אז כמה תפוחים יש לדנה עכשיו?", options: ["7", "2", "8", "15"], c: 2, ex: "5 + 3 = 8", pic: "🍎", scene: {"type":"add","a":5,"b":3,"item":"🍎"} },
          { t: "q", q: "ליוסי היו 10 בלונים 🎈 ו-4 עפו. מה עושים?", options: ["מחברים: 10+4", "מחסרים: 10−4", "כופלים: 10×4", "שום דבר"], c: 1, ex: "'עפו' = הלכו = חיסור", pic: "🎈" },
          { t: "teach", title: "גם כפל מתחבא בסיפורים!", body: "עוד רמז של בלשים: כשכתוב 'בכל קופסה', 'לכל ילד' או 'שורות של' — כנראה מתחבא שם כפל או חילוק! 🕵️", pic: "📦", scene: {"type":"groups","g":3,"per":4,"item":"🍫","eq":"3 × 4 = 12"} },
          { t: "q", q: "בקופסה יש 3 שורות של 4 שוקולדים. מה עושים?", options: ["כופלים: 3×4", "מחברים: 3+4", "מחסרים: 4−3", "מחלקים: 4÷3"], c: 0, ex: "'שורות של' = כפל: 3×4=12", pic: "🍫" },
          { t: "teach", title: "אלופים! 🎉", body: "לקרוא לאט, לסמן מספרים, לזהות את מילת הקסם — ולפתור. לתרגול בעיות!", pic: "🏆", scene: {"type":"seq","frames":[{"e":"🔍"},{"e":"🔢"},{"e":"✅"}]} },
        ],
      },
    ],
  },
  heb: {
    story: [
      {
        id: "heb-story-method", title: "קוראים סיפור כמו בלשים", emoji: "🕵️", min: 1,
        steps: [
          { t: "teach", title: "קוראים כמו בלשים 🕵️", body: "היום אתה בלש ואני העוזר שלך! 🤖 בכל סיפור מתחבאות כל התשובות — קוראים לאט ומחפשים רמזים: מי? מה? איפה? מתי?", art: ["🕵️", "🔍", "📖"], scene: {"type":"seq","frames":[{"e":"👦","cap":"מי?"},{"e":"🎈","cap":"מה?"},{"e":"🏠","cap":"איפה?"},{"e":"⏰","cap":"מתי?"}]} },
          { t: "teach", title: "בואו ננסה!", body: "קראו את המשפט הקצר הזה בנחת:", en: "רוני הלכה עם אבא לים ביום שישי.", pic: "🏖️", scene: {"type":"story","panels":[["👧","👨"],["🏖️","📅"]]} },
          { t: "q", q: "מי הלך לים?", en: "רוני הלכה עם אבא לים ביום שישי.", options: ["רוני ואבא", "רוני ואימא", "אבא לבד", "סבא וסבתא"], c: 0, ex: "מי? רוני ואבא", pic: "👨‍👧" },
          { t: "q", q: "מתי הם הלכו לים?", en: "רוני הלכה עם אבא לים ביום שישי.", options: ["בשבת", "ביום שישי", "בחג", "בלילה"], c: 1, ex: "מתי? ביום שישי", pic: "📅" },
          { t: "teach", title: "מקרה חדש לבלש! 🔎", body: "מעולה! עכשיו מקרה קצת יותר קשה. קרא לאט ושים לב לרמזים:", en: "דני מצא חתלתול קטן בגינה. הוא נתן לו צלוחית חלב.", pic: "🐈", scene: {"type":"story","panels":[["👦","🐱","🌷"],["🥛"]]} },
          { t: "q", q: "מה דני נתן לחתלתול?", en: "דני מצא חתלתול קטן בגינה. הוא נתן לו צלוחית חלב.", options: ["חלב", "עוגה", "דג", "מים"], c: 0, ex: "כתוב: צלוחית חלב", pic: "🥛" },
          { t: "q", q: "איפה דני מצא את החתלתול?", en: "דני מצא חתלתול קטן בגינה. הוא נתן לו צלוחית חלב.", options: ["ברחוב", "בגינה", "בבית", "בכיתה"], c: 1, ex: "איפה? בגינה", pic: "🌷" },
          { t: "teach", title: "טיפ הזהב ✨", body: "לא בטוחים בתשובה? חוזרים לקטע ומחפשים את המילים מהשאלה — התשובה תמיד מסתתרת לידן!", pic: "💡", scene: {"type":"seq","frames":[{"e":"❓","cap":"השאלה"},{"e":"🔍","cap":"חוזרים לקטע"},{"e":"💡","cap":"התשובה"}]} },
          { t: "teach", title: "מוכנים! 🎉", body: "מי, מה, איפה, מתי — ועכשיו לתרגול סיפורים אמיתי!", pic: "🏆", scene: {"type":"seq","frames":[{"e":"👦","cap":"מי?"},{"e":"🎈","cap":"מה?"},{"e":"🏠","cap":"איפה?"},{"e":"⏰","cap":"מתי?"}]} },
        ],
      },
    ],
  },
  sci: {
    animals: [
      {
        id: "sci-animal-groups", title: "משפחות של בעלי חיים", emoji: "🦁", min: 1,
        steps: [
          { t: "teach", title: "לכל חיה יש משפחה 🐾", body: "בוא נצא לספארי! 🦁 לכל חיה בעולם יש משפחה: יונקים שותים חלב אימא — כלב, פרה, וגם אנחנו! ציפורים בוקעות מביצה ויש להן נוצות וכנפיים.", art: ["🐶", "🐦", "🐟"], scene: {"type":"sort","bins":[{"cap":"יונקים"},{"cap":"ציפורים"}],"items":[{"e":"🐶","bin":0},{"e":"🐦","bin":1},{"e":"🐮","bin":0},{"e":"🐔","bin":1},{"e":"🧒","bin":0}]} },
          { t: "q", q: "מי מהחיות היא יונק?", options: ["כלב", "תרנגולת", "צפרדע", "דג זהב"], c: 0, ex: "גור כלבים שותה חלב מאימא = יונק", pic: "🐶" },
          { t: "teach", title: "דגים וזוחלים", body: "דגים חיים במים ונושמים בזימים. זוחלים — נחש, לטאה וצב — זוחלים על האדמה ויש להם קשקשים.", pic: "🐍", scene: {"type":"sort","bins":[{"cap":"דגים"},{"cap":"זוחלים"}],"items":[{"e":"🐟","bin":0},{"e":"🐍","bin":1},{"e":"🐠","bin":0},{"e":"🦎","bin":1},{"e":"🐢","bin":1}]} },
          { t: "q", q: "איך הדג נושם מתחת למים?", options: ["בריאות", "בזימים", "באף", "הוא עוצר נשימה"], c: 1, ex: "לדגים יש זימים במקום ריאות", pic: "🐟" },
          { t: "q", q: "איזו חיה היא זוחל?", options: ["דולפין", "ינשוף", "לטאה", "עכבר"], c: 2, ex: "הלטאה זוחלת ויש לה קשקשים", pic: "🦎" },
          { t: "q", q: "מה יש לציפורים שאין ליונקים?", options: ["עיניים", "נוצות", "רגליים", "לב"], c: 1, ex: "נוצות יש רק לציפורים! 🪶", pic: "🪶" },
          { t: "teach", title: "מעולה! 🎉", body: "יונקים, ציפורים, דגים וזוחלים — עכשיו אתה מכיר את כל המשפחות! אני גאה בך. בוא נתרגל יחד!", art: ["🐾", "🏆", "🤖"], scene: {"type":"sort","bins":[{"cap":"יונקים"},{"cap":"ציפורים"},{"cap":"דגים"},{"cap":"זוחלים"}],"items":[{"e":"🐶","bin":0},{"e":"🐦","bin":1},{"e":"🐟","bin":2},{"e":"🦎","bin":3}]} },
        ],
      },
    ],
    plants: [
      {
        id: "sci-seed-flower", title: "מזרע לפרח", emoji: "🌻", min: 1,
        steps: [
          { t: "teach", title: "הקסם של הזרע", body: "בוא נגדל צמח יחד! 🌱 הכול מתחיל בזרע קטן באדמה. נותנים לו מים ושמש — והוא מתעורר לחיים!", art: ["🌰", "🌱", "🌻"], scene: {"type":"seq","frames":[{"e":"🌰","cap":"זרע","anim":"grow"},{"e":"💧☀️","cap":"מים ושמש"},{"e":"🌱","cap":"נובט","anim":"grow"},{"e":"🌻","cap":"פרח","anim":"grow"}]} },
          { t: "q", q: "מה צריך הזרע כדי לנבוט?", options: ["מים ושמש", "ממתקים", "חושך בלבד", "רוח חזקה"], c: 0, ex: "מים + שמש = צמח שמח", pic: "💧" },
          { t: "teach", title: "השורש והגבעול — צוות מנצח", body: "מהזרע יוצא שורש שחופר למטה ושותה מים מהאדמה, וגבעול שמטפס למעלה אל אור השמש. עבודת צוות מושלמת!", art: ["⬇️", "🌱", "⬆️"], scene: {"type":"seq","arrows":false,"frames":[{"e":"🌱⬆️","cap":"גבעול → לשמש","anim":"float"},{"e":"🫚⬇️","cap":"שורש → שותה מים","anim":"float"}]} },
          { t: "q", q: "מה תפקיד השורש?", options: ["לתפוס שמש", "לשתות מים מהאדמה", "להריח פרחים", "להעיף עלים"], c: 1, ex: "השורש שותה מים מהאדמה", pic: "🥕" },
          { t: "q", q: "לאן מטפס הגבעול?", options: ["מתחת לאדמה", "אל הים", "אל אור השמש", "לתוך הזרע"], c: 2, ex: "הגבעול מחפש את השמש", pic: "☀️" },
          { t: "teach", title: "כל הכבוד! 🎉", body: "מזרע קטן לפרח ענק — עכשיו אתה יודע את הסוד של הצמחים! בוא נתרגל יחד!", art: ["🌰", "➡️", "🌻"], scene: {"type":"seq","frames":[{"e":"🌰","anim":"grow"},{"e":"🌱","anim":"grow"},{"e":"🌻","anim":"grow"}]} },
        ],
      },
    ],
    body: [
      {
        id: "sci-amazing-body", title: "הגוף המדהים שלך", emoji: "🫀", min: 2,
        steps: [
          { t: "teach", title: "יש לך מכונה מדהימה!", body: "ידעת שהגוף שלך עובד בשבילך 24 שעות ביממה? הלב שולח דם, הריאות נושמות, והמוח מנהל את הכול. בוא נכיר את הצוות!", art: ["🫀", "🫁", "🧠"], scene: {"type":"seq","arrows":false,"frames":[{"e":"🫀","cap":"לב","anim":"pulse"},{"e":"🫁","cap":"ריאות","anim":"breathe"},{"e":"🧠","cap":"מוח","anim":"float"}]} },
          { t: "q", q: "איזה איבר שולח דם לכל הגוף?", options: ["הלב", "האוזן", "הברך", "השיער"], c: 0, ex: "הלב פועם ושולח דם לכל הגוף", pic: "🫀" },
          { t: "teach", title: "המוח — המפקד", body: "המוח שלך הוא המפקד: הוא חושב, זוכר ומחליט. והנה סוד: כמו שריר, ככל שמתאמנים עליו יותר — למשל ממש עכשיו! — הוא מתחזק!", pic: "🧠", scene: {"type":"seq","frames":[{"e":"🧠","cap":"חושב","anim":"pulse"},{"e":"💭","cap":"זוכר"},{"e":"✅","cap":"מחליט"}]} },
          { t: "q", q: "מה המוח עושה?", options: ["רק ישן", "חושב, זוכר ומחליט", "מזרים דם", "לועס אוכל"], c: 1, ex: "המוח הוא מרכז החשיבה והזיכרון", pic: "🧠" },
          { t: "q", q: "בעזרת איזה איבר אנחנו נושמים?", options: ["הקיבה", "הלב", "הריאות", "העצמות"], c: 2, ex: "הריאות מכניסות אוויר לגוף", pic: "💨" },
          { t: "teach", title: "איזה צוות! 🎉", body: "לב, ריאות ומוח — המכונה הכי משוכללת בעולם, והיא שלך! בוא נתרגל על גוף האדם!", art: ["💪", "🏆", "🤖"], scene: {"type":"seq","arrows":false,"frames":[{"e":"🫀","cap":"לב","anim":"pulse"},{"e":"🫁","cap":"ריאות","anim":"breathe"},{"e":"🧠","cap":"מוח","anim":"float"}]} },
        ],
      },
    ],
    earth: [
      {
        id: "sci-space-trip", title: "מסע לחלל", emoji: "🚀", min: 2,
        steps: [
          { t: "teach", title: "יוצאים לחלל!", body: "שים קסדה, אנחנו ממריאים! 👨‍🚀 כדור הארץ מסתובב סביב עצמו — וככה יש יום ולילה. והוא גם מקיף את השמש — וככה יש שנה שלמה!", art: ["🌍", "🌙", "☀️"], scene: {"type":"orbit","mode":"day"} },
          { t: "q", q: "למה יש יום ולילה?", options: ["כי כדור הארץ מסתובב סביב עצמו", "כי השמש נכבית בלילה", "כי הירח מסתיר", "כי העננים מכסים"], c: 0, ex: "הצד שפונה לשמש = יום, הצד השני = לילה", pic: "🌓" },
          { t: "q", q: "כמה זמן לוקח לכדור הארץ להקיף את השמש?", options: ["יום אחד", "שנה שלמה", "שעה", "שבוע"], c: 1, ex: "הקפה אחת של השמש = שנה", pic: "🌍" },
          { t: "teach", title: "הירח — השכן שלנו", body: "הירח מקיף את כדור הארץ. והנה סוד מגניב: הוא בכלל לא מאיר בעצמו! הוא כמו מראה ענקית שמחזירה את אור השמש.", pic: "🌙", scene: {"type":"orbit","mode":"moon"} },
          { t: "q", q: "למה הירח 'מאיר' בלילה?", options: ["יש בו נורות", "הוא שורף אש", "הוא מחזיר את אור השמש", "הוא זוהר מעצמו"], c: 2, ex: "הירח מחזיר את אור השמש כמו מראה", pic: "🌕" },
          { t: "teach", title: "טיסה מוצלחת! 🎉", body: "יום ולילה, שנה, וירח-מראה — אתה כבר אסטרונאוט של ידע! בוא נתרגל חלל!", art: ["🚀", "🏆", "🤖"], scene: {"type":"orbit","mode":"year"} },
        ],
      },
    ],
  },
};

// ---------- חשבון: מחולל שאלות (אינסופי, עובד גם בלי רשת) ----------

const OBJECTS = ["🍎", "🎈", "⭐", "🍪", "⚽", "🐤"];
const THEMES = {
  soccer: { e: "⚽", thing: "כדורים" },
  animals: { e: "🐶", thing: "גורים" },
  space: { e: "🚀", thing: "חלליות" },
  music: { e: "🎵", thing: "שירים" },
  games: { e: "🎮", thing: "משחקים" },
  food: { e: "🍪", thing: "עוגיות" },
  nature: { e: "🌳", thing: "עצים" },
  art: { e: "🎨", thing: "ציורים" },
};

// 4 תשובות: הנכונה + מסיחים קרובים (טעויות אופייניות)
function distractors(correct, spread) {
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < 4 && guard++ < 60) {
    const delta = rnd(1, Math.max(2, spread)) * (Math.random() < 0.5 ? -1 : 1);
    const v = correct + delta;
    if (v >= 0) set.add(v);
  }
  let extra = correct + Math.max(3, spread) + 1;
  while (set.size < 4) set.add(extra++);
  const opts = shuffle([...set]);
  return { options: opts.map(String), c: opts.indexOf(correct) };
}

function genAdd(level) {
  if (level <= 1) {
    const a = rnd(1, 5), b = rnd(1, Math.min(5, 10 - a));
    const o = OBJECTS[rnd(0, OBJECTS.length - 1)];
    return {
      q: "כמה יש ביחד?",
      en: `${o.repeat(a)} + ${o.repeat(b)} = ___`,
      pic: o,
      ...distractors(a + b, 2),
      ex: `${a} + ${b} = ${a + b} — ספרנו את כולם יחד!`,
    };
  }
  const max = level === 2 ? 20 : level === 3 ? 100 : level === 4 ? 300 : 900;
  const a = rnd(Math.floor(max / 10), max - 2), b = rnd(1, max - a);
  return {
    q: "כמה זה?",
    en: `${a} + ${b} = ___`,
    pic: "➕",
    ...distractors(a + b, level <= 2 ? 3 : 10),
    ex: `${a} + ${b} = ${a + b}`,
  };
}

function genSub(level) {
  const max = level <= 1 ? 10 : level === 2 ? 20 : level === 3 ? 100 : level === 4 ? 300 : 900;
  const a = rnd(Math.ceil(max / 2), max), b = rnd(1, a - 1);
  return {
    q: "כמה זה?",
    en: `${a} − ${b} = ___`,
    pic: level <= 1 ? "🎈" : "➖",
    ...distractors(a - b, level <= 2 ? 3 : 10),
    ex: `${a} − ${b} = ${a - b}`,
  };
}

function genMul(level) {
  let a, b;
  if (level <= 3) { a = rnd(2, 5); b = rnd(2, 10); }
  else if (level === 4) { a = rnd(2, 10); b = rnd(2, 10); }
  else if (level === 5) { a = rnd(3, 9); b = rnd(11, 19); }
  else { a = rnd(6, 12); b = rnd(12, 25); }
  return {
    q: "כמה זה?",
    en: `${a} × ${b} = ___`,
    pic: "✖️",
    ...distractors(a * b, a),
    ex: `${a} × ${b} = ${a * b}`,
  };
}

function genDiv(level) {
  const b = level === 4 ? rnd(2, 5) : rnd(2, 10);
  const ans = level >= 6 ? rnd(5, 20) : rnd(2, 10);
  return {
    q: "כמה זה?",
    en: `${b * ans} ÷ ${b} = ___`,
    pic: "➗",
    ...distractors(ans, 3),
    ex: `${b * ans} ÷ ${b} = ${ans}, כי ${ans} × ${b} = ${b * ans}`,
  };
}

function genFrac(level) {
  const kind = rnd(0, 2);
  if (kind === 0) {
    const x = rnd(2, level >= 6 ? 30 : 15) * 2;
    return {
      q: "כמה זה חצי?",
      en: `½ × ${x} = ___`,
      pic: "🍕",
      ...distractors(x / 2, 3),
      ex: `חצי מ-${x} הוא ${x / 2}`,
    };
  }
  if (kind === 1) {
    const x = rnd(2, level >= 6 ? 20 : 10) * 4;
    return {
      q: "כמה זה רבע?",
      en: `¼ × ${x} = ___`,
      pic: "🍰",
      ...distractors(x / 4, 3),
      ex: `רבע = לחלק ל-4. ${x} ÷ 4 = ${x / 4}`,
    };
  }
  const fr = shuffle(["½", "⅓", "¼", "⅕"]);
  return {
    q: "איזה שבר הכי גדול?",
    en: "",
    pic: "🍕",
    options: fr,
    c: fr.indexOf("½"),
    ex: "כשמחלקים לפחות חלקים — כל חלק גדול יותר. ½ הכי גדול",
  };
}

// בעיות בסיפור — משולבות עם תחומי העניין של הילד
function genWord(level, profile) {
  const ids = (profile.interests || []).filter((id) => THEMES[id]);
  const th = THEMES[ids.length ? ids[rnd(0, ids.length - 1)] : "food"];
  const kinds = ["add", "sub"];
  if (level >= 3) kinds.push("mul");
  if (level >= 4) kinds.push("div");
  const kind = kinds[rnd(0, kinds.length - 1)];
  const small = level <= 2;
  if (kind === "add") {
    const a = rnd(2, small ? 9 : 40), b = rnd(2, small ? 9 : 40);
    return {
      q: `יש לך ${a} ${th.thing} ${th.e} וקיבלת עוד ${b}. כמה יש לך עכשיו?`,
      en: "", pic: th.e,
      ...distractors(a + b, 3),
      ex: `${a} + ${b} = ${a + b}`,
    };
  }
  if (kind === "sub") {
    const a = rnd(small ? 5 : 20, small ? 10 : 60), b = rnd(1, a - 1);
    return {
      q: `היו לך ${a} ${th.thing} ${th.e} ונתת לחברים ${b}. כמה נשארו?`,
      en: "", pic: th.e,
      ...distractors(a - b, 3),
      ex: `${a} − ${b} = ${a - b}`,
    };
  }
  if (kind === "mul") {
    const a = rnd(2, 6), b = rnd(2, 8);
    return {
      q: `יש ${a} קופסאות, ובכל אחת ${b} ${th.thing} ${th.e}. כמה בסך הכול?`,
      en: "", pic: "📦",
      ...distractors(a * b, a),
      ex: `${a} × ${b} = ${a * b}`,
    };
  }
  const b2 = rnd(2, 5), ans = rnd(2, 9);
  return {
    q: `יש ${b2 * ans} ${th.thing} ${th.e} לחלק שווה בשווה בין ${b2} חברים. כמה מקבל כל אחד?`,
    en: "", pic: th.e,
    ...distractors(ans, 2),
    ex: `${b2 * ans} ÷ ${b2} = ${ans}`,
  };
}

function genMath(level, topicId, profile) {
  switch (topicId) {
    case "add": return genAdd(level);
    case "sub": return genSub(level);
    case "mul": return genMul(level);
    case "div": return genDiv(level);
    case "frac": return genFrac(level);
    case "word": return genWord(level, profile);
    default: return genAdd(level);
  }
}

function mathLesson(level, topicId, profile, seen = []) {
  const avail = TOPICS.math
    .filter((t) => t.id !== "mix" && level >= t.min)
    .map((t) => t.id);
  const qs = [];
  const inLesson = new Set();
  let guard = 0;
  while (qs.length < 5 && guard++ < 200) {
    const tid = topicId === "mix" ? avail[rnd(0, avail.length - 1)] : topicId;
    const q = genMath(level, tid, profile);
    const key = qKey(q);
    if (inLesson.has(key)) continue;
    // מניעת חזרה על שאלות משיעורים קודמים; אחרי הרבה ניסיונות מוותרים בעדינות
    if (guard < 120 && seen.includes(key)) continue;
    inLesson.add(key);
    qs.push(q);
  }
  return qs;
}

// שיעורים שמתאימים לרמת הילד: מעל המינימום ולא קלים מדי (max)
function lessonsFor(subj, topicId, level) {
  return ((LESSONS[subj] && LESSONS[subj][topicId]) || []).filter(
    (l) => level >= l.min && level <= (l.max || 6)
  );
}

// התקדמות אמיתית במקצוע (0-100): מה שהילד באמת עשה, לא הרמה שבה התחיל.
// חצי מהמד = שיעורים מודרכים שהושלמו; חצי = תשובות נכונות שנצברו בתרגול (עד 100)
function subjectProgress(p, sub) {
  const allLessons = Object.values(LESSONS[sub] || {}).flat();
  const done = allLessons.filter((l) => (p.lessonsDone || []).includes(l.id)).length;
  const lessonsPart = allLessons.length ? done / allLessons.length : 0;
  const answers = (p.history || [])
    .filter((h) => h.subject === sub)
    .reduce((a, h) => a + h.correct, 0);
  const practicePart = Math.min(1, answers / 100);
  return Math.round((lessonsPart * 0.5 + practicePart * 0.5) * 100);
}

// זמן למידה אקטיבי: צבירת שניות ליום (מפתח תאריך ISO), שמירת 3 שבועות אחרונים
function mergeActivity(activity, secs) {
  const a = { ...(activity || {}) };
  if (secs > 0) {
    const day = todayStr();
    a[day] = (a[day] || 0) + secs;
  }
  const keys = Object.keys(a).sort();
  while (keys.length > 21) delete a[keys.shift()];
  return a;
}

const DAY_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

// בחירת שאלת אבחון לפי מקצוע ורמה
function pickDiagQuestion(subj, level, used, profile) {
  if (subj === "math") {
    const avail = TOPICS.math.filter((t) => t.id !== "mix" && level >= t.min).map((t) => t.id);
    const q = genMath(level, avail[rnd(0, avail.length - 1)], profile);
    return { q, key: qKey(q) };
  }
  const bank = SUBJECT_BANKS[subj] || BANK;
  const pool = bank[level] || bank[3];
  const all = pool.map((q, idx) => ({ q, key: subj + level + ":" + idx }));
  const avail = all.filter((x) => !used.has(x.key));
  return shuffle(avail.length ? avail : all)[0];
}

// ---------- המלצת השיעור הבא ----------

function topicLabelOf(sub, id) {
  const t = (TOPICS[sub] || []).find((x) => x.id === id);
  return t ? `${t.label} ${t.emoji}` : id;
}

function recommendNext(p, onlySub = null) {
  const hist = p.history || [];
  const stats = {};
  hist.forEach((h, idx) => {
    const k = h.subject + ":" + h.topic;
    const s = (stats[k] = stats[k] || { c: 0, t: 0, last: -1 });
    s.c += h.correct;
    s.t += h.total;
    s.last = idx;
  });
  const cands = [];
  for (const sub of Object.keys(TOPICS)) {
    if (onlySub && sub !== onlySub) continue;
    for (const t of TOPICS[sub]) {
      if (t.id === "mix" || p.levels[sub] < t.min) continue;
      const s = stats[sub + ":" + t.id];
      cands.push({ sub, t, ratio: s ? s.c / s.t : null, last: s ? s.last : -1 });
    }
  }
  if (!cands.length) return null;
  // עדיפות 1: נושא חלש (מתחת ל-70% הצלחה) — לחיזוק
  const weak = cands
    .filter((c) => c.ratio != null && c.ratio < 0.7)
    .sort((a, b) => a.ratio - b.ratio)[0];
  if (weak) return { ...weak, why: "כדאי לחזק את זה 💪" };
  // עדיפות 2: נושא שעוד לא נוסה
  const fresh = cands.filter((c) => c.ratio == null);
  if (fresh.length) return { ...fresh[rnd(0, fresh.length - 1)], why: "משהו חדש לגלות! ✨" };
  // אחרת: הנושא שהכי מזמן לא תורגל
  cands.sort((a, b) => a.last - b.last);
  return { ...cands[0], why: "מזמן לא תרגלנו 🔄" };
}

// ---------- רכיבים ויזואליים ----------

function Confetti({ burst, big }) {
  if (!burst) return null;
  const emo = big ? ["🎉", "⭐", "✨", "🎈", "🏆", "💛"] : ["✨", "⭐", "💛", "💚"];
  const n = big ? 22 : 12;
  return (
    <div className="confetti" key={burst} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          style={{
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * 0.25 + "s",
            animationDuration: 0.9 + Math.random() * 0.8 + "s",
            fontSize: 13 + Math.random() * (big ? 18 : 10) + "px",
          }}
        >
          {emo[i % emo.length]}
        </span>
      ))}
    </div>
  );
}

function StepPath({ total, done, current }) {
  return (
    <div className={"path" + (total > 6 ? " small" : "")} role="img" aria-label={`צעד ${Math.min(done + 1, total)} מתוך ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className={"path-line" + (i <= done ? " filled" : "")} />}
          <div className={"stone" + (i < done ? " done" : i === current ? " current" : "")}>
            {i < done ? "✓" : i === current ? <span className="fox">🤖</span> : ""}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function Bubble({ children }) {
  return <div className="bubble">{children}</div>;
}

// מילה בודדת: נכנסת באנימציה קצרה; לחיצה מקריאה אותה — באנגלית או בעברית
function Word({ text, delay, canSpeak }) {
  const [wig, setWig] = useState(false);
  const en = hasEnglish(text);
  const speakable = canSpeak && (en || isHeb(text));
  return (
    <span
      className={"word" + (wig ? " wiggle" : "") + (speakable ? " speakable" : "")}
      style={{ animationDelay: delay + "ms" }}
      onClick={
        speakable
          ? () => {
              if (en) speak(text.replace(/[^A-Za-z'’-]/g, ""));
              else speakHe(text.replace(/[^֐-׿'"-]/g, ""));
              setWig(true);
              setTimeout(() => setWig(false), 650);
            }
          : undefined
      }
    >
      {text}
    </span>
  );
}

// טקסט חי: כל מילה מונפשת; רצף קווים תחתונים הופך לקו השלמה אחיד אחד,
// שמתמלא בתשובה הנכונה אחרי המענה (reveal)
function AnimText({ text, reveal, canSpeak }) {
  const parts = String(text).split(/(\s+)/);
  let w = 0;
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (/^\s+$/.test(p)) return <React.Fragment key={i}> </React.Fragment>;
        if (/_{2,}/.test(p)) {
          const m = p.match(/^(.*?)_{2,}(.*)$/);
          return (
            <React.Fragment key={i}>
              {m[1] ? <Word text={m[1]} delay={w++ * 70} canSpeak={canSpeak} /> : null}
              <span className={"blank" + (reveal ? " filled" : "")} aria-label="מילה חסרה">
                {reveal || ""}
              </span>
              {m[2] ? <Word text={m[2]} delay={w++ * 70} canSpeak={canSpeak} /> : null}
            </React.Fragment>
          );
        }
        return <Word key={i} text={p} delay={w++ * 70} canSpeak={canSpeak} />;
      })}
    </>
  );
}

// סמלי למידה מרחפים סביב הרובוט — מתחלפים בין ערכות: אנגלית, מדע, עברית, חשבון, חלל
const FLOAT_SETS = [
  ["A", "B", "C"],
  ["🔭", "🧪", "🔬"],
  ["א", "ב", "ג"],
  ["3", "➕", "7"],
  ["🪐", "🚀", "⭐"],
  ["📖", "✏️", "🎨"],
];

function FloatingSymbols() {
  const [set, setSet] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setSet((s) => (s + 1) % FLOAT_SETS.length), 2600);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="floaties" aria-hidden="true">
      {FLOAT_SETS[set].map((it, i) => (
        <span
          key={set + "-" + i}
          className={"floatie f" + i}
          style={{ animationDelay: i * 130 + "ms" }}
        >
          {it}
        </span>
      ))}
    </div>
  );
}

// בִּיפּ — פרצוף רובוט מודרני (SVG מצויר, לא אימוג'י): עיניים ממצמצות ואנטנה מהבהבת
function BotFace({ size = 96 }) {
  return (
    <svg className="botface" width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="botg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B7BFF" />
          <stop offset="1" stopColor="#5546C8" />
        </linearGradient>
      </defs>
      <line x1="60" y1="24" x2="60" y2="11" stroke="#5546C8" strokeWidth="5" strokeLinecap="round" />
      <circle className="bot-ant" cx="60" cy="9" r="6.5" fill="#FFC43D" />
      <rect x="6" y="54" width="11" height="28" rx="5.5" fill="#5546C8" />
      <rect x="103" y="54" width="11" height="28" rx="5.5" fill="#5546C8" />
      <rect x="16" y="24" width="88" height="84" rx="26" fill="url(#botg)" />
      <rect x="28" y="40" width="64" height="52" rx="17" fill="#20305A" opacity="0.28" />
      <g className="bot-eyes">
        <circle cx="46" cy="62" r="9" fill="#fff" />
        <circle cx="74" cy="62" r="9" fill="#fff" />
        <circle cx="48" cy="60" r="3.5" fill="#5546C8" />
        <circle cx="76" cy="60" r="3.5" fill="#5546C8" />
      </g>
      <path d="M46 80 Q60 90 74 80" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// אימוג'י של שאלה/שיעור — קופץ בשמחה בתשובה נכונה, ומגיב גם ללחיצה (כיף קטן)
function Pic({ emoji, happy }) {
  const [pok, setPok] = useState(false);
  if (!emoji) return null;
  return (
    <div
      className={"qpic" + (happy ? " happy" : "") + (pok ? " poke" : "")}
      onClick={() => {
        sfx.pop();
        setPok(true);
        setTimeout(() => setPok(false), 550);
      }}
    >
      {emoji}
    </div>
  );
}

// עידוד של חבר — משתנה לפי ההתקדמות בשיעור
function courseCheer(i, total, name) {
  if (i === 0) return `יאללה ${name}, בוא נגלה משהו חדש יחד! 🚀`;
  if (i >= total - 1) return "הצעד האחרון — אתה תותח! 🔥";
  const pct = i / total;
  if (pct < 0.4) return "מעולה, אתה איתי בדרך הנכונה! 👣";
  if (pct < 0.7) return "וואו, כבר עברנו את האמצע! 💪";
  return "עוד רגע מסיימים — איזה אלוף! ⭐";
}

// ---------- מסך שאלה (משותף לאבחון ולשיעור) ----------

// מקלדת קוד הורים: 4 נקודות + ספרות (כניסה לאזור ההורים ומחיקת לומד)
function PinPad({ value, err, onDigit, onBack }) {
  return (
    <>
      <div className="pindots">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={"pindot" + (value.length > i ? " full" : "") + (err ? " err" : "")}
          />
        ))}
      </div>
      <div className="pinpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} className="pinkey" onClick={() => onDigit(String(d))}>
            {d}
          </button>
        ))}
        <span />
        <button className="pinkey" onClick={() => onDigit("0")}>0</button>
        <button className="pinkey" onClick={onBack} aria-label="מחיקת ספרה">
          ⌫
        </button>
      </div>
    </>
  );
}

function QuestionCard({ q, onAnswer, phase, selected }) {
  const answered = phase !== "idle";
  const hasBlank = /_{2,}/.test(q.en || "");
  const reveal = answered && hasBlank ? q.options[q.c] : null;
  const sc = useMemo(() => sceneFor(q), [q]);

  // הקראה אוטומטית: ההנחיה בעברית, ואז המשפט המלא (אנגלית או עברית)
  useEffect(() => {
    speakHe(q.q);
    if (q.en) speakAny(q.en, { queue: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="qcard">
      {sc ? <Scene sc={sc} playing={answered} /> : <Pic emoji={q.pic} happy={phase === "right"} />}
      <div className="qtext">
        <AnimText text={q.q} canSpeak />
      </div>
      {q.en ? (
        <div className={"qen" + (isHeb(q.en) ? " heb" : "")} dir={isHeb(q.en) ? "rtl" : "ltr"}>
          <button
            className="sayall"
            onClick={() => speakAny(q.en)}
            aria-label="הקראת המשפט המלא"
            title="הקראת המשפט המלא"
          >
            🔊
          </button>
          <AnimText text={q.en} reveal={reveal} canSpeak />
        </div>
      ) : null}
      {q.en && !answered && !sc ? (
        <div className="hint">🔊 לחצו על מילה כדי לשמוע אותה — או על הרמקול להקראת המשפט המלא</div>
      ) : null}
      <div className="answers">
        {q.options.map((opt, i) => {
          let cls = "ans";
          if (answered) {
            if (i === q.c) cls += " right";
            else if (i === selected) cls += " wrong";
            else cls += " dim";
          }
          return (
            <button
              key={i}
              className={cls}
              style={{ animationDelay: answered ? "0ms" : i * 80 + "ms" }}
              dir={isHeb(opt) ? "rtl" : "ltr"}
              disabled={answered}
              onClick={() => onAnswer(i)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- האפליקציה ----------

export default function App() {
  const [screen, setScreen] = useState("boot");
  const [profile, setProfile] = useState(null);

  // ריבוי משתמשים
  const [users, setUsers] = useState([]);
  const [confirmDel, setConfirmDel] = useState(null);
  const [sceneOv, setSceneOv] = useState(null); // אינדקס הצעד שהאנימציה שלו פתוחה על כל המסך
  const [showText, setShowText] = useState(false);

  // השתקה + הקראה + אזור הורים
  const [muted, setMutedState] = useState(false);
  const [speechOn, setSpeechOn] = useState(true);

  // הגדרות קול ענן (אזור הורים)
  const [ttsProvider, setTtsProvider] = useState("google");
  const [ttsKey, setTtsKey] = useState("");
  const [ttsRegion, setTtsRegion] = useState("");
  const [ttsStatus, setTtsStatus] = useState("");
  const [ttsVoice, setTtsVoice] = useState(null);
  const [serverTts, setServerTts] = useState(null);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [delPin, setDelPin] = useState("");
  const [delPinErr, setDelPinErr] = useState(false);
  const [kidSel, setKidSel] = useState(0);

  // הקמה
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(null);
  const [picked, setPicked] = useState([]);

  // מקצוע ונושא נוכחיים
  const [subject, setSubject] = useState("en");
  const [topic, setTopic] = useState(null);
  const [pendingTopic, setPendingTopic] = useState(null); // הנושא שנבחר לפני אבחון

  // אבחון
  const [diag, setDiag] = useState(null);

  // תרגול
  const [lesson, setLesson] = useState(null);
  const [loadMsg, setLoadMsg] = useState(0);

  // שיעור מודרך (הסבר + שאלות בדיקה)
  const [course, setCourse] = useState(null);

  // אפקטים
  const [burst, setBurst] = useState(0);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ---------- מדידת זמן למידה אקטיבי ----------
  // נספר רק זמן בין אינטראקציות אמיתיות (מענה/המשך); פער ארוך = הילד לא שם — לא נספר
  const activeSecs = useRef(0);
  const lastActive = useRef(null);

  function markActiveStart() {
    lastActive.current = Date.now();
  }
  function trackActive() {
    const now = Date.now();
    if (lastActive.current) {
      const delta = now - lastActive.current;
      if (delta > 0 && delta <= 90000) activeSecs.current += delta / 1000;
    }
    lastActive.current = now;
  }
  function collectSecs() {
    const s = Math.round(activeSecs.current);
    activeSecs.current = 0;
    lastActive.current = null;
    return s;
  }
  // שמירת זמן שנצבר כשעוזבים באמצע (חזרה הביתה)
  function flushActivity() {
    const secs = collectSecs();
    if (!secs) return;
    setProfile((prev) => {
      if (!prev) return prev;
      const p = { ...prev, activity: mergeActivity(prev.activity, secs) };
      saveUser(p);
      return p;
    });
  }

  // גופן
  useEffect(() => {
    try {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800&display=swap";
      document.head.appendChild(l);
    } catch {}
  }, []);

  // טעינת משתמשים שמורים
  useEffect(() => {
    (async () => {
      const us = await loadUsers();
      setUsers(us);
      const m = await storGet("lomi:muted");
      if (m === "1") {
        MUTED = true;
        setMutedState(true);
      }
      const sp = await storGet("lomi:speech");
      if (sp === "0") {
        SPEECH_ON = false;
        setSpeechOn(false);
      }
      const tts = await storGet("lomi:tts");
      if (tts) {
        try {
          const cfg = JSON.parse(tts);
          if (cfg && cfg.key) {
            TTS_CFG = cfg;
            setTtsProvider(cfg.provider || "google");
            setTtsKey(cfg.key);
            setTtsRegion(cfg.region || "");
          }
        } catch {}
      }
      const vc = await storGet("lomi:voice");
      if (vc) {
        TTS_VOICE = vc;
        setTtsVoice(vc);
      }
      serverTtsReady.then(() => setServerTts({ ...SERVER_TTS }));
      const cur = await storGet(CURRENT_KEY);
      const p = us.find((u) => u.id === cur);
      if (p) {
        setProfile(p);
        setScreen("home");
      } else if (us.length) {
        setScreen("users");
      } else {
        setScreen("welcome");
      }
    })();
  }, []);

  // הודעות טעינה מתחלפות
  useEffect(() => {
    if (screen !== "gen") return;
    const iv = setInterval(() => setLoadMsg((m) => (m + 1) % LOADING_MSGS.length), 1600);
    return () => clearInterval(iv);
  }, [screen]);

  // ---------- הרשמה (בלי אבחון — האבחון קורה בכניסה הראשונה לכל מקצוע) ----------

  async function finishSignup() {
    sfx.click();
    const seed = GRADE_SEED[grade] || 3;
    const levels = {}, perfect = {}, seen = {};
    for (const s of SUBJECT_IDS) {
      levels[s] = seed;
      perfect[s] = 0;
      seen[s] = [];
    }
    const p = {
      id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      grade,
      interests: picked,
      levels,
      stars: 0,
      streak: 0,
      lastDay: null,
      sessionsToday: 0,
      perfect,
      totalSessions: 0,
      days: 0,
      history: [],
      seen,
      lessonsDone: [],
      diagDone: {},
    };
    setProfile(p);
    await saveUser(p);
    await storSet(CURRENT_KEY, p.id);
    sfx.fanfare();
    setScreen("home");
  }

  // ---------- אבחון אדפטיבי לכל מקצוע (בבחירת נושא ראשונה) ----------

  function startDiag(subj) {
    markActiveStart();
    setDiag({
      subj,
      level: profile.levels[subj] || GRADE_SEED[profile.grade] || 3,
      i: 0,
      used: new Set(),
      levels: [],
      q: null,
      phase: "idle",
      selected: null,
      fb: "",
    });
    setScreen("diag");
  }

  useEffect(() => {
    if (screen !== "diag" || !diag || diag.q) return;
    const pick = pickDiagQuestion(diag.subj, diag.level, diag.used, profile);
    setDiag((d) => ({ ...d, q: pick.q, qkey: pick.key }));
  }, [screen, diag]);

  // דילוג על האבחון — מתחילים לפי הכיתה
  async function skipDiag() {
    sfx.click();
    const p = { ...profile, diagDone: { ...(profile.diagDone || {}), [subject]: true } };
    setProfile(p);
    await saveUser(p);
    const t = pendingTopic;
    setPendingTopic(null);
    if (!t) return setScreen("home");
    setTopic(t);
    const lessons = lessonsFor(subject, t.id, p.levels[subject]);
    if (t.id !== "mix" && lessons.length) setScreen("topicmenu");
    else startLesson(t, subject);
  }

  function diagAnswer(i) {
    if (!diag || diag.phase !== "idle") return;
    trackActive();
    const ok = i === diag.q.c;
    if (ok) sfx.correct(); else sfx.wrong();
    if (ok) setBurst((b) => b + 1);
    if (hasEnglish(diag.q.options[diag.q.c])) speak(diag.q.options[diag.q.c]);
    setDiag((d) => ({
      ...d,
      phase: ok ? "right" : "wrong",
      selected: i,
      fb: ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : GENTLE[Math.floor(Math.random() * GENTLE.length)],
    }));
    later(() => {
      setDiag((d) => {
        if (!d) return d; // המשתמש חזר הביתה באמצע
        const used = new Set(d.used);
        used.add(d.qkey);
        const levels = [...d.levels, ok ? d.level : d.level - 0.5];
        const nextLevel = Math.max(1, Math.min(6, d.level + (ok ? 1 : -1)));
        const i2 = d.i + 1;
        if (i2 >= 5) {
          const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
          const final = Math.max(1, Math.min(6, Math.round(avg)));
          // מסמנים סיום — האפקט למטה יסגור את האבחון מחוץ לעדכון ה-state
          return { ...d, done: true, finalLevel: final };
        }
        return { ...d, level: nextLevel, i: i2, used, levels, q: null, phase: "idle", selected: null, fb: "" };
      });
    }, 1300);
  }

  // סגירת האבחון רצה מחוץ לעדכון ה-state (פעם אחת, אחרי הרינדור)
  useEffect(() => {
    if (screen === "diag" && diag && diag.done) {
      finishDiag(diag.finalLevel);
    }
  }, [screen, diag]);

  // קריינות אוטומטית של כרטיסי הסבר בשיעור: כותרת + גוף, ואז המשפט לדוגמה
  useEffect(() => {
    if (screen !== "course" || !course) return;
    const step = course.lsn.steps[course.i];
    setShowText(false);
    if (step.t === "teach") {
      speakHe(step.title + ". " + step.body);
      if (step.en) speakAny(step.en, { queue: true });
      setSceneOv(step.scene ? course.i : null);
    } else {
      setSceneOv(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, course ? course.i : -1]);

  function finishDiag(level) {
    const subj = diag ? diag.subj : subject;
    const secs = collectSecs();
    setProfile((prev) => {
      const p = {
        ...prev,
        levels: { ...prev.levels, [subj]: level },
        diagDone: { ...(prev.diagDone || {}), [subj]: true },
        activity: mergeActivity(prev.activity, secs),
      };
      saveUser(p);
      return p;
    });
    sfx.fanfare();
    setScreen("diag-result");
  }

  // ---------- שיעור ----------

  async function startLesson(topicObj, subj = subject) {
    sfx.click();
    markActiveStart();
    setSubject(subj);
    setTopic(topicObj);
    if (subj === "math") {
      // חשבון נוצר מקומית — מיידי, עובד גם בלי רשת
      const qs = mathLesson(
        profile.levels.math,
        topicObj.id,
        profile,
        (profile.seen && profile.seen.math) || []
      );
      recordSeen("math", qs);
      setLesson({ qs, i: 0, phase: "idle", selected: null, fb: "", correct: 0 });
      setScreen("lesson");
      return;
    }
    // הבנת הנקרא ומדעים — מהמאגר המקומי, מיידי
    if (subj === "heb" || subj === "sci") {
      const qs = fallbackLesson(
        SUBJECT_BANKS[subj],
        profile.levels[subj],
        topicObj.id,
        (profile.seen && profile.seen[subj]) || []
      );
      recordSeen(subj, qs);
      setLesson({ qs, i: 0, phase: "idle", selected: null, fb: "", correct: 0 });
      setScreen("lesson");
      return;
    }
    const seenEn = (profile.seen && profile.seen.en) || [];
    // אוצר מילים: מחולל מקומי עם 20 מילים לרמה — מיידי ותמיד טרי
    if (topicObj.id === "vocab") {
      const qs = vocabLesson(profile.levels.en, seenEn);
      recordSeen("en", qs);
      setLesson({ qs, i: 0, phase: "idle", selected: null, fb: "", correct: 0 });
      setScreen("lesson");
      return;
    }
    setScreen("gen");
    let qs;
    try {
      qs = await generateLessonAI(profile, topicObj);
    } catch (e) {
      console.warn("AI fallback:", e);
      qs =
        topicObj.id === "mix"
          ? shuffle([
              ...vocabLesson(profile.levels.en, seenEn).slice(0, 2),
              ...fallbackLesson(BANK, profile.levels.en, "mix", seenEn).slice(0, 3),
            ])
          : fallbackLesson(BANK, profile.levels.en, topicObj.id, seenEn);
    }
    recordSeen("en", qs);
    setLesson({ qs, i: 0, phase: "idle", selected: null, fb: "", correct: 0 });
    setScreen("lesson");
  }

  function lessonAnswer(i) {
    if (!lesson || lesson.phase !== "idle") return;
    trackActive();
    const q = lesson.qs[lesson.i];
    const ok = i === q.c;
    if (ok) sfx.correct(); else sfx.wrong();
    const saidEn = hasEnglish(q.options[q.c]);
    if (saidEn) speak(q.options[q.c]);
    if (q.ex) speakHe(q.ex, { queue: saidEn }); // מקריאים את ההסבר
    if (ok) {
      setBurst((b) => b + 1);
      setLesson((l) => ({
        ...l,
        phase: "right",
        selected: i,
        fb: PRAISE[Math.floor(Math.random() * PRAISE.length)],
        correct: l.correct + 1,
        combo: (l.combo || 0) + 1,
      }));
    } else {
      setLesson((l) => ({
        ...l,
        phase: "wrong",
        selected: i,
        fb: GENTLE[Math.floor(Math.random() * GENTLE.length)],
        combo: 0,
      }));
    }
  }

  function nextStep() {
    // לא בתוך עדכון state — כדי שסיום השיעור (כולל צבירת הזמן) ירוץ בדיוק פעם אחת
    const l = lesson;
    if (!l) return;
    if (l.i + 1 >= l.qs.length) {
      finishLesson(l.correct);
      return;
    }
    setLesson({ ...l, i: l.i + 1, phase: "idle", selected: null, fb: "" });
  }

  function finishLesson(correct) {
    const today = todayStr();
    const secs = collectSecs();
    setProfile((prev) => {
      const p = { ...prev, levels: { ...prev.levels }, perfect: { ...prev.perfect } };
      const earned = correct + (correct === 5 ? 2 : 0);
      p.stars += earned;
      p.totalSessions += 1;
      if (p.lastDay === today) {
        p.sessionsToday += 1;
      } else {
        p.streak = p.lastDay === yesterdayStr() ? p.streak + 1 : 1;
        p.lastDay = today;
        p.sessionsToday = 1;
        p.days = (p.days || 0) + 1; // יום למידה חדש
      }
      // יומן פרקים — הבסיס לדוח ההורים ולהמלצות
      p.history = [
        ...(p.history || []),
        { at: Date.now(), subject, topic: topic ? topic.id : "mix", correct, total: 5, level: p.levels[subject] },
      ].slice(-100);
      if (correct === 5) {
        p.perfect[subject] += 1;
        if (p.perfect[subject] >= 2 && p.levels[subject] < 6) {
          p.levels[subject] += 1;
          p.perfect[subject] = 0;
          p.leveledUp = true;
        }
      } else {
        p.perfect[subject] = 0;
        if (correct <= 1 && p.levels[subject] > 1) p.levels[subject] -= 1; // התאמה שקטה של הקצב
      }
      p.activity = mergeActivity(prev.activity, secs);
      p.lastEarned = earned;
      p.lastCorrect = correct;
      saveUser(p);
      return p;
    });
    setBurst((b) => b + 1);
    sfx.fanfare();
    setScreen("done");
  }

  // ---------- ניהול משתמשים ----------

  async function saveUser(p) {
    const next = users.some((u) => u.id === p.id)
      ? users.map((u) => (u.id === p.id ? p : u))
      : [...users, p];
    setUsers(next);
    await persistUsers(next);
  }

  function selectUser(u) {
    sfx.click();
    setProfile(u);
    storSet(CURRENT_KEY, u.id);
    setScreen("home");
  }

  function newUser() {
    sfx.click();
    setName("");
    setGrade(null);
    setPicked([]);
    setScreen("welcome");
  }

  function deleteUser(u) {
    sfx.pop();
    setConfirmDel(null);
    const next = users.filter((x) => x.id !== u.id);
    setUsers(next);
    persistUsers(next);
    if (profile && profile.id === u.id) {
      setProfile(null);
      storDel(CURRENT_KEY);
    }
    if (!next.length) {
      setName("");
      setGrade(null);
      setPicked([]);
      setScreen("welcome");
    }
  }

  function goHome() {
    sfx.click();
    stopAllSpeech();
    flushActivity();
    setLesson(null);
    setCourse(null);
    setDiag(null);
    setPendingTopic(null);
    setScreen("home");
  }

  // ---------- שיעורים מודרכים ----------

  // כניסה לנושא: קודם אבחון קצר (בפעם הראשונה במקצוע), אחר כך שיעורים/תרגול
  function openTopic(t, subj = subject) {
    if (!(profile.diagDone || {})[subj]) {
      sfx.click();
      setSubject(subj);
      setPendingTopic(t);
      setScreen("diag-intro");
      return;
    }
    const lessons = lessonsFor(subj, t.id, profile.levels[subj]);
    if (t.id !== "mix" && lessons.length) {
      sfx.click();
      setSubject(subj);
      setTopic(t);
      setScreen("topicmenu");
    } else {
      startLesson(t, subj);
    }
  }

  function startCourse(lsn) {
    sfx.click();
    markActiveStart();
    setCourse({ lsn, i: 0, phase: "idle", selected: null, fb: "", correct: 0 });
    setScreen("course");
  }

  function courseAnswer(i) {
    if (!course || course.phase !== "idle") return;
    trackActive();
    const step = course.lsn.steps[course.i];
    const ok = i === step.c;
    if (ok) sfx.correct(); else sfx.wrong();
    const saidEn = hasEnglish(step.options[step.c]);
    if (saidEn) speak(step.options[step.c]);
    if (step.ex) speakHe(step.ex, { queue: saidEn });
    if (ok) setBurst((b) => b + 1);
    setCourse((c) => ({
      ...c,
      phase: ok ? "right" : "wrong",
      selected: i,
      fb: ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : GENTLE[Math.floor(Math.random() * GENTLE.length)],
      correct: c.correct + (ok ? 1 : 0),
      combo: ok ? (c.combo || 0) + 1 : 0,
    }));
  }

  function courseNext() {
    const c = course;
    if (!c) return;
    if (c.i + 1 >= c.lsn.steps.length) {
      finishCourse(c);
      return;
    }
    setCourse({ ...c, i: c.i + 1, phase: "idle", selected: null, fb: "" });
  }

  function finishCourse(c) {
    const qTotal = c.lsn.steps.filter((s) => s.t === "q").length;
    const today = todayStr();
    const secs = collectSecs();
    setProfile((prev) => {
      const p = { ...prev, levels: { ...prev.levels }, perfect: { ...prev.perfect } };
      const earned = c.correct + 3; // בונוס על השלמת שיעור
      p.stars += earned;
      p.totalSessions += 1;
      if (p.lastDay === today) {
        p.sessionsToday += 1;
      } else {
        p.streak = p.lastDay === yesterdayStr() ? p.streak + 1 : 1;
        p.lastDay = today;
        p.sessionsToday = 1;
        p.days = (p.days || 0) + 1;
      }
      p.lessonsDone = [...new Set([...(p.lessonsDone || []), c.lsn.id])];
      p.history = [
        ...(p.history || []),
        { at: Date.now(), subject, topic: topic ? topic.id : "mix", correct: c.correct, total: qTotal, level: p.levels[subject], lesson: c.lsn.id },
      ].slice(-100);
      p.activity = mergeActivity(prev.activity, secs);
      p.lastEarned = earned;
      p.lastCorrect = c.correct;
      p.lastTotal = qTotal;
      p.lastLesson = c.lsn.title;
      saveUser(p);
      return p;
    });
    setCourse(null);
    setBurst((b) => b + 1);
    sfx.fanfare();
    setScreen("course-done");
  }

  // כוונון רמה ידני — למקצוע אחד או לכולם (מהדף הראשי)
  async function adjustLevels(delta, subj = null) {
    sfx.click();
    const levels = { ...profile.levels };
    const keys = subj ? [subj] : SUBJECT_IDS;
    for (const k of keys) levels[k] = Math.max(1, Math.min(6, levels[k] + delta));
    const p = { ...profile, levels };
    setProfile(p);
    await saveUser(p);
  }

  // ---------- השתקה ----------

  function toggleMute() {
    const next = !muted;
    MUTED = next;
    setMutedState(next);
    storSet("lomi:muted", next ? "1" : "0");
    if (next) {
      stopAllSpeech();
    } else {
      sfx.click(); // צליל אישור רק כשמחזירים את הקול
    }
  }

  // מתג הקראה נפרד — משתיק רק את הקריינות (עברית ואנגלית), הצלילים נשארים
  function toggleSpeech() {
    const next = !speechOn;
    SPEECH_ON = next;
    setSpeechOn(next);
    storSet("lomi:speech", next ? "1" : "0");
    sfx.click();
    if (next) speakHe("ההקראה פועלת");
    else stopAllSpeech();
  }

  // ---------- אזור הורים ----------

  function openParents() {
    sfx.click();
    setPin("");
    setPinErr(false);
    setScreen("pin");
  }

  function exitParents() {
    sfx.click();
    setScreen(profile ? "home" : "users");
  }

  // בחירת הקול של ביפ + השמעת דוגמה (גם כשההקראה מושתקת — ההורה ביקש לשמוע)
  async function pickVoice(id) {
    sfx.click();
    TTS_VOICE = id;
    setTtsVoice(id);
    await storSet("lomi:voice", id);
    stopAllSpeech();
    setTtsStatus("");
    try {
      const url = await fetchTTS("היי! אני בִּיפּ, הרובוט שלומד איתכם. ככה אני נשמע — נעים להכיר!", "he", id);
      stopAllSpeech();
      curAudio = new Audio(url);
      curAudio.play().catch(() => {});
    } catch (e) {
      setTtsStatus("❌ לא הצלחתי להשמיע את הקול (" + (e && e.message ? e.message : "שגיאה") + ")");
    }
  }

  // שמירת מפתח קול פרטי למכשיר + בדיקת השמעה מיידית
  async function saveTts() {
    sfx.click();
    const cfg = { provider: ttsProvider, key: ttsKey.trim(), region: ttsRegion.trim() };
    await storSet("lomi:tts", JSON.stringify(cfg));
    ttsCache.clear();
    stopAllSpeech();
    if (!cfg.key) {
      TTS_CFG = null;
      setTtsStatus(
        SERVER_TTS && SERVER_TTS.enabled
          ? "המפתח הפרטי הוסר — בִּיפּ חוזר לקול הטבעי של השרת."
          : "אין מפתח — האפליקציה משתמשת בקול המובנה של הדפדפן."
      );
      return;
    }
    TTS_CFG = cfg;
    setTtsStatus("בודק חיבור... ⏳");
    try {
      const url = await fetchTTS("שלום! ככה אני נשמע מעכשיו. בואו נלמד יחד!", "he");
      const a = new Audio(url);
      a.play().catch(() => {});
      setTtsStatus("✅ מחובר! ההקראה בעברית ובאנגלית תשתמש מעכשיו בקול הטבעי.");
    } catch (e) {
      TTS_CFG = null;
      setTtsStatus(
        "❌ החיבור נכשל (" + (e && e.message ? e.message : "שגיאה") + "). בדקו את המפתח" +
          (ttsProvider === "azure" ? " ואת ה-Region." : ".")
      );
    }
  }

  // הקשת ספרה בקוד ההורים — משותף לכניסה לאזור ההורים ולמחיקת לומד
  function typePin(cur, setCur, setErr, d, onOk) {
    sfx.click();
    setErr(false);
    const next = (cur + d).slice(0, 4);
    setCur(next);
    if (next.length < 4) return;
    if (next === PARENT_CODE) {
      onOk();
    } else {
      sfx.wrong();
      setErr(true);
      later(() => {
        setCur("");
        setErr(false);
      }, 650);
    }
  }

  function pressPin(d) {
    typePin(pin, setPin, setPinErr, d, () => {
      sfx.correct();
      setKidSel(0);
      setScreen("parents");
    });
  }

  // מחיקת לומד מחייבת קוד הורים
  function askDelete(u) {
    sfx.pop();
    setDelPin("");
    setDelPinErr(false);
    setConfirmDel(u);
  }

  function pressDelPin(d) {
    typePin(delPin, setDelPin, setDelPinErr, d, () => deleteUser(confirmDel));
  }

  // רישום שאלות שהוצגו — כדי שתרגול נוסף לא יחזור על אותן שאלות
  function recordSeen(subj, qs) {
    const keys = qs.map(qKey);
    setProfile((prev) => {
      const prevSeen = (prev.seen && prev.seen[subj]) || [];
      const merged = [...prevSeen.filter((k) => !keys.includes(k)), ...keys].slice(-60);
      const p = { ...prev, seen: { ...(prev.seen || {}), [subj]: merged } };
      saveUser(p);
      return p;
    });
  }

  // ---------- הפסקת תנועה ----------

  const [breakLeft, setBreakLeft] = useState(30);
  useEffect(() => {
    if (screen !== "break") return;
    setBreakLeft(30);
    const iv = setInterval(() => {
      setBreakLeft((s) => {
        if (s <= 1) {
          clearInterval(iv);
          sfx.pop();
          setScreen("home");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [screen]);

  // ---------- תצוגה ----------

  const css = (
    <style>{`
      .lomi, .lomi * { box-sizing: border-box; margin: 0; font-family: 'Rubik','Segoe UI','Arial Hebrew',sans-serif; }
      .lomi {
        --sky:#EEF6FC; --ink:#20305A; --sub:#6B7A9C; --card:#FFFFFF;
        --purple:#6D5AE6; --purple-d:#5546C8; --leaf:#2FB57C; --leaf-d:#218B5E;
        --sun:#FFC43D; --coral:#FF7B6E; --coral-d:#E05B4E; --line:#D9E6F2;
        min-height:100vh; min-height:100dvh; background:var(--sky); color:var(--ink);
        display:flex; justify-content:center; padding:20px 14px 40px;
      }
      .frame { width:100%; max-width:520px; position:relative; }
      .card { background:var(--card); border-radius:24px; padding:26px 22px;
        box-shadow:0 8px 24px rgba(32,48,90,.08); position:relative; overflow:hidden; }
      h1 { font-size:30px; font-weight:800; line-height:1.2; }
      h2 { font-size:23px; font-weight:800; }
      .sub { color:var(--sub); font-size:16px; margin-top:8px; line-height:1.5; }
      .mascot { font-size:64px; line-height:1; }
      .mascot.bounce { display:inline-block; animation:hop 1s ease-in-out infinite; }
      @keyframes hop { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

      .btn { display:block; width:100%; border:none; cursor:pointer; border-radius:18px;
        background:var(--purple); color:#fff; font-size:20px; font-weight:700; padding:16px;
        box-shadow:0 5px 0 var(--purple-d); transition:transform .08s; margin-top:18px; }
      .btn:active { transform:translateY(4px); box-shadow:0 1px 0 var(--purple-d); }
      .btn:disabled { opacity:.4; box-shadow:none; cursor:default; }
      .btn.green { background:var(--leaf); box-shadow:0 5px 0 var(--leaf-d); }
      .btn.ghost { background:transparent; color:var(--sub); box-shadow:none; font-weight:500; font-size:15px; padding:10px; }

      .input { width:100%; margin-top:18px; padding:15px 16px; font-size:19px; border-radius:16px;
        border:2px solid var(--line); background:#FAFCFF; color:var(--ink); outline:none; text-align:center; }
      .input:focus { border-color:var(--purple); }
      .input.tts { margin-top:8px; font-size:16px; padding:10px 12px; direction:ltr; text-align:left; }

      .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:18px; }
      .chipgrid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-top:18px; }
      .chip { border:2px solid var(--line); background:#FAFCFF; border-radius:16px; padding:14px 10px;
        font-size:17px; font-weight:500; color:var(--ink); cursor:pointer; transition:all .12s; }
      .chip.on { border-color:var(--purple); background:#F1EEFF; font-weight:700; }

      /* בחירת מקצוע */
      .subjects { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }
      .subjbtn { border:2px solid var(--line); background:#FAFCFF; border-radius:20px;
        padding:18px 10px 14px; font-size:19px; font-weight:800; color:var(--ink); cursor:pointer;
        box-shadow:0 4px 0 var(--line); transition:all .12s; }
      .subjbtn:hover { border-color:var(--purple); background:#F1EEFF; transform:translateY(-2px); }
      .subjbtn:active { transform:translateY(2px); box-shadow:none; }
      .semoji { display:block; font-size:38px; margin-bottom:6px; animation:floaty 3s ease-in-out infinite; }
      .subjlvl { display:block; font-size:12px; color:var(--sub); font-weight:600; margin-top:4px; }
      .qen.heb { direction:rtl; font-size:19px; font-weight:600; line-height:1.7; text-align:right; }

      /* בחירת נושא לפני שיעור */
      .topicgrid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-top:18px; }
      .topicchip { position:relative; border:2px solid var(--line); background:#FAFCFF; border-radius:20px;
        padding:16px 8px 12px; font-size:17px; font-weight:700; color:var(--ink); cursor:pointer;
        box-shadow:0 4px 0 var(--line); transition:all .12s; animation:chipin .45s both; }
      .topicchip.recommended { border-color:var(--sun); background:#FFF9E8; }
      .pointbadge { position:absolute; top:-11px; inset-inline-end:-4px; background:var(--sun); color:#6B4E00;
        font-size:12px; font-weight:800; padding:4px 9px; border-radius:999px; white-space:nowrap;
        box-shadow:0 2px 6px rgba(32,48,90,.2); animation:pointbounce 1.1s ease-in-out infinite; z-index:2; }
      @keyframes pointbounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-6px)} }
      .tprog { display:block; margin-top:8px; }
      .tbar { display:block; height:6px; background:#E4EDF7; border-radius:3px; overflow:hidden; }
      .tfill { display:block; height:100%; border-radius:3px; background:var(--leaf); }
      .tfill.mid { background:var(--sun); }
      .tfill.low { background:var(--coral); }
      .tpct { display:block; font-size:11.5px; color:var(--sub); font-weight:600; margin-top:4px; }
      .tnew { display:inline-block; font-size:12px; color:var(--purple-d); font-weight:700;
        background:#F1EEFF; border-radius:999px; padding:2px 10px; }

      /* רשימת שיעורים בנושא */
      .lessonlist { display:grid; grid-template-columns:1fr; gap:10px; margin-top:16px; }
      .lessonbtn { display:flex; align-items:center; gap:10px; text-align:right; border:2px solid var(--line);
        background:#FAFCFF; border-radius:16px; padding:12px 14px; font-size:16px; font-weight:700;
        color:var(--ink); cursor:pointer; box-shadow:0 3px 0 var(--line); transition:all .12s;
        animation:chipin .4s both; }
      .lessonbtn:hover { border-color:var(--purple); background:#F1EEFF; }
      .lessonbtn:active { transform:translateY(2px); box-shadow:none; }
      .lessonbtn.completed { border-color:#9FE3C3; background:#F3FCF7; }
      .lemoji { font-size:26px; }
      .ltitle { flex:1; }
      .lstate { font-size:12px; font-weight:700; color:var(--purple-d); background:#F1EEFF;
        border-radius:999px; padding:3px 9px; white-space:nowrap; }
      .lstate.ok { color:var(--leaf-d); background:#EAFBF2; }

      /* כרטיס הסבר בשיעור */
      .teachbody { margin-top:10px; font-size:17px; line-height:1.7; color:var(--ink); text-align:center; }
      .artrow { display:flex; justify-content:center; align-items:center; gap:16px; margin-bottom:6px; }
      .artmoji { font-size:46px; display:inline-block; animation:artin .55s both; }
      @keyframes artin { 0%{opacity:0; transform:scale(.2) rotate(-25deg)} 70%{transform:scale(1.15) rotate(5deg)} 100%{opacity:1; transform:none} }
      .lomisays { display:flex; gap:10px; align-items:flex-start; margin-top:14px; }
      .showtext { border:none; background:none; color:var(--purple-d); font:inherit; font-weight:700; cursor:pointer; padding:2px 0; text-decoration:underline; }
      .lomiface { font-size:34px; flex-shrink:0; animation:hop 2.2s ease-in-out infinite; }
      .lomibubble { background:#F1EEFF; border-radius:18px 4px 18px 18px; padding:12px 14px;
        font-size:16.5px; line-height:1.7; color:var(--ink); animation:cardin .4s ease both; }
      .combo { margin-top:6px; text-align:center; font-size:16px; font-weight:800; color:#E8590C;
        animation:pop .45s ease; }
      .qpic { cursor:pointer; }
      .qpic.poke { animation:happyjump .55s ease; }

      /* רובוט SVG מודרני + סמלים מרחפים */
      .bothero { position:relative; width:212px; margin:0 auto; padding:4px 0; }
      .floaties { position:absolute; inset:0; pointer-events:none; }
      .floatie { position:absolute; width:38px; height:38px; border-radius:50%; background:#fff;
        border:2px solid var(--line); display:flex; align-items:center; justify-content:center;
        font-size:18px; font-weight:800; color:var(--purple-d);
        box-shadow:0 3px 10px rgba(32,48,90,.12);
        animation:floatiein .5s both, floaty 3s ease-in-out .55s infinite; }
      @keyframes floatiein { 0%{opacity:0; transform:scale(.2) rotate(-30deg)} 70%{transform:scale(1.18) rotate(6deg)} 100%{opacity:1; transform:none} }
      .floatie.f0 { top:-2px; right:8px; }
      .floatie.f1 { top:36px; left:0; }
      .floatie.f2 { bottom:0; right:0; }
      .botface { display:block; margin:0 auto; animation:floaty 3.2s ease-in-out infinite; }
      .bot-eyes { animation:blink 4.2s infinite; transform-box:fill-box; transform-origin:center; }
      @keyframes blink { 0%,91%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.08)} }
      .bot-ant { animation:antpulse 1.7s ease-in-out infinite; }
      @keyframes antpulse { 0%,100%{opacity:1} 50%{opacity:.35} }

      /* מד התקדמות למקצוע + בורר רמה */
      .subjbar { display:block; height:6px; background:#E4EDF7; border-radius:3px; margin-top:7px; overflow:hidden; }
      .subjfill { display:block; height:100%; background:linear-gradient(90deg, var(--leaf), #6FD9A6); border-radius:3px; transition:width .3s; }
      .lvladjust { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:14px; flex-wrap:wrap; }
      .lvlbtn { border:2px solid var(--line); background:#FAFCFF; border-radius:999px; padding:7px 12px;
        font-size:13.5px; font-weight:700; color:var(--ink); cursor:pointer; box-shadow:0 2px 0 var(--line); transition:all .12s; }
      .lvlbtn:hover { border-color:var(--purple); background:#F1EEFF; }
      .lvlbtn:active { transform:translateY(2px); box-shadow:none; }
      .lvlbtn:disabled { opacity:.35; cursor:default; }
      .lvllabel { font-size:14px; font-weight:800; color:var(--sub); }
      .lvllabel.big { display:flex; flex-direction:column; align-items:center; line-height:1.2;
        font-size:11.5px; color:var(--sub); min-width:96px; }
      .lvllabel.big b { font-size:15px; color:var(--purple-d); margin-top:2px; }
      .adjhint { margin-top:14px; font-size:13px; }

      /* שורת ימי השבוע — דקות למידה אקטיבית */
      .weekrow { display:flex; gap:6px; justify-content:center; margin-top:14px; }
      .daycell { width:42px; background:#FAFCFF; border:2px solid var(--line); border-radius:12px; padding:6px 2px; }
      .dlet { display:block; font-size:12px; font-weight:700; color:var(--sub); }
      .dmin { display:block; font-size:15px; font-weight:800; color:var(--leaf-d); min-height:20px; }
      .daycell.today { border-color:var(--purple); background:#F1EEFF; }
      .daycell.future { opacity:.4; }
      .weeklegend { font-size:12px; color:var(--sub); margin-top:6px; }

      /* מסלול צעדים צפוף לשיעורים ארוכים */
      .path.small .stone { width:26px; height:26px; font-size:12px; }
      .path.small .fox { font-size:13px; }
      .path.small .path-line { width:13px; }
      .topicchip:hover { border-color:var(--purple); background:#F1EEFF; transform:translateY(-2px) rotate(-1deg); }
      .topicchip:hover .temoji { animation:wiggle .5s; }
      .topicchip:active { transform:translateY(2px); box-shadow:none; }
      .temoji { display:block; font-size:36px; margin-bottom:6px; }
      @keyframes chipin { from{opacity:0; transform:translateY(14px) scale(.85)} to{opacity:1; transform:none} }

      /* כפתור בית בפינת כל מסך */
      .corner { position:absolute; top:10px; left:10px; width:38px; height:38px; border-radius:50%;
        border:2px solid var(--line); background:#FAFCFF; font-size:17px; cursor:pointer; z-index:6;
        display:flex; align-items:center; justify-content:center; padding:0;
        box-shadow:0 2px 0 var(--line); transition:all .12s; }
      .corner:hover { border-color:var(--purple); background:#F1EEFF; }
      .corner:active { transform:translateY(2px); box-shadow:none; }

      /* בחירת משתמש */
      .usergrid { display:grid; grid-template-columns:1fr; gap:10px; margin-top:18px; }
      .userrow { display:flex; align-items:center; gap:8px; }
      .userbtn { flex:1; display:flex; align-items:center; gap:12px; border:2px solid var(--line);
        background:#FAFCFF; border-radius:18px; padding:12px 16px; cursor:pointer; font-size:18px;
        font-weight:700; color:var(--ink); box-shadow:0 3px 0 var(--line); transition:all .12s;
        animation:chipin .4s both; }
      .userbtn:hover { border-color:var(--purple); background:#F1EEFF; }
      .userbtn:active { transform:translateY(2px); box-shadow:none; }
      .uemoji { font-size:28px; }
      .usub { margin-inline-start:auto; color:var(--sub); font-size:14px; font-weight:600; }
      .udel { width:34px; height:34px; border-radius:50%; border:2px solid var(--line); background:#fff;
        color:var(--sub); font-size:15px; font-weight:700; cursor:pointer; flex-shrink:0; transition:all .12s; }
      .udel:hover { border-color:var(--coral-d); color:#fff; background:var(--coral); }

      /* דיאלוג אישור מחיקה */
      .overlay { position:fixed; inset:0; background:rgba(32,48,90,.45); display:flex; align-items:center;
        justify-content:center; z-index:50; padding:20px; }
      .dialog { background:#fff; border-radius:22px; padding:24px 20px; max-width:340px; width:100%;
        text-align:center; animation:pop .3s ease; max-height:100%; overflow-y:auto; }
      .btn.danger { background:var(--coral); box-shadow:0 5px 0 var(--coral-d); }

      .corner.r { left:auto; right:10px; }
      .corner.c2 { left:54px; }
      .corner.r2 { left:auto; right:54px; }

      /* כפתור הקראת משפט מלא */
      .sayall { position:absolute; top:6px; inset-inline-end:6px; width:30px; height:30px;
        border-radius:50%; border:2px solid var(--line); background:#fff; font-size:13px;
        cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0;
        transition:all .12s; z-index:2; }
      .sayall:hover { border-color:var(--purple); background:#F1EEFF; }
      .sayall:active { transform:scale(.9); }

      /* המלצת השיעור הבא */
      .recbtn { display:block; width:100%; margin-top:14px; border-radius:16px; border:2px solid #F4DFA5;
        background:#FFF7E3; padding:12px 14px; font-size:16px; font-weight:600; color:var(--ink);
        cursor:pointer; text-align:center; box-shadow:0 3px 0 #F4DFA5; transition:all .12s; line-height:1.6; }
      .recbtn small { color:var(--sub); font-size:13px; }
      .recbtn:hover { border-color:var(--sun); transform:translateY(-1px); }
      .recbtn:active { transform:translateY(2px); box-shadow:none; }

      /* קוד הורים */
      .pindots { display:flex; gap:14px; justify-content:center; margin:18px 0 4px; }
      .pindot { width:16px; height:16px; border-radius:50%; border:2px solid var(--line); background:#FAFCFF; transition:all .12s; }
      .pindot.full { background:var(--purple); border-color:var(--purple); }
      .pindot.err { background:var(--coral); border-color:var(--coral-d); animation:shake .35s; }
      .pinpad { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:16px; }
      .pinkey { padding:13px; font-size:22px; font-weight:800; border-radius:16px; border:2px solid var(--line);
        background:#FAFCFF; cursor:pointer; box-shadow:0 3px 0 var(--line); color:var(--ink); transition:all .12s; }
      .pinkey:hover { border-color:var(--purple); }
      .pinkey:active { transform:translateY(2px); box-shadow:none; }

      /* דוח הורים */
      .kidtabs { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:12px; }
      .psec { margin-top:18px; }
      .psec h3 { font-size:16px; font-weight:800; margin-bottom:8px; color:var(--purple-d); }
      .chip.voice { padding:9px 12px; direction:ltr; }
      .ttsadv { margin-top:14px; }
      .ttsadv summary { cursor:pointer; font-size:14px; font-weight:700; color:var(--purple-d); }
      .pgrid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
      .pbox { background:#FAFCFF; border:2px solid var(--line); border-radius:14px; padding:10px 12px;
        font-size:13px; font-weight:600; text-align:center; color:var(--sub); }
      .pbox b { display:block; font-size:18px; color:var(--ink); margin-top:2px; }
      .prow { display:flex; align-items:center; justify-content:space-between; gap:8px; background:#FAFCFF;
        border:2px solid var(--line); border-radius:12px; padding:8px 12px; margin-bottom:6px;
        font-size:14px; font-weight:600; }
      .pct { font-weight:800; }
      .pct.good { color:var(--leaf-d); }
      .pct.mid { color:#B07D00; }
      .pct.low { color:var(--coral-d); }

      .path { display:flex; align-items:center; justify-content:center; margin:4px 0 14px; }
      .stone { width:38px; height:38px; border-radius:50%; background:#E4EDF7; color:#fff;
        display:flex; align-items:center; justify-content:center; font-weight:800; font-size:17px;
        position:relative; flex-shrink:0; }
      .stone.done { background:var(--leaf); }
      .stone.current { background:#fff; border:3px solid var(--purple); animation:pulse 1.4s infinite; }
      .fox { font-size:20px; }
      @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(109,90,230,.35)} 50%{box-shadow:0 0 0 8px rgba(109,90,230,0)} }
      .path-line { height:5px; width:26px; background:#E4EDF7; border-radius:3px; }
      .path-line.filled { background:var(--leaf); }

      .bubble { background:#F1EEFF; color:var(--purple-d); font-weight:700; font-size:16px;
        border-radius:14px; padding:10px 14px; text-align:center; margin-bottom:14px; }

      /* כרטיס שאלה חי */
      .qcard { animation:cardin .4s ease both; }
      @keyframes cardin { from{opacity:0; transform:translateY(16px)} to{opacity:1; transform:none} }
      .qpic { font-size:54px; text-align:center; line-height:1.2; margin-bottom:6px;
        animation:floaty 2.6s ease-in-out infinite; }
      .qpic.happy { animation:happyjump .7s ease; }
      @keyframes floaty { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-7px) rotate(4deg)} }
      @keyframes happyjump { 0%{transform:scale(1)} 35%{transform:translateY(-16px) scale(1.25) rotate(-10deg)}
        70%{transform:translateY(0) scale(.95)} 100%{transform:none} }
      .qtext { font-size:21px; font-weight:700; line-height:1.4; }
      .qen { direction:ltr; text-align:center; font-size:24px; font-weight:700; background:#FAFCFF;
        border:2px dashed var(--line); border-radius:16px; padding:14px; padding-inline-end:40px;
        margin-top:14px; color:var(--ink); position:relative; }
      .lomibubble { position:relative; padding-inline-end:40px; }

      /* מילים חיות */
      .word { display:inline-block; animation:wordin .45s both; }
      @keyframes wordin { from{opacity:0; transform:translateY(10px) scale(.7)} to{opacity:1; transform:none} }
      .word.speakable { cursor:pointer; border-bottom:2px dotted transparent; transition:color .12s; }
      .word.speakable:hover { color:var(--purple); border-bottom-color:var(--purple); }
      .word.wiggle { animation:wiggle .6s; color:var(--purple); }
      @keyframes wiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-10deg) scale(1.2)} 60%{transform:rotate(9deg) scale(1.15)} }

      /* קו השלמה אחיד — במקום כמה קווים */
      .blank { display:inline-block; min-width:60px; height:1em; vertical-align:middle; margin:0 6px;
        border-bottom:4px solid var(--purple); border-radius:3px;
        animation:blankpulse 1.5s ease-in-out infinite; }
      .blank.filled { min-width:0; height:auto; padding:0 4px; border-bottom-color:var(--leaf);
        color:var(--leaf-d); font-weight:800; animation:pop .45s ease; }
      @keyframes blankpulse { 0%,100%{opacity:1} 50%{opacity:.35} }

      .hint { margin-top:10px; font-size:13px; color:var(--sub); text-align:center; }

      .answers { display:grid; grid-template-columns:1fr; gap:10px; margin-top:16px; }
      .ans { border:2px solid var(--line); background:#fff; border-radius:16px; padding:14px 16px;
        font-size:19px; font-weight:600; color:var(--ink); cursor:pointer; text-align:center;
        box-shadow:0 3px 0 var(--line); transition:all .12s; animation:ansin .4s both; }
      @keyframes ansin { from{opacity:0; transform:translateX(18px) scale(.95)} to{opacity:1; transform:none} }
      .ans:not(:disabled):hover { border-color:var(--purple); transform:scale(1.02); }
      .ans:active { transform:translateY(2px); box-shadow:none; }
      .ans.right { background:var(--leaf); border-color:var(--leaf-d); color:#fff; box-shadow:0 3px 0 var(--leaf-d); animation:pop .4s ease; }
      .ans.wrong { background:var(--coral); border-color:var(--coral-d); color:#fff; box-shadow:0 3px 0 var(--coral-d); animation:shake .35s; }
      .ans.dim { opacity:.45; animation:none; }
      @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

      .fb { margin-top:14px; text-align:center; font-size:19px; font-weight:800; color:var(--leaf-d); }
      .fb.bad { color:var(--coral-d); }
      .explain { margin-top:10px; background:#FFF7E3; border:2px solid #F4DFA5; border-radius:14px;
        padding:12px 14px; font-size:16px; line-height:1.5; animation:explainin .5s ease both; }
      .explain.good { background:#EAFBF2; border-color:#9FE3C3; }
      @keyframes explainin { from{opacity:0; transform:translateY(14px) scale(.94)} to{opacity:1; transform:none} }
      .bulb { display:inline-block; animation:bulbwig .9s ease .25s; }
      @keyframes bulbwig { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-16deg) scale(1.25)} 60%{transform:rotate(12deg) scale(1.15)} }

      .stats { display:flex; gap:8px; justify-content:center; margin-top:16px; flex-wrap:wrap; }
      .stat { background:#FAFCFF; border:2px solid var(--line); border-radius:14px; padding:8px 14px;
        font-size:15px; font-weight:700; }

      .confetti { position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:5; }
      .confetti span { position:absolute; top:-24px; animation:fall linear forwards; }
      @keyframes fall { to { transform:translateY(420px) rotate(340deg); opacity:0; } }

      .bigstars { font-size:44px; letter-spacing:4px; margin-top:10px; animation:pop .5s ease; }
      @keyframes pop { 0%{transform:scale(.3)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }

      .timer { font-size:56px; font-weight:800; color:var(--purple); margin:14px 0; }
      .center { text-align:center; }
      .mt { margin-top:16px; }

      /* התאמה למסכי טלפון (אנדרואיד/אייפון) — הכול נכנס במסך בלי גלילה */
      @media (max-width: 520px), (max-height: 800px) {
        .lomi { padding:6px 8px 8px; }
        .card { padding:12px 12px 14px; border-radius:20px; }
        h1 { font-size:21px; }
        h2 { font-size:18px; }
        .sub { font-size:13.5px; margin-top:6px; line-height:1.4; }
        .mascot { font-size:42px; }
        .bothero { width:166px; padding:0; }
        .botface { width:64px; height:64px; }
        .floatie { width:28px; height:28px; font-size:13px; }
        .floatie.f1 { top:22px; }
        .floatie { width:30px; height:30px; font-size:14px; }
        .stats { gap:5px; margin-top:8px; }
        .stat { padding:4px 9px; font-size:12px; border-radius:10px; border-width:1.5px; }
        .weekrow { margin-top:8px; gap:4px; }
        .daycell { width:34px; padding:3px 2px; border-width:1.5px; }
        .dlet { font-size:10.5px; }
        .dmin { font-size:12.5px; min-height:15px; }
        .weeklegend { margin-top:3px; font-size:10.5px; }
        .recbtn { margin-top:8px; padding:7px 10px; font-size:13px; line-height:1.45; }
        .subjects { gap:7px; margin-top:8px; }
        .subjbtn { padding:9px 5px 7px; font-size:14px; border-radius:14px; }
        .semoji { font-size:24px; margin-bottom:2px; animation:none; }
        .subjlvl { font-size:10px; margin-top:2px; }
        .subjbar { margin-top:4px; height:4px; }
        .lvladjust { margin-top:8px; gap:5px; }
        .lvlbtn { padding:4px 9px; font-size:11.5px; }
        .lvllabel { font-size:12px; }
        .btn { padding:11px; font-size:16px; margin-top:10px; border-radius:14px; }
        .btn.ghost { padding:5px; font-size:12.5px; margin-top:6px; }
        .path { margin:0 0 6px; }
        .stone { width:28px; height:28px; font-size:12px; }
        .fox { font-size:14px; }
        .path-line { width:16px; height:4px; }
        .path.small .stone { width:22px; height:22px; font-size:10px; }
        .path.small .path-line { width:10px; }
        .bubble { font-size:12.5px; padding:6px 9px; margin-bottom:7px; border-radius:10px; }
        .qpic { font-size:36px; margin-bottom:2px; }
        .qtext { font-size:16.5px; }
        .qen { font-size:18px; padding:8px; padding-inline-end:34px; margin-top:8px; border-radius:12px; }
        .qen.heb { font-size:15px; }
        .hint { margin-top:5px; font-size:10.5px; }
        .answers { gap:6px; margin-top:9px; }
        .ans { padding:9px 12px; font-size:15.5px; border-radius:12px; }
        .fb { margin-top:7px; font-size:15px; }
        .explain { margin-top:5px; padding:7px 10px; font-size:13px; border-radius:10px; }
        .combo { font-size:12.5px; margin-top:2px; }
        .lomisays { margin-top:8px; gap:7px; }
        .lomiface { font-size:24px; }
        .lomibubble { font-size:13.5px; padding:8px 10px; padding-inline-end:32px; line-height:1.55; }
        .teachbody { font-size:13.5px; }
        .artrow { gap:10px; margin-bottom:2px; }
        .artmoji { font-size:30px; }
        .topicgrid { gap:7px; margin-top:9px; }
        .topicchip { padding:9px 5px 7px; font-size:13.5px; border-radius:14px; }
        .temoji { font-size:24px; margin-bottom:2px; }
        .tprog { margin-top:5px; }
        .tpct { font-size:9.5px; margin-top:2px; }
        .tnew { font-size:10px; padding:1px 8px; }
        .pointbadge { font-size:10px; padding:3px 7px; top:-9px; }
        .lessonlist { gap:6px; margin-top:9px; }
        .lessonbtn { padding:8px 10px; font-size:13.5px; border-radius:12px; }
        .lemoji { font-size:20px; }
        .lstate { font-size:10px; }
        .chipgrid, .grid { gap:6px; margin-top:9px; }
        .chip { padding:9px 7px; font-size:14px; border-radius:12px; }
        .corner { width:32px; height:32px; font-size:13px; top:8px; }
        .corner.c2 { left:46px; }
        .corner.r2 { right:46px; }
        .sayall { width:25px; height:25px; font-size:10px; top:5px; }
        .timer { font-size:42px; margin:6px 0; }
        .bigstars { font-size:32px; margin-top:5px; letter-spacing:2px; }
        .input { margin-top:10px; padding:11px; font-size:17px; }
        .usergrid { gap:6px; margin-top:9px; }
        .userbtn { padding:8px 12px; font-size:15px; }
        .pinpad { gap:6px; margin-top:9px; }
        .pinkey { padding:8px; font-size:17px; }
        .pindots { margin:8px 0 2px; gap:10px; }
        .pgrid { gap:5px; }
        .pbox { padding:6px 8px; font-size:11px; }
        .pbox b { font-size:14px; }
        .prow { padding:5px 9px; font-size:12px; margin-bottom:4px; }
        .psec { margin-top:12px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .lomi * { animation:none !important; transition:none !important; }
      }
    `}</style>
  );

  const wrap = (children) => (
    <div className="lomi" dir="rtl" lang="he">
      {css}
      <div className="frame">{children}</div>
    </div>
  );

  // --- מסכי הקמה ---

  if (screen === "boot") return wrap(<div className="card center"><div className="mascot bounce">🤖</div></div>);

  if (screen === "welcome")
    return wrap(
      <div className="card center">
        {users.length > 0 && (
          <button className="corner" onClick={() => { sfx.click(); setScreen("users"); }} aria-label="חזרה לבחירת משתמש">👥</button>
        )}
        <div className="bothero">
          <FloatingSymbols />
          <BotFace size={104} />
        </div>
        <h1>היי! אני בִּיפּ</h1>
        <p className="sub">הרובוט שלומד איתך! נלמד יחד — בצעדים קטנים, קצרים וכיפיים. כל פרק לוקח בערך 5 דקות.</p>
        <input
          className="input"
          placeholder="איך קוראים לך?"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn" disabled={!name.trim()} onClick={() => { sfx.click(); setScreen("grade"); }}>
          בואו נתחיל! 🚀
        </button>
      </div>
    );

  if (screen === "grade")
    return wrap(
      <div className="card center">
        {users.length > 0 && (
          <button className="corner" onClick={() => { sfx.click(); setScreen("users"); }} aria-label="חזרה לבחירת משתמש">👥</button>
        )}
        <h2>באיזו כיתה אתה, {name.trim()}?</h2>
        <div className="grid">
          {GRADES.map((g, i) => (
            <button
              key={g}
              className={"chip" + (grade === i ? " on" : "")}
              onClick={() => { sfx.click(); setGrade(i); }}
            >
              {g}
            </button>
          ))}
        </div>
        <button className="btn" disabled={grade === null} onClick={() => { sfx.click(); setScreen("interests"); }}>
          המשך
        </button>
      </div>
    );

  if (screen === "interests")
    return wrap(
      <div className="card center">
        {users.length > 0 && (
          <button className="corner" onClick={() => { sfx.click(); setScreen("users"); }} aria-label="חזרה לבחירת משתמש">👥</button>
        )}
        <h2>מה אתה הכי אוהב?</h2>
        <p className="sub">בחר עד 3 — בִּיפּ ישתמש בזה כדי להכין שאלות בדיוק בשבילך</p>
        <div className="chipgrid">
          {INTERESTS.map((it) => {
            const on = picked.includes(it.id);
            return (
              <button
                key={it.id}
                className={"chip" + (on ? " on" : "")}
                onClick={() => {
                  sfx.click();
                  setPicked((p) =>
                    on ? p.filter((x) => x !== it.id) : p.length < 3 ? [...p, it.id] : p
                  );
                }}
              >
                {it.label}
              </button>
            );
          })}
        </div>
        <button className="btn" disabled={picked.length === 0} onClick={finishSignup}>
          סיימנו — קדימה! 🚀
        </button>
      </div>
    );

  if (screen === "diag-intro" && profile)
    return wrap(
      <div className="card center">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <div className="mascot">🎲</div>
        <h2>רגע לפני {SUBJECTS[subject].label}...</h2>
        <p className="sub">
          משחק היכרות קצר! 5 שאלות כדי שבִּיפּ יבדוק מה אתה כבר יודע ב{SUBJECTS[subject].label} ויתאים לך בדיוק את הרמה.
          <br />
          אי אפשר להיכשל פה — רק לשחק 😉
        </p>
        <button className="btn green" onClick={() => { sfx.click(); startDiag(subject); }}>
          מתחילים!
        </button>
        <button className="btn ghost" onClick={skipDiag}>
          דלג — נתחיל ברמה לפי הכיתה
        </button>
      </div>
    );

  // --- אבחון ---

  if (screen === "diag" && diag)
    return wrap(
      <div className="card">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <button className="corner r" onClick={toggleSpeech} aria-label={speechOn ? "כיבוי הקראה" : "הפעלת הקראה"} title="הקראה קולית">
          {speechOn ? "🗣️" : "🤐"}
        </button>
        <Confetti burst={burst} />
        <StepPath total={5} done={diag.i} current={diag.i} />
        <Bubble>{diag.i < 3 ? "רק מכירים אותך — תענה מה שנראה לך 🙂" : "אתה עושה עבודה מעולה!"}</Bubble>
        {diag.q && (
          <QuestionCard key={"d" + diag.i} q={diag.q} onAnswer={diagAnswer} phase={diag.phase} selected={diag.selected} />
        )}
        {diag.phase !== "idle" && (
          <div className={"fb" + (diag.phase === "wrong" ? " bad" : "")}>{diag.fb}</div>
        )}
      </div>
    );

  if (screen === "diag-result" && profile && diag)
    return wrap(
      <div className="card center">
        <Confetti burst={1} big />
        <div className="mascot">{LEVELS[profile.levels[diag.subj]].emoji}</div>
        <h1>מצאנו את הרמה שלך ב{SUBJECTS[diag.subj].label}!</h1>
        <div className="bigstars">רמת {LEVELS[profile.levels[diag.subj]].name}</div>
        <p className="sub">
          מעכשיו כל שיעור ותרגול ב{SUBJECTS[diag.subj].label} ייבנו בדיוק בשבילך — קצר, ברור, ובקצב שלך.
        </p>
        <button
          className="btn green"
          onClick={() => {
            sfx.click();
            const t = pendingTopic;
            setDiag(null);
            setPendingTopic(null);
            if (t) openTopic(t);
            else setScreen("home");
          }}
        >
          ממשיכים ללמוד! 🚀
        </button>
      </div>
    );

  // --- בחירת משתמש ---

  if (screen === "users")
    return wrap(
      <div className="card center">
        {profile && (
          <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        )}
        <div className="mascot bounce">🤖</div>
        <h2>מי לומד היום?</h2>
        <p className="sub">בחרו את השם שלכם — או הוסיפו לומד חדש</p>
        <div className="usergrid">
          {users.map((u, i) => (
            <div className="userrow" key={u.id}>
              <button
                className="userbtn"
                style={{ animationDelay: i * 80 + "ms" }}
                onClick={() => selectUser(u)}
              >
                <span className="uemoji">{LEVELS[u.levels.en].emoji}</span>
                {u.name}
                <span className="usub">⭐ {u.stars} · כיתה {GRADES[u.grade] || "?"}</span>
              </button>
              <button
                className="udel"
                aria-label={`מחיקת ${u.name}`}
                title={`מחיקת ${u.name}`}
                onClick={() => askDelete(u)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button className="btn" onClick={newUser}>➕ לומד חדש</button>
        <button className="btn ghost" onClick={openParents}>🔒 אזור הורים</button>
        {confirmDel && (
          <div className="overlay" onClick={() => setConfirmDel(null)}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
              <div className="mascot">🗑️</div>
              <h2>למחוק את {confirmDel.name}?</h2>
              <p className="sub">כל הכוכבים וההתקדמות יימחקו לתמיד. כדי למחוק, הקישו את קוד ההורים.</p>
              <PinPad
                value={delPin}
                err={delPinErr}
                onDigit={pressDelPin}
                onBack={() => { sfx.click(); setDelPin(delPin.slice(0, -1)); }}
              />
              <button className="btn ghost" onClick={() => { sfx.click(); setConfirmDel(null); }}>
                ביטול
              </button>
            </div>
          </div>
        )}
      </div>
    );

  // --- אזור הורים: קוד כניסה ---

  if (screen === "pin")
    return wrap(
      <div className="card center">
        <button className="corner" onClick={exitParents} aria-label="חזרה">🏠</button>
        <div className="mascot">🔒</div>
        <h2>אזור הורים</h2>
        <p className="sub">הקישו את קוד ההורים בן 4 הספרות</p>
        <PinPad
          value={pin}
          err={pinErr}
          onDigit={pressPin}
          onBack={() => { sfx.click(); setPin(pin.slice(0, -1)); }}
        />
      </div>
    );

  // --- אזור הורים: דוח ---

  if (screen === "parents") {
    const kid = users[Math.min(kidSel, Math.max(0, users.length - 1))];
    if (!kid)
      return wrap(
        <div className="card center">
          <button className="corner" onClick={exitParents} aria-label="יציאה">🏠</button>
          <div className="mascot">👪</div>
          <h2>אזור הורים</h2>
          <p className="sub">עדיין אין לומדים רשומים באפליקציה.</p>
        </div>
      );
    const hist = kid.history || [];
    const tstats = {};
    hist.forEach((h) => {
      const k = h.subject + ":" + h.topic;
      const s = (tstats[k] = tstats[k] || { c: 0, t: 0, n: 0, sub: h.subject, topic: h.topic });
      s.c += h.correct;
      s.t += h.total;
      s.n += 1;
    });
    const rows = Object.values(tstats)
      .map((s) => ({ ...s, pct: Math.round((100 * s.c) / s.t) }))
      .sort((a, b) => a.pct - b.pct);
    const weak = rows.filter((r) => r.pct < 70);
    const totC = hist.reduce((a, h) => a + h.correct, 0);
    const totT = hist.reduce((a, h) => a + h.total, 0);
    const avg = totT ? Math.round((100 * totC) / totT) : null;
    const last = hist.length ? hist[hist.length - 1] : null;
    const fmt = (ms) =>
      new Date(ms).toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }) +
      " · " +
      new Date(ms).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    const pctCls = (v) => (v >= 80 ? "good" : v >= 60 ? "mid" : "low");
    return wrap(
      <div className="card">
        <button className="corner" onClick={exitParents} aria-label="יציאה">🏠</button>
        <h2 className="center">👪 אזור הורים</h2>
        {users.length > 1 && (
          <div className="kidtabs">
            {users.map((u, i) => (
              <button
                key={u.id}
                className={"chip" + (i === kidSel ? " on" : "")}
                onClick={() => { sfx.click(); setKidSel(i); }}
              >
                {u.name}
              </button>
            ))}
          </div>
        )}
        <div className="psec">
          <h3>תמונת מצב — {kid.name} (כיתה {GRADES[kid.grade] || "?"})</h3>
          <div className="pgrid">
            <div className="pbox">שיעורים שהושלמו<b>{kid.totalSessions}</b></div>
            <div className="pbox">ימי למידה<b>{kid.days || 0}</b></div>
            <div className="pbox">הצלחה כוללת<b>{avg == null ? "—" : avg + "%"}</b></div>
            <div className="pbox">רצף נוכחי<b>{kid.streak} ימים</b></div>
            {SUBJECT_IDS.map((sid) => (
              <div className="pbox" key={sid}>
                {SUBJECTS[sid].label}
                <b>{LEVELS[kid.levels[sid]].name} {LEVELS[kid.levels[sid]].emoji}</b>
              </div>
            ))}
          </div>
          <p className="sub">🕐 שימוש אחרון: {last ? fmt(last.at) : "עדיין לא הושלם שיעור"}</p>
        </div>
        {rows.length > 0 && (
          <div className="psec">
            <h3>מה נלמד ואיך הולך</h3>
            {rows.map((r) => (
              <div className="prow" key={r.sub + r.topic}>
                <span>{SUBJECTS[r.sub].emoji} {topicLabelOf(r.sub, r.topic)}</span>
                <span>{r.n} פרקים</span>
                <span className={"pct " + pctCls(r.pct)}>{r.pct}%</span>
              </div>
            ))}
          </div>
        )}
        <div className="psec">
          <h3>מה כדאי לחזק</h3>
          {weak.length ? (
            <p className="sub">
              ⚠️ {weak.map((r) => topicLabelOf(r.sub, r.topic)).join(", ")} — מומלץ לתרגל שוב.
              ההמלצה בדף הבית של {kid.name} כבר מכוונת לשם.
            </p>
          ) : (
            <p className="sub">💚 אין נושאים חלשים כרגע — כל הכבוד!</p>
          )}
        </div>
        {hist.length > 0 && (
          <div className="psec">
            <h3>פרקים אחרונים וציונים</h3>
            {hist.slice(-8).reverse().map((h, i) => (
              <div className="prow" key={h.at + "-" + i}>
                <span>{fmt(h.at)}</span>
                <span>{SUBJECTS[h.subject].emoji} {topicLabelOf(h.subject, h.topic)}</span>
                <span className={"pct " + pctCls(Math.round((100 * h.correct) / h.total))}>
                  {h.correct}/{h.total}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="psec">
          <h3>🎙️ הקול של בִּיפּ</h3>
          {serverTts === null ? (
            <p className="sub">בודק את שרת הקול... ⏳</p>
          ) : serverTts.enabled ? (
            <>
              <p className="sub">
                קול טבעי פעיל ✅ לחצו על קול כדי לשמוע דוגמה — הקול שתבחרו ילווה את כל ההקראות.
              </p>
              <div className="kidtabs">
                {serverTts.voices.map((v) => {
                  const cur = serverTts.voices.some((x) => x.id === ttsVoice) ? ttsVoice : serverTts.defaultVoice;
                  return (
                    <button
                      key={v.id}
                      className={"chip voice" + (cur === v.id ? " on" : "")}
                      onClick={() => pickVoice(v.id)}
                    >
                      {v.gender === "MALE" ? "👨" : "👩"} {v.id}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="sub">
              הקול הטבעי עוד לא הופעל בשרת, ולכן כרגע נשמע הקול המובנה של הדפדפן (רובוטי).
              {serverTts.error ? " (" + serverTts.error + ")" : ""}
            </p>
          )}
          <details className="ttsadv">
            <summary>מתקדם: מפתח קול פרטי למכשיר הזה בלבד</summary>
            <p className="sub">
              עוקף את שרת הקול. המפתח נשמר במכשיר הזה בלבד ולא נשלח לאף אחד מלבד ספק הקול.
            </p>
            <div className="kidtabs">
              <button
                className={"chip" + (ttsProvider === "google" ? " on" : "")}
                onClick={() => { sfx.click(); setTtsProvider("google"); }}
              >
                Google Cloud
              </button>
              <button
                className={"chip" + (ttsProvider === "azure" ? " on" : "")}
                onClick={() => { sfx.click(); setTtsProvider("azure"); }}
              >
                Microsoft Azure
              </button>
            </div>
            <input
              className="input tts"
              placeholder="API Key — הדביקו כאן את המפתח"
              value={ttsKey}
              onChange={(e) => setTtsKey(e.target.value)}
            />
            {ttsProvider === "azure" && (
              <input
                className="input tts"
                placeholder="Region (למשל westeurope)"
                value={ttsRegion}
                onChange={(e) => setTtsRegion(e.target.value)}
              />
            )}
            <button className="btn" onClick={saveTts}>שמירה ובדיקת קול 🎙️</button>
          </details>
          {ttsStatus && <p className="sub center">{ttsStatus}</p>}
        </div>
      </div>
    );
  }

  // --- דף הבית: בחירת מקצוע ---

  if (screen === "home" && profile) {
    const rec = recommendNext(profile);
    // שבוע נוכחי (א'-ש'): דקות למידה אקטיבית בכל יום
    const nowD = new Date();
    const dow = nowD.getUTCDay();
    const weekCells = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(nowD);
      d.setUTCDate(nowD.getUTCDate() - dow + i);
      const key = d.toISOString().slice(0, 10);
      const secs = (profile.activity || {})[key] || 0;
      return {
        letter: DAY_LETTERS[i],
        mins: secs ? Math.max(1, Math.round(secs / 60)) : 0,
        isToday: i === dow,
        future: i > dow,
      };
    });
    const recentTopics = [
      ...new Set(
        (profile.history || []).slice(-6).reverse().map((h) => topicLabelOf(h.subject, h.topic))
      ),
    ].slice(0, 3);
    return wrap(
      <div className="card center">
        <button className="corner" onClick={toggleMute} aria-label={muted ? "הפעלת צלילים" : "השתקה"}>
          {muted ? "🔇" : "🔊"}
        </button>
        <button className="corner c2" onClick={toggleSpeech} aria-label={speechOn ? "כיבוי הקראה" : "הפעלת הקראה"} title="הקראה קולית">
          {speechOn ? "🗣️" : "🤐"}
        </button>
        <button className="corner r" onClick={openParents} aria-label="אזור הורים">👪</button>
        <div className="bothero">
          <FloatingSymbols />
          <BotFace size={92} />
        </div>
        <h1>היי {profile.name}! 👋</h1>
        <div className="stats">
          <div className="stat">⭐ {profile.stars}</div>
          <div className="stat">🔥 רצף {profile.streak} ימים</div>
          <div className="stat">📘 {profile.totalSessions} שיעורים</div>
          <div className="stat">📅 {profile.days || 0} ימי למידה</div>
        </div>
        <div className="weekrow">
          {weekCells.map((w, i) => (
            <div
              key={i}
              className={"daycell" + (w.isToday ? " today" : "") + (w.future ? " future" : "")}
            >
              <span className="dlet">{w.letter}</span>
              <span className="dmin">{w.future ? "" : w.mins > 0 ? w.mins : "·"}</span>
            </div>
          ))}
        </div>
        <p className="weeklegend">⏱️ דקות של למידה אמיתית בכל יום השבוע</p>
        {recentTopics.length > 0 && (
          <p className="sub">למדנו לאחרונה: {recentTopics.join(" · ")}</p>
        )}
        {rec && (
          <button className="recbtn" onClick={() => openTopic(rec.t, rec.sub)}>
            ⭐ השיעור המומלץ הבא: <b>{rec.t.label} {rec.t.emoji}</b> ב{SUBJECTS[rec.sub].label}
            <br />
            <small>{rec.why}</small>
          </button>
        )}
        <p className="sub">או בוחרים מקצוע:</p>
        <div className="subjects">
          {Object.entries(SUBJECTS).map(([id, s]) => (
            <button key={id} className="subjbtn" onClick={() => { sfx.click(); setSubject(id); setScreen("topics"); }}>
              <span className="semoji">{s.emoji}</span>
              {s.label}
              <span className="subjlvl">
                {(profile.diagDone || {})[id]
                  ? `${LEVELS[profile.levels[id]].emoji} ${LEVELS[profile.levels[id]].name}`
                  : "חדש! ✨"}
              </span>
              <span className="subjbar">
                <span
                  className="subjfill"
                  style={{ width: subjectProgress(profile, id) + "%" }}
                />
              </span>
            </button>
          ))}
        </div>
        <p className="sub adjhint">רוצים להתאים את רמת הכל? ⚙️</p>
        <div className="lvladjust">
          <button
            className="lvlbtn"
            disabled={SUBJECT_IDS.every((s) => profile.levels[s] <= 1)}
            onClick={() => adjustLevels(-1)}
          >
            ➖ קל יותר
          </button>
          {(() => {
            const lv = SUBJECT_IDS.map((s) => profile.levels[s]);
            const mn = Math.min(...lv), mx = Math.max(...lv);
            return (
              <span className="lvllabel big">
                רמה כללית
                <b>
                  {mn === mx
                    ? `${LEVELS[mn].emoji} ${LEVELS[mn].name}`
                    : `${LEVELS[mn].name}–${LEVELS[mx].name}`}
                </b>
              </span>
            );
          })()}
          <button
            className="lvlbtn"
            disabled={SUBJECT_IDS.every((s) => profile.levels[s] >= 6)}
            onClick={() => adjustLevels(1)}
          >
            קשה יותר ➕
          </button>
        </div>
        <button className="btn ghost" onClick={() => { sfx.click(); setScreen("users"); }}>
          👥 החלפת משתמש / הוספת לומד
        </button>
      </div>
    );
  }

  // --- בחירת נושא לפני השיעור ---

  if (screen === "topics" && profile) {
    const lvl = profile.levels[subject];
    const opts = TOPICS[subject].filter((t) => lvl >= t.min);
    const rec = recommendNext(profile, subject);
    const tstat = {};
    (profile.history || []).forEach((h) => {
      if (h.subject !== subject) return;
      const s = (tstat[h.topic] = tstat[h.topic] || { c: 0, t: 0, n: 0 });
      s.c += h.correct;
      s.t += h.total;
      s.n += 1;
    });
    return wrap(
      <div className="card center">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <div className="mascot bounce">🤖</div>
        <h2>מה בא לך ללמוד היום ב{SUBJECTS[subject].label}?</h2>
        <p className="sub">בחר נושא — או תן לבִּיפּ להפתיע אותך 🎲</p>
        <div className="lvladjust">
          <button className="lvlbtn" disabled={lvl <= 1} onClick={() => adjustLevels(-1, subject)}>
            ➖ קל יותר
          </button>
          <span className="lvllabel big">
            הרמה שלך
            <b>{LEVELS[lvl].emoji} {LEVELS[lvl].name}</b>
          </span>
          <button className="lvlbtn" disabled={lvl >= 6} onClick={() => adjustLevels(1, subject)}>
            קשה יותר ➕
          </button>
        </div>
        <div className="topicgrid">
          {opts.map((t, i) => {
            const s = tstat[t.id];
            const pct = s ? Math.round((100 * s.c) / s.t) : null;
            const isRec = rec && rec.t.id === t.id;
            return (
              <button
                key={t.id}
                className={"topicchip" + (isRec ? " recommended" : "")}
                style={{ animationDelay: i * 90 + "ms" }}
                onClick={() => openTopic(t)}
              >
                {isRec && <span className="pointbadge">👈 כדאי לתרגל</span>}
                <span className="temoji">{t.emoji}</span>
                {t.label}
                {t.id !== "mix" &&
                  (s ? (
                    <span className="tprog">
                      <span className="tbar">
                        <span
                          className={"tfill" + (pct >= 80 ? "" : pct >= 60 ? " mid" : " low")}
                          style={{ width: Math.max(6, pct) + "%" }}
                        />
                      </span>
                      <span className="tpct">{s.n} פרקים · {pct}% הצלחה</span>
                    </span>
                  ) : (
                    <span className="tprog">
                      <span className="tnew">חדש ✨</span>
                    </span>
                  ))}
              </button>
            );
          })}
        </div>
        <button className="btn ghost" onClick={goHome}>
          ⇦ חזרה לדף הבית
        </button>
      </div>
    );
  }

  // --- תפריט נושא: שיעורים + תרגול ---

  if (screen === "topicmenu" && profile && topic) {
    const lessons = lessonsFor(subject, topic.id, profile.levels[subject]);
    const doneSet = new Set(profile.lessonsDone || []);
    return wrap(
      <div className="card center">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <div className="mascot">{topic.emoji}</div>
        <h2>{topic.label}</h2>
        <p className="sub">קודם לומדים עם בִּיפּ, אחר כך מתרגלים לבד 💪</p>
        <div className="lessonlist">
          {lessons.map((l, i) => (
            <button
              key={l.id}
              className={"lessonbtn" + (doneSet.has(l.id) ? " completed" : "")}
              style={{ animationDelay: i * 80 + "ms" }}
              onClick={() => startCourse(l)}
            >
              <span className="lemoji">{l.emoji}</span>
              <span className="ltitle">{l.title}</span>
              <span className={"lstate" + (doneSet.has(l.id) ? " ok" : "")}>
                {doneSet.has(l.id) ? "✓ הושלם" : "שיעור 📖"}
              </span>
            </button>
          ))}
        </div>
        <button className="btn green" onClick={() => startLesson(topic)}>
          תרגול חופשי 🎯
        </button>
        <button className="btn ghost" onClick={() => { sfx.click(); setScreen("topics"); }}>
          ⇦ חזרה לנושאים
        </button>
      </div>
    );
  }

  // --- נגן שיעור מודרך ---

  if (screen === "course" && course) {
    const step = course.lsn.steps[course.i];
    const total = course.lsn.steps.length;
    return wrap(
      <>
      {step.t === "teach" && step.scene && sceneOv === course.i && (
        <SceneOverlay
          sc={step.scene}
          title={step.title}
          onClose={() => { sfx.click(); setSceneOv(null); }}
          onReplay={() => { speakHe(step.title + ". " + step.body); if (step.en) speakAny(step.en, { queue: true }); }}
        />
      )}
      <div className="card">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <button className="corner r" onClick={toggleMute} aria-label={muted ? "הפעלת צלילים" : "השתקה"}>
          {muted ? "🔇" : "🔊"}
        </button>
        <button className="corner r2" onClick={toggleSpeech} aria-label={speechOn ? "כיבוי הקראה" : "הפעלת הקראה"} title="הקראה קולית">
          {speechOn ? "🗣️" : "🤐"}
        </button>
        <Confetti burst={burst} />
        <StepPath total={total} done={course.i} current={course.i} />
        <Bubble>{courseCheer(course.i, total, profile ? profile.name : "")}</Bubble>
        {step.t === "teach" ? (
          <div className="qcard" key={"t" + course.i}>
            {step.scene ? (
              <Scene sc={step.scene} playing playKey={course.i} onClick={() => { sfx.pop(); setSceneOv(course.i); }} />
            ) : step.art ? (
              <div className="artrow">
                {step.art.map((e, i) => (
                  <span key={i} className="artmoji" style={{ animationDelay: i * 150 + "ms" }}>
                    {e}
                  </span>
                ))}
              </div>
            ) : (
              <Pic emoji={step.pic} />
            )}
            <h2 className="center">{step.title}</h2>
            <div className="lomisays">
              <span className="lomiface">🤖</span>
              <div className="lomibubble">
                <button
                  className="sayall"
                  onClick={() => { speakHe(step.title + ". " + step.body); if (step.en) speakAny(step.en, { queue: true }); }}
                  aria-label="הקראת ההסבר"
                  title="הקראת ההסבר"
                >
                  🔊
                </button>
                {!step.scene || showText ? (
                  <AnimText text={step.body} canSpeak />
                ) : (
                  <button className="showtext" onClick={() => { sfx.click(); setShowText(true); }}>
                    📝 להציג את ההסבר בכתב
                  </button>
                )}
              </div>
            </div>
            {step.en && (
              <div className={"qen" + (isHeb(step.en) ? " heb" : "")} dir={isHeb(step.en) ? "rtl" : "ltr"}>
                <button
                  className="sayall"
                  onClick={() => speakAny(step.en)}
                  aria-label="הקראת המשפט המלא"
                  title="הקראת המשפט המלא"
                >
                  🔊
                </button>
                <AnimText text={step.en} canSpeak />
              </div>
            )}
            {step.en && !step.scene && (
              <div className="hint">🔊 לחצו על מילה כדי לשמוע אותה — או על הרמקול להקראה מלאה</div>
            )}
            <button className="btn" onClick={() => { sfx.click(); trackActive(); courseNext(); }}>
              הבנתי, ממשיכים ➜
            </button>
          </div>
        ) : (
          <>
            <QuestionCard
              key={"c" + course.i}
              q={step}
              onAnswer={courseAnswer}
              phase={course.phase}
              selected={course.selected}
            />
            {course.phase !== "idle" && (
              <>
                <div className={"fb" + (course.phase === "wrong" ? " bad" : "")}>{course.fb}</div>
                {course.phase === "right" && (course.combo || 0) >= 2 && (
                  <div className="combo">🔥 {course.combo} נכונות ברצף!</div>
                )}
                <div className={"explain" + (course.phase === "right" ? " good" : "")}>
                  <span className="bulb">💡</span> {step.ex}
                  {course.phase === "wrong" ? " — התשובה הנכונה מסומנת בירוק." : ""}
                </div>
                <button
                  className={"btn" + (course.phase === "right" ? " green" : "")}
                  onClick={() => { sfx.click(); trackActive(); courseNext(); }}
                >
                  {course.phase === "right" ? "ממשיכים! ➜" : "הבנתי, ממשיכים ➜"}
                </button>
              </>
            )}
          </>
        )}
      </div>
      </>
    );
  }

  // --- סיום שיעור מודרך ---

  if (screen === "course-done" && profile)
    return wrap(
      <div className="card center">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <Confetti burst={burst} big />
        <div className="mascot">🎓</div>
        <h1>סיימת את השיעור!</h1>
        <div className="bigstars">{"⭐".repeat(Math.max(1, Math.min(7, profile.lastEarned)))}</div>
        <p className="sub">
          <b>{profile.lastLesson}</b>
          <br />
          ענית נכון על {profile.lastCorrect} מתוך {profile.lastTotal} שאלות הבדיקה והרווחת {profile.lastEarned} כוכבים!
        </p>
        <button className="btn green" onClick={() => startLesson(topic)}>
          עכשיו תרגול על מה שלמדנו! 🎯
        </button>
        <button className="btn" onClick={() => { sfx.click(); setScreen("topicmenu"); }}>
          עוד שיעור 📖
        </button>
        <button className="btn ghost" onClick={goHome}>
          לדף הבית
        </button>
      </div>
    );

  // --- טעינת AI ---

  if (screen === "gen")
    return wrap(
      <div className="card center">
        <div className="mascot bounce">🤖</div>
        <h2>{LOADING_MSGS[loadMsg]}</h2>
        <p className="sub">
          בִּיפּ מכין {topic ? `שאלות ב${topic.label}` : "שאלות"} בדיוק בשבילך...
        </p>
      </div>
    );

  // --- שיעור ---

  if (screen === "lesson" && lesson) {
    const q = lesson.qs[lesson.i];
    return wrap(
      <div className="card">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <button className="corner r" onClick={toggleMute} aria-label={muted ? "הפעלת צלילים" : "השתקה"}>
          {muted ? "🔇" : "🔊"}
        </button>
        <button className="corner r2" onClick={toggleSpeech} aria-label={speechOn ? "כיבוי הקראה" : "הפעלת הקראה"} title="הקראה קולית">
          {speechOn ? "🗣️" : "🤐"}
        </button>
        <Confetti burst={burst} />
        <StepPath total={5} done={lesson.i} current={lesson.i} />
        <Bubble>{ENCOURAGE[lesson.i]}</Bubble>
        <QuestionCard key={"l" + lesson.i} q={q} onAnswer={lessonAnswer} phase={lesson.phase} selected={lesson.selected} />
        {lesson.phase !== "idle" && (
          <>
            <div className={"fb" + (lesson.phase === "wrong" ? " bad" : "")}>{lesson.fb}</div>
            {lesson.phase === "right" && (lesson.combo || 0) >= 2 && (
              <div className="combo">🔥 {lesson.combo} נכונות ברצף!</div>
            )}
            <div className={"explain" + (lesson.phase === "right" ? " good" : "")}>
              <span className="bulb">💡</span> {q.ex}
              {lesson.phase === "wrong" ? " — התשובה הנכונה מסומנת בירוק." : ""}
            </div>
            <button
              className={"btn" + (lesson.phase === "right" ? " green" : "")}
              onClick={() => { sfx.click(); trackActive(); nextStep(); }}
            >
              {lesson.phase === "right" ? "ממשיכים! ➜" : "הבנתי, ממשיכים ➜"}
            </button>
          </>
        )}
      </div>
    );
  }

  // --- סיום פרק ---

  if (screen === "done" && profile) {
    const leveled = profile.leveledUp;
    if (leveled) profile.leveledUp = false;
    return wrap(
      <div className="card center">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <Confetti burst={burst} big />
        <div className="mascot">🎉</div>
        <h1>כל הכבוד, {profile.name}!</h1>
        <div className="bigstars">{"⭐".repeat(Math.max(1, Math.min(7, profile.lastEarned)))}</div>
        <p className="sub">
          ענית נכון על {profile.lastCorrect} מתוך 5 והרווחת {profile.lastEarned} כוכבים!
          {profile.lastCorrect === 5 ? " פרק מושלם! 🤩" : " התקדמות מעולה!"}
        </p>
        {leveled && (
          <div className="explain" style={{ background: "#EAFBF2", borderColor: "#9FE3C3" }}>
            🚀 עלית רמה ב{SUBJECTS[subject].label}! מעכשיו אתה ברמת {LEVELS[profile.levels[subject]].name} {LEVELS[profile.levels[subject]].emoji}
          </div>
        )}
        <button className="btn green" onClick={() => { sfx.click(); setScreen("topics"); }}>
          עוד פרק! 🚀
        </button>
        {profile.sessionsToday >= 2 && (
          <button className="btn" onClick={() => { sfx.click(); setScreen("break"); }}>
            הפסקת תנועה של חצי דקה 🤸
          </button>
        )}
        <button className="btn ghost" onClick={goHome}>
          סיימנו להיום — לדף הבית
        </button>
      </div>
    );
  }

  // --- הפסקת תנועה ---

  if (screen === "break")
    return wrap(
      <div className="card center">
        <button className="corner" onClick={goHome} aria-label="לדף הבית">🏠</button>
        <div className="mascot bounce">🤸</div>
        <h2>הפסקת תנועה!</h2>
        <p className="sub">
          10 קפיצות במקום · מתיחה גבוהה לשמיים · סיבובי כתפיים
          <br />
          תנועה קצרה עוזרת למוח להתרכז שוב!
        </p>
        <div className="timer">{breakLeft}</div>
        <button className="btn ghost" onClick={goHome}>
          דילוג
        </button>
      </div>
    );

  return wrap(<div className="card center"><div className="mascot">🤖</div></div>);
}
