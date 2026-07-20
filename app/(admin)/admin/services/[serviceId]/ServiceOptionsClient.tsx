"use client";

import {
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

type VehicleOption = {
  id: string;
  isActive: boolean;
  priceModifier: number;
  vehicleCategory: {
    id: string;
    imageUrl: string | null;
    isActive: boolean;
    name: string;
  };
};

type AddOnOption = {
  id: string;
  additionalDuration: number;
  isActive: boolean;
  price: number;
  addOn: {
    id: string;
    isActive: boolean;
    name: string;
  };
};

type ServiceWithOptions = {
  id: string;
  name: string;
  vehicleOptions: VehicleOption[];
  addOnOptions: AddOnOption[];
};

function splitDuration(totalMinutes: number) {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

function readDuration(formData: FormData) {
  const hours = Number(formData.get("durationHours") ?? 0);
  const minutes = Number(formData.get("durationMinutesRemainder") ?? 0);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

async function imageFileToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Bitte ein Bild auswaehlen.");
  }

  if (file.size > 6 * 1024 * 1024) {
    throw new Error("Das Bild ist zu gross. Bitte ein Bild unter 6 MB verwenden.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
      nextImage.src = objectUrl;
    });

    const maxWidth = 900;
    const maxHeight = 620;
    const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Bild konnte nicht vorbereitet werden.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/webp", 0.78);
    if (dataUrl.length > 950000) {
      throw new Error("Das Bild ist nach dem Verkleinern noch zu gross.");
    }

    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function readResponseMessage(response: Response, fallback: string) {
  try {
    const result = await response.json();
    return typeof result.message === "string" ? result.message : fallback;
  } catch {
    return fallback;
  }
}

export default function ServiceOptionsClient({
  service,
}: {
  service: ServiceWithOptions;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);
  const [imageDrafts, setImageDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState("");

  const endpoint = `/api/admin/services/${service.id}/options`;

  function setSuccess(text: string) {
    setNotice({ text, tone: "success" });
  }

  function setError(text: string) {
    setNotice({ text, tone: "error" });
  }

  async function handleVehicleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    key: string,
  ) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await imageFileToDataUrl(file);
      setImageDrafts((current) => ({ ...current, [key]: imageUrl }));
      setSuccess("Bild vorbereitet. Bitte speichern.");
    } catch (error) {
      event.currentTarget.value = "";
      setError(error instanceof Error ? error.message : "Bild konnte nicht vorbereitet werden.");
    }
  }

  function clearImageDraft(key: string) {
    setImageDrafts((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function createVehicleOption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSavingKey("create-vehicle");
    setNotice(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: formData.get("imageUrl"),
          name: formData.get("name"),
          priceModifier: formData.get("priceModifier"),
          type: "vehicle",
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Fahrzeugoption konnte nicht erstellt werden."),
        );
      }

      form.reset();
      clearImageDraft("create-vehicle");
      setSuccess("Fahrzeugoption erstellt.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Fahrzeugoption konnte nicht erstellt werden.",
      );
    } finally {
      setSavingKey("");
    }
  }

  async function createAddOnOption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const additionalDuration = readDuration(formData);

    if (additionalDuration === null) {
      setError("Bitte Dauer pruefen.");
      return;
    }

    setSavingKey("create-add-on");
    setNotice(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          additionalDuration,
          name: formData.get("name"),
          price: formData.get("price"),
          type: "addOn",
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Zusatzleistung konnte nicht erstellt werden."),
        );
      }

      form.reset();
      setSuccess("Zusatzleistung erstellt.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Zusatzleistung konnte nicht erstellt werden.",
      );
    } finally {
      setSavingKey("");
    }
  }

  async function updateVehicleOption(
    event: FormEvent<HTMLFormElement>,
    optionId: string,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setSavingKey(optionId);
    setNotice(null);

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: formData.get("imageUrl"),
          isActive: formData.get("isActive") === "on",
          name: formData.get("name"),
          optionId,
          priceModifier: formData.get("priceModifier"),
          type: "vehicle",
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Fahrzeugoption konnte nicht gespeichert werden."),
        );
      }

      clearImageDraft(optionId);
      setSuccess("Fahrzeugoption gespeichert.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Fahrzeugoption konnte nicht gespeichert werden.",
      );
    } finally {
      setSavingKey("");
    }
  }

  async function updateAddOnOption(
    event: FormEvent<HTMLFormElement>,
    optionId: string,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const additionalDuration = readDuration(formData);

    if (additionalDuration === null) {
      setError("Bitte Dauer pruefen.");
      return;
    }

    setSavingKey(optionId);
    setNotice(null);

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          additionalDuration,
          isActive: formData.get("isActive") === "on",
          name: formData.get("name"),
          optionId,
          price: formData.get("price"),
          type: "addOn",
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Zusatzleistung konnte nicht gespeichert werden."),
        );
      }

      setSuccess("Zusatzleistung gespeichert.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Zusatzleistung konnte nicht gespeichert werden.",
      );
    } finally {
      setSavingKey("");
    }
  }

  async function deleteOption(type: "vehicle" | "addOn", optionId: string) {
    if (!window.confirm("Diese Option wirklich entfernen?")) return;

    setSavingKey(optionId);
    setNotice(null);

    try {
      const response = await fetch(
        `${endpoint}?type=${encodeURIComponent(type)}&optionId=${encodeURIComponent(optionId)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Option konnte nicht entfernt werden."),
        );
      }

      setSuccess("Option entfernt.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Option konnte nicht entfernt werden.",
      );
    } finally {
      setSavingKey("");
    }
  }

  return (
    <section className="admin-service-options-grid">
      {notice && (
        <p
          className={`admin-services-message admin-service-options-message is-${notice.tone}`}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.text}
        </p>
      )}

      <article className="admin-panel admin-service-option-panel">
        <div className="admin-panel-head">
          <div>
            <span>Fahrzeuge</span>
            <h2>Fahrzeugoptionen</h2>
          </div>
          <p>Aktive Fahrzeuge werden im Buchungsformular fuer diese Leistung angezeigt.</p>
        </div>

        <form
          className="admin-service-option-create"
          onSubmit={createVehicleOption}
        >
          <label>
            Fahrzeug
            <input maxLength={90} name="name" placeholder="z. B. Kombi" required />
          </label>
          <label>
            Aufpreis CHF
            <input min="0" name="priceModifier" required step="0.01" type="number" />
          </label>
          <label className="is-wide">
            Bild
            <span className="admin-image-upload">
              <input
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => handleVehicleImageChange(event, "create-vehicle")}
                type="file"
              />
              <input
                name="imageUrl"
                readOnly
                type="hidden"
                value={imageDrafts["create-vehicle"] ?? ""}
              />
            </span>
          </label>
          <button
            className="admin-primary-button"
            disabled={savingKey === "create-vehicle"}
            type="submit"
          >
            <Plus size={16} />
            Fahrzeug hinzufuegen
          </button>
        </form>

        <div className="admin-service-option-list">
          {service.vehicleOptions.map((option) => {
            const savedImageUrl = option.vehicleCategory.imageUrl ?? "";
            const imageUrl = imageDrafts[option.id] ?? savedImageUrl;

            return (
              <form
                className="admin-service-option-form"
                key={option.id}
                onSubmit={(event) => updateVehicleOption(event, option.id)}
              >
                <div className="admin-service-option-preview">
                  {imageUrl ? (
                    <span style={{ backgroundImage: `url(${imageUrl})` }} />
                  ) : (
                    <ImageIcon size={20} />
                  )}
                </div>

                <label>
                  Fahrzeug
                  <input
                    defaultValue={option.vehicleCategory.name}
                    maxLength={90}
                    name="name"
                    required
                  />
                </label>

                <label>
                  Aufpreis CHF
                  <input
                    defaultValue={option.priceModifier}
                    min="0"
                    name="priceModifier"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>

                <label className="is-wide">
                  Bild
                  <span className="admin-image-upload">
                    <input
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => handleVehicleImageChange(event, option.id)}
                      type="file"
                    />
                    <input name="imageUrl" readOnly type="hidden" value={imageUrl} />
                  </span>
                </label>

                <label className="admin-service-option-toggle">
                  <input
                    defaultChecked={option.isActive}
                    name="isActive"
                    type="checkbox"
                  />
                  Aktiv
                </label>

                <div className="admin-service-option-actions">
                  <button
                    className="admin-primary-button"
                    disabled={savingKey === option.id}
                    type="submit"
                  >
                    <Save size={16} />
                    Speichern
                  </button>
                  <button
                    className="admin-danger-button"
                    disabled={savingKey === option.id}
                    onClick={() => deleteOption("vehicle", option.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                    Entfernen
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      </article>

      <article className="admin-panel admin-service-option-panel">
        <div className="admin-panel-head">
          <div>
            <span>Extras</span>
            <h2>Add-ons</h2>
          </div>
          <p>Nur aktive Add-ons dieser Leistung erscheinen im passenden Extras-Schritt.</p>
        </div>

        <form className="admin-service-option-create" onSubmit={createAddOnOption}>
          <label className="is-wide">
            Add-on
            <input
              maxLength={90}
              name="name"
              placeholder="z. B. Dachhimmel Reinigung"
              required
            />
          </label>
          <label>
            Preis CHF
            <input min="0" name="price" required step="0.01" type="number" />
          </label>
          <label>
            Stunden
            <input min="0" name="durationHours" required type="number" />
          </label>
          <label>
            Minuten
            <input
              max="59"
              min="0"
              name="durationMinutesRemainder"
              required
              type="number"
            />
          </label>
          <button
            className="admin-primary-button"
            disabled={savingKey === "create-add-on"}
            type="submit"
          >
            <Plus size={16} />
            Add-on hinzufuegen
          </button>
        </form>

        <div className="admin-service-option-list">
          {service.addOnOptions.map((option) => {
            const duration = splitDuration(option.additionalDuration);

            return (
              <form
                className="admin-service-option-form is-addon"
                key={option.id}
                onSubmit={(event) => updateAddOnOption(event, option.id)}
              >
                <div className="admin-service-option-preview">
                  <Wrench size={20} />
                </div>

                <label className="is-wide">
                  Add-on
                  <input
                    defaultValue={option.addOn.name}
                    maxLength={90}
                    name="name"
                    required
                  />
                </label>

                <label>
                  Preis CHF
                  <input
                    defaultValue={option.price}
                    min="0"
                    name="price"
                    required
                    step="0.01"
                    type="number"
                  />
                </label>

                <label>
                  Stunden
                  <input
                    defaultValue={duration.hours}
                    min="0"
                    name="durationHours"
                    required
                    type="number"
                  />
                </label>

                <label>
                  Minuten
                  <input
                    defaultValue={duration.minutes}
                    max="59"
                    min="0"
                    name="durationMinutesRemainder"
                    required
                    type="number"
                  />
                </label>

                <label className="admin-service-option-toggle">
                  <input
                    defaultChecked={option.isActive}
                    name="isActive"
                    type="checkbox"
                  />
                  Aktiv
                </label>

                <div className="admin-service-option-actions">
                  <button
                    className="admin-primary-button"
                    disabled={savingKey === option.id}
                    type="submit"
                  >
                    <Save size={16} />
                    Speichern
                  </button>
                  <button
                    className="admin-danger-button"
                    disabled={savingKey === option.id}
                    onClick={() => deleteOption("addOn", option.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                    Entfernen
                  </button>
                </div>
              </form>
            );
          })}

          {!service.addOnOptions.length && (
            <p className="admin-empty">Noch keine Add-ons fuer diese Leistung.</p>
          )}
        </div>
      </article>
    </section>
  );
}
