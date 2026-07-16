import type { PublicLocale } from "./i18n";

type HomeCopy = {
  hero: { eyebrow: string; description: string; booking: string; services: string };
  trustLabel: string;
  trust: Array<{ title: string; text: string }>;
  services: { eyebrow: string; title: string; intro: string; more: string };
  packages: { eyebrow: string; title: string; intro: string; all: string; checks: string[] };
  packageCards: Array<{ title: string; price: string; text: string }>;
  about: {
    eyebrow: string;
    title: string;
    mini: string;
    cardTitle: string;
    body: string[];
    reviews: string;
    reviewsLabel: string;
    servicesCount: string;
    servicesLabel: string;
    location: string;
    locationLabel: string;
  };
  gallery: { eyebrow: string; title: string; intro: string; all: string };
  faq: { eyebrow: string; title: string; items: Array<{ question: string; answer: string }> };
  contact: { eyebrow: string; title: string; intro: string; booking: string; message: string };
};

export const homeCopy: Record<PublicLocale, HomeCopy> = {
  de: {
    hero: {
      eyebrow: "Kanton Luzern - Sternmatt 4, 6242 Wauwil",
      description: "Professionelle Fahrzeugaufbereitung, Lackpflege und Keramikversiegelung in der Zentralschweiz.",
      booking: "Termin buchen",
      services: "Leistungen ansehen",
    },
    trustLabel: "Qualitätsversprechen",
    trust: [
      { title: "5 Sterne Reviews", text: "Bewertungen unserer Kunden" },
      { title: "Premium Produkte", text: "Materialschonend ausgewählt" },
      { title: "100% Sorgfalt", text: "Bis ins kleinste Detail" },
      { title: "Wauwil, Luzern", text: "Regional und persönlich" },
    ],
    services: {
      eyebrow: "Unsere Leistungen",
      title: "Leistungen",
      intro: "Sorgfältige Handarbeit für ein Fahrzeug, das sauber aussieht, sich gut anfühlt und langfristig geschützt bleibt.",
      more: "Mehr Info",
    },
    packages: {
      eyebrow: "Unsere Pakete",
      title: "Meistgebuchte Angebote",
      intro: "Transparente Einstiegspreise und Leistungen, die auf den Zustand deines Fahrzeugs abgestimmt werden.",
      all: "Alle Angebote",
      checks: [
        "Sorgfältige Fahrzeugkontrolle vor Beginn",
        "Hochwertige Produkte und saubere Verarbeitung",
        "Finale Kontrolle vor der Übergabe",
      ],
    },
    packageCards: [
      {
        title: "Innenreinigung",
        price: "ab 209 CHF",
        text: "Tiefenreinigung für Sitze, Teppiche, Kunststoff-, Leder- und Alcantaraflächen inklusive hygienischer Dampfbehandlung.",
      },
      {
        title: "Politur",
        price: "ab 399 CHF",
        text: "Professionelle Lackkorrektur reduziert Kratzer und Swirls und sorgt für sichtbar mehr Glanz und Farbtiefe.",
      },
      {
        title: "Keramikversiegelung",
        price: "ab 1090 CHF",
        text: "Mehrschichtiger Langzeitschutz mit hydrophobem Effekt, UV-Schutz und dauerhaftem Showroom-Finish.",
      },
    ],
    about: {
      eyebrow: "Über uns",
      title: "Saubere Arbeit. Echter Anspruch.",
      mini: "Wer wir sind",
      cardTitle: "Profi im Kanton Luzern.",
      body: [
        "Ich bin der Gründer von JC Detailing und habe meine Leidenschaft für Fahrzeuge zum Beruf gemacht.",
        "Mit viel Liebe zum Detail, professionellen Produkten und moderner Technik wird jedes Fahrzeug individuell behandelt und aufbereitet. Ich arbeite präzise, gründlich und mit dem Anspruch, ein perfektes Ergebnis zu liefern.",
        "Ich spreche Deutsch, Englisch, Französisch, Italienisch und Albanisch und freue mich, Kunden aus der gesamten Region persönlich betreuen zu dürfen.",
        "Juljan Cela",
      ],
      reviews: "5 Sterne",
      reviewsLabel: "Google Reviews",
      servicesCount: "4",
      servicesLabel: "Kernleistungen",
      location: "Wauwil",
      locationLabel: "Standort in Luzern",
    },
    gallery: {
      eyebrow: "Vorher / Nachher",
      title: "Galerie",
      intro: "Echte Ergebnisse professioneller Autoaufbereitung, Politur, Innenreinigung und Keramikversiegelung in Wauwil.",
      all: "Alle Vorher-Nachher Ergebnisse ansehen",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Häufige Fragen",
      items: [
        { question: "Was ist Car Detailing?", answer: "Car Detailing ist eine präzise Fahrzeugaufbereitung, die deutlich weiter geht als eine normale Autowäsche. Innenraum, Lack, Felgen und Details werden gründlich gereinigt, gepflegt und geschützt." },
        { question: "Wo befindet sich JC Detailing?", answer: "JC Detailing befindet sich an der Sternmatt 4 in 6242 Wauwil im Kanton Luzern. Die Leistungen richten sich an Kunden aus Wauwil, Luzern und der Zentralschweiz." },
        { question: "Bietet JC Detailing mobilen Service an?", answer: "Aktuell finden alle Behandlungen in der Garage statt, damit Licht, Ausstattung und Arbeitsbedingungen für hochwertige Ergebnisse stimmen." },
        { question: "Wie lange dauert ein Termin?", answer: "Je nach Zustand und Paket dauert eine Innenreinigung etwa 3 bis 8 Stunden, eine Komplettaufbereitung etwa 6 bis 10 Stunden und Lackkorrektur mit Keramikversiegelung etwa 1 bis 2 Tage." },
        { question: "Was ist der Unterschied zwischen einer normalen Autowäsche und Detailing?", answer: "Eine Autowäsche entfernt vor allem oberflächlichen Schmutz. Car Detailing ist deutlich gründlicher: Lack, Innenraum, Materialien und Details werden sorgfältig gereinigt, gepflegt und geschützt." },
        { question: "Wie oft sollte man sein Auto aufbereiten lassen?", answer: "Für die meisten Fahrzeuge ist eine gründliche Aufbereitung ein- bis zweimal pro Jahr sinnvoll. Eine regelmässige Erhaltungspflege hilft, den sauberen Zustand länger zu bewahren." },
      ],
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Bereit für ein frisch aufbereitetes Fahrzeug?",
      intro: "Termine sind auf Anfrage verfügbar. Schick eine kurze Nachricht mit Fahrzeug, gewünschter Leistung und Wunschdatum.",
      booking: "Termin buchen",
      message: "Nachricht senden",
    },
  },
  en: {
    hero: {
      eyebrow: "Canton of Lucerne - Sternmatt 4, 6242 Wauwil",
      description: "Professional vehicle detailing, paint care and ceramic coating in Central Switzerland.",
      booking: "Book appointment",
      services: "View services",
    },
    trustLabel: "Quality promise",
    trust: [
      { title: "5-star reviews", text: "What our customers say" },
      { title: "Premium products", text: "Carefully selected for every material" },
      { title: "100% care", text: "Down to the smallest detail" },
      { title: "Wauwil, Lucerne", text: "Local and personal" },
    ],
    services: {
      eyebrow: "Our services",
      title: "Services",
      intro: "Careful craftsmanship for a vehicle that looks clean, feels right and stays protected for longer.",
      more: "More info",
    },
    packages: {
      eyebrow: "Our packages",
      title: "Most booked packages",
      intro: "Clear starting prices and services tailored to the condition of your vehicle.",
      all: "All packages",
      checks: ["Careful vehicle inspection before work begins", "Premium products and precise workmanship", "Final quality check before handover"],
    },
    packageCards: [
      {
        title: "Interior cleaning",
        price: "from CHF 209",
        text: "Deep cleaning for seats, carpets, plastics, leather and Alcantara, including hygienic steam treatment.",
      },
      {
        title: "Polishing",
        price: "from CHF 399",
        text: "Professional paint correction reduces scratches and swirls for visibly greater gloss and colour depth.",
      },
      {
        title: "Ceramic coating",
        price: "from CHF 1090",
        text: "Multi-layer long-term protection with a hydrophobic effect, UV protection and a lasting showroom finish.",
      },
    ],
    about: {
      eyebrow: "About us",
      title: "Clean work. Genuine standards.",
      mini: "Who we are",
      cardTitle: "Professional in the Canton of Lucerne.",
      body: [
        "I am the founder of JC Detailing and have turned my passion for vehicles into my profession.",
        "With great attention to detail, professional products and modern techniques, every vehicle is treated and detailed individually. I work precisely, thoroughly and with the aim of delivering a perfect result.",
        "I speak German, English, French, Italian and Albanian, and I am pleased to personally assist customers from across the region.",
        "Juljan Cela",
      ],
      reviews: "5 stars",
      reviewsLabel: "Google reviews",
      servicesCount: "4",
      servicesLabel: "Core services",
      location: "Wauwil",
      locationLabel: "Location in Lucerne",
    },
    gallery: {
      eyebrow: "Before / After",
      title: "Gallery",
      intro: "Real results from professional detailing, polishing, interior cleaning and ceramic coating in Wauwil.",
      all: "View all before-and-after results",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      items: [
        { question: "What is car detailing?", answer: "Car detailing is a precise vehicle treatment that goes far beyond a normal car wash. The interior, paintwork, wheels and fine details are thoroughly cleaned, cared for and protected." },
        { question: "Where is JC Detailing located?", answer: "JC Detailing is located at Sternmatt 4, 6242 Wauwil in the Canton of Lucerne. We welcome customers from Wauwil, Lucerne and throughout Central Switzerland." },
        { question: "Does JC Detailing offer a mobile service?", answer: "All treatments currently take place in our workshop so that the lighting, equipment and working conditions support a premium result." },
        { question: "How long does an appointment take?", answer: "Depending on the condition and package, an interior detail takes around 3 to 8 hours, a complete detail around 6 to 10 hours, and paint correction with ceramic coating around 1 to 2 days." },
        { question: "What is the difference between a normal car wash and detailing?", answer: "A car wash mainly removes surface dirt. Detailing is much more thorough: paintwork, interior materials and small details are carefully cleaned, restored and protected." },
        { question: "How often should a vehicle be detailed?", answer: "For most vehicles, a thorough detail once or twice a year is a good rhythm. Regular maintenance care helps preserve the clean condition for longer." },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Ready for a freshly detailed vehicle?",
      intro: "Appointments are available on request. Send us your vehicle, desired service and preferred date.",
      booking: "Book appointment",
      message: "Send message",
    },
  },
  fr: {
    hero: {
      eyebrow: "Canton de Lucerne - Sternmatt 4, 6242 Wauwil",
      description: "Préparation automobile professionnelle, entretien de la peinture et protection céramique en Suisse centrale.",
      booking: "Prendre rendez-vous",
      services: "Voir les services",
    },
    trustLabel: "Promesse de qualité",
    trust: [
      { title: "Avis 5 étoiles", text: "L’avis de nos clients" },
      { title: "Produits premium", text: "Sélectionnés avec soin pour chaque matériau" },
      { title: "100% de soin", text: "Jusque dans les moindres détails" },
      { title: "Wauwil, Lucerne", text: "Local et personnel" },
    ],
    services: {
      eyebrow: "Nos services",
      title: "Services",
      intro: "Un travail soigné pour un véhicule propre, agréable et protégé durablement.",
      more: "En savoir plus",
    },
    packages: {
      eyebrow: "Nos formules",
      title: "Formules les plus demandées",
      intro: "Des prix de départ clairs et des prestations adaptées à l’état de votre véhicule.",
      all: "Toutes les offres",
      checks: ["Contrôle soigneux du véhicule avant le début", "Produits premium et travail précis", "Contrôle final avant la remise du véhicule"],
    },
    packageCards: [
      {
        title: "Nettoyage intérieur",
        price: "dès CHF 209",
        text: "Nettoyage en profondeur des sièges, tapis, plastiques, cuirs et surfaces en Alcantara, avec traitement hygiénique à la vapeur.",
      },
      {
        title: "Polissage",
        price: "dès CHF 399",
        text: "La correction professionnelle de la peinture réduit les rayures et les micro-rayures pour plus de brillance et de profondeur.",
      },
      {
        title: "Protection céramique",
        price: "dès CHF 1090",
        text: "Protection longue durée multicouche avec effet hydrophobe, protection UV et finition showroom durable.",
      },
    ],
    about: {
      eyebrow: "À propos",
      title: "Travail soigné. Exigence réelle.",
      mini: "Qui sommes-nous",
      cardTitle: "Professionnel dans le canton de Lucerne.",
      body: [
        "Je suis le fondateur de JC Detailing et j’ai fait de ma passion pour l’automobile mon métier.",
        "Avec un grand souci du détail, des produits professionnels et des techniques modernes, chaque véhicule est traité et préparé individuellement. Je travaille avec précision et minutie, avec l’ambition d’obtenir un résultat parfait.",
        "Je parle allemand, anglais, français, italien et albanais, et je suis heureux d’accompagner personnellement les clients de toute la région.",
        "Juljan Cela",
      ],
      reviews: "5 étoiles",
      reviewsLabel: "Avis Google",
      servicesCount: "4",
      servicesLabel: "Services principaux",
      location: "Wauwil",
      locationLabel: "Site dans le canton de Lucerne",
    },
    gallery: {
      eyebrow: "Avant / Après",
      title: "Galerie",
      intro: "Des résultats réels de préparation, polissage, nettoyage intérieur et protection céramique à Wauwil.",
      all: "Voir tous les résultats avant-après",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions fréquentes",
      items: [
        { question: "Qu’est-ce que le car detailing?", answer: "Le detailing est une préparation automobile précise qui va bien au-delà d’un lavage classique. L’intérieur, la peinture, les jantes et les détails sont nettoyés, entretenus et protégés en profondeur." },
        { question: "Où se trouve JC Detailing?", answer: "JC Detailing se trouve à Sternmatt 4, 6242 Wauwil, dans le canton de Lucerne. Nous accueillons des clients de Wauwil, Lucerne et de toute la Suisse centrale." },
        { question: "JC Detailing propose-t-il un service mobile?", answer: "Tous les traitements sont actuellement réalisés dans notre atelier afin de garantir un éclairage, un équipement et des conditions de travail adaptés à un résultat premium." },
        { question: "Combien de temps dure un rendez-vous?", answer: "Selon l’état et la formule, un nettoyage intérieur dure environ 3 à 8 heures, une préparation complète 6 à 10 heures, et une correction avec protection céramique 1 à 2 jours." },
        { question: "Quelle différence entre un lavage classique et le detailing?", answer: "Un lavage retire surtout la saleté de surface. Le detailing va beaucoup plus loin: la peinture, l’intérieur, les matériaux et les détails sont nettoyés, entretenus et protégés avec précision." },
        { question: "À quelle fréquence faire préparer son véhicule?", answer: "Pour la plupart des véhicules, une préparation complète une à deux fois par an est idéale. Un entretien régulier aide à conserver le résultat plus longtemps." },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Prêt pour un véhicule fraîchement préparé?",
      intro: "Les rendez-vous sont disponibles sur demande. Indiquez-nous votre véhicule, le service souhaité et votre date préférée.",
      booking: "Prendre rendez-vous",
      message: "Envoyer un message",
    },
  },
  it: {
    hero: {
      eyebrow: "Canton Lucerna - Sternmatt 4, 6242 Wauwil",
      description: "Detailing professionale, cura della vernice e rivestimento ceramico nella Svizzera centrale.",
      booking: "Prenota appuntamento",
      services: "Vedi i servizi",
    },
    trustLabel: "Promessa di qualità",
    trust: [
      { title: "Recensioni a 5 stelle", text: "Le opinioni dei nostri clienti" },
      { title: "Prodotti premium", text: "Scelti con cura per ogni materiale" },
      { title: "100% attenzione", text: "Fin nei minimi dettagli" },
      { title: "Wauwil, Lucerna", text: "Locale e personale" },
    ],
    services: {
      eyebrow: "I nostri servizi",
      title: "Servizi",
      intro: "Lavoro accurato per un veicolo pulito, piacevole e protetto a lungo.",
      more: "Più informazioni",
    },
    packages: {
      eyebrow: "I nostri pacchetti",
      title: "Pacchetti più richiesti",
      intro: "Prezzi iniziali chiari e prestazioni adattate alle condizioni del veicolo.",
      all: "Tutte le offerte",
      checks: ["Controllo accurato del veicolo prima dell’inizio", "Prodotti premium e lavorazione precisa", "Controllo finale prima della consegna"],
    },
    packageCards: [
      {
        title: "Pulizia interna",
        price: "da CHF 209",
        text: "Pulizia profonda di sedili, tappeti, plastiche, pelle e Alcantara, incluso il trattamento igienizzante a vapore.",
      },
      {
        title: "Lucidatura",
        price: "da CHF 399",
        text: "Correzione professionale della vernice che riduce graffi e swirl, aumentando visibilmente brillantezza e profondità.",
      },
      {
        title: "Rivestimento ceramico",
        price: "da CHF 1090",
        text: "Protezione multistrato a lunga durata con effetto idrofobico, protezione UV e finitura showroom duratura.",
      },
    ],
    about: {
      eyebrow: "Chi siamo",
      title: "Lavoro pulito. Standard autentici.",
      mini: "Chi siamo",
      cardTitle: "Professionista nel Canton Lucerna.",
      body: [
        "Sono il fondatore di JC Detailing e ho trasformato la mia passione per le auto nella mia professione.",
        "Con grande attenzione ai dettagli, prodotti professionali e tecniche moderne, ogni veicolo viene trattato e preparato individualmente. Lavoro con precisione e cura, con l’obiettivo di ottenere un risultato perfetto.",
        "Parlo tedesco, inglese, francese, italiano e albanese e sono lieto di seguire personalmente i clienti di tutta la regione.",
        "Juljan Cela",
      ],
      reviews: "5 stelle",
      reviewsLabel: "Recensioni Google",
      servicesCount: "4",
      servicesLabel: "Servizi principali",
      location: "Wauwil",
      locationLabel: "Sede nel Canton Lucerna",
    },
    gallery: {
      eyebrow: "Prima / Dopo",
      title: "Galleria",
      intro: "Risultati reali di detailing, lucidatura, pulizia interna e rivestimento ceramico a Wauwil.",
      all: "Vedi tutti i risultati prima e dopo",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Domande frequenti",
      items: [
        { question: "Che cos’è il car detailing?", answer: "Il car detailing è un trattamento preciso che va ben oltre un normale lavaggio. Interni, vernice, cerchi e dettagli vengono puliti, curati e protetti a fondo." },
        { question: "Dove si trova JC Detailing?", answer: "JC Detailing si trova in Sternmatt 4, 6242 Wauwil, nel Canton Lucerna. Accogliamo clienti da Wauwil, Lucerna e da tutta la Svizzera centrale." },
        { question: "JC Detailing offre un servizio mobile?", answer: "Attualmente tutti i trattamenti vengono eseguiti nella nostra officina, dove luce, attrezzature e condizioni di lavoro permettono risultati premium." },
        { question: "Quanto dura un appuntamento?", answer: "In base alle condizioni e al pacchetto, una pulizia interna richiede circa 3-8 ore, un trattamento completo 6-10 ore e una correzione con rivestimento ceramico 1-2 giorni." },
        { question: "Qual è la differenza tra un lavaggio normale e il detailing?", answer: "Un lavaggio rimuove soprattutto lo sporco superficiale. Il detailing è molto più approfondito: vernice, interni, materiali e dettagli vengono puliti, curati e protetti con precisione." },
        { question: "Quanto spesso conviene fare il detailing?", answer: "Per la maggior parte dei veicoli è consigliabile un trattamento completo una o due volte l’anno. Una manutenzione regolare aiuta a conservare il risultato più a lungo." },
      ],
    },
    contact: {
      eyebrow: "Contatti",
      title: "Pronto per un veicolo appena trattato?",
      intro: "Gli appuntamenti sono disponibili su richiesta. Indicaci il veicolo, il servizio desiderato e la data preferita.",
      booking: "Prenota appuntamento",
      message: "Invia messaggio",
    },
  },
};
