// app/data/site.ts

export const services = {
  innenreinigung: {
    id: "innenreinigung",
    path: "/leistungen/innenreinigung",
    title: "Innenreinigung",
    eyebrow: "Interior detailing",
    short: "Tiefenreinigung von Sitzen, Teppichen, Leder, Kunststoff und Scheiben.",
    image: "/innenreinigung.jpeg",
    includes: [
      "Staubsaugen von Innenraum und Kofferraum",
      "Shampoo- und Fleckenbehandlung",
      "Kunststoff- und Lederpflege",
      "Scheibenreinigung innen",
      "Dampfreinigung fuer hygienische Details",
    ],
    process:
      "Wir starten mit einer kurzen Kontrolle des Innenraums und schauen uns Material, Verschmutzung und empfindliche Stellen genau an. Danach werden lose Verschmutzungen entfernt, Textilien und Teppiche behandelt, Kunststoffe gereinigt und Leder oder empfindliche Flaechen passend gepflegt.",
    outcome:
      "Der Innenraum wirkt wieder frisch, ruhig und gepflegt. Sitze, Teppiche, Leder, Kunststoffe und Scheiben fuehlen sich sauberer an und das Fahrzeug ist im Alltag deutlich angenehmer zu nutzen.",
  },
  aussenreinigung: {
    id: "aussenreinigung",
    path: "/leistungen/aussenreinigung",
    title: "Aussenreinigung",
    eyebrow: "Exterior detailing",
    short: "Schonende Handwaesche, Felgenreinigung, Insektenentfernung und Reifenpflege.",
    image: "/aussenreinigung.jpg",
    includes: [
      "Snow-Foam-Vorwaesche",
      "Schonende Handwaesche",
      "Felgenreinigung",
      "Insektenentfernung",
      "Reifen- und Kunststoffpflege",
    ],
    process:
      "Die Aussenreinigung beginnt mit einer gruendlichen Vorwaesche, damit grober Schmutz geloest wird, bevor der Lack beruehrt wird. Danach folgen Handwaesche, Felgenreinigung, Detailarbeit an Kanten und Emblemen sowie ein sauberes Finish fuer Reifen und Kunststoffteile.",
    outcome:
      "Das Fahrzeug steht sichtbar sauberer und gepflegter da, ohne den Lack unnoetig zu belasten. Glanz, Konturen und Details kommen wieder klarer zur Geltung.",
  },
  politur: {
    id: "politur",
    path: "/leistungen/politur",
    title: "Politur",
    eyebrow: "Paint correction",
    short: "Lackaufbereitung fuer mehr Glanz, Tiefe und weniger Swirls.",
    image: "/politur.jpeg",
    includes: [
      "Lackanalyse",
      "Schonende Vorreinigung",
      "Maschinelle Politur",
      "Swirl- und Hologrammreduzierung",
      "Finish-Kontrolle im Licht",
    ],
    process:
      "Vor der Politur wird der Lack gereinigt und im Licht beurteilt. Anschliessend waehlen wir Pad, Politur und Arbeitsweise passend zum Lackzustand, arbeiten kontrolliert Bauteil fuer Bauteil und pruefen das Finish regelmaessig.",
    outcome:
      "Der Lack gewinnt sichtbar an Tiefe, Klarheit und Glanz. Feine Waschspuren, matte Stellen und leichte Defekte werden reduziert, sodass das Fahrzeug hochwertiger und sauberer wirkt.",
  },
  keramikversiegelung: {
    id: "keramikversiegelung",
    path: "/leistungen/keramikversiegelung",
    title: "Keramikversiegelung",
    eyebrow: "Ceramic coating",
    short: "Hydrophober Lackschutz mit hochwertigem Glanz-Finish.",
    image: "/keramikversiegelung.jpeg",
    includes: [
      "Gruendliche Lackvorbereitung",
      "Entfettung der Oberflaeche",
      "Keramikbeschichtung",
      "Hydrophober Schutz",
      "Glanz- und Finishkontrolle",
    ],
    process:
      "Die Keramikversiegelung braucht eine saubere Grundlage: der Lack wird gewaschen, vorbereitet und entfettet. Danach wird die Beschichtung kontrolliert aufgetragen, auspoliert und in Ruhe geprueft, damit Schutz und Optik sauber sitzen.",
    outcome:
      "Die Oberflaeche bekommt einen glaenzenden, hydrophoben Schutzfilm. Wasser perlt leichter ab, Schmutz haftet weniger stark und die Pflege wird im Alltag einfacher.",
  },
} as const;

export type Service = (typeof services)[keyof typeof services];

export const serviceItems = Object.values(services);

export const germanOffers = [
  {
    title: "Komplett Innenreinigung",
    price: "ab 209 CHF",
    text: "Gruendliche Reinigung und Pflege des gesamten Innenraums.",
    details: [
      "Gruendliche Staubsaugung von Fussraum, Sitzen und Kofferraum.",
      "Intensive Reinigung und Pflege aller Kunststoffoberflaechen inklusive schuetzendem Finish.",
      "Tiefenreinigung der Sitze inklusive Shampoo- und Fleckenbehandlung.",
      "Professionelle Teppichtiefenreinigung und streifenfreie Scheibenreinigung innen.",
      "Dampfreinigung zur hygienischen Desinfektion des Innenraums.",
      "Schonende Reinigung und Pflege von Leder- und Alcantaraflaechen.",
    ],
  },
  {
    title: "Komplett Aussenreinigung",
    price: "ab 109 CHF",
    text: "Schonende Handwaesche, Felgenreinigung und gepflegtes Finish.",
    details: [
      "Gruendliche Vorwaesche mit Snow Foam zur schonenden Schmutzloesung.",
      "Sorgfaeltige Handwaesche mit hochwertigen Reinigungsmitteln.",
      "Schonende Trocknung des gesamten Fahrzeugs.",
      "Intensive Felgenreinigung inklusive Entfernung von Bremsstaub.",
      "Entfernung von Insektenrueckstaenden an Front und Spiegeln.",
      "Reinigung der Tuerfalze, Einstiegsbereiche, Embleme und schwer zugaenglichen Details.",
    ],
  },
  {
    title: "Komplett Aufbereitung",
    price: "auf Anfrage",
    text: "Innen und aussen kombiniert fuer ein frisches Gesamtbild.",
    details: [
      "Kombination aus Innenreinigung und Aussenreinigung fuer ein vollstaendiges Ergebnis.",
      "Ideal fuer Fahrzeuge, die sichtbar aufgefrischt und gepflegt werden sollen.",
      "Materialschonende Reinigung innen und aussen mit hochwertigem Finish.",
      "Finale Kontrolle vor der Uebergabe.",
      "Der genaue Umfang wird je nach Fahrzeuggroesse und Zustand vor Ort abgestimmt.",
    ],
  },
  {
    title: "Erhaltungspflege",
    price: "ab 69 CHF",
    text: "Regelmaessige Pflege fuer bereits aufbereitete oder gepflegte Fahrzeuge.",
    details: [
      "Voraussetzung: Das Fahrzeug wurde zuvor durch JC Detailing aufbereitet oder befindet sich in gepflegtem Zustand.",
      "Innenpflege ab 129 CHF mit Staubsaugen, Armaturenbrett, Mittelkonsole und Kunststoffoberflaechen.",
      "Tuerfalze, Einstiegsbereiche und Tuerverkleidungen werden sauber nachgepflegt.",
      "Aussenpflege ab 69 CHF mit Snow Foam, Handwaesche, schonender Trocknung und Felgenreinigung.",
      "Ideal, um den hochwertigen Zustand regelmaessig zu erhalten.",
    ],
  },
  {
    title: "Add-ons",
    price: "ab 30 CHF",
    text: "Zusatzleistungen wie Tierhaarentfernung, Kofferraum Deep Clean und Sitzreinigung.",
    details: [
      "Tierhaarentfernung ab CHF 50 fuer hartnaeckige Tierhaare.",
      "Kofferraum Deep Clean ab CHF 40 fuer eine gruendliche Reinigung des Kofferraums.",
      "Sitze Tiefenreinigung ab CHF 80 fuer hygienische Polsterreinigung.",
      "Dachhimmel Reinigung ab CHF 50 fuer empfindliche Dachhimmel-Oberflaechen.",
      "Fussmatten intensiv ab CHF 30 fuer tiefengereinigte Fussmatten.",
    ],
  },
  {
    title: "Politur & Keramik",
    price: "ab 399 CHF",
    text: "Lackkorrektur, Hochglanz-Finish und langfristiger Keramikschutz.",
    details: [
      "Polish Paket 1 Step ab 399 CHF fuer Glanz, leichte Kratzerentfernung und reduzierte Swirls.",
      "Polish Paket 2 Step ab 599 CHF mit Cut und Finish fuer deutlich verbesserte Lackoptik.",
      "Keramik Paket ab 1090 CHF inklusive Lackvorbereitung, Politur, Entfettung und Keramikversiegelung.",
      "Vorteile: tiefer Glanz, hydrophober Effekt, UV- und Umweltschutz.",
      "Der finale Arbeitsumfang und Preis werden nach professioneller Begutachtung festgelegt.",
    ],
  },
];

export const englishOffers = [
  {
    title: "Full interior detail",
    price: "from 209 CHF",
    text: "Deep cleaning and care for the full vehicle interior.",
  },
  {
    title: "Full exterior detail",
    price: "from 109 CHF",
    text: "Safe hand wash, wheel cleaning and a clean protected finish.",
  },
  {
    title: "Full vehicle detail",
    price: "on request",
    text: "Interior and exterior combined for a complete refresh.",
  },
];

export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=Sternmatt%204%2C%206242%20Wauwil%2C%20Switzerland";

export const mapEmbedUrl =
  "https://www.google.com/maps?q=Sternmatt%204%2C%206242%20Wauwil%2C%20Switzerland&output=embed";
