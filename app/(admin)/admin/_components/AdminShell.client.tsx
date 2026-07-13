"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "../navigation/page";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <main className={`admin-shell ${isOpen ? "admin-nav-open" : ""}`}>
      <AdminSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {isOpen && (
        <button
          aria-label="Admin Navigation schliessen"
          className="admin-sidebar-backdrop"
          onClick={() => setIsOpen(false)}
          type="button"
        />
      )}

      <section className="admin-content">
        <div className="admin-topbar">
          {!isOpen && (
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setIsOpen(true)}
              aria-expanded={false}
              aria-label="Admin navigation öffnen"
            >
              <Menu size={18} />
            </button>
          )}
          <div className="admin-topbar-actions"></div>
        </div>
        <div className="admin-page-body">{children}</div>
      </section>
    </main>
  );
}
