import { NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import nodemailer from "nodemailer";
import path from "path";
import QRCode from "qrcode";
import pdfmake from "pdfmake";
import { createClient } from "@supabase/supabase-js";

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

// Required in pdfmake 0.3.x: explicitly allow which local paths can be read
// (security hardening added to prevent local-file-exfiltration via docDefinition)
pdfmake.setLocalAccessPolicy((filePath: string) => {
  return filePath.startsWith(FONTS_DIR);
});

// We don't load any fonts/images from external URLs, so deny all by default
// (silences the "No URL access policy defined" warning)
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

type InvoiceLanguage = "de" | "en" | "fr" | "it";

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

function invoiceMailText(language: InvoiceLanguage, invoiceNumber: string) {
  const texts = {
    de: {
      subject: `Ihre Rechnung ${invoiceNumber} von JC Detailing`,
      text: "Guten Tag, im Anhang finden Sie Ihre Rechnung im PDF-Format inklusive QR-Einzahlungsschein.",
    },
    en: {
      subject: `Your invoice ${invoiceNumber} from JC Detailing`,
      text: "Hello, please find your invoice attached as a PDF including the QR payment slip.",
    },
    fr: {
      subject: `Votre facture ${invoiceNumber} de JC Detailing`,
      text: "Bonjour, vous trouverez votre facture en piece jointe au format PDF avec bulletin de versement QR.",
    },
    it: {
      subject: `La tua fattura ${invoiceNumber} di JC Detailing`,
      text: "Buongiorno, in allegato trovi la tua fattura in formato PDF con bollettino di pagamento QR.",
    },
  } as const;

  return texts[language];
}

export async function POST(req: Request) {
  try {
    const {
      bookingId,
      invoiceNumber,
      targetEmail,
      vatRate,
      items,
      totalAmount,
      language: rawLanguage,
    } = await req.json();
    const language = cleanLanguage(rawLanguage);
    const t = invoicePdfLabels(language);

    // 1. Database Persistence Sync
    const invoice = await prisma.invoice.upsert({
      where: { bookingId },
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

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoiceItem.createMany({
      data: items.map((i: any) => ({
        invoiceId: invoice.id,
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        pricePerUnit: i.pricePerUnit,
      })),
    });

    // 2. Generate Swiss QR Code Payload Data
    const qrPayload = `SPC\n0200\n1\nCH3908704016075473007\nK\nTransport Berg\nAm Berg 123\n8000\nZürich\nCH\n\n\n\n\n\n\nNON\n${totalAmount.toFixed(2)}\nCHF\n`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1 });

    // Build the dynamic line-item rows array
    const tableBody: any[][] = [
      [
        { text: t.description, font: "CustomBold", bold: true },
        { text: t.quantity, font: "CustomBold", bold: true },
        { text: t.unitPrice, font: "CustomBold", bold: true },
        { text: t.amount, font: "CustomBold", bold: true },
      ],
    ];

    items.forEach((item: any) => {
      const itemTotal = item.quantity * item.pricePerUnit;
      tableBody.push([
        { text: item.description, font: "CustomRegular" },
        { text: `${item.quantity} ${item.unit}`, font: "CustomRegular" },
        { text: `CHF ${item.pricePerUnit.toFixed(2)}`, font: "CustomRegular" },
        { text: `CHF ${itemTotal.toFixed(2)}`, font: "CustomRegular" },
      ]);
    });

    // 3. Construct Layout Document Definition
    const docDefinition: any = {
      content: [
        // Top Header Section
        {
          columns: [
            {
              stack: [
                { text: "JC Detailing", font: "CustomBold", fontSize: 16 },
                {
                  text: "Zürich, Schweiz",
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

        // Table Layout Section
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: tableBody,
          },
          layout: "lightHorizontalLines",
          margin: [0, 40, 0, 20],
        },

        // Total Summaries Section
        {
          text: `${t.total}: CHF ${totalAmount.toFixed(2)}`,
          font: "CustomBold",
          fontSize: 12,
          alignment: "right",
          margin: [0, 0, 0, 60],
        },

        // Perforation Dash Line
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              dash: { length: 4, space: 4 },
            },
          ],
          margin: [0, 0, 0, 15],
        },

        // Swiss QR Section Layout Block
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
                  text: `${t.payableTo}:\nCH3908704016075473007\nJC Detailing`,
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

    // 4. Generate PDF via the new promise-based pdfmake API
    const pdfBuffer: Buffer = await pdfmake
      .createPdf(docDefinition)
      .getBuffer();

    const archivedPdfUrl = await archiveInvoicePdf(pdfBuffer, invoiceNumber);

    // 5. Dispatch Mail via Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const localizedMail = invoiceMailText(language, invoiceNumber);

    function invoicePdfFilename(
      language: InvoiceLanguage,
      invoiceNumber: string,
    ) {
      const prefixes = {
        de: "Rechnung",
        en: "Invoice",
        fr: "Facture",
        it: "Fattura",
      } as const;

      return `${prefixes[language]}_${invoiceNumber}.pdf`;
    }

    await transporter.sendMail({
      from: '"JC Detailing Test" <billing@jcdetailer.ch>',
      to: targetEmail,
      subject: localizedMail.subject,
      text: localizedMail.text,
      attachments: [
        {
          filename: invoicePdfFilename(language, invoiceNumber),
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        pdfUrl: archivedPdfUrl || invoice.pdfUrl,
        sentAt: new Date(),
        status: "SENT",
        totalAmount,
      },
    });

    return NextResponse.json({ pdfUrl: archivedPdfUrl, success: true });
  } catch (error: any) {
    console.error("Invoicing pipeline failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
