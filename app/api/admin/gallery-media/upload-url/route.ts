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

const maxPhotoSizeInBytes = 10 * 1024 * 1024;

const slots = ["BEFORE", "AFTER"] as const;

type GallerySlot = (typeof slots)[number];

function isGallerySlot(value: string): value is GallerySlot {
  return slots.includes(value as GallerySlot);
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

    const contentType =
      typeof body.contentType === "string"
        ? body.contentType.trim().toLowerCase()
        : "";

    const fileSize =
      typeof body.fileSize === "number" ? body.fileSize : Number.NaN;

    if (!projectId || !comparisonId || !isGallerySlot(slot)) {
      return NextResponse.json(
        { error: "Projekt, Vergleich oder Bildseite ist ungültig." },
        { status: 400 }
      );
    }

    if (!Object.prototype.hasOwnProperty.call(allowedMimeTypes, contentType)) {
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
        { status: 404 }
      );
    }

    const extension =
      allowedMimeTypes[contentType as keyof typeof allowedMimeTypes];

    const storagePath = [
      "gallery",
      projectId,
      comparisonId,
      slot.toLowerCase(),
      `${crypto.randomUUID()}.${extension}`,
    ].join("/");

    const { data, error } = await supabaseAdmin.storage
      .from(bookingPhotosBucket)
      .createSignedUploadUrl(storagePath, {
        upsert: false,
      });

    if (error || !data) {
      console.error("Gallery upload URL creation failed:", error);

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
    console.error("Gallery upload URL route failed:", error);

    return NextResponse.json(
      { error: "Upload-Link konnte nicht erstellt werden." },
      { status: 500 }
    );
  }
}