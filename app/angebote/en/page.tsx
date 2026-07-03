// app/angebote/en/page.tsx

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroIntro, HeroItem, LightGroup, LightItem, PageEntry } from "../../components/StudioMotion";
import { englishOffers } from "../../data/site";

export default function EnglishOffersPage() {
  return (
    <PageEntry className="page-shell" id="top">
      <section className="sub-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">Offers</p>
          </HeroItem>
          <HeroItem>
            <h1>Packages & pricing</h1>
          </HeroItem>
          <HeroItem>
            <p>Simple starting prices. Final pricing depends on vehicle size and condition.</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <LightGroup className="offer-grid offers-page-grid">
        {englishOffers.map((offer) => (
          <LightItem key={offer.title}>
            <article className="offer-card">
              <h2>{offer.title}</h2>
              <strong>{offer.price}</strong>
              <p>{offer.text}</p>
              <Link href="/#contact">
                Send request
                <ArrowRight size={16} />
              </Link>
            </article>
          </LightItem>
        ))}
      </LightGroup>
    </PageEntry>
  );
}
