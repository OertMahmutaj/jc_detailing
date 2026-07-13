// app/leistungen/aussenreinigung/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "@/app/data/site";
import { normalizeLocale } from "../../i18n";
import { getLocalizedService } from "../../serviceCopy";

const service = services.aussenreinigung;

export const metadata: Metadata = {
  title: "Aussenreinigung in Wauwil, Luzern",
  description:
    "Professionelle Aussenreinigung bei JC Detailing in Wauwil, Kanton Luzern. Schonende Handwäsche, Felgenreinigung, Insektenentfernung und Reifenpflege.",

  alternates: {
    canonical: service.path,
  },

  openGraph: {
    title: "Aussenreinigung in Wauwil, Luzern | JC Detailing",
    description:
      "Schonende Aussenreinigung für Fahrzeuge in Wauwil, Luzern: Handwäsche, Felgenreinigung, Insektenentfernung und gepflegtes Finish.",
    url: service.path,
    type: "website",
    locale: "de_CH",
    siteName: "JC Detailing",
    images: [
      {
        url: service.image,
        width: 1200,
        height: 630,
        alt: "Aussenreinigung bei JC Detailing in Wauwil",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Aussenreinigung in Wauwil, Luzern | JC Detailing",
    description:
      "Professionelle Aussenreinigung für Fahrzeuge in Wauwil, Kanton Luzern.",
    images: [service.image],
  },
};

export default async function AussenreinigungPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams)?.lang);
  return <ServiceDetail locale={locale} service={getLocalizedService(service, locale)} />;
}
