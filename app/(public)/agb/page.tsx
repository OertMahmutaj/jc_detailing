// app/agb/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "AGB",
  description:
    "Allgemeine Geschäftsbedingungen von JC Detailing in Wauwil, Luzern.",
  alternates: {
    canonical: "/agb",
  },
};

export default function AGBPage() {
  return (
    <LegalPage
      title="Allgemeine Geschäftsbedingungen"
      intro={[
        "JC Detailing",
        "Juljan Cela",
        "Sternmatt 4, 6242 Wauwil, Schweiz",
      ]}
      sections={[
        {
          title: "1. Geltungsbereich",
          body: [
            "Diese Allgemeinen Geschäftsbedingungen gelten für Dienstleistungen von JC Detailing im Bereich Fahrzeugaufbereitung, Innenreinigung, Aussenreinigung, Politur, Lackpflege und Keramikversiegelung.",
          ],
        },
        {
          title: "2. Terminvereinbarung",
          body: [
            "Terminanfragen über die Website sind unverbindlich, bis sie von JC Detailing bestätigt wurden.",
            "Der Kunde ist dafür verantwortlich, korrekte Angaben zum Fahrzeug, Zustand, gewünschter Leistung und Terminwunsch zu machen.",
          ],
        },
        {
          title: "3. Preise",
          body: [
            "Alle angegebenen Preise sind Einstiegspreise. Der finale Preis kann je nach Fahrzeuggrösse, Zustand, Verschmutzungsgrad und gewünschtem Leistungsumfang abweichen.",
            "Der endgültige Umfang und Preis werden vor Beginn der Arbeit mit dem Kunden abgestimmt.",
          ],
        },
        {
          title: "4. Fahrzeugzustand",
          body: [
            "Bestehende Schäden, Kratzer, Defekte, lose Teile oder empfindliche Materialien können das Ergebnis beeinflussen.",
            "JC Detailing übernimmt keine Haftung für bereits vorhandene Schäden oder Schäden, die durch verschlissene, beschädigte oder unsachgemäss reparierte Fahrzeugteile entstehen.",
          ],
        },
        {
          title: "5. Zahlung",
          body: [
            "Die Zahlung erfolgt, sofern nicht anders vereinbart, nach Abschluss der Dienstleistung bei Übergabe des Fahrzeugs.",
          ],
        },
        {
          title: "6. Stornierung und Terminverschiebung",
          body: [
            "Terminänderungen sollten so früh wie möglich mitgeteilt werden.",
            "Bei kurzfristigen Absagen oder Nichterscheinen behält sich JC Detailing vor, zukünftige Termine nur nach vorheriger Absprache anzunehmen.",
          ],
        },
        {
          title: "7. Gewährleistung",
          body: [
            "Sollte der Kunde mit einer ausgeführten Leistung nicht zufrieden sein, ist dies zeitnah nach Übergabe mitzuteilen, damit JC Detailing die Beanstandung prüfen kann.",
          ],
        },
        {
          title: "8. Kontakt",
          body: [
            "Bei Fragen zu diesen AGB kontaktieren Sie JC Detailing per E-Mail unter jcdetailinglucerne@gmail.com.",
          ],
        },
      ]}
    />
  );
}