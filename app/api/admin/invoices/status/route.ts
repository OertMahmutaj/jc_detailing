import { NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";

const allowedStatuses = new Set(["SENT", "PAID"]);

export async function POST(request: Request) {
  try {
    const { invoiceId, status } = await request.json();

    if (!invoiceId || !allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Ungültige Status-Anfrage." }, { status: 400 });
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAt: status === "PAID" ? new Date() : null,
        status,
      },
    });

    return NextResponse.json({ invoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Status konnte nicht aktualisiert werden." }, { status: 500 });
  }
}
