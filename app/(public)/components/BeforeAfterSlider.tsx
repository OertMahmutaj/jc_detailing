"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";

type BeforeAfterSliderProps = {
  after: string;
  before: string;
  index: number;
};

export function BeforeAfterSlider({
  after,
  before,
  index,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);

  const comparisonLabel = `Vorher-Nachher Vergleich ${index} von JC Detailing in Wauwil`;

  return (
    <article
      aria-label={comparisonLabel}
      className="before-after"
      style={{ "--split": `${position}%` } as CSSProperties}
    >
      <Image
        alt={`Nachher Ergebnis der Autoaufbereitung bei JC Detailing in Wauwil – Vergleich ${index}`}
        className="before-after-image"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        src={after}
      />

      <div className="before-after-before">
        <Image
          alt={`Vorher Zustand vor der Autoaufbereitung bei JC Detailing in Wauwil – Vergleich ${index}`}
          className="before-after-image"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          src={before}
        />
      </div>

      <div className="before-after-label before">Vorher</div>
      <div className="before-after-label after">Nachher</div>

      <div className="before-after-divider" aria-hidden="true">
        <span />
      </div>

      <input
        aria-label={`${comparisonLabel} Regler`}
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