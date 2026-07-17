// app/leistungen/aussenreinigung/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "@/app/data/site";
import { normalizeLocale } from "../../i18n";
import { getLocalizedService } from "../../serviceCopy";
import { buildServiceMetadata } from "../../seo";

const service = services.aussenreinigung;

type ServicePageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ServicePageProps): Promise<Metadata> {
  const locale = normalizeLocale((await searchParams)?.lang);
  return buildServiceMetadata(locale, getLocalizedService(service, locale));
}

export default async function AussenreinigungPage({ searchParams }: ServicePageProps) {
  const locale = normalizeLocale((await searchParams)?.lang);
  return <ServiceDetail locale={locale} service={getLocalizedService(service, locale)} />;
}
