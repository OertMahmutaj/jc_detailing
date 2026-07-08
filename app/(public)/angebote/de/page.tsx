// app/angebote/de/page.tsx

import type { Metadata } from "next";
import { GermanOffersGrid } from "../../components/GermanOffersGrid";
import { HeroIntro, HeroItem, PageEntry } from "../../components/StudioMotion";

export const metadata: Metadata = {
  title: "Pakete & Preise",
  description:
    "Pakete und Preise von JC Detailing in Wauwil, Luzern. Innenreinigung, Aussenreinigung, Komplettaufbereitung, Erhaltungspflege, Politur und Keramikversiegelung.",

  alternates: {
    canonical: "/angebote/de",
  },

  openGraph: {
    title: "Pakete & Preise | JC Detailing",
    description:
      "Klare Einstiegspreise für professionelle Fahrzeugaufbereitung in Wauwil, Kanton Luzern.",
    url: "/angebote/de",
    type: "website",
    locale: "de_CH",
    siteName: "JC Detailing",
  },

  twitter: {
    card: "summary_large_image",
    title: "Pakete & Preise | JC Detailing",
    description:
      "Pakete und Preise für Innenreinigung, Aussenreinigung, Politur und Keramikversiegelung in Wauwil, Luzern.",
  },
};

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
            <p>
              Klare Einstiegspreise. Der finale Preis hängt von
              Fahrzeuggrösse und Zustand ab.
            </p>
          </HeroItem>
        </HeroIntro>
      </section>

      <GermanOffersGrid />
    </PageEntry>
  );
}