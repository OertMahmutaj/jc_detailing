import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../_lib/prisma";
import {
  addOnOrder,
  categoryOrder,
  ensureBookingCatalog,
} from "@/app/api/booking-data/catalog";
import ServiceOptionsClient from "./ServiceOptionsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leistungsoptionen | Admin",
};

type PageProps = {
  params: Promise<{ serviceId: string }>;
};

function orderedIndex(name: string, order: readonly string[]) {
  const index = order.indexOf(name);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

async function getService(serviceId: string) {
  return prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      addOnOptions: {
        include: { addOn: true },
      },
      vehicleOptions: {
        include: { vehicleCategory: true },
      },
    },
  });
}

export default async function AdminServiceOptionsPage({ params }: PageProps) {
  const { serviceId } = await params;
  let service = await getService(serviceId);

  if (!service) {
    notFound();
  }

  if (service.vehicleOptions.length === 0) {
    await ensureBookingCatalog(prisma, { includeServices: false });
    service = await getService(serviceId);
  }

  if (!service) {
    notFound();
  }

  const sortedService = {
    ...service,
    addOnOptions: [...service.addOnOptions].sort((first, second) => {
      const firstPosition = orderedIndex(first.addOn.name, addOnOrder);
      const secondPosition = orderedIndex(second.addOn.name, addOnOrder);

      if (firstPosition !== secondPosition) return firstPosition - secondPosition;
      return first.addOn.name.localeCompare(second.addOn.name, "de");
    }),
    vehicleOptions: [...service.vehicleOptions].sort((first, second) => {
      const firstPosition = orderedIndex(first.vehicleCategory.name, categoryOrder);
      const secondPosition = orderedIndex(second.vehicleCategory.name, categoryOrder);

      if (firstPosition !== secondPosition) return firstPosition - secondPosition;
      return first.vehicleCategory.name.localeCompare(second.vehicleCategory.name, "de");
    }),
  };

  return (
    <div className="admin-page admin-service-options-page">
      <header className="admin-page-header">
        <div>
          <Link className="admin-back-link" href="/admin/services">
            Zurueck zu Leistungen
          </Link>
          <span className="admin-page-kicker">Leistungen</span>
          <h1>{service.name}</h1>
          <p>
            Bearbeite Fahrzeugoptionen, Bilder, Aufpreise und Zusatzleistungen fuer
            diese Leistung.
          </p>
        </div>
      </header>

      <ServiceOptionsClient service={sortedService} />
    </div>
  );
}
