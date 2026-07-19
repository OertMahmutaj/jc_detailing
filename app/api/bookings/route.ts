import { prisma } from "../../(admin)/admin/_lib/prisma";
import { Prisma } from "@prisma/client";
import {
  calculateServerBookingEnd,
  getServerScheduleHorizonEnd,
  isDateInsideScheduleBlock,
} from "../../lib/bookingServerTime";

const ownerEmail = process.env.BOOKING_OWNER_EMAIL ?? "oert64@gmail.com";
const fromEmail =
  process.env.BOOKING_FROM_EMAIL ?? "JC Detailing <onboarding@resend.dev>";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const bookingRateLimit = new Map<string, { count: number; resetAt: number }>();
const allowedAddOnsByService: Record<string, string[]> = {
  "Komplette Innenreinigung": ["Tierhaarentfernung"],
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
  address?: unknown;
  vehicleModel?: unknown;
  notes?: unknown;
  dateTime?: unknown;
  serviceId?: unknown;
  serviceIds?: unknown;
  vehicleCategoryId?: unknown;
  addOnIds?: unknown;
  language?: unknown;
  promoCode?: unknown;
  website?: unknown;
};

type InvoiceLanguage = "de" | "en" | "fr" | "it";
type BookingApiMessageKey =
  | "addOnNotFound"
  | "invalidAddOn"
  | "invalidContact"
  | "invalidDate"
  | "invalidTime"
  | "missingChoice"
  | "promoInvalid"
  | "promoPerClient"
  | "promoRetry"
  | "promoUsedUp"
  | "rateLimited"
  | "requestFailed"
  | "requestSent"
  | "serviceNotFound"
  | "slotTaken"
  | "vehicleNotFound";

const BOOKING_API_MESSAGES: Record<
  InvoiceLanguage,
  Record<BookingApiMessageKey, string>
> = {
  de: {
    addOnNotFound: "Eine Zusatzleistung wurde nicht gefunden.",
    invalidAddOn: "Eine Zusatzleistung passt nicht zu den ausgewﾃ､hlten Leistungen.",
    invalidContact: "Bitte prﾃｼfe Name, E-Mail, Telefon, Adresse und Fahrzeugmodell.",
    invalidDate: "Bitte wﾃ､hle einen gﾃｼltigen Termin in der Zukunft.",
    invalidTime: "Bitte wﾃ､hle eine Uhrzeit zwischen 08:00 und 13:30.",
    missingChoice: "Bitte wﾃ､hle mindestens eine Leistung und eine Fahrzeuggrﾃｶsse.",
    promoInvalid: "Dieser Promo-Code ist ungﾃｼltig oder abgelaufen.",
    promoPerClient: "Du hast diesen Promo-Code bereits maximal oft verwendet.",
    promoRetry: "Der Promo-Code oder Termin wurde gleichzeitig verwendet. Bitte versuche es erneut.",
    promoUsedUp: "Dieser Promo-Code wurde bereits vollstﾃ､ndig eingelﾃｶst.",
    rateLimited: "Zu viele Anfragen. Bitte versuche es in einigen Minuten erneut.",
    requestFailed: "Fehler beim Verarbeiten der Anfrage.",
    requestSent: "Anfrage gesendet.",
    serviceNotFound: "Eine ausgewﾃ､hlte Leistung wurde nicht gefunden.",
    slotTaken: "Dieser Termin ist leider gerade vergeben worden. Bitte wﾃ､hle eine andere Zeit.",
    vehicleNotFound: "Die Fahrzeuggrﾃｶsse wurde nicht gefunden.",
  },
  en: {
    addOnNotFound: "One selected add-on could not be found.",
    invalidAddOn: "One selected add-on does not match the selected services.",
    invalidContact: "Please check your name, email, phone, address, and vehicle model.",
    invalidDate: "Please choose a valid appointment in the future.",
    invalidTime: "Please choose a time between 08:00 and 13:30.",
    missingChoice: "Please choose at least one service and a vehicle size.",
    promoInvalid: "This promo code is invalid or has expired.",
    promoPerClient: "You have already used this promo code the maximum number of times.",
    promoRetry: "The promo code or appointment was used at the same time. Please try again.",
    promoUsedUp: "This promo code has already been fully used.",
    rateLimited: "Too many requests. Please try again in a few minutes.",
    requestFailed: "The request could not be processed.",
    requestSent: "Request sent.",
    serviceNotFound: "One selected service could not be found.",
    slotTaken: "This appointment has just been taken. Please choose another time.",
    vehicleNotFound: "The vehicle size could not be found.",
  },
  fr: {
    addOnNotFound: "Une option sﾃｩlectionnﾃｩe est introuvable.",
    invalidAddOn: "Une option sﾃｩlectionnﾃｩe ne correspond pas aux services choisis.",
    invalidContact: "Veuillez vﾃｩrifier le nom, l'e-mail, le tﾃｩlﾃｩphone, l'adresse et le modﾃｨle du vﾃｩhicule.",
    invalidDate: "Veuillez choisir un rendez-vous valide dans le futur.",
    invalidTime: "Veuillez choisir une heure entre 08:00 et 13:30.",
    missingChoice: "Veuillez choisir au moins un service et une taille de vﾃｩhicule.",
    promoInvalid: "Ce code promo est invalide ou a expirﾃｩ.",
    promoPerClient: "Vous avez dﾃｩjﾃ utilisﾃｩ ce code promo le nombre maximal de fois.",
    promoRetry: "Le code promo ou le rendez-vous a ﾃｩtﾃｩ utilisﾃｩ en mﾃｪme temps. Veuillez rﾃｩessayer.",
    promoUsedUp: "Ce code promo a dﾃｩjﾃ ﾃｩtﾃｩ entiﾃｨrement utilisﾃｩ.",
    rateLimited: "Trop de demandes. Veuillez rﾃｩessayer dans quelques minutes.",
    requestFailed: "La demande n'a pas pu ﾃｪtre traitﾃｩe.",
    requestSent: "Demande envoyﾃｩe.",
    serviceNotFound: "Un service sﾃｩlectionnﾃｩ est introuvable.",
    slotTaken: "Ce rendez-vous vient d'ﾃｪtre rﾃｩservﾃｩ. Veuillez choisir une autre heure.",
    vehicleNotFound: "La taille du vﾃｩhicule est introuvable.",
  },
  it: {
    addOnNotFound: "Un extra selezionato non ﾃｨ stato trovato.",
    invalidAddOn: "Un extra selezionato non corrisponde ai servizi scelti.",
    invalidContact: "Controlla nome, e-mail, telefono, indirizzo e modello del veicolo.",
    invalidDate: "Scegli un appuntamento valido nel futuro.",
    invalidTime: "Scegli un orario tra le 08:00 e le 13:30.",
    missingChoice: "Scegli almeno un servizio e una dimensione del veicolo.",
    promoInvalid: "Questo codice promo non ﾃｨ valido o ﾃｨ scaduto.",
    promoPerClient: "Hai giﾃ usato questo codice promo il numero massimo di volte.",
    promoRetry: "Il codice promo o l'appuntamento ﾃｨ stato usato nello stesso momento. Riprova.",
    promoUsedUp: "Questo codice promo ﾃｨ giﾃ stato utilizzato completamente.",
    rateLimited: "Troppe richieste. Riprova tra qualche minuto.",
    requestFailed: "La richiesta non puﾃｲ essere elaborata.",
    requestSent: "Richiesta inviata.",
    serviceNotFound: "Un servizio selezionato non ﾃｨ stato trovato.",
    slotTaken: "Questo appuntamento ﾃｨ appena stato prenotato. Scegli un altro orario.",
    vehicleNotFound: "La dimensione del veicolo non ﾃｨ stata trovata.",
  },
};

function bookingApiMessage(
  language: InvoiceLanguage,
  key: BookingApiMessageKey,
) {
  return BOOKING_API_MESSAGES[language][key];
}

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

function normalizePromoCode(value: unknown) {
  return cleanText(value, 40).replace(/\s+/g, "").toUpperCase();
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

class PromoCodeValidationError extends Error {
  constructor(readonly key: BookingApiMessageKey) {
    super(key);
  }
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
  const range = `${formatEmailTime(start)}窶・{formatEmailTime(end)}`;

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
        "Danke fﾃｼr deine Anfrage bei JC Detailing. Deine Terminanfrage ist bei uns eingegangen.",
      notice:
        "Wichtig: Der Termin ist noch nicht bestﾃ､tigt. Wir prﾃｼfen deine Anfrage und senden dir so schnell wie mﾃｶglich eine separate Terminbestﾃ､tigung per E-Mail.",
      labels: {
        date: "Datum",
        time: "Uhrzeit",
        services: "Leistung",
        vehicle: "Fahrzeug",
        category: "Fahrzeuggrﾃｶsse",
        addOns: "Zusatzleistungen",
        duration: "Geschﾃ､tzte Dauer",
        name: "Name",
        email: "E-Mail",
        phone: "Telefon",
        notes: "Hinweise",
      },
      greeting: "Freundliche Grﾃｼsse",
      question:
        "Bei Fragen oder ﾃ・derungen erreichst du uns per Telefon, WhatsApp oder E-Mail.",
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
      badge: "Demande reﾃｧue",
      subject: "JC Detailing - Demande de rendez-vous reﾃｧue",
      intro:
        "Merci pour votre demande chez JC Detailing. Nous avons bien reﾃｧu votre demande de rendez-vous.",
      notice:
        "Important : le rendez-vous n窶册st pas encore confirmﾃｩ. Nous vﾃｩrifions votre demande et vous enverrons une confirmation sﾃｩparﾃｩe par e-mail dﾃｨs que possible.",
      labels: {
        date: "Date",
        time: "Heure",
        services: "Service",
        vehicle: "Vﾃｩhicule",
        category: "Taille du vﾃｩhicule",
        addOns: "Services supplﾃｩmentaires",
        duration: "Durﾃｩe estimﾃｩe",
        name: "Nom",
        email: "E-mail",
        phone: "Tﾃｩlﾃｩphone",
        notes: "Remarques",
      },
      greeting: "Meilleures salutations",
      question:
        "Pour toute question ou modification, vous pouvez nous contacter par tﾃｩlﾃｩphone, WhatsApp ou e-mail.",
    },
    it: {
      badge: "Richiesta ricevuta",
      subject: "JC Detailing - Richiesta appuntamento ricevuta",
      intro:
        "Grazie per la tua richiesta presso JC Detailing. Abbiamo ricevuto la tua richiesta di appuntamento.",
      notice:
        "Importante: l窶兮ppuntamento non ﾃｨ ancora confermato. Controlleremo la tua richiesta e ti invieremo una conferma separata via e-mail il prima possibile.",
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
                      Luzern ﾂｷ Wauwil ﾂｷ Switzerland
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
                    JC Detailing ﾂｷ Sternmatt 4, 6242 Wauwil ﾂｷ +41 77 268 33 88 ﾂｷ jcdetailinglucerne@gmail.com
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
    ["Uhrzeit", `${formatEmailTime(dateTime)}窶・{formatEmailTime(endTime)} Uhr`],
    ["Leistung", services],
    ["Fahrzeug", vehicleModel],
    ["Fahrzeuggrﾃｶsse", vehicleCategory],
    ["Zusatzleistungen", addOns],
    ["Geschﾃ､tzte Dauer", formatEmailDuration(durationMinutes)],
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
    `Buchung ﾃｶffnen: ${bookingUrl}\n` +
    `Bestﾃ､tigen: ${confirmUrl}\n` +
    `Termin ﾃ､ndern: ${rescheduleUrl}\n` +
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
                      Eine neue Terminanfrage wurde ﾃｼber die Website eingereicht.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 24px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
                      <tr>
                        <td style="padding:0 6px 10px 0;width:50%;">
                          <a href="${bookingUrl}" style="${buttonStyle}background:#f15a24;color:#ffffff;">
                            Buchung ﾃｶffnen
                          </a>
                        </td>
                        <td style="padding:0 0 10px 6px;width:50%;">
                          <a href="${confirmUrl}" style="${buttonStyle}background:#dcfce7;color:#166534;border:1px solid #86efac;">
                            Bestﾃ､tigen
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 6px 0 0;width:50%;">
                          <a href="${rescheduleUrl}" style="${buttonStyle}background:#dbeafe;color:#1d4ed8;border:1px solid #93c5fd;">
                            Termin ﾃ､ndern
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
                        Die Buttons ﾃｶffnen die Admin-Seite. Die Buchung wird nicht direkt aus der E-Mail geﾃ､ndert.
                      </p>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${detailsHtml}
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.7;text-align:center;">
                    JC Detailing Admin ﾂｷ ${escapeHtml(bookingId)}
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
  let responseLanguage: InvoiceLanguage = "de";

  try {
    const body = (await request.json()) as BookingPayload;
    const language = cleanLanguage(body.language);
    responseLanguage = language;
    const clientIp = getClientIp(request);

    if (isRateLimited(clientIp)) {
      return Response.json(
        { message: bookingApiMessage(language, "rateLimited") },
        { status: 429 },
      );
    }

    if (cleanText(body.website, 120)) {
      return Response.json({ message: bookingApiMessage(language, "requestSent") });
    }

    const name = cleanText(body.name, 100);
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 40);
    const address = cleanText(body.address, 300);
    const vehicleModel = cleanText(body.vehicleModel, 120);
    const notes = cleanText(body.notes, 1200);
    const vehicleCategoryId = cleanText(body.vehicleCategoryId, 80);
    const requestedPromoCode = normalizePromoCode(body.promoCode);
    const addOnIds = cleanIdArray(body.addOnIds);
    const serviceIds = cleanIdArray(body.serviceIds).length
      ? cleanIdArray(body.serviceIds)
      : cleanIdArray(
          typeof body.serviceId === "string" ? [body.serviceId] : [],
        );
    const startBookingDate =
      typeof body.dateTime === "string" ? new Date(body.dateTime) : null;

    if (!name || !emailPattern.test(email) || !phone || !address || !vehicleModel) {
      return Response.json(
        { message: bookingApiMessage(language, "invalidContact") },
        { status: 400 },
      );
    }

    if (
      !startBookingDate ||
      Number.isNaN(startBookingDate.getTime()) ||
      startBookingDate.getTime() <= Date.now()
    ) {
      return Response.json(
        { message: bookingApiMessage(language, "invalidDate") },
        { status: 400 },
      );
    }

    const startMinutes = getZurichMinutes(startBookingDate);

    if (startMinutes < 8 * 60 || startMinutes > 13 * 60 + 30) {
      return Response.json(
        { message: bookingApiMessage(language, "invalidTime") },
        { status: 400 },
      );
    }

    if (!vehicleCategoryId || serviceIds.length === 0) {
      return Response.json(
        { message: bookingApiMessage(language, "missingChoice") },
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
        { message: bookingApiMessage(language, "serviceNotFound") },
        { status: 400 },
      );
    }

    if (!dbCategory) {
      return Response.json(
        { message: bookingApiMessage(language, "vehicleNotFound") },
        { status: 400 },
      );
    }

    if (dbAddOns.length !== uniqueAddOnIds.length) {
      return Response.json(
        { message: bookingApiMessage(language, "addOnNotFound") },
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
        { message: bookingApiMessage(language, "invalidAddOn") },
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
    const scheduleHorizonEnd = getServerScheduleHorizonEnd(
      startBookingDate,
      totalDuration,
    );
    const availabilityBlocks = await prisma.availabilityBlock.findMany({
      where: {
        startTime: { lt: scheduleHorizonEnd },
        endTime: { gt: startBookingDate },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });
    const endBookingDate = calculateServerBookingEnd(
      startBookingDate,
      totalDuration,
      availabilityBlocks,
    );

    if (
      !endBookingDate ||
      isDateInsideScheduleBlock(startBookingDate, availabilityBlocks)
    ) {
      return Response.json(
        { message: bookingApiMessage(language, "slotTaken") },
        { status: 400 },
      );
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        status: { not: "CANCELLED" },
        dateTime: { lt: endBookingDate },
        endTime: { gt: startBookingDate },
      },
    });

    if (conflictingBooking) {
      return Response.json(
        { message: bookingApiMessage(language, "slotTaken") },
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
        ? `Ausgewﾃ､hlte Leistungen: ${serviceNames}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    let createdBookingId = "";
    const estimatedSubtotal = roundCurrency(
      servicesByRequestOrder.reduce(
        (sum, service) => sum + service.basePrice,
        0,
      ) +
      dbCategory.priceModifier +
      dbAddOns.reduce((sum, addOn) => sum + addOn.price, 0),
    );
    let appliedPromoCode = "";
    let promoDiscountPercent = 0;
    let promoDiscountAmount = 0;
    // const newInvoiceNumber = invoiceNumber();

    try {
      const createdBooking = await prisma.$transaction(async (tx) => {
        const client = await tx.client.upsert({
          where: { email },
          update: { address, name, phone },
          create: { address, name, email, phone },
        });

        let promoCodeId: string | null = null;

        if (requestedPromoCode) {
          const promo = await tx.promoCode.findUnique({
            where: { code: requestedPromoCode },
          });
          const now = new Date();

          if (!promo || !promo.isActive || (promo.expiresAt && promo.expiresAt <= now)) {
            throw new PromoCodeValidationError("promoInvalid");
          }

          const [totalUses, clientUses] = await Promise.all([
            tx.promoCodeUsage.count({ where: { promoCodeId: promo.id } }),
            tx.promoCodeUsage.count({
              where: { clientId: client.id, promoCodeId: promo.id },
            }),
          ]);

          if (totalUses >= promo.maxUses) {
            throw new PromoCodeValidationError("promoUsedUp");
          }

          if (clientUses >= promo.maxUsesPerClient) {
            throw new PromoCodeValidationError("promoPerClient");
          }

          promoCodeId = promo.id;
          appliedPromoCode = promo.code;
          promoDiscountPercent = promo.discountPercent;
          promoDiscountAmount = roundCurrency(
            estimatedSubtotal * (promo.discountPercent / 100),
          );
        }

        const booking = await tx.booking.create({
          data: {
            dateTime: startBookingDate,
            endTime: endBookingDate,
            language,
            vehicleModel,
            notes: internalNotes,
            imageUrls: [],
            status: "PENDING",
            clientId: client.id,
            serviceId: servicesByRequestOrder[0].id,
            vehicleCategoryId,
            addOns: {
              connect: uniqueAddOnIds.map((id) => ({ id })),
            },
            promoCodeId,
            promoDiscountPercent: promoCodeId ? promoDiscountPercent : null,
            promoDiscountAmount,
          },
        });

        for (const service of servicesByRequestOrder) {
          await tx.$executeRaw`
            INSERT INTO "_BookingToServices" ("A", "B")
            VALUES (${booking.id}, ${service.id})
            ON CONFLICT DO NOTHING
          `;
        }

        if (promoCodeId) {
          await tx.promoCodeUsage.create({
            data: {
              bookingId: booking.id,
              clientId: client.id,
              promoCodeId,
              discountAmount: promoDiscountAmount,
              discountPercent: promoDiscountPercent,
            },
          });
        }

        return booking;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

      createdBookingId = createdBooking.id;
    } catch (createError) {
      if (createError instanceof PromoCodeValidationError) {
        return Response.json(
          { message: bookingApiMessage(language, createError.key) },
          { status: 400 },
        );
      }

      if (isOverlapConstraintError(createError)) {
        return Response.json(
          { message: bookingApiMessage(language, "slotTaken") },
          { status: 400 },
        );
      }

      if (
        createError &&
        typeof createError === "object" &&
        "code" in createError &&
        createError.code === "P2034"
      ) {
        return Response.json(
          { message: bookingApiMessage(language, "promoRetry") },
          { status: 409 },
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
    //     vatRate: 0,
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
      `Adresse: ${address}`,
      `Leistungen: ${serviceNames}`,
      `Fahrzeuggrﾃｶsse: ${dbCategory.name}`,
      `Zusatzleistungen: ${addOnNames}`,
      `Fahrzeugmodell: ${vehicleModel}`,
      `Geschﾃ､tzte Dauer: ${totalDuration} Minuten`,
      `Zwischensumme: CHF ${estimatedSubtotal.toFixed(2)}`,
      ...(appliedPromoCode
        ? [`Promo-Code: ${appliedPromoCode} (${promoDiscountPercent}%, -CHF ${promoDiscountAmount.toFixed(2)})`]
        : []),
      `Geschﾃ､tzter Gesamtpreis: CHF ${roundCurrency(estimatedSubtotal - promoDiscountAmount).toFixed(2)}`,
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

    return Response.json({
      message: bookingApiMessage(language, "requestSent"),
      pricing: {
        subtotal: estimatedSubtotal,
        promoCode: appliedPromoCode || null,
        discountPercent: promoDiscountPercent,
        discountAmount: promoDiscountAmount,
        total: roundCurrency(estimatedSubtotal - promoDiscountAmount),
      },
    });
  } catch (err) {
    console.error("Booking request failed:", err);
    return Response.json(
      { message: bookingApiMessage(responseLanguage, "requestFailed") },
      { status: 500 },
    );
  }
}
