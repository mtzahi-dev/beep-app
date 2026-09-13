// סצנות חשבון: חלוקה, חיבור, חיסור, קבוצות (כפל), חלק מכמות, קפיצות על ישר המספרים.
import React from "react";
import { useBeats, Spr, Badge, gridPos, sizeFor, range } from "./sceneKit.jsx";

// חילוק: הערימה מתחלקת אחד-אחד בין הילדים
export function Share({ sc, playing, playKey }) {
  const { n, k, item, who } = sc;
  const per = Math.floor(n / k);
  const kidX = (j) => (j + 0.5) * (100 / k);
  const kidS = k > 6 ? 0.85 : 1.15;
  const draw = n <= 30;
  const beat = useBeats(draw ? n : 1, draw ? Math.max(170, Math.min(520, 4200 / n)) : 900, playing, playKey);
  const kids = range(k).map((j) => <Spr key={"k" + j} e={who} x={kidX(j)} y={85} s={kidS} cls="pop" />);
  if (!draw) {
    return (
      <>
        <Badge x={50} y={25} text={n} tone="big" show={beat < 1} />
        {kids}
        {range(k).map((j) => <Badge key={j} x={kidX(j)} y={58} text={beat >= 1 ? per : "?"} />)}
      </>
    );
  }
  const s = sizeFor(n) * 0.9;
  const cols = per > 5 ? 2 : 1;
  const rows = Math.ceil(per / cols);
  const stepY = Math.min(11, 46 / rows);
  const colW = Math.min(8, 70 / k / cols);
  return (
    <>
      {range(n).map((i) => {
        const moved = i < beat;
        const kid = i % k;
        const slot = Math.floor(i / k);
        const p = moved
          ? { x: kidX(kid) + ((slot % cols) - (cols - 1) / 2) * colW, y: 66 - Math.floor(slot / cols) * stepY }
          : gridPos(i, n, 50, 24, Math.min(10, n), Math.min(9, 90 / Math.min(10, n)), 13);
        return <Spr key={i} e={item} x={p.x} y={p.y} s={moved ? s * 0.8 : s} cls="fly" />;
      })}
      {kids}
      {range(k).map((j) => <Badge key={"b" + j} x={kidX(j)} y={97} text={per} show={beat >= n} />)}
    </>
  );
}

// חיבור: שתי קבוצות מתאחדות ונספרות
export function Add({ sc, playing, playKey }) {
  const { a, b, item } = sc;
  const n = a + b;
  const beat = useBeats(n + 1, n > 10 ? 240 : 400, playing, playKey);
  const merged = beat >= 1;
  const s = sizeFor(n);
  const gx = Math.min(8.5, 40 / Math.min(5, Math.max(a, b)));
  return (
    <>
      {range(n).map((i) => {
        const setup = i < a ? gridPos(i, a, 25, 45, 5, gx) : gridPos(i - a, b, 75, 45, 5, gx);
        const fin = gridPos(i, n, 50, 45, 10, Math.min(8.5, 90 / Math.min(10, n)));
        const p = merged ? fin : setup;
        return <Spr key={i} e={item} x={p.x} y={p.y} s={s} cls={"fly" + (beat - 1 > i ? " counted" : "")} />;
      })}
      <Spr e="➕" x={50} y={45} s={0.7} cls={merged ? "gone" : "pop"} />
      <Badge x={25} y={12} text={a} show={!merged} />
      <Badge x={75} y={12} text={b} show={!merged} />
      <Badge x={50} y={88} text={Math.min(n, Math.max(0, beat - 1))} tone="big" show={merged} />
    </>
  );
}

// חיסור: חלק מהפריטים עפים / יוצאים, ונספר מה שנשאר
export function Sub({ sc, playing, playKey }) {
  const { a, b, item } = sc;
  const up = item === "🎈" || item === "🐦" || item === "🦋";
  const beat = useBeats(b + 1, 380, playing, playKey);
  const s = sizeFor(a);
  return (
    <>
      {range(a).map((i) => {
        const p = gridPos(i, a, 50, 48, 10, Math.min(8.5, 90 / Math.min(10, a)));
        const leaving = i >= a - b;
        const gone = leaving && a - 1 - i < beat;
        const x = gone && !up ? 115 : p.x;
        const y = gone && up ? -25 : p.y;
        return <Spr key={i} e={item} x={x} y={y} s={s} cls={"fly" + (leaving && !gone ? " marked" : "") + (gone ? " away" : "")} />;
      })}
      <Badge x={50} y={90} text={beat > b ? a - b : a} tone="big" />
    </>
  );
}

// כפל: קבוצות שוות, סופרים קבוצה אחרי קבוצה
export function Groups({ sc, playing, playKey }) {
  const { g, per, item } = sc;
  const beat = useBeats(g, 650, playing, playKey);
  const bw = 100 / g;
  const s = per > 6 ? 0.52 : per > 3 ? 0.68 : 0.9;
  const cols = per > 8 ? 4 : per > 4 ? 3 : 2;
  return (
    <>
      {range(g).map((j) => {
        const cx = (j + 0.5) * bw;
        return (
          <React.Fragment key={j}>
            <div className={"sbox" + (beat > j ? " lit" : "")} style={{ left: cx + "%", width: bw * 0.86 + "%" }} />
            {range(per).map((i) => {
              const p = gridPos(i, per, cx, 47, cols, Math.min(bw / (cols + 1), 7), 14);
              return <Spr key={i} e={item} x={p.x} y={p.y} s={s} cls="pop" style={{ animationDelay: (j * per + i) * 35 + "ms" }} />;
            })}
            <Badge x={cx} y={90} text={per * (j + 1)} show={beat > j} />
          </React.Fragment>
        );
      })}
    </>
  );
}

// חצי / רבע מכמות: הפריטים מתחלקים לקבוצות, הראשונה מודגשת
export function FracOf({ sc, playing, playKey }) {
  const { parts, n, item } = sc;
  const per = n / parts;
  const beat = useBeats(2, 900, playing, playKey);
  const split = beat >= 1;
  const s = sizeFor(n);
  const gw = 100 / parts;
  return (
    <>
      {range(n).map((i) => {
        const grp = i % parts;
        const slot = Math.floor(i / parts);
        const p = split
          ? gridPos(slot, per, (grp + 0.5) * gw, 45, parts === 2 ? 5 : 3, Math.min(gw / 4.5, 8))
          : gridPos(i, n, 50, 45, 10, Math.min(8.5, 90 / Math.min(10, n)));
        return <Spr key={i} e={item} x={p.x} y={p.y} s={s} cls={"fly" + (split && grp > 0 ? " dim" : "") + (split && grp === 0 ? " counted" : "")} />;
      })}
      {split && range(parts - 1).map((j) => <div key={j} className="sdiv" style={{ left: (j + 1) * gw + "%" }} />)}
      <Badge x={gw / 2} y={88} text={per} tone="big" show={beat >= 2} />
    </>
  );
}

// "כמה חסר?": צפרדע קופצת על ישר המספרים וסופרת קפיצות
export function Hops({ sc, playing, playKey }) {
  const { from, to } = sc;
  const lo = Math.max(0, from - 1);
  const hi = to + 1;
  const xOf = (v) => 6 + ((v - lo) / (hi - lo)) * 88;
  const beat = useBeats(to - from, 560, playing, playKey);
  const pos = Math.min(to, from + beat);
  return (
    <>
      <div className="sline" />
      {range(hi - lo + 1).map((d) => (
        <span key={d} className={"stick" + (lo + d === to ? " goal" : "") + (lo + d > from && lo + d <= pos ? " passed" : "")} style={{ left: xOf(lo + d) + "%" }}>
          {lo + d}
        </span>
      ))}
      <Spr key={pos} e="🐸" x={xOf(pos)} y={45} s={1.05} cls="hop" />
      <Badge x={50} y={12} text={"+" + (pos - from)} tone="big" show={beat > 0} />
    </>
  );
}
