import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";

function readRequiredString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const name = readRequiredString(body?.name);
  const email = readRequiredString(body?.email).toLowerCase();
  const phone = readRequiredString(body?.phone);
  const address = readRequiredString(body?.address);

  if (!name || !email || !phone || !address) {
    return NextResponse.json(
      { error: "Name, E-Mail, Telefon und Adresse sind erforderlich." },
      { status: 400 },
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Bitte eine gültige E-Mail-Adresse eingeben." },
      { status: 400 },
    );
  }

  try {
    const client = await prisma.client.create({
      data: {
        address,
        email,
        name,
        phone,
        type: "COMPANY",
      },
      select: { id: true },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Für diese E-Mail-Adresse besteht bereits ein Kunde." },
        { status: 409 },
      );
    }

    console.error("Company client creation failed:", error);
    return NextResponse.json(
      { error: "Der Firmenkunde konnte nicht erstellt werden." },
      { status: 500 },
    );
  }
}
