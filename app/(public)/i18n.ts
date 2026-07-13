export const publicLocales = ["de", "en", "fr", "it"] as const;

export type PublicLocale = (typeof publicLocales)[number];

export const localeNames: Record<PublicLocale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  it: "Italiano",
};

export const intlLocales: Record<PublicLocale, string> = {
  de: "de-CH",
  en: "en-CH",
  fr: "fr-CH",
  it: "it-CH",
};

export function normalizeLocale(value?: string | null): PublicLocale {
  const locale = value?.toLowerCase();

  return publicLocales.includes(locale as PublicLocale)
    ? (locale as PublicLocale)
    : "de";
}

export function localeFromPathname(pathname: string, queryLocale?: string | null) {
  if (queryLocale) {
    return normalizeLocale(queryLocale);
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return normalizeLocale(firstSegment);
}

export function localeHome(locale: PublicLocale) {
  return locale === "de" ? "/" : `/${locale}`;
}

export function localizePublicHref(href: string, locale: PublicLocale) {
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return href;
  }

  const [pathAndQuery, hash] = href.split("#");
  const [rawPath, rawQuery = ""] = pathAndQuery.split("?");
  const home = localeHome(locale);

  if (rawPath === "/" || rawPath === "/de" || rawPath === "/en" || rawPath === "/fr" || rawPath === "/it") {
    return `${home}${hash ? `#${hash}` : ""}`;
  }

  const params = new URLSearchParams(rawQuery);
  params.set("lang", locale);
  const query = params.toString();

  return `${rawPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export const sharedCopy = {
  de: {
    nav: {
      home: "Startseite",
      services: "Leistungen",
      offers: "Angebote",
      gallery: "Galerie",
      about: "Über uns",
      faq: "FAQ",
      contact: "Kontakt",
      booking: "Termin buchen",
      language: "Sprache",
      chooseLanguage: "Sprache wählen",
      openMenu: "Menü öffnen",
      closeMenu: "Menü schliessen",
      mainNavigation: "Hauptnavigation",
    },
    serviceNav: {
      innenreinigung: ["Innenreinigung", "Tiefenpflege für Leder, Stoffe und Innenraumdetails."],
      aussenreinigung: ["Aussenreinigung", "Schonende Handwäsche, Felgenpflege und Schutzfinish."],
      politur: ["Politur", "Mehr Tiefe, Klarheit und Glanz für den Lack."],
      keramikversiegelung: ["Keramikversiegelung", "Langzeit-Schutz mit hydrophobem Premium-Finish."],
    },
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      offers: "Packages",
      gallery: "Gallery",
      about: "About us",
      faq: "FAQ",
      contact: "Contact",
      booking: "Book appointment",
      language: "Language",
      chooseLanguage: "Choose language",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      mainNavigation: "Main navigation",
    },
    serviceNav: {
      innenreinigung: ["Interior detailing", "Deep care for leather, fabrics and interior details."],
      aussenreinigung: ["Exterior detailing", "Careful hand wash, wheel care and protective finish."],
      politur: ["Paint polishing", "More depth, clarity and gloss for the paintwork."],
      keramikversiegelung: ["Ceramic coating", "Long-term hydrophobic protection with a premium finish."],
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      services: "Services",
      offers: "Offres",
      gallery: "Galerie",
      about: "À propos",
      faq: "FAQ",
      contact: "Contact",
      booking: "Prendre rendez-vous",
      language: "Langue",
      chooseLanguage: "Choisir la langue",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      mainNavigation: "Navigation principale",
    },
    serviceNav: {
      innenreinigung: ["Nettoyage intérieur", "Soin en profondeur du cuir, des tissus et des détails intérieurs."],
      aussenreinigung: ["Nettoyage extérieur", "Lavage à la main, soin des jantes et finition protectrice."],
      politur: ["Polissage", "Plus de profondeur, de clarté et de brillance pour la peinture."],
      keramikversiegelung: ["Protection céramique", "Protection hydrophobe longue durée et finition premium."],
    },
  },
  it: {
    nav: {
      home: "Home",
      services: "Servizi",
      offers: "Offerte",
      gallery: "Galleria",
      about: "Chi siamo",
      faq: "FAQ",
      contact: "Contatti",
      booking: "Prenota appuntamento",
      language: "Lingua",
      chooseLanguage: "Scegli la lingua",
      openMenu: "Apri il menu",
      closeMenu: "Chiudi il menu",
      mainNavigation: "Navigazione principale",
    },
    serviceNav: {
      innenreinigung: ["Pulizia interna", "Cura profonda di pelle, tessuti e dettagli interni."],
      aussenreinigung: ["Pulizia esterna", "Lavaggio a mano, cura dei cerchi e finitura protettiva."],
      politur: ["Lucidatura", "Più profondità, chiarezza e brillantezza per la vernice."],
      keramikversiegelung: ["Rivestimento ceramico", "Protezione idrofobica duratura con finitura premium."],
    },
  },
} as const;
