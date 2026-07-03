// app/leistungen/aussenreinigung/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "../../data/site";

export const metadata: Metadata = {
  title: "Aussenreinigung | JC Detailing",
};

export default function AussenreinigungPage() {
  return <ServiceDetail service={services.aussenreinigung} />;
}
