import { BookingForm } from "../components/BookingForm";
import { HeroIntro, HeroItem, PageEntry } from "../components/StudioMotion";

export default function BookingPage() {
  return (
    <PageEntry className="page-shell" id="top">
      <section className="sub-hero booking-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">Termin buchen</p>
          </HeroItem>
          <HeroItem>
            <h1>Deine Anfrage fuer JC Detailing</h1>
          </HeroItem>
          <HeroItem>
            <p>
              Schick uns die wichtigsten Angaben zu deinem Fahrzeug. Wir pruefen die Anfrage und
              melden uns mit einer Terminbestaetigung oder einem passenden Vorschlag.
            </p>
          </HeroItem>
        </HeroIntro>
      </section>

      <section className="booking-section">
        <div className="booking-intro">
          <p className="mini-title">Anfrage</p>
          <h2>Fahrzeug, Leistung und Wunschdatum.</h2>
          <p>
            Die Anfrage ist noch keine verbindliche Buchung. Du erhaeltst zuerst eine
            Bestaetigung per E-Mail, sobald der Termin geprueft wurde.
          </p>
        </div>

        <BookingForm />
      </section>
    </PageEntry>
  );
}
