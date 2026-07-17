// app/angebote/page.tsx

import type { Metadata } from "next";
import { GermanOffersGrid } from "../components/GermanOffersGrid";
import { HeroIntro, HeroItem, PageEntry } from "../components/StudioMotion";
import { intlLocales, normalizeLocale, type PublicLocale } from "../i18n";
import { offersPageCopy } from "../offerCopy";
import { buildPublicMetadata, publicPageSeo } from "../seo";

type AngebotePageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  searchParams,
}: AngebotePageProps): Promise<Metadata> {
  const locale = normalizeLocale((await searchParams)?.lang);

  return buildPublicMetadata(locale, {
    path: "/angebote",
    ...publicPageSeo.offers[locale],
  });
}

export function OffersPageContent({ locale }: { locale: PublicLocale }) {
  const copy = offersPageCopy[locale];

  return (
    <PageEntry className="page-shell" id="top" lang={intlLocales[locale]}>
      <section className="sub-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">{copy.eyebrow}</p>
          </HeroItem>
          <HeroItem>
            <h1>{copy.title}</h1>
          </HeroItem>
          <HeroItem>
            <p>{copy.intro}</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <GermanOffersGrid locale={locale} />
    </PageEntry>
  );
}

export default async function AngebotePage({ searchParams }: AngebotePageProps) {
  const locale = normalizeLocale((await searchParams)?.lang);
  return <OffersPageContent locale={locale} />;
}
