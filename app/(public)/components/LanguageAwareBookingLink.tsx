"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizePublicHref } from "../i18n";
import { usePublicLocale } from "./usePublicLocale";

type LanguageAwareBookingLinkProps = Omit<ComponentProps<typeof Link>, "href">;

export function LanguageAwareBookingLink({
  children,
  ...props
}: LanguageAwareBookingLinkProps) {
  const locale = usePublicLocale();

  return (
    <Link {...props} href={localizePublicHref("/buchen", locale)}>
      {children}
    </Link>
  );
}
