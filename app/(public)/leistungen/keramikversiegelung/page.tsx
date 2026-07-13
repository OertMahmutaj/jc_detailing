// app/leistungen/keramikversiegelung/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "@/app/data/site";
import { normalizeLocale } from "../../i18n";
import { getLocalizedService } from "../../serviceCopy";

const service = services.keramikversiegelung;

export const metadata: Metadata = {
  title: "Keramikversiegelung in Wauwil, Luzern",
  description:
    "Professionelle Keramikversiegelung bei JC Detailing in Wauwil, Kanton Luzern. Hochwertiger Lackschutz, hydrophober Effekt und glänzendes Finish für Fahrzeuge.",

  alternates: {
    canonical: service.path,
  },

  openGraph: {
    title: "Keramikversiegelung in Wauwil, Luzern | JC Detailing",
    description:
      "Keramikversiegelung für Fahrzeuge in Wauwil, Luzern: hydrophober Lackschutz, starker Glanz und einfachere Pflege im Alltag.",
    url: service.path,
    type: "website",
    locale: "de_CH",
    siteName: "JC Detailing",
    images: [
      {
        url: service.image,
        width: 1200,
        height: 630,
        alt: "Keramikversiegelung bei JC Detailing in Wauwil",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Keramikversiegelung in Wauwil, Luzern | JC Detailing",
    description:
      "Professionelle Keramikversiegelung und Lackschutz für Fahrzeuge in Wauwil, Kanton Luzern.",
    images: [service.image],
  },
};

export default async function KeramikversiegelungPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams)?.lang);
  return <ServiceDetail locale={locale} service={getLocalizedService(service, locale)} />;
}
