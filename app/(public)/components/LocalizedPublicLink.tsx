"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizePublicHref } from "../i18n";
import { usePublicLocale } from "./usePublicLocale";

type LocalizedPublicLinkProps = ComponentProps<typeof Link>;

export function LocalizedPublicLink({ href, ...props }: LocalizedPublicLinkProps) {
  const locale = usePublicLocale();
  const localizedHref =
    typeof href === "string" ? localizePublicHref(href, locale) : href;

  return <Link {...props} href={localizedHref} />;
}
