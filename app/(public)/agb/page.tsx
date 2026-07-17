// app/agb/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";
import { normalizeLocale } from "../i18n";
import { termsCopy } from "../legalCopy";
import { buildPublicMetadata, publicPageSeo } from "../seo";

type LegalPageProps = { searchParams?: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: LegalPageProps): Promise<Metadata> {
  const locale = normalizeLocale((await searchParams)?.lang);
  return buildPublicMetadata(locale, { path: "/agb", ...publicPageSeo.terms[locale] });
}

export default async function AGBPage({ searchParams }: LegalPageProps) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const document = termsCopy[locale];

  return (
    <LegalPage
      locale={locale}
      title={document.title}
      intro={document.intro}
      sections={document.sections}
    />
  );
}
