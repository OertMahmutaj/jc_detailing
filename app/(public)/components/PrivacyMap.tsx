"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useState } from "react";

const labels = {
  de: {
    title: "Standort anzeigen",
    description:
      "Beim Laden der Karte wird eine Verbindung zu Google Maps hergestellt.",
    load: "Karte laden",
    open: "In Google Maps öffnen",
  },
  en: {
    title: "Show location",
    description:
      "Loading the map establishes a connection to Google Maps.",
    load: "Load map",
    open: "Open in Google Maps",
  },
  fr: {
    title: "Afficher l’emplacement",
    description:
      "Le chargement de la carte établit une connexion avec Google Maps.",
    load: "Charger la carte",
    open: "Ouvrir dans Google Maps",
  },
  it: {
    title: "Mostra posizione",
    description:
      "Il caricamento della mappa stabilisce una connessione con Google Maps.",
    load: "Carica mappa",
    open: "Apri in Google Maps",
  },
} as const;

type PrivacyMapProps = {
  locale: string;
  embedUrl: string;
  directionsUrl: string;
};

export function PrivacyMap({
  locale,
  embedUrl,
  directionsUrl,
}: PrivacyMapProps) {
  const [mapAllowed, setMapAllowed] = useState(false);

  const language =
    locale === "en" || locale === "fr" || locale === "it"
      ? locale
      : "de";

  const copy = labels[language];

  if (mapAllowed) {
    return (
      <div className="footer-map footer-map-loaded">
        <iframe
          height="230"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title="JC Detailing Wauwil"
          width="600"
        />

        <a
          className="map-directions"
          href={directionsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden="true" size={14} />
          {copy.open}
        </a>
      </div>
    );
  }

  return (
    <div className="footer-map footer-map-consent">
      <div className="footer-map-consent-content">
        <span className="footer-map-consent-icon" aria-hidden="true">
          <MapPin size={28} strokeWidth={1.8} />
        </span>

        <strong>{copy.title}</strong>

        <p>{copy.description}</p>

        <div className="footer-map-consent-actions">
          <button
            className="footer-map-load-button"
            onClick={() => setMapAllowed(true)}
            type="button"
          >
            {copy.load}
          </button>

          <a
            className="footer-map-external-link"
            href={directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {copy.open}
            <ExternalLink aria-hidden="true" size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}