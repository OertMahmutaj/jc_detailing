"use client";

import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  bookingAddOnCopy,
  bookingFormCopy,
  bookingServiceNames,
  bookingVehicleCopy,
  getBookingServiceDetail,
} from "../bookingCopy";
import { intlLocales } from "../i18n";
import { localeHome } from "../i18n";
import { usePublicLocale } from "./usePublicLocale";

type Service = { id: string; name: string; basePrice: number; durationMinutes: number };
type Category = { id: string; name: string; priceModifier: number };
type AddOn = { id: string; name: string; price: number; additionalDuration: number };
type Status = "idle" | "loading" | "success" | "error";

type ServiceDetail = {
  tag: string;
  title: string;
  priceRange: string;
  sections: Array<{ title: string; items: string[] }>;
};

type SubmittedBookingSummary = {
  addOns: string;
  dateTime: Date;
  duration: string;
  email: string;
  endTime: Date;
  estimatedTotal: number;
  name: string;
  phone: string;
  services: string;
  vehicleCategory: string;
  vehicleModel: string;
};

const addOnDescriptions: Record<string, string> = {
  Tierhaarentfernung: "Effektive Entfernung hartnäckiger Tierhaare.",
  "Sitze Tiefenreinigung": "Intensive Polsterreinigung für hygienische Sitze.",
  "Fussmatten intensiv": "Tiefenreinigung für saubere Fussmatten.",
  "Kofferraum Deep Clean": "Gründliche Reinigung des Kofferraums.",
};

const serviceAddOns: Record<string, string[]> = {
  "Komplett Innenreinigung": ["Tierhaarentfernung"],
  "Pflegeerhaltung Innenreinigung": [
    "Tierhaarentfernung",
    "Sitze Tiefenreinigung",
    "Fussmatten intensiv",
    "Kofferraum Deep Clean",
  ],
  "Komplette Premium Paket": ["Tierhaarentfernung"],
};

const vehicleDetails: Record<string, { title: string; description: string; image: string }> = {
  "City Car": {
    title: "City Car",
    description: "Kleine Fahrzeuge (Mini, Fiat 500)",
    image: "/city_car.webp",
  },
  Sedan: {
    title: "Limousine",
    description: "Standardfahrzeuge (Audi A4, Mercedes C-Klasse)",
    image: "/sedan.webp",
  },
  "Sports Car": {
    title: "Sportwagen",
    description: "Sportliche Fahrzeuge (Porsche, Ferrari)",
    image: "/sports_car.webp",
  },
  SUV: {
    title: "SUV",
    description: "Grössere Fahrzeuge (Peugeot 5008, Range Rover)",
    image: "/suv.webp",
  },
  Van: {
    title: "Van",
    description: "Minivans und Transporter",
    image: "/van.webp",
  },
};

const serviceDetails: Record<string, ServiceDetail> = {
  "Komplett Innenreinigung": {
    tag: "Innenreinigung",
    title: "Komplett Innenreinigung",
    priceRange: "CHF 209.00 - CHF 309.00",
    sections: [
      {
        title: "Leistungen",
        items: [
          "Gründliche Staubsaugung des gesamten Innenraums (Fussraum, Sitze und Kofferraum)",
          "Intensive Reinigung und Pflege aller Kunststoffoberflächen inkl. schützendem Finish",
          "Reinigung der Türfalze und Einstiegsbereiche",
          "Tiefenreinigung der Sitze inkl. Shampoo- und Fleckenbehandlung",
          "Professionelle Teppichtiefenreinigung",
          "Streifenfreie Reinigung aller Scheiben von innen",
          "Dampfreinigung zur hygienischen Desinfektion des Innenraums",
          "Schonende Reinigung und Pflege von Leder- und Alcantaraflächen",
        ],
      },
    ],
  },
  "Komplett Aussenreinigung": {
    tag: "Aussenreinigung",
    title: "Komplett Aussenreinigung",
    priceRange: "CHF 109.00 - CHF 149.00",
    sections: [
      {
        title: "Leistungen",
        items: [
          "Gründliche Vorwäsche mit Snow Foam zur schonenden Schmutzlösung",
          "Sorgfältige Handwäsche mit hochwertigen Reinigungsmitteln",
          "Schonende Trocknung des gesamten Fahrzeugs",
          "Intensive Felgenreinigung inkl. Entfernung von Bremsstaub",
          "Entfernung von Insektenrückständen an Front und Spiegeln",
          "Reinigung der Türfalze und Einstiegsbereiche",
          "Streifenfreie Scheibenreinigung aussen",
          "Pflege der Reifenflanken mit hochwertigem Tire Dressing",
          "Detailreinigung von Emblemen, Kühlergrill und schwer zugänglichen Bereichen",
        ],
      },
    ],
  },
  "Pflegeerhaltung Innenreinigung": {
    tag: "Pflegeerhaltung",
    title: "Pflegeerhaltung Innenreinigung",
    priceRange: "CHF 129.00 - CHF 199.00",
    sections: [
      {
        title: "Voraussetzung",
        items: ["Das Fahrzeug wurde zuvor durch JC Detailing aufbereitet oder befindet sich in gepflegtem Zustand."],
      },
      {
        title: "Leistungen",
        items: [
          "Innenraum staubsaugen (Fussraum, Sitze und Kofferraum)",
          "Reinigung von Armaturenbrett und Mittelkonsole",
          "Kunststoffoberflächen feucht reinigen",
          "Türfalze und Einstiegsbereiche reinigen",
          "Türverkleidungen feucht abwischen",
        ],
      },
    ],
  },
  "Pflegeerhaltung Aussenreinigung": {
    tag: "Pflegeerhaltung",
    title: "Pflegeerhaltung Aussenreinigung",
    priceRange: "CHF 69.00 - CHF 109.00",
    sections: [
      {
        title: "Voraussetzung",
        items: ["Das Fahrzeug wurde zuvor durch JC Detailing aufbereitet oder befindet sich in gepflegtem Zustand."],
      },
      {
        title: "Leistungen",
        items: [
          "Vorwäsche mit Snow Foam oder Foam Gun",
          "Handwäsche und schonende Trocknung",
          "Felgenreinigung",
          "Entfernung von Insektenrückständen",
        ],
      },
    ],
  },
  "Polish Paket (1-Step)": {
    tag: "Politur und Korrektur",
    title: "Polish Paket (1-Step)",
    priceRange: "CHF 399.00 - CHF 549.00",
    sections: [
      {
        title: "Leistungen",
        items: [
          "Gründliche Fahrzeugwäsche und Lackvorbereitung",
          "Reinigung und Entfettung des Lacks",
          "1-Step Politur für Glanz und leichte Kratzerentfernung",
          "Reduktion von leichten Swirls",
          "Hochglanz-Finish",
        ],
      },
      {
        title: "Ergebnis",
        items: ["Frischer Glanz und sichtbar verbesserter Lack."],
      },
      {
        title: "Hinweis zu Lackzustand und Aufwand",
        items: [
          "Der genaue Preis und die Ausführbarkeit hängen vom aktuellen Zustand des Fahrzeugs ab.",
          "Nach einer kurzen Inspektion vor Ort wird entschieden, ob der gewünschte Polierumfang vollständig möglich ist.",
        ],
      },
    ],
  },
  "Polish Paket (2-Step)": {
    tag: "Politur und Korrektur",
    title: "Polish Paket (2-Step)",
    priceRange: "CHF 599.00 - CHF 769.00",
    sections: [
      {
        title: "Leistungen",
        items: [
          "Intensive Fahrzeugwäsche und Vorbereitung",
          "2-Step Politur mit Cut und Finish",
          "Deutliche Entfernung von Kratzern und Swirls",
          "Tiefenglanz-Finish",
        ],
      },
      {
        title: "Ergebnis",
        items: ["Stark verbesserter Lack mit nahezu Neuwagenoptik.", "Kein Langzeitschutz enthalten."],
      },
      {
        title: "Hinweis zu Lackzustand und Aufwand",
        items: [
          "Der genaue Preis und die Ausführbarkeit hängen vom aktuellen Zustand des Fahrzeugs ab.",
          "In seltenen Fällen ist eine stärkere Korrektur nicht sinnvoll oder nicht möglich, um den Lack zu schützen.",
        ],
      },
    ],
  },
  "Keramik Versiegelung": {
    tag: "Keramik Versiegelung",
    title: "Keramik Versiegelung",
    priceRange: "CHF 1090.00 - CHF 1690.00",
    sections: [
      {
        title: "Leistungen",
        items: [
          "Intensive Fahrzeugwäsche und Lackvorbereitung",
          "Politur inklusive für eine perfekte Basis",
          "Entfettung und professionelle Vorbereitung",
          "Keramik Versiegelung",
          "Aushärtung und Finish",
        ],
      },
    ],
  },
  "Komplette Premium Paket": {
    tag: "Pakete",
    title: "Komplette Premium Paket",
    priceRange: "CHF 299.00 - CHF 349.00",
    sections: [
      {
        title: "Premium Innenraum-Leistungen",
        items: [
          "Innenraum staubsaugen (Fussraum, Teppiche und Kofferraum)",
          "Scheibenreinigung innen inkl. Scheibedach",
          "Sorgfältige Reinigung sämtlicher Kunststoffoberflächen",
          "Detaillierte Cockpitreinigung",
          "Tiefenreinigung der Sitze inkl. Shampoo und Fleckenentfernung",
          "Intensive Teppichreinigung",
          "Pflege aller Kunststoffoberflächen mit schützendem Finish",
          "Dampfreinigung und hygienische Desinfektion des Innenraums",
          "Reinigung von Leder- und Alcantaraflächen",
        ],
      },
      {
        title: "Premium Aussen-Leistungen",
        items: [
          "Schonende Handwäsche und Trocknung von Hand",
          "Gründliche Felgenreinigung",
          "Entfernung von Insektenrückständen",
          "Tiefenreinigung des Lacks",
          "Lackpflege für sichtbar mehr Glanz",
          "Hochwertiges Glanzfinish",
          "Sprühversiegelung zum Schutz des Lackes",
          "Pflege der Reifen und Kunststoffteile aussen",
        ],
      },
    ],
  },
};

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (!hours) return `${rest} Min.`;
  if (!rest) return `${hours}h`;
  return `${hours}h${rest.toString().padStart(2, "0")}`;
}

function formatConfirmationDate(value: Date, locale: keyof typeof intlLocales) {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(value);
}

function formatConfirmationTime(value: Date, locale: keyof typeof intlLocales) {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(value);
}

function generateTimeSlots() {
  const slots: string[] = [];

  for (let hour = 8; hour <= 13; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    slots.push(`${formattedHour}:00`);
    slots.push(`${formattedHour}:30`);
  }

  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export function BookingForm() {
  const currentLanguage = usePublicLocale();
  const copy = bookingFormCopy[currentLanguage];
  const [step, setStep] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [submittedBooking, setSubmittedBooking] =
    useState<SubmittedBookingSummary | null>(null);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [detailService, setDetailService] = useState<Service | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);

  const [dbData, setDbData] = useState<{ services: Service[]; categories: Category[]; addOns: AddOn[] }>({
    services: [],
    categories: [],
    addOns: [],
  });

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const totalDuration = useMemo(() => {
    const serviceDuration = selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0);
    const addOnDuration = selectedAddOns.reduce((sum, addOn) => sum + addOn.additionalDuration, 0);
    return serviceDuration + addOnDuration;
  }, [selectedAddOns, selectedServices]);
  const displayServiceName = (name: string) => bookingServiceNames[currentLanguage][name] ?? name;
  const displayAddOn = (name: string) => bookingAddOnCopy[currentLanguage][name] ?? { name, description: "" };
  const displayVehicle = (name: string) => bookingVehicleCopy[currentLanguage][name];
  const localizedDetail = (name: string) => getBookingServiceDetail(currentLanguage, name, serviceDetails[name]);

  const availableAddOns = useMemo(() => {
    const allowedNames = new Set(selectedServices.flatMap((service) => serviceAddOns[service.name] ?? []));

    return dbData.addOns.filter((addOn) => allowedNames.has(addOn.name));
  }, [dbData.addOns, selectedServices]);

  const visibleServices = useMemo(() => {
    if (showAllServices) return dbData.services;

    return dbData.services.filter((service, index) => {
      const selected = selectedServices.some((selectedService) => selectedService.id === service.id);
      return index < 3 || selected;
    });
  }, [dbData.services, selectedServices, showAllServices]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/booking-data");
        const data = await res.json();
        setDbData(data);
        if (data.categories.length > 0) setSelectedCategory(data.categories[0]);
      } catch (err) {
        console.error("Buchungsdaten konnten nicht geladen werden:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDate || totalDuration <= 0) {
      setBlockedSlots([]);
      return;
    }

    async function checkAvailability() {
      setLoadingSlots(true);

      try {
        const res = await fetch(`/api/availability?date=${selectedDate}&durationMinutes=${totalDuration}`);
        const data = await res.json();
        setBlockedSlots(data.blockedSlots || []);
      } catch (err) {
        console.error("Verfügbare Zeiten konnten nicht geladen werden:", err);
      } finally {
        setLoadingSlots(false);
      }
    }

    checkAvailability();
  }, [selectedDate, totalDuration]);

  useEffect(() => {
    setSelectedAddOns((current) =>
      current.filter((addOn) => availableAddOns.some((availableAddOn) => availableAddOn.id === addOn.id))
    );
  }, [availableAddOns]);

  function toggleService(service: Service) {
    setSelectedServices((current) =>
      current.some((item) => item.id === service.id)
        ? current.filter((item) => item.id !== service.id)
        : [...current, service]
    );
    setSelectedTime("");
  }

  function handleAddOnToggle(addOn: AddOn) {
    setSelectedAddOns((prev) =>
      prev.find((item) => item.id === addOn.id)
        ? prev.filter((item) => item.id !== addOn.id)
        : [...prev, addOn]
    );
    setSelectedTime("");
  }

  function calculateTotal() {
    const servicePrice = selectedServices.reduce((sum, service) => sum + service.basePrice, 0);
    const categorySurcharge = selectedCategory?.priceModifier ?? 0;
    const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
    return servicePrice + categorySurcharge + addOnsTotal;
  }

  function handleNextStep() {
    if (step === 0 && selectedServices.length === 0) {
      setMessage(copy.chooseServiceError);
      return;
    }

    if (step === 3 && (!selectedDate || !selectedTime)) {
      setMessage(copy.chooseDateError);
      return;
    }

    setMessage("");
    setStep(step + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const formPayload = Object.fromEntries(formData.entries());
    const combinedDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

    const fullPayload = {
      name: formPayload.name,
      email: formPayload.email,
      phone: formPayload.phone,
      vehicleModel: formPayload.vehicle,
      notes: formPayload.message,
      website: formPayload.website,
      dateTime: combinedDateTime.toISOString(),
      serviceIds: selectedServices.map((service) => service.id),
      vehicleCategoryId: selectedCategory?.id,
      addOnIds: selectedAddOns.map((addOn) => addOn.id),
      language: currentLanguage,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(currentLanguage === "de" ? (data.message ?? copy.requestError) : copy.requestError);
      }

      const endDateTime = new Date(
        combinedDateTime.getTime() + totalDuration * 60000,
      );

      setSubmittedBooking({
        addOns: selectedAddOns.length
          ? selectedAddOns.map((addOn) => displayAddOn(addOn.name).name).join(", ")
          : copy.none,
        dateTime: combinedDateTime,
        duration: formatDuration(totalDuration),
        email: String(formPayload.email ?? ""),
        endTime: endDateTime,
        estimatedTotal: calculateTotal(),
        name: String(formPayload.name ?? ""),
        phone: String(formPayload.phone ?? ""),
        services: selectedServices.map((service) => displayServiceName(service.name)).join(", "),
        vehicleCategory: selectedCategory ? (displayVehicle(selectedCategory.name)?.title ?? selectedCategory.name) : copy.summary.category,
        vehicleModel: String(formPayload.vehicle ?? ""),
      });

      setStatus("success");
      setMessage("");
      setStep(0);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : copy.requestError);
    }
  }

  if (loadingData) {
    return (
      <div className="booking-loading">
        <Loader2 className="spin" size={32} />
      </div>
    );
  }
  if (submittedBooking) {
    return (
      <section className="booking-confirmation-panel">
        <div className="booking-confirmation-icon">
          <CalendarCheck size={34} />
        </div>

        <span className="booking-confirmation-eyebrow">
          {copy.confirmationEyebrow}
        </span>

        <h2>{copy.confirmationTitle}, {submittedBooking.name}.</h2>

        <p>{copy.confirmationText}</p>

        <div className="booking-confirmation-notice">
          {copy.confirmationNotice}
        </div>

        <div className="booking-confirmation-grid">
          <div>
            <span>{copy.summary.date}</span>
            <strong>{formatConfirmationDate(submittedBooking.dateTime, currentLanguage)}</strong>
          </div>

          <div>
            <span>{copy.summary.time}</span>
            <strong>
              {formatConfirmationTime(submittedBooking.dateTime, currentLanguage)}–
              {formatConfirmationTime(submittedBooking.endTime, currentLanguage)}
            </strong>
          </div>

          <div>
            <span>{copy.summary.services}</span>
            <strong>{submittedBooking.services}</strong>
          </div>

          <div>
            <span>{copy.summary.vehicle}</span>
            <strong>{submittedBooking.vehicleModel}</strong>
          </div>

          <div>
            <span>{copy.summary.category}</span>
            <strong>{submittedBooking.vehicleCategory}</strong>
          </div>

          <div>
            <span>{copy.summary.extras}</span>
            <strong>{submittedBooking.addOns}</strong>
          </div>

          <div>
            <span>{copy.summary.duration}</span>
            <strong>{submittedBooking.duration}</strong>
          </div>

          <div>
            <span>{copy.summary.price}</span>
            <strong>CHF {submittedBooking.estimatedTotal.toFixed(2)}</strong>
          </div>

          <div>
            <span>{copy.summary.email}</span>
            <strong>{submittedBooking.email}</strong>
          </div>

          <div>
            <span>{copy.summary.phone}</span>
            <strong>{submittedBooking.phone}</strong>
          </div>
        </div>

        <div className="booking-confirmation-footer">
          <a href={localeHome(currentLanguage)}>{copy.home}</a>
          <a href="https://wa.me/41772683388">{copy.whatsapp}</a>
        </div>
      </section>
    );
  }

  return (
    <>
      <form className="booking-form" onSubmit={handleSubmit}>
        <input
          aria-hidden="true"
          autoComplete="off"
          className="booking-honeypot"
          name="website"
          tabIndex={-1}
          type="text"
        />

        <div className="booking-steps-header">
          {copy.steps.map((label, index) => (
            <span className={step === index ? "is-active" : ""} key={label}>{index + 1}. {label}</span>
          ))}
        </div>

        {step === 0 && (
          <div className="booking-field booking-field-wide">
            <label>{copy.selectServices}</label>
            <p className="booking-helper">{copy.selectServicesHelp}</p>

            <div className="booking-service-grid">
              {visibleServices.map((service) => {
                const selected = selectedServices.some((item) => item.id === service.id);
                const detail = localizedDetail(service.name);
                const addOnCount = service.name === "Komplett Innenreinigung" || service.name === "Komplette Premium Paket" ? 1 : service.name === "Pflegeerhaltung Innenreinigung" ? 4 : 0;

                return (
                  <article className={`booking-service-card${selected ? " is-selected" : ""}`} key={service.id}>
                    <div>
                      <div className="booking-service-card-top">
                        <h3>{displayServiceName(service.name)}</h3>
                        <span>{formatDuration(service.durationMinutes)}</span>
                      </div>

                      {addOnCount > 0 && <p>{addOnCount} {addOnCount > 1 ? copy.addOns : copy.addOn}</p>}

                      <button type="button" className="booking-detail-link" onClick={() => setDetailService(service)}>
                        {copy.viewDetails}
                      </button>
                    </div>

                    <div className="booking-service-card-bottom">
                      <span>
                        {copy.from}
                        <strong>CHF {service.basePrice.toFixed(2)}</strong>
                      </span>
                      <button type="button" onClick={() => toggleService(service)}>
                        {selected ? copy.remove : copy.add}
                      </button>
                    </div>

                    {!detail && <small>{copy.detailsPending}</small>}
                  </article>
                );
              })}
            </div>

            {dbData.services.length > 3 && (
              <button
                className="booking-more-services"
                type="button"
                onClick={() => setShowAllServices((current) => !current)}
              >
                {showAllServices ? copy.fewerServices : copy.moreServices}
              </button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="booking-field booking-field-wide">
            <label>{copy.selectVehicle}</label>
            <div className="booking-vehicle-list">
              {dbData.categories.map((category) => (
                <button
                  className={selectedCategory?.id === category.id ? "is-selected" : ""}
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                >
                  <span
                    className="booking-vehicle-image"
                    style={{ backgroundImage: `url(${vehicleDetails[category.name]?.image ?? "/IMG_4623.webp"})` }}
                  />
                  <span className="booking-vehicle-copy">
                    <strong>{displayVehicle(category.name)?.title ?? category.name}</strong>
                    <small>{displayVehicle(category.name)?.description ?? copy.vehicleCategory}</small>
                  </span>
                  <span className="booking-vehicle-price">
                    {category.priceModifier > 0 ? `+ CHF ${category.priceModifier.toFixed(2)}` : copy.included}
                  </span>
                  <span className="booking-radio" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-field booking-field-wide">
            <label>{copy.extras}</label>
            {availableAddOns.length > 0 ? (
              <>
                <p className="booking-helper">{copy.extrasHelp}</p>
                <div className="booking-option-list">
                  {availableAddOns.map((addOn) => {
                    const selected = selectedAddOns.some((item) => item.id === addOn.id);

                    return (
                      <button
                        className={selected ? "is-selected" : ""}
                        key={addOn.id}
                        type="button"
                        onClick={() => handleAddOnToggle(addOn)}
                      >
                        <span>
                          <strong>{displayAddOn(addOn.name).name}</strong>
                          <small>{displayAddOn(addOn.name).description}</small>
                          <small>+ {formatDuration(addOn.additionalDuration)}</small>
                        </span>
                        <strong>+ CHF {addOn.price.toFixed(2)}</strong>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="booking-empty-options">
                {copy.noExtras}
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="booking-field booking-field-wide">
            <label>{copy.selectDate}</label>
            <div className="booking-calendar">
              <div className="booking-calendar-head">
                <button
                  type="button"
                  onClick={() => {
                    const prev = new Date(currentMonthDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentMonthDate(prev);
                  }}
                >
                  &larr;
                </button>
                <span>{currentMonthDate.toLocaleString(intlLocales[currentLanguage], { month: "long", year: "numeric" })}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = new Date(currentMonthDate);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentMonthDate(next);
                  }}
                >
                  &rarr;
                </button>
              </div>

              <div className="booking-weekdays">
                {copy.weekdays.map((day) => <span key={day}>{day}</span>)}
              </div>

              <div className="booking-days">
                {(() => {
                  const year = currentMonthDate.getFullYear();
                  const month = currentMonthDate.getMonth();
                  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
                  const totalDays = new Date(year, month + 1, 0).getDate();
                  const cells = [];
                  const todayObj = new Date();
                  todayObj.setHours(0, 0, 0, 0);

                  for (let i = 0; i < firstDayIndex; i++) {
                    cells.push(<span key={`empty-${i}`} />);
                  }

                  for (let day = 1; day <= totalDays; day++) {
                    const cellDate = new Date(year, month, day);
                    const dateString = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                    const isPast = cellDate < todayObj;
                    const isSelected = selectedDate === dateString;

                    cells.push(
                      <button
                        className={isSelected ? "is-selected" : ""}
                        disabled={isPast}
                        key={`day-${day}`}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateString);
                          setSelectedTime("");
                        }}
                      >
                        {day}
                      </button>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>

            {selectedDate && (
              <div className="booking-time-block">
                <p>
                  {copy.availableAt} {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(intlLocales[currentLanguage])} {copy.forAbout}{" "}
                  {formatDuration(totalDuration)}:
                </p>
                {loadingSlots ? (
                  <div className="booking-loading-inline">
                    <Loader2 className="spin" size={16} /> {copy.checkingTimes}
                  </div>
                ) : (
                  <div className="booking-time-grid">
                    {TIME_SLOTS.map((slot) => {
                      const isBlocked = blockedSlots.includes(slot);
                      const isSelected = selectedTime === slot;

                      return (
                        <button
                          className={isSelected ? "is-selected" : ""}
                          disabled={isBlocked}
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <>
            <div className="booking-field">
              <label htmlFor="name">{copy.fields.name}</label>
              <input id="name" name="name" type="text" autoComplete="name" maxLength={100} required />
            </div>

            <div className="booking-field">
              <label htmlFor="email">{copy.fields.email}</label>
              <input id="email" name="email" type="email" autoComplete="email" maxLength={160} required />
            </div>

            <div className="booking-field">
              <label htmlFor="phone">{copy.fields.phone}</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} required />
            </div>

            <div className="booking-field">
              <label htmlFor="vehicle">{copy.fields.vehicle}</label>
              <input id="vehicle" name="vehicle" type="text" placeholder={copy.vehiclePlaceholder} maxLength={120} required />
            </div>

            <div className="booking-field booking-field-wide">
              <label htmlFor="message">{copy.fields.message}</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                maxLength={1200}
                placeholder={copy.messagePlaceholder}
              />
            </div>
          </>
        )}

        <div className="booking-submit-row">
          <div className="price-summary">
            <span>{copy.estimatedTotal}</span>
            <strong>CHF {calculateTotal().toFixed(2)}</strong>
            <small>{copy.duration}: {formatDuration(totalDuration)}</small>
          </div>

          <div className="booking-actions">
            {step > 0 && (
              <button className="booking-submit is-secondary" type="button" onClick={() => { setMessage(""); setStep(step - 1); }}>
                <ChevronLeft size={16} /> {copy.back}
              </button>
            )}

            {step < 4 ? (
              <button className="booking-submit" type="button" onClick={handleNextStep}>
                {copy.next} <ChevronRight size={16} />
              </button>
            ) : (
              <button className="booking-submit" type="submit" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <CalendarCheck size={18} /> {copy.sending}
                  </>
                ) : (
                  <>
                    <Send size={18} /> {copy.send}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="booking-field booking-field-wide">
            <p className={`booking-status ${status}`}>{message}</p>
          </div>
        )}
      </form>

      {detailService && (
        <div className="service-detail-overlay" role="dialog" aria-modal="true" aria-label={`${displayServiceName(detailService.name)} ${copy.viewDetails}`}>
          <div className="service-detail-modal">
            <button className="service-detail-close" type="button" onClick={() => setDetailService(null)} aria-label={copy.closeDetails}>
              <X size={20} />
            </button>

            <div className="service-detail-tags">
              <span>
                <Sparkles size={14} /> {localizedDetail(detailService.name)?.tag ?? copy.service}
              </span>
              <span>
                <Clock3 size={14} /> {formatDuration(detailService.durationMinutes)}
              </span>
            </div>

            <h2>{localizedDetail(detailService.name)?.title ?? displayServiceName(detailService.name)}</h2>
            <h3>{copy.includedServices}</h3>

            <div className="service-detail-sections">
              {(localizedDetail(detailService.name)?.sections ?? []).map((section) => (
                <section key={section.title}>
                  <div className="service-detail-section-title">
                    <Check size={17} />
                    <strong>{section.title}</strong>
                  </div>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="service-detail-mode">
              <h3>{copy.bookingType}</h3>
              <div>
                <Info size={17} />
                <span>
                  <strong>{copy.studio}</strong>
                  {copy.studioText}
                </span>
              </div>
            </div>

            <div className="service-detail-footer">
              <strong>{localizedDetail(detailService.name)?.priceRange ?? `${copy.from} CHF ${detailService.basePrice.toFixed(2)}`}</strong>
              <button
                className="service-detail-select"
                type="button"
                onClick={() => {
                  if (!selectedServices.some((item) => item.id === detailService.id)) {
                    toggleService(detailService);
                  }
                  setDetailService(null);
                }}
              >
                {copy.select}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
