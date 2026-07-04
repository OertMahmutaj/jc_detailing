"use client";

import { CalendarCheck, Send, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

type Service = { id: string; name: string; basePrice: number; durationMinutes: number };
type Category = { id: string; name: string; priceModifier: number };
type AddOn = { id: string; name: string; price: number; additionalDuration: number };
type Status = "idle" | "loading" | "success" | "error";

// Generate time slots from 08:00 to 19:30
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 19; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    slots.push(`${formattedHour}:00`);
    if (hour !== 19 || true) { // Include 19:30
      slots.push(`${formattedHour}:30`);
    }
  }
  return slots;
};

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];

// Limit selections to exactly 1 year from today to prevent crazy input bugs
const nextYear = new Date();
nextYear.setFullYear(nextYear.getFullYear() + 1);
const maxDate = nextYear.toISOString().split("T")[0];

const TIME_SLOTS = generateTimeSlots();

export function BookingForm() {
  const [step, setStep] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const [dbData, setDbData] = useState<{ services: Service[]; categories: Category[]; addOns: AddOn[] }>({
    services: [], categories: [], addOns: [],
  });

  // Selections State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  // NEW: Date and Time State
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/booking-data");
        const data = await res.json();
        setDbData(data);
        if (data.services.length > 0) setSelectedService(data.services[0]);
        if (data.categories.length > 0) setSelectedCategory(data.categories[0]);
      } catch (err) {
        console.error("Error loading configuration values:", err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleAddOnToggle = (addOn: AddOn) => {
    setSelectedAddOns((prev) =>
      prev.find((item) => item.id === addOn.id)
        ? prev.filter((item) => item.id !== addOn.id)
        : [...prev, addOn]
    );
  };

  const calculateTotal = () => {
    const servicePrice = selectedService?.basePrice ?? 0;
    const categorySurcharge = selectedCategory?.priceModifier ?? 0;
    const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
    return servicePrice + categorySurcharge + addOnsTotal;
  };

  const handleNextStep = () => {
    // Validate Step 3 before allowing the user to move to Step 4
    if (step === 3 && (!selectedDate || !selectedTime)) {
      setMessage("Bitte wähle ein Datum und eine Uhrzeit aus.");
      return;
    }
    setMessage("");
    setStep(step + 1);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const formPayload = Object.fromEntries(formData.entries());

    // Build complete payload including the state-saved date and time
    const fullPayload = {
      ...formPayload,
      serviceId: selectedService?.id,
      vehicleCategoryId: selectedCategory?.id,
      addOnIds: selectedAddOns.map((a) => a.id),
      totalPrice: calculateTotal(),
      date: selectedDate, // Added missing date
      time: selectedTime, // Added missing time
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

      // Reset State
      // event.currentTarget.reset();
      setSelectedAddOns([]);
      setSelectedDate("");
      setSelectedTime("");
      if (dbData.services.length > 0) setSelectedService(dbData.services[0]);
      if (dbData.categories.length > 0) setSelectedCategory(dbData.categories[0]);
      setStep(0);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Die Anfrage konnte nicht gesendet werden.");
    }
  }

  if (loadingData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <Loader2 style={{ animation: "spin 1s linear infinite" }} size={32} />
      </div>
    );
  }

  // Get today's date in YYYY-MM-DD format to prevent past date selection
  const today = new Date().toISOString().split("T")[0];

  return (
    <form className="booking-form" onSubmit={handleSubmit}>

      <div className="booking-steps-header" style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "1.5rem", opacity: 0.7, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>
        <span style={{ color: step === 0 ? "var(--accent-color, #0070f3)" : "inherit", fontWeight: step === 0 ? "bold" : "normal" }}>1. Service</span>
        <span style={{ color: step === 1 ? "var(--accent-color, #0070f3)" : "inherit", fontWeight: step === 1 ? "bold" : "normal" }}>2. Größe</span>
        <span style={{ color: step === 2 ? "var(--accent-color, #0070f3)" : "inherit", fontWeight: step === 2 ? "bold" : "normal" }}>3. Extras</span>
        <span style={{ color: step === 3 ? "var(--accent-color, #0070f3)" : "inherit", fontWeight: step === 3 ? "bold" : "normal" }}>4. Termin</span>
        <span style={{ color: step === 4 ? "var(--accent-color, #0070f3)" : "inherit", fontWeight: step === 4 ? "bold" : "normal" }}>5. Details</span>
      </div>

      {step === 0 && (
        <div className="booking-field booking-field-wide">
          <label>Gewünschte Leistung auswählen</label>
          <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.5rem" }}>
            {dbData.services.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedService(s)}
                style={{
                  padding: "1rem",
                  border: selectedService?.id === s.id ? "2px solid var(--accent-color, #0070f3)" : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: selectedService?.id === s.id ? "rgba(0,112,243,0.1)" : "transparent",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>{s.name}</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>Dauer: ~{s.durationMinutes} Min.</div>
                </div>
                <div style={{ fontWeight: "bold" }}>CHF {s.basePrice.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="booking-field booking-field-wide">
          <label>Fahrzeuggrösse auswählen</label>
          <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.5rem" }}>
            {dbData.categories.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCategory(c)}
                style={{
                  padding: "1rem",
                  border: selectedCategory?.id === c.id ? "2px solid var(--accent-color, #0070f3)" : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: selectedCategory?.id === c.id ? "rgba(0,112,243,0.1)" : "transparent",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}
              >
                <div style={{ fontWeight: "bold" }}>{c.name}</div>
                <div style={{ fontWeight: "bold" }}>
                  {c.priceModifier > 0 ? `+ CHF ${c.priceModifier.toFixed(2)}` : "inkl."}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="booking-field booking-field-wide">
          <label>Zusatzleistungen hinzufügen (Optional)</label>
          <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.5rem" }}>
            {dbData.addOns.map((a) => {
              const isSelected = selectedAddOns.some((item) => item.id === a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => handleAddOnToggle(a)}
                  style={{
                    padding: "1rem",
                    border: isSelected ? "2px solid var(--accent-color, #0070f3)" : "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: isSelected ? "rgba(0,112,243,0.1)" : "transparent",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>{a.name}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>+ {a.additionalDuration} Min.</div>
                  </div>
                  <div style={{ fontWeight: "bold" }}>+ CHF {a.price.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Inline Calendar Grid & Time Slot Selector */}
      {step === 3 && (
        <div className="booking-field booking-field-wide">
          <label style={{ marginBottom: "1rem", display: "block", fontWeight: "bold" }}>
            Wähle Datum & Uhrzeit
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* 1. CUSTOM INLINE CALENDAR GRID */}
            <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "1rem", background: "rgba(0,0,0,0.02)" }}>
              {/* Calendar Header with Month Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <button
                  type="button"
                  className="booking-submit"
                  style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem" }}
                  onClick={() => {
                    const prev = new Date(currentMonthDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentMonthDate(prev);
                  }}
                >
                  &larr;
                </button>
                <span style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                  {currentMonthDate.toLocaleString("de-CH", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  className="booking-submit"
                  style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem" }}
                  onClick={() => {
                    const next = new Date(currentMonthDate);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentMonthDate(next);
                  }}
                >
                  &rarr;
                </button>
              </div>

              {/* Days of Week Row Headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: "bold", fontSize: "0.8rem", opacity: 0.5, marginBottom: "0.5rem" }}>
                <span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>
              </div>

              {/* Days Matrix Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {(() => {
                  const year = currentMonthDate.getFullYear();
                  const month = currentMonthDate.getMonth();

                  // First day of the month offset
                  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
                  const totalDays = new Date(year, month + 1, 0).getDate();
                  const cells = [];

                  // Blank spacer cells for previous month alignment
                  for (let i = 0; i < firstDayIndex; i++) {
                    cells.push(<div key={`empty-${i}`} />);
                  }

                  // Real clickable day cells
                  const todayObj = new Date();
                  todayObj.setHours(0, 0, 0, 0);

                  for (let day = 1; day <= totalDays; day++) {
                    const cellDate = new Date(year, month, day);
                    const dateString = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                    const isPast = cellDate < todayObj;
                    const isSelected = selectedDate === dateString;

                    cells.push(
                      <div
                        key={`day-${day}`}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedDate(dateString);
                            setSelectedTime(""); // Wipe out previously chosen hours slot
                          }
                        }}
                        style={{
                          padding: "0.5rem 0",
                          textAlign: "center",
                          cursor: isPast ? "not-allowed" : "pointer",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          opacity: isPast ? 0.25 : 1,
                          backgroundColor: isSelected ? "var(--accent-color, #0070f3)" : "transparent",
                          color: isSelected ? "#fff" : "inherit",
                          border: !isPast && !isSelected ? "1px solid rgba(255,255,255,0.05)" : "none",
                          transition: "all 0.1s ease"
                        }}
                      >
                        {day}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>

            {/* 2. TIME SLOT GRID */}
            {selectedDate && (
              <div>
                <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.75rem" }}>
                  Verfügbare Uhrzeiten am {new Date(selectedDate).toLocaleDateString('de-CH')}:
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                  gap: "0.5rem"
                }}>
                  {TIME_SLOTS.map((slot) => (
                    <div
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: "0.6rem 0",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        border: selectedTime === slot ? "2px solid var(--accent-color, #0070f3)" : "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: selectedTime === slot ? "rgba(0,112,243,0.1)" : "transparent",
                        color: selectedTime === slot ? "var(--accent-color, #0070f3)" : "inherit",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <>
          <div className="booking-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" autoComplete="name" required />
          </div>

          <div className="booking-field">
            <label htmlFor="email">E-Mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="booking-field">
            <label htmlFor="phone">Telefon</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" required />
          </div>

          <div className="booking-field">
            <label htmlFor="vehicle">Fahrzeugmodell</label>
            <input id="vehicle" name="vehicle" type="text" placeholder="z.B. BMW X5, Audi A4" required />
          </div>

          <div className="booking-field booking-field-wide">
            <label htmlFor="message">Nachricht (Optional)</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Erzähl uns kurz, was gemacht werden soll oder worauf wir achten sollen."
            />
          </div>
        </>
      )}

      <div className="booking-submit-row" style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "1rem" }}>
        <div className="price-summary" style={{ textAlign: "left" }}>
          <span style={{ fontSize: "0.75rem", opacity: 0.6, display: "block" }}>Gesamtpreis (geschätzt):</span>
          <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--accent-color, #0070f3)" }}>CHF {calculateTotal().toFixed(2)}</span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {step > 0 && (
            <button className="booking-submit" type="button" onClick={() => { setMessage(""); setStep(step - 1); }} style={{ padding: "0.5rem 1rem", opacity: 0.8 }}>
              <ChevronLeft size={16} /> Zurück
            </button>
          )}

          {step < 4 ? (
            <button className="booking-submit" type="button" onClick={handleNextStep} style={{ padding: "0.5rem 1rem" }}>
              Weiter <ChevronRight size={16} />
            </button>
          ) : (
            <button className="booking-submit" type="submit" disabled={status === "loading"}>
              {status === "loading" ? (
                <><CalendarCheck size={18} /> Wird gesendet</>
              ) : (
                <><Send size={18} /> Anfrage senden</>
              )}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="booking-field booking-field-wide" style={{ marginTop: "1rem" }}>
          <p className={`booking-status ${status}`} style={{ margin: 0, padding: "0.5rem", borderRadius: "4px", fontSize: "0.9rem", color: status === "error" ? "red" : "inherit" }}>
            {message}
          </p>
        </div>
      )}
    </form>
  );
}