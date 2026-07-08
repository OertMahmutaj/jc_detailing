"use client";

import {
  type ChangeEvent,
  useRef,
  useState,
} from "react";
import {
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "../_lib/supabaseBrowser";
import { useAdminNotification } from "./AdminNotificationProvider";

type GallerySlot = "BEFORE" | "AFTER";

type GalleryAsset = {
  id: string;
  originalFileName: string | null;
  url: string | null;
};

type AdminGalleryMediaSlotProps = {
  asset: GalleryAsset | null;
  comparisonId: string;
  projectId: string;
  slot: GallerySlot;
};

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxPhotoSizeInBytes = 10 * 1024 * 1024;

function getSlotLabel(slot: GallerySlot) {
  return slot === "BEFORE" ? "Vorher" : "Nachher";
}

async function getResponseError(response: Response) {
  const data = await response.json().catch(() => null);

  if (data && typeof data.error === "string") {
    return data.error;
  }

  return "Die Aktion konnte nicht ausgeführt werden.";
}

export function AdminGalleryMediaSlot({
  asset,
  comparisonId,
  projectId,
  slot,
}: AdminGalleryMediaSlotProps) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const slotLabel = getSlotLabel(slot);

  function openFilePicker() {
    inputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!allowedMimeTypes.includes(file.type)) {
      showNotification(
        "Nur JPEG-, PNG- und WebP-Bilder sind erlaubt.",
        "error"
      );
      return;
    }

    if (file.size <= 0 || file.size > maxPhotoSizeInBytes) {
      showNotification(
        "Ein Bild darf maximal 10 MB gross sein.",
        "error"
      );
      return;
    }

    try {
      setIsUploading(true);

      const uploadUrlResponse = await fetch(
        "/api/admin/gallery-media/upload-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            comparisonId,
            slot,
            contentType: file.type,
            fileSize: file.size,
          }),
        }
      );

      if (!uploadUrlResponse.ok) {
        throw new Error(await getResponseError(uploadUrlResponse));
      }

      const uploadData = (await uploadUrlResponse.json()) as {
        bucket: string;
        storagePath: string;
        token: string;
      };

      const supabase = getBrowserSupabaseClient();

      const { error: uploadError } = await supabase.storage
        .from(uploadData.bucket)
        .uploadToSignedUrl(
          uploadData.storagePath,
          uploadData.token,
          file
        );

      if (uploadError) {
        throw new Error(
          "Das Bild konnte nicht in den Speicher hochgeladen werden."
        );
      }

      const completionResponse = await fetch(
        "/api/admin/gallery-media/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            comparisonId,
            slot,
            storagePath: uploadData.storagePath,
            originalFileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
          }),
        }
      );

      if (!completionResponse.ok) {
        throw new Error(await getResponseError(completionResponse));
      }

      showNotification(
        asset
          ? `${slotLabel}-Bild wurde ersetzt.`
          : `${slotLabel}-Bild wurde hochgeladen.`,
        "success"
      );

      router.refresh();
    } catch (error) {
      console.error("Gallery media upload failed:", error);

      showNotification(
        error instanceof Error
          ? error.message
          : "Das Bild konnte nicht hochgeladen werden.",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteAsset() {
    try {
      setIsDeleting(true);

      const response = await fetch("/api/admin/gallery-media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          comparisonId,
          slot,
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      setIsDeleteConfirmationOpen(false);

      showNotification(
        `${slotLabel}-Bild wurde entfernt. Der Vergleich ist nun nicht mehr veröffentlicht.`,
        "success"
      );

      router.refresh();
    } catch (error) {
      console.error("Gallery media deletion failed:", error);

      showNotification(
        error instanceof Error
          ? error.message
          : "Das Bild konnte nicht gelöscht werden.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section
      className={[
        "admin-gallery-media-slot",
        asset ? "has-image" : "is-empty",
      ].join(" ")}
    >
      <input
        accept="image/jpeg,image/png,image/webp"
        className="admin-gallery-media-file-input"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      <header className="admin-gallery-media-slot-head">
        <span>{slotLabel}</span>

        {asset ? (
          <small>Bild vorhanden</small>
        ) : (
          <small>Bild fehlt</small>
        )}
      </header>

      {asset ? (
        <>
          <div className="admin-gallery-media-preview">
            {asset.url ? (
              <img
                alt={`${slotLabel}-Bild für den Vorher-Nachher-Vergleich`}
                src={asset.url}
              />
            ) : (
              <div className="admin-gallery-media-preview-unavailable">
                Vorschau konnte nicht geladen werden.
              </div>
            )}
          </div>

          <div className="admin-gallery-media-file-name">
            {asset.originalFileName || `${slotLabel}-Bild`}
          </div>

          {isDeleteConfirmationOpen ? (
            <div className="admin-gallery-media-delete-confirmation">
              <p>
                Dieses {slotLabel.toLowerCase()}-Bild wirklich entfernen?
              </p>

              <div>
                <button
                  className="admin-gallery-media-button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteConfirmationOpen(false)}
                  type="button"
                >
                  <X size={15} />
                  Abbrechen
                </button>

                <button
                  className="admin-gallery-media-button admin-gallery-media-button-danger"
                  disabled={isDeleting}
                  onClick={deleteAsset}
                  type="button"
                >
                  {isDeleting ? (
                    <LoaderCircle className="admin-spinner" size={15} />
                  ) : (
                    <Trash2 size={15} />
                  )}

                  {isDeleting ? "Wird gelöscht..." : "Bild löschen"}
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-gallery-media-actions">
              <button
                className="admin-gallery-media-button"
                disabled={isUploading || isDeleting}
                onClick={openFilePicker}
                type="button"
              >
                {isUploading ? (
                  <LoaderCircle className="admin-spinner" size={15} />
                ) : (
                  <RefreshCw size={15} />
                )}

                {isUploading ? "Wird hochgeladen..." : "Ersetzen"}
              </button>

              <button
                aria-label={`${slotLabel}-Bild löschen`}
                className="admin-gallery-media-button admin-gallery-media-button-icon"
                disabled={isUploading || isDeleting}
                onClick={() => setIsDeleteConfirmationOpen(true)}
                title={`${slotLabel}-Bild löschen`}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="admin-gallery-media-empty">
          <ImagePlus size={20} />

          <strong>Noch kein {slotLabel.toLowerCase()}-Bild</strong>

          <p>JPEG, PNG oder WebP · maximal 10 MB</p>

          <button
            className="admin-gallery-media-button"
            disabled={isUploading}
            onClick={openFilePicker}
            type="button"
          >
            {isUploading ? (
              <LoaderCircle className="admin-spinner" size={15} />
            ) : (
              <Upload size={15} />
            )}

            {isUploading ? "Wird hochgeladen..." : "Bild hochladen"}
          </button>
        </div>
      )}
    </section>
  );
}