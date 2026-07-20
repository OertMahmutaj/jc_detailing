"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAdminBooking,
  updateAdminBooking,
} from "../_actions/bookingActions";
import { useAdminNotification } from "./AdminNotificationProvider";
import { BookingPhotoUploader } from "./BookingPhotoUploader";
import { AdminBookingDeleteForm } from "./AdminBookingDeleteForm";
import { AdminBookingGalleryLink } from "./AdminBookingGalleryLink";

type Service = {
  id: string;
  name: string;
  basePrice: number;
};

type VehicleCategory = {
  id: string;
  name: string;
  priceModifier: number;
  serviceOptions?: Array<{
    serviceId: string;
    isActive?: boolean;
    price?: number;
  }>;
};

type AddOn = {
  id: string;
  name: string;
  price: number;
  additionalDuration: number;
  serviceOptions?: Array<{
    serviceId: string;
    isActive?: boolean;
    price?: number;
    additionalDuration?: number;
  }>;
};

type BookingEditorProps = {
  booking: {
    id: string;
    dateTime: string;
    endTime: string;
    status: string;
    vehicleModel: string;
    notes: string | null;
    serviceId: string;
    vehicleCategoryId: string;
    serviceIds: string[];
    addOnIds: string[];
    galleryProject: {
      id: string;
      title: string;
      comparisonCount: number;
    } | null;
    client: {
      name: string;
      email: string;
      phone: string;
    };
  };
  services: Service[];
  vehicleCategories: VehicleCategory[];
  addOns: AddOn[];
};

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Offen",
  CONFIRMED: "Bestätigt",
  COMPLETED: "Abgeschlossen",
  CANCELLED: "Storniert",
};

const statusDescriptions: Record<BookingStatus, string> = {
  PENDING: "Diese Anfrage ist noch offen und wartet auf eine Bestätigung.",
  CONFIRMED: "Der Termin ist bestätigt und kann später abgeschlossen werden.",
  COMPLETED: "Die Buchung wurde abgeschlossen.",
  CANCELLED: "Die Buchung wurde storniert.",
};

function toBookingStatus(value: string): BookingStatus {
  if (
    value === "PENDING" ||
    value === "CONFIRMED" ||
    value === "COMPLETED" ||
    value === "CANCELLED"
  ) {
    return value;
  }

  return "PENDING";
}

function getDateValue(value: string) {
  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTimeValue(value: string) {
  const date = new Date(value);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function AdminBookingEditor({
  booking,
  services,
  vehicleCategories,
  addOns,
}: BookingEditorProps) {
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<BookingStatus>(() =>
    toBookingStatus(booking.status)
  );
  const [statusActionLabel, setStatusActionLabel] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState(booking.serviceId);
  const [selectedAdditionalServiceIds, setSelectedAdditionalServiceIds] =
    useState(() =>
      booking.serviceIds.filter((serviceId) => serviceId !== booking.serviceId),
    );
  const selectedServiceIds = [selectedServiceId, ...selectedAdditionalServiceIds];
  const visibleVehicleCategories = vehicleCategories.filter(
    (category) =>
      category.id === booking.vehicleCategoryId ||
      category.serviceOptions?.some(
        (option) =>
          option.serviceId === selectedServiceId && option.isActive !== false,
      ),
  );
  const visibleAddOns = addOns.filter(
    (addOn) =>
      booking.addOnIds.includes(addOn.id) ||
      addOn.serviceOptions?.some(
        (option) =>
          selectedServiceIds.includes(option.serviceId) &&
          option.isActive !== false,
      ),
  );

  function addOnPrice(addOn: AddOn) {
    for (const serviceId of selectedServiceIds) {
      const option = addOn.serviceOptions?.find(
        (serviceOption) =>
          serviceOption.serviceId === serviceId &&
          serviceOption.isActive !== false,
      );

      if (typeof option?.price === "number") return option.price;
    }

    return addOn.price;
  }

  function runBookingUpdate(
    formData: FormData,
    options?: {
      loadingLabel?: string;
      successStatus?: BookingStatus;
    }
  ) {
    setStatusActionLabel(options?.loadingLabel ?? null);

    startTransition(async () => {
      try {
        const result = await updateAdminBooking(formData);

        if (!result.success) {
          showNotification(result.error, "error");
          return;
        }

        if (options?.successStatus) {
          setStatus(options.successStatus);
        }

        showNotification(result.message, "success");
        router.refresh();
      } catch (error) {
        console.error("Booking update failed:", error);

        showNotification(
          "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.",
          "error"
        );
      } finally {
        setStatusActionLabel(null);
      }
    });
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.set("status", status);

    runBookingUpdate(formData);
  }

  function handleQuickStatusUpdate(
    nextStatus: BookingStatus,
    loadingLabel: string
  ) {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.set("status", nextStatus);

    runBookingUpdate(formData, {
      loadingLabel,
      successStatus: nextStatus,
    });
  }
  return (
    <div className="admin-booking-editor">
      <form ref={formRef} className="admin-booking-form" onSubmit={handleUpdate}>
        <input name="bookingId" type="hidden" value={booking.id} />

        <div className="admin-form-grid">
          <label>
            <span>Datum</span>
            <input
              defaultValue={getDateValue(booking.dateTime)}
              name="date"
              required
              type="date"
            />
          </label>

          <label>
            <span>Startzeit</span>
            <input
              defaultValue={getTimeValue(booking.dateTime)}
              name="start"
              required
              type="time"
            />
          </label>

          <label>
            <span>Endzeit</span>
            <input
              defaultValue={getTimeValue(booking.endTime)}
              name="end"
              required
              type="time"
            />
          </label>

          <label>
            <span>Status</span>
            <select
              name="status"
              onChange={(event) => setStatus(event.target.value as BookingStatus)}
              required
              value={status}
            >
              <option value="PENDING">Offen</option>
              <option value="CONFIRMED">Bestätigt</option>
              <option value="COMPLETED">Abgeschlossen</option>
              <option value="CANCELLED">Storniert</option>
            </select>
          </label>

          <div className="admin-status-panel">
            <div>
              <span className={`admin-status-pill admin-status-${status.toLowerCase()}`}>
                {statusLabels[status]}
              </span>

              <p>{statusDescriptions[status]}</p>
            </div>

            <div className="admin-status-actions">
              {status === "PENDING" && (
                <>
                  <button
                    className="admin-status-action-button primary"
                    disabled={isPending}
                    onClick={() =>
                      handleQuickStatusUpdate("CONFIRMED", "Wird bestätigt...")
                    }
                    type="button"
                  >
                    {statusActionLabel === "Wird bestätigt..."
                      ? statusActionLabel
                      : "Bestätigen"}
                  </button>

                  <button
                    className="admin-status-action-button danger"
                    disabled={isPending}
                    onClick={() =>
                      handleQuickStatusUpdate("CANCELLED", "Wird storniert...")
                    }
                    type="button"
                  >
                    {statusActionLabel === "Wird storniert..."
                      ? statusActionLabel
                      : "Stornieren"}
                  </button>
                </>
              )}

              {status === "CONFIRMED" && (
                <>
                  <button
                    className="admin-status-action-button primary"
                    disabled={isPending}
                    onClick={() =>
                      handleQuickStatusUpdate("COMPLETED", "Wird abgeschlossen...")
                    }
                    type="button"
                  >
                    {statusActionLabel === "Wird abgeschlossen..."
                      ? statusActionLabel
                      : "Bestätigen"}
                  </button>

                  <button
                    className="admin-status-action-button danger"
                    disabled={isPending}
                    onClick={() =>
                      handleQuickStatusUpdate("CANCELLED", "Wird storniert...")
                    }
                    type="button"
                  >
                    {statusActionLabel === "Wird storniert..."
                      ? statusActionLabel
                      : "Stornieren"}
                  </button>
                </>
              )}

              {/* {status === "COMPLETED" && (
                <p className="admin-status-note">
                  Diese Buchung ist abgeschlossen.
                </p>
              )}

              {status === "CANCELLED" && (
                <p className="admin-status-note">
                  Diese Buchung wurde storniert.
                </p>
              )} */}
            </div>
          </div>

          <label>
            <span>Fahrzeugmodell</span>
            <input
              defaultValue={booking.vehicleModel}
              name="vehicleModel"
              required
              type="text"
            />
          </label>

          <label>
            <span>Fahrzeugkategorie</span>
            <select
              defaultValue={booking.vehicleCategoryId}
              name="vehicleCategoryId"
              required
            >
              {visibleVehicleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Hauptleistung</span>
            <select
              name="serviceId"
              onChange={(event) => setSelectedServiceId(event.target.value)}
              required
              value={selectedServiceId}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — CHF {service.basePrice.toFixed(2)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-checkbox-section">
          <strong>Zusätzliche Leistungen</strong>

          <div className="admin-checkbox-grid">
            {services
              .filter((service) => service.id !== selectedServiceId)
              .map((service) => (
                <label className="admin-checkbox-label" key={service.id}>
                  <input
                    defaultChecked={booking.serviceIds.includes(service.id)}
                    name="additionalServiceIds"
                    onChange={(event) =>
                      setSelectedAdditionalServiceIds((current) =>
                        event.target.checked
                          ? Array.from(new Set([...current, service.id]))
                          : current.filter((serviceId) => serviceId !== service.id),
                      )
                    }
                    type="checkbox"
                    value={service.id}
                  />

                  <span>
                    {service.name} (+ CHF {service.basePrice.toFixed(2)})
                  </span>
                </label>
              ))}
          </div>
        </div>

        <div className="admin-checkbox-section">
          <strong>Add-ons</strong>

          <div className="admin-checkbox-grid">
            {visibleAddOns.map((addOn) => (
              <label className="admin-checkbox-label" key={addOn.id}>
                <input
                  defaultChecked={booking.addOnIds.includes(addOn.id)}
                  name="addOnIds"
                  type="checkbox"
                  value={addOn.id}
                />

                <span>
                  {addOn.name} (+ CHF {addOnPrice(addOn).toFixed(2)})
                </span>
              </label>
            ))}
          </div>
        </div>

        <label className="admin-textarea-label">
          <span>Notizen</span>

          <textarea
            defaultValue={booking.notes ?? ""}
            name="notes"
            placeholder="Interne oder Kunden-Notizen..."
            rows={5}
          />
        </label>

        <section className="admin-booking-gallery-section">
          <div>
            <h3>Vorher / Nachher Galerie</h3>
            <p>
              Öffentliche Vorher-Nachher-Vergleiche werden zentral im Gallery Manager
              verwaltet. Dort können Bilder einzeln ersetzt, gelöscht und
              veröffentlicht werden.
            </p>
          </div>

          <AdminBookingGalleryLink
            bookingId={booking.id}
            galleryProject={booking.galleryProject}
          />
        </section>

        <section className="admin-booking-photo-section">
          <div>
            <h3>Schäden / Dokumentation</h3>
            <p>
              Private Beweisdokumentation. Diese Fotos können nie veröffentlicht
              werden.
            </p>
          </div>

          <BookingPhotoUploader bookingId={booking.id} />
        </section>

        {/* <button
          className="admin-primary-button"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Wird gespeichert..." : "Buchung speichern"}
        </button> */}

        <button
          className="admin-primary-button"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Wird gespeichert..." : "Buchung speichern"}
        </button>
      </form>

      <div className="admin-danger-zone">
        <div>
          <strong>Buchung löschen</strong>
          <p>
            Diese Aktion kann nicht rückgängig gemacht werden. Hochgeladene
            Fotos und veröffentlichte Galerie-Vergleiche bleiben erhalten.
          </p>
        </div>

        <AdminBookingDeleteForm
          action={deleteAdminBooking}
          bookingId={booking.id}
          clientName={booking.client.name}
        />
      </div>
    </div>
  );
}
