"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";
import { usePublicLocale } from "./usePublicLocale";

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
  const locale = usePublicLocale();
  const copy = {
    de: { before: "Vorher", after: "Nachher", comparison: "Vorher-Nachher Vergleich", beforeAlt: "Zustand vor der Autoaufbereitung", afterAlt: "Ergebnis nach der Autoaufbereitung", slider: "Regler" },
    en: { before: "Before", after: "After", comparison: "Before-and-after comparison", beforeAlt: "Vehicle before detailing", afterAlt: "Vehicle after detailing", slider: "slider" },
    fr: { before: "Avant", after: "Après", comparison: "Comparaison avant-après", beforeAlt: "Véhicule avant la préparation", afterAlt: "Résultat après la préparation", slider: "curseur" },
    it: { before: "Prima", after: "Dopo", comparison: "Confronto prima e dopo", beforeAlt: "Veicolo prima del detailing", afterAlt: "Risultato dopo il detailing", slider: "cursore" },
  }[locale];

  const comparisonLabel = `${copy.comparison} ${index} - JC Detailing Wauwil`;

  return (
    <article
      aria-label={comparisonLabel}
      className="before-after"
      style={{ "--split": `${position}%` } as CSSProperties}
    >
      <Image
        alt={`${copy.afterAlt} - JC Detailing Wauwil ${index}`}
        className="before-after-image"
        fill
        quality={85}
        sizes="(max-width: 768px) 100vw, 50vw"
        src={after}
      />

      <div className="before-after-before">
        <Image
          alt={`${copy.beforeAlt} - JC Detailing Wauwil ${index}`}
          className="before-after-image"
          fill
          quality={85}
          sizes="(max-width: 768px) 100vw, 50vw"
          src={before}
        />
      </div>

      <div className="before-after-label before">{copy.before}</div>
      <div className="before-after-label after">{copy.after}</div>

      <div className="before-after-divider" aria-hidden="true">
        <span />
      </div>

      <input
        aria-label={`${comparisonLabel} ${copy.slider}`}
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
