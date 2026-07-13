// app/impressum/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";
import { normalizeLocale } from "../i18n";
import { imprintCopy } from "../legalCopy";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum von JC Detailing, Juljan Cela, Sternmatt 4, 6242 Wauwil, Schweiz.",
  alternates: {
    canonical: "/impressum",
  },
};

export default async function ImpressumPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const document = imprintCopy[locale];

  return (
    <LegalPage
      title={document.title}
      intro={document.intro}
      sections={document.sections}
    />
  );
}
