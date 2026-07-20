"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarOff,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  TicketPercent,
  Users,
  Wrench,
  X,
} from "lucide-react";
import AdminThemeToggle from "../_components/AdminThemeToggle.client";

const adminGroups = [
  {
    title: "Allgemein",
    links: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/bookings", label: "Buchungen", icon: CalendarDays },
      { href: "/admin/calendar", label: "Kalender", icon: CalendarOff },
      { href: "/admin/gallery", label: "Galerie", icon: Images },
      { href: "/admin/clients", label: "Kunden", icon: Users },
    ],
  },
  {
    title: "Verwaltung",
    links: [
      { href: "/admin/services", label: "Leistungen", icon: Wrench },
      { href: "/admin/invoices", label: "Rechnungen", icon: FileText },
    ],
  },
  {
    title: "Marketing",
    links: [
      {
        href: "/admin/marketing/promo-codes",
        label: "Promo Codes",
        icon: TicketPercent,
      },
    ],
  },
];

export default function AdminSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <aside
      className={`admin-sidebar ${isOpen ? "is-open" : ""}`}
    >
      <div className="admin-sidebar-header">
        <button
          aria-label="Admin Navigation schliessen"
          className="admin-sidebar-close"
          onClick={() => onClose?.()}
          type="button"
        >
          <X size={18} />
        </button>

        <Link
          className="admin-brand"
          href="/admin/dashboard"
          onClick={() => onClose?.()}
        >
          <div className="admin-brand-logo-wrap">
            <Image
              alt="JC Detailing"
              className="admin-brand-logo"
              height={220}
              priority
              src="/logo.png"
              width={220}
            />
            <span className="admin-brand-indicator" />
          </div>
        </Link>

        
      </div>

      <div className="admin-sidebar-collapsible">
        <div className="admin-sidebar-groups">
          {adminGroups.map((group) => (
            <div className="admin-sidebar-group" key={group.title}>
              <h3 className="admin-sidebar-group-title">{group.title}</h3>

              <nav
                className="admin-nav"
                aria-label={`Admin Navigation - ${group.title}`}
              >
                {group.links.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      pathname?.startsWith(item.href));

                  return (
                    <Link
                      className={isActive ? "active" : ""}
                      href={item.href}
                      key={item.href}
                      onClick={() => onClose?.()}
                    >
                      <Icon size={17} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="admin-sidebar-actions">
          <AdminThemeToggle />
          <Link
            className="admin-public-link"
            href="/"
            onClick={() => onClose?.()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ArrowUpRight size={17} />
            Website oeffnen
          </Link>

          <form action="/api/admin/logout" method="post">
            <button className="admin-logout-button" type="submit">
              <LogOut size={17} />
              Abmelden
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
