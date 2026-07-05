import { NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";

export async function POST(request: Request) {
  try {
    const {
      bookingId,
      invoiceId,
      invoiceNumber,
      items,
      targetEmail,
      totalAmount,
      vatRate,
      language = "de",
    } = await request.json();

    if (!invoiceNumber || !Array.isArray(items)) {
      return NextResponse.json({ error: "Entwurfdaten sind unvollständig." }, { status: 400 });
    }

    if (!bookingId && !invoiceId) {
      return NextResponse.json(
        { error: "Es fehlt entweder eine Buchung oder eine bestehende Rechnung." },
        { status: 400 },
      );
    }

    const invoice = invoiceId
      ? await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            emailOverride: targetEmail,
            invoiceNumber,
            language,
            status: "SENT",
            totalAmount,
            vatRate,
          },
        })
      : await prisma.invoice.upsert({
          where: { bookingId },
          update: {
            emailOverride: targetEmail,
            invoiceNumber,
            language,
            status: "SENT",
            totalAmount,
            vatRate,
          },
          create: {
            bookingId,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            emailOverride: targetEmail,
            invoiceNumber,
            language,
            status: "SENT",
            totalAmount,
            vatRate,
          },
        });

    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: invoice.id },
    });

    await prisma.invoiceItem.createMany({
      data: items.map((item: any) => ({
        description: item.description,
        invoiceId: invoice.id,
        pricePerUnit: Number(item.pricePerUnit) || 0,
        quantity: Number(item.quantity) || 0,
        unit: item.unit || "Stk.",
      })),
    });

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error("Invoice save failed:", error);

    return NextResponse.json(
      { error: error.message || "Entwurf konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }
}