// app/layout.tsx
import "./globals.css";
import { GeistMono } from "geist/font/mono";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-scroll-behavior="smooth" lang="de" suppressHydrationWarning>
      <body className={GeistMono.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}