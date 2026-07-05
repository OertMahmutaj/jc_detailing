"use client";

import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";

type Option = { id: string; name: string; price?: number };

export function AdminBookingCreator({
  action,
  addOns,
  categories,
  defaultDate,
  services,
}: {
  action: (formData: FormData) => Promise<void>;
  addOns: Option[];
  categories: Option[];
  defaultDate?: string;
  services: Option[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="admin-submit-button admin-create-booking-button" onClick={() => setOpen(true)} type="button">
        <CalendarPlus size={16} /> Neue Buchung
      </button>

      {open && (
        <div className="admin-modal-backdrop" role="dialog" aria-label="Neue Buchung" aria-modal="true">
          <form action={action} className="admin-modal admin-calendar-modal" onSubmit={() => setOpen(false)}>
            <button className="admin-modal-close" onClick={() => setOpen(false)} type="button">
              <X size={22} />
            </button>

            <div className="admin-panel-head">
              <div>
                <span>Buchung</span>
                <h2>Neue Buchung erstellen</h2>
              </div>
            </div>

            <div className="admin-form-grid">
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
              <label>
                Fahrzeug
                <input name="vehicleModel" required type="text" />
              </label>
              <label>
                Leistung
                <select name="serviceId" required>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fahrzeugklasse
                <select name="vehicleCategoryId" required>
                  {categories.map((category) => (
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
                  <option value="fr">Francais</option>
                  <option value="it">Italiano</option>
                </select>
              </label>
              <label>
                Datum
                <input name="date" required type="date" defaultValue={defaultDate} />
              </label>
              <label>
                Von
                <input name="start" required step="1800" type="time" defaultValue="08:00" />
              </label>
              <label>
                Bis
                <input name="end" required step="1800" type="time" defaultValue="10:00" />
              </label>
            </div>

            {addOns.length > 0 && (
              <div className="admin-addon-checks">
                <span>Extras</span>
                {addOns.map((addOn) => (
                  <label className="admin-check-row" key={addOn.id}>
                    <input name="addOnIds" type="checkbox" value={addOn.id} />
                    {addOn.name}
                  </label>
                ))}
              </div>
            )}

            <button className="admin-submit-button" type="submit">
              Buchung speichern
            </button>
          </form>
        </div>
      )}
    </>
  );
}
