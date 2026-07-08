import { prisma } from "../../(admin)/admin/_lib/prisma";

const ownerEmail = process.env.BOOKING_OWNER_EMAIL ?? "oert64@gmail.com";
const fromEmail =
  process.env.BOOKING_FROM_EMAIL ?? "JC Detailing <onboarding@resend.dev>";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const bookingRateLimit = new Map<string, { count: number; resetAt: number }>();
const allowedAddOnsByService: Record<string, string[]> = {
  "Komplett Innenreinigung": ["Tierhaarentfernung"],
  "Pflegeerhaltung Innenreinigung": [
    "Tierhaarentfernung",
    "Sitze Tiefenreinigung",
    "Fussmatten intensiv",
    "Kofferraum Deep Clean",
  ],
  "Komplette Premium Paket": ["Tierhaarentfernung"],
};

type BookingPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  vehicleModel?: unknown;
  notes?: unknown;
  dateTime?: unknown;
  serviceId?: unknown;
  serviceIds?: unknown;
  vehicleCategoryId?: unknown;
  addOnIds?: unknown;
  language?: unknown;
  website?: unknown;
};

type InvoiceLanguage = "de" | "en" | "fr" | "it";

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanIdArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    )
    .slice(0, 12);
}

function cleanLanguage(value: unknown): InvoiceLanguage {
  if (typeof value !== "string") return "de";
  const language = value.toLowerCase();

  return language === "en" || language === "fr" || language === "it"
    ? language
    : "de";
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = bookingRateLimit.get(ip);

  if (!current || current.resetAt <= now) {
    bookingRateLimit.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  if (current.count >= maxRequestsPerWindow) {
    return true;
  }

  current.count += 1;
  return false;
}

function isOverlapConstraintError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "P2004" ||
    Boolean(maybeError.message?.includes("Booking_no_active_time_overlap"))
  );
}

function getZurichMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );

  return hour * 60 + minute;
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

  if (!key) {
    console.error(
      "EMAIL ERROR: RESEND_API_KEY is missing from environment variables.",
    );
    return;
  }

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
    const providerMessage =
      typeof errorData?.message === "string"
        ? errorData.message
        : "Email provider rejected the request";
    throw new Error(providerMessage);
  }
}

function invoiceNumber() {
  return `RE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
}

function customerTexts(
  language: InvoiceLanguage,
  name: string,
  invoice: string,
  total: number,
  summary: string,
) {
  const formattedTotal = `CHF ${total.toFixed(2)}`;
  const texts = {
    de: {
      subject: "JC Detailing - Buchung erhalten",
      body:
        `Hallo ${name}\n\n` +
        "Danke für deine Buchung bei JC Detailing. Deine Anfrage ist bei uns eingegangen.\n\n" +
        `Deine Angaben:\n\n${summary}\n\n` +
        "Freundliche Gruesse\nJC Detailing",
    },
    en: {
      subject: "JC Detailing - Booking received",
      body:
        `Hello ${name}\n\n` +
        "Thank you for your booking with JC Detailing. We have received your request.\n\n" +
        `Your details:\n\n${summary}\n\n` +
        "Kind regards\nJC Detailing",
    },
    fr: {
      subject: "JC Detailing - Reservation recues",
      body:
        `Bonjour ${name}\n\n` +
        "Merci pour votre reservation chez JC Detailing. Nous avons bien recu votre demande.\n\n" +
        `Vos informations:\n\n${summary}\n\n` +
        "Meilleures salutations\nJC Detailing",
    },
    it: {
      subject: "JC Detailing - Prenotazione ricevuta",
      body:
        `Ciao ${name}\n\n` +
        "Grazie per la tua prenotazione presso JC Detailing. Abbiamo ricevuto la tua richiesta.\n\n" +
        `I tuoi dati:\n\n${summary}\n\n` +
        "Cordiali saluti\nJC Detailing",
    },
  } as const;

  return texts[language];
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    if (isRateLimited(clientIp)) {
      return Response.json(
        {
          message:
            "Zu viele Anfragen. Bitte versuche es in einigen Minuten erneut.",
        },
        { status: 429 },
      );
    }

    const body = (await request.json()) as BookingPayload;

    if (cleanText(body.website, 120)) {
      return Response.json({ message: "Anfrage gesendet." });
    }

    const name = cleanText(body.name, 100);
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 40);
    const vehicleModel = cleanText(body.vehicleModel, 120);
    const notes = cleanText(body.notes, 1200);
    const vehicleCategoryId = cleanText(body.vehicleCategoryId, 80);
    const language = cleanLanguage(body.language);
    const addOnIds = cleanIdArray(body.addOnIds);
    const serviceIds = cleanIdArray(body.serviceIds).length
      ? cleanIdArray(body.serviceIds)
      : cleanIdArray(
          typeof body.serviceId === "string" ? [body.serviceId] : [],
        );
    const startBookingDate =
      typeof body.dateTime === "string" ? new Date(body.dateTime) : null;

    if (!name || !emailPattern.test(email) || !phone || !vehicleModel) {
      return Response.json(
        { message: "Bitte prüfe Name, E-Mail, Telefon und Fahrzeugmodell." },
        { status: 400 },
      );
    }

    if (
      !startBookingDate ||
      Number.isNaN(startBookingDate.getTime()) ||
      startBookingDate.getTime() <= Date.now()
    ) {
      return Response.json(
        { message: "Bitte wähle einen gültigen Termin in der Zukunft." },
        { status: 400 },
      );
    }

    const startMinutes = getZurichMinutes(startBookingDate);

    if (startMinutes < 8 * 60 || startMinutes > 13 * 60 + 30) {
      return Response.json(
        { message: "Bitte waehle eine Uhrzeit zwischen 08:00 und 13:30." },
        { status: 400 },
      );
    }

    if (!vehicleCategoryId || serviceIds.length === 0) {
      return Response.json(
        {
          message:
            "Bitte wähle mindestens eine Leistung und eine Fahrzeuggrösse.",
        },
        { status: 400 },
      );
    }

    const uniqueServiceIds = [...new Set(serviceIds)];
    const uniqueAddOnIds = [...new Set(addOnIds)];
    const [dbServices, dbCategory, dbAddOns] = await Promise.all([
      prisma.service.findMany({ where: { id: { in: uniqueServiceIds } } }),
      prisma.vehicleCategory.findUnique({ where: { id: vehicleCategoryId } }),
      uniqueAddOnIds.length
        ? prisma.addOn.findMany({ where: { id: { in: uniqueAddOnIds } } })
        : Promise.resolve([]),
    ]);

    if (dbServices.length !== uniqueServiceIds.length) {
      return Response.json(
        { message: "Eine ausgewählte Leistung wurde nicht gefunden." },
        { status: 400 },
      );
    }

    if (!dbCategory) {
      return Response.json(
        { message: "Die Fahrzeuggrösse wurde nicht gefunden." },
        { status: 400 },
      );
    }

    if (dbAddOns.length !== uniqueAddOnIds.length) {
      return Response.json(
        { message: "Eine Zusatzleistung wurde nicht gefunden." },
        { status: 400 },
      );
    }

    const servicesByRequestOrder = uniqueServiceIds
      .map((id) => dbServices.find((service) => service.id === id))
      .filter((service): service is (typeof dbServices)[number] =>
        Boolean(service),
      );
    const allowedAddOnNames = new Set(
      servicesByRequestOrder.flatMap(
        (service) => allowedAddOnsByService[service.name] ?? [],
      ),
    );
    const hasInvalidAddOn = dbAddOns.some(
      (addOn) => !allowedAddOnNames.has(addOn.name),
    );

    if (hasInvalidAddOn) {
      return Response.json(
        {
          message:
            "Eine Zusatzleistung passt nicht zu den ausgewählten Leistungen.",
        },
        { status: 400 },
      );
    }

    const baseDuration = servicesByRequestOrder.reduce(
      (sum, service) => sum + service.durationMinutes,
      0,
    );
    const addOnsDuration = dbAddOns.reduce(
      (sum, item) => sum + item.additionalDuration,
      0,
    );
    const totalDuration = baseDuration + addOnsDuration;
    const endBookingDate = new Date(
      startBookingDate.getTime() + totalDuration * 60000,
    );

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        status: { not: "CANCELLED" },
        dateTime: { lt: endBookingDate },
        endTime: { gt: startBookingDate },
      },
    });

    const conflictingBlock = await prisma.availabilityBlock.findFirst({
      where: {
        startTime: { lt: endBookingDate },
        endTime: { gt: startBookingDate },
      },
    });

    if (conflictingBooking || conflictingBlock) {
      return Response.json(
        {
          message:
            "Dieser Termin ist leider gerade vergeben worden. Bitte wähle eine andere Zeit.",
        },
        { status: 400 },
      );
    }

    const serviceNames = servicesByRequestOrder
      .map((service) => service.name)
      .join(", ");
    const addOnNames =
      dbAddOns.map((addOn) => addOn.name).join(", ") || "Keine";
    const internalNotes = [
      notes,
      servicesByRequestOrder.length > 1
        ? `Ausgewählte Leistungen: ${serviceNames}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    let createdBookingId = "";
    const estimatedTotal =
      servicesByRequestOrder.reduce(
        (sum, service) => sum + service.basePrice,
        0,
      ) +
      dbCategory.priceModifier +
      dbAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    const newInvoiceNumber = invoiceNumber();

    try {
      const createdBooking = await prisma.booking.create({
        data: {
          dateTime: startBookingDate,
          endTime: endBookingDate,
          vehicleModel,
          notes: internalNotes,
          imageUrls: [],
          status: "PENDING",
          client: {
            connectOrCreate: {
              where: { email },
              create: { name, email, phone },
            },
          },
          service: { connect: { id: servicesByRequestOrder[0].id } },
          vehicleCategory: { connect: { id: vehicleCategoryId } },
          addOns: {
            connect: uniqueAddOnIds.map((id) => ({ id })),
          },
        },
      });
      createdBookingId = createdBooking.id;

      try {
        for (const service of servicesByRequestOrder) {
          await prisma.$executeRaw`
            INSERT INTO "_BookingToServices" ("A", "B")
            VALUES (${createdBooking.id}, ${service.id})
            ON CONFLICT DO NOTHING
          `;
        }
      } catch (joinError) {
        console.warn(
          "Booking service join table is not available yet:",
          joinError,
        );
      }
    } catch (createError) {
      if (isOverlapConstraintError(createError)) {
        return Response.json(
          {
            message:
              "Dieser Termin ist leider gerade vergeben worden. Bitte wähle eine andere Zeit.",
          },
          { status: 400 },
        );
      }

      throw createError;
    }

    const invoice = await prisma.invoice.create({
      data: {
        bookingId: createdBookingId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        emailOverride: email,
        invoiceNumber: newInvoiceNumber,
        language,
        sentAt: new Date(),
        status: "SENT",
        totalAmount: estimatedTotal,
        vatRate: 8.1,
      },
    });

    await prisma.invoiceItem.createMany({
      data: [
        ...servicesByRequestOrder.map((service) => ({
          description: service.name,
          invoiceId: invoice.id,
          pricePerUnit: service.basePrice,
          quantity: 1,
          unit: "Stk.",
        })),
        ...(dbCategory.priceModifier > 0
          ? [
              {
                description: `Fahrzeuggroesse: ${dbCategory.name}`,
                invoiceId: invoice.id,
                pricePerUnit: dbCategory.priceModifier,
                quantity: 1,
                unit: "Stk.",
              },
            ]
          : []),
        ...dbAddOns.map((addOn) => ({
          description: addOn.name,
          invoiceId: invoice.id,
          pricePerUnit: addOn.price,
          quantity: 1,
          unit: "Stk.",
        })),
      ],
    });

    const summary = [
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone}`,
      `Leistungen: ${serviceNames}`,
      `Fahrzeuggrösse: ${dbCategory.name}`,
      `Zusatzleistungen: ${addOnNames}`,
      `Fahrzeugmodell: ${vehicleModel}`,
      `Geschätzte Dauer: ${totalDuration} Minuten`,
      `Termin Start: ${startBookingDate.toLocaleString("de-CH", { timeZone: "Europe/Zurich" })}`,
      `Termin Ende: ${endBookingDate.toLocaleString("de-CH", { timeZone: "Europe/Zurich" })}`,
      `Hinweise/Nachricht: ${notes || "-"}`,
    ].join("\n");

    try {
      await sendEmail({
        to: ownerEmail,
        subject: `Neue Buchungsanfrage: ${serviceNames}`,
        text: `Eine neue Buchungsanfrage wurde eingereicht:\n\n${summary}`,
      });
    } catch (adminEmailError) {
      console.error("Failed to send admin alert email:", adminEmailError);
    }

    const localizedCustomerEmail = customerTexts(
      language,
      name,
      newInvoiceNumber,
      estimatedTotal,
      summary,
    );

    try {
      await sendEmail({
        to: email,
        subject: localizedCustomerEmail.subject,
        text: localizedCustomerEmail.body,
      });
    } catch (customerEmailError) {
      console.warn(
        "Customer confirmation email could not be sent:",
        customerEmailError instanceof Error
          ? customerEmailError.message
          : customerEmailError,
      );
    }

    return Response.json({ message: "Anfrage gesendet." });
  } catch (err) {
    console.error("Booking request failed:", err);
    return Response.json(
      { message: "Fehler beim Verarbeiten der Anfrage." },
      { status: 500 },
    );
  }
}
