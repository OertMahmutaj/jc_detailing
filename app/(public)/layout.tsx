// app/layout.tsx

import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "@/app/globals.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ChevronUp } from "lucide-react";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jcdetailing.ch";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "JC Detailing | Autoaufbereitung in Wauwil, Luzern",
    template:
      "%s | JC Detailing",
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
    title:
      "JC Detailing | Autoaufbereitung in Wauwil, Luzern",
    description:
      "Professionelle Fahrzeugaufbereitung, Innenreinigung, Politur und Keramikversiegelung in Wauwil, Kanton Luzern.",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "JC Detailing | Autoaufbereitung in Wauwil, Luzern",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="de" suppressHydrationWarning>
      <body className={GeistMono.variable}>
        <Navbar />
        {children}
        <Footer />
        <a className="back-to-top" href="#top" aria-label="Zum Seitenanfang">
          <ChevronUp size={18} />
        </a>
      </body>
    </html>
  );
}
