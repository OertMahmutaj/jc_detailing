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
            "Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Dienstleistungen von JC Detailing im Bereich Fahrzeugaufbereitung.",
          ],
        },
        {
          title: "2. Terminvereinbarung",
          body: ["Termine können online oder direkt vereinbart werden und sind verbindlich."],
        },
        {
          title: "3. Stornierung",
          body: [
            "Kostenlose Stornierung bis 24 Stunden vor Termin.",
            "Bei säterer Absage oder Nichterscheinen werden 50% des gebuchten Betrags verrechnet.",
          ],
        },
        {
          title: "4. Fahrzeugzustand",
          body: [
            "Der Kunde verpflichtet sich, den Zustand des Fahrzeugs korrekt anzugeben.",
            "Bei stärkerer Verschmutzung oder nicht angegebenen Zusatzarbeiten behalten wir uns vor, einen Aufpreis von CHF 30-100 zu verrechnen.",
          ],
        },
        {
          title: "5. Haftung",
          body: [
            "Für bestehende Schäden (Kratzer, Abnutzung etc.) wird keine Haftung übernommen.",
            "Schäden, die durch unsere Dienstleistung entstehen, werden im Rahmen der Betriebshaftpflicht reguliert.",
            "Empfindliche Materialien werden auf eigenes Risiko bearbeitet.",
          ],
        },
        {
          title: "6. Wertgegenstände",
          body: [
            "Der Kunde ist verpflichtet, persönliche Gegenstände aus dem Fahrzeug zu entfernen.",
            "Für verlorene oder beschädigte Gegenstände wird keine Haftung übernommen.",
          ],
        },
        {
          title: "7. Bezahlung",
          body: [
            "Die Bezahlung erfolgt vor Ort oder online per TWINT, Karte oder Bar.",
            "Bei grösseren Dienstleistungen kann eine Anzahlung verlangt werden.",
          ],
        },
        {
          title: "8. Verspätung",
          body: [
            "Bei Verspätung des Kunden kann sich die Dauer der Dienstleistung verkürzen oder der Termin verschoben werden.",
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
