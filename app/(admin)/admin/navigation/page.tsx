"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CalendarOff,
  FileText,
  Images,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";

const adminGroups = [
  {
    title: "Allgemein",
    links: [
      { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
      { href: "/admin/bookings", label: "Buchungen", icon: CalendarDays },
      { href: "/admin/calendar", label: "Kalender", icon: CalendarOff },
      { href: "/admin/gallery", label: "Galerie", icon: Images },
      { href: "/admin/clients", label: "Kunden", icon: Users },
    ],
  },
  {
    title: "Verwaltung",
    links: [
      { href: "/admin/invoices", label: "Rechnungen", icon: FileText },
    ],
  },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <aside
      ref={sidebarRef}
      className={`admin-sidebar ${isOpen ? "is-open" : ""}`}
    >
      <div className="admin-sidebar-header">
        <Link
          className="admin-brand"
          href="/admin/dashboard"
          onClick={() => setIsOpen(false)}
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

        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Navigation schliessen" : "Navigation öffnen"}
          className="admin-menu-toggle"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
                      onClick={() => setIsOpen(false)}
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
          <Link
            className="admin-public-link"
            href="/"
            onClick={() => setIsOpen(false)}
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