"use client";

import { getBrowserSupabaseClient } from "../_lib/supabaseBrowser";
import {
  ImagePlus,
  LoaderCircle,
  Maximize2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAdminNotification } from "./AdminNotificationProvider";

type BookingPhoto = {
  id: string;
  url: string;
};

type BookingPhotoUploaderProps = {
  bookingId: string;
};

const maxPhotoSizeInBytes = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function getResponseError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return data?.error || "Die Aktion konnte nicht abgeschlossen werden.";
}

export function BookingPhotoUploader({
  bookingId,
}: BookingPhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { showNotification } = useAdminNotification();

  const [photos, setPhotos] = useState<BookingPhoto[]>([]);
  const [activePhoto, setActivePhoto] = useState<BookingPhoto | null>(null);
  const [deleteIntentId, setDeleteIntentId] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadPhotos = useCallback(async () => {
    try {
      setIsLoadingPhotos(true);
      setLoadError("");

      const params = new URLSearchParams({
        bookingId,
        category: "DAMAGE",
      });

      const response = await fetch(
        `/api/admin/booking-photos?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      const data = (await response.json()) as {
        photos?: BookingPhoto[];
      };

      setPhotos(Array.isArray(data.photos) ? data.photos : []);
    } catch (error) {
      console.error("Damage photo load failed:", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "Fotos konnten nicht geladen werden."
      );
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    if (!activePhoto) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActivePhoto(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto]);

  async function uploadPhoto(file: File) {
    if (!allowedMimeTypes.has(file.type)) {
      throw new Error("Nur JPEG-, PNG- und WebP-Bilder sind erlaubt.");
    }

    if (file.size > maxPhotoSizeInBytes) {
      throw new Error(`"${file.name}" ist grösser als 10 MB.`);
    }

    const uploadUrlResponse = await fetch(
      "/api/admin/booking-photos/upload-url",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          category: "DAMAGE",
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

    const { error: storageError } = await supabase.storage
      .from(uploadData.bucket)
      .uploadToSignedUrl(uploadData.storagePath, uploadData.token, file, {
        contentType: file.type,
      });

    if (storageError) {
      throw new Error(
        "Das Bild konnte nicht in den Speicher hochgeladen werden."
      );
    }

    const completionResponse = await fetch(
      "/api/admin/booking-photos/complete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          category: "DAMAGE",
          storagePath: uploadData.storagePath,
        }),
      }
    );

    if (!completionResponse.ok) {
      throw new Error(await getResponseError(completionResponse));
    }
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length || isUploading) {
      return;
    }

    try {
      setIsUploading(true);

      for (const file of files) {
        await uploadPhoto(file);
      }

      await loadPhotos();

      showNotification(
        files.length === 1
          ? "Dokumentationsfoto wurde hochgeladen."
          : `${files.length} Dokumentationsfotos wurden hochgeladen.`,
        "success"
      );
    } catch (error) {
      console.error("Damage photo upload failed:", error);

      showNotification(
        error instanceof Error
          ? error.message
          : "Die Fotos konnten nicht hochgeladen werden.",
        "error"
      );
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function deletePhoto(photoId: string) {
    try {
      setDeletingPhotoId(photoId);

      const response = await fetch("/api/admin/booking-photos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoId,
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      setPhotos((currentPhotos) =>
        currentPhotos.filter((photo) => photo.id !== photoId)
      );

      setActivePhoto((currentPhoto) =>
        currentPhoto?.id === photoId ? null : currentPhoto
      );

      setDeleteIntentId(null);

      showNotification("Foto wurde gelöscht.", "success");
    } catch (error) {
      console.error("Damage photo delete failed:", error);

      showNotification(
        error instanceof Error
          ? error.message
          : "Das Foto konnte nicht gelöscht werden.",
        "error"
      );
    } finally {
      setDeletingPhotoId(null);
    }
  }

  return (
    <div className="admin-photo-upload">
      <input
        accept="image/jpeg,image/png,image/webp"
        disabled={isUploading}
        hidden
        multiple
        onChange={handleFiles}
        ref={inputRef}
        type="file"
      />

      <div className="admin-photo-upload-controls">
        <button
          className="admin-secondary-button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {isUploading ? (
            <>
              <LoaderCircle className="admin-icon-spin" size={17} />
              Fotos werden hochgeladen...
            </>
          ) : (
            <>
              <ImagePlus size={17} />
              Fotos hinzufügen
            </>
          )}
        </button>

        {photos.length > 0 && (
          <span className="admin-photo-upload-count">
            {photos.length} {photos.length === 1 ? "Foto" : "Fotos"}
          </span>
        )}
      </div>

      <small>
        Privat · JPEG, PNG oder WebP · maximal 10 MB pro Bild
      </small>

      {isLoadingPhotos && (
        <div className="admin-photo-loading">
          <LoaderCircle className="admin-icon-spin" size={18} />
          Fotos werden geladen...
        </div>
      )}

      {!isLoadingPhotos && loadError && (
        <p className="admin-photo-error">{loadError}</p>
      )}

      {!isLoadingPhotos && !loadError && photos.length === 0 && (
        <p className="admin-photo-empty">
          Noch keine Schäden- oder Dokumentationsfotos vorhanden.
        </p>
      )}

      {!isLoadingPhotos && !loadError && photos.length > 0 && (
        <div className="admin-photo-grid">
          {photos.map((photo, index) => {
            const isConfirmingDelete = deleteIntentId === photo.id;
            const isDeleting = deletingPhotoId === photo.id;

            return (
              <article className="admin-booking-photo-card" key={photo.id}>
                <button
                  aria-label={`Dokumentationsfoto ${index + 1} vergrössern`}
                  className="admin-booking-photo-preview"
                  onClick={() => setActivePhoto(photo)}
                  type="button"
                >
                  <img
                    alt={`Dokumentationsfoto ${index + 1}`}
                    src={photo.url}
                  />

                  <span className="admin-booking-photo-expand">
                    <Maximize2 size={17} />
                  </span>
                </button>

                {isConfirmingDelete ? (
                  <div className="admin-booking-photo-confirm">
                    <span>Foto löschen?</span>

                    <div>
                      <button
                        disabled={isDeleting}
                        onClick={() => setDeleteIntentId(null)}
                        type="button"
                      >
                        Nein
                      </button>

                      <button
                        className="is-danger"
                        disabled={isDeleting}
                        onClick={() => void deletePhoto(photo.id)}
                        type="button"
                      >
                        {isDeleting ? "..." : "Ja"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    aria-label="Foto löschen"
                    className="admin-booking-photo-delete"
                    onClick={() => setDeleteIntentId(photo.id)}
                    type="button"
                  >
                    <X size={17} />
                  </button>
                )}

                <span className="admin-booking-photo-state">Privat</span>
              </article>
            );
          })}
        </div>
      )}

      {activePhoto && (
        <div
          aria-label="Foto vergrössert"
          aria-modal="true"
          className="admin-photo-lightbox"
          onMouseDown={() => setActivePhoto(null)}
          role="dialog"
        >
          <div
            className="admin-photo-lightbox-content"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Foto schliessen"
              className="admin-photo-lightbox-close"
              onClick={() => setActivePhoto(null)}
              type="button"
            >
              <X size={22} />
            </button>

            <img alt="Vergrösserte Fotoansicht" src={activePhoto.url} />
          </div>
        </div>
      )}
    </div>
  );
}