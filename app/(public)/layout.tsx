// app/(public)/layout.tsx

import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import "@/app/globals.css";
import "./public-redesign.css";
import "./public-pages.css";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { PublicLocaleEffects } from "./components/PublicLocaleEffects";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jcdetailing.ch";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "JC Detailing | Autoaufbereitung in Wauwil, Luzern",
    template: "%s | JC Detailing",
  },

  description:
    "Professionelle Autoaufbereitung in Wauwil, Kanton Luzern. Innenreinigung, Aussenreinigung, Politur, Lackpflege und Keramikversiegelung für Fahrzeuge in der Zentralschweiz.",

  applicationName: "JC Detailing",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "de_CH",
    url: "/",
    siteName: "JC Detailing",
    title: "JC Detailing | Autoaufbereitung in Wauwil, Luzern",
    description:
      "Professionelle Fahrzeugaufbereitung, Innenreinigung, Politur und Keramikversiegelung in Wauwil, Kanton Luzern.",
  },

  twitter: {
    card: "summary_large_image",
    title: "JC Detailing | Autoaufbereitung in Wauwil, Luzern",
    description:
      "Professionelle Fahrzeugaufbereitung, Innenreinigung, Politur und Keramikversiegelung in Wauwil, Kanton Luzern.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="public-site-shell">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <div className="public-site-content">
        {children}
      </div>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <Suspense fallback={null}>
        <PublicLocaleEffects />
      </Suspense>
    </div>
  );
}