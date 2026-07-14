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
import { localizePublicHref, normalizeLocale } from "../i18n";
import { getGalleryVariantPaths } from "@/app/lib/galleryStoragePaths";

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

export default async function GalleryPage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const locale = normalizeLocale((await searchParams)?.lang);
  const copy = {
    de: { kicker: "JC DETAILING · GALERIE", title: ["Vorher.", "Nachher."], intro: "Ziehe den Regler bei jedem Projekt, um die Veränderung direkt zu vergleichen.", note: "Jeder Vergleich zeigt dieselbe Perspektive vor und nach der Aufbereitung.", vehicle: "DEIN FAHRZEUG", cta: "Bereit für ein Ergebnis, das bleibt?", booking: "Termin buchen" },
    en: { kicker: "JC DETAILING · GALLERY", title: ["Before.", "After."], intro: "Drag the slider on each project to compare the transformation directly.", note: "Every comparison shows the same perspective before and after detailing.", vehicle: "YOUR VEHICLE", cta: "Ready for a result that lasts?", booking: "Book appointment" },
    fr: { kicker: "JC DETAILING · GALERIE", title: ["Avant.", "Après."], intro: "Faites glisser le curseur de chaque projet pour comparer directement la transformation.", note: "Chaque comparaison montre la même perspective avant et après la préparation.", vehicle: "VOTRE VÉHICULE", cta: "Prêt pour un résultat qui dure?", booking: "Prendre rendez-vous" },
    it: { kicker: "JC DETAILING · GALLERIA", title: ["Prima.", "Dopo."], intro: "Sposta il cursore su ogni progetto per confrontare direttamente il cambiamento.", note: "Ogni confronto mostra la stessa prospettiva prima e dopo il detailing.", vehicle: "IL TUO VEICOLO", cta: "Pronto per un risultato che dura?", booking: "Prenota appuntamento" },
  }[locale];
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

        const beforeStoragePath = getGalleryVariantPaths(
          comparison.beforeAsset.storagePath,
        ).display;

        const afterStoragePath = getGalleryVariantPaths(
          comparison.afterAsset.storagePath,
        ).display;

        const [beforeResult, afterResult] = await Promise.all([
          supabaseAdmin.storage
            .from(bookingPhotosBucket)
            .createSignedUrl(beforeStoragePath, 60 * 60),

          supabaseAdmin.storage
            .from(bookingPhotosBucket)
            .createSignedUrl(afterStoragePath, 60 * 60),
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
            {copy.kicker}
          </span>

          <h1>
            {copy.title[0]}
            <br />
            {copy.title[1]}
          </h1>

          <p>
            {copy.intro}
          </p>
        </div>

        <div className="public-gallery-hero-note">
          <span>01</span>
          <p>
            {copy.note}
          </p>
        </div>
      </section>

      <section className="public-gallery-content">
        <GalleryGrid comparisons={comparisons} locale={locale} />
      </section>

      <section className="public-gallery-cta">
        <div>
          <span>{copy.vehicle}</span>
          <h2>{copy.cta}</h2>
        </div>

        <Link href={localizePublicHref("/buchen", locale)}>{copy.booking}</Link>
      </section>
    </main>
  );
}
