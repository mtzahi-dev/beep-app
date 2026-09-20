// סצנות חשבון לכיתות הגבוהות — ממחישות את השיטה, לא רק את התשובה:
// ערך המקום, חיבור/חיסור במאונך, מלבן (היקף/שטח/משולש), מודל השטח לכפל, פס שברים, ישר המספרים,
// מאזניים למשוואות, שלבי פתרון, זוויות ומשולשים, גרף עמודות, שקית פריטים, פס יחס, חילוק ארוך וגרף קווי.
import React from "react";
import { useBeats, Spr, Badge, cellGrid, range } from "./sceneKit.jsx";
import { BlockNum } from "./scenesMath2.jsx";

const V = 56.25; // גובה ה-viewBox כשהרוחב 100 (במה 16:9)
const pctY = (vy) => (vy / V) * 100;
const minus = (v) => String(+(+v).toFixed(2)).replace("-", "−");

export function PlaceValue({ sc }) {
  return <BlockNum n={sc.n} x={50} lit />;
}

// ---------- חיבור / חיסור במאונך (גם עשרוניים) ----------
const decimalsOf = (v) => (String(v).split(".")[1] || "").length;

export function Column({ sc, playing, playKey }) {
  const add = sc.op === "+";
  const d = Math.max(decimalsOf(sc.a), decimalsOf(sc.b));
  const A = Math.round(parseFloat(sc.a) * 10 ** d);
  const B = Math.round(parseFloat(sc.b) * 10 ** d);
  const R = add ? A + B : A - B;
  const n = Math.max(String(A).length, String(B).length, String(R).length, d + 1);
  const dig = (v, i) => +String(v).padStart(n, "0")[n - 1 - i];
  const shows = (v, i) => i < Math.max(String(v).length, d + 1);
  const mark = [];
  let c = 0;
  for (let i = 0; i < n; i++) {
    if (add) {
      const s = dig(A, i) + dig(B, i) + c;
      c = s >= 10 ? 1 : 0;
    } else {
      const top = dig(A, i) - c;
      c = top < dig(B, i) ? 1 : 0;
    }
    mark[i + 1] = c;
  }
  const beat = useBeats(n, 900, playing, playKey);
  const cw = Math.min(13, 70 / (n + 1));
  const x = (i) => 54 + ((n - 1) / 2 - i) * cw;
  const cell = (key, text, left, top, cls = "") => (
    <span key={key} className={"sdigit " + cls} style={{ left: left + "%", top: top + "%" }}>{text}</span>
  );
  const dot = d > 0 ? x(d - 1) - cw / 2 : null;
  return (
    <>
      {playing && beat > 0 && beat <= n && <div className="scolhl" style={{ left: x(beat - 1) + "%", width: cw + "%" }} />}
      {range(n).map((i) => (shows(A, i) ? cell("a" + i, dig(A, i), x(i), 34) : null))}
      {range(n).map((i) => (shows(B, i) ? cell("b" + i, dig(B, i), x(i), 55) : null))}
      {cell("op", add ? "+" : "−", x(n - 1) - cw, 55, "op")}
      <div className="sruler" style={{ left: x(n - 1) - cw * 1.5 + "%", width: (n + 1) * cw + "%" }} />
      {range(n).map((i) => (playing && mark[i + 1] && i + 1 < n && beat > i ? cell("c" + i, add ? "1" : "−1", x(i + 1), 13, "carry") : null))}
      {range(n).map((i) => (playing && beat > i && shows(R, i) ? cell("r" + i, dig(R, i), x(i), 83, "res") : null))}
      {dot != null && cell("d1", ".", dot, 34, "dot")}
      {dot != null && cell("d2", ".", dot, 55, "dot")}
      {dot != null && playing && beat >= d && cell("d3", ".", dot, 83, "dot res")}
    </>
  );
}

// ---------- מלבן: היקף, שטח, שטח משולש ----------
export function Rect({ sc, playing, playKey }) {
  const { w, h, mode = "area" } = sc;
  const total = mode === "area" ? h : mode === "per" ? 4 : 1;
  const beat = useBeats(total, mode === "area" ? Math.max(180, 1500 / h) : 650, playing, playKey);
  const u = Math.min(68 / w, (V * 0.62) / h);
  const W = w * u, H = h * u;
  const x0 = 50 - W / 2, y0 = V * 0.48 - H / 2;
  const sides = [[x0, y0, x0 + W, y0], [x0 + W, y0, x0 + W, y0 + H], [x0 + W, y0 + H, x0, y0 + H], [x0, y0 + H, x0, y0]];
  const apex = x0 + W * 0.35;
  return (
    <>
      <svg className="sfill" viewBox={`0 0 100 ${V}`} preserveAspectRatio="xMidYMid meet">
        {mode === "area" && range(h).map((r) => range(w).map((cc) => (
          <rect key={r + "-" + cc} x={x0 + cc * u} y={y0 + r * u} width={u} height={u} className={"scell" + (playing && r < beat ? " lit" : "")} />
        )))}
        {mode === "tri" ? (
          <>
            <rect x={x0} y={y0} width={W} height={H} className="srect-out" />
            <polygon points={`${x0},${y0 + H} ${x0 + W},${y0 + H} ${apex},${y0}`} className={"stri" + (playing && beat >= 1 ? " lit" : "")} />
            <line x1={apex} y1={y0} x2={apex} y2={y0 + H} className="sheight" />
          </>
        ) : (
          <rect x={x0} y={y0} width={W} height={H} className="srect-line" />
        )}
        {mode === "per" && sides.map((s, i) => (
          <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} className={"sside" + (playing && i < beat ? " lit" : "")} />
        ))}
      </svg>
      <Badge x={50} y={pctY(y0 + H) + 8} text={w} />
      <Badge x={Math.min(94, x0 + W + 6)} y={48} text={h} />
    </>
  );
}

// ---------- מודל השטח לכפל: (עשרות + יחידות) × ... ----------
const splitTens = (n) => [n - (n % 10), n % 10].filter((v) => v > 0);

export function AreaModel({ sc, playing, playKey }) {
  const A = splitTens(sc.a);
  const B = sc.b >= 10 ? splitTens(sc.b) : [sc.b];
  const cells = [];
  A.forEach((av, i) => B.forEach((bv, j) => cells.push({ i, j, av, bv })));
  const beat = useBeats(cells.length + 1, 950, playing, playKey);
  const wts = A.map((v) => Math.max(0.45, Math.sqrt(v)));
  const hts = B.map((v) => Math.max(0.45, Math.sqrt(v)));
  const sw = wts.reduce((a, b) => a + b, 0), sh = hts.reduce((a, b) => a + b, 0);
  const W = 66, H = V * 0.58, x0 = 54 - W / 2, y0 = V * 0.16;
  const xs = [x0];
  wts.forEach((v) => xs.push(xs[xs.length - 1] + (v / sw) * W));
  const ys = [y0];
  hts.forEach((v) => ys.push(ys[ys.length - 1] + (v / sh) * H));
  return (
    <>
      <svg className="sfill" viewBox={`0 0 100 ${V}`}>
        {cells.map((c, k) => (
          <rect key={k} x={xs[c.i]} y={ys[c.j]} width={xs[c.i + 1] - xs[c.i]} height={ys[c.j + 1] - ys[c.j]}
            className={"sarea a" + ((c.i + c.j) % 2) + (playing && k < beat ? " lit" : "")} />
        ))}
      </svg>
      {A.map((v, i) => <Badge key={"a" + i} x={(xs[i] + xs[i + 1]) / 2} y={pctY(y0) - 8} text={v} />)}
      {B.map((v, j) => <Badge key={"b" + j} x={x0 - 7} y={pctY((ys[j] + ys[j + 1]) / 2)} text={v} />)}
      {cells.map((c, k) => (
        <span key={"p" + k} className={"sdigit small" + (playing && k < beat ? "" : " hidden")}
          style={{ left: (xs[c.i] + xs[c.i + 1]) / 2 + "%", top: pctY((ys[c.j] + ys[c.j + 1]) / 2) + "%" }}>
          {`${c.av}×${c.bv}=${c.av * c.bv}`}
        </span>
      ))}
      <Badge x={54} y={92} tone="big" show={playing && beat > cells.length}
        text={`${cells.map((c) => c.av * c.bv).join(" + ")} = ${sc.a * sc.b}`} />
    </>
  );
}

// ---------- פס שברים ----------
export function FracBar({ sc, playing, playKey }) {
  const { den, a, b = 0, den2, label } = sc;
  const beat = useBeats(2, 950, playing, playKey);
  const bar = (top, parts, on, on2, key) => (
    <div key={key} className="sbar" style={{ top: top + "%", gridTemplateColumns: `repeat(${parts}, 1fr)` }}>
      {range(parts).map((i) => <span key={i} className={"sbarcell" + (i < on ? " on" : i < on + on2 ? " on2" : "")} />)}
    </div>
  );
  const setupText = b ? `${a}/${den} + ${b}/${den}` : `${a}/${den}`;
  const solvedText = label || (den2 ? `${a}/${den} = ${(a * den2) / den}/${den2}` : b ? `${a}/${den} + ${b}/${den} = ${a + b}/${den}` : `${a}/${den}`);
  return (
    <>
      {bar(den2 ? 16 : 30, den, a, playing && beat >= 1 ? b : 0, "t")}
      {den2 && bar(50, den2, playing && beat >= 1 ? (a * den2) / den : 0, 0, "b")}
      <Badge x={50} y={88} tone={playing && beat >= 2 ? "big" : ""} text={playing && beat >= 2 ? solvedText : setupText} />
    </>
  );
}

// ---------- ישר המספרים (שליליים ועשרוניים) ----------
export function NumLine({ sc, playing, playKey }) {
  const { min, max, marks = [], hop } = sc;
  const span = max - min || 1;
  const step = sc.step || (span <= 1.01 ? 0.1 : span <= 24 ? 1 : span <= 60 ? 5 : 10);
  const xOf = (v) => 6 + ((v - min) / span) * 88;
  const ticks = [];
  for (let v = min; v <= max + 1e-9; v = +(v + step).toFixed(4)) ticks.push(v);
  const every = ticks.length > 14 ? 2 : 1;
  const dist = hop ? Math.abs(hop.to - hop.from) : 0;
  const unit = dist > 12 ? Math.ceil(dist / 12) : 1;
  const beat = useBeats(hop ? Math.ceil(dist / unit) : marks.length ? 1 : 0, 520, playing, playKey);
  const dir = hop && hop.to < hop.from ? -1 : 1;
  const pos = hop ? hop.from + dir * Math.min(dist, (playing ? beat : 0) * unit) : null;
  return (
    <>
      <div className="sline" />
      {ticks.map((v, i) => (
        <span key={v} className={"stick" + (Math.abs(v) < 1e-9 ? " zero" : "")} style={{ left: xOf(v) + "%" }}>
          {i % every === 0 || Math.abs(v) < 1e-9 ? minus(v) : ""}
        </span>
      ))}
      {marks.map((m, i) => (
        <Spr key={"m" + i} e="📍" x={xOf(m.v)} y={44} w={8} h={22} cls={playing && beat >= 1 ? (m.good ? "win" : "dim") : "pop"} />
      ))}
      {hop && <Spr key={"f" + pos} e="🐸" x={xOf(pos)} y={42} w={11} h={30} cls="hop" />}
      {hop && <Badge x={50} y={10} tone="big" show={playing && beat > 0} text={(dir > 0 ? "+" : "−") + Math.abs(pos - hop.from)} />}
    </>
  );
}

// ---------- מאזניים: פותרים משוואה כמו מאזן ----------
export function Balance({ sc, playing, playKey }) {
  const { lx = 1, ln = 0, rn, x } = sc;
  const states = [{ xs: lx, n: ln, r: rn, note: "" }];
  if (ln) states.push({ xs: lx, n: 0, r: rn - ln, note: `מורידים ${ln} משני הצדדים` });
  if (lx > 1) states.push({ xs: 1, n: 0, r: (rn - ln) / lx, note: `מחלקים ב-${lx} את שני הצדדים` });
  const beat = useBeats(states.length, 1400, playing, playKey);
  const s = states[Math.min(playing ? beat : 0, states.length - 1)];
  const tiles = cellGrid(s.xs + (s.n ? 1 : 0), { x0: 10, y0: 28, x1: 44, y1: 62 }, 4);
  return (
    <>
      <svg className="sfill" viewBox={`0 0 100 ${V}`}>
        <polygon points={`50,${V * 0.71} 45,${V * 0.9} 55,${V * 0.9}`} className="sfulcrum" />
        <line x1="12" y1={V * 0.71} x2="88" y2={V * 0.71} className="sbeam" />
        <path d={`M8 ${V * 0.66} Q27 ${V * 0.76} 46 ${V * 0.66}`} className="span" />
        <path d={`M54 ${V * 0.66} Q73 ${V * 0.76} 92 ${V * 0.66}`} className="span" />
      </svg>
      {range(s.xs).map((i) => {
        const p = tiles.pos(i);
        return <span key={"x" + i} className="stile x" style={{ left: p.x + "%", top: p.y + "%" }}>x</span>;
      })}
      {s.n ? (() => {
        const p = tiles.pos(s.xs);
        return <span key="n" className="stile n" style={{ left: p.x + "%", top: p.y + "%" }}>{s.n}</span>;
      })() : null}
      <span className="stile n big" style={{ left: "73%", top: "47%" }}>{s.r}</span>
      {s.note && <Badge x={50} y={9} text={s.note} />}
      <Badge x={50} y={95} text={`x = ${x}`} tone="big" show={playing && beat >= states.length} />
    </>
  );
}

// ---------- שלבי פתרון ----------
export function Steps({ sc, playing, playKey }) {
  const lines = (sc.lines || []).slice(0, 5);
  const n = lines.length;
  const beat = useBeats(Math.max(0, n - 1), 1050, playing, playKey);
  const shown = playing ? beat + 1 : 1;
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className={"sstep" + (i < shown ? " on" : "") + (i === shown - 1 ? " cur" : "")}
          style={{ top: (n === 1 ? 46 : 14 + (i * 72) / (n - 1)) + "%" }}>
          {i > 0 && !/^[=≈]/.test(l) ? "= " : ""}{l}
        </span>
      ))}
    </>
  );
}

// ---------- זוויות ומשולשים ----------
const rad = (deg) => (deg * Math.PI) / 180;
const arcPath = (vx, vy, r, a0, a1) => {
  const p0 = [vx + r * Math.cos(rad(a0)), vy - r * Math.sin(rad(a0))];
  const p1 = [vx + r * Math.cos(rad(a1)), vy - r * Math.sin(rad(a1))];
  return `M${p0[0]} ${p0[1]} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${p1[0]} ${p1[1]}`;
};

export function Angle({ sc, playing, playKey }) {
  const beat = useBeats(1, 900, playing, playKey);
  const solved = playing && beat >= 1;
  if (sc.mode === "one" || sc.mode === "line") {
    const vx = sc.mode === "one" ? 34 : 50, vy = V * 0.74, L = sc.mode === "one" ? 44 : 38;
    const A = sc.A;
    const end = [vx + L * Math.cos(rad(A)), vy - L * Math.sin(rad(A))];
    return (
      <>
        <svg className="sfill" viewBox={`0 0 100 ${V}`}>
          {sc.mode === "line" && <line x1="8" y1={vy} x2="92" y2={vy} className="sray" />}
          {sc.mode === "one" && <line x1={vx} y1={vy} x2={vx + L} y2={vy} className="sray" />}
          <line x1={vx} y1={vy} x2={end[0]} y2={end[1]} className="sray" />
          <path d={arcPath(vx, vy, 9, 0, A)} className="sarc" />
          {sc.mode === "line" && <path d={arcPath(vx, vy, 13, A, 180)} className={"sarc b" + (solved ? " lit" : "")} />}
        </svg>
        <Badge x={vx + 15 * Math.cos(rad(A / 2))} y={pctY(vy - 15 * Math.sin(rad(A / 2)))} text={`${A}°`} />
        {sc.mode === "line" && (
          <Badge x={vx + 19 * Math.cos(rad((A + 180) / 2))} y={pctY(vy - 19 * Math.sin(rad((A + 180) / 2)))} tone={solved ? "good" : ""} text={solved ? `${sc.B}°` : "?"} />
        )}
        {sc.mode === "one" && solved && <Badge x={50} y={92} tone="big" text={A < 90 ? "חדה" : A === 90 ? "ישרה" : A < 180 ? "קהה" : "שטוחה"} />}
      </>
    );
  }
  // משולש: לפי זוויות (tri) או ישר זווית לפי צלעות (right)
  let P;
  if (sc.mode === "right") {
    P = [[0, 0], [sc.a, 0], [0, sc.b]];
  } else {
    const la = Math.sin(rad(sc.B)) / Math.sin(rad(sc.C));
    P = [[0, 0], [1, 0], [la * Math.cos(rad(sc.A)), la * Math.sin(rad(sc.A))]];
  }
  const xsP = P.map((p) => p[0]), ysP = P.map((p) => p[1]);
  const minX = Math.min(...xsP), maxX = Math.max(...xsP), maxY = Math.max(...ysP);
  const k = Math.min(70 / (maxX - minX || 1), (V * 0.66) / (maxY || 1));
  const T = P.map(([px, py]) => [50 - ((maxX - minX) * k) / 2 + (px - minX) * k, V * 0.84 - py * k]);
  const pts = T.map((p) => p.join(",")).join(" ");
  const cx = (T[0][0] + T[1][0] + T[2][0]) / 3, cy = (T[0][1] + T[1][1] + T[2][1]) / 3;
  const toward = (p, f = 0.28) => [p[0] + (cx - p[0]) * f, p[1] + (cy - p[1]) * f];
  if (sc.mode === "right") {
    const mid = (i, j) => [(T[i][0] + T[j][0]) / 2, (T[i][1] + T[j][1]) / 2];
    const label = (key, val) => (sc.missing === key ? (solved ? val : "?") : val);
    return (
      <>
        <svg className="sfill" viewBox={`0 0 100 ${V}`}>
          <polygon points={pts} className="stri-shape" />
          <path d={`M${T[0][0] + 4} ${T[0][1]} v-4 h-4`} className="sray thin" />
        </svg>
        <Badge x={mid(0, 1)[0]} y={pctY(mid(0, 1)[1]) + 8} text={label("a", sc.a)} tone={sc.missing === "a" && solved ? "good" : ""} />
        <Badge x={mid(0, 2)[0] - 6} y={pctY(mid(0, 2)[1])} text={label("b", sc.b)} tone={sc.missing === "b" && solved ? "good" : ""} />
        <Badge x={mid(1, 2)[0] + 7} y={pctY(mid(1, 2)[1]) - 6} text={label("c", sc.c)} tone={sc.missing === "c" && solved ? "good" : ""} />
        {solved && <Badge x={50} y={8} tone="big" text={`${sc.a}² + ${sc.b}² = ${sc.c}²`} />}
      </>
    );
  }
  const labels = [`${sc.A}°`, `${sc.B}°`, solved ? `${sc.C}°` : "?"];
  return (
    <>
      <svg className="sfill" viewBox={`0 0 100 ${V}`}>
        <polygon points={pts} className="stri-shape" />
      </svg>
      {T.map((p, i) => {
        const [lx, ly] = toward(p, 0.3);
        return <Badge key={i} x={lx} y={pctY(ly)} text={labels[i]} tone={i === 2 && solved ? "good" : ""} />;
      })}
      {solved && <Badge x={50} y={8} tone="big" text={`${sc.A} + ${sc.B} + ${sc.C} = 180`} />}
    </>
  );
}

// ---------- גרף עמודות + קו ממוצע ----------
export function Bars({ sc, playing, playKey }) {
  const { vals, avg } = sc;
  const n = vals.length;
  const mx = Math.max(...vals) * 1.18;
  const beat = useBeats(1, 900, playing, playKey);
  const bw = 72 / n;
  const hOf = (v) => (v / mx) * 66;
  return (
    <>
      {vals.map((v, i) => {
        const x = 14 + (i + 0.5) * bw;
        return (
          <React.Fragment key={i}>
            <div className="sbarv" style={{ left: x + "%", width: bw * 0.6 + "%", height: hOf(v) + "%" }} />
            <span className="sdigit small" style={{ left: x + "%", top: 82 - hOf(v) - 6 + "%" }}>{v}</span>
          </React.Fragment>
        );
      })}
      {avg != null && <div className={"savg" + (playing && beat >= 1 ? " on" : "")} style={{ top: 82 - hOf(avg) + "%" }} />}
      {avg != null && <Badge x={92} y={82 - hOf(avg)} text={avg} tone="big" show={playing && beat >= 1} />}
    </>
  );
}

// ---------- שקית פריטים (הסתברות) ----------
export function Items({ sc, playing, playKey }) {
  const beat = useBeats(1, 800, playing, playKey);
  const G = cellGrid(sc.items.length, { x0: 8, y0: 8, x1: 92, y1: 86 }, 8);
  return (
    <>
      {sc.items.map((e, i) => {
        const p = G.pos(i);
        const cls = playing && beat >= 1 ? (e === sc.hl ? "counted" : "dim") : "pop";
        return <Spr key={i} e={e} x={p.x} y={p.y} w={G.w} h={G.h} cls={cls} style={{ animationDelay: i * 40 + "ms" }} />;
      })}
    </>
  );
}

// ---------- פס יחס ----------
export function RatioBar({ sc, playing, playKey }) {
  const { a, b, unit } = sc;
  const n = a + b;
  const beat = useBeats(2, 1000, playing, playKey);
  const cw = Math.min(12, 84 / n);
  const x0 = 50 - (n * cw) / 2;
  return (
    <>
      {range(n).map((i) => (
        <span key={i} className={"sunit " + (i < a ? "ua" : "ub")} style={{ left: x0 + (i + 0.5) * cw + "%", width: cw * 0.9 + "%" }}>
          {playing && beat >= 1 ? unit : ""}
        </span>
      ))}
      <Badge x={x0 + (a * cw) / 2} y={16} tone="big" text={playing && beat >= 2 ? `${a} × ${unit} = ${a * unit}` : a} />
      <Badge x={x0 + a * cw + (b * cw) / 2} y={84} text={playing && beat >= 2 ? `${b} × ${unit} = ${b * unit}` : b} />
    </>
  );
}

// ---------- חילוק ארוך ----------
export function LongDiv({ sc, playing, playKey }) {
  const { n, k } = sc;
  const ds = String(n).split("");
  const steps = [];
  let cur = 0;
  ds.forEach((dch) => {
    cur = cur * 10 + +dch;
    const t = Math.floor(cur / k);
    steps.push({ cur, t, rem: cur - t * k });
    cur -= t * k;
  });
  const lead = Math.max(0, steps.findIndex((s) => s.t > 0));
  const beat = useBeats(ds.length, 1050, playing, playKey);
  const shown = playing ? beat : 0;
  const cw = Math.min(11, 62 / (ds.length + 2));
  const x0 = 50 - ((ds.length + 1.6) * cw) / 2;
  const colX = (i) => x0 + (1.6 + i + 0.5) * cw;
  const now = steps[Math.min(Math.max(shown - 1, 0), steps.length - 1)];
  return (
    <>
      <span className="sdigit" style={{ left: x0 + cw * 0.55 + "%", top: "52%" }}>{k}</span>
      <div className="sldiv" style={{ left: x0 + cw * 1.2 + "%", width: ds.length * cw + cw * 0.4 + "%" }} />
      {ds.map((dch, i) => (
        <span key={"n" + i} className={"sdigit" + (playing && shown - 1 === i ? " cur" : "")} style={{ left: colX(i) + "%", top: "52%" }}>{dch}</span>
      ))}
      {steps.map((s, i) => (i >= lead && i < shown ? (
        <span key={"q" + i} className="sdigit res" style={{ left: colX(i) + "%", top: "22%" }}>{s.t}</span>
      ) : null))}
      {playing && shown > 0 && (
        <Badge x={50} y={88} text={`${now.cur} ÷ ${k} = ${now.t}${now.rem ? `, נשאר ${now.rem}` : ""}`} />
      )}
    </>
  );
}

// ---------- גרף של פונקציה קווית ----------
export function Graph({ sc, playing, playKey }) {
  const { m, b, x, pts } = sc;
  const beat = useBeats(1, 900, playing, playKey);
  const need = Math.max(5, Math.abs(b) + 1, ...(pts || []).map((p) => Math.abs(p[1]) + 1), x != null ? Math.abs(m * x + b) + 1 : 0);
  const S = Math.min(14, Math.ceil(need));
  const grid = S > 8 ? 2 : 1;
  const X = (v) => 50 + v * (38 / S);
  const Yv = (v) => V / 2 - v * ((V * 0.42) / S);
  const lineP = [];
  for (let xx = -S; xx <= S; xx += 0.1) {
    const yy = m * xx + b;
    if (yy >= -S && yy <= S) lineP.push([xx, yy]);
  }
  const d = lineP.length > 1 ? `M${X(lineP[0][0])} ${Yv(lineP[0][1])} L${X(lineP[lineP.length - 1][0])} ${Yv(lineP[lineP.length - 1][1])}` : "";
  const gl = [];
  for (let v = -S; v <= S; v += grid) gl.push(v);
  const yx = x != null ? m * x + b : null;
  return (
    <>
      <svg className="sfill" viewBox={`0 0 100 ${V}`}>
        {gl.map((v) => <line key={"gx" + v} x1={X(v)} y1={Yv(-S)} x2={X(v)} y2={Yv(S)} className="sgrid" />)}
        {gl.map((v) => <line key={"gy" + v} x1={X(-S)} y1={Yv(v)} x2={X(S)} y2={Yv(v)} className="sgrid" />)}
        <line x1={X(-S)} y1={Yv(0)} x2={X(S)} y2={Yv(0)} className="saxis" />
        <line x1={X(0)} y1={Yv(-S)} x2={X(0)} y2={Yv(S)} className="saxis" />
        {/* ה-x שעליו שואלים מסומן כבר בשאלה, כדי שהציור יתחבר לתרגיל */}
        {x != null && <line x1={X(x)} y1={Yv(-S)} x2={X(x)} y2={Yv(S)} className="sgrid ask" />}
        {d && <path d={d} className={"sgline" + (playing ? " draw" : "")} />}
        {(pts || []).map(([px, py], i) => <circle key={i} cx={X(px)} cy={Yv(py)} r="1.3" className="spt" />)}
        {yx != null && playing && beat >= 1 && Math.abs(yx) <= S && <circle cx={X(x)} cy={Yv(yx)} r="1.9" className="spt good" />}
      </svg>
      {x != null && <Badge x={Math.min(92, Math.max(8, X(x)))} y={Math.min(93, pctY(Yv(0)) + 9)} text={`x = ${x}`} />}
      {yx != null && playing && beat >= 1 && Math.abs(yx) <= S && (
        <Badge x={Math.min(90, X(x) + 9)} y={pctY(Yv(yx)) - 9} tone="good" text={`(${x}, ${minus(yx)})`} />
      )}
    </>
  );
}
