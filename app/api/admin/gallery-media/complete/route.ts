import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import { requireAdminSession } from "@/app/lib/requireAdmin";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const slots = ["BEFORE", "AFTER"] as const;

type GallerySlot = (typeof slots)[number];

function isGallerySlot(value: string): value is GallerySlot {
  return slots.includes(value as GallerySlot);
}

function isAllowedMimeType(
  value: string
): value is (typeof allowedMimeTypes)[number] {
  return allowedMimeTypes.includes(
    value as (typeof allowedMimeTypes)[number]
  );
}

function hasValidStoragePath(
  projectId: string,
  comparisonId: string,
  slot: GallerySlot,
  storagePath: string
) {
  const prefix = `gallery/${projectId}/${comparisonId}/${slot.toLowerCase()}/`;

  return (
    storagePath.startsWith(prefix) &&
    /\.(jpg|jpeg|png|webp)$/i.test(storagePath)
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

    const body = (await request.json()) as Record<string, unknown>;

    const projectId =
      typeof body.projectId === "string" ? body.projectId.trim() : "";

    const comparisonId =
      typeof body.comparisonId === "string"
        ? body.comparisonId.trim()
        : "";

    const slot = typeof body.slot === "string" ? body.slot.trim() : "";

    const storagePath =
      typeof body.storagePath === "string"
        ? body.storagePath.trim()
        : "";

    const originalFileName =
      typeof body.originalFileName === "string"
        ? body.originalFileName.trim().slice(0, 255)
        : null;

    const mimeType =
      typeof body.mimeType === "string"
        ? body.mimeType.trim().toLowerCase()
        : "";

    const fileSize =
      typeof body.fileSize === "number" ? body.fileSize : Number.NaN;

    if (!projectId || !comparisonId || !isGallerySlot(slot)) {
      return NextResponse.json(
        { error: "Projekt, Vergleich oder Bildseite ist ungültig." },
        { status: 400 }
      );
    }

    if (
      !storagePath ||
      !hasValidStoragePath(projectId, comparisonId, slot, storagePath)
    ) {
      return NextResponse.json(
        { error: "Der Speicherpfad ist ungültig." },
        { status: 400 }
      );
    }

    if (!isAllowedMimeType(mimeType)) {
      return NextResponse.json(
        { error: "Der Bildtyp ist ungültig." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { error: "Die Dateigrösse ist ungültig." },
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

    const { error: storageCheckError } = await supabaseAdmin.storage
      .from(bookingPhotosBucket)
      .createSignedUrl(storagePath, 60);

    if (storageCheckError) {
      return NextResponse.json(
        { error: "Das hochgeladene Bild wurde nicht gefunden." },
        { status: 400 }
      );
    }

    const oldAsset =
      slot === "BEFORE" ? comparison.beforeAsset : comparison.afterAsset;

    const asset = await prisma.$transaction(async (transaction) => {
      const createdAsset = await transaction.galleryMediaAsset.create({
        data: {
          projectId,
          storagePath,
          originalFileName,
          mimeType,
          fileSize: Math.round(fileSize),
        },
        select: {
          id: true,
          storagePath: true,
        },
      });

      await transaction.galleryComparison.update({
        where: {
          id: comparison.id,
        },
        data:
          slot === "BEFORE"
            ? {
                beforeAssetId: createdAsset.id,
                isPublished: false,
                publishedAt: null,
              }
            : {
                afterAssetId: createdAsset.id,
                isPublished: false,
                publishedAt: null,
              },
      });

      if (oldAsset) {
        await transaction.galleryMediaAsset.delete({
          where: {
            id: oldAsset.id,
          },
        });
      }

      return createdAsset;
    });

    if (oldAsset) {
      const { error: removeError } = await supabaseAdmin.storage
        .from(bookingPhotosBucket)
        .remove([oldAsset.storagePath]);

      if (removeError) {
        console.error("Old gallery image cleanup failed:", removeError);
      }
    }

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${projectId}`);
    revalidatePath("/gallery");

    return NextResponse.json({
      asset,
      success: true,
    });
  } catch (error) {
    console.error("Gallery media completion failed:", error);

    return NextResponse.json(
      { error: "Das Bild konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}