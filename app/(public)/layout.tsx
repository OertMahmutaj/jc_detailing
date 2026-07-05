// app/layout.tsx

import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "@/app/globals.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ChevronUp } from "lucide-react";

export const metadata: Metadata = {
  title: "JC Detailing | Fahrzeugaufbereitung in der Zentralschweiz",
  description:
    "Professionelle Autoaufbereitung, Innenreinigung, Aussenreinigung, Politur und Keramikversiegelung in Wauwil, Kanton Luzern.",
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
