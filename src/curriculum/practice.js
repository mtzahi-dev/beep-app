// תרגול לפי נושא: מחולל (חשבון/אנגלית/לשון) + מאגר שאלות של הנושא, בלי לחזור על שאלות מהזמן האחרון.

import { genMathTopic } from "./mathGen.js";
import { genEnTopic } from "./enGen.js";
import { TOPIC_BANKS, genBankTopic, shuffleQ } from "./banks.js";

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const qKey = (q) => (q.w || "") + "|" + (q.en || "") + "|" + (q.q || "");

const GENERATORS = {
  math: genMathTopic,
  en: genEnTopic,
  heb: genBankTopic("heb"),
  sci: genBankTopic("sci"),
};

// want שאלות לנושא (או null אם אין לנושא מקור משלו — ואז האפליקציה משתמשת במסלול הישן)
export function practiceFor(subj, topicId, level, seen = [], want = 5) {
  const gen = GENERATORS[subj];
  const bank = ((TOPIC_BANKS[subj] || {})[topicId] || []).filter((q) => q && q.options);
  const out = [];
  const keys = new Set();
  const add = (q) => {
    const k = qKey(q);
    if (!q || keys.has(k)) return false;
    keys.add(k);
    out.push(q);
    return true;
  };

  // מהמאגר: קודם שאלות ברמה הקרובה ושלא נראו לאחרונה
  const pool = shuffle(bank).sort((a, b) => Math.abs((a.lv || 3) - level) - Math.abs((b.lv || 3) - level));
  const fresh = pool.filter((q) => !seen.includes(qKey(q)));
  const stale = pool.filter((q) => seen.includes(qKey(q)));
  const fromBank = gen && subj !== "heb" && subj !== "sci" ? Math.min(2, want) : want;
  for (const q of [...fresh, ...stale]) {
    if (out.length >= fromBank) break;
    add(shuffleQ(q));
  }

  if (gen) {
    for (let guard = 0; out.length < want && guard < 240; guard++) {
      const q = gen(topicId, level);
      if (!q) break;
      if (guard < 150 && seen.includes(qKey(q))) continue;
      add(q);
    }
  }
  if (!out.length) return null;
  return shuffle(out).slice(0, want);
}

// "הפתעה!": שאלה מכל נושא שמתאים לכיתה, עד 5
export function mixPractice(subj, topics, level, seen = []) {
  const lists = shuffle(topics.filter((t) => t.id !== "mix"))
    .map((t) => ({ id: t.id, qs: practiceFor(subj, t.id, level, seen, 5) || [] }))
    .filter((x) => x.qs.length);
  const out = [];
  const keys = new Set();
  // סבב על הנושאים: שאלה מכל נושא, עד 5 שאלות שונות
  for (let i = 0; out.length < 5 && i < 5; i++) {
    for (const { id, qs } of lists) {
      if (out.length >= 5) break;
      const q = qs[i];
      if (q && !keys.has(qKey(q))) {
        keys.add(qKey(q));
        out.push({ ...q, topic: id });
      }
    }
  }
  return out.length >= 5 ? out : null;
}
