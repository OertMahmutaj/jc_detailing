"use client";

import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LightGroup, LightItem } from "./StudioMotion";
import type { PublicLocale } from "../i18n";
import { getLocalizedOffers, offersPageCopy, type LocalizedOffer } from "../offerCopy";

export function GermanOffersGrid({ locale = "de" }: { locale?: PublicLocale }) {
  const offers = getLocalizedOffers(locale);
  const copy = offersPageCopy[locale];
  const [selectedOffer, setSelectedOffer] = useState<LocalizedOffer | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  function openOffer(offer: LocalizedOffer) {
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
          {offers.map((offer) => (
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
                  {copy.more}
                  <ArrowRight size={16} />
                </button>
              </article>
            </LightItem>
          ))}
        </LightGroup>

        {selectedOffer && (
          <section className="offer-detail-panel" ref={panelRef}>
            <button className="offer-close" type="button" onClick={closeOffer} aria-label={copy.closeLabel}>
              <span>{copy.close}</span>
              <X size={16} />
            </button>

            <div>
              <p className="mini-title">{copy.offer}</p>
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
