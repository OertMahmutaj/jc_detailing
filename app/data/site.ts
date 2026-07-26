export type ServiceId =
  | "innenreinigung"
  | "aussenreinigung"
  | "politur"
  | "keramikversiegelung";

export type Service = {
  id: ServiceId;
  path: `/leistungen/${ServiceId}`;
  title: string;
  eyebrow: string;
  image: string;
  summary: string;
  description: string;
  includes: string[];
  process: string;
  outcome: string;
};

export const services = {
  innenreinigung: {
    id: "innenreinigung",
    path: "/leistungen/innenreinigung",
    title: "Innenreinigung",
    eyebrow: "Interior Detail",
    image: "/innenreinigung.webp",
    summary: "Tiefenpflege für Leder, Stoffe und Innenraumdetails.",
    description:
      "Wir reinigen Sitze, Teppiche, Kunststoff, Leder, Alcantara und Scheiben gründlich und hygienisch, damit sich der Innenraum wieder gepflegt und frisch anfühlt.",
    includes: [
      "Staubsaugen von Fussraum, Sitzen und Kofferraum",
      "Reinigung von Cockpit, Ablagen und Türverkleidungen",
      "Sitz- und Teppichtiefenreinigung",
      "Scheibenreinigung innen",
      "Dampfreinigung für hygienische Details",
      "Schonende Pflege von Leder und Alcantara",
    ],
    process:
      "Der Innenraum wird zuerst kontrolliert, danach trocken gereinigt, tiefenbehandelt und zum Schluss mit passenden Pflegeprodukten geschützt.",
    outcome:
      "Ein sauberer, frischer und gepflegter Innenraum mit deutlich angenehmerem Fahrgefühl.",
  },
  aussenreinigung: {
    id: "aussenreinigung",
    path: "/leistungen/aussenreinigung",
    title: "Aussenreinigung",
    eyebrow: "Exterior Detail",
    image: "/aussenreinigung.webp",
    summary: "Schonende Handwäsche, Felgenpflege und Schutzfinish.",
    description:
      "Die Aussenreinigung löst Schmutz materialschonend, pflegt Felgen und Details und bringt den Lack wieder sauber und kontrolliert zur Geltung.",
    includes: [
      "Vorwäsche mit Snow Foam",
      "Schonende Handwäsche",
      "Felgenreinigung und Insektenentfernung",
      "Reinigung von Türfalzen und Einstiegsbereichen",
      "Scheibenreinigung aussen",
      "Reifenpflege mit hochwertigem Dressing",
    ],
    process:
      "Wir lösen groben Schmutz kontaktarm, waschen das Fahrzeug per Hand, reinigen Details und trocknen den Lack schonend.",
    outcome:
      "Ein gepflegtes Exterieur mit sauberem Finish und sichtbar frischer Optik.",
  },
  politur: {
    id: "politur",
    path: "/leistungen/politur",
    title: "Politur",
    eyebrow: "Paint Correction",
    image: "/politur.webp",
    summary: "Mehr Tiefe, Klarheit und Glanz für den Lack.",
    description:
      "Die Politur reduziert leichte Kratzer, Swirls und matte Stellen. Je nach Lackzustand wird ein 1-Step oder 2-Step Verfahren gewählt.",
    includes: [
      "Lackwäsche und Vorbereitung",
      "Entfettung und Kontrolle des Lackzustands",
      "1-Step oder 2-Step Politur",
      "Reduktion von Swirls und leichten Kratzern",
      "Hochglanz-Finish",
      "Abschlusskontrolle unter Licht",
    ],
    process:
      "Nach der Vorbereitung wird der Lack geprüft, passend poliert und unter Licht kontrolliert, damit Glanz und Tiefe sicher verbessert werden.",
    outcome:
      "Sichtbar klarerer Lack mit mehr Tiefe, Glanz und einer hochwertigeren Gesamtwirkung.",
  },
  keramikversiegelung: {
    id: "keramikversiegelung",
    path: "/leistungen/keramikversiegelung",
    title: "Keramikversiegelung",
    eyebrow: "Ceramic Coating",
    image: "/keramikversiegelung.webp",
    summary: "Langzeit-Schutz mit hydrophobem Premium-Finish.",
    description:
      "Die Keramikversiegelung schützt den Lack langfristig und sorgt für starken Glanz, hydrophoben Effekt sowie bessere Beständigkeit gegen Umwelteinflüsse.",
    includes: [
      "Gründliche Lackwäsche",
      "Lackvorbereitung",
      "Entfettung der Oberfläche",
      "Politur",
      "Keramikbeschichtung",
      "Hydrophober Schutz",
      "Glanz- und Finishkontrolle",
    ],
    process:
      "Die Keramikversiegelung braucht eine saubere Grundlage: Der Lack wird gewaschen, vorbereitet, entfettet und poliert. Danach wird die Beschichtung kontrolliert aufgetragen und in Ruhe geprüft, damit Schutz und Optik sauber sitzen.",
    outcome:
      "Ein tiefer Showroom-Glanz mit langanhaltendem Schutz und leichterer Pflege im Alltag.",
  },
} satisfies Record<ServiceId, Service>;

export const serviceList = Object.values(services);
export const serviceItems = serviceList;

export const germanOffers = [
  {
    title: "Komplette Innenreinigung",
    price: "ab 209 CHF",
    text: "Gründliche Reinigung und Pflege des gesamten Innenraums.",
    details: [
      "Staubsaugung des gesamten Innenraums inklusive Fussraum, Sitze und Kofferraum.",
      "Reinigung und Pflege aller Kunststoffoberflächen mit schützendem Finish.",
      "Türfalze, Einstiegsbereiche, Sitze, Teppiche und Scheiben werden gründlich gereinigt.",
      "Dampfreinigung zur hygienischen Desinfektion des Innenraums.",
      "Schonende Pflege von Leder- und Alcantaraflächen.",
    ],
  },
  {
    title: "Komplette Aussenreinigung",
    price: "ab 109 CHF",
    text: "Schonende Handwäsche, Felgenreinigung und gepflegtes Finish.",
    details: [
      "Vorwäsche mit Snow Foam zur schonenden Schmutzlösung.",
      "Sorgfältige Handwäsche mit hochwertigen Reinigungsmitteln.",
      "Felgenreinigung inklusive Entfernung von Bremsstaub.",
      "Insektenentfernung, Türfalze, Scheibenreinigung und Reifenpflege.",
      "Detailreinigung von Emblemen, Kühlergrill und schwer zugänglichen Bereichen.",
    ],
  },
  {
    title: "Komplette Aufbereitung",
    price: "auf Anfrage",
    text: "Innen und aussen kombiniert für ein frisches Gesamtbild.",
    details: [
      "Kombination aus Innenreinigung und Aussenreinigung.",
      "Individuelle Kontrolle von Lack, Innenraum und Fahrzeugzustand.",
      "Empfohlen für Fahrzeuge, die umfassend aufgefrischt werden sollen.",
      "Der genaue Umfang wird nach Begutachtung abgestimmt.",
    ],
  },
  {
    title: "Add-ons",
    price: "ab 30 CHF",
    text: "Optionale Zusatzleistungen nach Bedarf.",
    details: [
      "Tierhaarentfernung ab 50 CHF.",
      "Kofferraum Deep Clean ab 40 CHF.",
      "Sitze Tiefenreinigung ab 80 CHF.",
      "Dachhimmel Reinigung ab 50 CHF.",
      "Fussmatten intensiv ab 30 CHF.",
    ],
  },
  {
    title: "Politur",
    price: "ab 399 CHF",
    text: "Lackkorrektur, Hochglanz-Finish und sichtbar mehr Farbtiefe.",
    details: [
      "Polish Paket 1-Step ab 399 CHF für Glanz, leichte Kratzerentfernung und reduzierte Swirls.",
      "Polish Paket 2-Step ab 599 CHF mit Cut und Finish für deutlich verbesserte Lackoptik.",
      "Der Lack wird gereinigt, vorbereitet und passend zum Zustand kontrolliert poliert.",
      "Ziel ist eine sichere, materialschonende Aufbereitung mit sichtbarer Klarheit und Tiefe.",
      "Der finale Arbeitsumfang und Preis werden nach professioneller Begutachtung festgelegt.",
    ],
  },
  {
    title: "Keramikversiegelung",
    price: "ab 1090 CHF",
    text: "Mehrschichtiger Langzeitschutz mit hydrophobem Effekt und hochwertigem Glanz.",
    details: [
      "Keramikversiegelung ab 1090 CHF inklusive Lackwäsche, Vorbereitung, Entfettung und Politur.",
      "Die Keramikbeschichtung wird kontrolliert aufgetragen, ausgehärtet und final geprüft.",
      "Vorteile: tiefer Glanz, hydrophober Effekt, UV- und Umweltschutz.",
      "Haltbarkeit je nach Pflege und Nutzung etwa 12 bis 36 Monate.",
      "Der finale Arbeitsumfang und Preis werden nach professioneller Begutachtung festgelegt.",
    ],
  },
] as const;

export const englishOffers = [
  {
    title: "Complete interior detail",
    price: "from CHF 209",
    text: "Thorough cleaning and care of the complete cabin.",
  },
  {
    title: "Complete exterior detail",
    price: "from CHF 109",
    text: "Gentle hand wash, wheel cleaning and a cared-for finish.",
  },
  {
    title: "Complete detail",
    price: "on request",
    text: "Interior and exterior combined for a refreshed full vehicle finish.",
  },
  {
    title: "Polishing",
    price: "from CHF 399",
    text: "Paint correction, high-gloss finish and visibly more colour depth.",
  },
  {
    title: "Ceramic coating",
    price: "from CHF 1090",
    text: "Long-term hydrophobic protection with a premium gloss finish.",
  },
] as const;

export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=Sternmatt+4,+6242+Wauwil,+Switzerland";

export const mapEmbedUrl =
  "https://www.google.com/maps?q=Sternmatt%204%2C%206242%20Wauwil%2C%20Switzerland&output=embed";

export const staticMapUrl =
  "https://maps.googleapis.com/maps/api/staticmap?center=Sternmatt+4,6242+Wauwil,Switzerland&zoom=15&size=640x360&scale=2&maptype=roadmap&markers=color:red%7CSternmatt+4,6242+Wauwil,Switzerland";
