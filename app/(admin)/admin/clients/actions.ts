"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";

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

function getRequiredString(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    throw new Error(`${field} is required.`);
  }

  return value;
}

function readablePrismaError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Diese E-Mail-Adresse wird bereits von einem anderen Kunden verwendet.";
  }

  return "Die Änderung konnte nicht gespeichert werden. Bitte versuche es erneut.";
}

export async function updateClient(formData: FormData): Promise<ActionResult> {
  try {
    const clientId = getRequiredString(formData, "clientId");
    const name = getRequiredString(formData, "name");
    const email = getRequiredString(formData, "email").toLowerCase();
    const phone = getRequiredString(formData, "phone");

    if (!email.includes("@")) {
      return failure("Bitte gib eine gültige E-Mail-Adresse ein.");
    }

    const currentClient = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!currentClient) {
      return failure("Der Kunde wurde nicht gefunden.");
    }

    const changes: string[] = [];

    if (currentClient.name !== name) {
      changes.push(`Name von ${currentClient.name} zu ${name} geändert`);
    }

    if (currentClient.email !== email) {
      changes.push(`E-Mail von ${currentClient.email} zu ${email} geändert`);
    }

    if (currentClient.phone !== phone) {
      changes.push(`Telefon von ${currentClient.phone} zu ${phone} geändert`);
    }

    if (!changes.length) {
      return success("Keine Änderungen an den Kundendaten vorgenommen.");
    }

    await prisma.client.update({
      where: {
        id: clientId,
      },
      data: {
        name,
        email,
        phone,
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${clientId}`);

    return success(`Kundendaten aktualisiert: ${changes.join(". ")}.`);
  } catch (error) {
    console.error("Client update failed:", error);

    return failure(readablePrismaError(error));
  }
}

export async function deleteClient(formData: FormData): Promise<ActionResult> {
  try {
    const clientId = getRequiredString(formData, "clientId");

    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!client) {
      return failure("Der Kunde wurde nicht gefunden.");
    }

    await prisma.client.delete({
      where: {
        id: clientId,
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/invoices");
    revalidatePath("/admin/dashboard");

    const bookingText =
      client._count.bookings === 1
        ? "1 zugehörige Buchung wurde ebenfalls entfernt."
        : `${client._count.bookings} zugehörige Buchungen wurden ebenfalls entfernt.`;

    return success(`Kunde ${client.name} wurde gelöscht. ${bookingText}`);
  } catch (error) {
    console.error("Client deletion failed:", error);

    return failure(readablePrismaError(error));
  }
}
