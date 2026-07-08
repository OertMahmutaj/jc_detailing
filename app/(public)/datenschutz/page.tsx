// app/datenschutz/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutz | JC Detailing",
};

export default function DatenschutzPage() {
  return (
    <LegalPage
      title="Datenschutzerklärung JC Detailing"
      sections={[
        {
          title: "1. Allgemeines",
          body: [
            "Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir behandeln Ihre Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften der Schweiz (revDSG).",
          ],
        },
        {
          title: "2. Erhebung und Verarbeitung von Daten",
          body: [
            "Wir erheben personenbezogene Daten nur, wenn Sie uns diese freiwillig mitteilen, z.B. durch Buchung über unsere Website (Detailr), Kontakt per E-Mail oder WhatsApp sowie Terminvereinbarung.",
            "Folgende Daten können erhoben werden: Name, Telefonnummer, E-Mail-Adresse und Fahrzeugdaten.",
          ],
        },
        {
          title: "3. Zweck der Datenverarbeitung",
          body: [
            "Die Daten werden verwendet für Terminvereinbarung, Kommunikation mit Kunden, Durchführung der Dienstleistungen und Rechnungsstellung.",
          ],
        },
        {
          title: "4. Weitergabe an Dritte",
          body: [
            "Ihre Daten werden nicht an Dritte weitergegeben, ausser wenn dies zur Abwicklung notwendig ist, z.B. Zahlungsanbieter oder Buchungssystem.",
          ],
        },
        {
          title: "5. Cookies & Website",
          body: ["Unsere Website kann Cookies verwenden, um die Benutzerfreundlichkeit zu verbessern."],
        },
        {
          title: "6. Buchungssystem",
          body: [
            "Für Terminbuchungen verwenden wir externe Tools (Detailr). Es gelten zusätzlich deren Datenschutzbestimmungen.",
          ],
        },
        {
          title: "7. Ihre Rechte",
          body: [
            "Sie haben jederzeit das Recht auf Auskunft über Ihre Daten, Berichtigung und Löschung.",
            "Kontaktieren Sie uns dazu per E-Mail.",
          ],
        },
        {
          title: "8. Kontakt",
          body: ["Bei Fragen zum Datenschutz: Juljan Cela, E-Mail: jcdetailinglucerne@gmail.com"],
        },
      ]}
    />
  );
}
