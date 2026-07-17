import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { BeforeAfterSlider } from "./components/BeforeAfterSlider";
import { GoogleReviewWidget } from "./components/GoogleReviewWidget";
import { HeroBackgroundVideo } from "./components/HeroBackgroundVideo";
import { LanguageAwareBookingLink } from "./components/LanguageAwareBookingLink";
import { LocalizedPublicLink } from "./components/LocalizedPublicLink";
import {
  HeroIntro,
  HeroItem,
  LightGroup,
  LightItem,
  LightReveal,
  PageEntry,
} from "./components/StudioMotion";
import { serviceItems } from "../data/site";
import { homeCopy } from "./homeCopy";
import { intlLocales, localeHome, sharedCopy, type PublicLocale } from "./i18n";
import { buildPublicMetadata, homeSeo } from "./seo";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jcdetailing.ch";

export const metadata: Metadata = buildPublicMetadata("de", {
  path: "/",
  ...homeSeo.de,
  imageAlt: "JC Detailing Autoaufbereitung in Wauwil, Luzern",
});

const galleryComparisons = [
  { before: "/before_1.webp", after: "/after_1.webp" },
  { before: "/before_2.webp", after: "/after_2.webp" },
  { before: "/before_3.avif", after: "/after_3.avif" },
];

const languages = ["DEU", "ENG", "FRA", "ITA", "ALB"];

export function HomePage({ locale = "de" }: { locale?: PublicLocale }) {
  const copy = homeCopy[locale];
  const serviceCopy = sharedCopy[locale].serviceNav;
  const faqs = copy.faq.items;
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${siteUrl}/#localbusiness`,
    name: "JC Detailing",
    url: `${siteUrl}${localeHome(locale)}`,
    inLanguage: intlLocales[locale],
    telephone: "+41 77 268 33 88",
    email: "jcdetailinglucerne@gmail.com",
    image: [`${siteUrl}/logo.png`],
    logo: `${siteUrl}/logo.png`,
    description: homeSeo[locale].description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sternmatt 4",
      postalCode: "6242",
      addressLocality: "Wauwil",
      addressRegion: "LU",
      addressCountry: "CH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 47.18534387050612,
      longitude: 8.027698268723539,
      /*47.18534387050612, 8.027698268723539*/
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "08:00",
        closes: "24:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "24:00",
      },
    ],
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Kanton Luzern",
      },
      {
        "@type": "AdministrativeArea",
        name: "Zentralschweiz",
      },
    ],
    priceRange: "CHF",
    makesOffer: Object.values(serviceCopy).map(([name]) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name,
      },
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <PageEntry className="public-home" lang={intlLocales[locale]}>
        <section id="top" className="hero">
          <div className="video-background" aria-hidden="true">
            <Image
              alt=""
              aria-hidden="true"
              className="hero-poster-image"
              fill
              priority
              quality={60}
              sizes="100vw"
              src="/hero_poster.webp"
            />

            <HeroBackgroundVideo />
          </div>

          <div className="hero-overlay" aria-hidden="true" />

          <HeroIntro className="hero-content">
            <HeroItem>
              <p className="eyebrow">{copy.hero.eyebrow}</p>
            </HeroItem>

            <HeroItem>
              <h1>
                JC <span>Detailing</span>
              </h1>
            </HeroItem>

            <HeroItem>
              <p>
                {copy.hero.description}
              </p>
            </HeroItem>

            <HeroItem>
              <div className="hero-buttons">
                <LanguageAwareBookingLink className="ghost-button">
                  <CalendarCheck size={18} />
                  {copy.hero.booking}
                </LanguageAwareBookingLink>

                <LocalizedPublicLink className="ghost-button" href="/leistungen#services-grid">
                  {copy.hero.services}
                  <ArrowRight size={17} />
                </LocalizedPublicLink>
              </div>
            </HeroItem>
          </HeroIntro>

        </section>

        <section className="trust-strip" aria-label={copy.trustLabel}>
          <LightGroup className="trust-strip-inner">
            <LightItem className="trust-item">
              <Star aria-hidden="true" size={24} />
              <div>
                <strong>{copy.trust[0].title}</strong>
                <span>{copy.trust[0].text}</span>
              </div>
            </LightItem>

            <LightItem className="trust-item">
              <Sparkles aria-hidden="true" size={24} />
              <div>
                <strong>{copy.trust[1].title}</strong>
                <span>{copy.trust[1].text}</span>
              </div>
            </LightItem>

            <LightItem className="trust-item">
              <ShieldCheck aria-hidden="true" size={24} />
              <div>
                <strong>{copy.trust[2].title}</strong>
                <span>{copy.trust[2].text}</span>
              </div>
            </LightItem>

            <LightItem className="trust-item">
              <MapPin aria-hidden="true" size={24} />
              <div>
                <strong>{copy.trust[3].title}</strong>
                <span>{copy.trust[3].text}</span>
              </div>
            </LightItem>
          </LightGroup>
        </section>

        <section id="services" className="section">
          <LightReveal className="section-heading">
            <div>
              <span>{copy.services.eyebrow}</span>
              <h2>{copy.services.title}</h2>
            </div>
            <p>
              {copy.services.intro}
            </p>
          </LightReveal>

          <LightGroup className="service-grid">
            {serviceItems.map((service) => (
              <LightItem key={service.id}>
                <LocalizedPublicLink className="service-card" href={service.path}>
                  <div className="service-image">
                    <Image
                      alt={`${serviceCopy[service.id][0]} - JC Detailing Wauwil`}
                      fill
                      quality={60}
                      sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 25vw"
                      src={service.image}
                    />
                  </div>

                  <div className="service-body">
                    <h3>{serviceCopy[service.id][0]}</h3>
                    <p>{serviceCopy[service.id][1]}</p>
                    <span>
                      {copy.services.more}
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </LocalizedPublicLink>
              </LightItem>
            ))}
          </LightGroup>
        </section>

        <section id="packages" className="section">
          <LightReveal className="section-heading">
            <div>
              <span>{copy.packages.eyebrow}</span>
              <h2>{copy.packages.title}</h2>
            </div>
            <p>
              {copy.packages.intro}
            </p>
          </LightReveal>

          <LightGroup className="package-grid">
            {copy.packageCards.map((offer) => (
              <LightItem key={offer.title}>
                <article className="package-card">
                  <div className="package-top">
                    <h3>{offer.title}</h3>
                    <strong>{offer.price}</strong>
                  </div>

                  <p>{offer.text}</p>

                  <ul>
                    <li>
                      <Check size={16} />
                      {copy.packages.checks[0]}
                    </li>
                    <li>
                      <Check size={16} />
                      {copy.packages.checks[1]}
                    </li>
                    <li>
                      <Check size={16} />
                      {copy.packages.checks[2]}
                    </li>
                  </ul>

                  <LocalizedPublicLink href="/angebote#offers-grid">
                    {copy.packages.all}
                    <ArrowRight size={16} />
                  </LocalizedPublicLink>
                </article>
              </LightItem>
            ))}
          </LightGroup>
        </section>

        <section id="about" className="section">
          <LightReveal className="section-heading">
            <div>
              <span>{copy.about.eyebrow}</span>
              <h2>{copy.about.title}</h2>
            </div>
          </LightReveal>

          <LightGroup className="about-layout">
            <LightItem className="about-copy">
              <p className="mini-title">{copy.about.mini}</p>
              <h3>{copy.about.cardTitle}</h3>

              <div className="about-body">
                {copy.about.body.map((paragraph, index) => (
                  <p className={index === copy.about.body.length - 1 ? "about-signature" : undefined} key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="language-row">
                {languages.map((language) => (
                  <span key={language}>{language}</span>
                ))}
              </div>
            </LightItem>

            <LightItem className="about-image">
              <Image
                alt="Juljan Cela von JC Detailing in Wauwil"
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                src="/Juljan.avif"
              />
            </LightItem>

            <LightItem className="about-proof">
              <article>
                <Star aria-hidden="true" size={25} />
                <strong>{copy.about.reviews}</strong>
                <span>{copy.about.reviewsLabel}</span>
              </article>
              <article>
                <Sparkles aria-hidden="true" size={25} />
                <strong>{copy.about.servicesCount}</strong>
                <span>{copy.about.servicesLabel}</span>
              </article>
              <article>
                <MapPin aria-hidden="true" size={25} />
                <strong>{copy.about.location}</strong>
                <span>{copy.about.locationLabel}</span>
              </article>
            </LightItem>
          </LightGroup>
        </section>

        <section id="work" className="section">
          <LightReveal className="section-heading">
            <div>
              <span>{copy.gallery.eyebrow}</span>
              <h2>{copy.gallery.title}</h2>
            </div>
            <p>
              {copy.gallery.intro}
            </p>
          </LightReveal>

          <LightGroup className="work-grid">
            {galleryComparisons.map((comparison, index) => (
              <LightItem key={comparison.before}>
                <BeforeAfterSlider
                  after={comparison.after}
                  before={comparison.before}
                  index={index + 1}
                />
              </LightItem>
            ))}
          </LightGroup>

          <LightReveal className="section-action">
            <LocalizedPublicLink href="/gallery#gallery-grid">
              {copy.gallery.all}
              <ArrowRight size={16} />
            </LocalizedPublicLink>
          </LightReveal>
        </section>

        <section id="faq" className="section">
          <LightReveal className="section-heading">
            <div>
              <span>{copy.faq.eyebrow}</span>
              <h2>{copy.faq.title}</h2>
            </div>
          </LightReveal>

          <LightGroup className="faq-list">
            {faqs.map((faq) => (
              <LightItem key={faq.question}>
                <details>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              </LightItem>
            ))}
          </LightGroup>
        </section>

        <section id="contact" className="contact-section">
          <LightReveal className="contact-panel">
            <div>
              <p className="mini-title">{copy.contact.eyebrow}</p>
              <h2>{copy.contact.title}</h2>
              <p>
                {copy.contact.intro}
              </p>
            </div>

            <div className="contact-actions">
              <LanguageAwareBookingLink className="ghost-button">
                <CalendarCheck size={18} />
                {copy.contact.booking}
              </LanguageAwareBookingLink>

              <a className="ghost-button" href="mailto:info@jcdetailing.ch">
                <Mail size={18} />
                {copy.contact.message}
              </a>
            </div>
          </LightReveal>
        </section>

        <GoogleReviewWidget />
      </PageEntry>
    </>
  );
}

export default function Home() {
  return <HomePage locale="de" />;
}
