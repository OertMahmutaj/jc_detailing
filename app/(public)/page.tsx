import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Mail,
} from "lucide-react";
import { BeforeAfterSlider } from "./components/BeforeAfterSlider";
import { GoogleReviewWidget } from "./components/GoogleReviewWidget";
import {
  HeroIntro,
  HeroItem,
  LightGroup,
  LightItem,
  LightReveal,
  PageEntry,
} from "./components/StudioMotion";
import { germanOffers, serviceItems } from "../data/site";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jcdetailing.ch";

export const metadata: Metadata = {
  title: "Autoaufbereitung in Wauwil, Luzern",
  description:
    "JC Detailing bietet professionelle Autoaufbereitung in Wauwil, Kanton Luzern: Innenreinigung, Aussenreinigung, Politur, Lackpflege und Keramikversiegelung für Fahrzeuge in der Zentralschweiz.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "JC Detailing | Autoaufbereitung in Wauwil, Luzern",
    description:
      "Professionelle Fahrzeugaufbereitung, Innenreinigung, Politur und Keramikversiegelung in Wauwil, Kanton Luzern.",
    url: "/",
    type: "website",
    locale: "de_CH",
    siteName: "JC Detailing",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "JC Detailing Autoaufbereitung in Wauwil, Luzern",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "JC Detailing | Autoaufbereitung in Wauwil, Luzern",
    description:
      "Professionelle Fahrzeugaufbereitung, Innenreinigung, Politur und Keramikversiegelung in Wauwil, Kanton Luzern.",
    images: ["/logo.png"],
  },
};

const bookingUrl = "/buchen";

const galleryComparisons = [
  { before: "/before_1.webp", after: "/after_1.webp" },
  { before: "/before_2.webp", after: "/after_2.webp" },
  { before: "/before_3.avif", after: "/after_3.avif" },
];

const languages = ["DEU", "ENG", "FRA", "ITA", "ALB"];

const faqs = [
  {
    question: "Was ist Car Detailing?",
    answer:
      "Car Detailing ist eine präzise Fahrzeugaufbereitung, die deutlich weiter geht als eine normale Autowäsche. Innenraum, Lack, Felgen und Details werden gründlich gereinigt, gepflegt und geschützt.",
  },
  {
    question: "Wo befindet sich JC Detailing?",
    answer:
      "JC Detailing befindet sich an der Sternmatt 4 in 6242 Wauwil im Kanton Luzern. Die Leistungen richten sich an Kunden aus Wauwil, Luzern und der Zentralschweiz.",
  },
  {
    question: "Bietet JC Detailing mobilen Service an?",
    answer:
      "Aktuell finden alle Behandlungen in der Garage statt, damit Licht, Ausstattung und Arbeitsbedingungen für hochwertige Ergebnisse stimmen.",
  },
  {
    question: "Wie lange dauert ein Termin?",
    answer:
      "Je nach Zustand und Paket dauert eine Innenreinigung etwa 3 bis 8 Stunden, eine Komplettaufbereitung etwa 6 bis 10 Stunden und Lackkorrektur mit Keramikversiegelung etwa 1 bis 2 Tage.",
  },
  {
    question:
      "Was ist der Unterschied zwischen einer normalen Autowäsche und Detailing?",
    answer:
      "Eine Autowäsche entfernt vor allem oberflächlichen Schmutz. Car Detailing ist deutlich gründlicher: Lack, Innenraum, Materialien und Details werden sorgfältig gereinigt, gepflegt und geschützt.",
  },
  {
    question: "Wie oft sollte man sein Auto aufbereiten lassen?",
    answer:
      "Für die meisten Fahrzeuge ist eine gründliche Aufbereitung ein- bis zweimal pro Jahr sinnvoll. Eine regelmässige Erhaltungspflege hilft, den sauberen Zustand länger zu bewahren.",
  },
];

export default function Home() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${siteUrl}/#localbusiness`,
    name: "JC Detailing",
    url: siteUrl,
    telephone: "+41 77 268 33 88",
    email: "jcdetailinglucerne@gmail.com",
    image: [`${siteUrl}/logo.png`],
    logo: `${siteUrl}/logo.png`,
    description:
      "Professionelle Autoaufbereitung, Innenreinigung, Aussenreinigung, Politur, Lackpflege und Keramikversiegelung in Wauwil, Kanton Luzern.",
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
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Autoaufbereitung",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Innenreinigung",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Aussenreinigung",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Politur und Lackpflege",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Keramikversiegelung",
        },
      },
    ],
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

      <PageEntry>
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

            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/hero_poster.webp"
            >
              <source
                src="/hero_vid_mobile_hq.mp4"
                type="video/mp4"
                media="(max-width: 767px)"
              />
              <source
                src="/hero_vid_desktop_hq.mp4"
                type="video/mp4"
                media="(min-width: 768px)"
              />
            </video>
          </div>

          <div className="hero-overlay" aria-hidden="true" />

          <HeroIntro className="hero-content">
            <HeroItem>
              <p className="eyebrow">Kanton Luzern - Sternmatt 4, 6242 Wauwil</p>
            </HeroItem>

            <HeroItem>
              <h1>
                JC <span>Detailing</span>
              </h1>
            </HeroItem>

            <HeroItem>
              <p>
                Professionelle Fahrzeugaufbereitung, Lackpflege und
                Keramikversiegelung in der Zentralschweiz.
              </p>
            </HeroItem>

            <HeroItem>
              <div className="hero-buttons">
                <Link className="ghost-button" href={bookingUrl}>
                  <CalendarCheck size={18} />
                  Termin buchen
                </Link>

                <Link className="ghost-button" href="/leistungen">
                  Leistungen ansehen
                  <ArrowRight size={17} />
                </Link>
              </div>
            </HeroItem>
          </HeroIntro>

          <a className="scroll-tab" href="#services" aria-label="Zu den Leistungen">
            <ChevronDown size={18} />
          </a>
        </section>

        <section id="services" className="section">
          <LightReveal className="section-heading">
            <span>01</span>
            <h2>Leistungen</h2>
          </LightReveal>

          <LightGroup className="service-grid">
            {serviceItems.map((service) => (
              <LightItem key={service.id}>
                <Link className="service-card" href={service.path}>
                  <div className="service-image">
                    <Image
                      alt={`${service.title} bei JC Detailing in Wauwil, Luzern`}
                      fill
                      quality={60}
                      sizes="(max-width: 720px) 100vw, 25vw"
                      src={service.image}
                    />
                  </div>

                  <div className="service-body">
                    <h3>{service.title}</h3>
                    <p>{service.short}</p>
                    <span>
                      Mehr Info
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              </LightItem>
            ))}
          </LightGroup>
        </section>

        <section id="packages" className="section">
          <LightReveal className="section-heading">
            <span>02</span>
            <h2>Meistgebuchte Angebote</h2>
          </LightReveal>

          <LightGroup className="package-grid">
            {germanOffers.slice(0, 2).map((offer) => (
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
                      Sorgfältige Fahrzeugkontrolle vor Beginn
                    </li>
                    <li>
                      <Check size={16} />
                      Hochwertige Produkte und saubere Verarbeitung
                    </li>
                    <li>
                      <Check size={16} />
                      Finale Kontrolle vor der Übergabe
                    </li>
                  </ul>

                  <Link href="/angebote/de">
                    Alle Angebote
                    <ArrowRight size={16} />
                  </Link>
                </article>
              </LightItem>
            ))}
          </LightGroup>
        </section>

        <section id="about" className="section">
          <LightReveal className="section-heading">
            <span>03</span>
            <h2>Über uns</h2>
          </LightReveal>

          <LightGroup className="about-layout">
            <LightItem className="about-copy">
              <p className="mini-title">Wer wir sind</p>
              <h3>Saubere Arbeit, ruhige Hand, echter Anspruch.</h3>

              <p>
                JC Detailing steht für professionelle Autoaufbereitung in der
                Zentralschweiz. Ob Innenreinigung, Aussenreinigung, Politur oder
                Keramikversiegelung: jedes Fahrzeug wird mit Sorgfalt,
                hochwertigen Produkten und viel Liebe zum Detail behandelt.
              </p>

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
          </LightGroup>
        </section>

        <section id="work" className="section">
          <LightReveal className="section-heading">
            <span>04</span>
            <h2>Vorher-Nachher Galerie</h2>
            <p>
              Echte Ergebnisse professioneller Autoaufbereitung, Politur,
              Innenreinigung und Keramikversiegelung in Wauwil.
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
            <Link href="/gallery">
              Alle Vorher-Nachher Ergebnisse ansehen
              <ArrowRight size={16} />
            </Link>
          </LightReveal>
        </section>

        <section className="section">
          <LightReveal className="section-heading">
            <span>05</span>
            <h2>FAQ</h2>
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
              <p className="mini-title">Kontakt</p>
              <h2>Bereit für ein frisch aufbereitetes Fahrzeug?</h2>
              <p>
                Termine sind auf Anfrage verfügbar. Schick eine kurze Nachricht
                mit Fahrzeug, gewünschter Leistung und Wunschdatum.
              </p>
            </div>

            <div className="contact-actions">
              <Link className="ghost-button" href={bookingUrl}>
                <CalendarCheck size={18} />
                Termin buchen
              </Link>

              <a className="ghost-button" href="mailto:info@jcdetailing.ch">
                <Mail size={18} />
                Nachricht senden
              </a>
            </div>
          </LightReveal>
        </section>

        <GoogleReviewWidget />
      </PageEntry>
    </>
  );
}