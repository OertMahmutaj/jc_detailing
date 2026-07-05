import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { BarChart3, CalendarDays, FileText, LogOut, Users } from "lucide-react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/bookings", label: "Buchungen", icon: CalendarDays },
  { href: "/admin/clients", label: "Kunden", icon: Users },
  { href: "/admin/invoices", label: "Rechnungen", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isLoginPage = headers().get("x-admin-login-page") === "1";

  if (isLoginPage) {
    return children;
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin/dashboard">
          <Image
            alt="JC Detailing"
            className="admin-brand-logo"
            height={92}
            priority
            src="/logo.png"
            width={220}
          />
          <strong>Admin</strong>
        </Link>

        <nav className="admin-nav" aria-label="Admin Navigation">
          {adminLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link href={item.href} key={item.href}>
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-actions">
          <Link className="admin-public-link" href="/">
            Website oeffnen
          </Link>

          <form action="/api/admin/logout" method="post">
            <button className="admin-logout-button" type="submit">
              <LogOut size={17} />
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      <section className="admin-content">{children}</section>
    </main>
  );
}
