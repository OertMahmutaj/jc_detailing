import type { Service } from "../data/site";
import type { PublicLocale } from "./i18n";

type ServiceText = {
  title: string;
  eyebrow: string;
  short: string;
  includes: readonly string[];
  process: string;
  outcome: string;
};

export type LocalizedService = Omit<Service, "title" | "eyebrow" | "short" | "includes" | "process" | "outcome"> & ServiceText;

const translatedServices: Record<Exclude<PublicLocale, "de">, Record<Service["id"], ServiceText>> = {
  en: {
    innenreinigung: {
      title: "Interior detailing",
      eyebrow: "Interior detailing",
      short: "Deep cleaning for seats, carpets, leather, plastics and windows.",
      includes: ["Vacuuming of the cabin and boot", "Shampoo and stain treatment", "Plastic and leather care", "Interior window cleaning", "Steam cleaning for hygienic details"],
      process: "We begin with a careful inspection of the interior, materials, dirt and sensitive areas. Loose dirt is removed first, followed by targeted treatment of fabrics and carpets, cleaning of plastics, and suitable care for leather and delicate surfaces.",
      outcome: "The cabin feels fresh, calm and well cared for again. Seats, carpets, leather, plastics and windows are visibly cleaner, making the vehicle much more pleasant to use every day.",
    },
    aussenreinigung: {
      title: "Exterior detailing",
      eyebrow: "Exterior detailing",
      short: "Careful hand wash, wheel cleaning, insect removal and tyre care.",
      includes: ["Snow-foam pre-wash", "Careful hand wash", "Wheel cleaning", "Insect removal", "Tyre and exterior plastic care"],
      process: "The exterior detail starts with a thorough pre-wash to loosen coarse dirt before the paint is touched. This is followed by a hand wash, wheel cleaning, detailed work around edges and emblems, and a clean finish for tyres and plastics.",
      outcome: "The vehicle looks visibly cleaner and better cared for without placing unnecessary stress on the paint. Gloss, contours and fine details become clearer again.",
    },
    politur: {
      title: "Paint polishing",
      eyebrow: "Paint correction",
      short: "Paint correction for more gloss, depth and fewer swirl marks.",
      includes: ["Paint assessment", "Careful pre-cleaning", "Machine polishing", "Reduction of swirls and holograms", "Finish inspection under dedicated lighting"],
      process: "Before polishing, the paint is cleaned and assessed under controlled lighting. We then choose the pad, compound and method to suit the paint condition, work panel by panel and check the finish throughout the process.",
      outcome: "The paint gains visible depth, clarity and gloss. Fine wash marks, dull areas and light defects are reduced, giving the vehicle a cleaner and more premium appearance.",
    },
    keramikversiegelung: {
      title: "Ceramic coating",
      eyebrow: "Ceramic coating",
      short: "Hydrophobic paint protection with a high-quality gloss finish.",
      includes: ["Thorough paint preparation", "Surface degreasing", "Ceramic coating application", "Hydrophobic protection", "Gloss and finish inspection", "Polishing"],
      process: "A ceramic coating requires a clean foundation: the paint is washed, prepared and degreased. The coating is then applied evenly, levelled and carefully inspected so that protection and appearance are both consistent.",
      outcome: "The surface receives a glossy, hydrophobic protective layer. Water beads more easily, dirt adheres less strongly and routine maintenance becomes simpler.",
    },
  },
  fr: {
    innenreinigung: {
      title: "Nettoyage intérieur",
      eyebrow: "Nettoyage intérieur",
      short: "Nettoyage en profondeur des sièges, tapis, cuirs, plastiques et vitres.",
      includes: ["Aspiration de l’habitacle et du coffre", "Shampoing et traitement des taches", "Entretien des plastiques et du cuir", "Nettoyage intérieur des vitres", "Nettoyage vapeur pour une hygiène optimale"],
      process: "Nous commençons par contrôler l’habitacle, les matériaux, le niveau de saleté et les zones sensibles. Les saletés libres sont retirées, puis les textiles et tapis sont traités, les plastiques nettoyés et les cuirs ou surfaces délicates entretenus avec les produits adaptés.",
      outcome: "L’habitacle retrouve une sensation de fraîcheur et de propreté. Les sièges, tapis, cuirs, plastiques et vitres sont nettement plus propres et le véhicule devient plus agréable au quotidien.",
    },
    aussenreinigung: {
      title: "Nettoyage extérieur",
      eyebrow: "Nettoyage extérieur",
      short: "Lavage à la main, nettoyage des jantes, retrait des insectes et soin des pneus.",
      includes: ["Prélavage Snow Foam", "Lavage à la main soigneux", "Nettoyage des jantes", "Retrait des insectes", "Entretien des pneus et plastiques extérieurs"],
      process: "Le nettoyage extérieur débute par un prélavage approfondi afin de dissoudre les saletés avant tout contact avec la peinture. Viennent ensuite le lavage à la main, les jantes, les contours et emblèmes, puis une finition propre des pneus et plastiques.",
      outcome: "Le véhicule paraît visiblement plus propre et soigné sans solliciter inutilement la peinture. La brillance, les lignes et les détails ressortent à nouveau clairement.",
    },
    politur: {
      title: "Polissage",
      eyebrow: "Correction de peinture",
      short: "Correction de la peinture pour plus de brillance, de profondeur et moins de micro-rayures.",
      includes: ["Analyse de la peinture", "Prénettoyage soigneux", "Polissage mécanique", "Réduction des hologrammes et micro-rayures", "Contrôle final sous éclairage"],
      process: "Avant le polissage, la peinture est nettoyée et analysée sous un éclairage adapté. Nous choisissons ensuite le pad, le polish et la méthode selon son état, puis travaillons panneau par panneau avec des contrôles réguliers.",
      outcome: "La peinture gagne en profondeur, en clarté et en brillance. Les traces de lavage, zones ternes et petits défauts sont réduits pour un aspect plus net et haut de gamme.",
    },
    keramikversiegelung: {
      title: "Protection céramique",
      eyebrow: "Protection céramique",
      short: "Protection hydrophobe de la peinture avec une finition brillante premium.",
      includes: ["Préparation complète de la peinture", "Dégraissage de la surface", "Application de la protection céramique", "Protection hydrophobe", "Contrôle de la brillance et de la finition", "Polissage"],
      process: "Une protection céramique exige une base parfaitement propre: la peinture est lavée, préparée et dégraissée. Le revêtement est ensuite appliqué, nivelé et contrôlé avec soin pour garantir une protection et un rendu homogènes.",
      outcome: "La surface reçoit une couche protectrice brillante et hydrophobe. L’eau perle plus facilement, la saleté adhère moins et l’entretien quotidien devient plus simple.",
    },
  },
  it: {
    innenreinigung: {
      title: "Pulizia interna",
      eyebrow: "Pulizia interna",
      short: "Pulizia profonda di sedili, tappeti, pelle, plastiche e vetri.",
      includes: ["Aspirazione di abitacolo e bagagliaio", "Shampoo e trattamento delle macchie", "Cura di plastiche e pelle", "Pulizia interna dei vetri", "Pulizia a vapore per dettagli igienizzati"],
      process: "Iniziamo con un controllo accurato dell’abitacolo, dei materiali, dello sporco e delle zone delicate. Rimuoviamo lo sporco libero, trattiamo tessuti e tappeti, puliamo le plastiche e curiamo pelle e superfici sensibili con prodotti adatti.",
      outcome: "L’abitacolo torna fresco, ordinato e curato. Sedili, tappeti, pelle, plastiche e vetri risultano più puliti e il veicolo è molto più piacevole da usare ogni giorno.",
    },
    aussenreinigung: {
      title: "Pulizia esterna",
      eyebrow: "Pulizia esterna",
      short: "Lavaggio a mano, pulizia dei cerchi, rimozione insetti e cura degli pneumatici.",
      includes: ["Prelavaggio Snow Foam", "Lavaggio a mano accurato", "Pulizia dei cerchi", "Rimozione degli insetti", "Cura di pneumatici e plastiche esterne"],
      process: "La pulizia esterna inizia con un prelavaggio approfondito per sciogliere lo sporco prima di toccare la vernice. Seguono lavaggio a mano, cerchi, dettagli su bordi ed emblemi e una finitura pulita per pneumatici e plastiche.",
      outcome: "Il veicolo appare visibilmente più pulito e curato senza stressare inutilmente la vernice. Brillantezza, linee e dettagli tornano in evidenza.",
    },
    politur: {
      title: "Lucidatura",
      eyebrow: "Correzione della vernice",
      short: "Correzione della vernice per più brillantezza, profondità e meno segni circolari.",
      includes: ["Analisi della vernice", "Prelavaggio accurato", "Lucidatura a macchina", "Riduzione di swirl e ologrammi", "Controllo finale sotto luce dedicata"],
      process: "Prima della lucidatura, la vernice viene pulita e valutata sotto una luce controllata. Scegliamo tampone, polish e metodo in base alle condizioni, lavoriamo pannello per pannello e controlliamo regolarmente la finitura.",
      outcome: "La vernice acquista profondità, chiarezza e brillantezza. I segni di lavaggio, le zone opache e i difetti leggeri vengono ridotti per un aspetto più pulito e pregiato.",
    },
    keramikversiegelung: {
      title: "Rivestimento ceramico",
      eyebrow: "Rivestimento ceramico",
      short: "Protezione idrofobica della vernice con finitura lucida premium.",
      includes: ["Preparazione accurata della vernice", "Sgrassaggio della superficie", "Applicazione del rivestimento ceramico", "Protezione idrofobica", "Controllo di brillantezza e finitura", "Lucidatura"],
      process: "Il rivestimento ceramico richiede una base perfettamente pulita: la vernice viene lavata, preparata e sgrassata. Il prodotto viene poi applicato, livellato e controllato con cura per ottenere protezione e aspetto uniformi.",
      outcome: "La superficie riceve uno strato protettivo lucido e idrofobico. L’acqua scivola più facilmente, lo sporco aderisce meno e la manutenzione quotidiana diventa più semplice.",
    },
  },
};

export function getLocalizedService(service: Service, locale: PublicLocale): LocalizedService {
  if (locale === "de") {
    return service as LocalizedService;
  }

  return { ...service, ...translatedServices[locale][service.id] };
}

export function getLocalizedServices(services: readonly Service[], locale: PublicLocale) {
  return services.map((service) => getLocalizedService(service, locale));
}

export const servicePageCopy = {
  de: {
    pageTitle: "Leistungen",
    pageIntro: "Vier klare Kategorien für professionelle Fahrzeugaufbereitung.",
    more: "Mehr erfahren",
    locationSuffix: "in Wauwil, Luzern",
    detailIntro: "Bei JC Detailing erhältst du professionelle Fahrzeugaufbereitung in Wauwil für Kunden aus dem Kanton Luzern und der Zentralschweiz.",
    request: "Termin anfragen",
    service: "Leistung",
    included: "Was bei dieser Leistung enthalten ist",
    process: "Ablauf",
    processTitle: "Professionelle Fahrzeugaufbereitung mit klarer Arbeitsweise",
    processCard: "Der Ablauf",
    resultCard: "Das Ergebnis",
    location: "Standort",
    locationTitle: "Professionelle Aufbereitung in Wauwil und Umgebung Luzern",
    locationText: "JC Detailing befindet sich in Wauwil im Kanton Luzern. Die Leistung eignet sich für Fahrzeughalter, die eine saubere, präzise und hochwertige Aufbereitung in der Zentralschweiz suchen.",
    ready: "Bereit für diese Leistung?",
    cta: "Schick uns dein Fahrzeugmodell, den aktuellen Zustand und dein Wunschdatum. Wir prüfen die Anfrage und melden uns mit einer passenden Terminbestätigung.",
  },
  en: {
    pageTitle: "Services",
    pageIntro: "Four focused categories for professional vehicle detailing.",
    more: "Learn more",
    locationSuffix: "in Wauwil, Lucerne",
    detailIntro: "JC Detailing provides professional vehicle detailing in Wauwil for customers throughout the Canton of Lucerne and Central Switzerland.",
    request: "Request appointment",
    service: "Service",
    included: "What is included",
    process: "Process",
    processTitle: "Professional detailing with a clear working process",
    processCard: "The process",
    resultCard: "The result",
    location: "Location",
    locationTitle: "Professional detailing in Wauwil and the Lucerne area",
    locationText: "JC Detailing is located in Wauwil in the Canton of Lucerne. This service is ideal for vehicle owners looking for clean, precise and high-quality detailing in Central Switzerland.",
    ready: "Ready for this service?",
    cta: "Send us your vehicle model, its current condition and your preferred date. We will review the request and reply with a suitable appointment confirmation.",
  },
  fr: {
    pageTitle: "Services",
    pageIntro: "Quatre catégories claires pour une préparation automobile professionnelle.",
    more: "En savoir plus",
    locationSuffix: "à Wauwil, Lucerne",
    detailIntro: "JC Detailing propose une préparation automobile professionnelle à Wauwil pour les clients du canton de Lucerne et de toute la Suisse centrale.",
    request: "Demander un rendez-vous",
    service: "Service",
    included: "Ce qui est inclus",
    process: "Déroulement",
    processTitle: "Une préparation professionnelle avec une méthode claire",
    processCard: "Le déroulement",
    resultCard: "Le résultat",
    location: "Localisation",
    locationTitle: "Préparation professionnelle à Wauwil et dans la région de Lucerne",
    locationText: "JC Detailing se trouve à Wauwil, dans le canton de Lucerne. Ce service s’adresse aux propriétaires qui recherchent une préparation propre, précise et haut de gamme en Suisse centrale.",
    ready: "Prêt pour ce service?",
    cta: "Envoyez-nous le modèle du véhicule, son état actuel et la date souhaitée. Nous examinerons la demande et vous répondrons avec une confirmation adaptée.",
  },
  it: {
    pageTitle: "Servizi",
    pageIntro: "Quattro categorie chiare per un detailing professionale.",
    more: "Scopri di più",
    locationSuffix: "a Wauwil, Lucerna",
    detailIntro: "JC Detailing offre detailing professionale a Wauwil per clienti del Canton Lucerna e di tutta la Svizzera centrale.",
    request: "Richiedi appuntamento",
    service: "Servizio",
    included: "Cosa è incluso",
    process: "Procedura",
    processTitle: "Detailing professionale con un metodo di lavoro chiaro",
    processCard: "La procedura",
    resultCard: "Il risultato",
    location: "Sede",
    locationTitle: "Detailing professionale a Wauwil e nella zona di Lucerna",
    locationText: "JC Detailing si trova a Wauwil, nel Canton Lucerna. Il servizio è pensato per chi cerca un trattamento pulito, preciso e di alta qualità nella Svizzera centrale.",
    ready: "Pronto per questo servizio?",
    cta: "Inviaci il modello del veicolo, le condizioni attuali e la data desiderata. Valuteremo la richiesta e risponderemo con una conferma adatta.",
  },
} satisfies Record<PublicLocale, Record<string, string>>;
