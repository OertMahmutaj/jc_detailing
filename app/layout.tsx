import type { ReactNode } from "react";
import Script from "next/script";

import "./globals.css";

const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim() || "G-6BCBYWPCZH";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="de-CH"
      suppressHydrationWarning
    >
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
