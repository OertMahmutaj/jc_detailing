// app/leistungen/page.tsx

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HeroIntro, HeroItem, LightGroup, LightItem, PageEntry } from "../components/StudioMotion";
import { serviceItems } from "../../data/site";
import { LocalizedPublicLink } from "../components/LocalizedPublicLink";
import { normalizeLocale } from "../i18n";
import { getLocalizedServices, servicePageCopy } from "../serviceCopy";

export default async function LeistungenPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const copy = servicePageCopy[locale];
  const localizedServices = getLocalizedServices(serviceItems, locale);

  return (
    <PageEntry className="page-shell" id="top">
      <section className="sub-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">JC Detailing</p>
          </HeroItem>
          <HeroItem>
            <h1>{copy.pageTitle}</h1>
          </HeroItem>
          <HeroItem>
            <p>{copy.pageIntro}</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <LightGroup className="service-grid page-grid" id="services-grid">
        {localizedServices.map((service) => (
          <LightItem key={service.id}>
            <LocalizedPublicLink className="service-card" href={service.path}>
              <div className="service-image">
                <Image
                  alt={`${service.title} ${copy.locationSuffix} - JC Detailing`}
                  fill
                  quality={60}
                  sizes="(max-width: 720px) 100vw, 25vw"
                  src={service.image}
                />
              </div>
              <div className="service-body">
                <h2>{service.title}</h2>
                <p>{service.short}</p>
                <span>
                  {copy.more}
                  <ArrowRight size={15} />
                </span>
              </div>
            </LocalizedPublicLink>
          </LightItem>
        ))}
      </LightGroup>
    </PageEntry>
  );
}
