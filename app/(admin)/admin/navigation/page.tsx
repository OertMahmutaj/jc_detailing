"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BarChart3, CalendarDays, FileText, LogOut, Users, Menu, X } from "lucide-react";

const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/bookings", label: "Buchungen", icon: CalendarDays },
    { href: "/admin/clients", label: "Kunden", icon: Users },
    { href: "/admin/invoices", label: "Rechnungen", icon: FileText },
];

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
            {/* Branding area & Hamburger Toggle Container */}
            <div className="admin-sidebar-header">
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
                <nav className="admin-nav" aria-label="Admin Navigation">
                    {adminLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
                                <Icon size={17} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-actions">
                    <Link
                        className="admin-public-link"
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                    >
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