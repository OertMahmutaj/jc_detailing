import Link from "next/link";
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
import { germanOffers, serviceItems } from "./data/site";

const bookingUrl = "https://detailr.co/book/jcdetailing-dpx3";

const galleryComparisons = [
  { before: "/before_1.jpeg", after: "/after_1.jpeg" },
  { before: "/before_2.jpeg", after: "/after_2.jpeg" },
  { before: "/before_3.avif", after: "/after_3.avif" },
];

const languages = ["DEU", "ENG", "FRA", "ITA", "ALB"];

const faqs = [
  {
    question: "Was ist Car Detailing?",
    answer:
      "Car Detailing ist eine praezise Fahrzeugaufbereitung, die deutlich weiter geht als eine normale Autowaesche. Innenraum, Lack, Felgen und Details werden gereinigt, gepflegt und geschuetzt.",
  },
  {
    question: "Bietet JC Detailing mobilen Service an?",
    answer:
      "Aktuell finden alle Behandlungen in der Garage statt, damit Licht, Ausstattung und Arbeitsbedingungen fuer hochwertige Ergebnisse stimmen.",
  },
  {
    question: "Wie lange dauert ein Termin?",
    answer:
      "Je nach Zustand und Paket dauert eine Innenreinigung etwa 3 bis 8 Stunden, eine Komplettaufbereitung etwa 6 bis 10 Stunden und Lackkorrektur mit Versiegelung 1 bis 2 Tage.",
  },
  {
    question: "Wie ist der Unterschied zwischen einer normalen Autowaesche und Detailing?",
    answer: `Eine Autowäsche entfernt oberflächlichen Schmutz in kurzer Zeit.
  Car Detailing hingegen ist ein zeitintensiver, präziser Prozess, bei dem:

    Lackdefekte (Kratzer, Swirls) entfernt werden.
    Hochwertige Pflegeprodukte verwendet werden.
    Jedes Detail im Innenraum und Aussen gereinigt wird.

  Kurz gesagt: Waschen ist Reinigung – Detailing ist Pflege & Werterhalt.`,
  },
  {
    question: "Wie oft sollte man sein Auto detailen lassen?",
    answer: `Die Dauer hängt vom Zustand des Fahrzeugs und dem gewünschten Service ab -

    Innenreinigung: ca. 3–8 Stunden.

    Komplettaufbereitung: ca. 6-10 Stunden.

    Lackkorrektur & Versiegelung: ca. 1-2 Tage.

    Wir nehmen uns bewusst Zeit, um perfekte Ergebnisse ohne Kompromisse zu liefern.`,
  },
];

export default function Home() {
  return (
    <PageEntry>
      <section id="top" className="hero">
        <div className="video-background" aria-hidden="true">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload nofullscreen noremoteplayback"
          >
            <source src="/hero_vid_web.mp4" type="video/mp4" />
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
              <a className="ghost-button" href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <CalendarCheck size={18} />
                Termin buchen
              </a>

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
                <div
                  className="service-image"
                  style={{ backgroundImage: `url(${service.image})` }}
                />

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
                    Sorgfaeltige Fahrzeugkontrolle vor Beginn
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
              JC Detailing steht fuer professionelle Autoaufbereitung in der
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

          <LightItem
            className="about-image"
            style={{ backgroundImage: "url(/Juljan.avif)" }}
          />
        </LightGroup>
      </section>

      <section id="work" className="section">
        <LightReveal className="section-heading">
          <span>04</span>
          <h2>Galerie</h2>
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
            <h2>Bereit fuer ein frisch aufbereitetes Fahrzeug?</h2>
            <p>
              Termine sind auf Anfrage verfuegbar. Schick eine kurze Nachricht
              mit Fahrzeug, gewuenschter Leistung und Wunschdatum.
            </p>
          </div>

          <div className="contact-actions">
            <a className="ghost-button" href={bookingUrl} target="_blank" rel="noopener noreferrer">
              <CalendarCheck size={18} />
              Termin buchen
            </a>

            <a className="ghost-button" href="mailto:info@jcdetailing.ch">
              <Mail size={18} />
              Nachricht senden
            </a>
          </div>
        </LightReveal>
      </section>

      <GoogleReviewWidget />
    </PageEntry>
  );
}
