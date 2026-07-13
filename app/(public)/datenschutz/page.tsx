// app/datenschutz/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";
import { normalizeLocale } from "../i18n";
import { privacyCopy } from "../legalCopy";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Datenschutzerklärung von JC Detailing in Wauwil, Luzern. Informationen zur Verarbeitung personenbezogener Daten bei Kontaktanfragen und Terminbuchungen.",
  alternates: {
    canonical: "/datenschutz",
  },
};
export default async function DatenschutzPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const document = privacyCopy[locale];

  return (
    <LegalPage
      title={document.title}
      sections={document.sections}
    />
  );
}
