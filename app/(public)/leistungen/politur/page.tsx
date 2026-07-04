// app/leistungen/politur/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "@/app/data/site";

export const metadata: Metadata = {
  title: "Politur | JC Detailing",
};

export default function PoliturPage() {
  return <ServiceDetail service={services.politur} />;
}
