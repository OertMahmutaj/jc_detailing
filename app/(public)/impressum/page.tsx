// app/impressum/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Impressum | JC Detailing",
};

export default function ImpressumPage() {
  return (
    <LegalPage
      title="Impressum"
      intro={[
        "JC Detailing",
        "Juljan Cela",
        "Sternmatt 4, 6242 Wauwil, Schweiz",
        "Telefon: +41 77 268 33 88",
        "E-Mail: jcdetailinglucerne@gmail.com",
      ]}
      sections={[
        {
          title: "Haftungsausschluss",
          body: [
            "Die Inhalte unserer Website wurden mit grösstmöglicher Sorgfalt erstellt. Dennoch übernehmen wir keine Gewähr für die Richtigkeit, Vollständigkeit, Aktualität oder Zuverlässigkeit der bereitgestellten Informationen.",
            "Haftungsansprüche gegen JC Detailing wegen Schäden materieller oder immaterieller Art, die aus dem Zugriff auf die Website, deren Nutzung oder Nichtnutzung, durch technische Störungen oder durch missbräuchliche Nutzung der Verbindung entstehen, sind ausgeschlossen.",
            "Alle Angebote auf dieser Website sind unverbindlich. JC Detailing behält sich ausdrücklich vor, Inhalte jederzeit und ohne Ankündigung ganz oder teilweise zu ändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder dauerhaft einzustellen.",
          ],
        },
        {
          title: "Haftung für Links",
          body: [
            "Diese Website kann Links zu externen Websites Dritter enthalten. Auf deren Inhalte haben wir keinen Einfluss, weshalb wir dafür keine Gewähr übernehmen.",
            "Für die Inhalte der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich. Der Zugriff und die Nutzung solcher Websites erfolgen auf eigene Gefahr des jeweiligen Nutzers.",
          ],
        },
        {
          title: "Urheberrechte",
          body: [
            "Die Urheberrechte und alle anderen Rechte an Inhalten, Bildern, Fotos oder sonstigen Dateien auf dieser Website liegen, sofern nicht anders angegeben, bei JC Detailing bzw. Juljan Cela.",
            "Die Verwendung, Vervielfältigung oder Weitergabe von Inhalten jeglicher Art bedarf der vorherigen schriftlichen Zustimmung des jeweiligen Rechteinhabers.",
          ],
        },
      ]}
    />
  );
}
