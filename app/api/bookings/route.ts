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

type BookingRequestEmailData = {
  addOns: string;
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  dateTime: Date;
  durationMinutes: number;
  endTime: Date;
  notes?: string | null;
  services: string;
  vehicleCategory: string;
  vehicleModel: string;
};

type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jcdetailing.ch"
  ).replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatEmailDate(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(value);
}

function formatEmailTime(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(value);
}

function formatEmailTimeRange(
  language: InvoiceLanguage,
  start: Date,
  end: Date,
) {
  const range = `${formatEmailTime(start)}–${formatEmailTime(end)}`;

  return language === "de" ? `${range} Uhr` : range;
}

function formatEmailDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (!hours) return `${rest} Min.`;
  if (!rest) return `${hours}h`;

  return `${hours}h ${rest} Min.`;
}

function bookingRequestCopy(language: InvoiceLanguage) {
  const copy = {
    de: {
      badge: "Terminanfrage erhalten",
      subject: "JC Detailing - Terminanfrage erhalten",
      intro:
        "Danke für deine Anfrage bei JC Detailing. Deine Terminanfrage ist bei uns eingegangen.",
      notice:
        "Wichtig: Der Termin ist noch nicht bestätigt. Wir prüfen deine Anfrage und senden dir so schnell wie möglich eine separate Terminbestätigung per E-Mail.",
      labels: {
        date: "Datum",
        time: "Uhrzeit",
        services: "Leistung",
        vehicle: "Fahrzeug",
        category: "Fahrzeuggrösse",
        addOns: "Zusatzleistungen",
        duration: "Geschätzte Dauer",
        name: "Name",
        email: "E-Mail",
        phone: "Telefon",
        notes: "Hinweise",
      },
      greeting: "Freundliche Grüsse",
      question:
        "Bei Fragen oder Änderungen erreichst du uns per Telefon, WhatsApp oder E-Mail.",
    },
    en: {
      badge: "Request received",
      subject: "JC Detailing - Appointment request received",
      intro:
        "Thank you for your request with JC Detailing. We have received your appointment request.",
      notice:
        "Important: Your appointment is not confirmed yet. We will review your request and send you a separate confirmation email as soon as possible.",
      labels: {
        date: "Date",
        time: "Time",
        services: "Service",
        vehicle: "Vehicle",
        category: "Vehicle size",
        addOns: "Add-ons",
        duration: "Estimated duration",
        name: "Name",
        email: "Email",
        phone: "Phone",
        notes: "Notes",
      },
      greeting: "Kind regards",
      question:
        "For questions or changes, you can reach us by phone, WhatsApp or email.",
    },
    fr: {
      badge: "Demande reçue",
      subject: "JC Detailing - Demande de rendez-vous reçue",
      intro:
        "Merci pour votre demande chez JC Detailing. Nous avons bien reçu votre demande de rendez-vous.",
      notice:
        "Important : le rendez-vous n’est pas encore confirmé. Nous vérifions votre demande et vous enverrons une confirmation séparée par e-mail dès que possible.",
      labels: {
        date: "Date",
        time: "Heure",
        services: "Service",
        vehicle: "Véhicule",
        category: "Taille du véhicule",
        addOns: "Services supplémentaires",
        duration: "Durée estimée",
        name: "Nom",
        email: "E-mail",
        phone: "Téléphone",
        notes: "Remarques",
      },
      greeting: "Meilleures salutations",
      question:
        "Pour toute question ou modification, vous pouvez nous contacter par téléphone, WhatsApp ou e-mail.",
    },
    it: {
      badge: "Richiesta ricevuta",
      subject: "JC Detailing - Richiesta appuntamento ricevuta",
      intro:
        "Grazie per la tua richiesta presso JC Detailing. Abbiamo ricevuto la tua richiesta di appuntamento.",
      notice:
        "Importante: l’appuntamento non è ancora confermato. Controlleremo la tua richiesta e ti invieremo una conferma separata via e-mail il prima possibile.",
      labels: {
        date: "Data",
        time: "Orario",
        services: "Servizio",
        vehicle: "Veicolo",
        category: "Dimensione veicolo",
        addOns: "Servizi aggiuntivi",
        duration: "Durata stimata",
        name: "Nome",
        email: "E-mail",
        phone: "Telefono",
        notes: "Note",
      },
      greeting: "Cordiali saluti",
      question:
        "Per domande o modifiche puoi contattarci via telefono, WhatsApp o e-mail.",
    },
  } as const;

  return copy[language];
}

function buildBookingRequestRows(
  language: InvoiceLanguage,
  details: BookingRequestEmailData,
) {
  const copy = bookingRequestCopy(language);

  const rows = [
    [copy.labels.date, formatEmailDate(details.dateTime)],
    [
      copy.labels.time,
      formatEmailTimeRange(language, details.dateTime, details.endTime),
    ],
    [copy.labels.services, details.services],
    [copy.labels.vehicle, details.vehicleModel],
    [copy.labels.category, details.vehicleCategory],
    [copy.labels.addOns, details.addOns],
    [copy.labels.duration, formatEmailDuration(details.durationMinutes)],
    [copy.labels.name, details.clientName],
    [copy.labels.email, details.clientEmail],
    [copy.labels.phone, details.clientPhone],
  ];

  if (details.notes?.trim()) {
    rows.push([copy.labels.notes, details.notes.trim()]);
  }

  return rows;
}

function bookingRequestDetailsText(
  language: InvoiceLanguage,
  details: BookingRequestEmailData,
) {
  return buildBookingRequestRows(language, details)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function bookingRequestDetailsHtml(
  language: InvoiceLanguage,
  details: BookingRequestEmailData,
) {
  return buildBookingRequestRows(language, details)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:13px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:13px 0;color:#111111;font-size:14px;font-weight:800;text-align:right;border-bottom:1px solid #e5e7eb;">
            ${escapeHtml(value)}
          </td>
        </tr>
      `,
    )
    .join("");
}

function bookingRequestReceivedEmail(
  language: InvoiceLanguage,
  details: BookingRequestEmailData,
): EmailContent {
  const copy = bookingRequestCopy(language);

  const text =
    `${copy.subject}\n\n` +
    `${copy.intro}\n\n` +
    `${copy.notice}\n\n` +
    `${bookingRequestDetailsText(language, details)}\n\n` +
    `${copy.question}\n\n` +
    `${copy.greeting}\nJC Detailing\n` +
    "Sternmatt 4, 6242 Wauwil\n" +
    "+41 77 268 33 88\n" +
    "jcdetailinglucerne@gmail.com";

  const html = `
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
                      ${escapeHtml(copy.badge)}
                    </div>

                    <h1 style="margin:18px 0 10px;font-size:26px;line-height:1.2;color:#111111;">
                      ${escapeHtml(copy.subject)}
                    </h1>

                    <p style="margin:0 auto;max-width:460px;color:#4b5563;font-size:15px;line-height:1.7;">
                      ${escapeHtml(copy.intro)}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 24px 24px;">
                    <div style="margin:0 0 24px;padding:16px;border-radius:12px;background:#fff8db;border:1px solid #f1d675;">
                      <p style="margin:0;color:#3f3520;font-size:14px;line-height:1.7;">
                        ${escapeHtml(copy.notice)}
                      </p>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${bookingRequestDetailsHtml(language, details)}
                    </table>

                    <div style="margin-top:26px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e5e7eb;">
                      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
                        ${escapeHtml(copy.question)}
                      </p>
                    </div>

                    <p style="margin:26px 0 0;color:#111111;font-size:15px;line-height:1.7;">
                      ${escapeHtml(copy.greeting)}<br />
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

  return {
    subject: copy.subject,
    text,
    html,
  };
}

function adminBookingEmail({
  addOns,
  bookingId,
  clientEmail,
  clientName,
  clientPhone,
  dateTime,
  durationMinutes,
  endTime,
  notes,
  services,
  vehicleCategory,
  vehicleModel,
}: BookingRequestEmailData & {
  bookingId: string;
}): EmailContent {
  const baseUrl = siteUrl();
  const bookingUrl = `${baseUrl}/admin/bookings/${bookingId}`;
  const confirmUrl = `${bookingUrl}?action=confirm`;
  const rescheduleUrl = `${bookingUrl}?action=reschedule`;
  const cancelUrl = `${bookingUrl}?action=cancel`;

  const rows = [
    ["Name", clientName],
    ["E-Mail", clientEmail],
    ["Telefon", clientPhone],
    ["Datum", formatEmailDate(dateTime)],
    ["Uhrzeit", `${formatEmailTime(dateTime)}–${formatEmailTime(endTime)} Uhr`],
    ["Leistung", services],
    ["Fahrzeug", vehicleModel],
    ["Fahrzeuggrösse", vehicleCategory],
    ["Zusatzleistungen", addOns],
    ["Geschätzte Dauer", formatEmailDuration(durationMinutes)],
  ];

  if (notes?.trim()) {
    rows.push(["Hinweise", notes.trim()]);
  }

  const detailsText = rows
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  const detailsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:13px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:13px 0;color:#111111;font-size:14px;font-weight:800;text-align:right;border-bottom:1px solid #e5e7eb;">
            ${escapeHtml(value)}
          </td>
        </tr>
      `,
    )
    .join("");

  const subject = `Neue Buchungsanfrage: ${services}`;

  const text =
    `${subject}\n\n` +
    `${detailsText}\n\n` +
    `Buchung öffnen: ${bookingUrl}\n` +
    `Bestätigen: ${confirmUrl}\n` +
    `Termin ändern: ${rescheduleUrl}\n` +
    `Stornieren: ${cancelUrl}`;

  const buttonStyle =
    "display:block;padding:12px 14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:800;line-height:1.2;text-align:center;";

  const html = `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f5efe1;font-family:Arial,Helvetica,sans-serif;color:#111111;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5efe1;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border:1px solid #ded6c8;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:26px 24px 20px;text-align:center;background:#ffffff;border-bottom:1px solid #ece4d6;">
                    <div style="font-size:22px;font-weight:800;color:#111111;letter-spacing:.02em;">
                      JC Detailing Admin
                    </div>

                    <div style="display:inline-block;margin-top:20px;padding:7px 12px;border-radius:999px;background:#f1d675;color:#111111;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">
                      Neue Buchungsanfrage
                    </div>

                    <h1 style="margin:18px 0 10px;font-size:26px;line-height:1.2;color:#111111;">
                      Neue Anfrage von ${escapeHtml(clientName)}
                    </h1>

                    <p style="margin:0 auto;max-width:460px;color:#4b5563;font-size:15px;line-height:1.7;">
                      Eine neue Terminanfrage wurde über die Website eingereicht.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 24px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
                      <tr>
                        <td style="padding:0 6px 10px 0;width:50%;">
                          <a href="${bookingUrl}" style="${buttonStyle}background:#f15a24;color:#ffffff;">
                            Buchung öffnen
                          </a>
                        </td>
                        <td style="padding:0 0 10px 6px;width:50%;">
                          <a href="${confirmUrl}" style="${buttonStyle}background:#dcfce7;color:#166534;border:1px solid #86efac;">
                            Bestätigen
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 6px 0 0;width:50%;">
                          <a href="${rescheduleUrl}" style="${buttonStyle}background:#dbeafe;color:#1d4ed8;border:1px solid #93c5fd;">
                            Termin ändern
                          </a>
                        </td>
                        <td style="padding:0 0 0 6px;width:50%;">
                          <a href="${cancelUrl}" style="${buttonStyle}background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">
                            Stornieren
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="margin:0 0 24px;padding:16px;border-radius:12px;background:#fff8db;border:1px solid #f1d675;">
                      <p style="margin:0;color:#3f3520;font-size:14px;line-height:1.7;">
                        Die Buttons öffnen die Admin-Seite. Die Buchung wird nicht direkt aus der E-Mail geändert.
                      </p>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${detailsHtml}
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.7;text-align:center;">
                    JC Detailing Admin · ${escapeHtml(bookingId)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return {
    subject,
    text,
    html,
  };
}
async function sendEmail({
  html,
  subject,
  text,
  to,
}: {
  html?: string;
  subject: string;
  text: string;
  to: string;
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
      ...(html ? { html } : {}),
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
    // const newInvoiceNumber = invoiceNumber();

    try {
      const createdBooking = await prisma.booking.create({
        data: {
          dateTime: startBookingDate,
          endTime: endBookingDate,
          language,
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

    // const invoice = await prisma.invoice.create({
    //   data: {
    //     bookingId: createdBookingId,
    //     dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    //     emailOverride: email,
    //     invoiceNumber: newInvoiceNumber,
    //     language,
    //     sentAt: new Date(),
    //     status: "SENT",
    //     totalAmount: estimatedTotal,
    //     vatRate: 8.1,
    //   },
    // });

    // await prisma.invoiceItem.createMany({
    //   data: [
    //     ...servicesByRequestOrder.map((service) => ({
    //       description: service.name,
    //       invoiceId: invoice.id,
    //       pricePerUnit: service.basePrice,
    //       quantity: 1,
    //       unit: "Stk.",
    //     })),
    //     ...(dbCategory.priceModifier > 0
    //       ? [
    //           {
    //             description: `Fahrzeuggroesse: ${dbCategory.name}`,
    //             invoiceId: invoice.id,
    //             pricePerUnit: dbCategory.priceModifier,
    //             quantity: 1,
    //             unit: "Stk.",
    //           },
    //         ]
    //       : []),
    //     ...dbAddOns.map((addOn) => ({
    //       description: addOn.name,
    //       invoiceId: invoice.id,
    //       pricePerUnit: addOn.price,
    //       quantity: 1,
    //       unit: "Stk.",
    //     })),
    //   ],
    // });

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

    const adminEmail = adminBookingEmail({
      addOns: addOnNames,
      bookingId: createdBookingId,
      clientEmail: email,
      clientName: name,
      clientPhone: phone,
      dateTime: startBookingDate,
      durationMinutes: totalDuration,
      endTime: endBookingDate,
      notes: notes || null,
      services: serviceNames,
      vehicleCategory: dbCategory.name,
      vehicleModel,
    });

    try {
      await sendEmail({
        to: ownerEmail,
        subject: adminEmail.subject,
        text: adminEmail.text,
        html: adminEmail.html,
      });
    } catch (adminEmailError) {
      console.error("Failed to send admin alert email:", adminEmailError);
    }

    const customerRequestEmail = bookingRequestReceivedEmail(language, {
      addOns: addOnNames,
      clientEmail: email,
      clientName: name,
      clientPhone: phone,
      dateTime: startBookingDate,
      durationMinutes: totalDuration,
      endTime: endBookingDate,
      notes: notes || null,
      services: serviceNames,
      vehicleCategory: dbCategory.name,
      vehicleModel,
    });

    try {
      await sendEmail({
        to: email,
        subject: customerRequestEmail.subject,
        text: customerRequestEmail.text,
        html: customerRequestEmail.html,
      });
    } catch (customerEmailError) {
      console.warn(
        "Customer request email could not be sent:",
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
