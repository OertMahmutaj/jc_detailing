import { BookingPhotoCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import { requireAdminSession } from "@/app/lib/requireAdmin";

const damageCategory = "DAMAGE" as const;

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Nicht autorisiert." },
        { status: 401 }
      );
    }

    const bookingId =
      request.nextUrl.searchParams.get("bookingId")?.trim() ?? "";

    const category =
      request.nextUrl.searchParams.get("category")?.trim() ?? "";

    if (!bookingId || category !== damageCategory) {
      return NextResponse.json(
        {
          error:
            "Über diese Fotoverwaltung können nur private Schäden- und Dokumentationsfotos geladen werden.",
        },
        { status: 400 }
      );
    }

    const photos = await prisma.bookingPhoto.findMany({
      where: {
        bookingId,
        category: BookingPhotoCategory.DAMAGE,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: {
        id: true,
        storagePath: true,
      },
    });

    const signedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const { data, error } = await supabaseAdmin.storage
          .from(bookingPhotosBucket)
          .createSignedUrl(photo.storagePath, 60 * 60);

        if (error || !data?.signedUrl) {
          console.error(
            `Could not create signed URL for damage photo ${photo.id}:`,
            error
          );

          return null;
        }

        return {
          id: photo.id,
          isPublished: false,
          url: data.signedUrl,
        };
      })
    );

    return NextResponse.json({
      photos: signedPhotos.filter(
        (
          photo
        ): photo is {
          id: string;
          isPublished: boolean;
          url: string;
        } => photo !== null
      ),
    });
  } catch (error) {
    console.error("Damage photo list failed:", error);

    return NextResponse.json(
      { error: "Fotos konnten nicht geladen werden." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Nicht autorisiert." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      photoId?: unknown;
    } | null;

    const photoId =
      typeof body?.photoId === "string" ? body.photoId.trim() : "";

    if (!photoId) {
      return NextResponse.json(
        { error: "Ungültige Foto-ID." },
        { status: 400 }
      );
    }

    const photo = await prisma.bookingPhoto.findUnique({
      where: {
        id: photoId,
      },
      select: {
        id: true,
        bookingId: true,
        category: true,
        storagePath: true,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Das Foto wurde nicht gefunden." },
        { status: 404 }
      );
    }

    if (photo.category !== BookingPhotoCategory.DAMAGE) {
      return NextResponse.json(
        {
          error:
            "Vorher- und Nachher-Fotos werden ausschliesslich im Gallery Manager verwaltet.",
        },
        { status: 403 }
      );
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from(bookingPhotosBucket)
      .remove([photo.storagePath]);

    if (storageError) {
      console.error("Could not delete damage photo from storage:", storageError);

      return NextResponse.json(
        { error: "Das Foto konnte nicht aus dem Speicher gelöscht werden." },
        { status: 500 }
      );
    }

    await prisma.bookingPhoto.delete({
      where: {
        id: photo.id,
      },
    });

    if (photo.bookingId) {
      revalidatePath(`/admin/bookings/${photo.bookingId}`);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Damage photo delete failed:", error);

    return NextResponse.json(
      { error: "Das Foto konnte nicht gelöscht werden." },
      { status: 500 }
    );
  }
}

/*
  Publishing of Before/After images now belongs to GalleryComparison.

  This endpoint remains deliberately disabled so the old BookingPhoto system
  can never publish a photo to the public gallery again.
*/
export async function PATCH() {
  return NextResponse.json(
    {
      error:
        "Veröffentlichungen werden ausschliesslich im Gallery Manager verwaltet.",
    },
    { status: 403 }
  );
}