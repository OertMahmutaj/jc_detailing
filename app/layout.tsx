import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="de"
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}