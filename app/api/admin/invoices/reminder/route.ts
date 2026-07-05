import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";

async function getPdfAttachment(pdfUrl?: string | null, invoiceNumber?: string) {
  if (!pdfUrl || !invoiceNumber) return [];

  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) return [];

    const arrayBuffer = await response.arrayBuffer();

    return [
      {
        content: Buffer.from(arrayBuffer),
        contentType: "application/pdf",
        filename: `Rechnung_${invoiceNumber}.pdf`,
      },
    ];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json();
    if (!invoiceId) {
      return NextResponse.json({ error: "Rechnung fehlt." }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Rechnung wurde nicht gefunden." }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Diese Rechnung ist bereits bezahlt." }, { status: 400 });
    }

    if (invoice.dueDate > new Date()) {
      return NextResponse.json({ error: "Diese Rechnung ist noch nicht fällig." }, { status: 400 });
    }

    const targetEmail = invoice.emailOverride || invoice.booking?.client.email;

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Keine Email-Adresse für diese Rechnung gefunden." },
        { status: 400 },
      );
    }

    const recipientName = invoice.recipientName || invoice.booking?.client.name || "Kunde";

    const transporter = nodemailer.createTransport({
      auth: {
        pass: process.env.EMAIL_SERVER_PASSWORD,
        user: process.env.EMAIL_SERVER_USER,
      },
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
    });

    await transporter.sendMail({
      attachments: await getPdfAttachment(invoice.pdfUrl, invoice.invoiceNumber),
      from: '"JC Detailing" <billing@jcdetailer.ch>',
      subject: `Freundliche Erinnerung: Rechnung ${invoice.invoiceNumber}`,
      text: `Guten Tag ${recipientName},\n\nwir möchten Sie freundlich daran erinnern, dass die Rechnung ${invoice.invoiceNumber} noch offen ist.\n\nBetrag: CHF ${invoice.totalAmount.toFixed(2)}\nFällig seit: ${invoice.dueDate.toLocaleDateString("de-CH")}\n\nVielen Dank und freundliche Grüsse\nJC Detailing`,
      to: targetEmail,
    });

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        reminderSentAt: new Date(),
        status: "SENT",
      },
    });

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erinnerung konnte nicht gesendet werden." }, { status: 500 });
  }
}