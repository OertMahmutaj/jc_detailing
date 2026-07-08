import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import { requireAdminSession } from "@/app/lib/requireAdmin";

const damageCategory = "DAMAGE" as const;

const allowedMimeTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const maxPhotoSizeInBytes = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Nicht autorisiert." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      bookingId?: unknown;
      category?: unknown;
      contentType?: unknown;
      fileSize?: unknown;
    } | null;

    const bookingId =
      typeof body?.bookingId === "string" ? body.bookingId.trim() : "";

    const category =
      typeof body?.category === "string" ? body.category.trim() : "";

    const contentType =
      typeof body?.contentType === "string"
        ? body.contentType.trim().toLowerCase()
        : "";

    const fileSize =
      typeof body?.fileSize === "number" ? body.fileSize : Number.NaN;

    if (!bookingId || category !== damageCategory) {
      return NextResponse.json(
        {
          error:
            "Über diesen Upload können nur private Schäden- und Dokumentationsfotos hochgeladen werden.",
        },
        { status: 400 }
      );
    }

    if (
      !Object.prototype.hasOwnProperty.call(allowedMimeTypes, contentType)
    ) {
      return NextResponse.json(
        { error: "Nur JPEG-, PNG- und WebP-Bilder sind erlaubt." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      fileSize > maxPhotoSizeInBytes
    ) {
      return NextResponse.json(
        { error: "Ein Bild darf maximal 10 MB gross sein." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      select: {
        id: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Die Buchung wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const extension =
      allowedMimeTypes[contentType as keyof typeof allowedMimeTypes];

    const storagePath = [
      "bookings",
      booking.id,
      "damage",
      `${crypto.randomUUID()}.${extension}`,
    ].join("/");

    const { data, error } = await supabaseAdmin.storage
      .from(bookingPhotosBucket)
      .createSignedUploadUrl(storagePath, {
        upsert: false,
      });

    if (error || !data) {
      console.error("Could not create signed damage photo upload URL:", error);

      return NextResponse.json(
        { error: "Upload-Link konnte nicht erstellt werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bucket: bookingPhotosBucket,
      storagePath,
      token: data.token,
    });
  } catch (error) {
    console.error("Damage photo upload URL error:", error);

    return NextResponse.json(
      { error: "Der Upload-Link konnte nicht erstellt werden." },
      { status: 500 }
    );
  }
}