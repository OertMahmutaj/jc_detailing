// app/leistungen/innenreinigung/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "@/app/data/site";

const service = services.innenreinigung;

export const metadata: Metadata = {
  title: "Innenreinigung in Wauwil, Luzern",
  description:
    "Professionelle Innenreinigung bei JC Detailing in Wauwil, Kanton Luzern. Tiefenreinigung von Sitzen, Teppichen, Leder, Kunststoff und Scheiben.",

  alternates: {
    canonical: service.path,
  },

  openGraph: {
    title: "Innenreinigung in Wauwil, Luzern | JC Detailing",
    description:
      "Professionelle Innenreinigung für Fahrzeuge in Wauwil, Luzern: Sitze, Teppiche, Leder, Kunststoff und Scheiben gründlich gereinigt.",
    url: service.path,
    type: "website",
    locale: "de_CH",
    siteName: "JC Detailing",
    images: [
      {
        url: service.image,
        width: 1200,
        height: 630,
        alt: "Innenreinigung bei JC Detailing in Wauwil",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Innenreinigung in Wauwil, Luzern | JC Detailing",
    description:
      "Professionelle Innenreinigung für Fahrzeuge in Wauwil, Kanton Luzern.",
    images: [service.image],
  },
};

export default function InnenreinigungPage() {
  return <ServiceDetail service={service} />;
}