// app/angebote/page.tsx

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroIntro, HeroItem, LightGroup, LightItem, PageEntry } from "../components/StudioMotion";

export default function AngebotePage() {
  return (
    <PageEntry className="page-shell" id="top">
      <section className="sub-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">Packages</p>
          </HeroItem>
          <HeroItem>
            <h1>Angebote</h1>
          </HeroItem>
          <HeroItem>
            <p>Choose the language for packages and pricing.</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <LightGroup className="language-offer-grid offers-page-grid">
        <LightItem>
          <Link href="/angebote/de">
            <h2>Deutsch</h2>
            <p>Pakete, Preise und Leistungen auf Deutsch.</p>
            <span>
              Anzeigen
              <ArrowRight size={16} />
            </span>
          </Link>
        </LightItem>

        <LightItem>
          <Link href="/angebote/en">
            <h2>English</h2>
            <p>Packages, pricing and services in English.</p>
            <span>
              View offers
              <ArrowRight size={16} />
            </span>
          </Link>
        </LightItem>
      </LightGroup>
    </PageEntry>
  );
}
