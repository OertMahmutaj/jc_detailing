// app/datenschutz/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutz | JC Detailing",
};

export default function DatenschutzPage() {
  return (
    <LegalPage
      title="Datenschutzerklaerung JC Detailing"
      sections={[
        {
          title: "1. Allgemeines",
          body: [
            "Der Schutz Ihrer persoenlichen Daten ist uns wichtig. Wir behandeln Ihre Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften der Schweiz (revDSG).",
          ],
        },
        {
          title: "2. Erhebung und Verarbeitung von Daten",
          body: [
            "Wir erheben personenbezogene Daten nur, wenn Sie uns diese freiwillig mitteilen, z.B. durch Buchung ueber unsere Website (Detailr), Kontakt per E-Mail oder WhatsApp sowie Terminvereinbarung.",
            "Folgende Daten koennen erhoben werden: Name, Telefonnummer, E-Mail-Adresse und Fahrzeugdaten.",
          ],
        },
        {
          title: "3. Zweck der Datenverarbeitung",
          body: [
            "Die Daten werden verwendet fuer Terminvereinbarung, Kommunikation mit Kunden, Durchfuehrung der Dienstleistungen und Rechnungsstellung.",
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
            "Fuer Terminbuchungen verwenden wir externe Tools (Detailr). Es gelten zusaetzlich deren Datenschutzbestimmungen.",
          ],
        },
        {
          title: "7. Ihre Rechte",
          body: [
            "Sie haben jederzeit das Recht auf Auskunft ueber Ihre Daten, Berichtigung und Loeschung.",
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
