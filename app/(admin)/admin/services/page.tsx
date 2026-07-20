import type { Metadata } from "next";
import { prisma } from "../_lib/prisma";
import { ensureBookingCatalog, serviceOrder } from "@/app/api/booking-data/catalog";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leistungen | Admin",
};

function sortServices<T extends { name: string }>(services: T[]) {
  const positions = new Map<string, number>(
    serviceOrder.map((name, index) => [name, index]),
  );

  return [...services].sort((first, second) => {
    const firstPosition = positions.get(first.name);
    const secondPosition = positions.get(second.name);

    if (firstPosition !== undefined && secondPosition !== undefined) {
      return firstPosition - secondPosition;
    }

    if (firstPosition !== undefined) return -1;
    if (secondPosition !== undefined) return 1;

    return first.name.localeCompare(second.name, "de");
  });
}

export default async function AdminServicesPage() {
  const serviceCount = await prisma.service.count();

  if (serviceCount === 0) {
    await ensureBookingCatalog(prisma, { includeServices: true });
  }

  const services = sortServices(await prisma.service.findMany());
  const sortedServices: Array<{
    id: string;
    basePrice: number;
    bookingUsage: number;
    durationMinutes: number;
    isActive: boolean;
    name: string;
  }> = [];

  for (const service of services) {
    const bookingUsage = await prisma.booking.count({
      where: {
        OR: [
          { serviceId: service.id },
          {
            services: {
              some: { id: service.id },
            },
          },
        ],
      },
    });

    sortedServices.push({
      id: service.id,
      basePrice: service.basePrice,
      bookingUsage,
      durationMinutes: service.durationMinutes,
      isActive: service.isActive,
      name: service.name,
    });
  }

  return (
    <div className="admin-page admin-services-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-kicker">Verwaltung</span>
          <h1>Leistungen</h1>
          <p>Bearbeite Preise, Dauer und verfügbare Leistungen für das Buchungsformular.</p>
        </div>
      </header>

      <ServicesClient services={sortedServices} />
    </div>
  );
}
