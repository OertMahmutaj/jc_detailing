import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import {
  GalleryGrid,
  type GalleryComparison,
} from "./GalleryGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vorher-Nachher Galerie",
  description:
    "Vorher-Nachher Galerie von JC Detailing in Wauwil, Luzern. Sieh echte Ergebnisse professioneller Fahrzeugaufbereitung, Politur, Innenreinigung und Keramikversiegelung.",

  alternates: {
    canonical: "/gallery",
  },

  openGraph: {
    title: "Vorher-Nachher Galerie | JC Detailing",
    description:
      "Echte Vorher-Nachher Ergebnisse professioneller Autoaufbereitung in Wauwil, Kanton Luzern.",
    url: "/gallery",
    type: "website",
    locale: "de_CH",
    siteName: "JC Detailing",
  },

  twitter: {
    card: "summary_large_image",
    title: "Vorher-Nachher Galerie | JC Detailing",
    description:
      "Echte Ergebnisse von JC Detailing: Fahrzeugaufbereitung, Politur, Innenreinigung und Keramikversiegelung in Wauwil, Luzern.",
  },
};

export default async function GalleryPage() {
  const managedComparisons = await prisma.galleryComparison.findMany({
    where: {
      isPublished: true,
      beforeAssetId: {
        not: null,
      },
      afterAssetId: {
        not: null,
      },
    },
    select: {
      id: true,
      publishedAt: true,
      sortOrder: true,
      beforeAsset: {
        select: {
          storagePath: true,
          cropScale: true,
        },
      },
      afterAsset: {
        select: {
          storagePath: true,
          cropScale: true,
        },
      },
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
      {
        sortOrder: "asc",
      },
    ],
  });

  const comparisons = (
    await Promise.all(
      managedComparisons.map(async (comparison) => {
        if (!comparison.beforeAsset || !comparison.afterAsset) {
          return null;
        }

        const [beforeResult, afterResult] = await Promise.all([
          supabaseAdmin.storage
            .from(bookingPhotosBucket)
            .createSignedUrl(comparison.beforeAsset.storagePath, 60 * 60),
          supabaseAdmin.storage
            .from(bookingPhotosBucket)
            .createSignedUrl(comparison.afterAsset.storagePath, 60 * 60),
        ]);

        if (
          beforeResult.error ||
          afterResult.error ||
          !beforeResult.data?.signedUrl ||
          !afterResult.data?.signedUrl
        ) {
          console.error(
            "Gallery comparison URLs could not be created:",
            beforeResult.error ?? afterResult.error,
          );

          return null;
        }

        return {
          id: comparison.id,
          beforeUrl: beforeResult.data.signedUrl,
          afterUrl: afterResult.data.signedUrl,
          beforeCropScale: comparison.beforeAsset.cropScale,
          afterCropScale: comparison.afterAsset.cropScale,
        } satisfies GalleryComparison;
      }),
    )
  ).filter(
    (comparison): comparison is GalleryComparison => comparison !== null,
  );

  return (
    <main className="public-gallery-page">
      <section className="public-gallery-hero">
        <div className="public-gallery-hero-copy">
          <span className="public-gallery-kicker">
            JC DETAILING · GALERIE
          </span>

          <h1>
            Vorher.
            <br />
            Nachher.
          </h1>

          <p>
            Ziehe den Regler bei jedem Projekt, um die Veränderung direkt zu
            vergleichen.
          </p>
        </div>

        <div className="public-gallery-hero-note">
          <span>01</span>
          <p>
            Jeder Vergleich zeigt dieselbe Perspektive vor und nach der
            Aufbereitung.
          </p>
        </div>
      </section>

      <section className="public-gallery-content">
        <GalleryGrid comparisons={comparisons} />
      </section>

      <section className="public-gallery-cta">
        <div>
          <span>DEIN FAHRZEUG</span>
          <h2>Bereit für ein Ergebnis, das bleibt?</h2>
        </div>

        <Link href="/buchen?lang=de">Termin buchen</Link>
      </section>
    </main>
  );
}