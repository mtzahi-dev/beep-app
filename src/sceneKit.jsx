// כלי בסיס לסצנות מונפשות: מונה פעימות, דמות (אימוג'י) ממוקמת, תג מספר וסידור ברשת.
import React, { useEffect, useState } from "react";

// 0 = מצב פתיחה; כש-playing — עולה עד total, פעימה כל ms (אחרי השהיה קצרה)
export function useBeats(total, ms, playing, playKey, lead = 500) {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    setBeat(0);
    if (!playing) return;
    let b = 0;
    let id = null;
    const t = setTimeout(() => {
      id = setInterval(() => {
        b += 1;
        setBeat(b);
        if (b >= total) clearInterval(id);
      }, ms);
    }, lead);
    return () => {
      clearTimeout(t);
      if (id) clearInterval(id);
    };
  }, [total, ms, playing, playKey, lead]);
  return beat;
}

// דמות במיקום באחוזים (מרכז), גודל יחסי לגובה הבמה
export function Spr({ e, x, y, s = 1, cls = "", style, children }) {
  return (
    <span className={"spr " + cls} style={{ left: x + "%", top: y + "%", "--s": s, ...style }}>
      {e}
      {children}
    </span>
  );
}

export function Badge({ x, y, text, show = true, tone = "" }) {
  return (
    <span className={"sbadge " + tone + (show ? " on" : "")} style={{ left: x + "%", top: y + "%" }}>
      {text}
    </span>
  );
}

// מיקום פריט i מתוך count ברשת ממורכזת סביב (cx, cy)
export function gridPos(i, count, cx, cy, cols, gx, gy = gx * 1.6) {
  cols = Math.max(1, Math.min(cols, count));
  const rows = Math.ceil(count / cols);
  const r = Math.floor(i / cols);
  const c = i % cols;
  const inRow = r === rows - 1 ? count - cols * (rows - 1) : cols;
  return { x: cx + (c - (inRow - 1) / 2) * gx, y: cy + (r - (rows - 1) / 2) * gy };
}

export const sizeFor = (count) => (count <= 5 ? 1.25 : count <= 10 ? 1 : count <= 20 ? 0.75 : 0.58);

export const range = (n) => Array.from({ length: Math.max(0, n) }, (_, i) => i);
