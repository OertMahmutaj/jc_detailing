"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  EyeOff,
  Globe,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createGalleryComparison,
  deleteGalleryComparison,
} from "../_actions/galleryActions";
import { useAdminNotification } from "./AdminNotificationProvider";
import { AdminGalleryMediaSlot } from "./AdminGalleryMediaSlot";

type GalleryAsset = {
  id: string;
  originalFileName: string | null;
  url: string | null;
};

type Comparison = {
  id: string;
  label: string | null;
  beforeAsset: GalleryAsset | null;
  afterAsset: GalleryAsset | null;
  isPublished: boolean;
  sortOrder: number;
};

type AdminGalleryProjectEditorProps = {
  projectId: string;
  comparisons: Comparison[];
};

async function getResponseError(response: Response) {
  const data = await response.json().catch(() => null);

  if (data && typeof data.error === "string") {
    return data.error;
  }

  return "Die Aktion konnte nicht ausgeführt werden.";
}

function getComparisonStatus(comparison: Comparison) {
  const isComplete = Boolean(
    comparison.beforeAsset && comparison.afterAsset
  );

  if (!isComplete) {
    return "Unvollständig";
  }

  return comparison.isPublished
    ? "Veröffentlicht"
    : "Bereit zum Veröffentlichen";
}

export function AdminGalleryProjectEditor({
  projectId,
  comparisons,
}: AdminGalleryProjectEditorProps) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const [isPending, startTransition] = useTransition();
  const [publishingComparisonId, setPublishingComparisonId] = useState<
    string | null
  >(null);

  function handleCreateComparison(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createGalleryComparison(formData);

      if (!result.success) {
        showNotification(result.error, "error");
        return;
      }

      form.reset();
      showNotification(result.message, "success");
      router.refresh();
    });
  }

  function handleDeleteComparison(comparisonId: string) {
    const formData = new FormData();

    formData.set("projectId", projectId);
    formData.set("comparisonId", comparisonId);

    startTransition(async () => {
      const result = await deleteGalleryComparison(formData);

      if (!result.success) {
        showNotification(result.error, "error");
        return;
      }

      showNotification(result.message, "success");
      router.refresh();
    });
  }

  async function togglePublication(comparison: Comparison) {
    const isComplete = Boolean(
      comparison.beforeAsset && comparison.afterAsset
    );

    if (!isComplete) {
      showNotification(
        "Lade zuerst ein Vorher- und ein Nachher-Bild hoch.",
        "error"
      );
      return;
    }

    const nextIsPublished = !comparison.isPublished;

    try {
      setPublishingComparisonId(comparison.id);

      const response = await fetch("/api/admin/gallery-comparisons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          comparisonId: comparison.id,
          isPublished: nextIsPublished,
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      showNotification(
        nextIsPublished
          ? "Vergleich wurde in der Galerie veröffentlicht."
          : "Vergleich wurde aus der Galerie entfernt.",
        "success"
      );

      router.refresh();
    } catch (error) {
      console.error("Gallery comparison publication failed:", error);

      showNotification(
        error instanceof Error
          ? error.message
          : "Der Veröffentlichungsstatus konnte nicht geändert werden.",
        "error"
      );
    } finally {
      setPublishingComparisonId(null);
    }
  }

  return (
    <div className="admin-gallery-project-editor">
      <form
        className="admin-gallery-comparison-create"
        onSubmit={handleCreateComparison}
      >
        <input name="projectId" type="hidden" value={projectId} />

        <label>
          <span>Bezeichnung</span>

          <input
            maxLength={100}
            name="label"
            placeholder="Zum Beispiel: Fahrersitz, Motorhaube oder Felge"
            type="text"
          />
        </label>

        <button
          className="admin-submit-button"
          disabled={isPending}
          type="submit"
        >
          <Plus size={16} />
          Vergleich hinzufügen
        </button>
      </form>

      {comparisons.length ? (
        <div className="admin-gallery-comparison-list">
          {comparisons.map((comparison, index) => {
            const isEmpty = !comparison.beforeAsset && !comparison.afterAsset;
            const isComplete = Boolean(
              comparison.beforeAsset && comparison.afterAsset
            );

            const isPublishing =
              publishingComparisonId === comparison.id;

            return (
              <article
                className="admin-gallery-comparison-card"
                key={comparison.id}
              >
                <div className="admin-gallery-comparison-head">
                  <div>
                    <span>VERGLEICH {index + 1}</span>
                    <h3>{comparison.label || "Unbenannter Vergleich"}</h3>
                  </div>

                  <div className="admin-gallery-comparison-actions">
                    <span
                      className={[
                        "admin-status-pill",
                        isComplete ? "is-ready" : "is-open",
                      ].join(" ")}
                    >
                      {getComparisonStatus(comparison)}
                    </span>

                    {isComplete ? (
                      <button
                        className={[
                          "admin-gallery-publish-button",
                          comparison.isPublished ? "is-published" : "",
                        ].join(" ")}
                        disabled={isPublishing}
                        onClick={() => togglePublication(comparison)}
                        type="button"
                      >
                        {isPublishing ? (
                          <LoaderCircle
                            className="admin-spinner"
                            size={15}
                          />
                        ) : comparison.isPublished ? (
                          <EyeOff size={15} />
                        ) : (
                          <Globe size={15} />
                        )}

                        {comparison.isPublished
                          ? "Aus Galerie entfernen"
                          : "Veröffentlichen"}
                      </button>
                    ) : null}

                    {isEmpty ? (
                      <button
                        aria-label={`Leeren Vergleich ${index + 1} löschen`}
                        className="admin-gallery-empty-comparison-delete"
                        disabled={isPending}
                        onClick={() =>
                          handleDeleteComparison(comparison.id)
                        }
                        title="Leeren Vergleich löschen"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="admin-gallery-comparison-slots">
                  <AdminGalleryMediaSlot
                    asset={comparison.beforeAsset}
                    comparisonId={comparison.id}
                    projectId={projectId}
                    slot="BEFORE"
                  />

                  <AdminGalleryMediaSlot
                    asset={comparison.afterAsset}
                    comparisonId={comparison.id}
                    projectId={projectId}
                    slot="AFTER"
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="admin-gallery-empty">
          <strong>Noch keine Vergleiche</strong>
          <p>
            Erstelle einen Vergleich für jede Perspektive, die später als
            Vorher-Nachher-Slider erscheinen soll.
          </p>
        </div>
      )}
    </div>
  );
}