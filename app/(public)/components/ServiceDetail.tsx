// app/components/ServiceDetail.tsx

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Check } from "lucide-react";
import type { Service } from "../../data/site";
import {
  HeroIntro,
  HeroItem,
  LightGroup,
  LightItem,
  LightReveal,
  PageEntry,
} from "./StudioMotion";

type ServiceDetailProps = {
  service: Service;
};

export function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <PageEntry className="page-shell" id="top">
      <section className="detail-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">{service.eyebrow}</p>
          </HeroItem>

          <HeroItem>
            <h1>{service.title} in Wauwil, Luzern</h1>
          </HeroItem>

          <HeroItem>
            <p>
              {service.short} Bei JC Detailing erhältst du professionelle
              Fahrzeugaufbereitung in Wauwil für Kunden aus dem Kanton Luzern
              und der Zentralschweiz.
            </p>
          </HeroItem>

          <HeroItem>
            <Link className="primary-button" href="/buchen">
              Termin anfragen
              <CalendarCheck size={17} />
            </Link>
          </HeroItem>
        </HeroIntro>

        <LightReveal className="detail-hero-image">
          <Image
            alt={`${service.title} bei JC Detailing in Wauwil, Luzern`}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 48vw"
            src={service.image}
          />
        </LightReveal>
      </section>

      <section className="detail-section">
        <LightReveal className="section-heading compact">
          <span>Leistung</span>
          <h2>Was bei der {service.title} enthalten ist</h2>
        </LightReveal>

        <LightGroup className="included-grid">
          {service.includes.map((item) => (
            <LightItem key={item}>
              <div className="included-item">
                <Check size={18} />
                <span>{item}</span>
              </div>
            </LightItem>
          ))}
        </LightGroup>
      </section>

      <section className="detail-section">
        <LightReveal className="section-heading compact">
          <span>Ablauf</span>
          <h2>Professionelle Fahrzeugaufbereitung mit klarer Arbeitsweise</h2>
        </LightReveal>

        <LightGroup className="process-grid">
          <LightItem>
            <div className="process-card">
              <span>01</span>
              <h3>Der Ablauf</h3>
              <p>{service.process}</p>
            </div>
          </LightItem>

          <LightItem>
            <div className="process-card">
              <span>02</span>
              <h3>Das Ergebnis</h3>
              <p>{service.outcome}</p>
            </div>
          </LightItem>
        </LightGroup>
      </section>

      <section className="detail-section">
        <LightReveal className="section-heading compact">
          <span>Standort</span>
          <h2>{service.title} in Wauwil und Umgebung Luzern</h2>
        </LightReveal>

        <LightReveal className="process-card">
          <p>
            JC Detailing befindet sich in Wauwil im Kanton Luzern. Die Leistung
            eignet sich für Fahrzeughalter, die eine saubere, präzise und
            hochwertige Aufbereitung in der Zentralschweiz suchen.
          </p>
        </LightReveal>
      </section>

      <LightReveal className="cta-band">
        <h2>Bereit für {service.title}?</h2>

        <p>
          Schick uns dein Fahrzeugmodell, den aktuellen Zustand und dein
          Wunschdatum. Wir prüfen die Anfrage und melden uns mit einer passenden
          Terminbestätigung.
        </p>

        <Link href="/buchen">
          Termin anfragen
          <ArrowRight size={16} />
        </Link>
      </LightReveal>
    </PageEntry>
  );
}