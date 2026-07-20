import { NextResponse } from "next/server";
import { prisma } from "../../(admin)/admin/_lib/prisma";
import {
  addOnOrder,
  categoryOrder,
  ensureBookingCatalog,
  serviceOrder,
} from "./catalog";

function sortByCatalogOrder<T extends { name: string }>(
  items: T[],
  order: string[],
): T[] {
  const positions = new Map(
    order.map((name, index) => [name, index]),
  );

  return [...items].sort((first, second) => {
    const firstPosition = positions.get(first.name);
    const secondPosition = positions.get(second.name);

    if (firstPosition !== undefined && secondPosition !== undefined) {
      return firstPosition - secondPosition;
    }

    if (firstPosition !== undefined) {
      return -1;
    }

    if (secondPosition !== undefined) {
      return 1;
    }

    return first.name.localeCompare(second.name, "de");
  });
}

function uniqueByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.name)) {
      return false;
    }

    seen.add(item.name);
    return true;
  });
}

async function loadBookingCatalogData() {
  const [services, categories, addOns] = await Promise.all([
    prisma.service.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        basePrice: true,
        durationMinutes: true,
        isActive: true,
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

  return {
    services: uniqueByName(services),
    categories: uniqueByName(categories),
    addOns: uniqueByName(addOns),
  };
}

function isCatalogComplete(
  catalog: Awaited<ReturnType<typeof loadBookingCatalogData>>,
) {
  return (
    catalog.services.length > 0 &&
    catalog.categories.length >= categoryOrder.length &&
    catalog.addOns.length >= addOnOrder.length
  );
}

export async function GET() {
  const startedAt = performance.now();

  try {
    let catalog = await loadBookingCatalogData();

    if (!isCatalogComplete(catalog)) {
      await ensureBookingCatalog(prisma, {
        includeServices: catalog.services.length === 0,
      });
      catalog = await loadBookingCatalogData();
    }

    const responseData = {
      services: sortByCatalogOrder(catalog.services, serviceOrder),
      categories: sortByCatalogOrder(catalog.categories, categoryOrder),
      addOns: sortByCatalogOrder(catalog.addOns, addOnOrder),
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
