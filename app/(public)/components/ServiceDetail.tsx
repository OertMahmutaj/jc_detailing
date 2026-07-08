// app/components/ServiceDetail.tsx

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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
            <h1>{service.title}</h1>
          </HeroItem>
          <HeroItem>
            <p>{service.short}</p>
          </HeroItem>
          <HeroItem>
            <Link className="primary-button" href="/#contact">
              Anfrage senden
              <ArrowRight size={17} />
            </Link>
          </HeroItem>
        </HeroIntro>

        <LightReveal
          className="detail-hero-image"
          style={{ backgroundImage: `url(${service.image})` }}
        />
      </section>

      <section className="detail-section">
        <LightReveal className="section-heading compact">
          <span>Included</span>
          <h2>Was enthalten ist</h2>
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
          <span>Process</span>
          <h2>Ablauf und Ergebnis</h2>
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

      <LightReveal className="cta-band">
        <h2>Bereit für {service.title}?</h2>
        <p>Schick uns dein Fahrzeugmodell, Zustand und Wunschdatum.</p>
        <Link href="/#contact">
          Kontakt aufnehmen
          <ArrowRight size={16} />
        </Link>
      </LightReveal>
    </PageEntry>
  );
}
