// שיעורים מודרכים באנגלית לנושאים החדשים.
import { lesson, teach, ask, f, seq, still } from "./lessonKit.js";

export const EN_LESSONS = {
  abc: [lesson("en-abc", "האותיות באנגלית", "🔤", [
    teach("ABC", "באנגלית יש 26 אותיות, ולכל אחת צורה גדולה וצורה קטנה: A a, B b, C c. לחצו על האותיות כדי לשמוע אותן!", seq(f("🍎", "A a"), f("⚽", "B b"), f("🐱", "C c")), { en: "A a · B b · C c · D d" }),
    ask("איזו אות באה אחרי C?", ["D", "B", "E", "A"], "A, B, C, D", { en: "A · B · C · ___" }),
    teach("לכל אות יש צליל", "B נשמעת 'בּ' כמו ball, D נשמעת 'ד' כמו dog, ו-S נשמעת 'ס' כמו sun.", seq(f("⚽", "B"), f("🐶", "D"), f("☀️", "S")), { en: "ball · dog · sun" }),
    ask("באיזו אות מתחילה המילה?", ["D", "B", "G", "O"], "dog מתחילה ב-D", { en: "dog", scene: { type: "fact", items: ["🐶"], answer: "D", ansE: "🔤" } }),
    ask("איזו אות קטנה מתאימה ל-G?", ["g", "q", "j", "p"], "G גדולה = g קטנה", { en: "G", scene: { type: "fact", tokens: ["G", "=", "___"], answer: "g" } }),
  ])],

  vocab: [lesson("en-vocab-tricks", "איך זוכרים מילים חדשות", "🧠", [
    teach("מילה + תמונה", "הטריק לזכור מילה: לדמיין אותה! כשאומרים apple — מדמיינים תפוח אדום ועסיסי. לחצו על המילים ותשמעו.", seq(f("🍎", "apple"), f("🐶", "dog"), f("☀️", "sun")), { en: "apple · dog · sun" }),
    ask("מה הפירוש של cat?", ["חתול", "כלב", "דג", "ציפור"], "cat = חתול 🐱", { en: "cat" }),
    teach("משפחות של מילים", "קל יותר לזכור מילים בקבוצות: חיות, אוכל, צבעים. dog, cat, fish — כולן חיות!", { type: "sort", bins: [{ cap: "animals" }, { cap: "food" }], items: [{ e: "🐶", bin: 0 }, { e: "🍎", bin: 1 }, { e: "🐱", bin: 0 }, { e: "🍌", bin: 1 }, { e: "🐟", bin: 0 }] }, { en: "dog · cat · fish · apple · banana" }),
    ask("איזו מילה לא שייכת לקבוצה?", ["dog", "apple", "banana", "כולן שייכות"], "dog היא חיה, והשאר פירות", { en: "apple · banana · dog" }),
    ask("איך אומרים 'בית' באנגלית?", ["house", "horse", "mouse", "hand"], "house = בית 🏠"),
  ])],

  have: [lesson("en-have-plurals", "have / has ורבים", "🎒", [
    teach("have או has?", "I, you, we, they — have. he, she, it — has. למשל: I have a dog, she has a cat.", still(f("🙋", "I have"), f("🐶"), f("👧", "she has"), f("🐱")), { en: "I have a dog · She has a cat" }),
    ask("השלם:", ["has", "have", "is", "are"], "he → has", { en: "He ___ a new bike." }),
    teach("רבים — מוסיפים s", "cat אחד, הרבה cats. אחרי s, x, ch או sh מוסיפים es: box → boxes.", seq(f("🐱", "cat"), f("🐱🐱", "cats"), f("📦", "box"), f("📦📦", "boxes")), { en: "cat → cats · box → boxes" }),
    teach("רבים מיוחדים", "יש מילים שמשתנות לגמרי: child → children, mouse → mice, foot → feet.", seq(f("🧒", "child"), f("🧒🧒", "children"), f("🐭", "mouse"), f("🐭🐭", "mice")), { en: "child → children · mouse → mice" }),
    ask("מה הרבים של box?", ["boxes", "boxs", "boxies", "box"], "אחרי x מוסיפים es"),
    ask("מה הרבים של child?", ["children", "childs", "childes", "child"], "צורה מיוחדת: children", { scene: { type: "fact", tokens: ["1 child", "→", "___"], answer: "children" } }),
  ])],

  wh: [lesson("en-wh-questions", "מילות שאלה", "❓", [
    teach("6 מילות שאלה", "What = מה, Where = איפה, When = מתי, Who = מי, Why = למה, How = איך.", seq(f("📦", "What"), f("📍", "Where"), f("⏰", "When"), f("🧑", "Who")), { en: "What · Where · When · Who · Why · How" }),
    ask("איזו מילת שאלה מתאימה?", ["What", "Where", "When", "Who"], "שואלים על שם → What", { en: "___ is your name?" }),
    teach("מקשיבים לתשובה", "רמז: אם התשובה היא מקום — Where. זמן — When. אדם — Who.", { type: "place", thing: "🐱", ref: "🛏️", where: "under" }, { en: "Where is the cat? Under the bed." }),
    ask("איזו מילת שאלה מתאימה?", ["When", "Where", "Who", "Why"], "התשובה היא זמן → When", { en: "___ is your birthday? In May." }),
    ask("איזו מילת שאלה מתאימה?", ["Why", "How", "What", "Who"], "Because = כי → Why", { en: "___ are you sad? Because I lost my ball." }),
  ])],

  prog: [lesson("en-present-progressive", "Present Progressive — מה קורה עכשיו", "🏃", [
    teach("עכשיו!", "כשמשהו קורה ממש עכשיו: am / is / are + פועל עם ing. I am reading, she is running.", still(f("🙋", "I am reading"), f("📖", null, "bob"), f("👧", "she is running"), f("🏃", null, "bob")), { en: "I am reading · She is running" }),
    ask("השלם:", ["is", "am", "are", "be"], "she → is", { en: "She ___ dancing now." }),
    teach("איך מוסיפים ing", "רוב הפעלים: play → playing. נגמר ב-e? מורידים אותה: dance → dancing. מילה קצרה עם עיצור בסוף? מכפילים: swim → swimming.", seq(f("⚽", "playing"), f("💃", "dancing"), f("🏊", "swimming")), { en: "play → playing · dance → dancing · swim → swimming" }),
    ask("השלם:", ["swimming", "swiming", "swims", "swim"], "swim → swimming", { en: "They are ___ in the pool." }),
    ask("השלם:", ["am doing", "do", "does", "doing"], "I am + doing", { en: "I ___ my homework now." }),
  ])],

  comp: [lesson("en-comparatives", "השוואות: bigger / the biggest", "🏆", [
    teach("גדול יותר — er + than", "כשמשווים בין שניים: big → bigger than. An elephant is bigger than a mouse.", { type: "pairs", pairs: [["🐘", "bigger", "🐭", "smaller", "size"]] }, { en: "An elephant is bigger than a mouse." }),
    ask("השלם:", ["faster", "fast", "fastest", "more fast"], "משווים שניים → faster than", { en: "A car is ___ than a bike." }),
    teach("הכי — the + est", "כשבוחרים אחד מכולם: the biggest, the tallest. The giraffe is the tallest animal.", seq(f("🦒", "the tallest"), f("🏆")), { en: "The giraffe is the tallest animal." }),
    teach("מילים ארוכות ויוצאות דופן", "מילים ארוכות: more beautiful, the most beautiful. ויש יוצאות דופן: good → better → best.", seq(f("🙂", "good"), f("😊", "better"), f("🤩", "best")), { en: "good → better → best" }),
    ask("השלם:", ["best", "better", "goodest", "most good"], "good → better → best", { en: "This is the ___ day ever!", scene: { type: "fact", items: ["🎉"], answer: "best", ansE: "🥇" } }),
  ])],

  modal: [lesson("en-modals", "can / must / should", "🚦", [
    teach("can — יכול", "can אומר שמישהו יכול או יודע לעשות משהו: Birds can fly. Penguins can't fly.", still(f("🐦", "can fly", "bob"), f("🐧", "can't fly")), { en: "Birds can fly · Penguins can't fly" }),
    ask("השלם:", ["can", "must", "should", "can't"], "דגים יודעים לשחות → can", { en: "Fish ___ swim." }),
    teach("must — חובה", "must = חייבים, אין ברירה: You must stop at a red light.", still(f("🚦", "must stop", "pulse"), f("✋")), { en: "You must stop at a red light." }),
    teach("should — כדאי", "should = עצה טובה: You should drink water.", still(f("💧", "should drink"), f("👍")), { en: "You should drink water." }),
    ask("השלם:", ["should", "can", "can't", "does"], "זו עצה → should", { en: "It's cold. You ___ wear a coat." }),
  ])],

  perfect: [lesson("en-present-perfect", "Present Perfect", "✅", [
    teach("עבר שקשור לעכשיו", "Present Perfect מספר על משהו שקרה ומשפיע עכשיו, או על חוויה בחיים: I have visited London.", { type: "time", who: "🙋", act: "✈️", when: "past" }, { en: "I have visited London." }),
    teach("have / has + V3", "I / you / we / they → have. he / she / it → has. ואחריהם הצורה השלישית של הפועל: eat → ate → eaten.", still(f("👧", "has eaten"), f("👫", "have seen")), { en: "She has eaten · They have seen" }),
    ask("השלם:", ["has", "have", "is", "did"], "he → has", { en: "He ___ finished his homework." }),
    teach("ever, never, already, yet", "ever = אי פעם (בשאלה). never = אף פעם. already = כבר. yet = עדיין (בשאלה או בשלילה).", seq(f("❓", "ever"), f("🚫", "never"), f("✅", "already")), { en: "Have you ever seen snow?" }),
    ask("השלם:", ["never", "yet", "ago", "yesterday"], "never = אף פעם", { en: "I have ___ seen a real lion." }),
  ])],

  cond: [lesson("en-conditionals", "משפטי תנאי If", "🔀", [
    teach("תנאי אפשרי", "כשזה יכול לקרות: If + הווה, ואז will + פועל. If it rains, we will stay home.", seq(f("🌧️", "If it rains"), f("🏠", "will stay")), { en: "If it rains, we will stay home." }),
    ask("השלם:", ["will", "would", "are", "did"], "תנאי אפשרי → will", { en: "If you study, you ___ pass the test." }),
    teach("תנאי דמיוני", "כשזה חלום שלא באמת קורה: If + עבר, ואז would + פועל. If I were a bird, I would fly.", seq(f("🙋", "If I were a bird"), f("🐦", "would fly", "bob")), { en: "If I were a bird, I would fly." }),
    ask("השלם:", ["would", "will", "am", "did"], "תנאי דמיוני → would", { en: "If I had wings, I ___ fly." }),
    teach("עובדות שתמיד נכונות", "If + הווה, ואז הווה: If you heat ice, it melts.", seq(f("🔥"), f("🧊"), f("💧")), { en: "If you heat ice, it melts." }),
  ])],

  passive: [lesson("en-passive", "סביל — Passive", "🔁", [
    teach("מה קרה — לא מי עשה", "בסביל מתמקדים במה שקרה לדבר: The cake was made. לא חשוב (או לא ידוע) מי הכין אותה.", seq(f("🎂"), f("🔁"), f("👵", "by Grandma")), { en: "The cake was made by Grandma." }),
    teach("be + V3", "הווה: is / are + V3 — English is spoken here. עבר: was / were + V3 — The letters were written.", still(f("🌍", "is spoken"), f("✉️", "were written")), { en: "is spoken · were written" }),
    ask("השלם:", ["is", "are", "was", "were"], "הווה, יחיד → is", { en: "Bread ___ baked every morning." }),
    ask("השלם:", ["were", "was", "is", "are"], "עבר, רבים → were", { en: "The windows ___ broken yesterday." }),
    ask("השלם:", ["written", "wrote", "write", "writing"], "הצורה השלישית של write היא written", { en: "The book was ___ by a famous writer." }),
  ])],
};
