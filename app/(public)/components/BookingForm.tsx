"use client";

import { CalendarCheck, Send } from "lucide-react";
import { useState } from "react";

const serviceOptions = [
  "Komplett Innenreinigung",
  "Komplett Aussenreinigung",
  "Komplett Aufbereitung",
  "Erhaltungspflege",
  "Add-ons",
  "Politur & Keramik",
  "Noch nicht sicher",
];

type Status = "idle" | "loading" | "success" | "error";

export function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Die Anfrage konnte nicht gesendet werden.");
      }

      setStatus("success");
      setMessage("Danke. Deine Anfrage wurde gesendet und du erhaeltst eine Bestaetigung per E-Mail.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Die Anfrage konnte nicht gesendet werden.");
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
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
        <label htmlFor="service">Gewuenschte Leistung</label>
        <select id="service" name="service" required defaultValue="">
          <option value="" disabled>
            Leistung auswaehlen
          </option>
          {serviceOptions.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="booking-field">
        <label htmlFor="vehicle">Fahrzeugmodell</label>
        <input id="vehicle" name="vehicle" type="text" placeholder="z.B. BMW X5, Audi A4" required />
      </div>

      <div className="booking-field">
        <label htmlFor="condition">Fahrzeugzustand</label>
        <select id="condition" name="condition" required defaultValue="">
          <option value="" disabled>
            Zustand auswaehlen
          </option>
          <option value="Gepflegt">Gepflegt</option>
          <option value="Normal verschmutzt">Normal verschmutzt</option>
          <option value="Stark verschmutzt">Stark verschmutzt</option>
          <option value="Nicht sicher">Nicht sicher</option>
        </select>
      </div>

      <div className="booking-field">
        <label htmlFor="date">Wunschdatum</label>
        <input id="date" name="date" type="date" required />
      </div>

      <div className="booking-field">
        <label htmlFor="time">Wunschzeit</label>
        <input id="time" name="time" type="time" required />
      </div>

      <div className="booking-field booking-field-wide">
        <label htmlFor="message">Nachricht</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Erzaehl uns kurz, was gemacht werden soll oder worauf wir achten sollen."
        />
      </div>

      <div className="booking-submit-row">
        <button className="booking-submit" type="submit" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <CalendarCheck size={18} />
              Wird gesendet
            </>
          ) : (
            <>
              <Send size={18} />
              Anfrage senden
            </>
          )}
        </button>

        {message && <p className={`booking-status ${status}`}>{message}</p>}
      </div>
    </form>
  );
}
