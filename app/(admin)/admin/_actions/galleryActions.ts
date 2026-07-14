"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../_lib/prisma";
import { bookingPhotosBucket, supabaseAdmin } from "../_lib/supabaseAdmin";
import { BookingPhotoCategory } from "@prisma/client";
import { getAllGalleryStoragePaths } from "@/app/lib/galleryStoragePaths";

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

export async function createGalleryProject(formData: FormData) {
  try {
    const title = cleanText(formData.get("title"), 120);
    const bookingId = cleanText(formData.get("bookingId"), 120);

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        select: {
          id: true,
        },
      });

      if (!booking) {
        return {
          success: false as const,
          error: "Die ausgewählte Buchung wurde nicht gefunden.",
        };
      }
      const existingProject = await prisma.galleryProject.findFirst({
        where: {
          bookingId,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          title: true,
        },
      });

      if (existingProject) {
        return {
          success: true as const,
          message: `"${existingProject.title}" ist bereits mit dieser Buchung verknüpft.`,
          projectId: existingProject.id,
        };
      }
    }

    const project = await prisma.galleryProject.create({
      data: {
        title: title || "Neues Galerie-Projekt",
        bookingId: bookingId || null,
      },
      select: {
        id: true,
        title: true,
      },
    });

    revalidatePath("/admin/gallery");

    return {
      success: true as const,
      message: `"${project.title}" wurde erstellt.`,
      projectId: project.id,
    };
  } catch (error) {
    console.error("Gallery project creation failed:", error);

    return {
      success: false as const,
      error:
        "Das Galerie-Projekt konnte nicht erstellt werden. Bitte versuche es erneut.",
    };
  }
}

function cleanOptionalText(
  value: FormDataEntryValue | null,
  maxLength: number,
) {
  const text = String(value ?? "")
    .trim()
    .slice(0, maxLength);

  return text || null;
}

export async function createGalleryComparison(formData: FormData) {
  try {
    const projectId = cleanText(formData.get("projectId"), 120);
    const label = cleanOptionalText(formData.get("label"), 100);

    if (!projectId) {
      return {
        success: false as const,
        error: "Das Galerie-Projekt fehlt.",
      };
    }

    const project = await prisma.galleryProject.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return {
        success: false as const,
        error: "Das Galerie-Projekt wurde nicht gefunden.",
      };
    }

    const latestComparison = await prisma.galleryComparison.findFirst({
      where: {
        projectId,
      },
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    const comparison = await prisma.galleryComparison.create({
      data: {
        projectId,
        label,
        sortOrder: (latestComparison?.sortOrder ?? -1) + 1,
      },
      select: {
        id: true,
        label: true,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${projectId}`);

    return {
      success: true as const,
      message: `Vergleich${comparison.label ? ` „${comparison.label}“` : ""} wurde hinzugefügt.`,
      comparisonId: comparison.id,
    };
  } catch (error) {
    console.error("Gallery comparison creation failed:", error);

    return {
      success: false as const,
      error:
        "Der Vergleich konnte nicht erstellt werden. Bitte versuche es erneut.",
    };
  }
}

function cleanNumber(
  value: FormDataEntryValue | null,
  fallback: number,
  min: number,
  max: number,
) {
  const number = Number(String(value ?? ""));

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

export async function saveGalleryAssetCrop(formData: FormData) {
  try {
    const projectId = cleanText(formData.get("projectId"), 120);
    const assetId = cleanText(formData.get("assetId"), 120);

    const cropX = cleanNumber(formData.get("cropX"), 0, -100, 100);
    const cropY = cleanNumber(formData.get("cropY"), 0, -100, 100);
    const cropScale = cleanNumber(formData.get("cropScale"), 1, 1, 4);

    if (!projectId || !assetId) {
      return {
        success: false as const,
        error: "Die Bilddaten fehlen.",
      };
    }

    const asset = await prisma.galleryMediaAsset.findFirst({
      where: {
        id: assetId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!asset) {
      return {
        success: false as const,
        error: "Das Bild wurde nicht gefunden.",
      };
    }

    await prisma.galleryMediaAsset.update({
      where: {
        id: asset.id,
      },
      data: {
        cropX,
        cropY,
        cropScale,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${projectId}`);
    revalidatePath("/gallery");

    return {
      success: true as const,
      message: "Bildposition wurde gespeichert.",
    };
  } catch (error) {
    console.error("Gallery asset crop update failed:", error);

    return {
      success: false as const,
      error: "Die Bildposition konnte nicht gespeichert werden.",
    };
  }
}

export async function deleteGalleryComparison(formData: FormData) {
  try {
    const projectId = cleanText(formData.get("projectId"), 120);
    const comparisonId = cleanText(formData.get("comparisonId"), 120);

    if (!projectId || !comparisonId) {
      return {
        success: false as const,
        error: "Die Vergleichsdaten fehlen.",
      };
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
      return {
        success: false as const,
        error: "Der Vergleich wurde nicht gefunden.",
      };
    }

    if (comparison.beforeAssetId || comparison.afterAssetId) {
      return {
        success: false as const,
        error:
          "Dieser Vergleich enthält bereits Bilder. Die Bildlöschung wird im nächsten Schritt direkt im Vergleich möglich sein.",
      };
    }

    await prisma.galleryComparison.delete({
      where: {
        id: comparison.id,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${projectId}`);

    return {
      success: true as const,
      message: "Leerer Vergleich wurde gelöscht.",
    };
  } catch (error) {
    console.error("Gallery comparison deletion failed:", error);

    return {
      success: false as const,
      error: "Der Vergleich konnte nicht gelöscht werden.",
    };
  }
}
export async function deleteGalleryProject(formData: FormData) {
  try {
    const projectId = cleanText(formData.get("projectId"), 120);

    if (!projectId) {
      return {
        success: false as const,
        error: "Das Galerie-Projekt fehlt.",
      };
    }

    const project = await prisma.galleryProject.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        title: true,
        bookingId: true,
        mediaAssets: {
          select: {
            storagePath: true,
          },
        },
      },
    });

    if (!project) {
      return {
        success: false as const,
        error: "Das Galerie-Projekt wurde nicht gefunden.",
      };
    }

    const storagePaths = [
  ...new Set(
    project.mediaAssets.flatMap((asset) =>
      getAllGalleryStoragePaths(asset.storagePath),
    ),
  ),
];

    /*
      Database deletion happens first.

      This ensures no deleted project can remain visible publicly,
      even if Supabase storage cleanup has a temporary error.
    */
    await prisma.galleryProject.delete({
      where: {
        id: project.id,
      },
    });

    if (storagePaths.length) {
      const { error: storageError } = await supabaseAdmin.storage
        .from(bookingPhotosBucket)
        .remove(storagePaths);

      if (storageError) {
        console.error("Gallery project storage cleanup failed:", storageError);
      }
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");

    if (project.bookingId) {
      revalidatePath(`/admin/bookings/${project.bookingId}`);
    }

    return {
      success: true as const,
      message: `"${project.title}" wurde vollständig gelöscht.`,
    };
  } catch (error) {
    console.error("Gallery project deletion failed:", error);

    return {
      success: false as const,
      error:
        "Das Galerie-Projekt konnte nicht gelöscht werden. Bitte versuche es erneut.",
    };
  }
}
export type LegacyBookingPhotoMigrationResult =
  | {
      success: true;
      message: string;
      migratedProjects: number;
      migratedComparisons: number;
      migratedPhotos: number;
    }
  | {
      success: false;
      error: string;
    };

function getLegacyFileName(storagePath: string) {
  return storagePath.split("/").pop() ?? null;
}

function getLegacyMimeType(storagePath: string) {
  const normalizedPath = storagePath.toLowerCase();

  if (normalizedPath.endsWith(".png")) {
    return "image/png";
  }

  if (normalizedPath.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

export async function migrateLegacyBookingPhotos(): Promise<LegacyBookingPhotoMigrationResult> {
  try {
    const legacyPhotos = await prisma.bookingPhoto.findMany({
      where: {
        category: {
          in: [BookingPhotoCategory.BEFORE, BookingPhotoCategory.AFTER],
        },
      },
      select: {
        id: true,
        bookingId: true,
        galleryGroupId: true,
        category: true,
        isPublished: true,
        publishedAt: true,
        sortOrder: true,
        storagePath: true,
        booking: {
          select: {
            id: true,
            vehicleModel: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          galleryGroupId: "asc",
        },
        {
          category: "asc",
        },
        {
          sortOrder: "asc",
        },
      ],
    });

    if (!legacyPhotos.length) {
      return {
        success: true,
        message: "Es gibt keine alten Vorher-Nachher-Fotos mehr zu übernehmen.",
        migratedProjects: 0,
        migratedComparisons: 0,
        migratedPhotos: 0,
      };
    }

    const photosByGalleryGroup = new Map<string, typeof legacyPhotos>();

    for (const photo of legacyPhotos) {
      const groupId = photo.galleryGroupId || photo.bookingId || photo.id;

      const group = photosByGalleryGroup.get(groupId) ?? [];

      group.push(photo);

      photosByGalleryGroup.set(groupId, group);
    }

    let migratedProjects = 0;
    let migratedComparisons = 0;

    await prisma.$transaction(async (transaction) => {
      for (const groupPhotos of photosByGalleryGroup.values()) {
        const linkedBooking =
          groupPhotos.find((photo) => photo.booking)?.booking ?? null;

        const linkedBookingId = linkedBooking
          ? (groupPhotos.find((photo) => photo.bookingId)?.bookingId ?? null)
          : null;

        const projectTitle = linkedBooking
          ? `${linkedBooking.vehicleModel} · Importierte Galerie`
          : "Importierte Galerie";

        const project = await transaction.galleryProject.create({
          data: {
            title: projectTitle,
            bookingId: linkedBookingId,
          },
          select: {
            id: true,
          },
        });

        migratedProjects += 1;

        const beforeBySortOrder = new Map<
          number,
          (typeof groupPhotos)[number]
        >();

        const afterBySortOrder = new Map<
          number,
          (typeof groupPhotos)[number]
        >();

        for (const photo of groupPhotos) {
          if (photo.category === BookingPhotoCategory.BEFORE) {
            beforeBySortOrder.set(photo.sortOrder, photo);
          } else {
            afterBySortOrder.set(photo.sortOrder, photo);
          }
        }

        const sortOrders = Array.from(
          new Set([...beforeBySortOrder.keys(), ...afterBySortOrder.keys()]),
        ).sort((first, second) => first - second);

        for (const sortOrder of sortOrders) {
          const beforePhoto = beforeBySortOrder.get(sortOrder);
          const afterPhoto = afterBySortOrder.get(sortOrder);

          const beforeAsset = beforePhoto
            ? await transaction.galleryMediaAsset.create({
                data: {
                  projectId: project.id,
                  storagePath: beforePhoto.storagePath,
                  originalFileName: getLegacyFileName(beforePhoto.storagePath),
                  mimeType: getLegacyMimeType(beforePhoto.storagePath),
                  fileSize: 0,
                },
                select: {
                  id: true,
                },
              })
            : null;

          const afterAsset = afterPhoto
            ? await transaction.galleryMediaAsset.create({
                data: {
                  projectId: project.id,
                  storagePath: afterPhoto.storagePath,
                  originalFileName: getLegacyFileName(afterPhoto.storagePath),
                  mimeType: getLegacyMimeType(afterPhoto.storagePath),
                  fileSize: 0,
                },
                select: {
                  id: true,
                },
              })
            : null;

          const canRemainPublished = Boolean(
            beforePhoto?.isPublished &&
            afterPhoto?.isPublished &&
            beforeAsset &&
            afterAsset,
          );

          await transaction.galleryComparison.create({
            data: {
              projectId: project.id,
              beforeAssetId: beforeAsset?.id ?? null,
              afterAssetId: afterAsset?.id ?? null,
              isPublished: canRemainPublished,
              publishedAt: canRemainPublished
                ? (beforePhoto?.publishedAt ??
                  afterPhoto?.publishedAt ??
                  new Date())
                : null,
              sortOrder,
            },
          });

          migratedComparisons += 1;
        }
      }

      await transaction.bookingPhoto.deleteMany({
        where: {
          id: {
            in: legacyPhotos.map((photo) => photo.id),
          },
        },
      });
    });

    const bookingIds = [
      ...new Set(
        legacyPhotos
          .map((photo) => photo.bookingId)
          .filter((bookingId): bookingId is string => Boolean(bookingId)),
      ),
    ];

    revalidatePath("/admin/gallery");
    revalidatePath("/admin/bookings");
    revalidatePath("/gallery");

    for (const bookingId of bookingIds) {
      revalidatePath(`/admin/bookings/${bookingId}`);
    }

    return {
      success: true,
      message: `${legacyPhotos.length} bestehende Fotos wurden in ${migratedProjects} Galerie-Projekte übernommen.`,
      migratedProjects,
      migratedComparisons,
      migratedPhotos: legacyPhotos.length,
    };
  } catch (error) {
    console.error("Legacy booking-photo migration failed:", error);

    return {
      success: false,
      error: "Die bestehenden Buchungsfotos konnten nicht übernommen werden.",
    };
  }
}

export async function getOrCreateGalleryProjectForBooking(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      select: {
        id: true,
        vehicleModel: true,
      },
    });

    if (!booking) {
      return {
        success: false as const,
        error: "Die Buchung wurde nicht gefunden.",
      };
    }

    const existingProject = await prisma.galleryProject.findFirst({
      where: {
        bookingId: booking.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (existingProject) {
      return {
        success: true as const,
        message: `"${existingProject.title}" wurde geöffnet.`,
        projectId: existingProject.id,
      };
    }

    const project = await prisma.galleryProject.create({
      data: {
        bookingId: booking.id,
        title: `${booking.vehicleModel} · Galerie`,
      },
      select: {
        id: true,
        title: true,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/bookings/${booking.id}`);

    return {
      success: true as const,
      message: `"${project.title}" wurde erstellt.`,
      projectId: project.id,
    };
  } catch (error) {
    console.error("Booking gallery project creation failed:", error);

    return {
      success: false as const,
      error:
        "Das Galerie-Projekt konnte nicht erstellt werden. Bitte versuche es erneut.",
    };
  }
}
