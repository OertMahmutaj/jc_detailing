import { NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import path from "path";
import QRCode from "qrcode";
import pdfmake from "pdfmake";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

pdfmake.setLocalAccessPolicy((filePath: string) => {
  return filePath.startsWith(FONTS_DIR);
});

pdfmake.setUrlAccessPolicy(() => false);

pdfmake.addFonts({
  CustomRegular: {
    normal: path.join(FONTS_DIR, "Inter_18pt-Light.ttf"),
    bold: path.join(FONTS_DIR, "Inter_18pt-Light.ttf"),
  },
  CustomBold: {
    normal: path.join(FONTS_DIR, "GeistMono-Black.ttf"),
    bold: path.join(FONTS_DIR, "GeistMono-Black.ttf"),
  },
});

type InvoiceLanguage = "de" | "en" | "fr" | "it";

type InvoiceItemInput = {
  description: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
};

type InvoiceSendRequest = {
  bookingId: string;
  invoiceNumber: string;
  targetEmail: string;
  vatRate: number;
  items: InvoiceItemInput[];
  totalAmount: number;
  language?: InvoiceLanguage;
};

async function archiveInvoicePdf(pdfBuffer: Buffer, invoiceNumber: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_INVOICE_BUCKET || "invoices";

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const filePath = `invoices/${invoiceNumber}-${Date.now()}.pdf`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    console.warn("Invoice archive upload failed:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}

function cleanLanguage(value: unknown): InvoiceLanguage {
  return value === "en" || value === "fr" || value === "it" ? value : "de";
}

function invoicePdfLabels(language: InvoiceLanguage) {
  const labels = {
    de: {
      description: "Beschreibung",
      quantity: "Menge",
      unitPrice: "Einzelpreis",
      amount: "Betrag",
      total: "Gesamtsumme (inkl. MwSt)",
      invoiceNumber: "Rechnungsnummer",
      date: "Datum",
      paymentPart: "Zahlteil",
      payableTo: "Konto / Zahlbar an",
      payableBy: "Zahlbar durch",
      locale: "de-CH",
    },
    en: {
      description: "Description",
      quantity: "Quantity",
      unitPrice: "Unit price",
      amount: "Amount",
      total: "Total (incl. VAT)",
      invoiceNumber: "Invoice number",
      date: "Date",
      paymentPart: "Payment part",
      payableTo: "Account / Payable to",
      payableBy: "Payable by",
      locale: "en-CH",
    },
    fr: {
      description: "Description",
      quantity: "Quantité",
      unitPrice: "Prix unitaire",
      amount: "Montant",
      total: "Total (TVA incl.)",
      invoiceNumber: "Numéro de facture",
      date: "Date",
      paymentPart: "Section paiement",
      payableTo: "Compte / Payable à",
      payableBy: "Payable par",
      locale: "fr-CH",
    },
    it: {
      description: "Descrizione",
      quantity: "Quantità",
      unitPrice: "Prezzo unitario",
      amount: "Importo",
      total: "Totale (IVA incl.)",
      invoiceNumber: "Numero fattura",
      date: "Data",
      paymentPart: "Sezione pagamento",
      payableTo: "Conto / Pagabile a",
      payableBy: "Pagabile da",
      locale: "it-CH",
    },
  } as const;

  return labels[language];
}

function invoiceMailCopy(language: InvoiceLanguage, invoiceNumber: string) {
  const copy = {
    de: {
      badge: "Rechnung",
      subject: `Ihre Rechnung ${invoiceNumber} von JC Detailing`,
      intro:
        "Im Anhang finden Sie Ihre Rechnung im PDF-Format inklusive QR-Einzahlungsschein.",
      invoiceNumberLabel: "Rechnungsnummer",
      amountLabel: "Betrag",
      attachmentNote:
        "Die Rechnung befindet sich als PDF im Anhang dieser E-Mail.",
      greeting: "Freundliche Grüsse",
      text:
        `Guten Tag,\n\n` +
        `im Anhang finden Sie Ihre Rechnung ${invoiceNumber} im PDF-Format inklusive QR-Einzahlungsschein.\n\n` +
        `Freundliche Grüsse\nJC Detailing\nSternmatt 4, 6242 Wauwil\n+41 77 268 33 88`,
    },
    en: {
      badge: "Invoice",
      subject: `Your invoice ${invoiceNumber} from JC Detailing`,
      intro:
        "Please find your invoice attached as a PDF including the QR payment slip.",
      invoiceNumberLabel: "Invoice number",
      amountLabel: "Amount",
      attachmentNote: "The invoice is attached to this email as a PDF.",
      greeting: "Kind regards",
      text:
        `Hello,\n\n` +
        `Please find your invoice ${invoiceNumber} attached as a PDF including the QR payment slip.\n\n` +
        `Kind regards\nJC Detailing\nSternmatt 4, 6242 Wauwil\n+41 77 268 33 88`,
    },
    fr: {
      badge: "Facture",
      subject: `Votre facture ${invoiceNumber} de JC Detailing`,
      intro:
        "Vous trouverez votre facture en pièce jointe au format PDF avec bulletin de versement QR.",
      invoiceNumberLabel: "Numéro de facture",
      amountLabel: "Montant",
      attachmentNote: "La facture est jointe à cet e-mail au format PDF.",
      greeting: "Meilleures salutations",
      text:
        `Bonjour,\n\n` +
        `Vous trouverez votre facture ${invoiceNumber} en pièce jointe au format PDF avec bulletin de versement QR.\n\n` +
        `Meilleures salutations\nJC Detailing\nSternmatt 4, 6242 Wauwil\n+41 77 268 33 88`,
    },
    it: {
      badge: "Fattura",
      subject: `La tua fattura ${invoiceNumber} da JC Detailing`,
      intro:
        "In allegato trovi la tua fattura in formato PDF con bollettino di pagamento QR.",
      invoiceNumberLabel: "Numero fattura",
      amountLabel: "Importo",
      attachmentNote: "La fattura è allegata a questa e-mail in formato PDF.",
      greeting: "Cordiali saluti",
      text:
        `Buongiorno,\n\n` +
        `In allegato trovi la tua fattura ${invoiceNumber} in formato PDF con bollettino di pagamento QR.\n\n` +
        `Cordiali saluti\nJC Detailing\nSternmatt 4, 6242 Wauwil\n+41 77 268 33 88`,
    },
  } as const;

  return copy[language];
}
function invoicePdfFilename(language: InvoiceLanguage, invoiceNumber: string) {
  const prefixes = {
    de: "Rechnung",
    en: "Invoice",
    fr: "Facture",
    it: "Fattura",
  } as const;

  return `${prefixes[language]}_${invoiceNumber}.pdf`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function invoiceMailHtml({
  amountLabel,
  attachmentNote,
  badge,
  greeting,
  intro,
  invoiceNumber,
  invoiceNumberLabel,
  totalAmount,
}: {
  amountLabel: string;
  attachmentNote: string;
  badge: string;
  greeting: string;
  intro: string;
  invoiceNumber: string;
  invoiceNumberLabel: string;
  totalAmount: number;
}) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f5efe1;font-family:Arial,Helvetica,sans-serif;color:#111111;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5efe1;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #ded6c8;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:26px 24px 20px;text-align:center;background:#ffffff;border-bottom:1px solid #ece4d6;">
                    <div style="font-size:22px;font-weight:800;color:#111111;letter-spacing:.02em;">
                      JC Detailing
                    </div>
                    <div style="margin-top:4px;font-size:12px;color:#6b6256;">
                      Luzern · Wauwil · Switzerland
                    </div>

                    <div style="display:inline-block;margin-top:20px;padding:7px 12px;border-radius:999px;background:#f1d675;color:#111111;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">
                      ${escapeHtml(badge)}
                    </div>

                    <h1 style="margin:18px 0 10px;font-size:26px;line-height:1.2;color:#111111;">
                      ${escapeHtml(invoiceNumber)}
                    </h1>

                    <p style="margin:0 auto;max-width:460px;color:#4b5563;font-size:15px;line-height:1.7;">
                      ${escapeHtml(intro)}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 24px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:13px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;">
                          ${escapeHtml(invoiceNumberLabel)}
                        </td>
                        <td style="padding:13px 0;color:#111111;font-size:14px;font-weight:800;text-align:right;border-bottom:1px solid #e5e7eb;">
                          ${escapeHtml(invoiceNumber)}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:13px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;">
                          ${escapeHtml(amountLabel)}
                        </td>
                        <td style="padding:13px 0;color:#111111;font-size:14px;font-weight:800;text-align:right;border-bottom:1px solid #e5e7eb;">
                          CHF ${totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top:26px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e5e7eb;">
                      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
                        ${escapeHtml(attachmentNote)}
                      </p>
                    </div>

                    <p style="margin:26px 0 0;color:#111111;font-size:15px;line-height:1.7;">
                      ${escapeHtml(greeting)}<br />
                      <strong>JC Detailing</strong>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.7;text-align:center;">
                    JC Detailing · Sternmatt 4, 6242 Wauwil · +41 77 268 33 88 · jcdetailinglucerne@gmail.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getPaymentDetails() {
  const iban = process.env.INVOICE_IBAN;

  if (!iban) {
    throw new Error(
      "INVOICE_IBAN is missing. Add the real JC Detailing IBAN before sending invoices.",
    );
  }

  return {
    iban,
    name: process.env.INVOICE_PAYABLE_NAME ?? "JC Detailing",
    street: process.env.INVOICE_PAYABLE_STREET ?? "Sternmatt 4",
    postCode: process.env.INVOICE_PAYABLE_POSTCODE ?? "6242",
    city: process.env.INVOICE_PAYABLE_CITY ?? "Wauwil",
    country: process.env.INVOICE_PAYABLE_COUNTRY ?? "CH",
  };
}

async function sendInvoiceEmail({
  filename,
  html,
  pdfBuffer,
  subject,
  text,
  to,
}: {
  filename: string;
  html: string;
  pdfBuffer: Buffer;
  subject: string;
  text: string;
  to: string;
}) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  const from =
    process.env.BOOKING_FROM_EMAIL ?? "JC Detailing <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
      reply_to:
        process.env.BOOKING_OWNER_EMAIL ?? "jcdetailinglucerne@gmail.com",
      attachments: [
        {
          filename,
          content: pdfBuffer.toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend invoice email failed: ${errorText}`);
  }
}

function validateInvoiceRequest(body: Partial<InvoiceSendRequest>) {
  if (!body.bookingId) {
    throw new Error("bookingId is required.");
  }

  if (!body.invoiceNumber) {
    throw new Error("invoiceNumber is required.");
  }

  if (!body.targetEmail) {
    throw new Error("targetEmail is required.");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new Error("At least one invoice item is required.");
  }

  if (
    typeof body.totalAmount !== "number" ||
    !Number.isFinite(body.totalAmount)
  ) {
    throw new Error("totalAmount is invalid.");
  }

  if (typeof body.vatRate !== "number" || !Number.isFinite(body.vatRate)) {
    throw new Error("vatRate is invalid.");
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<InvoiceSendRequest>;

    validateInvoiceRequest(body);

    const {
      bookingId,
      invoiceNumber,
      targetEmail,
      vatRate,
      items,
      totalAmount,
      language: rawLanguage,
    } = body as InvoiceSendRequest;

    const language = cleanLanguage(rawLanguage);
    const t = invoicePdfLabels(language);
    const payment = getPaymentDetails();

    const invoice = await prisma.invoice.upsert({
      where: {
        bookingId,
      },
      update: {
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        emailOverride: targetEmail,
        invoiceNumber,
        language,
        totalAmount,
        vatRate,
      },
      create: {
        bookingId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        emailOverride: targetEmail,
        invoiceNumber,
        language,
        totalAmount,
        vatRate,
      },
    });

    await prisma.invoiceItem.deleteMany({
      where: {
        invoiceId: invoice.id,
      },
    });

    await prisma.invoiceItem.createMany({
      data: items.map((item) => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
      })),
    });

    const qrPayload = [
      "SPC",
      "0200",
      "1",
      payment.iban,
      "K",
      payment.name,
      payment.street,
      payment.postCode,
      payment.city,
      payment.country,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "NON",
      totalAmount.toFixed(2),
      "CHF",
      "",
    ].join("\n");

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
    });

    const tableBody: any[][] = [
      [
        { text: t.description, font: "CustomBold", bold: true },
        { text: t.quantity, font: "CustomBold", bold: true },
        { text: t.unitPrice, font: "CustomBold", bold: true },
        { text: t.amount, font: "CustomBold", bold: true },
      ],
    ];

    items.forEach((item) => {
      const itemTotal = item.quantity * item.pricePerUnit;

      tableBody.push([
        { text: item.description, font: "CustomRegular" },
        { text: `${item.quantity} ${item.unit}`, font: "CustomRegular" },
        {
          text: `CHF ${item.pricePerUnit.toFixed(2)}`,
          font: "CustomRegular",
        },
        {
          text: `CHF ${itemTotal.toFixed(2)}`,
          font: "CustomRegular",
        },
      ]);
    });

    const docDefinition: any = {
      content: [
        {
          columns: [
            {
              stack: [
                {
                  text: "JC Detailing",
                  font: "CustomBold",
                  fontSize: 16,
                },
                {
                  text: "Sternmatt 4, 6242 Wauwil",
                  font: "CustomRegular",
                  fontSize: 10,
                  color: "#666",
                },
                {
                  text: "+41 77 268 33 88",
                  font: "CustomRegular",
                  fontSize: 10,
                  color: "#666",
                },
              ],
            },
            {
              stack: [
                {
                  text: `${t.invoiceNumber}: ${invoiceNumber}`,
                  font: "CustomBold",
                  fontSize: 10,
                  alignment: "right",
                },
                {
                  text: `${t.date}: ${new Date().toLocaleDateString(t.locale)}`,
                  font: "CustomRegular",
                  fontSize: 10,
                  alignment: "right",
                  margin: [0, 4, 0, 0],
                },
              ],
            },
          ],
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: tableBody,
          },
          layout: "lightHorizontalLines",
          margin: [0, 40, 0, 20],
        },
        {
          text: `${t.total}: CHF ${totalAmount.toFixed(2)}`,
          font: "CustomBold",
          fontSize: 12,
          alignment: "right",
          margin: [0, 0, 0, 60],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              dash: {
                length: 4,
                space: 4,
              },
            },
          ],
          margin: [0, 0, 0, 15],
        },
        {
          columns: [
            {
              image: qrCodeDataUrl,
              width: 120,
            },
            {
              stack: [
                {
                  text: t.paymentPart,
                  font: "CustomRegular",
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: `${t.payableTo}:\n${payment.iban}\n${payment.name}\n${payment.street}\n${payment.postCode} ${payment.city}`,
                  font: "CustomRegular",
                  fontSize: 8,
                  margin: [0, 4, 0, 8],
                },
                {
                  text: `${t.payableBy}:\n${targetEmail}`,
                  font: "CustomRegular",
                  fontSize: 8,
                  margin: [0, 0, 0, 8],
                },
                {
                  text: `${t.amount}: CHF ${totalAmount.toFixed(2)}`,
                  font: "CustomBold",
                  fontSize: 10,
                },
              ],
              margin: [20, 0, 0, 0],
            },
          ],
        },
      ],
      defaultStyle: {
        font: "CustomRegular",
      },
    };

    const pdfBuffer: Buffer = await pdfmake
      .createPdf(docDefinition)
      .getBuffer();

    const archivedPdfUrl = await archiveInvoicePdf(pdfBuffer, invoiceNumber);

    const localizedMail = invoiceMailCopy(language, invoiceNumber);
    const filename = invoicePdfFilename(language, invoiceNumber);

    await sendInvoiceEmail({
      to: targetEmail,
      subject: localizedMail.subject,
      text: localizedMail.text,
      html: invoiceMailHtml({
        amountLabel: localizedMail.amountLabel,
        attachmentNote: localizedMail.attachmentNote,
        badge: localizedMail.badge,
        greeting: localizedMail.greeting,
        intro: localizedMail.intro,
        invoiceNumber,
        invoiceNumberLabel: localizedMail.invoiceNumberLabel,
        totalAmount,
      }),
      filename,
      pdfBuffer,
    });

    await prisma.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        pdfUrl: archivedPdfUrl || invoice.pdfUrl,
        sentAt: new Date(),
        status: "SENT",
        totalAmount,
      },
    });

    return NextResponse.json({
      pdfUrl: archivedPdfUrl,
      success: true,
    });
  } catch (error) {
    console.error("Invoicing pipeline failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Die Rechnung konnte nicht gesendet werden.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}
