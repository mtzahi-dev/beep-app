// מאגרי שאלות לפי נושא (הבנת הנקרא, מדעים ועוד). שאלה: { q, en?, options, c, ex, lv (1-6), scene? }

import { HEB_TOPIC_BANK } from "./hebBank.js";
import { SCI_TOPIC_BANK } from "./sciBank.js";
import { TOPICS } from "./topics.js";

// לכל שאלה במאגר יש לפחות איור של הנושא
const topicEmoji = (subj, topicId) => ((TOPICS[subj] || []).find((t) => t.id === topicId) || {}).emoji;
const withPics = (subj, bank) =>
  Object.fromEntries(Object.entries(bank).map(([tid, qs]) => [tid, qs.map((q) => (q.pic ? q : { ...q, pic: topicEmoji(subj, tid) }))]));

export const TOPIC_BANKS = { en: {}, heb: withPics("heb", HEB_TOPIC_BANK), sci: withPics("sci", SCI_TOPIC_BANK) };

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

// סדר תשובות חדש בכל הגשה (במאגר התשובה הנכונה לרוב ראשונה)
export function shuffleQ(q) {
  const order = shuffle(q.options.map((_, i) => i));
  return { ...q, options: order.map((i) => q.options[i]), c: order.indexOf(q.c) };
}

// מוסיף שאלות קיימות למאגר של נושא (למשל מהמאגרים הישנים לפי רמה)
export function addToBank(subj, topicId, questions) {
  const b = (TOPIC_BANKS[subj] = TOPIC_BANKS[subj] || {});
  const pic = topicEmoji(subj, topicId);
  b[topicId] = [...(b[topicId] || []), ...questions.map((q) => (q.pic ? q : { ...q, pic }))];
}

// מחולל שמגיש שאלות מהמאגר (לנושאים בלי מחולל אמיתי)
export function genBankTopic(subj) {
  return (topicId, level) => {
    const bank = (TOPIC_BANKS[subj] || {})[topicId];
    if (!bank || !bank.length) return null;
    const near = bank.filter((q) => Math.abs((q.lv || 3) - level) <= 1);
    const pool = near.length >= 3 ? near : bank;
    return shuffleQ(pool[Math.floor(Math.random() * pool.length)]);
  };
}
