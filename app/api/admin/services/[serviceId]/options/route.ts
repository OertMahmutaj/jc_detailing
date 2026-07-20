import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/app/lib/adminSession";

type RouteContext = {
  params: Promise<{ serviceId: string }>;
};

async function isAuthorized() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

function normalizeName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 90);
}

function normalizeImageUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 240) : null;
}

function parsePrice(value: unknown) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100) / 100;
}

function parseDuration(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10080) return null;
  return parsed;
}

function parseActive(value: unknown) {
  return value === undefined ? true : value === true;
}

function optionResponseError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

function revalidateServiceOptions(serviceId: string) {
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${serviceId}`);
  revalidatePath("/buchen");
  revalidatePath("/api/booking-data");
}

async function assertServiceExists(serviceId: string) {
  return prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true },
  });
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAuthorized())) {
    return optionResponseError("Nicht autorisiert.", 401);
  }

  const { serviceId } = await context.params;

  try {
    const body = await request.json();
    const type = body.type === "addOn" ? "addOn" : "vehicle";

    if (!(await assertServiceExists(serviceId))) {
      return optionResponseError("Diese Leistung existiert nicht mehr.", 404);
    }

    if (type === "vehicle") {
      const name = normalizeName(body.name);
      const priceModifier = parsePrice(body.priceModifier);
      const imageUrl = normalizeImageUrl(body.imageUrl);

      if (!name || priceModifier === null) {
        return optionResponseError("Bitte Fahrzeugname und Preis prüfen.");
      }

      const existingCategory = await prisma.vehicleCategory.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      const vehicleCategory = existingCategory
        ? await prisma.vehicleCategory.update({
            where: { id: existingCategory.id },
            data: { imageUrl, isActive: true },
          })
        : await prisma.vehicleCategory.create({
            data: { imageUrl, isActive: true, name, priceModifier },
          });

      const option = await prisma.serviceVehicleCategory.upsert({
        where: {
          serviceId_vehicleCategoryId: {
            serviceId,
            vehicleCategoryId: vehicleCategory.id,
          },
        },
        create: {
          isActive: true,
          priceModifier,
          serviceId,
          vehicleCategoryId: vehicleCategory.id,
        },
        update: {
          isActive: true,
          priceModifier,
        },
        include: { vehicleCategory: true },
      });

      revalidateServiceOptions(serviceId);

      return Response.json({ option }, { status: 201 });
    }

    const name = normalizeName(body.name);
    const price = parsePrice(body.price);
    const additionalDuration = parseDuration(body.additionalDuration);

    if (!name || price === null || additionalDuration === null) {
      return optionResponseError("Bitte Zusatzleistung, Preis und Dauer prüfen.");
    }

    const existingAddOn = await prisma.addOn.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    const addOn = existingAddOn
      ? await prisma.addOn.update({
          where: { id: existingAddOn.id },
          data: { isActive: true },
        })
      : await prisma.addOn.create({
          data: { additionalDuration, isActive: true, name, price },
        });

    const option = await prisma.serviceAddOn.upsert({
      where: {
        serviceId_addOnId: {
          addOnId: addOn.id,
          serviceId,
        },
      },
      create: {
        addOnId: addOn.id,
        additionalDuration,
        isActive: true,
        price,
        serviceId,
      },
      update: {
        additionalDuration,
        isActive: true,
        price,
      },
      include: { addOn: true },
    });

    revalidateServiceOptions(serviceId);

    return Response.json({ option }, { status: 201 });
  } catch (error) {
    console.error("Service option creation failed:", error);
    return optionResponseError("Die Option konnte nicht erstellt werden.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAuthorized())) {
    return optionResponseError("Nicht autorisiert.", 401);
  }

  const { serviceId } = await context.params;

  try {
    const body = await request.json();
    const optionId = typeof body.optionId === "string" ? body.optionId : "";
    const type = body.type === "addOn" ? "addOn" : "vehicle";
    const isActive = parseActive(body.isActive);

    if (!optionId) {
      return optionResponseError("Option fehlt.");
    }

    if (type === "vehicle") {
      const name = normalizeName(body.name);
      const priceModifier = parsePrice(body.priceModifier);
      const imageUrl = normalizeImageUrl(body.imageUrl);

      if (!name || priceModifier === null) {
        return optionResponseError("Bitte Fahrzeugname und Preis prüfen.");
      }

      const option = await prisma.serviceVehicleCategory.findFirst({
        where: { id: optionId, serviceId },
        include: { vehicleCategory: true },
      });

      if (!option) {
        return optionResponseError("Diese Fahrzeugoption existiert nicht mehr.", 404);
      }

      const activeVehicleCount = await prisma.serviceVehicleCategory.count({
        where: { isActive: true, serviceId },
      });

      if (!isActive && option.isActive && activeVehicleCount <= 1) {
        return optionResponseError("Mindestens eine aktive Fahrzeugoption muss bestehen bleiben.", 409);
      }

      const [updatedOption] = await prisma.$transaction([
        prisma.serviceVehicleCategory.update({
          where: { id: option.id },
          data: { isActive, priceModifier },
          include: { vehicleCategory: true },
        }),
        prisma.vehicleCategory.update({
          where: { id: option.vehicleCategoryId },
          data: { imageUrl, isActive: true, name },
        }),
      ]);

      revalidateServiceOptions(serviceId);

      return Response.json({ option: updatedOption });
    }

    const name = normalizeName(body.name);
    const price = parsePrice(body.price);
    const additionalDuration = parseDuration(body.additionalDuration);

    if (!name || price === null || additionalDuration === null) {
      return optionResponseError("Bitte Zusatzleistung, Preis und Dauer prüfen.");
    }

    const option = await prisma.serviceAddOn.findFirst({
      where: { id: optionId, serviceId },
      include: { addOn: true },
    });

    if (!option) {
      return optionResponseError("Diese Zusatzleistung existiert nicht mehr.", 404);
    }

    const [updatedOption] = await prisma.$transaction([
      prisma.serviceAddOn.update({
        where: { id: option.id },
        data: { additionalDuration, isActive, price },
        include: { addOn: true },
      }),
      prisma.addOn.update({
        where: { id: option.addOnId },
        data: { additionalDuration, isActive: true, name, price },
      }),
    ]);

    revalidateServiceOptions(serviceId);

    return Response.json({ option: updatedOption });
  } catch (error) {
    console.error("Service option update failed:", error);
    return optionResponseError("Die Option konnte nicht gespeichert werden.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthorized())) {
    return optionResponseError("Nicht autorisiert.", 401);
  }

  const { serviceId } = await context.params;
  const url = new URL(request.url);
  const optionId = url.searchParams.get("optionId") ?? "";
  const type = url.searchParams.get("type") === "addOn" ? "addOn" : "vehicle";

  if (!optionId) {
    return optionResponseError("Option fehlt.");
  }

  try {
    if (type === "vehicle") {
      const option = await prisma.serviceVehicleCategory.findFirst({
        where: { id: optionId, serviceId },
        select: { id: true, isActive: true },
      });

      if (!option) {
        return optionResponseError("Diese Fahrzeugoption existiert nicht mehr.", 404);
      }

      const activeVehicleCount = await prisma.serviceVehicleCategory.count({
        where: { isActive: true, serviceId },
      });

      if (option.isActive && activeVehicleCount <= 1) {
        return optionResponseError("Mindestens eine aktive Fahrzeugoption muss bestehen bleiben.", 409);
      }

      await prisma.serviceVehicleCategory.delete({ where: { id: option.id } });
      revalidateServiceOptions(serviceId);

      return Response.json({ ok: true });
    }

    const option = await prisma.serviceAddOn.findFirst({
      where: { id: optionId, serviceId },
      select: { id: true },
    });

    if (!option) {
      return optionResponseError("Diese Zusatzleistung existiert nicht mehr.", 404);
    }

    await prisma.serviceAddOn.delete({ where: { id: option.id } });
    revalidateServiceOptions(serviceId);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Service option deletion failed:", error);
    return optionResponseError("Die Option konnte nicht entfernt werden.", 500);
  }
}
