// סצנות לעולם: רצף תמונות, ציר זמן (אנגלית), מילות מקום, הפכים, מסלול בחלל, מיון לקבוצות,
// תשובות מאוירות, קומיקס לקטע קריאה, עובדה עם תשובה נחשפת, פיצות-שברים, ספירה ותמונה אמיתית.
import React, { useState } from "react";
import { useBeats, Spr, Badge, range } from "./sceneKit.jsx";
import { PieSvg } from "./scenesMath2.jsx";

const spread = (i, n) => (n === 1 ? 50 : 12 + (i * 76) / (n - 1));

export function Seq({ sc, playing, playKey }) {
  const frames = sc.frames || [];
  const n = frames.length;
  const beat = useBeats(n, 950, playing, playKey, 200);
  const w = Math.min(84 / n, 34);
  return (
    <>
      {frames.map((f, i) => {
        const x = spread(i, n);
        const on = !playing || i < beat;
        return (
          <React.Fragment key={i}>
            {sc.arrows !== false && i > 0 && (
              <Spr e="➜" x={x - 38 / Math.max(1, n - 1)} y={40} w={6} h={12} cls={"arrow " + (on ? "pop" : "gone")} />
            )}
            <Spr e={f.e} x={x} y={40} w={w * 0.86} h={f.cap ? 54 : 66} cls={on ? "pop " + (f.anim || "") : "gone"} />
            {f.cap && <Badge x={x} y={86} text={f.cap} show={on} />}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ציר זמן: עבר ⏮️ · תמיד 🔁 · עתיד ⏭️ — הדמות עוברת לזמן של המשפט
const WHEN_X = { past: 20, always: 50, future: 80 };
export function Time({ sc, playing, playKey }) {
  const beat = useBeats(1, 700, playing, playKey);
  const at = beat >= 1 && sc.when ? WHEN_X[sc.when] : 50;
  const group = [sc.who, sc.act, sc.obj].filter(Boolean);
  return (
    <>
      <div className="sline low" />
      <Spr e="⏮️" x={12} y={84} w={9} h={16} cls={sc.when === "past" && beat ? "glow" : "dim"} />
      <Spr e="🔁" x={50} y={84} w={9} h={16} cls={sc.when === "always" && beat ? "glow spin" : "dim"} />
      <Spr e="⏭️" x={88} y={84} w={9} h={16} cls={sc.when === "future" && beat ? "glow" : "dim"} />
      {group.map((e, i) => (
        <Spr key={i} e={e} x={at + (i - (group.length - 1) / 2) * 17} y={38} w={i === 0 ? 20 : 16} h={i === 0 ? 50 : 40}
          cls={"fly " + (i === 1 ? "bob" : "pop")} />
      ))}
    </>
  );
}

// מילות מקום: in / on / under — החפץ זז למקום
const PLACE = {
  table: { on: { y: 45 }, in: { y: 45 }, under: { y: 80 } },
  thing: { on: { y: 24 }, in: { y: 58 }, under: { y: 88 } },
};
export function Place({ sc, playing, playKey }) {
  const order = sc.cycle ? ["in", "on", "under"] : [sc.where];
  const beat = useBeats(order.length, 1400, playing, playKey);
  const where = beat >= 1 ? order[Math.min(beat, order.length) - 1] : null;
  const table = sc.ref === "TABLE";
  const y = where ? PLACE[table ? "table" : "thing"][where].y : 40;
  const small = where === "in" && !table;
  return (
    <>
      {table ? <div className="stable" /> : <Spr e={sc.ref} x={50} y={57} w={32} h={56} cls={"ref" + (where === "in" ? " front" : "")} />}
      <Spr e={sc.thing} x={where ? 50 : 15} y={y} w={small ? 12 : 17} h={small ? 22 : 30} cls="fly" />
      <Badge x={where ? 80 : 15} y={where ? 12 : 16} text={where || "?"} tone="big" />
    </>
  );
}

// הפכים: שני הצדדים עם תנועה שממחישה את המילה
export function Pairs({ sc, playing, playKey }) {
  const pairs = sc.pairs || [];
  const beat = useBeats(3, 700, playing, playKey);
  const rows = pairs.length;
  return (
    <>
      {pairs.map(([e1, c1, e2, c2, kind], r) => {
        const y = rows === 1 ? 42 : 24 + (r * 50) / (rows - 1);
        const h = rows === 1 ? 62 : 36;
        const on = (k) => !playing || beat >= k;
        return (
          <React.Fragment key={r}>
            <Spr e={e1} x={22} y={y} w={30} h={h} cls={(on(1) ? "pop " : "gone ") + "k-" + kind + "-a"} />
            <Spr e="↔️" x={50} y={y} w={10} h={h * 0.4} cls={on(2) ? "pop" : "gone"} />
            <Spr e={e2} x={78} y={y} w={30} h={h} cls={(on(3) ? "pop " : "gone ") + "k-" + kind + "-b"} />
            <Badge x={22} y={rows === 1 ? 88 : y + 15} text={c1} show={on(1)} />
            <Badge x={78} y={rows === 1 ? 88 : y + 15} text={c2} show={on(3)} />
          </React.Fragment>
        );
      })}
    </>
  );
}

// חלל: שנה (הקפת השמש), יום ולילה (סיבוב), ירח שמחזיר אור
export function Orbit({ sc }) {
  const mode = sc.mode || "year";
  if (mode === "day") {
    return (
      <>
        <Spr e="☀️" x={13} y={45} w={22} h={44} cls="glow" />
        <div className="searth"><span className="spinme">🌍</span><span className="snight" /></div>
        <Badge x={40} y={90} text="☀️ יום" />
        <Badge x={82} y={90} text="🌙 לילה" />
      </>
    );
  }
  const center = mode === "moon" ? "🌍" : "☀️";
  const body = mode === "moon" ? "🌙" : "🌍";
  return (
    <>
      {mode === "moon" && <Spr e="☀️" x={9} y={18} w={14} h={26} cls="glow" />}
      <div className="sorbit-path" />
      <Spr e={center} x={50} y={47} w={20} h={36} cls={mode === "year" ? "glow" : ""} />
      <div className="sorbit"><span className="sorbit-body">{body}</span></div>
      <Badge x={50} y={93} text={mode === "year" ? "סיבוב אחד = שנה 🎆" : "הירח מחזיר את אור השמש 💡"} />
    </>
  );
}

// מיון: כל חיה עפה לקבוצה שלה
export function Sort({ sc, playing, playKey }) {
  const { bins = [], items = [] } = sc;
  const beat = useBeats(items.length, 700, playing, playKey);
  const binX = (b) => spread(b, bins.length);
  const inBin = {};
  return (
    <>
      {bins.map((b, i) => (
        <React.Fragment key={i}>
          <div className="sbin" style={{ left: binX(i) + "%", width: Math.min(88 / bins.length, 30) + "%" }} />
          <Badge x={binX(i)} y={94} text={b.cap} />
        </React.Fragment>
      ))}
      {items.map((it, i) => {
        const moved = playing && i < beat;
        const slot = moved ? (inBin[it.bin] = (inBin[it.bin] || 0) + 1) - 1 : 0;
        const binW = Math.min(88 / bins.length, 30);
        const x = moved ? binX(it.bin) + (slot % 2 ? binW * 0.22 : -binW * 0.22) : spread(i, items.length);
        const y = moved ? 72 - Math.floor(slot / 2) * 18 : 18;
        return <Spr key={i} e={it.e} x={x} y={y} w={Math.min(70 / items.length, 16)} h={28} cls="fly" />;
      })}
    </>
  );
}

// תשובות מאוירות: בפתרון — הנכונה קופצת, השאר מתעמעמות
export function Choices({ sc, playing, playKey }) {
  const beat = useBeats(1, 500, playing, playKey, 150);
  const n = sc.items.length;
  const w = Math.min(84 / n, 28);
  return (
    <>
      {sc.items.map((it, i) => {
        const x = spread(i, n);
        const cls = beat >= 1 ? (i === sc.answer ? "win" : "dim") : "pop";
        return (
          <React.Fragment key={i}>
            <Spr e={it.e} x={x} y={40} w={w * 0.9} h={56} cls={cls} style={{ animationDelay: i * 90 + "ms" }} />
            <Badge x={x} y={87} text={it.cap} tone={beat >= 1 && i === sc.answer ? "good" : ""} />
          </React.Fragment>
        );
      })}
    </>
  );
}

// קטע קריאה כקומיקס: חלונית לכל משפט; בפתרון מודגשת החלונית עם התשובה
export function Story({ sc, playing, playKey }) {
  const panels = sc.panels.slice(0, 4);
  const beat = useBeats(panels.length + 1, 900, playing, playKey, 150);
  const n = panels.length;
  return (
    <div className="sstory" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, "--n": n }}>
      {panels.map((p, i) => {
        const hasAns = sc.ans && p.includes(sc.ans);
        const on = !playing || i < beat;
        return (
          <div key={i} className={"spanel" + (on ? " on" : "") + (playing && beat > n && hasAns ? " win" : "")} style={{ "--m": p.length }}>
            {p.map((e, j) => (
              <span key={j} className={"spe" + (playing && beat > n && e === sc.ans ? " bounce" : "")}>{e}</span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// עובדה: מה שיש בשאלה + סימן שאלה שהופך לתשובה
export function Fact({ sc, playing, playKey }) {
  const beat = useBeats(1, 700, playing, playKey);
  const solved = beat >= 1;
  if (sc.tokens) {
    return (
      <>
        {sc.tokens.map((t, i) => {
          const blank = /_{2,}/.test(t);
          return <Badge key={i} x={spread(i, sc.tokens.length)} y={45} tone={"tile" + (blank && solved ? " good" : "")} text={blank ? (solved ? sc.answer : "?") : t} />;
        })}
      </>
    );
  }
  const n = sc.items.length;
  return (
    <>
      {sc.items.map((e, i) => (
        <Spr key={i} e={e} x={n === 1 ? 30 : 12 + (i * 44) / Math.max(1, n - 1)} y={40} w={Math.min(50 / n, 26)} h={58}
          cls="pop float" style={{ animationDelay: i * 120 + "ms" }} />
      ))}
      <Spr e={solved ? sc.ansE || "💡" : "❓"} x={80} y={38} w={26} h={56} cls={solved ? "win" : "bob"} key={solved ? "a" : "q"} />
      <Badge x={80} y={88} text={solved ? sc.answer : "?"} tone={solved ? "good" : ""} />
    </>
  );
}

export function Pies({ sc, playing, playKey }) {
  const beat = useBeats(1, 700, playing, playKey);
  const parts = sc.parts;
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p > 0 && (
            <div className={"spie xs" + (beat >= 1 ? (i === sc.answer ? " win" : " dim") : "")} style={{ left: spread(i, parts.length) + "%" }}>
              <PieSvg parts={p} take={1} />
            </div>
          )}
          <Badge x={spread(i, parts.length)} y={90} text={p ? `1/${p}` : "="} tone={beat >= 1 && i === sc.answer ? "good" : ""} />
        </React.Fragment>
      ))}
    </>
  );
}

export function Count({ sc, playing, playKey }) {
  const beat = useBeats(sc.n, 450, playing, playKey, 200);
  const w = Math.min(84 / sc.n, 24);
  return (
    <>
      {range(sc.n).map((i) => (
        <Spr key={i} e={sc.item} x={spread(i, sc.n)} y={40} w={w * 0.9} h={50} cls={!playing || i < beat ? "pop counted" : "gone"} />
      ))}
      <Badge x={50} y={88} text={playing ? Math.min(beat, sc.n) : sc.n} tone="big" />
    </>
  );
}

// תמונה אמיתית: זום איטי (קן ברנס) וכיתוב; אם התמונה לא נטענת — אימוג'י גדול במקומה
export function Photo({ sc }) {
  const [broken, setBroken] = useState(false);
  return (
    <>
      {broken ? (
        <Spr e={sc.fallback || "🖼️"} x={50} y={45} w={40} h={70} cls="pop float" />
      ) : (
        <img className="sphoto" src={sc.src} alt={sc.alt || ""} loading="lazy" onError={() => setBroken(true)} />
      )}
      {sc.cap && <Badge x={50} y={88} text={sc.cap} tone="tile" />}
    </>
  );
}
