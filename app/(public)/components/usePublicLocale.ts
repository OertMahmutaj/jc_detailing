"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localeFromPathname } from "../i18n";

type BrowserLocation = {
  pathname: string;
  language: string | null;
};

function readBrowserLocation(): BrowserLocation {
  return {
    pathname: window.location.pathname,
    language: new URLSearchParams(window.location.search).get("lang"),
  };
}

export function usePublicLocale() {
  const pathname = usePathname();
  const [browserLocation, setBrowserLocation] = useState<BrowserLocation>({
    pathname,
    language: null,
  });

  useEffect(() => {
    function syncLocale() {
      setBrowserLocation(readBrowserLocation());
    }

    syncLocale();
    window.addEventListener("popstate", syncLocale);

    return () => {
      window.removeEventListener("popstate", syncLocale);
    };
  }, [pathname]);

  const queryLanguage =
    browserLocation.pathname === pathname
      ? browserLocation.language
      : null;

  return localeFromPathname(pathname, queryLanguage);
}
