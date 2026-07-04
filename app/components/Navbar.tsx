"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, motion, px } from "framer-motion";
import { CalendarCheck, ChevronDown } from "lucide-react";

const navItems = [
  { label: "Startseite", href: "/#top" },
  {
    label: "Leistungen",
    href: "/leistungen",
    children: [
      {
        label: "Innenreinigung",
        href: "/leistungen/innenreinigung",
        text: "Tiefenpflege fuer Leder, Stoffe und Innenraumdetails.",
      },
      {
        label: "Aussenreinigung",
        href: "/leistungen/aussenreinigung",
        text: "Schonende Handwaesche, Felgenpflege und Schutzfinish.",
      },
      {
        label: "Politur",
        href: "/leistungen/politur",
        text: "Mehr Tiefe, Schaerfe und Glanz fuer den Lack.",
      },
      {
        label: "Keramikversiegelung",
        href: "/leistungen/keramikversiegelung",
        text: "Langzeit-Schutz mit hydrophobem Premium-Finish.",
      },
    ],
  },
  {
    label: "Angebote",
    href: "/angebote",
    children: [
      {
        label: "Angebote DE",
        href: "/angebote/de",
        text: "Pakete und Preise auf Deutsch ansehen.",
      },
      {
        label: "Offers EN",
        href: "/angebote/en",
        text: "Packages and pricing for English-speaking clients.",
      },
    ],
  },
  { label: "Über uns", href: "/#about" },
  { label: "Galerie", href: "/#work" },
  { label: "Kontakt", href: "/#contact" },
];

const menuEase = [0.22, 1, 0.36, 1] as const;
const bookingUrl = "https://detailr.co/book/jcdetailing-dpx3";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownCycle, setDropdownCycle] = useState(0);

  function closeMenu() {
    setMobileOpen(false);
    setOpenDropdown(null);
  }

  function handleNavClick(href: string, event: MouseEvent<HTMLAnchorElement>) {
    closeMenu();

    if (!href.startsWith("/#") || pathname !== "/") {
      return;
    }

    event.preventDefault();

    const targetId = href.replace("/#", "") || "top";
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
    }
  }

  function openDesktopDropdown(label: string | null) {
    setOpenDropdown((current) => {
      if (label && current !== label) {
        setDropdownCycle((cycle) => cycle + 1);
      }

      return label;
    });
  }

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1180px)");

    function syncMobileNav(event: MediaQueryList | MediaQueryListEvent) {
      setMobileNavActive(event.matches);

      if (!event.matches) {
        closeMenu();
      }
    }

    syncMobileNav(query);
    query.addEventListener("change", syncMobileNav);

    return () => query.removeEventListener("change", syncMobileNav);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", mobileOpen && mobileNavActive);
    return () => document.body.classList.remove("menu-open");
  }, [mobileOpen, mobileNavActive]);

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/#top" onClick={(event) => handleNavClick("/#top", event)}>
          {/* <span className="brand-mark">JC</span> */}
          <p>
            <Image className="nav-logo" width={350} height={150} src="/logo.png" alt="logo" />
            {/* <strong>JC Detailing</strong>
            <small>Luzern</small> */}
          </p>
        </Link>

        <nav className="desktop-nav" aria-label="Hauptnavigation">
          {navItems.map((item) => (
            <div
              className={`nav-item${openDropdown === item.label ? " is-open" : ""}`}
              key={item.label}
              onMouseEnter={() => openDesktopDropdown(item.children ? item.label : null)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                onClick={(event) => handleNavClick(item.href, event)}
                onFocus={() => openDesktopDropdown(item.children ? item.label : null)}
              >
                {item.label}
                {item.children && (
                  <motion.span
                    animate={{ rotate: openDropdown === item.label ? 180 : 0 }}
                    transition={{ duration: 0.24, ease: menuEase }}
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                )}
              </Link>

              <AnimatePresence>
                {item.children && openDropdown === item.label && (
                  <motion.div
                    className="nav-dropdown"
                    key={`${item.label}-${dropdownCycle}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{ transformOrigin: "top left" }}
                    transition={{ duration: 0.24, ease: menuEase }}
                  >
                    {item.children.map((child, index) => (
                      <motion.div
                        className="nav-dropdown-row"
                        key={`${dropdownCycle}-${child.href}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.1,
                          ease: menuEase,
                        }}
                      >
                        <Link href={child.href} onClick={(event) => handleNavClick(child.href, event)}>
                          <span className="dropdown-kicker">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="dropdown-copy">
                            <strong>{child.label}</strong>
                            <small>{child.text}</small>
                          </span>
                          <span className="dropdown-arrow">-&gt;</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="header-actions">
          <a className="ghost-button" href={bookingUrl} target="_blank" rel="noopener noreferrer">
            <CalendarCheck size={15} />
            Termin buchen
          </a>
        </div>

        <motion.button
          className="menu-button"
          type="button"
          onClick={() => {
            setMobileNavActive(true);
            setMobileOpen((open) => !open);
          }}
          aria-label={mobileOpen ? "Menue schliessen" : "Menue oeffnen"}
          aria-expanded={mobileOpen}
          whileTap={{ scale: 0.94 }}
        >
          <motion.span
            className="menu-line"
            animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.28, ease: menuEase }}
          />
          <motion.span
            className="menu-line"
            animate={mobileOpen ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
          <motion.span
            className="menu-line"
            animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.28, ease: menuEase }}
          />
        </motion.button>
      </header>

      <AnimatePresence>
        {mobileNavActive && mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.34, ease: menuEase }}
          >
            <motion.div
              className="mobile-menu-inner"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  transition: { staggerChildren: 0.055, delayChildren: 0.08 },
                },
                closed: {
                  transition: { staggerChildren: 0.035, staggerDirection: -1 },
                },
              }}
            >
              {navItems.map((item) => (
                <motion.div
                  className="mobile-nav-group"
                  key={item.label}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: 14 },
                  }}
                  transition={{ duration: 0.28, ease: menuEase }}
                >
                  <Link href={item.href} onClick={(event) => handleNavClick(item.href, event)}>
                    {item.label}
                  </Link>

                  {item.children?.map((child) => (
                    <Link key={child.href} href={child.href} onClick={(event) => handleNavClick(child.href, event)}>
                      {child.label}
                    </Link>
                  ))}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
