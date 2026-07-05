import { NextResponse } from "next/server";
import { prisma } from "../../(admin)/admin/_lib/prisma";

const serviceRenames = [
  { from: "Innenreinigung komplett", to: "Komplett Innenreinigung" },
  { from: "Aussenreinigung komplett", to: "Komplett Aussenreinigung" },
  { from: "Keramikversiegelung", to: "Keramik Versiegelung" },
  { from: "Complete Premium Paket", to: "Komplette Premium Paket" },
  { from: "Komplett Aufbereitung", to: "Komplette Premium Paket" },
  { from: "Politur & Keramik", to: "Keramik Versiegelung" },
];

const serviceCatalog = [
  { name: "Komplett Innenreinigung", basePrice: 209.0, durationMinutes: 330 },
  { name: "Komplett Aussenreinigung", basePrice: 109.0, durationMinutes: 180 },
  { name: "Pflegeerhaltung Innenreinigung", basePrice: 129.0, durationMinutes: 150 },
  { name: "Pflegeerhaltung Aussenreinigung", basePrice: 69.0, durationMinutes: 90 },
  { name: "Polish Paket (1-Step)", basePrice: 399.0, durationMinutes: 240 },
  { name: "Polish Paket (2-Step)", basePrice: 599.0, durationMinutes: 480 },
  { name: "Keramik Versiegelung", basePrice: 1090.0, durationMinutes: 1380 },
  { name: "Komplette Premium Paket", basePrice: 299.0, durationMinutes: 420 },
];

const categoryCatalog = [
  { name: "City Car", priceModifier: 0.0 },
  { name: "Sedan", priceModifier: 20.0 },
  { name: "Sports Car", priceModifier: 20.0 },
  { name: "SUV", priceModifier: 20.0 },
  { name: "Van", priceModifier: 100.0 },
];

const addOnCatalog = [
  { name: "Tierhaarentfernung", price: 50.0, additionalDuration: 45 },
  { name: "Sitze Tiefenreinigung", price: 80.0, additionalDuration: 90 },
  { name: "Fussmatten intensiv", price: 30.0, additionalDuration: 30 },
  { name: "Kofferraum Deep Clean", price: 40.0, additionalDuration: 45 },
];

export async function GET() {
  try {
    const services = [];
    const categories = [];
    const addOns = [];

    for (const rename of serviceRenames) {
      const existingNewName = await prisma.service.findFirst({ where: { name: rename.to } });
      const existingOldName = await prisma.service.findFirst({ where: { name: rename.from } });

      if (existingOldName && !existingNewName) {
        await prisma.service.update({
          where: { id: existingOldName.id },
          data: { name: rename.to },
        });
      } else if (existingOldName && existingNewName) {
        await prisma.booking.updateMany({
          where: { serviceId: existingOldName.id },
          data: { serviceId: existingNewName.id },
        });
        await prisma.service.delete({ where: { id: existingOldName.id } });
      }
    }

    for (const service of serviceCatalog) {
      const existing = await prisma.service.findFirst({ where: { name: service.name } });
      services.push(
        existing
          ? await prisma.service.update({ where: { id: existing.id }, data: service })
          : await prisma.service.create({ data: service })
      );
    }

    for (const category of categoryCatalog) {
      const existing = await prisma.vehicleCategory.findFirst({ where: { name: category.name } });
      categories.push(
        existing
          ? await prisma.vehicleCategory.update({ where: { id: existing.id }, data: category })
          : await prisma.vehicleCategory.create({ data: category })
      );
    }

    for (const addOn of addOnCatalog) {
      const existing = await prisma.addOn.findFirst({ where: { name: addOn.name } });
      addOns.push(
        existing
          ? await prisma.addOn.update({ where: { id: existing.id }, data: addOn })
          : await prisma.addOn.create({ data: addOn })
      );
    }

    const catalogNames = serviceCatalog.map((service) => service.name);
    const staleServices = await prisma.service.findMany({
      where: { name: { notIn: catalogNames } },
    });

    for (const service of staleServices) {
      try {
        await prisma.service.delete({ where: { id: service.id } });
      } catch {
        // Keep stale rows that are still referenced by historical bookings.
      }
    }

    return NextResponse.json({ services, categories, addOns });
  } catch (error) {
    console.error("Failed to fetch booking data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
