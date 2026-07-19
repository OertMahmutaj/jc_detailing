export type InvoiceLanguage = "de" | "en" | "fr" | "it";

type InvoiceItemLike = {
  description: string;
};

const SERVICE_TRANSLATIONS: Record<InvoiceLanguage, Record<string, string>> = {
  de: {},
  en: {
    "Komplette Innenreinigung": "Complete interior cleaning",
    "Komplett Innenreinigung": "Complete interior cleaning",
    "Innenreinigung komplett": "Complete interior cleaning",
    "Komplette Aussenreinigung": "Complete exterior cleaning",
    "Komplett Aussenreinigung": "Complete exterior cleaning",
    "Aussenreinigung komplett": "Complete exterior cleaning",
    "Pflegeerhaltung Innenreinigung": "Interior maintenance cleaning",
    "Pflegeerhaltung Aussenreinigung": "Exterior maintenance cleaning",
    "Polish Paket (1-Step)": "Polish package (1-step)",
    "Polish Paket (2-Step)": "Polish package (2-step)",
    "Keramik Versiegelung": "Ceramic coating",
    Keramikversiegelung: "Ceramic coating",
    "Komplette Premium Paket": "Complete premium package",
    "Complete Premium Paket": "Complete premium package",
    "Komplette Aufbereitung": "Complete detailing package",
    Innenreinigung: "Interior cleaning",
    Aussenreinigung: "Exterior cleaning",
    Politur: "Polishing",
  },
  fr: {
    "Komplette Innenreinigung": "Nettoyage intérieur complet",
    "Komplett Innenreinigung": "Nettoyage intérieur complet",
    "Innenreinigung komplett": "Nettoyage intérieur complet",
    "Komplette Aussenreinigung": "Nettoyage extérieur complet",
    "Komplett Aussenreinigung": "Nettoyage extérieur complet",
    "Aussenreinigung komplett": "Nettoyage extérieur complet",
    "Pflegeerhaltung Innenreinigung": "Entretien intérieur",
    "Pflegeerhaltung Aussenreinigung": "Entretien extérieur",
    "Polish Paket (1-Step)": "Pack polissage (1 étape)",
    "Polish Paket (2-Step)": "Pack polissage (2 étapes)",
    "Keramik Versiegelung": "Traitement céramique",
    Keramikversiegelung: "Traitement céramique",
    "Komplette Premium Paket": "Pack premium complet",
    "Complete Premium Paket": "Pack premium complet",
    "Komplette Aufbereitung": "Préparation complète",
    Innenreinigung: "Nettoyage intérieur",
    Aussenreinigung: "Nettoyage extérieur",
    Politur: "Polissage",
  },
  it: {
    "Komplette Innenreinigung": "Pulizia interna completa",
    "Komplett Innenreinigung": "Pulizia interna completa",
    "Innenreinigung komplett": "Pulizia interna completa",
    "Komplette Aussenreinigung": "Pulizia esterna completa",
    "Komplett Aussenreinigung": "Pulizia esterna completa",
    "Aussenreinigung komplett": "Pulizia esterna completa",
    "Pflegeerhaltung Innenreinigung": "Mantenimento pulizia interna",
    "Pflegeerhaltung Aussenreinigung": "Mantenimento pulizia esterna",
    "Polish Paket (1-Step)": "Pacchetto polish (1 step)",
    "Polish Paket (2-Step)": "Pacchetto polish (2 step)",
    "Keramik Versiegelung": "Protezione ceramica",
    Keramikversiegelung: "Protezione ceramica",
    "Komplette Premium Paket": "Pacchetto premium completo",
    "Complete Premium Paket": "Pacchetto premium completo",
    "Komplette Aufbereitung": "Pacchetto detailing completo",
    Innenreinigung: "Pulizia interna",
    Aussenreinigung: "Pulizia esterna",
    Politur: "Lucidatura",
  },
};

const ADD_ON_TRANSLATIONS: Record<InvoiceLanguage, Record<string, string>> = {
  de: {},
  en: {
    "Dachhimmel Reinigung": "Headliner cleaning",
    "Fussmatten intensiv": "Intensive floor mat cleaning",
    "Kofferraum Deep Clean": "Trunk deep clean",
    "Sitze Tiefenreinigung": "Deep seat cleaning",
    Tierhaarentfernung: "Pet hair removal",
  },
  fr: {
    "Dachhimmel Reinigung": "Nettoyage du ciel de toit",
    "Fussmatten intensiv": "Nettoyage intensif des tapis",
    "Kofferraum Deep Clean": "Nettoyage en profondeur du coffre",
    "Sitze Tiefenreinigung": "Nettoyage en profondeur des sièges",
    Tierhaarentfernung: "Élimination des poils d'animaux",
  },
  it: {
    "Dachhimmel Reinigung": "Pulizia cielo abitacolo",
    "Fussmatten intensiv": "Pulizia intensiva tappetini",
    "Kofferraum Deep Clean": "Pulizia profonda bagagliaio",
    "Sitze Tiefenreinigung": "Pulizia profonda dei sedili",
    Tierhaarentfernung: "Rimozione peli di animali",
  },
};

const VEHICLE_TRANSLATIONS: Record<InvoiceLanguage, Record<string, string>> = {
  de: {},
  en: {
    "City Car": "City car",
    "City car": "City car",
    Sedan: "Sedan",
    "Sports Car": "Sports car",
    "Sports car": "Sports car",
    SUV: "SUV",
    Van: "Van",
  },
  fr: {
    "City Car": "Citadine",
    "City car": "Citadine",
    Sedan: "Berline",
    "Sports Car": "Voiture de sport",
    "Sports car": "Voiture de sport",
    SUV: "SUV",
    Van: "Van",
  },
  it: {
    "City Car": "City car",
    "City car": "City car",
    Sedan: "Berlina",
    "Sports Car": "Auto sportiva",
    "Sports car": "Auto sportiva",
    SUV: "SUV",
    Van: "Van",
  },
};

const VEHICLE_PREFIX: Record<InvoiceLanguage, string> = {
  de: "Fahrzeuggrösse",
  en: "Vehicle size",
  fr: "Taille du véhicule",
  it: "Dimensione veicolo",
};

const PROMO_PREFIX: Record<InvoiceLanguage, string> = {
  de: "Promo-Code",
  en: "Promo code",
  fr: "Code promo",
  it: "Codice promo",
};

function clean(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function splitLabel(description: string) {
  const index = description.indexOf(":");

  if (index === -1) {
    return null;
  }

  return {
    label: clean(description.slice(0, index)),
    value: clean(description.slice(index + 1)),
  };
}

function findCanonicalLabel(
  value: string,
  translations: Record<InvoiceLanguage, Record<string, string>>,
) {
  const normalizedValue = clean(value).toLowerCase();

  for (const languageMap of Object.values(translations)) {
    for (const [source, translated] of Object.entries(languageMap)) {
      if (
        clean(source).toLowerCase() === normalizedValue ||
        clean(translated).toLowerCase() === normalizedValue
      ) {
        return clean(source);
      }
    }
  }

  return null;
}

export function normalizeInvoiceLanguage(value: unknown): InvoiceLanguage {
  return value === "en" || value === "fr" || value === "it" ? value : "de";
}

export function invoiceVehicleCategoryDescription(
  vehicleName: string,
  language: InvoiceLanguage,
) {
  const canonicalVehicle =
    findCanonicalLabel(vehicleName, VEHICLE_TRANSLATIONS) || clean(vehicleName);
  const translatedVehicle =
    VEHICLE_TRANSLATIONS[language][canonicalVehicle] || canonicalVehicle;
  const spacer = language === "fr" ? " : " : ": ";

  return `${VEHICLE_PREFIX[language]}${spacer}${translatedVehicle}`;
}

export function translateInvoiceItemDescription(
  description: string,
  language: InvoiceLanguage,
) {
  const value = clean(description);
  const canonicalService = findCanonicalLabel(value, SERVICE_TRANSLATIONS);
  const canonicalAddOn = findCanonicalLabel(value, ADD_ON_TRANSLATIONS);

  if (language === "de") {
    return canonicalService || canonicalAddOn || value;
  }

  const direct =
    SERVICE_TRANSLATIONS[language][value] ||
    ADD_ON_TRANSLATIONS[language][value] ||
    (canonicalService ? SERVICE_TRANSLATIONS[language][canonicalService] : null) ||
    (canonicalAddOn ? ADD_ON_TRANSLATIONS[language][canonicalAddOn] : null);

  if (direct) {
    return direct;
  }

  const split = splitLabel(value);

  if (!split) {
    return value;
  }

  const labelKey = split.label.toLowerCase();

  if (
    labelKey === "fahrzeuggrösse" ||
    labelKey === "fahrzeuggröße" ||
    labelKey === "fahrzeuggroesse" ||
    labelKey === "vehicle size" ||
    labelKey === "taille du véhicule" ||
    labelKey === "dimensione veicolo"
  ) {
    return invoiceVehicleCategoryDescription(split.value, language);
  }

  if (
    labelKey === "promo-code" ||
    labelKey === "promo code" ||
    labelKey === "code promo" ||
    labelKey === "codice promo"
  ) {
    const spacer = language === "fr" ? " : " : ": ";
    return `${PROMO_PREFIX[language]}${spacer}${split.value}`;
  }

  return value;
}

export function translateInvoiceItems<T extends InvoiceItemLike>(
  items: T[],
  language: InvoiceLanguage,
) {
  return items.map((item) => ({
    ...item,
    description: translateInvoiceItemDescription(item.description, language),
  }));
}
