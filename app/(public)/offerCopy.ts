import { germanOffers } from "../data/site";
import type { PublicLocale } from "./i18n";

export type LocalizedOffer = {
  title: string;
  price: string;
  text: string;
  details: readonly string[];
};

const translatedOffers: Record<Exclude<PublicLocale, "de">, LocalizedOffer[]> = {
  en: [
    {
      title: "Complete interior detail",
      price: "from CHF 209",
      text: "Thorough cleaning and care for the entire interior.",
      details: ["Vacuuming of the footwells, seats and boot", "Deep cleaning and protective care for plastic surfaces", "Seat shampoo and stain treatment", "Deep carpet cleaning and streak-free interior windows", "Steam cleaning for a hygienic interior", "Careful cleaning of leather and Alcantara"],
    },
    {
      title: "Complete exterior detail",
      price: "from CHF 109",
      text: "Careful hand wash, wheel cleaning and a refined finish.",
      details: ["Snow-foam pre-wash to loosen dirt safely", "Careful hand wash with high-quality products", "Gentle drying of the complete vehicle", "Intensive wheel cleaning and brake-dust removal", "Removal of insect residue from the front and mirrors", "Cleaning of door shuts, emblems and hard-to-reach details"],
    },
    {
      title: "Complete vehicle detail",
      price: "on request",
      text: "Interior and exterior combined for a complete refresh.",
      details: ["Interior and exterior detailing combined in one package", "Ideal for visibly refreshing and caring for the full vehicle", "Material-safe cleaning with a premium finish", "Final inspection before handover", "The exact scope depends on vehicle size and condition"],
    },
    {
      title: "Maintenance care",
      price: "from CHF 69",
      text: "Regular care for vehicles already detailed or kept in good condition.",
      details: ["Available for vehicles previously detailed by JC Detailing or already in good condition", "Interior maintenance from CHF 129", "Cleaning of dashboard, centre console, plastics and door shuts", "Exterior maintenance from CHF 69 with Snow Foam, hand wash and wheel cleaning", "Ideal for preserving a premium condition"],
    },
    {
      title: "Add-ons",
      price: "from CHF 30",
      text: "Additional services such as pet-hair removal, boot deep clean and seat cleaning.",
      details: ["Pet-hair removal from CHF 50", "Boot deep clean from CHF 40", "Deep seat cleaning from CHF 80", "Headliner cleaning from CHF 50", "Intensive floor-mat cleaning from CHF 30"],
    },
    {
      title: "Polishing & ceramic coating",
      price: "from CHF 399",
      text: "Paint correction, high-gloss finish and long-term ceramic protection.",
      details: ["1-step polish from CHF 399 for gloss and light defect removal", "2-step polish from CHF 599 with cut and finish", "Ceramic package from CHF 1090 including preparation, polishing and coating", "Deep gloss, hydrophobic effect and environmental protection", "Final scope and price are confirmed after a professional inspection"],
    },
  ],
  fr: [
    {
      title: "Nettoyage intérieur complet",
      price: "dès CHF 209",
      text: "Nettoyage et entretien approfondis de tout l’habitacle.",
      details: ["Aspiration des sols, sièges et coffre", "Nettoyage profond et protection des surfaces en plastique", "Shampoing des sièges et traitement des taches", "Nettoyage profond des tapis et vitres intérieures sans traces", "Nettoyage vapeur pour une hygiène optimale", "Nettoyage soigneux du cuir et de l’Alcantara"],
    },
    {
      title: "Nettoyage extérieur complet",
      price: "dès CHF 109",
      text: "Lavage à la main, nettoyage des jantes et finition soignée.",
      details: ["Prélavage Snow Foam pour dissoudre la saleté en douceur", "Lavage à la main avec des produits de qualité", "Séchage délicat de tout le véhicule", "Nettoyage intensif des jantes et retrait de la poussière de frein", "Retrait des insectes à l’avant et sur les rétroviseurs", "Nettoyage des seuils, emblèmes et zones difficiles d’accès"],
    },
    {
      title: "Préparation complète",
      price: "sur demande",
      text: "Intérieur et extérieur réunis pour un résultat complet.",
      details: ["Nettoyage intérieur et extérieur dans une même formule", "Idéal pour rafraîchir visiblement tout le véhicule", "Nettoyage respectueux des matériaux et finition premium", "Contrôle final avant la remise", "L’étendue exacte dépend de la taille et de l’état du véhicule"],
    },
    {
      title: "Entretien régulier",
      price: "dès CHF 69",
      text: "Entretien régulier des véhicules déjà préparés ou bien conservés.",
      details: ["Pour les véhicules déjà préparés par JC Detailing ou en bon état", "Entretien intérieur dès CHF 129", "Tableau de bord, console, plastiques et seuils", "Entretien extérieur dès CHF 69 avec Snow Foam, lavage à la main et jantes", "Idéal pour conserver un état haut de gamme"],
    },
    {
      title: "Options supplémentaires",
      price: "dès CHF 30",
      text: "Retrait des poils, nettoyage profond du coffre et nettoyage des sièges.",
      details: ["Retrait des poils d’animaux dès CHF 50", "Nettoyage profond du coffre dès CHF 40", "Nettoyage profond des sièges dès CHF 80", "Nettoyage du ciel de toit dès CHF 50", "Nettoyage intensif des tapis dès CHF 30"],
    },
    {
      title: "Polissage & céramique",
      price: "dès CHF 399",
      text: "Correction de peinture, finition brillante et protection céramique durable.",
      details: ["Polissage 1 étape dès CHF 399", "Polissage 2 étapes dès CHF 599 avec correction et finition", "Formule céramique dès CHF 1090 avec préparation et polissage", "Brillance profonde, effet hydrophobe et protection environnementale", "L’étendue et le prix sont confirmés après inspection"],
    },
  ],
  it: [
    {
      title: "Pulizia interna completa",
      price: "da CHF 209",
      text: "Pulizia e cura approfondite di tutto l’abitacolo.",
      details: ["Aspirazione di pavimento, sedili e bagagliaio", "Pulizia profonda e protezione delle superfici in plastica", "Shampoo dei sedili e trattamento delle macchie", "Pulizia profonda di tappeti e vetri interni", "Pulizia a vapore per un abitacolo igienizzato", "Pulizia accurata di pelle e Alcantara"],
    },
    {
      title: "Pulizia esterna completa",
      price: "da CHF 109",
      text: "Lavaggio a mano, pulizia dei cerchi e finitura curata.",
      details: ["Prelavaggio Snow Foam per sciogliere lo sporco", "Lavaggio a mano con prodotti di qualità", "Asciugatura delicata del veicolo", "Pulizia intensiva dei cerchi e rimozione della polvere dei freni", "Rimozione degli insetti da frontale e specchietti", "Pulizia di battute porte, emblemi e dettagli difficili"],
    },
    {
      title: "Detailing completo",
      price: "su richiesta",
      text: "Interni ed esterni combinati per un risultato completo.",
      details: ["Pulizia interna ed esterna in un unico pacchetto", "Ideale per rinnovare visibilmente l’intero veicolo", "Pulizia rispettosa dei materiali con finitura premium", "Controllo finale prima della consegna", "L’estensione esatta dipende da dimensioni e condizioni"],
    },
    {
      title: "Cura di mantenimento",
      price: "da CHF 69",
      text: "Cura regolare per veicoli già trattati o ben mantenuti.",
      details: ["Per veicoli già trattati da JC Detailing o in buone condizioni", "Mantenimento interno da CHF 129", "Cruscotto, console, plastiche e battute porte", "Mantenimento esterno da CHF 69 con Snow Foam, lavaggio a mano e cerchi", "Ideale per conservare un aspetto premium"],
    },
    {
      title: "Servizi aggiuntivi",
      price: "da CHF 30",
      text: "Rimozione peli, pulizia profonda del bagagliaio e dei sedili.",
      details: ["Rimozione peli di animali da CHF 50", "Pulizia profonda del bagagliaio da CHF 40", "Pulizia profonda dei sedili da CHF 80", "Pulizia del cielo interno da CHF 50", "Pulizia intensiva dei tappetini da CHF 30"],
    },
    {
      title: "Lucidatura & ceramica",
      price: "da CHF 399",
      text: "Correzione della vernice, finitura lucida e protezione ceramica duratura.",
      details: ["Lucidatura 1-step da CHF 399", "Lucidatura 2-step da CHF 599 con taglio e finitura", "Pacchetto ceramico da CHF 1090 con preparazione e lucidatura", "Brillantezza profonda, effetto idrofobico e protezione ambientale", "Estensione e prezzo vengono confermati dopo l’ispezione"],
    },
  ],
};

export function getLocalizedOffers(locale: PublicLocale): LocalizedOffer[] {
  return locale === "de" ? germanOffers.map((offer) => ({ ...offer, details: offer.details ?? [] })) : translatedOffers[locale];
}

export const offersPageCopy = {
  de: { eyebrow: "Angebote", title: "Pakete & Preise", intro: "Klare Einstiegspreise. Der finale Preis hängt von Fahrzeuggrösse und Zustand ab.", more: "Mehr erfahren", close: "Schliessen", offer: "Angebot", closeLabel: "Angebot schliessen" },
  en: { eyebrow: "Packages", title: "Packages & pricing", intro: "Clear starting prices. Final pricing depends on vehicle size and condition.", more: "Learn more", close: "Close", offer: "Package", closeLabel: "Close package" },
  fr: { eyebrow: "Offres", title: "Formules & prix", intro: "Des prix de départ clairs. Le prix final dépend de la taille et de l’état du véhicule.", more: "En savoir plus", close: "Fermer", offer: "Offre", closeLabel: "Fermer l’offre" },
  it: { eyebrow: "Offerte", title: "Pacchetti & prezzi", intro: "Prezzi iniziali chiari. Il prezzo finale dipende dalle dimensioni e dalle condizioni del veicolo.", more: "Scopri di più", close: "Chiudi", offer: "Offerta", closeLabel: "Chiudi offerta" },
} satisfies Record<PublicLocale, Record<string, string>>;
