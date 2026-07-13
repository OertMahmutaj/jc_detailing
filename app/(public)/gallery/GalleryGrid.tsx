"use client";

import { useState, type CSSProperties } from "react";
import type { PublicLocale } from "../i18n";

export type GalleryComparison = {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  beforeCropScale: number;
  afterCropScale: number;
};

type GalleryGridProps = {
  comparisons: GalleryComparison[];
  locale: PublicLocale;
};

function BeforeAfterSlider({
  comparison,
  index,
  locale,
}: {
  comparison: GalleryComparison;
  index: number;
  locale: PublicLocale;
}) {
  const [split, setSplit] = useState(50);
  const labels = {
    de: { before: "Vorher", after: "Nachher", comparison: "Vorher-Nachher Vergleich", vehicleBefore: "Fahrzeug vor der Aufbereitung", vehicleAfter: "Fahrzeug nach der Aufbereitung" },
    en: { before: "Before", after: "After", comparison: "Before-and-after comparison", vehicleBefore: "Vehicle before detailing", vehicleAfter: "Vehicle after detailing" },
    fr: { before: "Avant", after: "Après", comparison: "Comparaison avant-après", vehicleBefore: "Véhicule avant la préparation", vehicleAfter: "Véhicule après la préparation" },
    it: { before: "Prima", after: "Dopo", comparison: "Confronto prima e dopo", vehicleBefore: "Veicolo prima del detailing", vehicleAfter: "Veicolo dopo il detailing" },
  }[locale];

  return (
    <article
      className="before-after public-gallery-slider"
      style={
        {
          "--split": `${split}%`,
        } as CSSProperties
      }
    >
      <img
        alt={`${labels.vehicleAfter} ${index + 1}`}
        className="before-after-image"
        src={comparison.afterUrl}
        style={{
          transform: `scale(${comparison.afterCropScale})`,
        }}
      />

      <div className="before-after-before">
        <img
          alt={`${labels.vehicleBefore} ${index + 1}`}
          className="before-after-image"
          src={comparison.beforeUrl}
          style={{
            transform: `scale(${comparison.beforeCropScale})`,
          }}
        />
      </div>

      <span className="before-after-label before">{labels.before}</span>
      <span className="before-after-label after">{labels.after}</span>

      <div className="before-after-divider" aria-hidden="true">
        <span />
      </div>

      <input
        aria-label={`${labels.comparison} ${index + 1}`}
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

export function GalleryGrid({ comparisons, locale }: GalleryGridProps) {
  const copy = {
    de: { single: "Vergleich", plural: "Vergleiche", instruction: "Ziehe den Regler, um den Unterschied zu sehen.", empty: "Galerie wird erweitert", emptyTitle: "Neue Ergebnisse folgen bald.", emptyText: "Ausgewählte Vorher-Nachher-Vergleiche werden hier laufend veröffentlicht." },
    en: { single: "comparison", plural: "comparisons", instruction: "Drag the slider to see the difference.", empty: "Gallery in progress", emptyTitle: "New results are coming soon.", emptyText: "Selected before-and-after comparisons will be published here regularly." },
    fr: { single: "comparaison", plural: "comparaisons", instruction: "Faites glisser le curseur pour voir la différence.", empty: "Galerie en préparation", emptyTitle: "De nouveaux résultats arrivent bientôt.", emptyText: "Des comparaisons avant-après sélectionnées seront publiées ici régulièrement." },
    it: { single: "confronto", plural: "confronti", instruction: "Sposta il cursore per vedere la differenza.", empty: "Galleria in aggiornamento", emptyTitle: "Nuovi risultati arriveranno presto.", emptyText: "Qui verranno pubblicati regolarmente confronti selezionati prima e dopo." },
  }[locale];

  return (
    <>
      <div className="public-gallery-toolbar">
        <span>
          {comparisons.length}{" "}
          {comparisons.length === 1 ? copy.single : copy.plural}
        </span>

        <p>{copy.instruction}</p>
      </div>

      {comparisons.length ? (
        <div className="public-gallery-grid">
          {comparisons.map((comparison, index) => (
            <BeforeAfterSlider
              comparison={comparison}
              index={index}
              locale={locale}
              key={comparison.id}
            />
          ))}
        </div>
      ) : (
        <div className="public-gallery-empty">
          <span>{copy.empty}</span>
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyText}</p>
        </div>
      )}
    </>
  );
}
