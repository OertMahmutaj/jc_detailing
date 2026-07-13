"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, ChevronDown, Languages } from "lucide-react";
import {
  localeHome,
  localeNames,
  localizePublicHref,
  publicLocales,
  sharedCopy,
} from "../i18n";
import { usePublicLocale } from "./usePublicLocale";

const menuEase = [0.22, 1, 0.36, 1] as const;

export function Navbar() {
  const pathname = usePathname();
  const activeLocale = usePublicLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [dropdownCycle, setDropdownCycle] = useState(0);
  const lockedScrollY = useRef(0);
  const copy = sharedCopy[activeLocale];
  const homePath = localeHome(activeLocale);
  const bookingUrl = localizePublicHref("/buchen", activeLocale);
  const languageOptions = publicLocales.map((code) => ({
    code,
    label: code.toUpperCase(),
    name: localeNames[code],
    href: localeHome(code),
  }));
  const navItems = [
    { label: copy.nav.home, href: `${homePath}#top` },
    {
      label: copy.nav.services,
      href: localizePublicHref("/leistungen", activeLocale),
      children: [
        ["innenreinigung", "/leistungen/innenreinigung"],
        ["aussenreinigung", "/leistungen/aussenreinigung"],
        ["politur", "/leistungen/politur"],
        ["keramikversiegelung", "/leistungen/keramikversiegelung"],
      ].map(([id, href]) => ({
        label: copy.serviceNav[id as keyof typeof copy.serviceNav][0],
        href: localizePublicHref(href, activeLocale),
        text: copy.serviceNav[id as keyof typeof copy.serviceNav][1],
      })),
    },
    { label: copy.nav.offers, href: localizePublicHref("/angebote", activeLocale) },
    { label: copy.nav.gallery, href: localizePublicHref("/gallery", activeLocale) },
    { label: copy.nav.about, href: `${homePath}#about` },
    { label: copy.nav.faq, href: `${homePath}#faq` },
    { label: copy.nav.contact, href: `${homePath}#contact` },
  ];

  function closeMenu() {
    setMobileOpen(false);
    setOpenDropdown(null);
    setLanguageOpen(false);
  }

  function handleNavClick(href: string, event: MouseEvent<HTMLAnchorElement>) {
    closeMenu();

    const [targetPath, targetId] = href.split("#");

    if (!targetId || pathname !== targetPath) {
      return;
    }

    event.preventDefault();

    const target = document.getElementById(targetId || "top");

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
    const menuIsOpen = mobileOpen && mobileNavActive;
    const scrollY = menuIsOpen ? lockedScrollY.current : window.scrollY;
    const root = document.documentElement;

    function preventBackgroundScroll(event: TouchEvent | WheelEvent) {
      const target = event.target;

      if (target instanceof Element && target.closest(".mobile-menu")) {
        return;
      }

      event.preventDefault();
    }

    document.body.classList.toggle("menu-open", menuIsOpen);
    root.classList.toggle("menu-open", menuIsOpen);
    window.dispatchEvent(new CustomEvent("jc-mobile-menu-change", { detail: { open: menuIsOpen } }));

    if (menuIsOpen) {
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
      document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    }

    return () => {
      document.body.classList.remove("menu-open");
      root.classList.remove("menu-open");
      document.removeEventListener("touchmove", preventBackgroundScroll);
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (menuIsOpen) {
        const previousBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, scrollY);
        document.documentElement.style.scrollBehavior = previousBehavior;
      }
    };
  }, [mobileOpen, mobileNavActive]);

  return (
    <>
      <header className="site-header">
        <Link
          className="brand"
          href={`${homePath}#top`}
          onClick={(event) => handleNavClick(`${homePath}#top`, event)}
        >
          {/* <span className="brand-mark">JC</span> */}
          <p>
            <Image
              className="nav-logo"
              priority
              width={186}
              height={124}
              sizes="186px"
              src="/logo.png"
              alt="JC Detailing Autoaufbereitung Wauwil"
            />
            {/* <strong>JC Detailing</strong>
            <small>Luzern</small> */}
          </p>
        </Link>

        <nav className="desktop-nav" aria-label={copy.nav.mainNavigation}>
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
          <Link className="ghost-button" href={bookingUrl} onClick={closeMenu}>
            <CalendarCheck size={15} />
            {copy.nav.booking}
          </Link>

          <div className="language-selector">
            <motion.button
              className="language-button"
              type="button"
              onClick={() => setLanguageOpen((open) => !open)}
              aria-label={copy.nav.chooseLanguage}
              aria-expanded={languageOpen}
              whileTap={{ scale: 0.96 }}
            >
              <Languages size={15} />
              {activeLocale.toUpperCase()}
              <motion.span
                animate={{ rotate: languageOpen ? 180 : 0 }}
                transition={{ duration: 0.22, ease: menuEase }}
              >
                <ChevronDown size={13} />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {languageOpen && (
                <motion.div
                  className="language-menu"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: menuEase }}
                >
                  {languageOptions.map((language) => (
                    <Link
                      className={language.code === activeLocale ? "is-active" : ""}
                      href={language.href}
                      key={language.label}
                      onClick={closeMenu}
                    >
                      <span>{language.label}</span>
                      <small>{language.name}</small>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          className="menu-button"
          type="button"
          onPointerDown={(event) => {
            if (!mobileOpen) {
              lockedScrollY.current = window.scrollY;
              event.preventDefault();
            }
          }}
          onClick={() => {
            if (!mobileOpen && lockedScrollY.current === 0) {
              lockedScrollY.current = window.scrollY;
            }
            setMobileNavActive(true);
            setMobileOpen((open) => !open);
          }}
          aria-label={mobileOpen ? copy.nav.closeMenu : copy.nav.openMenu}
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
                  <Link
                    href={item.href}
                    onClick={(event) => handleNavClick(item.href, event)}
                  >
                    {item.label}
                  </Link>

                  {item.children?.map((child) => (
                    <Link key={child.href} href={child.href} onClick={(event) => handleNavClick(child.href, event)}>
                      {child.label}
                    </Link>
                  ))}
                </motion.div>
              ))}

              <motion.div
                className="mobile-nav-group"
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 14 },
                }}
                transition={{ duration: 0.28, ease: menuEase }}
              >
                <Link href={bookingUrl} onClick={closeMenu}>
                  {copy.nav.booking}
                </Link>
              </motion.div>

              <motion.div
                className="mobile-nav-group mobile-language-group"
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 14 },
                }}
                transition={{ duration: 0.28, ease: menuEase }}
              >
                <span>{copy.nav.language}</span>
                <div>
                  {languageOptions.map((language) => (
                    <Link
                      className={language.code === activeLocale ? "is-active" : ""}
                      href={language.href}
                      key={language.label}
                      onClick={closeMenu}
                    >
                      {language.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
