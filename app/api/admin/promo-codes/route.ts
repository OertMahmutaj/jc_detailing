import { cookies } from "next/headers";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/app/lib/adminSession";

async function isAuthorized() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

function normalizeCode(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, "").toUpperCase().slice(0, 40);
}

function positiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const code = normalizeCode(body.code);
    const discountPercent = Number(body.discountPercent);
    const maxUses = positiveInteger(body.maxUses);
    const maxUsesPerClient = positiveInteger(body.maxUsesPerClient);
    const expiresAt =
      typeof body.expiresAt === "string"
        ? new Date(`${body.expiresAt}T23:59:59.999Z`)
        : null;

    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      return Response.json(
        { message: "Der Code muss 3 bis 40 Zeichen lang sein und darf nur Buchstaben, Zahlen, - und _ enthalten." },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent <= 0 ||
      discountPercent > 100 ||
      !maxUses ||
      !maxUsesPerClient ||
      maxUsesPerClient > maxUses ||
      !expiresAt ||
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt <= new Date()
    ) {
      return Response.json(
        { message: "Bitte prüfe Rabatt, Nutzungslimits und Ablaufdatum." },
        { status: 400 },
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        discountPercent,
        expiresAt,
        maxUses,
        maxUsesPerClient,
      },
    });

    return Response.json({ promoCode }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return Response.json(
        { message: "Dieser Promo-Code existiert bereits." },
        { status: 409 },
      );
    }

    console.error("Promo code creation failed:", error);
    return Response.json(
      { message: "Der Promo-Code konnte nicht erstellt werden." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";

  if (!id || typeof body.isActive !== "boolean") {
    return Response.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  await prisma.promoCode.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";

  if (!id) {
    return Response.json({ message: "Promo-Code fehlt." }, { status: 400 });
  }

  const usageCount = await prisma.promoCodeUsage.count({
    where: { promoCodeId: id },
  });

  if (usageCount > 0) {
    return Response.json(
      { message: "Ein bereits verwendeter Promo-Code kann nur deaktiviert, nicht gelöscht werden." },
      { status: 409 },
    );
  }

  await prisma.promoCode.delete({ where: { id } });
  return Response.json({ ok: true });
}
