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

function cleanLanguage(value: FormDataEntryValue | null): InvoiceLanguage {
  return value === "en" || value === "fr" || value === "it" ? value : "de";
}

function buildDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function invoiceNumber() {
  return `RE-${Date.now().toString().slice(-6)}-${Math.floor(
    100 + Math.random() * 900
  )}`;
}

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

async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from:
        process.env.BOOKING_FROM_EMAIL ??
        "JC Detailing <onboarding@resend.dev>",
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

function customerText(
  language: InvoiceLanguage,
  name: string,
  invoice: string,
  total: number
) {
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

    if (
      !name ||
      !email ||
      !phone ||
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

    if (
      Number.isNaN(dateTime.getTime()) ||
      Number.isNaN(endTime.getTime())
    ) {
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

    const [service, category, addOns] = await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.vehicleCategory.findUnique({ where: { id: vehicleCategoryId } }),
      addOnIds.length
        ? prisma.addOn.findMany({ where: { id: { in: addOnIds } } })
        : Promise.resolve([]),
    ]);

    if (!service || !category) {
      return {
        success: false,
        error: "Die gewählte Leistung oder Fahrzeugklasse wurde nicht gefunden.",
      };
    }

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

    const totalAmount =
      service.basePrice +
      category.priceModifier +
      addOns.reduce((sum, addOn) => sum + addOn.price, 0);

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
        vatRate: 8.1,
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
          ? [
              {
                description: `Fahrzeuggroesse: ${category.name}`,
                invoiceId: invoice.id,
                pricePerUnit: category.priceModifier,
                quantity: 1,
                unit: "Stk.",
              },
            ]
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

    return { success: true };
  } catch (error) {
    console.error("Admin booking creation failed:", error);

    return {
      success: false,
      error: "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

/*
  NEW FUNCTION:
  Used only by the new AdminBookingEditor.
  It returns a detailed result for the notification toast.
*/
export async function updateAdminBooking(
  formData: FormData
): Promise<ActionResult> {
  try {
    const bookingId = getRequiredValue(formData, "bookingId");
    const vehicleModel = getRequiredValue(formData, "vehicleModel");
    const serviceId = getRequiredValue(formData, "serviceId");
    const vehicleCategoryId = getRequiredValue(
      formData,
      "vehicleCategoryId"
    );

    const date = getRequiredValue(formData, "date");
    const start = getRequiredValue(formData, "start");
    const end = getRequiredValue(formData, "end");

    const statusValue = getRequiredValue(formData, "status");
    const notes = String(formData.get("notes") ?? "").trim();

    const additionalServiceIds = getSelectedIds(
      formData,
      "additionalServiceIds"
    ).filter((id) => id !== serviceId);

    const addOnIds = getSelectedIds(formData, "addOnIds");

    if (!isBookingStatus(statusValue)) {
      return failure("Der ausgewählte Buchungsstatus ist ungültig.");
    }

    const dateTime = buildDateTime(date, start);
    const endTime = buildDateTime(date, end);

    if (
      Number.isNaN(dateTime.getTime()) ||
      Number.isNaN(endTime.getTime())
    ) {
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
        "Eine oder mehrere zusätzliche Leistungen wurden nicht gefunden."
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
        `Dieser Zeitraum ist bereits belegt: ${conflictStart}–${conflictEnd} Uhr.`
      );
    }

    const allSelectedServices = [primaryService, ...additionalServices];

    const totalAmount =
      allSelectedServices.reduce(
        (sum, service) => sum + service.basePrice,
        0
      ) +
      vehicleCategory.priceModifier +
      addOns.reduce((sum, addOn) => sum + addOn.price, 0);

    const changes: string[] = [];

    if (
      currentBooking.dateTime.getTime() !== dateTime.getTime() ||
      currentBooking.endTime.getTime() !== endTime.getTime()
    ) {
      changes.push(
        `Termin von ${formatDateTime(
          currentBooking.dateTime
        )} auf ${formatDateTime(dateTime)} geändert`
      );
    }

    if (currentBooking.status !== statusValue) {
      changes.push(
        `Status von ${bookingStatusLabel(
          currentBooking.status
        )} zu ${bookingStatusLabel(statusValue)} geändert`
      );
    }

    if (currentBooking.vehicleModel !== vehicleModel) {
      changes.push(
        `Fahrzeug von ${currentBooking.vehicleModel} zu ${vehicleModel} geändert`
      );
    }

    if (currentBooking.vehicleCategoryId !== vehicleCategoryId) {
      changes.push(
        `Fahrzeugkategorie von ${currentBooking.vehicleCategory.name} zu ${vehicleCategory.name} geändert`
      );
    }

    if (currentBooking.serviceId !== serviceId) {
      changes.push(
        `Hauptleistung von ${currentBooking.service.name} zu ${primaryService.name} geändert`
      );
    }

    const currentServiceIds = currentBooking.services.map(
      (service) => service.id
    );
    const newServiceIds = allSelectedServices.map((service) => service.id);

    if (!sameIds(currentServiceIds, newServiceIds)) {
      changes.push(
        `Leistungen auf ${getNameList(allSelectedServices)} geändert`
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

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/clients");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/invoices");
    revalidatePath("/admin/dashboard");

    return success(`Buchung aktualisiert: ${changes.join(". ")}.`);
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
export async function deleteAdminBooking(
  formData: FormData
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
        booking.dateTime
      )} wurde gelöscht.`
    );
  } catch (error) {
    console.error("Admin booking deletion failed:", error);

    return failure(readablePrismaError(error));
  }
}