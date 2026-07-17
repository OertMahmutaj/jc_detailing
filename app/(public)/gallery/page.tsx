import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { CalendarCheck } from "lucide-react";

import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import {
  bookingPhotosBucket,
  supabaseAdmin,
} from "@/app/(admin)/admin/_lib/supabaseAdmin";
import { getGalleryVariantPaths } from "@/app/lib/galleryStoragePaths";

import {
  GalleryGrid,
  type GalleryComparison,
} from "./GalleryGrid";
import {
  intlLocales,
  localizePublicHref,
  normalizeLocale,
} from "../i18n";
import { buildPublicMetadata, publicPageSeo } from "../seo";

export const dynamic = "force-dynamic";

const GALLERY_PAGE_SIZE = 6;

type GalleryPageProps = {
  searchParams?: Promise<{
    lang?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: GalleryPageProps): Promise<Metadata> {
  const locale = normalizeLocale((await searchParams)?.lang);

  return buildPublicMetadata(locale, {
    path: "/gallery",
    ...publicPageSeo.gallery[locale],
  });
}

const publishedComparisonWhere = {
  isPublished: true,

  beforeAssetId: {
    not: null,
  },

  afterAssetId: {
    not: null,
  },
} satisfies Prisma.GalleryComparisonWhereInput;

export default async function GalleryPage({
  searchParams,
}: GalleryPageProps) {
  const params = (await searchParams) ?? {};

  const locale = normalizeLocale(params.lang);

  const requestedPage = Math.max(
    1,
    Number.parseInt(params.page ?? "1", 10) || 1,
  );

  const copy = {
    de: {
      kicker: "JC DETAILING · GALERIE",
      title: ["Vorher.", "Nachher."],
      intro:
        "Ziehe den Regler bei jedem Projekt, um die Veränderung direkt zu vergleichen.",
      note:
        "Jeder Vergleich zeigt dieselbe Perspektive vor und nach der Aufbereitung.",
      vehicle: "DEIN FAHRZEUG",
      cta: "Bereit für ein Ergebnis, das bleibt?",
      booking: "Termin buchen",
      previous: "Zurück",
      next: "Weiter",
      page: "Seite",
      paginationLabel: "Galerieseiten",
    },

    en: {
      kicker: "JC DETAILING · GALLERY",
      title: ["Before.", "After."],
      intro:
        "Drag the slider on each project to compare the transformation directly.",
      note:
        "Every comparison shows the same perspective before and after detailing.",
      vehicle: "YOUR VEHICLE",
      cta: "Ready for a result that lasts?",
      booking: "Book appointment",
      previous: "Previous",
      next: "Next",
      page: "Page",
      paginationLabel: "Gallery pages",
    },

    fr: {
      kicker: "JC DETAILING · GALERIE",
      title: ["Avant.", "Après."],
      intro:
        "Faites glisser le curseur de chaque projet pour comparer directement la transformation.",
      note:
        "Chaque comparaison montre la même perspective avant et après la préparation.",
      vehicle: "VOTRE VÉHICULE",
      cta: "Prêt pour un résultat qui dure?",
      booking: "Prendre rendez-vous",
      previous: "Précédent",
      next: "Suivant",
      page: "Page",
      paginationLabel: "Pages de la galerie",
    },

    it: {
      kicker: "JC DETAILING · GALLERIA",
      title: ["Prima.", "Dopo."],
      intro:
        "Sposta il cursore su ogni progetto per confrontare direttamente il cambiamento.",
      note:
        "Ogni confronto mostra la stessa prospettiva prima e dopo il detailing.",
      vehicle: "IL TUO VEICOLO",
      cta: "Pronto per un risultato che dura?",
      booking: "Prenota appuntamento",
      previous: "Indietro",
      next: "Avanti",
      page: "Pagina",
      paginationLabel: "Pagine della galleria",
    },
  }[locale];

  const totalComparisons =
    await prisma.galleryComparison.count({
      where: publishedComparisonWhere,
    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalComparisons / GALLERY_PAGE_SIZE,
    ),
  );

  const currentPage = Math.min(
    requestedPage,
    totalPages,
  );

  const managedComparisons =
    await prisma.galleryComparison.findMany({
      where: publishedComparisonWhere,

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

      skip:
        (currentPage - 1) *
        GALLERY_PAGE_SIZE,

      take: GALLERY_PAGE_SIZE,
    });

  const comparisons = (
    await Promise.all(
      managedComparisons.map(
        async (comparison) => {
          if (
            !comparison.beforeAsset ||
            !comparison.afterAsset
          ) {
            return null;
          }

          const beforeStoragePath =
            getGalleryVariantPaths(
              comparison.beforeAsset.storagePath,
            ).display;

          const afterStoragePath =
            getGalleryVariantPaths(
              comparison.afterAsset.storagePath,
            ).display;

          const [
            beforeResult,
            afterResult,
          ] = await Promise.all([
            supabaseAdmin.storage
              .from(bookingPhotosBucket)
              .createSignedUrl(
                beforeStoragePath,
                60 * 60,
              ),

            supabaseAdmin.storage
              .from(bookingPhotosBucket)
              .createSignedUrl(
                afterStoragePath,
                60 * 60,
              ),
          ]);

          if (
            beforeResult.error ||
            afterResult.error ||
            !beforeResult.data?.signedUrl ||
            !afterResult.data?.signedUrl
          ) {
            console.error(
              "Gallery comparison URLs could not be created:",
              beforeResult.error ??
              afterResult.error,
            );

            return null;
          }

          return {
            id: comparison.id,

            beforeUrl:
              beforeResult.data.signedUrl,

            afterUrl:
              afterResult.data.signedUrl,

            beforeCropScale:
              comparison.beforeAsset.cropScale,

            afterCropScale:
              comparison.afterAsset.cropScale,
          } satisfies GalleryComparison;
        },
      ),
    )
  ).filter(
    (
      comparison,
    ): comparison is GalleryComparison =>
      comparison !== null,
  );

  function galleryPageHref(page: number) {
    const localizedHref =
      localizePublicHref(
        "/gallery",
        locale,
      );

    const [
      pathname,
      existingQuery = "",
    ] = localizedHref.split("?");

    const queryParams =
      new URLSearchParams(existingQuery);

    if (page > 1) {
      queryParams.set(
        "page",
        String(page),
      );
    } else {
      queryParams.delete("page");
    }

    const queryString =
      queryParams.toString();

    const pageHref = queryString
      ? `${pathname}?${queryString}`
      : pathname;

    return `${pageHref}#gallery-grid`;
  }

  return (
    <main className="public-gallery-page" lang={intlLocales[locale]}>
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

          <p>{copy.intro}</p>
        </div>

        <div className="public-gallery-hero-note">
          <span>01</span>
          <p>{copy.note}</p>
        </div>
      </section>

      <section className="public-gallery-content" id="gallery-grid">
        <GalleryGrid
          comparisons={comparisons}
          locale={locale}
        />

        {totalPages > 1 ? (
          <nav
            aria-label={
              copy.paginationLabel
            }
            className="public-gallery-pagination"
          >
            {currentPage > 1 ? (
              <Link
                className="public-gallery-pagination-link"
                href={galleryPageHref(
                  currentPage - 1,
                )}
                scroll
              >
                <span aria-hidden="true">
                  ←
                </span>

                {copy.previous}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="public-gallery-pagination-link is-disabled"
              >
                <span aria-hidden="true">
                  ←
                </span>

                {copy.previous}
              </span>
            )}

            <span className="public-gallery-pagination-status">
              {copy.page} {currentPage} /{" "}
              {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                className="public-gallery-pagination-link"
                href={galleryPageHref(
                  currentPage + 1,
                )}
                scroll
              >
                {copy.next}

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="public-gallery-pagination-link is-disabled"
              >
                {copy.next}

                <span aria-hidden="true">
                  →
                </span>
              </span>
            )}
          </nav>
        ) : null}
      </section>

      <section className="public-gallery-cta">
        <div>
          <span>{copy.vehicle}</span>
          <h2>{copy.cta}</h2>
        </div>

        <Link
          className="primary-button"
          href={`${localizePublicHref("/buchen", locale)}#booking`}
        >
          {copy.booking}
          <CalendarCheck size={17} />
        </Link>
      </section>
    </main>
  );
}
