import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ownerEmail = process.env.BOOKING_OWNER_EMAIL ?? "oert64@gmail.com";
const fromEmail = process.env.BOOKING_FROM_EMAIL ?? "JC Detailing <onboarding@resend.dev>";

// Email helper with debug alerts to see exactly what Resend says in terminal logs
async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("❌ EMAIL ERROR: RESEND_API_KEY is missing from environment variables.");
    return;
  }

  console.log(`✉️ Attempting to send email to: ${to} from: ${fromEmail}`);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ Resend API Rejected Request:", errorData);
    throw new Error("Email provider rejected the request");
  }

  console.log("✅ Email successfully accepted by Resend!");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract incoming variables
    const { name, email, phone, vehicleModel, notes, dateTime, serviceId, vehicleCategoryId, addOnIds } = body;

    // 1. Gather configuration criteria to calculate the duration window
    const [dbService, dbCategory, dbAddOns] = await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.vehicleCategory.findUnique({ where: { id: vehicleCategoryId } }),
      prisma.addOn.findMany({ where: { id: { in: addOnIds } } }),
    ]);

    if (!dbService) {
      return Response.json({ message: "Service nicht gefunden." }, { status: 400 });
    }

    const baseDuration = dbService.durationMinutes;
    const addOnsDuration = dbAddOns.reduce((sum, item) => sum + item.additionalDuration, 0);
    const totalDuration = baseDuration + addOnsDuration;

    // Calculate start and end timeline wrappers
    const startBookingDate = new Date(dateTime);
    const endBookingDate = new Date(startBookingDate.getTime() + totalDuration * 60000);

    // CHANGE 1: Anti Double-Booking Server Level Guard Check
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        status: { not: "CANCELLED" },
        OR: [
          {
            // New booking starts inside an existing booking slot
            dateTime: { lte: startBookingDate },
            endTime: { gt: startBookingDate },
          },
          {
            // New booking ends inside an existing booking slot
            dateTime: { lt: endBookingDate },
            endTime: { gte: endBookingDate },
          },
          {
            // New booking completely swallows an existing booking slot frame
            dateTime: { gte: startBookingDate },
            endTime: { lte: endBookingDate },
          },
        ],
      },
    });

    if (conflictingBooking) {
      return Response.json(
        { message: "Dieser Termin ist leider gerade eben vergeben worden. Bitte wähle eine andere Zeit." },
        { status: 400 }
      );
    }

    // 2. Transactional relational database write matching your schema rules
    const savedBooking = await prisma.booking.create({
      data: {
        dateTime: startBookingDate,
        endTime: endBookingDate,
        vehicleModel: vehicleModel || "Unbekannt",
        notes: notes || "",
        status: "PENDING",
        client: {
          connectOrCreate: {
            where: { email: email },
            create: { name: name, email: email, phone: phone }
          }
        },
        service: { connect: { id: serviceId } },
        vehicleCategory: { connect: { id: vehicleCategoryId } },
        addOns: {
          connect: addOnIds?.map((id: string) => ({ id })) || []
        }
      }
    });

    // CHANGE 2: Full Email Dispatch Engine Execution
    const serviceName = dbService.name;
    const categoryName = dbCategory?.name ?? "Standard";
    const addOnNames = dbAddOns.map((a) => a.name).join(", ") || "Keine";

    const summary = [
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone}`,
      `Leistung: ${serviceName}`,
      `Fahrzeuggrösse: ${categoryName}`,
      `Zusatzleistungen (Extras): ${addOnNames}`,
      `Fahrzeugmodell: ${vehicleModel || "Unbekannt"}`,
      `Termin Start: ${startBookingDate.toLocaleString("de-CH")}`,
      `Termin Ende (Erwartet): ${endBookingDate.toLocaleString("de-CH")}`,
      `Hinweise/Nachricht: ${notes || "-"}`,
    ].join("\n");

    // Dispatch email to business admin (This works in development!)
    try {
      await sendEmail({
        to: ownerEmail,
        subject: `Neue Buchungsanfrage: ${serviceName}`,
        text: `Eine neue Buchungsanfrage wurde eingereicht:\n\n${summary}`,
      });
    } catch (adminEmailError) {
      console.error("❌ Failed to send admin alert email:", adminEmailError);
    }

    // Dispatch confirmation email back to customer
    // 🛡️ Safe wrapper: prevents Resend Sandbox validation restrictions from crashing the runtime
    try {
      await sendEmail({
        to: email || "",
        subject: "JC Detailing - Deine Anfrage ist eingegangen",
        text:
          `Hallo ${name}\n\n` +
          "Danke fuer deine Anfrage bei JC Detailing. Wir pruefen deinen Wunschtermin und melden uns so schnell wie moeglich mit einer Bestaetigung oder einem Terminvorschlag.\n\n" +
          `Deine Angaben:\n\n${summary}\n\n` +
          "Freundliche Gruesse\nJC Detailing",
      });
    } catch (customerEmailError) {
      console.warn(
        "⚠️ Customer confirmation email skipped/blocked by Resend Sandbox restrictions. This is normal behavior during local development until your domain is verified."
      );
    }

    return Response.json({ message: "Anfrage gesendet." });
  } catch (err) {
    console.error("Database save crash:", err);
    return Response.json({ message: "Fehler beim Verarbeiten der Anfrage." }, { status: 500 });
  }
}