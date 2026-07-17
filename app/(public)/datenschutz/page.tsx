// app/datenschutz/page.tsx

import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";
import { normalizeLocale } from "../i18n";
import { privacyCopy } from "../legalCopy";
import { buildPublicMetadata, publicPageSeo } from "../seo";

type LegalPageProps = { searchParams?: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: LegalPageProps): Promise<Metadata> {
  const locale = normalizeLocale((await searchParams)?.lang);
  return buildPublicMetadata(locale, { path: "/datenschutz", ...publicPageSeo.privacy[locale] });
}

export default async function DatenschutzPage({ searchParams }: LegalPageProps) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const document = privacyCopy[locale];

  return (
    <LegalPage
      locale={locale}
      title={document.title}
      sections={document.sections}
    />
  );
}
