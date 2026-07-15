import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/app/lib/adminSession";

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

type InvoiceItemInput = {
  description: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    if (
      !verifyAdminSession(
        cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
      )
    ) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const bookingId = cleanText(body.bookingId, 80) || null;
    const invoiceId = cleanText(body.invoiceId, 80) || null;
    const invoiceNumber = cleanText(body.invoiceNumber, 80);
    const targetEmail = cleanText(body.targetEmail, 160).toLowerCase();
    const recipientName = cleanText(body.recipientName, 160);
    const clientAddress = cleanText(body.clientAddress, 400);
    const businessAddress = cleanText(body.businessAddress, 400);
    const language =
      body.language === "en" || body.language === "fr" || body.language === "it"
        ? body.language
        : "de";
    const vatRate = Number(body.vatRate ?? 0);
    const serviceDate = new Date(`${cleanText(body.serviceDate, 20)}T12:00:00.000Z`);
    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
    const items: InvoiceItemInput[] = rawItems.map((item) => {
      const value =
        typeof item === "object" && item !== null
          ? (item as Record<string, unknown>)
          : {};

      return {
        description: cleanText(value.description, 300),
        pricePerUnit: roundCurrency(Number(value.pricePerUnit)),
        quantity: Number(value.quantity),
        unit: cleanText(value.unit, 30) || "Stk.",
      };
    });

    const invalidItem = items.some(
      (item) =>
        !item.description ||
        !Number.isFinite(item.pricePerUnit) ||
        item.pricePerUnit < 0 ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0,
    );

    if (
      (!bookingId && !invoiceId) ||
      !invoiceNumber ||
      !targetEmail ||
      !recipientName ||
      !clientAddress ||
      !businessAddress ||
      !items.length ||
      invalidItem ||
      !Number.isFinite(vatRate) ||
      vatRate < 0 ||
      vatRate > 100 ||
      Number.isNaN(serviceDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Entwurfdaten sind unvollstﾃ､ndig." },
        { status: 400 },
      );
    }

    const [booking, existingInvoice] = await Promise.all([
      bookingId
        ? prisma.booking.findUnique({
            where: { id: bookingId },
            include: { promoCode: true },
          })
        : Promise.resolve(null),
      invoiceId
        ? prisma.invoice.findUnique({ where: { id: invoiceId } })
        : bookingId
          ? prisma.invoice.findUnique({ where: { bookingId } })
          : Promise.resolve(null),
    ]);

    if ((bookingId && !booking) || (invoiceId && !existingInvoice)) {
      return NextResponse.json(
        { error: "Buchung oder Rechnung wurde nicht gefunden." },
        { status: 404 },
      );
    }

    const promoCode = booking?.promoCode?.code || existingInvoice?.promoCode || null;
    const promoDiscountPercent =
      booking?.promoDiscountPercent ??
      existingInvoice?.promoDiscountPercent ??
      0;
    const subtotal = roundCurrency(
      items.reduce(
        (sum, item) => sum + item.quantity * item.pricePerUnit,
        0,
      ),
    );
    const promoDiscountAmount = promoCode
      ? roundCurrency(subtotal * (promoDiscountPercent / 100))
      : 0;
    const netAmount = roundCurrency(
      Math.max(0, subtotal - promoDiscountAmount),
    );
    const totalAmount = roundCurrency(
      netAmount + netAmount * (vatRate / 100),
    );
    const invoiceData = {
      businessAddress,
      clientAddress,
      emailOverride: targetEmail,
      invoiceNumber,
      language,
      promoCode,
      promoDiscountAmount,
      promoDiscountPercent: promoCode ? promoDiscountPercent : null,
      recipientName,
      serviceDate,
      status: "SENT" as const,
      totalAmount,
      vatRate,
    };

    const invoice = existingInvoice
      ? await prisma.invoice.update({
          where: { id: existingInvoice.id },
          data: invoiceData,
        })
      : await prisma.invoice.create({
          data: {
            ...invoiceData,
            bookingId,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoiceItem.createMany({
      data: items.map((item) => ({
        ...item,
        invoiceId: invoice.id,
      })),
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Invoice save failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Entwurf konnte nicht gespeichert werden.",
      },
      { status: 500 },
    );
  }
}
