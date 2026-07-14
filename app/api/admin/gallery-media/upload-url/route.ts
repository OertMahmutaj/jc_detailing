import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import { requireAdminSession } from "@/app/lib/requireAdmin";

const allowedMimeTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const maxPhotoSizeInBytes = 20 * 1024 * 1024;
const slots = ["BEFORE", "AFTER"] as const;

type GallerySlot = (typeof slots)[number];

function isGallerySlot(value: string): value is GallerySlot {
  return slots.includes(value as GallerySlot);
}

function isValidCleanupPath(
  projectId: string,
  comparisonId: string,
  slot: GallerySlot,
  storagePath: string,
) {
  const prefix = `gallery/${projectId}/${comparisonId}/${slot.toLowerCase()}/`;

  return (
    storagePath.startsWith(prefix) &&
    /^gallery\/.+\/.+\/(before|after)\/(original|display|thumbnail)\/[^/]+\.(jpg|jpeg|png|webp)$/i.test(
      storagePath,
    )
  );
}

export async function POST(request: NextRequest) {
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

    const slot =
      typeof body.slot === "string" ? body.slot.trim() : "";

    const contentType =
      typeof body.contentType === "string"
        ? body.contentType.trim().toLowerCase()
        : "";

    const fileSize =
      typeof body.fileSize === "number" ? body.fileSize : Number.NaN;

    if (!projectId || !comparisonId || !isGallerySlot(slot)) {
      return NextResponse.json(
        { error: "Projekt, Vergleich oder Bildseite ist ungültig." },
        { status: 400 },
      );
    }

    if (!Object.prototype.hasOwnProperty.call(allowedMimeTypes, contentType)) {
      return NextResponse.json(
        { error: "Nur JPEG-, PNG- und WebP-Bilder sind erlaubt." },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      fileSize > maxPhotoSizeInBytes
    ) {
      return NextResponse.json(
        { error: "Ein Bild darf maximal 20 MB gross sein." },
        { status: 400 },
      );
    }

    const comparison = await prisma.galleryComparison.findFirst({
      where: {
        id: comparisonId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!comparison) {
      return NextResponse.json(
        { error: "Der Vergleich wurde nicht gefunden." },
        { status: 404 },
      );
    }

    const id = crypto.randomUUID();
    const extension =
      allowedMimeTypes[contentType as keyof typeof allowedMimeTypes];

    const basePath = [
      "gallery",
      projectId,
      comparisonId,
      slot.toLowerCase(),
    ].join("/");

    const originalStoragePath =
      `${basePath}/original/${id}.${extension}`;

    const displayStoragePath =
      `${basePath}/display/${id}.webp`;

    const thumbnailStoragePath =
      `${basePath}/thumbnail/${id}.webp`;

    const [originalResult, displayResult, thumbnailResult] =
      await Promise.all([
        supabaseAdmin.storage
          .from(bookingPhotosBucket)
          .createSignedUploadUrl(originalStoragePath, {
            upsert: false,
          }),

        supabaseAdmin.storage
          .from(bookingPhotosBucket)
          .createSignedUploadUrl(displayStoragePath, {
            upsert: false,
          }),

        supabaseAdmin.storage
          .from(bookingPhotosBucket)
          .createSignedUploadUrl(thumbnailStoragePath, {
            upsert: false,
          }),
      ]);

    const uploadError =
      originalResult.error ||
      displayResult.error ||
      thumbnailResult.error;

    if (
      uploadError ||
      !originalResult.data ||
      !displayResult.data ||
      !thumbnailResult.data
    ) {
      console.error("Gallery upload URL creation failed:", uploadError);

      return NextResponse.json(
        { error: "Upload-Links konnten nicht erstellt werden." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      bucket: bookingPhotosBucket,

      uploads: {
        original: {
          storagePath: originalStoragePath,
          token: originalResult.data.token,
        },

        display: {
          storagePath: displayStoragePath,
          token: displayResult.data.token,
        },

        thumbnail: {
          storagePath: thumbnailStoragePath,
          token: thumbnailResult.data.token,
        },
      },
    });
  } catch (error) {
    console.error("Gallery upload URL route failed:", error);

    return NextResponse.json(
      { error: "Upload-Links konnten nicht erstellt werden." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const storagePaths = Array.isArray(body.storagePaths)
      ? body.storagePaths.filter(
          (value): value is string => typeof value === "string",
        )
      : [];

    if (
      !projectId ||
      !comparisonId ||
      !isGallerySlot(slotValue) ||
      !storagePaths.length ||
      storagePaths.length > 3
    ) {
      return NextResponse.json(
        { error: "Die temporären Upload-Daten sind ungültig." },
        { status: 400 },
      );
    }

    const validPaths = storagePaths.filter((storagePath) =>
      isValidCleanupPath(
        projectId,
        comparisonId,
        slotValue,
        storagePath,
      ),
    );

    if (validPaths.length !== storagePaths.length) {
      return NextResponse.json(
        { error: "Ein Speicherpfad ist ungültig." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin.storage
      .from(bookingPhotosBucket)
      .remove(validPaths);

    if (error) {
      console.error("Temporary gallery upload cleanup failed:", error);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Temporary upload cleanup failed:", error);

    return NextResponse.json(
      { error: "Temporäre Uploads konnten nicht bereinigt werden." },
      { status: 500 },
    );
  }
}