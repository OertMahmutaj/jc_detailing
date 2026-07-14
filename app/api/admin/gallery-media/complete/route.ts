import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import { requireAdminSession } from "@/app/lib/requireAdmin";
import { getAllGalleryStoragePaths } from "@/app/lib/galleryStoragePaths";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const maxPhotoSizeInBytes = 20 * 1024 * 1024;
const slots = ["BEFORE", "AFTER"] as const;

type GallerySlot = (typeof slots)[number];
type Variant = "original" | "display" | "thumbnail";

function isGallerySlot(value: string): value is GallerySlot {
  return slots.includes(value as GallerySlot);
}

function isAllowedMimeType(
  value: string,
): value is (typeof allowedMimeTypes)[number] {
  return allowedMimeTypes.includes(
    value as (typeof allowedMimeTypes)[number],
  );
}

function hasValidVariantPath(
  projectId: string,
  comparisonId: string,
  slot: GallerySlot,
  variant: Variant,
  storagePath: string,
) {
  const prefix = [
    "gallery",
    projectId,
    comparisonId,
    slot.toLowerCase(),
    variant,
    "",
  ].join("/");

  const validExtension =
    variant === "original"
      ? /\.(jpg|jpeg|png|webp)$/i.test(storagePath)
      : /\.webp$/i.test(storagePath);

  return storagePath.startsWith(prefix) && validExtension;
}

async function removeStoragePaths(storagePaths: string[]) {
  if (!storagePaths.length) return;

  const { error } = await supabaseAdmin.storage
    .from(bookingPhotosBucket)
    .remove([...new Set(storagePaths)]);

  if (error) {
    console.error("Gallery storage cleanup failed:", error);
  }
}

export async function POST(request: NextRequest) {
  let cleanupNewUploads: string[] = [];

  try {
    const session = await requireAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Nicht autorisiert." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const projectId =
      typeof body.projectId === "string" ? body.projectId.trim() : "";

    const comparisonId =
      typeof body.comparisonId === "string"
        ? body.comparisonId.trim()
        : "";

    const slotValue =
      typeof body.slot === "string" ? body.slot.trim() : "";

    const originalStoragePath =
      typeof body.originalStoragePath === "string"
        ? body.originalStoragePath.trim()
        : "";

    const displayStoragePath =
      typeof body.displayStoragePath === "string"
        ? body.displayStoragePath.trim()
        : "";

    const thumbnailStoragePath =
      typeof body.thumbnailStoragePath === "string"
        ? body.thumbnailStoragePath.trim()
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
      typeof body.fileSize === "number"
        ? body.fileSize
        : Number.NaN;

    if (
      !projectId ||
      !comparisonId ||
      !isGallerySlot(slotValue)
    ) {
      return NextResponse.json(
        { error: "Projekt, Vergleich oder Bildseite ist ungültig." },
        { status: 400 },
      );
    }

    if (
      !hasValidVariantPath(
        projectId,
        comparisonId,
        slotValue,
        "original",
        originalStoragePath,
      ) ||
      !hasValidVariantPath(
        projectId,
        comparisonId,
        slotValue,
        "display",
        displayStoragePath,
      ) ||
      !hasValidVariantPath(
        projectId,
        comparisonId,
        slotValue,
        "thumbnail",
        thumbnailStoragePath,
      )
    ) {
      return NextResponse.json(
        { error: "Einer der Speicherpfade ist ungültig." },
        { status: 400 },
      );
    }

    if (!isAllowedMimeType(mimeType)) {
      return NextResponse.json(
        { error: "Der Bildtyp ist ungültig." },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      fileSize > maxPhotoSizeInBytes
    ) {
      return NextResponse.json(
        { error: "Die Dateigrösse ist ungültig." },
        { status: 400 },
      );
    }

    cleanupNewUploads = [
      originalStoragePath,
      displayStoragePath,
      thumbnailStoragePath,
    ];

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
      await removeStoragePaths(cleanupNewUploads);

      return NextResponse.json(
        { error: "Der Vergleich wurde nicht gefunden." },
        { status: 404 },
      );
    }

    const storageChecks = await Promise.all(
      cleanupNewUploads.map((storagePath) =>
        supabaseAdmin.storage
          .from(bookingPhotosBucket)
          .createSignedUrl(storagePath, 60),
      ),
    );

    const storageCheckError = storageChecks.find(
      (result) => result.error,
    )?.error;

    if (storageCheckError) {
      await removeStoragePaths(cleanupNewUploads);

      return NextResponse.json(
        { error: "Nicht alle hochgeladenen Bildversionen wurden gefunden." },
        { status: 400 },
      );
    }

    const oldAsset =
      slotValue === "BEFORE"
        ? comparison.beforeAsset
        : comparison.afterAsset;

    const asset = await prisma.$transaction(async (transaction) => {
      const createdAsset = await transaction.galleryMediaAsset.create({
        data: {
          projectId,

          /*
            The database stores the untouched original path.

            Display and thumbnail paths are derived from it.
          */
          storagePath: originalStoragePath,

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
          slotValue === "BEFORE"
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

    cleanupNewUploads = [];

    if (oldAsset) {
      await removeStoragePaths(
        getAllGalleryStoragePaths(oldAsset.storagePath),
      );
    }

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${projectId}`);
    revalidatePath("/gallery");
    revalidatePath("/");

    return NextResponse.json({
      asset,
      success: true,
    });
  } catch (error) {
    console.error("Gallery media completion failed:", error);

    if (cleanupNewUploads.length) {
      await removeStoragePaths(cleanupNewUploads);
    }

    return NextResponse.json(
      { error: "Das Bild konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }
}