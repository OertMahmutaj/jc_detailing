"use client";

import { ChevronUp } from "lucide-react";
import { useEffect } from "react";
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
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <a className="back-to-top" href="#top" aria-label={labels[locale]}>
      <ChevronUp size={18} />
    </a>
  );
}
