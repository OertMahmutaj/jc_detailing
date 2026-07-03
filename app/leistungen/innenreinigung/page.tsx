// app/leistungen/innenreinigung/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "../../data/site";

export const metadata: Metadata = {
  title: "Innenreinigung | JC Detailing",
};

export default function InnenreinigungPage() {
  return <ServiceDetail service={services.innenreinigung} />;
}
