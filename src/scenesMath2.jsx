// סצנות חשבון נוספות: מערך (כפל גדול), קוביות עשרוניות, פיצה-שבר, השוואת שברים, מסגרת עשר.
import React from "react";
import { useBeats, Spr, Badge, range } from "./sceneKit.jsx";

// כפל של מספרים גדולים: שורות של נקודות שנדלקות אחת אחרי השנייה
export function ArrayScene({ sc, playing, playKey }) {
  const { rows, cols } = sc;
  const beat = useBeats(rows, Math.max(140, 2600 / rows), playing, playKey);
  if (rows * cols > 400) {
    return (
      <>
        <div className={"srect" + (beat >= rows ? " lit" : "")}>
          <span className="srect-w">{cols}</span>
          <span className="srect-h">{rows}</span>
        </div>
        <Badge x={50} y={90} text={rows * cols} tone="big" show={beat >= rows} />
      </>
    );
  }
  return (
    <>
      <div className="sarray" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, aspectRatio: `${cols} / ${rows}` }}>
        {range(rows * cols).map((i) => (
          <span key={i} className={"sdot" + (Math.floor(i / cols) < beat ? " lit" : "")} />
        ))}
      </div>
      <Badge x={50} y={92} text={beat ? `${Math.min(beat, rows)} × ${cols} = ${Math.min(beat, rows) * cols}` : `${rows} × ${cols}`} tone="big" />
    </>
  );
}

// מספר כקוביות: מאות (לוח), עשרות (מקל), יחידות (קובייה)
function BlockNum({ n, x, lit }) {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  return (
    <div className={"sblocks" + (lit ? " lit" : "")} style={{ left: x + "%" }}>
      <div className="sbrow">
        {range(h).map((i) => <span key={"h" + i} className="b100" />)}
        {range(t).map((i) => <span key={"t" + i} className="b10" />)}
        <span className="b1s">{range(o).map((i) => <span key={"o" + i} className="b1" />)}</span>
      </div>
      <div className="sbnum">{n}</div>
    </div>
  );
}

export function Blocks({ sc, playing, playKey }) {
  const { a, b, op } = sc;
  const beat = useBeats(1, 1100, playing, playKey);
  if (beat < 1) {
    return (
      <>
        <BlockNum n={a} x={26} />
        <Spr e={op === "+" ? "➕" : "➖"} x={52} y={40} s={0.7} cls="pop" />
        <BlockNum n={b} x={76} />
      </>
    );
  }
  return <BlockNum n={op === "+" ? a + b : a - b} x={50} lit />;
}

// פיצה חתוכה לחלקים; החלקים שלוקחים יוצאים החוצה
export function PieSvg({ parts, take }) {
  const R = 44;
  const slices = range(parts).map((i) => {
    const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
    const mid = (a0 + a1) / 2;
    const out = i < take ? 6 : 0;
    const dx = Math.cos(mid) * out;
    const dy = Math.sin(mid) * out;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const d =
      parts === 1
        ? `M50 ${50 - R} A${R} ${R} 0 1 1 49.99 ${50 - R} Z`
        : `M50 50 L${50 + R * Math.cos(a0)} ${50 + R * Math.sin(a0)} A${R} ${R} 0 ${large} 1 ${50 + R * Math.cos(a1)} ${50 + R * Math.sin(a1)} Z`;
    return <path key={i} d={d} className={"slice" + (i < take ? " taken" : "")} style={{ transform: `translate(${dx}px, ${dy}px)` }} />;
  });
  return <svg viewBox="0 0 100 100" className="piesvg">{slices}</svg>;
}

export function Frac({ sc, playing, playKey }) {
  const beat = useBeats(2, 850, playing, playKey);
  return (
    <>
      <div className="spie" style={{ left: "50%" }}>
        <PieSvg parts={sc.parts} take={beat >= 1 ? sc.take : 0} />
      </div>
      <Badge x={50} y={93} text={`${sc.take}/${sc.parts}`} tone="big" show={beat >= 2} />
    </>
  );
}

// השוואה: ½ מול ¼ — מחלקים ליותר חלקים, כל חלק קטן יותר
export function Compare({ sc, playing, playKey }) {
  const { left = 2, right = 4 } = sc;
  const beat = useBeats(2, 900, playing, playKey);
  return (
    <>
      <div className="spie sm" style={{ left: "25%" }}><PieSvg parts={left} take={beat >= 1 ? 1 : 0} /></div>
      <div className="spie sm" style={{ left: "75%" }}><PieSvg parts={right} take={beat >= 1 ? 1 : 0} /></div>
      <Badge x={25} y={92} text={`1/${left}`} />
      <Badge x={75} y={92} text={`1/${right}`} />
      <Spr e={left < right ? "▶️" : "◀️"} x={50} y={45} s={0.8} cls={beat >= 2 ? "pop" : "gone"} />
    </>
  );
}

// הטריק של העשר: משלימים את המסגרת ל-10, והשאר עובר למסגרת הבאה
export function Ten({ sc, playing, playKey }) {
  const { a, b } = sc;
  const beat = useBeats(b + 1, 430, playing, playKey);
  const fill = Math.min(b, 10 - a);
  const cell = (frame, i) => ({ x: (frame ? 58 : 8) + (i % 5) * 7.6 + 3.8, y: 36 + Math.floor(i / 5) * 24 });
  const dots = [];
  range(a).forEach((i) => dots.push({ key: "a" + i, frame: 0, i, cls: "da" }));
  range(b).forEach((j) => {
    const inFirst = j < fill;
    dots.push({ key: "b" + j, frame: inFirst ? 0 : 1, i: inFirst ? a + j : j - fill, cls: "db" + (j < beat ? " on" : "") });
  });
  return (
    <>
      <div className="stenframe" style={{ left: "27%" }} />
      <div className="stenframe" style={{ left: "77%" }} />
      {dots.map((d) => {
        const p = cell(d.frame, d.i);
        return <span key={d.key} className={"sten " + d.cls} style={{ left: p.x + "%", top: p.y + "%" }} />;
      })}
      <Badge x={27} y={8} text={Math.min(10, a + Math.min(beat, fill))} show />
      <Badge x={77} y={8} text={Math.max(0, beat - fill)} show={beat > fill} />
      <Badge x={50} y={93} text={`${a} + ${b} = 10 + ${b - fill} = ${a + b}`} tone="big" show={beat > b} />
    </>
  );
}
