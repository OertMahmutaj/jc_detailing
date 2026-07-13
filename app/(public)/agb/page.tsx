// app/agb/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";
import { normalizeLocale } from "../i18n";
import { termsCopy } from "../legalCopy";

export const metadata: Metadata = {
  title: "AGB",
  description:
    "Allgemeine Geschäftsbedingungen von JC Detailing in Wauwil, Luzern.",
  alternates: {
    canonical: "/agb",
  },
};

export default async function AGBPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const document = termsCopy[locale];

  return (
    <LegalPage
      title={document.title}
      intro={document.intro}
      sections={document.sections}
    />
  );
}
