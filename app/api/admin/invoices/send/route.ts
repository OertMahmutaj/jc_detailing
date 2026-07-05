import { NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import nodemailer from "nodemailer";
import path from "path";
import QRCode from "qrcode";
import pdfmake from "pdfmake";

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

export async function POST(req: Request) {
  try {
    const {
      bookingId,
      invoiceNumber,
      targetEmail,
      vatRate,
      items,
      totalAmount,
    } = await req.json();

    // 1. Database Persistence Sync
    const invoice = await prisma.invoice.upsert({
      where: { bookingId },
      update: { invoiceNumber, emailOverride: targetEmail, vatRate },
      create: {
        bookingId,
        invoiceNumber,
        emailOverride: targetEmail,
        vatRate,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalAmount,
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
        { text: "Beschreibung", font: "CustomBold", bold: true },
        { text: "Menge", font: "CustomBold", bold: true },
        { text: "Einzelpreis", font: "CustomBold", bold: true },
        { text: "Betrag", font: "CustomBold", bold: true },
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
                  text: `Rechnungsnummer: ${invoiceNumber}`,
                  font: "CustomBold",
                  fontSize: 10,
                  alignment: "right",
                },
                {
                  text: `Datum: ${new Date().toLocaleDateString("de-CH")}`,
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
          text: `Gesamtsumme (inkl. MwSt): CHF ${totalAmount.toFixed(2)}`,
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
                  text: "Zahlteil",
                  font: "CustomRegular",
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: "Konto / Zahlbar an:\nCH3908704016075473007\nJC Detailing",
                  font: "CustomRegular",
                  fontSize: 8,
                  margin: [0, 4, 0, 8],
                },
                {
                  text: `Zahlbar durch:\n${targetEmail}`,
                  font: "CustomRegular",
                  fontSize: 8,
                  margin: [0, 0, 0, 8],
                },
                {
                  text: `Betrag: CHF ${totalAmount.toFixed(2)}`,
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
    const pdfBuffer: Buffer = await pdfmake.createPdf(docDefinition).getBuffer();

    // 5. Dispatch Mail via Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"JC Detailing Test" <billing@jcdetailer.ch>',
      to: targetEmail,
      subject: `Ihre Rechnung ${invoiceNumber} von JC Detailing`,
      text: "Guten Tag, im Anhang finden Sie Ihre gewünschte Abrechnung im PDF-Format inklusive QR-Einzahlungsschein.",
      attachments: [
        {
          filename: `Rechnung_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Invoicing pipeline failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}