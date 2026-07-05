"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";

type InvoiceLanguage = "de" | "en" | "fr" | "it";

function cleanLanguage(value: FormDataEntryValue | null): InvoiceLanguage {
  return value === "en" || value === "fr" || value === "it" ? value : "de";
}

function buildDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function invoiceNumber() {
  return `RE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
}

async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: process.env.BOOKING_FROM_EMAIL ?? "JC Detailing <onboarding@resend.dev>",
      subject,
      text,
      to,
    }),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  }).catch((error) => console.warn("Admin booking email failed:", error));
}

function customerText(language: InvoiceLanguage, name: string, invoice: string, total: number) {
  const amount = `CHF ${total.toFixed(2)}`;
  const texts = {
    de: {
      subject: `JC Detailing - Buchung ${invoice}`,
      text: `Hallo ${name}\n\nDeine Buchung wurde erstellt.\n\nRechnung: ${invoice}\nBetrag: ${amount}\n\nFreundliche Gruesse\nJC Detailing`,
    },
    en: {
      subject: `JC Detailing - Booking ${invoice}`,
      text: `Hello ${name}\n\nYour booking has been created.\n\nInvoice: ${invoice}\nAmount: ${amount}\n\nKind regards\nJC Detailing`,
    },
    fr: {
      subject: `JC Detailing - Reservation ${invoice}`,
      text: `Bonjour ${name}\n\nVotre reservation a ete creee.\n\nFacture: ${invoice}\nMontant: ${amount}\n\nMeilleures salutations\nJC Detailing`,
    },
    it: {
      subject: `JC Detailing - Prenotazione ${invoice}`,
      text: `Ciao ${name}\n\nLa tua prenotazione e stata creata.\n\nFattura: ${invoice}\nImporto: ${amount}\n\nCordiali saluti\nJC Detailing`,
    },
  } as const;

  return texts[language];
}

export async function createAdminBooking(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const vehicleModel = String(formData.get("vehicleModel") ?? "").trim();
  const serviceId = String(formData.get("serviceId") ?? "");
  const vehicleCategoryId = String(formData.get("vehicleCategoryId") ?? "");
  const date = String(formData.get("date") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const language = cleanLanguage(formData.get("language"));
  const addOnIds = formData.getAll("addOnIds").map(String).filter(Boolean);

  if (!name || !email || !phone || !vehicleModel || !serviceId || !vehicleCategoryId || !date || !start || !end) {
    return;
  }

  const dateTime = buildDateTime(date, start);
  const endTime = buildDateTime(date, end);
  if (endTime <= dateTime) return;

  const [service, category, addOns] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.vehicleCategory.findUnique({ where: { id: vehicleCategoryId } }),
    addOnIds.length ? prisma.addOn.findMany({ where: { id: { in: addOnIds } } }) : Promise.resolve([]),
  ]);

  if (!service || !category) return;

  const booking = await prisma.booking.create({
    data: {
      dateTime,
      endTime,
      imageUrls: [],
      status: "CONFIRMED",
      vehicleModel,
      client: {
        connectOrCreate: {
          create: { email, name, phone },
          where: { email },
        },
      },
      service: { connect: { id: service.id } },
      services: { connect: [{ id: service.id }] },
      vehicleCategory: { connect: { id: category.id } },
      addOns: { connect: addOns.map((addOn) => ({ id: addOn.id })) },
    },
  });

  const totalAmount = service.basePrice + category.priceModifier + addOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const number = invoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      bookingId: booking.id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      emailOverride: email,
      invoiceNumber: number,
      language,
      sentAt: new Date(),
      status: "SENT",
      totalAmount,
      vatRate: 7.7,
    },
  });

  await prisma.invoiceItem.createMany({
    data: [
      {
        description: service.name,
        invoiceId: invoice.id,
        pricePerUnit: service.basePrice,
        quantity: 1,
        unit: "Stk.",
      },
      ...(category.priceModifier > 0
        ? [{ description: `Fahrzeuggroesse: ${category.name}`, invoiceId: invoice.id, pricePerUnit: category.priceModifier, quantity: 1, unit: "Stk." }]
        : []),
      ...addOns.map((addOn) => ({
        description: addOn.name,
        invoiceId: invoice.id,
        pricePerUnit: addOn.price,
        quantity: 1,
        unit: "Stk.",
      })),
    ],
  });

  const localized = customerText(language, name, number, totalAmount);
  await sendEmail(email, localized.subject, localized.text);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/dashboard");
}
