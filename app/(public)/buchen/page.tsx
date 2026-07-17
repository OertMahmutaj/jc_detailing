import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "../components/BookingForm";
import { HeroIntro, HeroItem, PageEntry } from "../components/StudioMotion";
import { bookingPageCopy } from "../bookingCopy";
import { intlLocales, normalizeLocale } from "../i18n";
import { buildPublicMetadata, publicPageSeo } from "../seo";

type BookingPageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  searchParams,
}: BookingPageProps): Promise<Metadata> {
  const locale = normalizeLocale((await searchParams)?.lang);

  return buildPublicMetadata(locale, {
    path: "/buchen",
    ...publicPageSeo.booking[locale],
  });
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const copy = bookingPageCopy[locale];

  return (
    <PageEntry className="page-shell" id="top" lang={intlLocales[locale]}>
      <section className="sub-hero booking-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">{copy.eyebrow}</p>
          </HeroItem>

          <HeroItem>
            <h1>{copy.title}</h1>
          </HeroItem>

          <HeroItem>
            <p>{copy.description}</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <section id="booking" className="booking-section">
        <div className="booking-intro">
          <p className="mini-title">{copy.sectionEyebrow}</p>
          <h2>{copy.sectionTitle}</h2>
          <p>{copy.sectionDescription}</p>
        </div>

        <Suspense fallback={<div className="booking-loading" />}>
          <BookingForm />
        </Suspense>
      </section>
    </PageEntry>
  );
}
