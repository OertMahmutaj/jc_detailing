import { headers } from "next/headers";
import AdminShell from "./_components/AdminShell.client";
import { AdminNotificationProvider } from "./_components/AdminNotificationProvider";
import AdminThemeInitializer from "./_components/AdminTheme.client";
import "./admin.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-image-preview": "none",
      "max-snippet": 0,
      "max-video-preview": 0,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const isLoginPage = headersList.get("x-admin-login-page") === "1";

  if (isLoginPage) {
    return children;
  }

  return (
    <AdminNotificationProvider>
      <AdminThemeInitializer />
      <AdminShell>{children}</AdminShell>
    </AdminNotificationProvider>
  );
}
