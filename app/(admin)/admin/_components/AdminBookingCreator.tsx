"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminNotification } from "../_components/AdminNotificationProvider";

type Option = {
  id: string;
  name: string;
  price?: number;
  serviceOptions?: Array<{
    serviceId: string;
    isActive?: boolean;
    price?: number;
  }>;
};

type ExistingClient = {
  address?: string | null;
  id: string;
  name: string;
  email: string;
  phone: string;
};

export function AdminBookingCreator({
  action,
  addOns,
  categories,
  client,
  defaultDate,
  services,
}: {
  action: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
  }>;
  addOns: Option[];
  categories: Option[];
  client?: ExistingClient;
  defaultDate?: string;
  services: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const isExistingClientBooking = Boolean(client);
  const filteredCategories = selectedServiceId
    ? categories.filter((category) =>
        category.serviceOptions?.some(
          (option) =>
            option.serviceId === selectedServiceId && option.isActive !== false,
        ),
      )
    : [];
  const filteredAddOns = selectedServiceId
    ? addOns.filter((addOn) =>
        addOn.serviceOptions?.some(
          (option) =>
            option.serviceId === selectedServiceId && option.isActive !== false,
        ),
      )
    : [];

  function addOnPrice(addOn: Option) {
    return addOn.serviceOptions?.find(
      (option) =>
        option.serviceId === selectedServiceId && option.isActive !== false,
    )?.price;
  }

  useEffect(() => {
    if (!open) {
      setSelectedServiceId("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);

      const result = await action(formData);

      if (!result.success) {
        showNotification(
          result.error || "Die Buchung konnte nicht gespeichert werden.",
          "error"
        );
        return;
      }

      setOpen(false);
      router.refresh();

      showNotification("Buchung wurde erfolgreich erstellt.", "success");
    } catch (error) {
      console.error("Booking creation failed:", error);

      showNotification(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        className="admin-submit-button admin-create-booking-button"
        onClick={() => setOpen(true)}
        type="button"
      >
        <CalendarPlus size={16} />
        {isExistingClientBooking
          ? "Neue Buchung für diesen Kunden"
          : "Neue Buchung"}
      </button>

      {open && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-label="Neue Buchung"
          aria-modal="true"
        >
          <form
            className="admin-modal admin-calendar-modal"
            onSubmit={handleSubmit}
          >
            <button
              className="admin-modal-close"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
              type="button"
            >
              <X size={22} />
            </button>

            {client && <input name="clientId" type="hidden" value={client.id} />}

            <div className="admin-panel-head">
              <div>
                <span>Buchung</span>
                <h2>Neue Buchung erstellen</h2>
              </div>
            </div>

            <div className="admin-form-grid">
              {client ? (
                <>
                  <label>
                    Name
                    <input readOnly type="text" value={client.name} />
                  </label>

                  <label>
                    E-Mail
                    <input readOnly type="email" value={client.email} />
                  </label>

                  <label>
                    Telefon
                    <input readOnly type="tel" value={client.phone} />
                  </label>

                  <label className="admin-form-wide">
                    Adresse
                    <input
                      name="address"
                      placeholder="Strasse, PLZ Ort"
                      required
                      type="text"
                      defaultValue={client.address || ""}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Name
                    <input name="name" required type="text" />
                  </label>

                  <label>
                    E-Mail
                    <input name="email" required type="email" />
                  </label>

                  <label>
                    Telefon
                    <input name="phone" required type="tel" />
                  </label>

                  <label className="admin-form-wide">
                    Adresse
                    <input
                      name="address"
                      placeholder="Strasse, PLZ Ort"
                      required
                      type="text"
                    />
                  </label>
                </>
              )}

              <label>
                Fahrzeug
                <input name="vehicleModel" required type="text" />
              </label>

              <label>
                Leistung
                <select
                  name="serviceId"
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                  required
                  value={selectedServiceId}
                >
                  <option disabled value="">
                    Leistung wählen
                  </option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Fahrzeugklasse
                <select
                  defaultValue=""
                  disabled={!selectedServiceId}
                  key={selectedServiceId || "no-service"}
                  name="vehicleCategoryId"
                  required
                >
                  <option disabled value="">
                    Fahrzeugklasse wählen
                  </option>

                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Sprache
                <select name="language" defaultValue="de">
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="it">Italiano</option>
                </select>
              </label>

              <label>
                Datum
                <input
                  name="date"
                  required
                  type="date"
                  defaultValue={defaultDate}
                />
              </label>

              <label>
                Von
                <input
                  name="start"
                  required
                  step="1800"
                  type="time"
                  defaultValue="08:00"
                />
              </label>

              <label>
                Bis
                <input
                  name="end"
                  required
                  step="1800"
                  type="time"
                  defaultValue="10:00"
                />
              </label>
            </div>

            {filteredAddOns.length > 0 && (
              <div className="admin-addon-checks" key={selectedServiceId}>
                <span>Extras</span>

                {filteredAddOns.map((addOn) => {
                  const price = addOnPrice(addOn) ?? addOn.price;

                  return (
                    <label className="admin-check-row" key={addOn.id}>
                      <input name="addOnIds" type="checkbox" value={addOn.id} />
                      <span>{addOn.name}</span>
                      {typeof price === "number" && (
                        <small>+ CHF {price.toFixed(2)}</small>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            <button
              className="admin-submit-button"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "Buchung wird gespeichert..."
                : "Buchung speichern"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
