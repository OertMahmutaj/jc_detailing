import { NextResponse } from "next/server";
import { prisma } from "../../(admin)/admin/_lib/prisma";

const serviceOrder = [
  "Komplett Innenreinigung",
  "Komplett Aussenreinigung",
  "Pflegeerhaltung Innenreinigung",
  "Pflegeerhaltung Aussenreinigung",
  "Polish Paket (1-Step)",
  "Polish Paket (2-Step)",
  "Keramik Versiegelung",
  "Komplette Premium Paket",
];

const categoryOrder = [
  "City Car",
  "Sedan",
  "Sports Car",
  "SUV",
  "Van",
];

const addOnOrder = [
  "Tierhaarentfernung",
  "Sitze Tiefenreinigung",
  "Fussmatten intensiv",
  "Kofferraum Deep Clean",
];

function sortByCatalogOrder<T extends { name: string }>(
  items: T[],
  order: string[],
): T[] {
  const positions = new Map(
    order.map((name, index) => [name, index]),
  );

  return [...items].sort(
    (first, second) =>
      (positions.get(first.name) ?? Number.MAX_SAFE_INTEGER) -
      (positions.get(second.name) ?? Number.MAX_SAFE_INTEGER),
  );
}

export async function GET() {
  const startedAt = performance.now();

  try {
    const [services, categories, addOns] = await Promise.all([
      prisma.service.findMany({
        where: {
          name: {
            in: serviceOrder,
          },
        },
        select: {
          id: true,
          name: true,
          basePrice: true,
          durationMinutes: true,
        },
      }),

      prisma.vehicleCategory.findMany({
        where: {
          name: {
            in: categoryOrder,
          },
        },
        select: {
          id: true,
          name: true,
          priceModifier: true,
        },
      }),

      prisma.addOn.findMany({
        where: {
          name: {
            in: addOnOrder,
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
          additionalDuration: true,
        },
      }),
    ]);

    const responseData = {
      services: sortByCatalogOrder(services, serviceOrder),
      categories: sortByCatalogOrder(categories, categoryOrder),
      addOns: sortByCatalogOrder(addOns, addOnOrder),
    };

    console.log(
      `[booking-data] loaded in ${Math.round(
        performance.now() - startedAt,
      )}ms`,
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch booking data:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}