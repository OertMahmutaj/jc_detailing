"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";

type InvoiceLanguage = "de" | "en" | "fr" | "it";

function cleanLanguage(value: FormDataEntryValue | null): InvoiceLanguage {
  return value === "en" || value === "fr" || value === "it" ? value : "de";
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
  }).catch((error) => console.warn("Standalone invoice email failed:", error));
}

function mailText(language: InvoiceLanguage, invoice: string, amount: number) {
  const total = `CHF ${amount.toFixed(2)}`;
  const texts = {
    de: { subject: `Ihre Rechnung ${invoice}`, text: `Guten Tag\n\nIhre Rechnung ${invoice} wurde erstellt.\nBetrag: ${total}\n\nFreundliche Gruesse\nJC Detailing` },
    en: { subject: `Your invoice ${invoice}`, text: `Hello\n\nYour invoice ${invoice} has been created.\nAmount: ${total}\n\nKind regards\nJC Detailing` },
    fr: { subject: `Votre facture ${invoice}`, text: `Bonjour\n\nVotre facture ${invoice} a ete creee.\nMontant: ${total}\n\nMeilleures salutations\nJC Detailing` },
    it: { subject: `La tua fattura ${invoice}`, text: `Buongiorno\n\nLa tua fattura ${invoice} e stata creata.\nImporto: ${total}\n\nCordiali saluti\nJC Detailing` },
  } as const;

  return texts[language];
}

export async function createStandaloneInvoice(formData: FormData) {
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const language = cleanLanguage(formData.get("language"));

  if (!recipientName || !email || !description || !Number.isFinite(amount) || amount <= 0) return;

  const number = invoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      emailOverride: email,
      invoiceNumber: number,
      language,
      recipientName,
      sentAt: new Date(),
      status: "SENT",
      totalAmount: amount,
      vatRate: 7.7,
    },
  });

  await prisma.invoiceItem.create({
    data: {
      description,
      invoiceId: invoice.id,
      pricePerUnit: amount,
      quantity: 1,
      unit: "Stk.",
    },
  });

  const localized = mailText(language, number, amount);
  await sendEmail(email, localized.subject, localized.text);

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/dashboard");
}
