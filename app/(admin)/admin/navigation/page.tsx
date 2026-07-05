"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, CalendarOff, FileText, LogOut, Users, Menu, X, ArrowUpRight } from "lucide-react";

const adminGroups = [
    {
        title: "Allgemein",
        links: [
            { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
            { href: "/admin/bookings", label: "Buchungen", icon: CalendarDays },
            { href: "/admin/calendar", label: "Kalender", icon: CalendarOff },
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

    return (
        <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
            {/* Branding area & Hamburger Toggle Container */}
            <div className="admin-sidebar-header">
                <Link className="admin-brand" href="/admin/dashboard">
                    <div className="admin-brand-logo-wrap">
                        <Image
                            alt="JC Detailing"
                            className="admin-brand-logo"
                            height={92}
                            priority
                            src="/logo.png"
                            width={220}
                        />
                        <span className="admin-brand-indicator" />
                    </div>
                    <strong>Admin</strong>
                </Link>

                {/* The Hamburger Menu button toggles the state class */}
                <button
                    className="admin-menu-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Navigation"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Grouping content that collapses on small viewports */}
            <div className="admin-sidebar-collapsible">
                <div className="admin-sidebar-groups">
                    {adminGroups.map((group) => (
                        <div className="admin-sidebar-group" key={group.title}>
                            <h3 className="admin-sidebar-group-title">{group.title}</h3>
                            <nav className="admin-nav" aria-label={`Admin Navigation - ${group.title}`}>
                                {group.links.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
                                    return (
                                        <Link
                                            href={item.href}
                                            key={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={isActive ? "active" : ""}
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
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
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
