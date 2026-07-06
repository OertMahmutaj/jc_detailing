"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAdminBooking,
  updateAdminBooking,
} from "../_actions/bookingActions";
import { useAdminNotification } from "./AdminNotificationProvider";

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
  const [isDeleting, setIsDeleting] = useState(false);

  function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateAdminBooking(formData);

      if (!result.success) {
        showNotification(result.error, "error");
        return;
      }

      showNotification(result.message, "success");
      router.refresh();
    });
  }

  function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const confirmed = window.confirm(
      "Diese Buchung wirklich löschen?\n\nDie zugehörige Rechnung wird ebenfalls gelöscht."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await deleteAdminBooking(formData);

      if (!result.success) {
        setIsDeleting(false);
        showNotification(result.error, "error");
        return;
      }

      showNotification(result.message, "success");

      router.push("/admin/bookings");
      router.refresh();
    });
  }

  return (
    <div className="admin-booking-editor">
      <form className="admin-booking-form" onSubmit={handleUpdate}>
        <input type="hidden" name="bookingId" value={booking.id} />

        <div className="admin-form-grid">
          <label>
            <span>Datum</span>
            <input
              type="date"
              name="date"
              defaultValue={getDateValue(booking.dateTime)}
              required
            />
          </label>

          <label>
            <span>Startzeit</span>
            <input
              type="time"
              name="start"
              defaultValue={getTimeValue(booking.dateTime)}
              required
            />
          </label>

          <label>
            <span>Endzeit</span>
            <input
              type="time"
              name="end"
              defaultValue={getTimeValue(booking.endTime)}
              required
            />
          </label>

          <label>
            <span>Status</span>
            <select name="status" defaultValue={booking.status} required>
              <option value="PENDING">Offen</option>
              <option value="CONFIRMED">Bestätigt</option>
              <option value="COMPLETED">Abgeschlossen</option>
              <option value="CANCELLED">Storniert</option>
            </select>
          </label>

          <label>
            <span>Fahrzeugmodell</span>
            <input
              type="text"
              name="vehicleModel"
              defaultValue={booking.vehicleModel}
              required
            />
          </label>

          <label>
            <span>Fahrzeugkategorie</span>
            <select
              name="vehicleCategoryId"
              defaultValue={booking.vehicleCategoryId}
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
            <select name="serviceId" defaultValue={booking.serviceId} required>
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
                <label key={service.id} className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="additionalServiceIds"
                    value={service.id}
                    defaultChecked={booking.serviceIds.includes(service.id)}
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
              <label key={addOn.id} className="admin-checkbox-label">
                <input
                  type="checkbox"
                  name="addOnIds"
                  value={addOn.id}
                  defaultChecked={booking.addOnIds.includes(addOn.id)}
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
            name="notes"
            defaultValue={booking.notes ?? ""}
            rows={5}
            placeholder="Interne oder Kunden-Notizen..."
          />
        </label>

        <button
          type="submit"
          className="admin-primary-button"
          disabled={isPending || isDeleting}
        >
          {isPending && !isDeleting
            ? "Wird gespeichert..."
            : "Buchung speichern"}
        </button>
      </form>

      <form className="admin-danger-zone" onSubmit={handleDelete}>
        <input type="hidden" name="bookingId" value={booking.id} />

        <div>
          <strong>Buchung löschen</strong>
          <p>Diese Aktion kann nicht rückgängig gemacht werden.</p>
        </div>

        <button
          type="submit"
          className="admin-danger-button"
          disabled={isPending || isDeleting}
        >
          {isDeleting ? "Wird gelöscht..." : "Buchung löschen"}
        </button>
      </form>
    </div>
  );
}