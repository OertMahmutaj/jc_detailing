// app/angebote/de/page.tsx

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroIntro, HeroItem, LightGroup, LightItem, PageEntry } from "../../components/StudioMotion";
import { germanOffers } from "../../data/site";

export default function GermanOffersPage() {
  return (
    <PageEntry className="page-shell" id="top">
      <section className="sub-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">Angebote</p>
          </HeroItem>
          <HeroItem>
            <h1>Pakete & Preise</h1>
          </HeroItem>
          <HeroItem>
            <p>Klare Einstiegspreise. Der finale Preis haengt von Fahrzeuggroesse und Zustand ab.</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <LightGroup className="offer-grid">
        {germanOffers.map((offer) => (
          <LightItem key={offer.title}>
            <article className="offer-card">
              <h2>{offer.title}</h2>
              <strong>{offer.price}</strong>
              <p>{offer.text}</p>
              <Link href="/#contact">
                Anfrage senden
                <ArrowRight size={16} />
              </Link>
            </article>
          </LightItem>
        ))}
      </LightGroup>
    </PageEntry>
  );
}
