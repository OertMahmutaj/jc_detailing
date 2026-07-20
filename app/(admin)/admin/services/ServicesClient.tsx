"use client";

import Link from "next/link";
import { Plus, Save, Search, Settings2, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type ServiceRow = {
  id: string;
  basePrice: number;
  bookingUsage: number;
  durationMinutes: number;
  isActive: boolean;
  name: string;
};

function splitDuration(totalMinutes: number) {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

function formatDuration(totalMinutes: number) {
  const { hours, minutes } = splitDuration(totalMinutes);

  if (hours && minutes) return `${hours}h ${minutes} Min.`;
  if (hours) return `${hours}h`;
  return `${minutes} Min.`;
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
    return 0;
  }

  return hours * 60 + minutes;
}

async function readResponseMessage(response: Response, fallback: string) {
  try {
    const result = await response.json();
    return typeof result.message === "string" ? result.message : fallback;
  } catch {
    return fallback;
  }
}

export default function ServicesClient({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("de-CH");

    return normalized
      ? services.filter((service) =>
          service.name.toLocaleLowerCase("de-CH").includes(normalized),
        )
      : services;
  }, [services, query]);

  async function createService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const durationMinutes = readDuration(formData);

    setIsCreating(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrice: formData.get("basePrice"),
          durationMinutes,
          isActive: formData.get("isActive") === "on",
          name: formData.get("name"),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Die Leistung konnte nicht erstellt werden."),
        );
      }

      form.reset();
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Die Leistung konnte nicht erstellt werden.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function updateService(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const durationMinutes = readDuration(formData);

    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrice: formData.get("basePrice"),
          durationMinutes,
          isActive: formData.get("isActive") === "on",
          id,
          name: formData.get("name"),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Die Leistung konnte nicht gespeichert werden."),
        );
      }

      setMessage("Leistung gespeichert.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Die Leistung konnte nicht gespeichert werden.",
      );
    } finally {
      setSavingId("");
    }
  }

  async function deleteService(service: ServiceRow) {
    if (!window.confirm(`${service.name} wirklich löschen?`)) return;

    setSavingId(service.id);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/services?id=${encodeURIComponent(service.id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Die Leistung konnte nicht gelöscht werden."),
        );
      }

      setMessage(service.bookingUsage > 0 ? "Leistung ausgeblendet." : "Leistung gelöscht.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Die Leistung konnte nicht gelöscht werden.",
      );
    } finally {
      setSavingId("");
    }
  }

  return (
    <>
      <section className="admin-panel admin-services-panel">
        <div className="admin-services-toolbar">
          <label className="admin-services-search">
            <Search size={17} />
            <input
              aria-label="Leistungen suchen"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Leistung suchen..."
              type="search"
              value={query}
            />
          </label>

          <button
            className="admin-primary-button"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            <Plus size={17} />
            Leistung hinzufügen
          </button>
        </div>

        {message && (
          <p className="admin-services-message" role="status">
            {message}
          </p>
        )}

        <div className="admin-services-list">
          {filteredServices.map((service) => {
            const duration = splitDuration(service.durationMinutes);
            const cannotDelete = service.isActive && services.filter((item) => item.isActive).length <= 1;

            return (
              <article className="admin-service-card" key={service.id}>
                <form
                  className="admin-service-form"
                  onSubmit={(event) => updateService(event, service.id)}
                >
                  <label className="admin-service-name-field">
                    Name
                    <input
                      defaultValue={service.name}
                      maxLength={90}
                      name="name"
                      required
                    />
                  </label>

                  <label>
                    Preis in CHF
                    <input
                      defaultValue={service.basePrice}
                      min="0"
                      name="basePrice"
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

                  <label className="admin-service-active-toggle">
                    <input
                      defaultChecked={service.isActive}
                      name="isActive"
                      type="checkbox"
                    />
                    Im Buchungsformular anzeigen
                  </label>

                  <button
                    className="admin-primary-button"
                    disabled={savingId === service.id}
                    type="submit"
                  >
                    <Save size={16} />
                    {savingId === service.id ? "Speichert..." : "Speichern"}
                  </button>
                </form>

                <div className="admin-service-card-footer">
                  <p>
                    Dauer: <strong>{formatDuration(service.durationMinutes)}</strong>
                    <span>Preis: CHF {service.basePrice.toFixed(2)}</span>
                    <span>{service.isActive ? "Sichtbar" : "Ausgeblendet"}</span>
                    <span>{service.bookingUsage} Buchungen</span>
                  </p>

                  <div className="admin-service-card-actions">
                    <Link
                      className="admin-secondary-button"
                      href={`/admin/services/${service.id}`}
                    >
                      <Settings2 size={16} />
                      Optionen bearbeiten
                    </Link>

                    <button
                      className="admin-danger-button"
                      disabled={cannotDelete || savingId === service.id}
                      onClick={() => deleteService(service)}
                      title={
                        cannotDelete
                          ? "Mindestens eine sichtbare Leistung muss bestehen bleiben."
                          : service.bookingUsage > 0
                            ? "Diese Leistung wird aus dem Buchungsformular ausgeblendet."
                            : undefined
                      }
                      type="button"
                    >
                      <Trash2 size={16} />
                      {service.bookingUsage > 0 ? "Ausblenden" : "Entfernen"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {!filteredServices.length && (
            <p className="admin-empty">Keine Leistungen gefunden.</p>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={() => setIsModalOpen(false)}
          role="presentation"
        >
          <form
            className="admin-modal admin-service-modal"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={createService}
          >
            <button
              aria-label="Modal schliessen"
              className="admin-modal-close"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="admin-panel-head">
              <div>
                <span>Leistungen</span>
                <h2>Neue Leistung erstellen</h2>
              </div>
            </div>

            <div className="admin-service-create-grid">
              <label className="is-wide">
                Name
                <input
                  autoFocus
                  maxLength={90}
                  name="name"
                  placeholder="z. B. Felgenreinigung"
                  required
                />
              </label>

              <label>
                Preis in CHF
                <input min="0" name="basePrice" required step="0.01" type="number" />
              </label>

              <label>
                Stunden
                <input defaultValue={1} min="0" name="durationHours" required type="number" />
              </label>

              <label>
                Minuten
                <input
                  defaultValue={0}
                  max="59"
                  min="0"
                  name="durationMinutesRemainder"
                  required
                  type="number"
                />
              </label>

              <label className="admin-service-active-toggle is-wide">
                <input defaultChecked name="isActive" type="checkbox" />
                Im Buchungsformular anzeigen
              </label>
            </div>

            {message && (
              <p className="admin-services-message" role="alert">
                {message}
              </p>
            )}

            <div className="admin-service-modal-actions">
              <button
                className="admin-secondary-button"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Abbrechen
              </button>
              <button
                className="admin-primary-button"
                disabled={isCreating}
                type="submit"
              >
                {isCreating ? "Wird erstellt..." : "Leistung erstellen"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
