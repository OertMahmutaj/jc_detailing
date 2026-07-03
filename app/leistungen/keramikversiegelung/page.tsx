// app/leistungen/keramikversiegelung/page.tsx

import type { Metadata } from "next";
import { ServiceDetail } from "../../components/ServiceDetail";
import { services } from "../../data/site";

export const metadata: Metadata = {
  title: "Keramikversiegelung | JC Detailing",
};

export default function KeramikversiegelungPage() {
  return <ServiceDetail service={services.keramikversiegelung} />;
}
