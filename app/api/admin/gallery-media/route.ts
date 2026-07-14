import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import { requireAdminSession } from "@/app/lib/requireAdmin";
import { getAllGalleryStoragePaths } from "@/app/lib/galleryStoragePaths";

const slots = ["BEFORE", "AFTER"] as const;

type GallerySlot = (typeof slots)[number];

function isGallerySlot(value: string): value is GallerySlot {
  return slots.includes(value as GallerySlot);
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

    const body = (await request.json()) as Record<string, unknown>;

    const projectId =
      typeof body.projectId === "string" ? body.projectId.trim() : "";

    const comparisonId =
      typeof body.comparisonId === "string"
        ? body.comparisonId.trim()
        : "";

    const slot = typeof body.slot === "string" ? body.slot.trim() : "";

    if (!projectId || !comparisonId || !isGallerySlot(slot)) {
      return NextResponse.json(
        { error: "Projekt, Vergleich oder Bildseite ist ungültig." },
        { status: 400 }
      );
    }

    const comparison = await prisma.galleryComparison.findFirst({
      where: {
        id: comparisonId,
        projectId,
      },
      select: {
        id: true,
        beforeAsset: {
          select: {
            id: true,
            storagePath: true,
          },
        },
        afterAsset: {
          select: {
            id: true,
            storagePath: true,
          },
        },
      },
    });

    if (!comparison) {
      return NextResponse.json(
        { error: "Der Vergleich wurde nicht gefunden." },
        { status: 404 }
      );
    }

    const asset =
      slot === "BEFORE" ? comparison.beforeAsset : comparison.afterAsset;

    if (!asset) {
      return NextResponse.json(
        { error: "Für diese Seite ist kein Bild vorhanden." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.galleryComparison.update({
        where: {
          id: comparison.id,
        },
        data:
          slot === "BEFORE"
            ? {
                beforeAssetId: null,
                isPublished: false,
                publishedAt: null,
              }
            : {
                afterAssetId: null,
                isPublished: false,
                publishedAt: null,
              },
      });

      await transaction.galleryMediaAsset.delete({
        where: {
          id: asset.id,
        },
      });
    });

    const { error: removeError } = await supabaseAdmin.storage
      .from(bookingPhotosBucket)
      .remove(getAllGalleryStoragePaths(asset.storagePath));

    if (removeError) {
      console.error("Gallery media storage deletion failed:", removeError);
    }

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${projectId}`);
    revalidatePath("/gallery");

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Gallery media deletion failed:", error);

    return NextResponse.json(
      { error: "Das Bild konnte nicht gelöscht werden." },
      { status: 500 }
    );
  }
}