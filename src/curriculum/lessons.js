// שיעורים מודרכים חדשים לפי מקצוע ונושא.
// שיעור: { id, title, emoji, steps: [ {t:"teach", title, body, en?, scene}, {t:"q", q, options, c, ex} ] }

import { MATH_LESSONS } from "./lessonsMath.js";
import { EN_LESSONS } from "./lessonsEn.js";
import { HEB_LESSONS } from "./lessonsHeb.js";
import { SCI_LESSONS } from "./lessonsSci.js";

export const NEW_LESSONS = { math: MATH_LESSONS, en: EN_LESSONS, heb: HEB_LESSONS, sci: SCI_LESSONS };

// שיעורים ותיקים שעוברים לנושא החדש שמתאים להם
export const LESSON_MOVES = {
  "en-be": ["en", "be"], "en-prepositions": ["en", "prep"], "en-colors": ["en", "colors"], "en-opposites": ["en", "opp"],
  "en-past-simple": ["en", "past"], "en-future-will": ["en", "future"], "heb-story-method": ["heb", "wh"],
};

// ממזג לתוך אובייקט השיעורים הקיים (לפי מקצוע → נושא → רשימה)
export function mergeLessons(LESSONS) {
  for (const subj of Object.keys(LESSONS)) {
    for (const tid of Object.keys(LESSONS[subj])) {
      const keep = [];
      for (const l of LESSONS[subj][tid]) {
        const mv = LESSON_MOVES[l.id];
        if (mv && !(mv[0] === subj && mv[1] === tid)) {
          LESSONS[mv[0]] = LESSONS[mv[0]] || {};
          (LESSONS[mv[0]][mv[1]] = LESSONS[mv[0]][mv[1]] || []).push(l);
        } else keep.push(l);
      }
      LESSONS[subj][tid] = keep;
    }
  }
  for (const [subj, topics] of Object.entries(NEW_LESSONS)) {
    LESSONS[subj] = LESSONS[subj] || {};
    for (const [tid, list] of Object.entries(topics)) LESSONS[subj][tid] = [...(LESSONS[subj][tid] || []), ...list];
  }
  for (const subj of Object.keys(LESSONS)) {
    for (const tid of Object.keys(LESSONS[subj])) if (!LESSONS[subj][tid].length) delete LESSONS[subj][tid];
  }
  return LESSONS;
}
