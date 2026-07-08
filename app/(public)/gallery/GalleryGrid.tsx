"use client";

import { useState } from "react";

export type GalleryComparison = {
  id: string;
  beforeUrl: string;
  afterUrl: string;
};

type GalleryGridProps = {
  comparisons: GalleryComparison[];
};

function BeforeAfterSlider({
  comparison,
  index,
}: {
  comparison: GalleryComparison;
  index: number;
}) {
  const [split, setSplit] = useState(50);

  return (
    <article
      className="before-after public-gallery-slider"
      style={
        {
          "--split": `${split}%`,
        } as React.CSSProperties
      }
    >
      <img
        alt={`Fahrzeug vor der Aufbereitung ${index + 1}`}
        className="before-after-image"
        src={comparison.afterUrl}
      />

      <div className="before-after-before">
        <img
          alt={`Fahrzeug nach der Aufbereitung ${index + 1}`}
          className="before-after-image"
          src={comparison.beforeUrl}
        />
      </div>

      <span className="before-after-label before">Vorher</span>
      <span className="before-after-label after">Nachher</span>

      <div className="before-after-divider" aria-hidden="true">
        <span />
      </div>

      <input
        aria-label={`Vorher-Nachher Vergleich ${index + 1}`}
        className="before-after-range"
        max="100"
        min="0"
        onChange={(event) => setSplit(Number(event.target.value))}
        type="range"
        value={split}
      />
    </article>
  );
}

export function GalleryGrid({ comparisons }: GalleryGridProps) {
  return (
    <>
      <div className="public-gallery-toolbar">
        <span>
          {comparisons.length}{" "}
          {comparisons.length === 1 ? "Vergleich" : "Vergleiche"}
        </span>

        <p>Ziehe den Regler, um den Unterschied zu sehen.</p>
      </div>

      {comparisons.length ? (
        <div className="public-gallery-grid">
          {comparisons.map((comparison, index) => (
            <BeforeAfterSlider
              comparison={comparison}
              index={index}
              key={comparison.id}
            />
          ))}
        </div>
      ) : (
        <div className="public-gallery-empty">
          <span>Galerie wird erweitert</span>
          <h2>Neue Ergebnisse folgen bald.</h2>
          <p>
            Ausgewählte Vorher-Nachher-Vergleiche werden hier laufend
            veröffentlicht.
          </p>
        </div>
      )}
    </>
  );
}