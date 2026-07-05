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
    image: "/IMG_4623.jpeg",
  },
  Sedan: {
    title: "Limousine",
    description: "Standardfahrzeuge (Audi A4, Mercedes C-Klasse)",
    image: "/aussenreinigung.jpg",
  },
  "Sports Car": {
    title: "Sportwagen",
    description: "Sportliche Fahrzeuge (Porsche, Ferrari)",
    image: "/politur.jpeg",
  },
  SUV: {
    title: "SUV",
    description: "Grössere Fahrzeuge (Peugeot 5008, Range Rover)",
    image: "/keramikversiegelung.jpeg",
  },
  Van: {
    title: "Van",
    description: "Minivans und Transporter",
    image: "/innenreinigung.jpeg",
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

function generateTimeSlots() {
  const slots: string[] = [];

  for (let hour = 8; hour <= 19; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    slots.push(`${formattedHour}:00`);
    slots.push(`${formattedHour}:30`);
  }

  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export function BookingForm() {
  const [step, setStep] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
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
      setMessage("Bitte wähle mindestens eine Leistung aus.");
      return;
    }

    if (step === 3 && (!selectedDate || !selectedTime)) {
      setMessage("Bitte wähle ein Datum und eine Uhrzeit aus.");
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
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Die Anfrage konnte nicht gesendet werden.");
      }

      setStatus("success");
      setMessage("Danke. Deine Anfrage wurde gesendet und du erhältst eine Bestätigung per E-Mail.");
      setSelectedServices([]);
      setSelectedAddOns([]);
      setSelectedDate("");
      setSelectedTime("");
      if (dbData.categories.length > 0) setSelectedCategory(dbData.categories[0]);
      setStep(0);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Die Anfrage konnte nicht gesendet werden.");
    }
  }

  if (loadingData) {
    return (
      <div className="booking-loading">
        <Loader2 className="spin" size={32} />
      </div>
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
          <span className={step === 0 ? "is-active" : ""}>1. Service</span>
          <span className={step === 1 ? "is-active" : ""}>2. Grösse</span>
          <span className={step === 2 ? "is-active" : ""}>3. Extras</span>
          <span className={step === 3 ? "is-active" : ""}>4. Termin</span>
          <span className={step === 4 ? "is-active" : ""}>5. Details</span>
        </div>

        {step === 0 && (
          <div className="booking-field booking-field-wide">
            <label>Leistungen auswählen</label>
            <p className="booking-helper">Du kannst eine oder mehrere Leistungen auswählen.</p>

            <div className="booking-service-grid">
              {visibleServices.map((service) => {
                const selected = selectedServices.some((item) => item.id === service.id);
                const detail = serviceDetails[service.name];
                const addOnCount = service.name === "Komplett Innenreinigung" || service.name === "Komplette Premium Paket" ? 1 : service.name === "Pflegeerhaltung Innenreinigung" ? 4 : 0;

                return (
                  <article className={`booking-service-card${selected ? " is-selected" : ""}`} key={service.id}>
                    <div>
                      <div className="booking-service-card-top">
                        <h3>{service.name}</h3>
                        <span>{formatDuration(service.durationMinutes)}</span>
                      </div>

                      {addOnCount > 0 && <p>{addOnCount} Zusatzleistung{addOnCount > 1 ? "en" : ""}</p>}

                      <button type="button" className="booking-detail-link" onClick={() => setDetailService(service)}>
                        Details ansehen
                      </button>
                    </div>

                    <div className="booking-service-card-bottom">
                      <span>
                        Ab
                        <strong>CHF {service.basePrice.toFixed(2)}</strong>
                      </span>
                      <button type="button" onClick={() => toggleService(service)}>
                        {selected ? "Entfernen" : "Hinzufügen"}
                      </button>
                    </div>

                    {!detail && <small>Details werden nachgetragen.</small>}
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
                {showAllServices ? "Weniger Services" : "Mehr Services"}
              </button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="booking-field booking-field-wide">
            <label>Fahrzeuggrösse auswählen</label>
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
                    style={{ backgroundImage: `url(${vehicleDetails[category.name]?.image ?? "/IMG_4623.jpeg"})` }}
                  />
                  <span className="booking-vehicle-copy">
                    <strong>{vehicleDetails[category.name]?.title ?? category.name}</strong>
                    <small>{vehicleDetails[category.name]?.description ?? "Fahrzeugkategorie"}</small>
                  </span>
                  <span className="booking-vehicle-price">
                    {category.priceModifier > 0 ? `+ CHF ${category.priceModifier.toFixed(2)}` : "inkl."}
                  </span>
                  <span className="booking-radio" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-field booking-field-wide">
            <label>Zusatzleistungen hinzufügen (optional)</label>
            {availableAddOns.length > 0 ? (
              <>
                <p className="booking-helper">Wähle nur die Zusatzleistungen, die du wirklich brauchst.</p>
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
                          <strong>{addOn.name}</strong>
                          <small>{addOnDescriptions[addOn.name]}</small>
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
                Für die ausgewählten Leistungen sind keine Zusatzleistungen verfügbar. Du kannst direkt weitergehen.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="booking-field booking-field-wide">
            <label>Datum und Uhrzeit auswählen</label>
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
                <span>{currentMonthDate.toLocaleString("de-CH", { month: "long", year: "numeric" })}</span>
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
                <span>Mo</span>
                <span>Di</span>
                <span>Mi</span>
                <span>Do</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>So</span>
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
                  Verfügbare Uhrzeiten am {new Date(selectedDate).toLocaleDateString("de-CH")} für ca.{" "}
                  {formatDuration(totalDuration)}:
                </p>
                {loadingSlots ? (
                  <div className="booking-loading-inline">
                    <Loader2 className="spin" size={16} /> Zeiten werden geprüft...
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
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" autoComplete="name" maxLength={100} required />
            </div>

            <div className="booking-field">
              <label htmlFor="email">E-Mail</label>
              <input id="email" name="email" type="email" autoComplete="email" maxLength={160} required />
            </div>

            <div className="booking-field">
              <label htmlFor="phone">Telefon</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} required />
            </div>

            <div className="booking-field">
              <label htmlFor="vehicle">Fahrzeugmodell</label>
              <input id="vehicle" name="vehicle" type="text" placeholder="z.B. BMW X5, Audi A4" maxLength={120} required />
            </div>

            <div className="booking-field booking-field-wide">
              <label htmlFor="message">Nachricht (optional)</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                maxLength={1200}
                placeholder="Erzähl uns kurz, was gemacht werden soll oder worauf wir achten sollen."
              />
            </div>
          </>
        )}

        <div className="booking-submit-row">
          <div className="price-summary">
            <span>Geschätzter Gesamtpreis</span>
            <strong>CHF {calculateTotal().toFixed(2)}</strong>
            <small>Dauer: ca. {formatDuration(totalDuration)}</small>
          </div>

          <div className="booking-actions">
            {step > 0 && (
              <button className="booking-submit is-secondary" type="button" onClick={() => { setMessage(""); setStep(step - 1); }}>
                <ChevronLeft size={16} /> Zurück
              </button>
            )}

            {step < 4 ? (
              <button className="booking-submit" type="button" onClick={handleNextStep}>
                Weiter <ChevronRight size={16} />
              </button>
            ) : (
              <button className="booking-submit" type="submit" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <CalendarCheck size={18} /> Wird gesendet
                  </>
                ) : (
                  <>
                    <Send size={18} /> Anfrage senden
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
        <div className="service-detail-overlay" role="dialog" aria-modal="true" aria-label={`${detailService.name} Details`}>
          <div className="service-detail-modal">
            <button className="service-detail-close" type="button" onClick={() => setDetailService(null)} aria-label="Details schliessen">
              <X size={20} />
            </button>

            <div className="service-detail-tags">
              <span>
                <Sparkles size={14} /> {serviceDetails[detailService.name]?.tag ?? "Leistung"}
              </span>
              <span>
                <Clock3 size={14} /> {formatDuration(detailService.durationMinutes)}
              </span>
            </div>

            <h2>{serviceDetails[detailService.name]?.title ?? detailService.name}</h2>
            <h3>Enthaltene Leistungen</h3>

            <div className="service-detail-sections">
              {(serviceDetails[detailService.name]?.sections ?? []).map((section) => (
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
              <h3>Verfügbare Buchungsart</h3>
              <div>
                <Info size={17} />
                <span>
                  <strong>Im Studio</strong>
                  Termin am Standort von JC Detailing in Wauwil.
                </span>
              </div>
            </div>

            <div className="service-detail-footer">
              <strong>{serviceDetails[detailService.name]?.priceRange ?? `Ab CHF ${detailService.basePrice.toFixed(2)}`}</strong>
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
                Auswählen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
