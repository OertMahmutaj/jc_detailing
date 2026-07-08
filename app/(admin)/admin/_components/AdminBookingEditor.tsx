"use client";

import { useState, useTransition } from "react";
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
};

type AddOn = {
  id: string;
  name: string;
  price: number;
  additionalDuration: number;
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

  const [isPending, startTransition] = useTransition();

  function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await updateAdminBooking(formData);

        if (!result.success) {
          showNotification(result.error, "error");
          return;
        }

        showNotification(result.message, "success");
        router.refresh();
      } catch (error) {
        console.error("Booking update failed:", error);

        showNotification(
          "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.",
          "error"
        );
      }
    });
  }

  return (
    <div className="admin-booking-editor">
      <form className="admin-booking-form" onSubmit={handleUpdate}>
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
            <select defaultValue={booking.status} name="status" required>
              <option value="PENDING">Offen</option>
              <option value="CONFIRMED">Bestätigt</option>
              <option value="COMPLETED">Abgeschlossen</option>
              <option value="CANCELLED">Storniert</option>
            </select>
          </label>

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
              {vehicleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Hauptleistung</span>
            <select
              defaultValue={booking.serviceId}
              name="serviceId"
              required
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
              .filter((service) => service.id !== booking.serviceId)
              .map((service) => (
                <label className="admin-checkbox-label" key={service.id}>
                  <input
                    defaultChecked={booking.serviceIds.includes(service.id)}
                    name="additionalServiceIds"
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
            {addOns.map((addOn) => (
              <label className="admin-checkbox-label" key={addOn.id}>
                <input
                  defaultChecked={booking.addOnIds.includes(addOn.id)}
                  name="addOnIds"
                  type="checkbox"
                  value={addOn.id}
                />

                <span>
                  {addOn.name} (+ CHF {addOn.price.toFixed(2)})
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

          <BookingPhotoUploader bookingId={booking.id}/>
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