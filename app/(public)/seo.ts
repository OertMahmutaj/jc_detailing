import type { Metadata } from "next";

import {
  intlLocales,
  localeHome,
  publicLocales,
  type PublicLocale,
} from "./i18n";

type SeoText = {
  title: string;
  description: string;
};

type PublicMetadataOptions = SeoText & {
  path: string;
  image?: string;
  imageAlt?: string;
};

type ServiceMetadataInput = {
  path: string;
  title: string;
  short: string;
  image: string;
};

const siteName = "JC Detailing";
const defaultImage = "/hero_poster.webp";

const localizedKeywords: Record<PublicLocale, string[]> = {
  de: [
    "Autoaufbereitung Wauwil",
    "Autoaufbereitung Luzern",
    "Innenreinigung Auto",
    "Aussenreinigung Auto",
    "Politur Luzern",
    "Keramikversiegelung Luzern",
    "JC Detailing",
  ],
  en: [
    "car detailing Wauwil",
    "car detailing Lucerne",
    "interior car detailing",
    "exterior car detailing",
    "paint polishing Lucerne",
    "ceramic coating Lucerne",
    "JC Detailing",
  ],
  fr: [
    "detailing automobile Wauwil",
    "detailing automobile Lucerne",
    "nettoyage intérieur voiture",
    "nettoyage extérieur voiture",
    "polissage automobile Lucerne",
    "protection céramique Lucerne",
    "JC Detailing",
  ],
  it: [
    "car detailing Wauwil",
    "car detailing Lucerna",
    "pulizia interna auto",
    "pulizia esterna auto",
    "lucidatura auto Lucerna",
    "rivestimento ceramico Lucerna",
    "JC Detailing",
  ],
};

export const homeSeo: Record<PublicLocale, SeoText> = {
  de: {
    title: "Autoaufbereitung in Wauwil, Luzern",
    description:
      "JC Detailing bietet professionelle Autoaufbereitung in Wauwil, Kanton Luzern: Innenreinigung, Aussenreinigung, Politur, Lackpflege und Keramikversiegelung für Fahrzeuge in der Zentralschweiz.",
  },
  en: {
    title: "Car detailing in Wauwil, Lucerne",
    description:
      "JC Detailing provides professional car detailing in Wauwil, Canton of Lucerne: interior detailing, exterior detailing, paint polishing, paint care and ceramic coating for vehicles in Central Switzerland.",
  },
  fr: {
    title: "Detailing automobile à Wauwil, Lucerne",
    description:
      "JC Detailing propose un detailing automobile professionnel à Wauwil, dans le canton de Lucerne: nettoyage intérieur et extérieur, polissage, entretien de la peinture et protection céramique.",
  },
  it: {
    title: "Car detailing a Wauwil, Lucerna",
    description:
      "JC Detailing offre car detailing professionale a Wauwil, nel Canton Lucerna: pulizia interna ed esterna, lucidatura, cura della vernice e rivestimento ceramico per veicoli nella Svizzera centrale.",
  },
};

export const publicPageSeo = {
  services: {
    de: {
      title: "Leistungen für Autoaufbereitung in Wauwil",
      description:
        "Leistungen von JC Detailing in Wauwil: Innenreinigung, Aussenreinigung, Politur und Keramikversiegelung für Fahrzeuge in Luzern und der Zentralschweiz.",
    },
    en: {
      title: "Car detailing services in Wauwil",
      description:
        "JC Detailing services in Wauwil: interior detailing, exterior detailing, paint polishing and ceramic coating for vehicles in Lucerne and Central Switzerland.",
    },
    fr: {
      title: "Services de detailing automobile à Wauwil",
      description:
        "Services JC Detailing à Wauwil: nettoyage intérieur, nettoyage extérieur, polissage et protection céramique pour véhicules à Lucerne et en Suisse centrale.",
    },
    it: {
      title: "Servizi di car detailing a Wauwil",
      description:
        "Servizi JC Detailing a Wauwil: pulizia interna, pulizia esterna, lucidatura e rivestimento ceramico per veicoli a Lucerna e nella Svizzera centrale.",
    },
  },
  offers: {
    de: {
      title: "Pakete & Preise für Autoaufbereitung",
      description:
        "Pakete und Preise von JC Detailing in Wauwil, Luzern. Innenreinigung, Aussenreinigung, Erhaltungspflege, Politur und Keramikversiegelung.",
    },
    en: {
      title: "Car detailing packages & prices",
      description:
        "Explore JC Detailing packages and prices in Wauwil, Lucerne for interior and exterior detailing, maintenance care, paint polishing and ceramic coating.",
    },
    fr: {
      title: "Forfaits et prix de detailing automobile",
      description:
        "Découvrez les forfaits et prix JC Detailing à Wauwil, Lucerne: nettoyage intérieur et extérieur, entretien, polissage et protection céramique.",
    },
    it: {
      title: "Pacchetti e prezzi di car detailing",
      description:
        "Scopri i pacchetti e i prezzi JC Detailing a Wauwil, Lucerna: pulizia interna ed esterna, mantenimento, lucidatura e rivestimento ceramico.",
    },
  },
  gallery: {
    de: {
      title: "Vorher-Nachher Galerie",
      description:
        "Vorher-Nachher Galerie von JC Detailing in Wauwil, Luzern mit echten Ergebnissen von Fahrzeugaufbereitung, Politur, Innenreinigung und Keramikversiegelung.",
    },
    en: {
      title: "Before-and-after car detailing gallery",
      description:
        "See real before-and-after results from JC Detailing in Wauwil, Lucerne, including interior detailing, paint polishing and ceramic coating.",
    },
    fr: {
      title: "Galerie detailing avant-après",
      description:
        "Découvrez les résultats avant-après de JC Detailing à Wauwil, Lucerne: nettoyage intérieur, polissage et protection céramique.",
    },
    it: {
      title: "Galleria car detailing prima e dopo",
      description:
        "Guarda i risultati prima e dopo di JC Detailing a Wauwil, Lucerna: pulizia interna, lucidatura e rivestimento ceramico.",
    },
  },
  booking: {
    de: {
      title: "Termin buchen",
      description:
        "Termin bei JC Detailing in Wauwil, Luzern anfragen. Buche Autoaufbereitung, Innenreinigung, Aussenreinigung, Politur oder Keramikversiegelung.",
    },
    en: {
      title: "Book a car detailing appointment",
      description:
        "Request an appointment with JC Detailing in Wauwil, Lucerne for interior or exterior detailing, paint polishing or ceramic coating.",
    },
    fr: {
      title: "Réserver un rendez-vous de detailing",
      description:
        "Demandez un rendez-vous chez JC Detailing à Wauwil, Lucerne pour un nettoyage intérieur ou extérieur, un polissage ou une protection céramique.",
    },
    it: {
      title: "Prenota un appuntamento di car detailing",
      description:
        "Richiedi un appuntamento da JC Detailing a Wauwil, Lucerna per pulizia interna o esterna, lucidatura o rivestimento ceramico.",
    },
  },
  terms: {
    de: {
      title: "Allgemeine Geschäftsbedingungen",
      description: "Allgemeine Geschäftsbedingungen von JC Detailing in Wauwil, Luzern.",
    },
    en: {
      title: "Terms and conditions",
      description: "Terms and conditions for services provided by JC Detailing in Wauwil, Lucerne.",
    },
    fr: {
      title: "Conditions générales",
      description: "Conditions générales applicables aux services de JC Detailing à Wauwil, Lucerne.",
    },
    it: {
      title: "Termini e condizioni",
      description: "Termini e condizioni per i servizi offerti da JC Detailing a Wauwil, Lucerna.",
    },
  },
  imprint: {
    de: {
      title: "Impressum",
      description: "Impressum und Kontaktangaben von JC Detailing in Wauwil, Luzern.",
    },
    en: {
      title: "Legal notice",
      description: "Legal notice and contact details for JC Detailing in Wauwil, Lucerne.",
    },
    fr: {
      title: "Mentions légales",
      description: "Mentions légales et coordonnées de JC Detailing à Wauwil, Lucerne.",
    },
    it: {
      title: "Note legali",
      description: "Note legali e dati di contatto di JC Detailing a Wauwil, Lucerna.",
    },
  },
  privacy: {
    de: {
      title: "Datenschutzerklärung",
      description: "Datenschutzerklärung von JC Detailing in Wauwil, Luzern.",
    },
    en: {
      title: "Privacy policy",
      description: "Privacy policy for the JC Detailing website and booking service.",
    },
    fr: {
      title: "Politique de confidentialité",
      description: "Politique de confidentialité du site et du service de réservation JC Detailing.",
    },
    it: {
      title: "Informativa sulla privacy",
      description: "Informativa sulla privacy del sito e del servizio di prenotazione JC Detailing.",
    },
  },
} satisfies Record<string, Record<PublicLocale, SeoText>>;

export function localizedPublicUrl(path: string, locale: PublicLocale) {
  if (path === "/") {
    return localeHome(locale);
  }

  if (locale === "de") {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${locale}`;
}

export function publicLanguageAlternates(path: string) {
  const languages = Object.fromEntries(
    publicLocales.map((locale) => [
      intlLocales[locale],
      localizedPublicUrl(path, locale),
    ]),
  );

  return {
    ...languages,
    "x-default": localizedPublicUrl(path, "de"),
  };
}

export function buildPublicMetadata(
  locale: PublicLocale,
  { path, title, description, image = defaultImage, imageAlt }: PublicMetadataOptions,
): Metadata {
  const canonical = localizedPublicUrl(path, locale);
  const socialTitle = `${title} | ${siteName}`;
  const alt = imageAlt ?? socialTitle;

  return {
    title,
    description,
    keywords: localizedKeywords[locale],
    alternates: {
      canonical,
      languages: publicLanguageAlternates(path),
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      type: "website",
      locale: intlLocales[locale].replace("-", "_"),
      alternateLocale: publicLocales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => intlLocales[candidate].replace("-", "_")),
      siteName,
      images: [{ url: image, alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
    other: {
      "geo.region": "CH-LU",
      "geo.placename": "Wauwil",
      "ICBM": "47.1851689, 8.027709",
    },
  };
}

export function buildServiceMetadata(
  locale: PublicLocale,
  service: ServiceMetadataInput,
): Metadata {
  const location = {
    de: "in Wauwil, Luzern",
    en: "in Wauwil, Lucerne",
    fr: "à Wauwil, Lucerne",
    it: "a Wauwil, Lucerna",
  }[locale];
  const closing = {
    de: "Professionelle Fahrzeugpflege von JC Detailing für Kunden in Luzern und der Zentralschweiz.",
    en: "Professional vehicle care by JC Detailing for customers in Lucerne and Central Switzerland.",
    fr: "Entretien automobile professionnel par JC Detailing pour les clients de Lucerne et de Suisse centrale.",
    it: "Cura professionale dell'auto da JC Detailing per clienti a Lucerna e nella Svizzera centrale.",
  }[locale];

  return buildPublicMetadata(locale, {
    path: service.path,
    title: `${service.title} ${location}`,
    description: `${service.short} ${closing}`,
    image: service.image,
    imageAlt: `${service.title} - JC Detailing, Wauwil`,
  });
}
