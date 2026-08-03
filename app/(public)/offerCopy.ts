import type { PublicLocale } from "./i18n";
import {
  fallbackPublicPricing,
  formatChfAmount,
  formatStartingPrice,
  type PublicPricing,
} from "./pricing";

export type LocalizedOffer = {
  title: string;
  price: string;
  text: string;
  details: string[];
};

const offersByLocale: Record<PublicLocale, LocalizedOffer[]> = {
  de: [
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
  ],
  en: [
    {
      title: "Complete interior detail",
      price: "from CHF 209",
      text: "Thorough cleaning and care of the complete cabin.",
      details: [
        "Vacuuming of the complete interior including footwells, seats and boot.",
        "Cleaning and care of all plastic surfaces with a protective finish.",
        "Door shuts, entry areas, seats, carpets and windows are cleaned thoroughly.",
        "Steam cleaning for hygienic interior disinfection.",
        "Gentle care for leather and Alcantara surfaces.",
      ],
    },
    {
      title: "Complete exterior detail",
      price: "from CHF 109",
      text: "Gentle hand wash, wheel cleaning and a cared-for finish.",
      details: [
        "Snow foam pre-wash to safely loosen dirt.",
        "Careful hand wash with high-quality cleaning products.",
        "Wheel cleaning including brake dust removal.",
        "Bug removal, door shuts, exterior glass and tyre care.",
        "Detail cleaning of emblems, grille and hard-to-reach areas.",
      ],
    },
    {
      title: "Complete detail",
      price: "on request",
      text: "Interior and exterior combined for a refreshed full vehicle finish.",
      details: [
        "Combination of interior and exterior detailing.",
        "Individual inspection of paint, cabin and vehicle condition.",
        "Recommended for vehicles that need a full refresh.",
        "The final scope is agreed after inspection.",
      ],
    },
    {
      title: "Add-ons",
      price: "from CHF 30",
      text: "Optional extras depending on what the vehicle needs.",
      details: [
        "Pet hair removal from CHF 50.",
        "Boot deep clean from CHF 40.",
        "Seat deep cleaning from CHF 80.",
        "Headliner cleaning from CHF 50.",
        "Intensive floor mat cleaning from CHF 30.",
      ],
    },
    {
      title: "Polishing",
      price: "from CHF 399",
      text: "Paint correction, high-gloss finish and visibly more colour depth.",
      details: [
        "1-step polish from CHF 399 for gloss, light scratch removal and reduced swirls.",
        "2-step polish from CHF 599 with cut and finish for a visibly improved paint finish.",
        "The paint is cleaned, prepared and polished according to its condition.",
        "The goal is safe paint correction with more clarity, depth and gloss.",
        "Final scope and price are confirmed after a professional inspection.",
      ],
    },
    {
      title: "Ceramic coating",
      price: "from CHF 1090",
      text: "Long-term hydrophobic protection with a premium gloss finish.",
      details: [
        "Ceramic coating from CHF 1090 including washing, preparation, degreasing and polishing.",
        "The coating is applied in a controlled process, cured and finally inspected.",
        "Benefits: deep gloss, hydrophobic effect, UV and environmental protection.",
        "Durability depends on care and use, usually around 12 to 36 months.",
        "Final scope and price are confirmed after a professional inspection.",
      ],
    },
  ],
  fr: [
    {
      title: "Nettoyage intérieur complet",
      price: "dès CHF 209",
      text: "Nettoyage et soin approfondis de tout l'habitacle.",
      details: [
        "Aspiration complète de l'habitacle, y compris planchers, sièges et coffre.",
        "Nettoyage et soin des surfaces plastiques avec finition protectrice.",
        "Nettoyage des seuils, zones d'accès, sièges, tapis et vitres.",
        "Nettoyage vapeur pour une désinfection hygiénique de l'intérieur.",
        "Soin doux du cuir et de l'Alcantara.",
      ],
    },
    {
      title: "Nettoyage extérieur complet",
      price: "dès CHF 109",
      text: "Lavage à la main, soin des jantes et finition soignée.",
      details: [
        "Prélavage Snow Foam pour détacher la saleté en douceur.",
        "Lavage manuel avec produits de qualité.",
        "Nettoyage des jantes avec élimination de la poussière de frein.",
        "Retrait des insectes, nettoyage des seuils, vitres extérieures et pneus.",
        "Nettoyage détaillé des emblèmes, calandre et zones difficiles d'accès.",
      ],
    },
    {
      title: "Préparation complète",
      price: "sur demande",
      text: "Intérieur et extérieur réunis pour un véhicule entièrement rafraîchi.",
      details: [
        "Combinaison du nettoyage intérieur et extérieur.",
        "Contrôle individuel de la peinture, de l'habitacle et de l'état du véhicule.",
        "Recommandé pour les véhicules qui nécessitent une remise en état complète.",
        "Le détail exact est défini après inspection.",
      ],
    },
    {
      title: "Options",
      price: "dès CHF 30",
      text: "Prestations supplémentaires selon les besoins du véhicule.",
      details: [
        "Élimination des poils d'animaux dès CHF 50.",
        "Nettoyage en profondeur du coffre dès CHF 40.",
        "Nettoyage profond des sièges dès CHF 80.",
        "Nettoyage du ciel de toit dès CHF 50.",
        "Nettoyage intensif des tapis dès CHF 30.",
      ],
    },
    {
      title: "Polissage",
      price: "dès CHF 399",
      text: "Correction de peinture, finition brillante et profondeur visible.",
      details: [
        "Polissage 1 étape dès CHF 399 pour plus de brillance et une réduction des défauts légers.",
        "Polissage 2 étapes dès CHF 599 avec correction et finition pour un résultat plus net.",
        "La peinture est nettoyée, préparée et polie selon son état.",
        "L'objectif est une correction sûre avec plus de clarté, de profondeur et de brillance.",
        "Le prix et l'étendue finale sont confirmés après inspection professionnelle.",
      ],
    },
    {
      title: "Protection céramique",
      price: "dès CHF 1090",
      text: "Protection longue durée hydrophobe avec finition premium.",
      details: [
        "Protection céramique dès CHF 1090 incluant lavage, préparation, dégraissage et polissage.",
        "La protection est appliquée de façon contrôlée, durcie puis vérifiée.",
        "Avantages: brillance profonde, effet hydrophobe, protection UV et environnementale.",
        "La durabilité dépend de l'entretien et de l'utilisation, généralement 12 à 36 mois.",
        "Le prix et l'étendue finale sont confirmés après inspection professionnelle.",
      ],
    },
  ],
  it: [
    {
      title: "Pulizia interna completa",
      price: "da CHF 209",
      text: "Pulizia e cura approfondita dell'intero abitacolo.",
      details: [
        "Aspirazione completa degli interni, inclusi zona piedi, sedili e bagagliaio.",
        "Pulizia e cura delle superfici in plastica con finitura protettiva.",
        "Pulizia di battute porta, ingressi, sedili, tappeti e vetri.",
        "Pulizia a vapore per una sanificazione igienica degli interni.",
        "Cura delicata di pelle e Alcantara.",
      ],
    },
    {
      title: "Pulizia esterna completa",
      price: "da CHF 109",
      text: "Lavaggio a mano delicato, cura cerchi e finitura pulita.",
      details: [
        "Prelavaggio con Snow Foam per sciogliere lo sporco in modo delicato.",
        "Lavaggio a mano con prodotti di alta qualità.",
        "Pulizia dei cerchi con rimozione della polvere dei freni.",
        "Rimozione insetti, battute porta, vetri esterni e cura pneumatici.",
        "Pulizia dettagliata di emblemi, griglia e zone difficili da raggiungere.",
      ],
    },
    {
      title: "Preparazione completa",
      price: "su richiesta",
      text: "Interni ed esterni insieme per un risultato completo e fresco.",
      details: [
        "Combinazione di pulizia interna ed esterna.",
        "Controllo individuale di vernice, abitacolo e stato del veicolo.",
        "Consigliato per veicoli che necessitano di una rinfrescata completa.",
        "Il lavoro esatto viene definito dopo l'ispezione.",
      ],
    },
    {
      title: "Add-on",
      price: "da CHF 30",
      text: "Servizi opzionali in base alle esigenze del veicolo.",
      details: [
        "Rimozione peli animali da CHF 50.",
        "Pulizia profonda del bagagliaio da CHF 40.",
        "Pulizia profonda dei sedili da CHF 80.",
        "Pulizia del cielo interno da CHF 50.",
        "Pulizia intensiva tappetini da CHF 30.",
      ],
    },
    {
      title: "Lucidatura",
      price: "da CHF 399",
      text: "Correzione della vernice, finitura lucida e maggiore profondità.",
      details: [
        "Lucidatura 1-step da CHF 399 per gloss, difetti leggeri e riduzione degli swirl.",
        "Lucidatura 2-step da CHF 599 con taglio e finitura per una vernice visibilmente migliore.",
        "La vernice viene pulita, preparata e lucidata in base al suo stato.",
        "L'obiettivo è una correzione sicura con più chiarezza, profondità e gloss.",
        "L'intervento finale e il prezzo sono confermati dopo un'ispezione professionale.",
      ],
    },
    {
      title: "Rivestimento ceramico",
      price: "da CHF 1090",
      text: "Protezione idrofobica a lungo termine con finitura premium.",
      details: [
        "Rivestimento ceramico da CHF 1090 con lavaggio, preparazione, sgrassaggio e lucidatura.",
        "Il rivestimento viene applicato in modo controllato, indurito e controllato alla fine.",
        "Vantaggi: gloss profondo, effetto idrofobico, protezione UV e ambientale.",
        "La durata dipende dalla cura e dall'utilizzo, solitamente circa 12-36 mesi.",
        "L'intervento finale e il prezzo sono confermati dopo un'ispezione professionale.",
      ],
    },
  ],
};

function replaceAmount(text: string, original: number, current: number) {
  return text.replace(
    new RegExp(`\\b${original}\\b`, "g"),
    formatChfAmount(current),
  );
}

export function getLocalizedOffers(
  locale: PublicLocale,
  pricing: PublicPricing = fallbackPublicPricing,
): LocalizedOffer[] {
  const prices = [
    pricing.interior,
    pricing.exterior,
    pricing.premium,
    pricing.addOns,
    pricing.polishOneStep,
    pricing.ceramic,
  ];

  const offers = offersByLocale[locale].map((offer, index) => ({
    ...offer,
    details: [...offer.details],
    price: formatStartingPrice(locale, prices[index]),
  }));

  const addOnAmounts = [
    pricing.addOnPrices.petHair,
    pricing.addOnPrices.trunk,
    pricing.addOnPrices.seats,
    pricing.addOnPrices.headliner,
    pricing.addOnPrices.mats,
  ];
  const originalAddOnAmounts = [50, 40, 80, 50, 30];

  offers[3].details = offers[3].details.map((detail, index) =>
    replaceAmount(detail, originalAddOnAmounts[index], addOnAmounts[index]),
  );
  offers[4].details[0] = replaceAmount(
    offers[4].details[0],
    399,
    pricing.polishOneStep,
  );
  offers[4].details[1] = replaceAmount(
    offers[4].details[1],
    599,
    pricing.polishTwoStep,
  );
  offers[5].details[0] = replaceAmount(
    offers[5].details[0],
    1090,
    pricing.ceramic,
  );

  return offers;
}

export const offersPageCopy = {
  de: {
    eyebrow: "Angebote",
    title: "Angebote",
    intro:
      "Klare Einstiegspreise. Der finale Preis hängt von Fahrzeuggrösse und Zustand ab.",
    detailLabel: "Mehr erfahren",
    closeLabel: "Schliessen",
    allLabel: "Alle Angebote",
    bookLabel: "Termin buchen",
  },
  en: {
    eyebrow: "Offers",
    title: "Offers",
    intro:
      "Clear starting prices. The final price depends on vehicle size and condition.",
    detailLabel: "Read more",
    closeLabel: "Close",
    allLabel: "All offers",
    bookLabel: "Book appointment",
  },
  fr: {
    eyebrow: "Offres",
    title: "Offres",
    intro:
      "Prix de départ transparents. Le prix final dépend de la taille et de l'état du véhicule.",
    detailLabel: "En savoir plus",
    closeLabel: "Fermer",
    allLabel: "Toutes les offres",
    bookLabel: "Réserver",
  },
  it: {
    eyebrow: "Offerte",
    title: "Offerte",
    intro:
      "Prezzi di partenza chiari. Il prezzo finale dipende dalle dimensioni e dallo stato del veicolo.",
    detailLabel: "Scopri di più",
    closeLabel: "Chiudi",
    allLabel: "Tutte le offerte",
    bookLabel: "Prenota",
  },
} satisfies Record<
  PublicLocale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    detailLabel: string;
    closeLabel: string;
    allLabel: string;
    bookLabel: string;
  }
>;
