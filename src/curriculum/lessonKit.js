// כלים קטנים לכתיבת שיעורים: כרטיס הסבר, שאלת בדיקה (התשובה הנכונה ראשונה — מערבבים כאן), רצף תמונות.

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

export const lesson = (id, title, emoji, steps) => ({ id, title, emoji, min: 1, steps });

export const teach = (title, body, scene, extra = {}) => ({ t: "teach", title, body, scene, ...extra });

export function ask(q, options, ex, extra = {}) {
  const order = shuffle(options.map((_, i) => i));
  return { t: "q", q, options: order.map((i) => options[i]), c: order.indexOf(0), ex, ...extra };
}

export const f = (e, cap, anim) => ({ e, ...(cap ? { cap } : {}), ...(anim ? { anim } : {}) });
export const seq = (...frames) => ({ type: "seq", frames });
export const still = (...frames) => ({ type: "seq", arrows: false, frames });
export const steps = (...lines) => ({ type: "steps", lines });
