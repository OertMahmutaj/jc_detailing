// app/angebote/de/page.tsx

import { GermanOffersGrid } from "../../components/GermanOffersGrid";
import { HeroIntro, HeroItem, PageEntry } from "../../components/StudioMotion";

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

      <GermanOffersGrid />
    </PageEntry>
  );
}
