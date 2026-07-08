import { BookingForm } from "../components/BookingForm";
import { HeroIntro, HeroItem, PageEntry } from "../components/StudioMotion";
import { Suspense } from "react";

export default function BookingPage() {
  return (
    <PageEntry className="page-shell" id="top">
      <section className="sub-hero booking-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">Termin buchen</p>
          </HeroItem>
          <HeroItem>
            <h1>Deine Anfrage für JC Detailing</h1>
          </HeroItem>
          <HeroItem>
            <p>
              Schick uns die wichtigsten Angaben zu deinem Fahrzeug. Wir prüfen die Anfrage und
              melden uns mit einer Terminbestätigung oder einem passenden Vorschlag.
            </p>
          </HeroItem>
        </HeroIntro>
      </section>

      <section className="booking-section">
        <div className="booking-intro">
          <p className="mini-title">Anfrage</p>
          <h2>Fahrzeug, Leistung und Wunschdatum.</h2>
          <p>
            Die Anfrage ist noch keine verbindliche Buchung. Du erhältst zuerst eine
            Bestätigung per E-Mail, sobald der Termin geprüft wurde.
          </p>
        </div>

        <Suspense fallback={<div className="booking-loading" />}>
          <BookingForm />
        </Suspense>
      </section>
    </PageEntry>
  );
}
