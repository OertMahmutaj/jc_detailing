// app/components/ServiceDetail.tsx

import Image from "next/image";
import { ArrowRight, CalendarCheck, Check } from "lucide-react";
import type { PublicLocale } from "../i18n";
import type { LocalizedService } from "../serviceCopy";
import { servicePageCopy } from "../serviceCopy";
import { LanguageAwareBookingLink } from "./LanguageAwareBookingLink";
import {
  HeroIntro,
  HeroItem,
  LightGroup,
  LightItem,
  LightReveal,
  PageEntry,
} from "./StudioMotion";

type ServiceDetailProps = {
  service: LocalizedService;
  locale: PublicLocale;
};

export function ServiceDetail({ service, locale }: ServiceDetailProps) {
  const copy = servicePageCopy[locale];

  return (
    <PageEntry className="page-shell" id="top">
      <section className="detail-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">{service.eyebrow}</p>
          </HeroItem>

          <HeroItem>
            <h1>
              {locale === "de" && service.id === "keramikversiegelung" ? (
                <>
                  Keramik
                  <br />
                  Versiegelung {copy.locationSuffix}
                </>
              ) : (
                <>{service.title} {copy.locationSuffix}</>
              )}
            </h1>
          </HeroItem>

          <HeroItem>
            <p>
              {service.short} {copy.detailIntro}
            </p>
          </HeroItem>

          <HeroItem>
            <LanguageAwareBookingLink className="primary-button">
              {copy.request}
              <CalendarCheck size={17} />
            </LanguageAwareBookingLink>
          </HeroItem>
        </HeroIntro>

        <LightReveal className="detail-hero-image">
          <Image
            alt={`${service.title} ${copy.locationSuffix} - JC Detailing`}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 48vw"
            src={service.image}
          />
        </LightReveal>
      </section>

      <section className="detail-section">
        <LightReveal className="section-heading compact">
          <span>{copy.service}</span>
          <h2>{copy.included}</h2>
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
          <span>{copy.process}</span>
          <h2>{copy.processTitle}</h2>
        </LightReveal>

        <LightGroup className="process-grid">
          <LightItem>
            <div className="process-card">
              <span>01</span>
              <h3>{copy.processCard}</h3>
              <p>{service.process}</p>
            </div>
          </LightItem>

          <LightItem>
            <div className="process-card">
              <span>02</span>
              <h3>{copy.resultCard}</h3>
              <p>{service.outcome}</p>
            </div>
          </LightItem>
        </LightGroup>
      </section>

      <section className="detail-section">
        <LightReveal className="section-heading compact">
          <span>{copy.location}</span>
          <h2>{copy.locationTitle}</h2>
        </LightReveal>

        <LightReveal className="process-card">
          <p>
            {copy.locationText}
          </p>
        </LightReveal>
      </section>

      <LightReveal className="cta-band">
        <h2>{copy.ready}</h2>

        <p>
          {copy.cta}
        </p>

        <LanguageAwareBookingLink>
          {copy.request}
          <ArrowRight size={16} />
        </LanguageAwareBookingLink>
      </LightReveal>
    </PageEntry>
  );
}
