// תרגול חוזר: שאלות מכל הנושאים שהילד כבר תרגל במקצוע, ויותר מהנושאים שבהם טעה.
// הנתונים מגיעים מיומן הפרקים (profile.history) — לכל פרק נשמרים נושא, נכונות וסך השאלות.

import { practiceFor } from "./practice.js";

const SKIP = new Set(["mix", "review", "learned"]);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const qKey = (q) => (q.w || "") + "|" + (q.en || "") + "|" + (q.q || "");

// מה תורגל במקצוע ואיך הלך בכל נושא
export function learnedTopics(profile, subj) {
  const stats = {};
  for (const h of (profile && profile.history) || []) {
    if (h.subject !== subj || !h.topic || SKIP.has(h.topic)) continue;
    const s = (stats[h.topic] = stats[h.topic] || { correct: 0, total: 0 });
    s.correct += h.correct || 0;
    s.total += h.total || 0;
  }
  return stats;
}

// נושא שהלך בו פחות טוב חוזר יותר: 100% נכון → 1, חצי → 3, הכול שגוי → 5
const weightOf = (s) => (s && s.total ? 1 + 4 * (1 - Math.min(1, s.correct / s.total)) : 1);

// getExtra = מקור שאלות נוסף לנושא שאין לו מחולל ב-practiceFor (אוצר מילים באנגלית)
export function reviewPractice(subj, topics, profile, count = 6, getExtra) {
  const stats = learnedTopics(profile, subj);
  const level = (profile && profile.levels && profile.levels[subj]) || 3;
  const seen = (profile && profile.seen && profile.seen[subj]) || [];
  const all = (topics || []).filter((t) => !SKIP.has(t.id));
  // עוד לא תרגל כלום במקצוע — פותחים עם כל הנושאים
  const pool = all.filter((t) => stats[t.id]).length ? all.filter((t) => stats[t.id]) : all;
  if (!pool.length) return [];

  // הגרלה משוקללת: נושא חלש חוזר יותר, אבל אף נושא לא לוקח יותר מחצי מהתרגול
  const cap = pool.length >= 2 ? Math.max(2, Math.ceil(count / 2)) : count;
  const used = {};
  const order = [];
  for (let guard = 0; order.length < count && guard < count * 20; guard++) {
    const bag = pool.filter((t) => (used[t.id] || 0) < cap);
    if (!bag.length) break;
    const w = bag.map((t) => weightOf(stats[t.id]));
    let r = Math.random() * w.reduce((s, x) => s + x, 0);
    let i = 0;
    while (i < bag.length - 1 && r > w[i]) { r -= w[i]; i++; }
    used[bag[i].id] = (used[bag[i].id] || 0) + 1;
    order.push(bag[i]);
  }

  const out = [];
  const keys = new Set();
  const take = (t, howMany) => {
    let qs = practiceFor(subj, t.id, level, seen, 3) || [];
    if (!qs.length && getExtra) qs = getExtra(t.id, 3) || [];
    for (const q of shuffle(qs)) {
      if (out.length >= count || howMany <= 0) return;
      const k = qKey(q);
      if (!q || !q.options || keys.has(k)) continue;
      keys.add(k);
      out.push({ ...q, topicId: t.id });
      howMany -= 1;
    }
  };
  for (const t of order) take(t, 1);                       // שאלה אחת מכל תור — תרגול מגוון
  for (const t of shuffle(pool)) if (out.length < count) take(t, count - out.length);
  // הנושאים שנלמדו לא הספיקו ל-6 שאלות — משלימים משאר נושאי המקצוע
  for (const t of shuffle(all)) if (out.length < count) take(t, count - out.length);
  return out.slice(0, count);
}
