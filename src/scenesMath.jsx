// סצנות חשבון: חלוקה, חיבור, חיסור, קבוצות (כפל), חלק מכמות, קפיצות על ישר המספרים.
// כל פריט מקבל את התא הכי גדול שנכנס — הציורים גדולים וברורים.
import React from "react";
import { useBeats, Spr, Badge, cellGrid, range } from "./sceneKit.jsx";

// חילוק: הערימה מתחלקת אחד-אחד בין הילדים
export function Share({ sc, playing, playKey }) {
  const { n, k, item, who } = sc;
  const per = Math.floor(n / k);
  const moveN = per * k; // מה שלא מתחלק שווה נשאר בערימה (שארית)
  const rem = n - moveN;
  const colW = 100 / k;
  const kidX = (j) => (j + 0.5) * colW;
  const kidW = Math.min(colW * 0.62, 18);
  const draw = n <= 30;
  const beat = useBeats(draw ? moveN : 1, draw ? Math.max(170, Math.min(520, 4200 / n)) : 900, playing, playKey);
  const kids = range(k).map((j) => <Spr key={"k" + j} e={who} x={kidX(j)} y={85} w={kidW} h={25} cls="pop" />);
  if (!draw) {
    return (
      <>
        <Badge x={50} y={30} text={n} tone="big" show={beat < 1} />
        {kids}
        {range(k).map((j) => <Badge key={j} x={kidX(j)} y={55} text={beat >= 1 ? per : "?"} />)}
      </>
    );
  }
  const pile = cellGrid(n, { x0: 3, y0: 3, x1: 97, y1: 50 }, 10);
  const stack = cellGrid(per, { x0: 0, y0: 16, x1: colW * 0.9, y1: 72 }, 3);
  return (
    <>
      {range(n).map((i) => {
        const moved = i < beat && i < moveN;
        if (!moved) {
          const p = pile.pos(i);
          const leftover = i >= moveN && playing && beat >= moveN;
          return <Spr key={i} e={item} x={p.x} y={p.y} w={pile.w} h={pile.h} cls={"fly" + (leftover ? " marked" : "")} />;
        }
        const kid = i % k;
        const sp = stack.pos(Math.floor(i / k));
        // נערמים מלמטה (ליד הילד) כלפי מעלה
        return <Spr key={i} e={item} x={kidX(kid) - colW * 0.45 + sp.x} y={88 - sp.y} w={stack.w} h={stack.h} cls="fly" />;
      })}
      {kids}
      {range(k).map((j) => <Badge key={"b" + j} x={kidX(j) + Math.min(colW * 0.32, 12)} y={76} text={per} tone="big" show={beat >= moveN} />)}
      {rem > 0 && <Badge x={50} y={9} text={`שארית ${rem}`} tone="good" show={playing && beat >= moveN} />}
    </>
  );
}

// חיבור: שתי קבוצות מתאחדות ונספרות
export function Add({ sc, playing, playKey }) {
  const { a, b, item } = sc;
  const n = a + b;
  const beat = useBeats(n + 1, n > 10 ? 240 : 400, playing, playKey);
  const merged = beat >= 1;
  const L = cellGrid(a, { x0: 2, y0: 6, x1: 44, y1: 80 }, 5);
  const R = cellGrid(b, { x0: 56, y0: 6, x1: 98, y1: 80 }, 5);
  const M = cellGrid(n, { x0: 2, y0: 4, x1: 98, y1: 80 }, 10);
  return (
    <>
      {range(n).map((i) => {
        const g = merged ? M : i < a ? L : R;
        const p = merged ? M.pos(i) : i < a ? L.pos(i) : R.pos(i - a);
        return <Spr key={i} e={item} x={p.x} y={p.y} w={g.w} h={g.h} cls={"fly" + (beat - 1 > i ? " counted" : "")} />;
      })}
      <Spr e="➕" x={50} y={43} w={9} h={18} cls={merged ? "gone" : "pop"} />
      <Badge x={23} y={91} text={a} show={!merged} tone="big" />
      <Badge x={77} y={91} text={b} show={!merged} tone="big" />
      <Badge x={50} y={91} text={Math.min(n, Math.max(0, beat - 1))} tone="big" show={merged} />
    </>
  );
}

// חיסור: חלק מהפריטים עפים / יוצאים, ונספר מה שנשאר
export function Sub({ sc, playing, playKey }) {
  const { a, b, item } = sc;
  const up = item === "🎈" || item === "🐦" || item === "🦋";
  const beat = useBeats(b + 1, 380, playing, playKey);
  const G = cellGrid(a, { x0: 2, y0: 4, x1: 98, y1: 80 }, 10);
  return (
    <>
      {range(a).map((i) => {
        const p = G.pos(i);
        const leaving = i >= a - b;
        const gone = leaving && a - 1 - i < beat;
        const x = gone && !up ? 118 : p.x;
        const y = gone && up ? -30 : p.y;
        return <Spr key={i} e={item} x={x} y={y} w={G.w} h={G.h} cls={"fly" + (leaving && !gone ? " marked" : "") + (gone ? " away" : "")} />;
      })}
      <Badge x={50} y={91} text={beat > b ? a - b : a} tone="big" />
    </>
  );
}

// כפל: קבוצות שוות, סופרים קבוצה אחרי קבוצה
export function Groups({ sc, playing, playKey }) {
  const { g, per, item } = sc;
  const beat = useBeats(g, 650, playing, playKey);
  const bw = 100 / g;
  const inner = cellGrid(per, { x0: 0, y0: 14, x1: bw * 0.8, y1: 78 }, 4);
  return (
    <>
      {range(g).map((j) => {
        const cx = (j + 0.5) * bw;
        return (
          <React.Fragment key={j}>
            <div className={"sbox" + (beat > j ? " lit" : "")} style={{ left: cx + "%", width: bw * 0.88 + "%" }} />
            {range(per).map((i) => {
              const p = inner.pos(i);
              return (
                <Spr key={i} e={item} x={cx - bw * 0.4 + p.x} y={p.y} w={inner.w} h={inner.h} cls="pop"
                  style={{ animationDelay: (j * per + i) * 35 + "ms" }} />
              );
            })}
            <Badge x={cx} y={91} text={per * (j + 1)} show={beat > j} tone="big" />
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
  const gw = 100 / parts;
  const all = cellGrid(n, { x0: 2, y0: 4, x1: 98, y1: 80 }, 10);
  const part = cellGrid(per, { x0: 0, y0: 6, x1: gw * 0.84, y1: 80 }, parts === 2 ? 5 : 3);
  return (
    <>
      {range(n).map((i) => {
        const grp = i % parts;
        if (!split) {
          const p = all.pos(i);
          return <Spr key={i} e={item} x={p.x} y={p.y} w={all.w} h={all.h} cls="fly" />;
        }
        const p = part.pos(Math.floor(i / parts));
        return (
          <Spr key={i} e={item} x={(grp + 0.5) * gw - gw * 0.42 + p.x} y={p.y} w={part.w} h={part.h}
            cls={"fly" + (grp > 0 ? " dim" : " counted")} />
        );
      })}
      {split && range(parts - 1).map((j) => <div key={j} className="sdiv" style={{ left: (j + 1) * gw + "%" }} />)}
      <Badge x={gw / 2} y={91} text={per} tone="big" show={beat >= 2} />
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
      <Spr key={pos} e="🐸" x={xOf(pos)} y={40} w={14} h={34} cls="hop" />
      <Badge x={50} y={10} text={"+" + (pos - from)} tone="big" show={beat > 0} />
    </>
  );
}
