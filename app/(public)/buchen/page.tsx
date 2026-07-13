import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "../components/BookingForm";
import { HeroIntro, HeroItem, PageEntry } from "../components/StudioMotion";
import { bookingPageCopy } from "../bookingCopy";
import { normalizeLocale } from "../i18n";

export const metadata: Metadata = {
  title: "Termin buchen",
  description:
    "Termin bei JC Detailing in Wauwil, Luzern anfragen. Buche professionelle Autoaufbereitung, Innenreinigung, Aussenreinigung, Politur oder Keramikversiegelung.",

  alternates: {
    canonical: "/buchen",
  },

  openGraph: {
    title: "Termin buchen | JC Detailing",
    description:
      "Sende deine Anfrage für professionelle Fahrzeugaufbereitung bei JC Detailing in Wauwil, Kanton Luzern.",
    url: "/buchen",
    type: "website",
    locale: "de_CH",
    siteName: "JC Detailing",
  },

  twitter: {
    card: "summary_large_image",
    title: "Termin buchen | JC Detailing",
    description:
      "Termin für Autoaufbereitung, Innenreinigung, Politur oder Keramikversiegelung in Wauwil, Luzern anfragen.",
  },
};

export default async function BookingPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const copy = bookingPageCopy[locale];

  return (
    <PageEntry className="page-shell" id="top">
      <section className="sub-hero booking-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">{copy.eyebrow}</p>
          </HeroItem>

          <HeroItem>
            <h1>{copy.title}</h1>
          </HeroItem>

          <HeroItem>
            <p>{copy.description}</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <section className="booking-section">
        <div className="booking-intro">
          <p className="mini-title">{copy.sectionEyebrow}</p>
          <h2>{copy.sectionTitle}</h2>
          <p>{copy.sectionDescription}</p>
        </div>

        <Suspense fallback={<div className="booking-loading" />}>
          <BookingForm />
        </Suspense>
      </section>
    </PageEntry>
  );
}
