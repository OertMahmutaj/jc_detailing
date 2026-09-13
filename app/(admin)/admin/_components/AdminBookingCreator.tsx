"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminNotification } from "../_components/AdminNotificationProvider";

type Option = {
  basePrice?: number;
  id: string;
  name: string;
  price?: number;
  serviceOptions?: Array<{
    isActive?: boolean;
    price?: number;
    serviceId: string;
  }>;
};

type ExistingClient = {
  address?: string | null;
  companyServicePrices?: Array<{
    price: number;
    serviceId: string;
  }>;
  companyVehicles?: Array<{
    id: string;
    licensePlate: string;
    model: string;
    vehicleCategory: {
      id: string;
      name: string;
    };
  }>;
  email: string;
  id: string;
  name: string;
  paymentTermsDays?: number;
  phone: string;
};

type ActionResult = {
  error?: string;
  success: boolean;
};

export function AdminBookingCreator({
  action,
  addOns,
  categories,
  client,
  companyClients = [],
  defaultDate,
  mode = "PRIVATE",
  services,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  addOns: Option[];
  categories: Option[];
  client?: ExistingClient;
  companyClients?: ExistingClient[];
  defaultDate?: string;
  mode?: "PRIVATE" | "COMPANY";
  services: Option[];
}) {
  const isCompanyBooking = mode === "COMPANY";
  const companyOptions = client && isCompanyBooking ? [client] : companyClients;
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    isCompanyBooking ? client?.id || "" : "",
  );
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const isExistingClientBooking = Boolean(client);
  const hasCompanyClients = companyOptions.length > 0;
  const selectedCompany = companyOptions.find(
    (company) => company.id === selectedCompanyId,
  );
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

  function servicePrice(service: Option) {
    return (
      selectedCompany?.companyServicePrices?.find(
        (price) => price.serviceId === service.id,
      )?.price ??
      service.basePrice ??
      service.price
    );
  }

  useEffect(() => {
    if (!open) {
      setSelectedServiceId("");
      setSelectedCompanyId(isCompanyBooking ? client?.id || "" : "");
    }
  }, [client?.id, isCompanyBooking, open]);

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

    try {
      setIsSubmitting(true);
      const result = await action(new FormData(event.currentTarget));

      if (!result.success) {
        showNotification(
          result.error || "Die Buchung konnte nicht gespeichert werden.",
          "error",
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
        "error",
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
        {isCompanyBooking
          ? "Neue Firmenbuchung"
          : isExistingClientBooking
            ? "Neue Buchung für diesen Kunden"
            : "Neue Buchung"}
      </button>

      {open && (
        <div
          aria-label={isCompanyBooking ? "Neue Firmenbuchung" : "Neue Buchung"}
          aria-modal="true"
          className="admin-modal-backdrop"
          role="dialog"
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

            <input name="bookingMode" type="hidden" value={mode} />
            {client && !isCompanyBooking && (
              <input name="clientId" type="hidden" value={client.id} />
            )}

            <div className="admin-panel-head">
              <div>
                <span>Buchung</span>
                <h2>
                  {isCompanyBooking
                    ? "Neue Firmenbuchung erstellen"
                    : "Neue Buchung erstellen"}
                </h2>
              </div>
            </div>

            <div className="admin-form-grid">
              {isCompanyBooking ? (
                <label className="admin-form-wide">
                  Firma
                  {client ? (
                    <>
                      <input name="clientId" type="hidden" value={client.id} />
                      <input readOnly value={client.name} />
                    </>
                  ) : (
                    <select
                      name="clientId"
                      onChange={(event) =>
                        setSelectedCompanyId(event.target.value)
                      }
                      required
                      value={selectedCompanyId}
                    >
                      <option disabled value="">
                        {hasCompanyClients
                          ? "Firmenkunde wählen"
                          : "Keine Firmenkunden vorhanden"}
                      </option>
                      {companyOptions.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name} ({company.email})
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              ) : client ? (
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
                      defaultValue={client.address || ""}
                      name="address"
                      placeholder="Strasse, PLZ Ort"
                      required
                      type="text"
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

              {isCompanyBooking ? (
                <label className="admin-form-wide">
                  Gespeichertes Firmenfahrzeug
                  <select
                    defaultValue=""
                    disabled={!selectedCompany}
                    key={selectedCompanyId || "no-company"}
                    name="companyVehicleId"
                    required
                  >
                    <option disabled value="">
                      {selectedCompany
                        ? "Fahrzeug wählen"
                        : "Zuerst eine Firma wählen"}
                    </option>
                    {selectedCompany?.companyVehicles?.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} · {vehicle.model} ·{" "}
                        {vehicle.vehicleCategory.name}
                      </option>
                    ))}
                  </select>
                  {selectedCompany &&
                    (selectedCompany.companyVehicles?.length || 0) === 0 && (
                      <small>
                        Für diese Firma ist noch kein aktives Fahrzeug gespeichert.
                      </small>
                    )}
                </label>
              ) : (
                <label>
                  Fahrzeug
                  <input name="vehicleModel" required type="text" />
                </label>
              )}

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
                  {services.map((service) => {
                    const price = servicePrice(service);
                    return (
                      <option key={service.id} value={service.id}>
                        {service.name}
                        {typeof price === "number"
                          ? ` · CHF ${price.toFixed(2)}`
                          : ""}
                      </option>
                    );
                  })}
                </select>
              </label>

              {!isCompanyBooking && (
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
              )}

              <label>
                Sprache
                <select defaultValue="de" name="language">
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="it">Italiano</option>
                </select>
              </label>
              <label>
                Datum
                <input defaultValue={defaultDate} name="date" required type="date" />
              </label>
              <label>
                Von
                <input defaultValue="08:00" name="start" required step="1800" type="time" />
              </label>
              <label>
                Bis
                <input defaultValue="10:00" name="end" required step="1800" type="time" />
              </label>

              {isCompanyBooking && (
                <>
                  <label>
                    Bestellnummer
                    <input name="orderNumber" type="text" />
                  </label>
                  <label>
                    Kostenstelle
                    <input name="costCenter" type="text" />
                  </label>
                  <label>
                    Interne Referenz
                    <input name="internalReference" type="text" />
                  </label>
                  <label>
                    Einsatzort
                    <input name="serviceLocation" type="text" />
                  </label>
                </>
              )}

              <label className="admin-form-wide admin-textarea-label">
                Notizen
                <textarea
                  name="notes"
                  placeholder="Interne Notizen zur Buchung..."
                  rows={4}
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
              disabled={isSubmitting || (isCompanyBooking && !hasCompanyClients)}
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
