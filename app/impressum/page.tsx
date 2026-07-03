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
            "Die Inhalte unserer Website wurden mit groesstmoeglicher Sorgfalt erstellt. Dennoch uebernehmen wir keine Gewaehr fuer die Richtigkeit, Vollstaendigkeit, Aktualitaet oder Zuverlaessigkeit der bereitgestellten Informationen.",
            "Haftungsansprueche gegen JC Detailing wegen Schaeden materieller oder immaterieller Art, die aus dem Zugriff auf die Website, deren Nutzung oder Nichtnutzung, durch technische Stoerungen oder durch missbraeuchliche Nutzung der Verbindung entstehen, sind ausgeschlossen.",
            "Alle Angebote auf dieser Website sind unverbindlich. JC Detailing behaelt sich ausdruecklich vor, Inhalte jederzeit und ohne Ankuendigung ganz oder teilweise zu aendern, zu ergaenzen, zu loeschen oder die Veroeffentlichung zeitweise oder dauerhaft einzustellen.",
          ],
        },
        {
          title: "Haftung fuer Links",
          body: [
            "Diese Website kann Links zu externen Websites Dritter enthalten. Auf deren Inhalte haben wir keinen Einfluss, weshalb wir dafuer keine Gewaehr uebernehmen.",
            "Fuer die Inhalte der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich. Der Zugriff und die Nutzung solcher Websites erfolgen auf eigene Gefahr des jeweiligen Nutzers.",
          ],
        },
        {
          title: "Urheberrechte",
          body: [
            "Die Urheberrechte und alle anderen Rechte an Inhalten, Bildern, Fotos oder sonstigen Dateien auf dieser Website liegen, sofern nicht anders angegeben, bei JC Detailing bzw. Juljan Cela.",
            "Die Verwendung, Vervielfaeltigung oder Weitergabe von Inhalten jeglicher Art bedarf der vorherigen schriftlichen Zustimmung des jeweiligen Rechteinhabers.",
          ],
        },
      ]}
    />
  );
}
