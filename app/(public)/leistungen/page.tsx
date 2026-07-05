// app/leistungen/page.tsx

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroIntro, HeroItem, LightGroup, LightItem, PageEntry } from "../components/StudioMotion";
import { serviceItems } from "../../data/site";

export default function LeistungenPage() {
  return (
    <PageEntry className="page-shell" id="top">
      <section className="sub-hero">
        <HeroIntro>
          <HeroItem>
            <p className="eyebrow">JC Detailing</p>
          </HeroItem>
          <HeroItem>
            <h1>Leistungen</h1>
          </HeroItem>
          <HeroItem>
            <p>Vier klare Kategorien fuer professionelle Fahrzeugaufbereitung.</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <LightGroup className="service-grid page-grid">
        {serviceItems.map((service) => (
          <LightItem key={service.id}>
            <Link className="service-card" href={service.path}>
              <div className="service-image" style={{ backgroundImage: `url(${service.image})` }} />
              <div className="service-body">
                <h2>{service.title}</h2>
                <p>{service.short}</p>
                <span>
                  Mehr erfahren
                  <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          </LightItem>
        ))}
      </LightGroup>
    </PageEntry>
  );
}
