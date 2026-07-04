"use client";

import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LightGroup, LightItem } from "./StudioMotion";
import { germanOffers } from "../data/site";

type GermanOffer = (typeof germanOffers)[number];

export function GermanOffersGrid() {
  const [selectedOffer, setSelectedOffer] = useState<GermanOffer | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  function openOffer(offer: GermanOffer) {
    setSelectedOffer(offer);
  }

  useEffect(() => {
    if (!selectedOffer) {
      return;
    }

    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedOffer]);

  function closeOffer() {
    setSelectedOffer(null);

    window.requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div ref={topRef} className="offers-interactive">
      <div className="offers-interactive-inner">
        <LightGroup className="offer-grid offers-page-grid">
          {germanOffers.map((offer) => (
            <LightItem key={offer.title}>
              <article className="offer-card">
                <div className="offer-card-content">
                  <h2>{offer.title}</h2>
                  <strong>{offer.price}</strong>
                  <p>{offer.text}</p>
                </div>

                <button
                  className="offer-read-more"
                  type="button"
                  onClick={() => openOffer(offer)}
                >
                  Mehr erfahren
                  <ArrowRight size={16} />
                </button>
              </article>
            </LightItem>
          ))}
        </LightGroup>

        {selectedOffer && (
          <section className="offer-detail-panel" ref={panelRef}>
            <button className="offer-close" type="button" onClick={closeOffer} aria-label="Angebot schliessen">
              <span>Schliessen</span>
              <X size={16} />
            </button>

            <div>
              <p className="mini-title">Angebot</p>
              <h2>{selectedOffer.title}</h2>
              <strong>{selectedOffer.price}</strong>
              <p>{selectedOffer.text}</p>
            </div>

            <ul>
              {selectedOffer.details?.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
