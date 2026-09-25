// התאמת רמת הקושי להתקדמות הילד — לכל מקצוע בנפרד.
// כל תשובה בתרגול נכנסת ל"חלון" של התשובות האחרונות ברמה הנוכחית (עד 10), ואחרי כל פרק בודקים:
//   9 נכונות מתוך 10 האחרונות          → עולים רמה (אחרי ירידה במקצוע: רק 10 מתוך 10, כדי שהרמה לא תקפוץ הלוך וחזור).
//   5 נכונות או פחות מתוך 10 האחרונות   → יורדים רמה.
//   נכונה אחת או אפס מתוך 5 האחרונות    → יורדים מיד, כדי שילד לא יישאר מתוסכל עוד פרק.
// כל שינוי רמה (גם אבחון או כוונון ידני) מאפס את החלון — את הרמה החדשה מודדים מההתחלה.
// הספים נבחרו בסימולציה (scratchpad/sweep-adaptive.mjs): ילד שהרמה שלו לא מתאימה מגיע לרמה הנכונה
// אחרי 6–7 פרקים (בכלל הקודם: 10–11), ואחוז ההצלחה שהוא חווה בדרך לא יורד.

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 6;
export const WINDOW = 10;
export const UP_AT = 9;
export const UP_AFTER_DOWN = 10;
export const DOWN_AT = 5;
export const QUICK = 5;
export const QUICK_DOWN = 1;
const LOG_MAX = 40;

const clamp = (v) => Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.round(v)));
const count = (arr) => arr.reduce((s, x) => s + (x ? 1 : 0), 0);

// מה החלון אומר: { dir: 1 | -1, c, t } או null (נשארים ברמה)
export function judge(window, upAt = UP_AT) {
  const last = (window || []).slice(-WINDOW);
  const c = count(last);
  if (last.length >= WINDOW && c >= upAt) return { dir: 1, c, t: last.length };
  const tail = last.slice(-QUICK);
  if (tail.length >= QUICK && count(tail) <= QUICK_DOWN) return { dir: -1, c: count(tail), t: tail.length };
  if (last.length >= WINDOW && c <= DOWN_AT) return { dir: -1, c, t: last.length };
  return null;
}

const levelOf = (p, subj) => clamp((p && p.levels && p.levels[subj]) || 3);
const windowOf = (p, subj) => (((p && p.recent) || {})[subj] || []).slice(-WINDOW);

// אחרי ירידה במקצוע (כשזה השינוי האחרון בו) — צריך 10 מתוך 10 כדי לעלות שוב
export function upNeeded(p, subj) {
  const log = (p && p.levelLog) || [];
  for (let i = log.length - 1; i >= 0; i--) if (log[i].subj === subj) return log[i].why === "down" ? UP_AFTER_DOWN : UP_AT;
  return UP_AT;
}

// תשובות של פרק (מערך true/false לפי סדר המענה) → רמה, חלון ויומן מעודכנים.
// מחזיר { levels, recent, levelLog, change } — change הוא null כשהרמה לא השתנתה.
export function applyAnswers(p, subj, answers, at = Date.now()) {
  const level = levelOf(p, subj);
  let win = [...windowOf(p, subj), ...(answers || []).map((x) => (x ? 1 : 0))].slice(-WINDOW);
  const v = judge(win, upNeeded(p, subj));
  const to = v ? clamp(level + v.dir) : level;
  const change = to !== level ? { at, subj, from: level, to, why: v.dir > 0 ? "up" : "down", c: v.c, t: v.t } : null;
  if (change) win = [];
  return {
    levels: { ...((p && p.levels) || {}), [subj]: to },
    recent: { ...((p && p.recent) || {}), [subj]: win },
    levelLog: change ? [...((p && p.levelLog) || []), change].slice(-LOG_MAX) : (p && p.levelLog) || [],
    change,
  };
}

// שינוי רמה מבחוץ: why = "diag" (אבחון) או "manual" (כפתורי קל/קשה). גם הוא מאפס את החלון.
export function setLevel(p, subj, level, why, at = Date.now()) {
  const from = levelOf(p, subj);
  const to = clamp(level);
  const change = to !== from || why === "diag" ? { at, subj, from, to, why } : null;
  return {
    levels: { ...((p && p.levels) || {}), [subj]: to },
    recent: { ...((p && p.recent) || {}), [subj]: [] },
    levelLog: change ? [...((p && p.levelLog) || []), change].slice(-LOG_MAX) : (p && p.levelLog) || [],
    change,
  };
}

// כמה תשובות נכונות ברצף חסרות כדי לעלות רמה (null ברמה הגבוהה ביותר)
export function toNextLevel(p, subj) {
  if (levelOf(p, subj) >= MAX_LEVEL) return null;
  const need = upNeeded(p, subj);
  let win = windowOf(p, subj);
  for (let n = 1; n <= WINDOW; n++) {
    win = [...win, 1].slice(-WINDOW);
    if (win.length >= WINDOW && count(win) >= need) return n;
  }
  return WINDOW;
}

// החלון הנוכחי לתצוגה: { c, t, list }
export function recentStats(p, subj) {
  const list = windowOf(p, subj);
  return { c: count(list), t: list.length, list };
}

// הסבר קצר לשינוי רמה (לאזור ההורים)
export function changeReason(ch) {
  if (!ch) return "";
  if (ch.why === "diag") return "אבחון פתיחה";
  if (ch.why === "manual") return "שינוי ידני";
  if (ch.why === "up") return `${ch.c} מתוך ${ch.t} התשובות האחרונות נכונות`;
  if (ch.t === QUICK) return ch.c ? `רק תשובה נכונה אחת מתוך ${QUICK} האחרונות` : `אף תשובה נכונה ב-${QUICK} האחרונות`;
  return `רק ${ch.c} מתוך ${ch.t} התשובות האחרונות נכונות`;
}
