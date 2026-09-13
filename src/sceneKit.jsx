// כלי בסיס לסצנות מונפשות: מונה פעימות, דמות (אימוג'י) בגודל התא שלה, תג מספר וסידור ברשת.
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

// דמות במרכז (x, y) באחוזים; w/h = גודל התא באחוזי רוחב/גובה הבמה — האימוג'י ממלא את התא
export function Spr({ e, x, y, w = 12, h = 20, cls = "", style, children }) {
  return (
    <span className={"spr " + cls} style={{ left: x + "%", top: y + "%", "--w": w, "--h": h, ...style }}>
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

// רשת שממלאת אזור (באחוזים) בתאים הכי גדולים שאפשר; aspect = יחס רוחב/גובה של הבמה
export function cellGrid(count, box, maxCols = 10, aspect = 1.78) {
  const bw = box.x1 - box.x0;
  const bh = box.y1 - box.y0;
  const n = Math.max(1, count);
  let best = { cols: 1, size: -1 };
  for (let cols = 1; cols <= Math.min(n, maxCols); cols++) {
    const rows = Math.ceil(n / cols);
    const size = Math.min((bw / cols) * aspect, bh / rows);
    if (size > best.size + 0.01) best = { cols, size };
  }
  const cols = best.cols;
  const rows = Math.ceil(n / cols);
  const w = bw / cols;
  const h = bh / rows;
  const pos = (i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const inRow = r === rows - 1 ? n - cols * (rows - 1) : cols;
    return { x: box.x0 + bw / 2 + (c - (inRow - 1) / 2) * w, y: box.y0 + (r + 0.5) * h };
  };
  return { cols, rows, w, h, pos };
}

export const range = (n) => Array.from({ length: Math.max(0, n) }, (_, i) => i);
