// app/agb/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "AGB | JC Detailing",
};

export default function AgbPage() {
  return (
    <LegalPage
      title="AGB JC Detailing"
      sections={[
        {
          title: "1. Geltungsbereich",
          body: [
            "Diese Allgemeinen Geschaeftsbedingungen (AGB) gelten fuer alle Dienstleistungen von JC Detailing im Bereich Fahrzeugaufbereitung.",
          ],
        },
        {
          title: "2. Terminvereinbarung",
          body: ["Termine koennen online oder direkt vereinbart werden und sind verbindlich."],
        },
        {
          title: "3. Stornierung",
          body: [
            "Kostenlose Stornierung bis 24 Stunden vor Termin.",
            "Bei spaeterer Absage oder Nichterscheinen werden 50% des gebuchten Betrags verrechnet.",
          ],
        },
        {
          title: "4. Fahrzeugzustand",
          body: [
            "Der Kunde verpflichtet sich, den Zustand des Fahrzeugs korrekt anzugeben.",
            "Bei staerkerer Verschmutzung oder nicht angegebenen Zusatzarbeiten behalten wir uns vor, einen Aufpreis von CHF 30-100 zu verrechnen.",
          ],
        },
        {
          title: "5. Haftung",
          body: [
            "Fuer bestehende Schaeden (Kratzer, Abnutzung etc.) wird keine Haftung uebernommen.",
            "Schaeden, die durch unsere Dienstleistung entstehen, werden im Rahmen der Betriebshaftpflicht reguliert.",
            "Empfindliche Materialien werden auf eigenes Risiko bearbeitet.",
          ],
        },
        {
          title: "6. Wertgegenstaende",
          body: [
            "Der Kunde ist verpflichtet, persoenliche Gegenstaende aus dem Fahrzeug zu entfernen.",
            "Fuer verlorene oder beschaedigte Gegenstaende wird keine Haftung uebernommen.",
          ],
        },
        {
          title: "7. Bezahlung",
          body: [
            "Die Bezahlung erfolgt vor Ort oder online per TWINT, Karte oder Bar.",
            "Bei groesseren Dienstleistungen kann eine Anzahlung verlangt werden.",
          ],
        },
        {
          title: "8. Verspaetung",
          body: [
            "Bei Verspaetung des Kunden kann sich die Dauer der Dienstleistung verkuerzen oder der Termin verschoben werden.",
          ],
        },
        {
          title: "9. Gerichtsstand",
          body: ["Gerichtsstand ist der Sitz des Unternehmens (Wauwil, Luzern)."],
        },
      ]}
    />
  );
}
