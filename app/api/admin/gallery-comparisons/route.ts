import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import { requireAdminSession } from "@/app/lib/requireAdmin";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Nicht autorisiert." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      projectId?: unknown;
      comparisonId?: unknown;
      isPublished?: unknown;
    } | null;

    const projectId =
      typeof body?.projectId === "string" ? body.projectId.trim() : "";

    const comparisonId =
      typeof body?.comparisonId === "string"
        ? body.comparisonId.trim()
        : "";

    const isPublished =
      typeof body?.isPublished === "boolean" ? body.isPublished : null;

    if (!projectId || !comparisonId || isPublished === null) {
      return NextResponse.json(
        { error: "Die Veröffentlichungsdaten sind ungültig." },
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
        beforeAssetId: true,
        afterAssetId: true,
      },
    });

    if (!comparison) {
      return NextResponse.json(
        { error: "Der Vergleich wurde nicht gefunden." },
        { status: 404 }
      );
    }

    if (
      isPublished &&
      (!comparison.beforeAssetId || !comparison.afterAssetId)
    ) {
      return NextResponse.json(
        {
          error:
            "Ein Vergleich kann nur veröffentlicht werden, wenn ein Vorher- und ein Nachher-Bild vorhanden sind.",
        },
        { status: 400 }
      );
    }

    await prisma.galleryComparison.update({
      where: {
        id: comparison.id,
      },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${projectId}`);
    revalidatePath("/gallery");

    return NextResponse.json({
      success: true,
      isPublished,
    });
  } catch (error) {
    console.error("Gallery comparison publication update failed:", error);

    return NextResponse.json(
      { error: "Der Veröffentlichungsstatus konnte nicht geändert werden." },
      { status: 500 }
    );
  }
}