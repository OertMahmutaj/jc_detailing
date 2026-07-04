// app/api/bookings/route.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 1. Initialize Prisma 7 Native Driver Client
const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type BookingPayload = {
  name?: string;
  email?: string;
  phone?: string;
  vehicle?: string;
  date?: string;
  time?: string;
  message?: string;
  serviceId?: string;
  vehicleCategoryId?: string;
  addOnIds?: string[];
  totalPrice?: number;
};

const ownerEmail =
  process.env.BOOKING_OWNER_EMAIL ?? "oert64@gmail.com";
const fromEmail =
  process.env.BOOKING_FROM_EMAIL ?? "JC Detailing <onboarding@resend.dev>";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requiredFields(payload: BookingPayload) {
  return [
    payload.name,
    payload.email,
    payload.phone,
    payload.vehicle,
    payload.date,
    payload.time,
    payload.serviceId,
    payload.vehicleCategoryId,
  ].every((value) => clean(value).length > 0);
}

async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromEmail, to, subject, text }),
  });

  if (!response.ok) throw new Error("Email provider rejected the request");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingPayload;

    // Look for this block inside your POST function and add the || "" defaults:
    const payload: BookingPayload = {
      name: clean(body.name),
      email: clean(body.email),
      phone: clean(body.phone),
      vehicle: clean(body.vehicle),
      date: clean(body.date),
      time: clean(body.time),
      message: clean(body.message),
      serviceId: clean(body.serviceId || ""), // Enforce absolute string fallback
      vehicleCategoryId: clean(body.vehicleCategoryId || ""), // Enforce absolute string fallback
      addOnIds: body.addOnIds || [],
      totalPrice: body.totalPrice ?? 0,
    };

    // 2. Validate new field requirements structure
    if (!requiredFields(payload)) {
      return Response.json(
        { message: "Bitte alle Pflichtfelder ausfuellen." },
        { status: 400 },
      );
    }

    // 3. Look up the human-readable names from your Supabase DB using the IDs
    const [dbService, dbCategory, dbAddOns] = await Promise.all([
      prisma.service.findUnique({ where: { id: payload.serviceId } }),
      prisma.vehicleCategory.findUnique({
        where: { id: payload.vehicleCategoryId },
      }),
      prisma.addOn.findMany({ where: { id: { in: payload.addOnIds } } }),
    ]);

    const serviceName = dbService?.name ?? "Unbekanntes Paket";
    const categoryName = dbCategory?.name ?? "Unbekannte Größe";
    const addOnNames = dbAddOns.map((a) => a.name).join(", ") || "Keine";

    // 4. Construct the summary layout for emails
    const summary = [
      `Name: ${payload.name}`,
      `E-Mail: ${payload.email}`,
      `Telefon: ${payload.phone}`,
      `Leistung: ${serviceName}`,
      `Fahrzeuggrösse: ${categoryName}`,
      `Zusatzleistungen (Extras): ${addOnNames}`,
      `Fahrzeugmodell: ${payload.vehicle}`,
      `Wunschdatum: ${payload.date}`,
      `Wunschtime: ${payload.time}`,
      `Voraussichtlicher Preis: CHF ${payload.totalPrice?.toFixed(2)}`,
      `Nachricht: ${payload.message || "-"}`,
    ].join("\n");

    // 5. Fire off confirmation emails
    await sendEmail({
      to: ownerEmail,
      subject: `Neue Buchungsanfrage: ${serviceName}`,
      text: `Neue Buchungsanfrage ueber die Website:\n\n${summary}`,
    });

    await sendEmail({
      to: payload.email || "", // Added || "" to satisfy the strict string checker
      subject: "JC Detailing - Deine Anfrage ist eingegangen",
      text:
        `Hallo ${payload.name}\n\n` +
        "Danke fuer deine Anfrage bei JC Detailing. Wir pruefen deinen Wunschtermin und melden uns so schnell wie moeglich mit einer Bestaetigung oder einem Terminvorschlag.\n\n" +
        `Deine Angaben:\n\n${summary}\n\n` +
        "Freundliche Gruesse\nJC Detailing",
    });

    return Response.json({ message: "Anfrage gesendet." });
  } catch (err) {
    console.error("Backend Booking Error:", err);
    return Response.json(
      {
        message:
          "Die Anfrage konnte nicht gesendet werden. Bitte versuche es spaeter erneut.",
      },
      { status: 500 },
    );
  }
}
