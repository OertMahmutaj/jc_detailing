// app/data/site.ts

export const services = {
  innenreinigung: {
    id: "innenreinigung",
    path: "/leistungen/innenreinigung",
    title: "Innenreinigung",
    eyebrow: "Interior detailing",
    short: "Tiefenreinigung von Sitzen, Teppichen, Leder, Kunststoff und Scheiben.",
    image: "/innenreinigung.webp",
    includes: [
      "Staubsaugen von Innenraum und Kofferraum",
      "Shampoo- und Fleckenbehandlung",
      "Kunststoff- und Lederpflege",
      "Scheibenreinigung innen",
      "Dampfreinigung für hygienische Details",
    ],
    process:
      "Wir starten mit einer kurzen Kontrolle des Innenraums und schauen uns Material, Verschmutzung und empfindliche Stellen genau an. Danach werden lose Verschmutzungen entfernt, Textilien und Teppiche behandelt, Kunststoffe gereinigt und Leder oder empfindliche Flächen passend gepflegt.",
    outcome:
      "Der Innenraum wirkt wieder frisch, ruhig und gepflegt. Sitze, Teppiche, Leder, Kunststoffe und Scheiben fühlen sich sauberer an und das Fahrzeug ist im Alltag deutlich angenehmer zu nutzen.",
  },
  aussenreinigung: {
    id: "aussenreinigung",
    path: "/leistungen/aussenreinigung",
    title: "Aussenreinigung",
    eyebrow: "Exterior detailing",
    short: "Schonende Handwäsche, Felgenreinigung, Insektenentfernung und Reifenpflege.",
    image: "/aussenreinigung.webp",
    includes: [
      "Snow-Foam-Vorwäsche",
      "Schonende Handwäsche",
      "Felgenreinigung",
      "Insektenentfernung",
      "Reifen- und Kunststoffpflege",
    ],
    process:
      "Die Aussenreinigung beginnt mit einer gründlichen Vorwäsche, damit grober Schmutz gelöst wird, bevor der Lack berührt wird. Danach folgen Handwäsche, Felgenreinigung, Detailarbeit an Kanten und Emblemen sowie ein sauberes Finish für Reifen und Kunststoffteile.",
    outcome:
      "Das Fahrzeug steht sichtbar sauberer und gepflegter da, ohne den Lack unnötig zu belasten. Glanz, Konturen und Details kommen wieder klarer zur Geltung.",
  },
  politur: {
    id: "politur",
    path: "/leistungen/politur",
    title: "Politur",
    eyebrow: "Paint correction",
    short: "Lackaufbereitung für mehr Glanz, Tiefe und weniger Swirls.",
    image: "/politur.webp",
    includes: [
      "Lackanalyse",
      "Schonende Vorreinigung",
      "Maschinelle Politur",
      "Swirl- und Hologrammreduzierung",
      "Finish-Kontrolle im Licht",
    ],
    process:
      "Vor der Politur wird der Lack gereinigt und im Licht beurteilt. Anschliessend wählen wir Pad, Politur und Arbeitsweise passend zum Lackzustand, arbeiten kontrolliert Bauteil für Bauteil und prüfen das Finish regelmässig.",
    outcome:
      "Der Lack gewinnt sichtbar an Tiefe, Klarheit und Glanz. Feine Waschspuren, matte Stellen und leichte Defekte werden reduziert, sodass das Fahrzeug hochwertiger und sauberer wirkt.",
  },
  keramikversiegelung: {
    id: "keramikversiegelung",
    path: "/leistungen/keramikversiegelung",
    title: "Keramikversiegelung",
    eyebrow: "Ceramic coating",
    short: "Hydrophober Lackschutz mit hochwertigem Glanz-Finish.",
    image: "/keramikversiegelung.webp",
    includes: [
      "Gründliche Lackvorbereitung",
      "Entfettung der Oberfläche",
      "Keramikbeschichtung",
      "Hydrophober Schutz",
      "Glanz- und Finishkontrolle",
    ],
    process:
      "Die Keramikversiegelung braucht eine saubere Grundlage: der Lack wird gewaschen, vorbereitet und entfettet. Danach wird die Beschichtung kontrolliert aufgetragen, auspoliert und in Ruhe gepüft, damit Schutz und Optik sauber sitzen.",
    outcome:
      "Die Oberfläche bekommt einen glänzenden, hydrophoben Schutzfilm. Wasser perlt leichter ab, Schmutz haftet weniger stark und die Pflege wird im Alltag einfacher.",
  },
} as const;

export type Service = (typeof services)[keyof typeof services];

export const serviceItems = Object.values(services);

export const germanOffers = [
  {
    title: "Komplett Innenreinigung",
    price: "ab 209 CHF",
    text: "Gründliche Reinigung und Pflege des gesamten Innenraums.",
    details: [
      "Gründliche Staubsaugung von Fussraum, Sitzen und Kofferraum.",
      "Intensive Reinigung und Pflege aller Kunststoffoberflächen inklusive schützendem Finish.",
      "Tiefenreinigung der Sitze inklusive Shampoo- und Fleckenbehandlung.",
      "Professionelle Teppichtiefenreinigung und streifenfreie Scheibenreinigung innen.",
      "Dampfreinigung zur hygienischen Desinfektion des Innenraums.",
      "Schonende Reinigung und Pflege von Leder- und Alcantaraflächen.",
    ],
  },
  {
    title: "Komplett Aussenreinigung",
    price: "ab 109 CHF",
    text: "Schonende Handwäsche, Felgenreinigung und gepflegtes Finish.",
    details: [
      "Gründliche Vorwäsche mit Snow Foam zur schonenden Schmutzlösung.",
      "Sorgfältige Handwäsche mit hochwertigen Reinigungsmitteln.",
      "Schonende Trocknung des gesamten Fahrzeugs.",
      "Intensive Felgenreinigung inklusive Entfernung von Bremsstaub.",
      "Entfernung von Insektenückständen an Front und Spiegeln.",
      "Reinigung der Türfalze, Einstiegsbereiche, Embleme und schwer zugänglichen Details.",
    ],
  },
  {
    title: "Komplett Aufbereitung",
    price: "auf Anfrage",
    text: "Innen und aussen kombiniert für ein frisches Gesamtbild.",
    details: [
      "Kombination aus Innenreinigung und Aussenreinigung für ein vollständiges Ergebnis.",
      "Ideal für Fahrzeuge, die sichtbar aufgefrischt und gepflegt werden sollen.",
      "Materialschonende Reinigung innen und aussen mit hochwertigem Finish.",
      "Finale Kontrolle vor der Übergabe.",
      "Der genaue Umfang wird je nach Fahrzeuggrösse und Zustand vor Ort abgestimmt.",
    ],
  },
  {
    title: "Erhaltungspflege",
    price: "ab 69 CHF",
    text: "Regelmässige Pflege für bereits aufbereitete oder gepflegte Fahrzeuge.",
    details: [
      "Voraussetzung: Das Fahrzeug wurde zuvor durch JC Detailing aufbereitet oder befindet sich in gepflegtem Zustand.",
      "Innenpflege ab 129 CHF mit Staubsaugen, Armaturenbrett, Mittelkonsole und Kunststoffoberflächen.",
      "Türfalze, Einstiegsbereiche und Türverkleidungen werden sauber nachgepflegt.",
      "Aussenpflege ab 69 CHF mit Snow Foam, Handwäsche, schonender Trocknung und Felgenreinigung.",
      "Ideal, um den hochwertigen Zustand regelmässig zu erhalten.",
    ],
  },
  {
    title: "Add-ons",
    price: "ab 30 CHF",
    text: "Zusatzleistungen wie Tierhaarentfernung, Kofferraum Deep Clean und Sitzreinigung.",
    details: [
      "Tierhaarentfernung ab CHF 50 für hartnäckige Tierhaare.",
      "Kofferraum Deep Clean ab CHF 40 für eine gründliche Reinigung des Kofferraums.",
      "Sitze Tiefenreinigung ab CHF 80 für hygienische Polsterreinigung.",
      "Dachhimmel Reinigung ab CHF 50 für empfindliche Dachhimmel-Oberflächen.",
      "Fussmatten intensiv ab CHF 30 für tiefengereinigte Fussmatten.",
    ],
  },
  {
    title: "Politur & Keramik",
    price: "ab 399 CHF",
    text: "Lackkorrektur, Hochglanz-Finish und langfristiger Keramikschutz.",
    details: [
      "Polish Paket 1 Step ab 399 CHF für Glanz, leichte Kratzerentfernung und reduzierte Swirls.",
      "Polish Paket 2 Step ab 599 CHF mit Cut und Finish für deutlich verbesserte Lackoptik.",
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
