import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/app/lib/adminSession";

async function isAuthorized() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

function normalizeName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 90);
}

function parsePrice(value: unknown) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100) / 100;
}

function parseDuration(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 10080) return null;
  return parsed;
}

function parseActive(value: unknown) {
  return value === undefined ? true : value === true;
}

async function hasDuplicateName(name: string, currentId?: string) {
  const services = await prisma.service.findMany({
    select: { id: true, name: true },
  });
  const normalizedName = name.toLocaleLowerCase("de-CH");

  return services.some(
    (service) =>
      service.id !== currentId &&
      service.name.trim().toLocaleLowerCase("de-CH") === normalizedName,
  );
}

function serviceResponseError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

function revalidateServiceCatalog(serviceId?: string) {
  revalidatePath("/admin/services");
  if (serviceId) {
    revalidatePath(`/admin/services/${serviceId}`);
  }
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/clients");
  revalidatePath("/buchen");
  revalidatePath("/api/booking-data");
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return serviceResponseError("Nicht autorisiert.", 401);
  }

  try {
    const body = await request.json();
    const name = normalizeName(body.name);
    const basePrice = parsePrice(body.basePrice);
    const durationMinutes = parseDuration(body.durationMinutes);
    const isActive = parseActive(body.isActive);

    if (!name || basePrice === null || durationMinutes === null) {
      return serviceResponseError("Bitte Name, Preis und Dauer prüfen.");
    }

    if (await hasDuplicateName(name)) {
      return serviceResponseError("Eine Leistung mit diesem Namen existiert bereits.", 409);
    }

    const categories = await prisma.vehicleCategory.findMany({
      select: { id: true, priceModifier: true },
      where: { isActive: true },
    });

    const vehicleOptions =
      categories.length > 0
        ? {
            create: categories.map((category) => ({
              isActive: true,
              priceModifier: category.priceModifier,
              vehicleCategoryId: category.id,
            })),
          }
        : undefined;

    const service = await prisma.service.create({
      data: {
        basePrice,
        durationMinutes,
        isActive,
        name,
        ...(vehicleOptions ? { vehicleOptions } : {}),
      },
    });

    revalidateServiceCatalog(service.id);

    return Response.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Service creation failed:", error);
    return serviceResponseError("Die Leistung konnte nicht erstellt werden.", 500);
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthorized())) {
    return serviceResponseError("Nicht autorisiert.", 401);
  }

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const name = normalizeName(body.name);
    const basePrice = parsePrice(body.basePrice);
    const durationMinutes = parseDuration(body.durationMinutes);
    const isActive = parseActive(body.isActive);

    if (!id || !name || basePrice === null || durationMinutes === null) {
      return serviceResponseError("Bitte Name, Preis und Dauer prüfen.");
    }

    const [existingService, activeServiceCount] = await Promise.all([
      prisma.service.findUnique({
        where: { id },
        select: { id: true, isActive: true },
      }),
      prisma.service.count({ where: { isActive: true } }),
    ]);

    if (!existingService) {
      return serviceResponseError("Diese Leistung existiert nicht mehr.", 404);
    }

    if (!isActive && existingService.isActive && activeServiceCount <= 1) {
      return serviceResponseError("Mindestens eine sichtbare Leistung muss bestehen bleiben.", 409);
    }

    if (await hasDuplicateName(name, id)) {
      return serviceResponseError("Eine Leistung mit diesem Namen existiert bereits.", 409);
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        basePrice,
        durationMinutes,
        isActive,
        name,
      },
    });

    revalidateServiceCatalog(service.id);

    return Response.json({ service });
  } catch (error) {
    console.error("Service update failed:", error);
    return serviceResponseError("Die Leistung konnte nicht gespeichert werden.", 500);
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorized())) {
    return serviceResponseError("Nicht autorisiert.", 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";

  if (!id) {
    return serviceResponseError("Leistung fehlt.");
  }

  try {
    const [existingService, activeServiceCount, bookingUsage] = await Promise.all([
      prisma.service.findUnique({
        where: { id },
        select: { id: true, isActive: true },
      }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.booking.count({
        where: {
          OR: [
            { serviceId: id },
            {
              services: {
                some: { id },
              },
            },
          ],
        },
      }),
    ]);

    if (!existingService) {
      return serviceResponseError("Diese Leistung existiert nicht mehr.", 404);
    }

    if (existingService.isActive && activeServiceCount <= 1) {
      return serviceResponseError("Mindestens eine Leistung muss bestehen bleiben.", 409);
    }

    if (bookingUsage > 0) {
      const service = await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      revalidateServiceCatalog(service.id);

      return Response.json({ ok: true, service });
    }

    await prisma.service.delete({ where: { id } });
    revalidateServiceCatalog(id);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Service deletion failed:", error);
    return serviceResponseError("Die Leistung konnte nicht gelöscht werden.", 500);
  }
}
