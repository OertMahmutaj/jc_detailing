import { NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";

export async function POST(request: Request) {
  try {
    const { bookingId, invoiceNumber, items, targetEmail, totalAmount, vatRate, language = "de" } = await request.json();

    if (!bookingId || !invoiceNumber || !Array.isArray(items)) {
      return NextResponse.json({ error: "Entwurfdaten sind unvollständig." }, { status: 400 });
    }

    const invoice = await prisma.invoice.upsert({
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

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoiceItem.createMany({
      data: items.map((item: any) => ({
        description: item.description,
        invoiceId: invoice.id,
        pricePerUnit: item.pricePerUnit,
        quantity: item.quantity,
        unit: item.unit,
      })),
    });

    return NextResponse.json({ invoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Entwurf konnte nicht gespeichert werden." }, { status: 500 });
  }
}
