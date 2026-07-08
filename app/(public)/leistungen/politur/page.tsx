// app/leistungen/politur/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "@/app/data/site";

const service = services.politur;

export const metadata: Metadata = {
  title: "Politur in Wauwil, Luzern",
  description:
    "Professionelle Politur und Lackaufbereitung bei JC Detailing in Wauwil, Kanton Luzern. Mehr Glanz, Tiefe und weniger Swirls für gepflegte Fahrzeuge.",

  alternates: {
    canonical: service.path,
  },

  openGraph: {
    title: "Politur in Wauwil, Luzern | JC Detailing",
    description:
      "Lackaufbereitung und Politur für Fahrzeuge in Wauwil, Luzern: mehr Glanz, bessere Tiefe und reduzierte Waschspuren.",
    url: service.path,
    type: "website",
    locale: "de_CH",
    siteName: "JC Detailing",
    images: [
      {
        url: service.image,
        width: 1200,
        height: 630,
        alt: "Politur und Lackaufbereitung bei JC Detailing in Wauwil",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Politur in Wauwil, Luzern | JC Detailing",
    description:
      "Professionelle Politur und Lackaufbereitung für Fahrzeuge in Wauwil, Kanton Luzern.",
    images: [service.image],
  },
};

export default function PoliturPage() {
  return <ServiceDetail service={service} />;
}