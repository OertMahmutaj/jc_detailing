// app/angebote/page.tsx

import { GermanOffersGrid } from "../components/GermanOffersGrid";
import { HeroIntro, HeroItem, PageEntry } from "../components/StudioMotion";
import { normalizeLocale, type PublicLocale } from "../i18n";
import { offersPageCopy } from "../offerCopy";

export function OffersPageContent({ locale }: { locale: PublicLocale }) {
  const copy = offersPageCopy[locale];

  return (
    <PageEntry className="page-shell" id="top">
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

export default async function AngebotePage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams)?.lang);
  return <OffersPageContent locale={locale} />;
}
