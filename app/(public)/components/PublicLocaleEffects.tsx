"use client";

import { ChevronUp } from "lucide-react";
import { useEffect } from "react";

import { intlLocales } from "../i18n";
import { usePublicLocale } from "./usePublicLocale";

const labels = {
  de: "Zum Seitenanfang",
  en: "Back to top",
  fr: "Retour en haut",
  it: "Torna in alto",
} as const;

export function PublicLocaleEffects() {
  const locale = usePublicLocale();

  useEffect(() => {
    document.documentElement.lang = intlLocales[locale];
  }, [locale]);

  return (
    <a
      className="back-to-top"
      href="#top"
      aria-label={labels[locale]}
    >
      <ChevronUp aria-hidden="true" size={18} />
    </a>
  );
}