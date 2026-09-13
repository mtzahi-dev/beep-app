// במה לסצנות מונפשות + חלון אנימציה על כל המסך
import React, { useEffect, useState } from "react";
import "./scenes.css";
import { Share, Add, Sub, Groups, FracOf, Hops } from "./scenesMath.jsx";
import { ArrayScene, Blocks, Frac, Compare, Ten } from "./scenesMath2.jsx";
import { Seq, Time, Place, Pairs, Orbit, Sort, Choices, Story, Fact, Pies, Count, Photo } from "./scenesWorld.jsx";
import { PlaceValue, Column, Rect, AreaModel, FracBar, NumLine, Balance, Steps, Angle, Bars, Items, RatioBar, LongDiv, Graph } from "./scenesMath3.jsx";

export { sceneFor } from "./sceneSpecs.js";
export { registerWords } from "./sceneLexicon.js";

const TYPES = {
  share: Share, add: Add, sub: Sub, groups: Groups, fracOf: FracOf, hops: Hops,
  array: ArrayScene, blocks: Blocks, frac: Frac, compare: Compare, ten: Ten,
  seq: Seq, time: Time, place: Place, pairs: Pairs, orbit: Orbit, sort: Sort,
  choices: Choices, story: Story, fact: Fact, pies: Pies, count: Count, photo: Photo,
  placevalue: PlaceValue, column: Column, rect: Rect, area: AreaModel, fracbar: FracBar, numline: NumLine,
  balance: Balance, steps: Steps, angle: Angle, bars: Bars, items: Items, ratio: RatioBar, longdiv: LongDiv, graph: Graph,
};

export const SCENE_TYPES = Object.keys(TYPES);

// playing=false → מצב פתיחה (הנתונים בלבד); playing=true → האנימציה רצה עד הפתרון
export function Scene({ sc, playing = false, playKey = 0, size = "card", onClick }) {
  const C = sc && TYPES[sc.type];
  if (!C) return null;
  return (
    <div className={"stage " + size + (onClick ? " tappable" : "")} dir="ltr" onClick={onClick} aria-hidden="true">
      <C sc={sc} playing={playing} playKey={playKey} />
      {playing && sc.eq && <div className="scap" key={playKey}>{sc.eq}</div>}
    </div>
  );
}

export function SceneOverlay({ sc, title, onClose, onReplay }) {
  const [key, setKey] = useState(0);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="scene-ov" role="dialog" aria-label={title || "אנימציה"}>
      <div className="scene-ov-card">
        {title && <div className="scene-ov-title">{title}</div>}
        <Scene sc={sc} playing playKey={key} size="big" />
        <div className="scene-ov-btns">
          <button className="scene-btn ghost" onClick={() => { setKey((k) => k + 1); if (onReplay) onReplay(); }}>
            🔁 שוב
          </button>
          <button className="scene-btn" onClick={onClose}>הבנתי ✓</button>
        </div>
      </div>
    </div>
  );
}
