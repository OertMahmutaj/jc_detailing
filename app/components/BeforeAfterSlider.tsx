"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

type BeforeAfterSliderProps = {
  after: string;
  before: string;
  index: number;
};

export function BeforeAfterSlider({ after, before, index }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <article
      className="before-after"
      style={{ "--split": `${position}%` } as CSSProperties}
    >
      <img className="before-after-image" src={after} alt={`Nachher ${index}`} />

      <div className="before-after-before">
        <img className="before-after-image" src={before} alt={`Vorher ${index}`} />
      </div>

      <div className="before-after-label before">Vorher</div>
      <div className="before-after-label after">Nachher</div>

      <div className="before-after-divider" aria-hidden="true">
        <span />
      </div>

      <input
        aria-label={`Vorher Nachher Vergleich ${index}`}
        className="before-after-range"
        max="100"
        min="0"
        onChange={(event) => setPosition(Number(event.target.value))}
        type="range"
        value={position}
      />
    </article>
  );
}
