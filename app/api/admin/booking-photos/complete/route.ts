import { BookingPhotoCategory } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import { requireAdminSession } from "@/app/lib/requireAdmin";

const damageCategory = "DAMAGE" as const;

function hasValidStoragePath(bookingId: string, storagePath: string) {
  const prefix = `bookings/${bookingId}/damage/`;

  return (
    storagePath.startsWith(prefix) &&
    /\.(jpg|png|webp)$/i.test(storagePath)
  );
}

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
      storagePath?: unknown;
    } | null;

    const bookingId =
      typeof body?.bookingId === "string" ? body.bookingId.trim() : "";

    const category =
      typeof body?.category === "string" ? body.category.trim() : "";

    const storagePath =
      typeof body?.storagePath === "string" ? body.storagePath.trim() : "";

    if (
      !bookingId ||
      category !== damageCategory ||
      !storagePath ||
      !hasValidStoragePath(bookingId, storagePath)
    ) {
      return NextResponse.json(
        {
          error:
            "Über diesen Upload können nur private Schäden- und Dokumentationsfotos gespeichert werden.",
        },
        { status: 400 }
      );
    }

    const [booking, existingPhoto] = await Promise.all([
      prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        select: {
          id: true,
        },
      }),
      prisma.bookingPhoto.findUnique({
        where: {
          storagePath,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!booking) {
      return NextResponse.json(
        { error: "Die Buchung wurde nicht gefunden." },
        { status: 404 }
      );
    }

    if (existingPhoto) {
      return NextResponse.json(
        { error: "Dieses Foto wurde bereits gespeichert." },
        { status: 409 }
      );
    }

    const lastSlashIndex = storagePath.lastIndexOf("/");
    const folder = storagePath.slice(0, lastSlashIndex);
    const fileName = storagePath.slice(lastSlashIndex + 1);

    const { data: storedFiles, error: storageError } =
      await supabaseAdmin.storage.from(bookingPhotosBucket).list(folder, {
        limit: 10,
        search: fileName,
      });

    if (storageError) {
      console.error("Could not verify uploaded damage photo:", storageError);

      return NextResponse.json(
        { error: "Das hochgeladene Foto konnte nicht überprüft werden." },
        { status: 500 }
      );
    }

    const fileExists = storedFiles.some((file) => file.name === fileName);

    if (!fileExists) {
      return NextResponse.json(
        { error: "Das Foto wurde nicht im Speicher gefunden." },
        { status: 400 }
      );
    }

    const latestPhoto = await prisma.bookingPhoto.findFirst({
      where: {
        bookingId,
        category: BookingPhotoCategory.DAMAGE,
      },
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    const photo = await prisma.bookingPhoto.create({
      data: {
        bookingId,
        galleryGroupId: bookingId,
        category: BookingPhotoCategory.DAMAGE,
        storagePath,
        sortOrder: (latestPhoto?.sortOrder ?? -1) + 1,
      },
      select: {
        id: true,
        category: true,
        isPublished: true,
        storagePath: true,
      },
    });

    return NextResponse.json({ photo });
  } catch (error) {
    console.error("Damage photo completion error:", error);

    return NextResponse.json(
      { error: "Das Foto konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}