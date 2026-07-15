"use server";

import { BookingStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";

type InvoiceLanguage = "de" | "en" | "fr" | "it";

type ActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

function success(message: string): ActionResult {
  return {
    success: true,
    message,
  };
}

function failure(error: string): ActionResult {
  return {
    success: false,
    error,
  };
}

function getRequiredValue(formData: FormData, fieldName: string) {
  const value = String(formData.get(fieldName) ?? "").trim();

  if (!value) {
    throw new Error(`${fieldName} is required.`);
  }

  return value;
}

function getSelectedIds(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function isBookingStatus(value: string): value is BookingStatus {
  return ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(value);
}

function bookingStatusLabel(status: BookingStatus) {
  const labels: Record<BookingStatus, string> = {
    PENDING: "Offen",
    CONFIRMED: "Bestätigt",
    COMPLETED: "Abgeschlossen",
    CANCELLED: "Storniert",
  };

  return labels[status];
}

function readablePrismaError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Ein Datensatz mit diesen Angaben existiert bereits.";
  }

  return "Die Änderung konnte nicht gespeichert werden. Bitte versuche es erneut.";
}

function normalizeLanguage(value: unknown): InvoiceLanguage {
  return value === "en" || value === "fr" || value === "it" ? value : "de";
}

function cleanLanguage(value: FormDataEntryValue | null): InvoiceLanguage {
  return normalizeLanguage(value);
}

function buildDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

// function invoiceNumber() {
//   return `RE-${Date.now().toString().slice(-6)}-${Math.floor(
//     100 + Math.random() * 900,
//   )}`;
// }

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(value);
}

function sameIds(first: string[], second: string[]) {
  if (first.length !== second.length) {
    return false;
  }

  const firstSorted = [...first].sort();
  const secondSorted = [...second].sort();

  return firstSorted.every((id, index) => id === secondSorted[index]);
}

function getNameList(items: { name: string }[]) {
  return items.length ? items.map((item) => item.name).join(", ") : "Keine";
}

type BookingEmailData = {
  addOns: string;
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  dateTime: Date;
  endTime: Date;
  notes?: string | null;
  services: string;
  totalAmount?: number;
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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(value);
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(value);
}

function formatCurrency(value: number) {
  return `CHF ${value.toFixed(2)}`;
}

function buildBookingRows(details: BookingEmailData) {
  const rows = [
    ["Datum", formatDate(details.dateTime)],
    [
      "Uhrzeit",
      `${formatTime(details.dateTime)}–${formatTime(details.endTime)} Uhr`,
    ],
    ["Leistung", details.services],
    ["Fahrzeug", details.vehicleModel],
    ["Fahrzeuggrösse", details.vehicleCategory],
    ["Zusatzleistungen", details.addOns],
    ["Name", details.clientName],
    ["E-Mail", details.clientEmail],
    ["Telefon", details.clientPhone],
  ];

  if (typeof details.totalAmount === "number") {
    rows.push(["Geschätzter Preis", formatCurrency(details.totalAmount)]);
  }

  if (details.notes?.trim()) {
    rows.push(["Hinweise", details.notes.trim()]);
  }

  return rows;
}

function bookingDetailsText(details: BookingEmailData) {
  return buildBookingRows(details)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function bookingDetailsHtml(details: BookingEmailData) {
  return buildBookingRows(details)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:12px 0;color:#8f98a8;font-size:14px;border-bottom:1px solid #202633;">${escapeHtml(label)}</td>
          <td style="padding:12px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #202633;">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");
}
function bookingDetailsHtmlLight(details: BookingEmailData) {
  return buildBookingRows(details)
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
function bookingEmailUiCopy(language: InvoiceLanguage) {
  const copy = {
    de: {
      questions:
        "Bei Fragen oder Änderungen erreichen Sie uns per Telefon, WhatsApp oder E-Mail.",
      greeting: "Freundliche Grüsse",
      footer:
        "JC Detailing · Sternmatt 4, 6242 Wauwil · +41 77 268 33 88 · jcdetailinglucerne@gmail.com",
    },
    en: {
      questions:
        "For questions or changes, you can reach us by phone, WhatsApp or email.",
      greeting: "Kind regards",
      footer:
        "JC Detailing · Sternmatt 4, 6242 Wauwil · +41 77 268 33 88 · jcdetailinglucerne@gmail.com",
    },
    fr: {
      questions:
        "Pour toute question ou modification, vous pouvez nous joindre par téléphone, WhatsApp ou e-mail.",
      greeting: "Meilleures salutations",
      footer:
        "JC Detailing · Sternmatt 4, 6242 Wauwil · +41 77 268 33 88 · jcdetailinglucerne@gmail.com",
    },
    it: {
      questions:
        "Per domande o modifiche, puoi contattarci per telefono, WhatsApp o e-mail.",
      greeting: "Cordiali saluti",
      footer:
        "JC Detailing · Sternmatt 4, 6242 Wauwil · +41 77 268 33 88 · jcdetailinglucerne@gmail.com",
    },
  } as const;

  return copy[language];
}

function renderBookingEmail({
  badge,
  details,
  intro,
  subject,
  language = "de",
}: {
  badge: string;
  details: BookingEmailData;
  intro: string;
  subject: string;
  language?: InvoiceLanguage;
}): EmailContent {
  const ui = bookingEmailUiCopy(language);

  const text =
    `${subject}\n\n` +
    `${intro}\n\n` +
    `${bookingDetailsText(details)}\n\n` +
    `${ui.questions}\n\n` +
    `${ui.greeting}\nJC Detailing\n` +
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
                      ${escapeHtml(badge)}
                    </div>

                    <h1 style="margin:18px 0 10px;font-size:26px;line-height:1.2;color:#111111;">
                      ${escapeHtml(subject)}
                    </h1>

                    <p style="margin:0 auto;max-width:460px;color:#4b5563;font-size:15px;line-height:1.7;">
                      ${escapeHtml(intro)}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 24px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${bookingDetailsHtmlLight(details)}
                    </table>

                    <div style="margin-top:26px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e5e7eb;">
                      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
                        ${escapeHtml(ui.questions)}
                      </p>
                    </div>

                    <p style="margin:26px 0 0;color:#111111;font-size:15px;line-height:1.7;">
                      ${escapeHtml(ui.greeting)}<br />
                      <strong>JC Detailing</strong>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.7;text-align:center;">
                    ${escapeHtml(ui.footer)}
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
function bookingConfirmedCopy(language: InvoiceLanguage) {
  const copy = {
    de: {
      badge: "Termin bestätigt",
      subject: "Dein Termin bei JC Detailing ist bestätigt",
      intro:
        "Deine Terminanfrage wurde geprüft und bestätigt. Unten findest du alle wichtigen Angaben zu deinem Termin.",
    },
    en: {
      badge: "Appointment confirmed",
      subject: "Your appointment with JC Detailing is confirmed",
      intro:
        "Your appointment request has been reviewed and confirmed. Below you will find all important details for your appointment.",
    },
    fr: {
      badge: "Rendez-vous confirmé",
      subject: "Votre rendez-vous chez JC Detailing est confirmé",
      intro:
        "Votre demande de rendez-vous a été vérifiée et confirmée. Vous trouverez ci-dessous tous les détails importants.",
    },
    it: {
      badge: "Appuntamento confermato",
      subject: "Il tuo appuntamento da JC Detailing è confermato",
      intro:
        "La tua richiesta di appuntamento è stata controllata e confermata. Qui sotto trovi tutti i dettagli importanti.",
    },
  } as const;

  return copy[language];
}

function bookingConfirmedEmail(
  language: InvoiceLanguage,
  details: BookingEmailData,
) {
  const copy = bookingConfirmedCopy(language);

  return renderBookingEmail({
    badge: copy.badge,
    subject: copy.subject,
    intro: copy.intro,
    details,
    language,
  });
}
function bookingCancelledCopy(language: InvoiceLanguage) {
  const copy = {
    de: {
      badge: "Termin storniert",
      subject: "Dein Termin bei JC Detailing wurde storniert",
      intro:
        "Dein Termin bei JC Detailing wurde storniert. Unten findest du die Angaben zur stornierten Buchung.",
    },
    en: {
      badge: "Appointment cancelled",
      subject: "Your appointment with JC Detailing has been cancelled",
      intro:
        "Your appointment with JC Detailing has been cancelled. Below you will find the details of the cancelled booking.",
    },
    fr: {
      badge: "Rendez-vous annulé",
      subject: "Votre rendez-vous chez JC Detailing a été annulé",
      intro:
        "Votre rendez-vous chez JC Detailing a été annulé. Vous trouverez ci-dessous les détails de la réservation annulée.",
    },
    it: {
      badge: "Appuntamento annullato",
      subject: "Il tuo appuntamento da JC Detailing è stato annullato",
      intro:
        "Il tuo appuntamento da JC Detailing è stato annullato. Qui sotto trovi i dettagli della prenotazione annullata.",
    },
  } as const;

  return copy[language];
}

function bookingCancelledEmail(
  language: InvoiceLanguage,
  details: BookingEmailData,
) {
  const copy = bookingCancelledCopy(language);

  return renderBookingEmail({
    badge: copy.badge,
    subject: copy.subject,
    intro: copy.intro,
    details,
    language,
  });
}

function bookingUpdatedCopy(language: InvoiceLanguage) {
  const copy = {
    de: {
      badge: "Termin aktualisiert",
      subject: "Dein Termin bei JC Detailing wurde aktualisiert",
      intro:
        "Dein bestätigter Termin wurde aktualisiert. Unten findest du die neuen Termindaten.",
    },
    en: {
      badge: "Appointment updated",
      subject: "Your appointment with JC Detailing has been updated",
      intro:
        "Your confirmed appointment has been updated. Below you will find the new appointment details.",
    },
    fr: {
      badge: "Rendez-vous mis à jour",
      subject: "Votre rendez-vous chez JC Detailing a été mis à jour",
      intro:
        "Votre rendez-vous confirmé a été mis à jour. Vous trouverez ci-dessous les nouvelles informations.",
    },
    it: {
      badge: "Appuntamento aggiornato",
      subject: "Il tuo appuntamento da JC Detailing è stato aggiornato",
      intro:
        "Il tuo appuntamento confermato è stato aggiornato. Qui sotto trovi i nuovi dettagli.",
    },
  } as const;

  return copy[language];
}

function bookingUpdatedEmail(
  language: InvoiceLanguage,
  details: BookingEmailData,
) {
  const copy = bookingUpdatedCopy(language);

  return renderBookingEmail({
    badge: copy.badge,
    subject: copy.subject,
    intro: copy.intro,
    details,
    language,
  });
}

async function sendEmail({
  html,
  subject,
  text,
  to,
}: {
  html: string;
  subject: string;
  text: string;
  to: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.warn("RESEND_API_KEY is missing. Email was not sent.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from:
          process.env.BOOKING_FROM_EMAIL ??
          "JC Detailing <onboarding@resend.dev>",
        html,
        subject,
        text,
        to,
      }),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Booking email failed:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Booking email request failed:", error);
    return false;
  }
}

function selectedBookingServices(booking: {
  service: { name: string; basePrice: number };
  services: { name: string; basePrice: number }[];
}) {
  return booking.services.length ? booking.services : [booking.service];
}

function bookingEmailDetails(booking: {
  addOns: { name: string; price: number }[];
  client: {
    email: string;
    name: string;
    phone: string;
  };
  dateTime: Date;
  endTime: Date;
  notes?: string | null;
  service: {
    name: string;
    basePrice: number;
  };
  services: {
    name: string;
    basePrice: number;
  }[];
  vehicleCategory: {
    name: string;
    priceModifier: number;
  };
  vehicleModel: string;
}): BookingEmailData {
  const services = selectedBookingServices(booking);

  const totalAmount =
    services.reduce((sum, service) => sum + service.basePrice, 0) +
    booking.vehicleCategory.priceModifier +
    booking.addOns.reduce((sum, addOn) => sum + addOn.price, 0);

  return {
    addOns: getNameList(booking.addOns),
    clientEmail: booking.client.email,
    clientName: booking.client.name,
    clientPhone: booking.client.phone,
    dateTime: booking.dateTime,
    endTime: booking.endTime,
    services: getNameList(services),
    totalAmount,
    vehicleCategory: booking.vehicleCategory.name,
    vehicleModel: booking.vehicleModel,
    notes: booking.notes || null,
  };
}

/*
  EXISTING FUNCTION:
  This is kept as it was so AdminBookingCreator and any existing component
  using createAdminBooking() continue working exactly the same way.
*/
export async function createAdminBooking(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const clientId = String(formData.get("clientId") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const vehicleModel = String(formData.get("vehicleModel") ?? "").trim();
    const serviceId = String(formData.get("serviceId") ?? "");
    const vehicleCategoryId = String(formData.get("vehicleCategoryId") ?? "");
    const date = String(formData.get("date") ?? "");
    const start = String(formData.get("start") ?? "");
    const end = String(formData.get("end") ?? "");
    const language = cleanLanguage(formData.get("language"));
    const addOnIds = formData.getAll("addOnIds").map(String).filter(Boolean);

    if (
      !address ||
      (!clientId && (!name || !email || !phone)) ||
      !vehicleModel ||
      !serviceId ||
      !vehicleCategoryId ||
      !date ||
      !start ||
      !end
    ) {
      return {
        success: false,
        error: "Bitte fülle alle Pflichtfelder aus.",
      };
    }

    const dateTime = buildDateTime(date, start);
    const endTime = buildDateTime(date, end);

    if (Number.isNaN(dateTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return {
        success: false,
        error: "Datum oder Uhrzeit ist ungültig.",
      };
    }

    if (endTime <= dateTime) {
      return {
        success: false,
        error: "Die Endzeit muss nach der Startzeit liegen.",
      };
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        status: {
          not: "CANCELLED",
        },
        dateTime: {
          lt: endTime,
        },
        endTime: {
          gt: dateTime,
        },
      },
      select: {
        dateTime: true,
        endTime: true,
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    if (conflictingBooking) {
      const conflictStart = new Intl.DateTimeFormat("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      }).format(conflictingBooking.dateTime);

      const conflictEnd = new Intl.DateTimeFormat("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      }).format(conflictingBooking.endTime);

      return {
        success: false,
        error: `Dieser Zeitraum ist bereits belegt: ${conflictStart}–${conflictEnd} Uhr.`,
      };
    }

    const [service, category, addOns, selectedClient] = await Promise.all([
      prisma.service.findUnique({
        where: { id: serviceId },
      }),
      prisma.vehicleCategory.findUnique({
        where: { id: vehicleCategoryId },
      }),
      addOnIds.length
        ? prisma.addOn.findMany({
            where: {
              id: {
                in: addOnIds,
              },
            },
          })
        : Promise.resolve([]),
      clientId
        ? prisma.client.findUnique({
            where: { id: clientId },
          })
        : Promise.resolve(null),
    ]);

    if (!service || !category) {
      return {
        success: false,
        error:
          "Die gewählte Leistung oder Fahrzeugklasse wurde nicht gefunden.",
      };
    }

    if (clientId && !selectedClient) {
      return {
        success: false,
        error: "Der ausgewählte Kunde wurde nicht gefunden.",
      };
    }

    const bookingClient = selectedClient ?? {
      address,
      name,
      email,
      phone,
    };

    const booking = await prisma.booking.create({
      data: {
        dateTime,
        endTime,
        imageUrls: [],
        status: "CONFIRMED",
        language,
        vehicleModel,
        client: selectedClient
          ? {
              connect: {
                id: selectedClient.id,
              },
            }
          : {
              connectOrCreate: {
                create: {
                  address,
                  email,
                  name,
                  phone,
                },
                where: {
                  email,
                },
              },
            },
        service: {
          connect: {
            id: service.id,
          },
        },
        services: {
          connect: [
            {
              id: service.id,
            },
          ],
        },
        vehicleCategory: {
          connect: {
            id: category.id,
          },
        },
        addOns: {
          connect: addOns.map((addOn) => ({
            id: addOn.id,
          })),
        },
      },
    });

    await prisma.client.update({
      where: { id: booking.clientId },
      data: { address },
    });

    const totalAmount =
      service.basePrice +
      category.priceModifier +
      addOns.reduce((sum, addOn) => sum + addOn.price, 0);

    // const number = invoiceNumber();

    // const invoice = await prisma.invoice.create({
    //   data: {
    //     bookingId: booking.id,
    //     dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    //     emailOverride: bookingClient.email,
    //     invoiceNumber: number,
    //     language,
    //     sentAt: new Date(),
    //     status: "SENT",
    //     totalAmount,
    //     vatRate: 0,
    //   },
    // });

    // await prisma.invoiceItem.createMany({
    //   data: [
    //     {
    //       description: service.name,
    //       invoiceId: invoice.id,
    //       pricePerUnit: service.basePrice,
    //       quantity: 1,
    //       unit: "Stk.",
    //     },
    //     ...(category.priceModifier > 0
    //       ? [
    //           {
    //             description: `Fahrzeuggroesse: ${category.name}`,
    //             invoiceId: invoice.id,
    //             pricePerUnit: category.priceModifier,
    //             quantity: 1,
    //             unit: "Stk.",
    //           },
    //         ]
    //       : []),
    //     ...addOns.map((addOn) => ({
    //       description: addOn.name,
    //       invoiceId: invoice.id,
    //       pricePerUnit: addOn.price,
    //       quantity: 1,
    //       unit: "Stk.",
    //     })),
    //   ],
    // });

    const confirmationEmail = bookingConfirmedEmail(language, {
      addOns: getNameList(addOns),
      clientEmail: bookingClient.email,
      clientName: bookingClient.name,
      clientPhone: bookingClient.phone,
      dateTime,
      endTime,
      services: service.name,
      totalAmount,
      vehicleCategory: category.name,
      vehicleModel,
    });

    await sendEmail({
      to: bookingClient.email,
      subject: confirmationEmail.subject,
      text: confirmationEmail.text,
      html: confirmationEmail.html,
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${booking.clientId}`);
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/invoices");
    revalidatePath("/admin/dashboard");
    revalidatePath("/gallery");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Admin booking creation failed:", error);

    return {
      success: false,
      error:
        "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

/*
  NEW FUNCTION:
  Used only by the new AdminBookingEditor.
  It returns a detailed result for the notification toast.
*/
export async function updateAdminBooking(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const bookingId = getRequiredValue(formData, "bookingId");
    const vehicleModel = getRequiredValue(formData, "vehicleModel");
    const serviceId = getRequiredValue(formData, "serviceId");
    const vehicleCategoryId = getRequiredValue(formData, "vehicleCategoryId");

    const date = getRequiredValue(formData, "date");
    const start = getRequiredValue(formData, "start");
    const end = getRequiredValue(formData, "end");

    const statusValue = getRequiredValue(formData, "status");
    const notes = String(formData.get("notes") ?? "").trim();

    const additionalServiceIds = getSelectedIds(
      formData,
      "additionalServiceIds",
    ).filter((id) => id !== serviceId);

    const addOnIds = getSelectedIds(formData, "addOnIds");

    if (!isBookingStatus(statusValue)) {
      return failure("Der ausgewählte Buchungsstatus ist ungültig.");
    }

    const dateTime = buildDateTime(date, start);
    const endTime = buildDateTime(date, end);

    if (Number.isNaN(dateTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return failure("Datum oder Uhrzeit ist ungültig.");
    }

    if (endTime <= dateTime) {
      return failure("Die Endzeit muss nach der Startzeit liegen.");
    }

    const [
      currentBooking,
      primaryService,
      vehicleCategory,
      additionalServices,
      addOns,
    ] = await Promise.all([
      prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          client: true,
          service: true,
          services: true,
          vehicleCategory: true,
          addOns: true,
          invoice: true,
        },
      }),
      prisma.service.findUnique({
        where: { id: serviceId },
      }),
      prisma.vehicleCategory.findUnique({
        where: { id: vehicleCategoryId },
      }),
      additionalServiceIds.length
        ? prisma.service.findMany({
            where: {
              id: {
                in: additionalServiceIds,
              },
            },
          })
        : Promise.resolve([]),
      addOnIds.length
        ? prisma.addOn.findMany({
            where: {
              id: {
                in: addOnIds,
              },
            },
          })
        : Promise.resolve([]),
    ]);

    if (!currentBooking) {
      return failure("Die Buchung wurde nicht gefunden.");
    }

    if (!primaryService) {
      return failure("Die gewählte Hauptleistung wurde nicht gefunden.");
    }

    if (!vehicleCategory) {
      return failure("Die gewählte Fahrzeugkategorie wurde nicht gefunden.");
    }

    if (additionalServices.length !== additionalServiceIds.length) {
      return failure(
        "Eine oder mehrere zusätzliche Leistungen wurden nicht gefunden.",
      );
    }

    if (addOns.length !== addOnIds.length) {
      return failure("Ein oder mehrere Add-ons wurden nicht gefunden.");
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        id: {
          not: bookingId,
        },
        status: {
          not: "CANCELLED",
        },
        dateTime: {
          lt: endTime,
        },
        endTime: {
          gt: dateTime,
        },
      },
      select: {
        dateTime: true,
        endTime: true,
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    if (conflictingBooking) {
      const conflictStart = new Intl.DateTimeFormat("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      }).format(conflictingBooking.dateTime);

      const conflictEnd = new Intl.DateTimeFormat("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      }).format(conflictingBooking.endTime);

      return failure(
        `Dieser Zeitraum ist bereits belegt: ${conflictStart}–${conflictEnd} Uhr.`,
      );
    }

    const allSelectedServices = [primaryService, ...additionalServices];

    const totalAmount =
      allSelectedServices.reduce((sum, service) => sum + service.basePrice, 0) +
      vehicleCategory.priceModifier +
      addOns.reduce((sum, addOn) => sum + addOn.price, 0);

    const changes: string[] = [];

    if (
      currentBooking.dateTime.getTime() !== dateTime.getTime() ||
      currentBooking.endTime.getTime() !== endTime.getTime()
    ) {
      changes.push(
        `Termin von ${formatDateTime(
          currentBooking.dateTime,
        )} auf ${formatDateTime(dateTime)} geändert`,
      );
    }
    const didDateTimeChange =
      currentBooking.dateTime.getTime() !== dateTime.getTime() ||
      currentBooking.endTime.getTime() !== endTime.getTime();

    if (currentBooking.status !== statusValue) {
      changes.push(
        `Status von ${bookingStatusLabel(
          currentBooking.status,
        )} zu ${bookingStatusLabel(statusValue)} geändert`,
      );
    }

    if (currentBooking.vehicleModel !== vehicleModel) {
      changes.push(
        `Fahrzeug von ${currentBooking.vehicleModel} zu ${vehicleModel} geändert`,
      );
    }

    if (currentBooking.vehicleCategoryId !== vehicleCategoryId) {
      changes.push(
        `Fahrzeugkategorie von ${currentBooking.vehicleCategory.name} zu ${vehicleCategory.name} geändert`,
      );
    }

    if (currentBooking.serviceId !== serviceId) {
      changes.push(
        `Hauptleistung von ${currentBooking.service.name} zu ${primaryService.name} geändert`,
      );
    }

    const currentServiceIds = currentBooking.services.map(
      (service) => service.id,
    );
    const newServiceIds = allSelectedServices.map((service) => service.id);

    if (!sameIds(currentServiceIds, newServiceIds)) {
      changes.push(
        `Leistungen auf ${getNameList(allSelectedServices)} geändert`,
      );
    }

    const currentAddOnIds = currentBooking.addOns.map((addOn) => addOn.id);
    const newAddOnIds = addOns.map((addOn) => addOn.id);

    if (!sameIds(currentAddOnIds, newAddOnIds)) {
      changes.push(`Add-ons auf ${getNameList(addOns)} geändert`);
    }

    const oldNotes = currentBooking.notes?.trim() ?? "";
    const newNotes = notes.trim();

    if (oldNotes !== newNotes) {
      changes.push(newNotes ? "Notizen aktualisiert" : "Notizen entfernt");
    }

    if (!changes.length) {
      return success("Keine Änderungen an der Buchung vorgenommen.");
    }
    const shouldSendConfirmationEmail =
      currentBooking.status !== "CONFIRMED" && statusValue === "CONFIRMED";

    const shouldSendCancellationEmail =
      currentBooking.status !== "CANCELLED" && statusValue === "CANCELLED";

    const shouldSendUpdatedAppointmentEmail =
      currentBooking.status === "CONFIRMED" &&
      statusValue === "CONFIRMED" &&
      didDateTimeChange;

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          dateTime,
          endTime,
          status: statusValue,
          vehicleModel,
          notes: newNotes || null,
          serviceId,
          vehicleCategoryId,
          services: {
            set: allSelectedServices.map((service) => ({
              id: service.id,
            })),
          },
          addOns: {
            set: addOns.map((addOn) => ({
              id: addOn.id,
            })),
          },
        },
      });

      if (currentBooking.invoice) {
        await tx.invoice.update({
          where: {
            id: currentBooking.invoice.id,
          },
          data: {
            totalAmount,
          },
        });

        await tx.invoiceItem.deleteMany({
          where: {
            invoiceId: currentBooking.invoice.id,
          },
        });

        await tx.invoiceItem.createMany({
          data: [
            ...allSelectedServices.map((service) => ({
              description: service.name,
              invoiceId: currentBooking.invoice!.id,
              pricePerUnit: service.basePrice,
              quantity: 1,
              unit: "Stk.",
            })),
            ...(vehicleCategory.priceModifier > 0
              ? [
                  {
                    description: `Fahrzeuggroesse: ${vehicleCategory.name}`,
                    invoiceId: currentBooking.invoice!.id,
                    pricePerUnit: vehicleCategory.priceModifier,
                    quantity: 1,
                    unit: "Stk.",
                  },
                ]
              : []),
            ...addOns.map((addOn) => ({
              description: addOn.name,
              invoiceId: currentBooking.invoice!.id,
              pricePerUnit: addOn.price,
              quantity: 1,
              unit: "Stk.",
            })),
          ],
        });
      }
    });

    let emailStatusMessage = "";

    if (shouldSendConfirmationEmail) {
      const bookingLanguage = normalizeLanguage(currentBooking.language);

      const confirmationEmail = bookingConfirmedEmail(bookingLanguage, {
        addOns: getNameList(addOns),
        clientEmail: currentBooking.client.email,
        clientName: currentBooking.client.name,
        clientPhone: currentBooking.client.phone,
        dateTime,
        endTime,
        services: getNameList(allSelectedServices),
        totalAmount,
        vehicleCategory: vehicleCategory.name,
        vehicleModel,
        notes: newNotes || null,
      });

      const emailSent = await sendEmail({
        to: currentBooking.client.email,
        subject: confirmationEmail.subject,
        text: confirmationEmail.text,
        html: confirmationEmail.html,
      });

      emailStatusMessage = emailSent
        ? " Bestätigungs-E-Mail wurde gesendet."
        : " Bestätigungs-E-Mail konnte nicht gesendet werden.";
    } else if (shouldSendCancellationEmail) {
      const bookingLanguage = normalizeLanguage(currentBooking.language);

      const cancelledEmail = bookingCancelledEmail(bookingLanguage, {
        addOns: getNameList(addOns),
        clientEmail: currentBooking.client.email,
        clientName: currentBooking.client.name,
        clientPhone: currentBooking.client.phone,
        dateTime,
        endTime,
        services: getNameList(allSelectedServices),
        totalAmount,
        vehicleCategory: vehicleCategory.name,
        vehicleModel,
        notes: newNotes || null,
      });

      const emailSent = await sendEmail({
        to: currentBooking.client.email,
        subject: cancelledEmail.subject,
        text: cancelledEmail.text,
        html: cancelledEmail.html,
      });

      emailStatusMessage = emailSent
        ? " Stornierungs-E-Mail wurde gesendet."
        : " Stornierungs-E-Mail konnte nicht gesendet werden.";
    } else if (shouldSendUpdatedAppointmentEmail) {
      const bookingLanguage = normalizeLanguage(currentBooking.language);

      const updatedEmail = bookingUpdatedEmail(bookingLanguage, {
        addOns: getNameList(addOns),
        clientEmail: currentBooking.client.email,
        clientName: currentBooking.client.name,
        clientPhone: currentBooking.client.phone,
        dateTime,
        endTime,
        services: getNameList(allSelectedServices),
        totalAmount,
        vehicleCategory: vehicleCategory.name,
        vehicleModel,
        notes: newNotes || null,
      });

      const emailSent = await sendEmail({
        to: currentBooking.client.email,
        subject: updatedEmail.subject,
        text: updatedEmail.text,
        html: updatedEmail.html,
      });

      emailStatusMessage = emailSent
        ? " Aktualisierungs-E-Mail wurde gesendet."
        : " Aktualisierungs-E-Mail konnte nicht gesendet werden.";
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/clients");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/invoices");
    revalidatePath("/admin/dashboard");

    return success(
      `Buchung aktualisiert: ${changes.join(". ")}.${emailStatusMessage}`,
    );
  } catch (error) {
    console.error("Admin booking update failed:", error);

    return failure(readablePrismaError(error));
  }
}

/*
  NEW FUNCTION:
  Used only by the new AdminBookingEditor.
  It does not redirect; the client component will show a toast and navigate.
*/

export async function updateBookingStatus(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const bookingId = String(
      formData.get("id") ?? formData.get("bookingId") ?? "",
    ).trim();

    const statusValue = String(formData.get("status") ?? "").trim();

    if (!bookingId) {
      return failure("Die Buchung wurde nicht gefunden.");
    }

    if (!isBookingStatus(statusValue)) {
      return failure("Der ausgewählte Buchungsstatus ist ungültig.");
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        client: true,
        service: true,
        services: true,
        vehicleCategory: true,
        addOns: true,
      },
    });

    if (!booking) {
      return failure("Die Buchung wurde nicht gefunden.");
    }

    if (booking.status === statusValue) {
      return success("Keine Änderung am Buchungsstatus vorgenommen.");
    }

    const oldStatus = booking.status;
    const language = normalizeLanguage(booking.language);

    await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: statusValue,
      },
    });

    let emailStatusMessage = "";

    if (oldStatus !== "CONFIRMED" && statusValue === "CONFIRMED") {
      const confirmationEmail = bookingConfirmedEmail(
        language,
        bookingEmailDetails(booking),
      );

      const emailSent = await sendEmail({
        to: booking.client.email,
        subject: confirmationEmail.subject,
        text: confirmationEmail.text,
        html: confirmationEmail.html,
      });

      emailStatusMessage = emailSent
        ? " Bestätigungs-E-Mail wurde gesendet."
        : " Bestätigungs-E-Mail konnte nicht gesendet werden.";
    }

    if (oldStatus !== "CANCELLED" && statusValue === "CANCELLED") {
      const cancelledEmail = bookingCancelledEmail(
        language,
        bookingEmailDetails(booking),
      );

      const emailSent = await sendEmail({
        to: booking.client.email,
        subject: cancelledEmail.subject,
        text: cancelledEmail.text,
        html: cancelledEmail.html,
      });

      emailStatusMessage = emailSent
        ? " Stornierungs-E-Mail wurde gesendet."
        : " Stornierungs-E-Mail konnte nicht gesendet werden.";
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/dashboard");

    return success(
      `Status wurde von ${bookingStatusLabel(oldStatus)} zu ${bookingStatusLabel(
        statusValue,
      )} geändert.${emailStatusMessage}`,
    );
  } catch (error) {
    console.error("Booking status update failed:", error);

    return failure(readablePrismaError(error));
  }
}

export async function deleteAdminBooking(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const bookingId = getRequiredValue(formData, "bookingId");

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return failure("Die Buchung wurde nicht gefunden.");
    }

    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${booking.clientId}`);
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/invoices");
    revalidatePath("/admin/dashboard");

    return success(
      `Buchung von ${booking.client.name} am ${formatDateTime(
        booking.dateTime,
      )} wurde gelöscht.`,
    );
  } catch (error) {
    console.error("Admin booking deletion failed:", error);

    return failure(readablePrismaError(error));
  }
}
