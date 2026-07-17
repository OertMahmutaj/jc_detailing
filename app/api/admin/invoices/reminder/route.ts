import { NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/app/lib/adminSession";
import { sendResendEmail } from "@/app/lib/resendEmail";

async function getPdfAttachment(pdfUrl?: string | null, invoiceNumber?: string) {
  if (!pdfUrl || !invoiceNumber) return [];

  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) return [];

    const arrayBuffer = await response.arrayBuffer();

    return [
      {
        content: Buffer.from(arrayBuffer).toString("base64"),
        filename: `Rechnung_${invoiceNumber}.pdf`,
      },
    ];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = await verifyAdminSession(
      cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
    );

    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

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
      return NextResponse.json({ error: "Diese Rechnung ist noch nicht faellig." }, { status: 400 });
    }

    const targetEmail = invoice.emailOverride || invoice.booking?.client.email;

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Keine Email-Adresse fuer diese Rechnung gefunden." },
        { status: 400 },
      );
    }

    const recipientName = invoice.recipientName || invoice.booking?.client.name || "Kunde";
    const dueDate = invoice.dueDate.toLocaleDateString("de-CH");
    const amount = invoice.totalAmount.toFixed(2);
    const text = `Guten Tag ${recipientName},

wir moechten Sie freundlich daran erinnern, dass die Rechnung ${invoice.invoiceNumber} noch offen ist.

Betrag: CHF ${amount}
Faellig seit: ${dueDate}

Vielen Dank und freundliche Gruesse
JC Detailing`;

    await sendResendEmail({
      attachments: await getPdfAttachment(invoice.pdfUrl, invoice.invoiceNumber),
      html: text.replace(/\n/g, "<br />"),
      subject: `Freundliche Erinnerung: Rechnung ${invoice.invoiceNumber}`,
      text,
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
    return NextResponse.json(
      { error: error.message || "Erinnerung konnte nicht gesendet werden." },
      { status: 500 },
    );
  }
}
