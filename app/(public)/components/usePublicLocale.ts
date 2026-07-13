"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { localeFromPathname } from "../i18n";

export function usePublicLocale() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return localeFromPathname(pathname, searchParams.get("lang"));
}
