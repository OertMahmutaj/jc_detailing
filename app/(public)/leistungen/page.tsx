// app/leistungen/page.tsx

import Link from "next/link";
import Image from "next/image";
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
            <p>Vier klare Kategorien für professionelle Fahrzeugaufbereitung.</p>
          </HeroItem>
        </HeroIntro>
      </section>

      <LightGroup className="service-grid page-grid">
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
