"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AdminBookingCreator } from "../_components/AdminBookingCreator";

type CalendarBooking = {
  addOns: string[];
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  endTime: string;
  id: string;
  serviceName: string;
  startTime: string;
  status: string;
  vehicle: string;
};

type CalendarBlock = {
  endTime: string;
  fullDay: boolean;
  id: string;
  reason: string | null;
  startTime: string;
};

type CalendarProps = {
  addOns: Array<{ id: string; name: string; price?: number }>;
  blocks: CalendarBlock[];
  bookings: CalendarBooking[];
  cancelBookingAction: (formData: FormData) => Promise<void>;
  categories: Array<{ id: string; name: string; price?: number }>;
  createBookingAction: (formData: FormData) => Promise<void>;
  createBlockAction: (formData: FormData) => Promise<void>;
  deleteBlockAction: (formData: FormData) => Promise<void>;
  services: Array<{ id: string; name: string; price?: number }>;
  updateBookingAction: (formData: FormData) => Promise<void>;
};

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const monthFormatter = new Intl.DateTimeFormat("de-CH", {
  month: "long",
  year: "numeric",
});

// Stable initial values for server render + first browser render.
// They are replaced with the real local date after hydration.
const INITIAL_DATE = new Date(2000, 0, 1);
const INITIAL_DATE_KEY = "2000-01-01";

function toDateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate()
  ).padStart(2, "0")}`;
}

function isoToDateKey(value: string) {
  return toDateKey(new Date(value));
}

function timeValue(value: string) {
  const date = new Date(value);

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(
    2,
    "0"
  )}`;
}

function buildMonthDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const leadingDays = (firstDay.getDay() + 6) % 7;

  const days: Array<{ date: Date; inMonth: boolean }> = [];

  for (let index = leadingDays; index > 0; index--) {
    days.push({
      date: new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 - index),
      inMonth: false,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push({
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
      inMonth: true,
    });
  }

  while (days.length % 7 !== 0) {
    const nextDay = days.length - leadingDays - lastDay.getDate() + 1;

    days.push({
      date: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, nextDay),
      inMonth: false,
    });
  }

  return days;
}

export function AdminCalendarClient({
  addOns,
  blocks,
  bookings,
  cancelBookingAction,
  categories,
  createBookingAction,
  createBlockAction,
  deleteBlockAction,
  services,
  updateBookingAction,
}: CalendarProps) {
  const [hasHydrated, setHasHydrated] = useState(false);

  const [todayKey, setTodayKey] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(INITIAL_DATE);
  const [selectedDate, setSelectedDate] = useState(INITIAL_DATE_KEY);

  const [editingBooking, setEditingBooking] = useState<CalendarBooking | null>(null);
  const [blockingDate, setBlockingDate] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const currentDayKey = toDateKey(today);

    setTodayKey(currentDayKey);
    setSelectedDate(currentDayKey);
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setHasHydrated(true);
  }, []);

  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);

  const bookingsByDay = useMemo(() => {
    return bookings.reduce<Record<string, CalendarBooking[]>>((acc, booking) => {
      const key = isoToDateKey(booking.startTime);

      acc[key] = [...(acc[key] ?? []), booking];

      return acc;
    }, {});
  }, [bookings]);

  const blocksByDay = useMemo(() => {
    return blocks.reduce<Record<string, CalendarBlock[]>>((acc, block) => {
      const key = isoToDateKey(block.startTime);

      acc[key] = [...(acc[key] ?? []), block];

      return acc;
    }, {});
  }, [blocks]);

  const selectedBookings = bookingsByDay[selectedDate] ?? [];
  const selectedBlocks = blocksByDay[selectedDate] ?? [];

  // Server and browser render exactly the same thing first.
  // The real calendar appears only after the browser has hydrated.
  if (!hasHydrated) {
    return null;
  }

  return (
    <section className="admin-calendar-shell">
      <div className="admin-calendar-board admin-panel">
        <div className="admin-calendar-toolbar">
          <button
            aria-label="Vorheriger Monat"
            onClick={() =>
              setVisibleMonth(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() - 1, 1)
              )
            }
            type="button"
          >
            <ChevronLeft size={18} />
          </button>

          <h2>{monthFormatter.format(visibleMonth)}</h2>

          <button
            aria-label="Naechster Monat"
            onClick={() =>
              setVisibleMonth(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() + 1, 1)
              )
            }
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="admin-calendar-weekdays">
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="admin-calendar-month">
          {monthDays.map(({ date, inMonth }) => {
            const key = toDateKey(date);
            const dayBookings = bookingsByDay[key] ?? [];
            const dayBlocks = blocksByDay[key] ?? [];
            const isSelected = selectedDate === key;
            const isToday = todayKey === key;

            return (
              <button
                className={[
                  "admin-calendar-day",
                  inMonth ? "" : "is-muted",
                  isSelected ? "is-selected" : "",
                  isToday ? "is-today" : "",
                  dayBookings.length ? "has-bookings" : "",
                  dayBlocks.length ? "has-blocks" : "",
                ].join(" ")}
                key={key}
                onClick={() => setSelectedDate(key)}
                type="button"
              >
                <span className="admin-calendar-day-number">{date.getDate()}</span>

                <span className="admin-calendar-day-preview">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <small key={booking.id}>
                      {timeValue(booking.startTime)} {booking.clientName}
                    </small>
                  ))}

                  {!dayBookings.length && dayBlocks.length > 0 && (
                    <small>Blockiert</small>
                  )}

                  {!dayBookings.length && !dayBlocks.length && <small>Leer</small>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="admin-calendar-side admin-panel">
        <div className="admin-panel-head">
          <div>
            <span>Ausgewaehlter Tag</span>
            <h2>{selectedDate.split("-").reverse().join(".")}</h2>
          </div>

          <button
            className="admin-secondary-button"
            onClick={() => setBlockingDate(selectedDate)}
            type="button"
          >
            Zeit blockieren
          </button>

          <AdminBookingCreator
            action={createBookingAction}
            addOns={addOns}
            categories={categories}
            defaultDate={selectedDate}
            services={services}
          />
        </div>

        <div className="admin-calendar-events">
          {selectedBookings.map((booking) => (
            <button
              className="admin-calendar-event"
              key={booking.id}
              onClick={() => setEditingBooking(booking)}
              type="button"
            >
              <span>
                {timeValue(booking.startTime)} - {timeValue(booking.endTime)}
              </span>

              <strong>{booking.clientName}</strong>
              <small>{booking.serviceName}</small>
            </button>
          ))}

          {selectedBlocks.map((block) => (
            <article className="admin-calendar-block" key={block.id}>
              <div>
                <span>
                  {block.fullDay
                    ? "Ganzer Tag"
                    : `${timeValue(block.startTime)} - ${timeValue(block.endTime)}`}
                </span>

                <strong>{block.reason || "Blockiert"}</strong>
              </div>

              <form action={deleteBlockAction}>
                <input name="id" type="hidden" value={block.id} />

                <button className="admin-danger-button" type="submit">
                  Entfernen
                </button>
              </form>
            </article>
          ))}

          {!selectedBookings.length && !selectedBlocks.length && (
            <p className="admin-empty">
              Keine Termine oder Sperren fuer diesen Tag.
            </p>
          )}
        </div>
      </aside>

      {blockingDate && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-label="Zeit blockieren"
          aria-modal="true"
        >
          <form
            action={createBlockAction}
            className="admin-modal admin-calendar-modal"
            onSubmit={() => setBlockingDate(null)}
          >
            <button
              className="admin-modal-close"
              onClick={() => setBlockingDate(null)}
              type="button"
            >
              <X size={22} />
            </button>

            <div className="admin-panel-head">
              <div>
                <span>Sperre</span>
                <h2>Zeit blockieren</h2>
              </div>
            </div>

            <div className="admin-form-grid">
              <label>
                Datum
                <input
                  name="date"
                  required
                  type="date"
                  defaultValue={blockingDate}
                />
              </label>

              <label>
                Von
                <input
                  defaultValue="08:00"
                  name="start"
                  step="1800"
                  type="time"
                />
              </label>

              <label>
                Bis
                <input
                  defaultValue="19:30"
                  name="end"
                  step="1800"
                  type="time"
                />
              </label>

              <label>
                Notiz optional
                <input
                  name="reason"
                  placeholder="Ferien, privat, Werkstatt..."
                  type="text"
                />
              </label>

              <label className="admin-check-row">
                <input name="fullDay" type="checkbox" />
                Ganzen Tag blockieren
              </label>
            </div>

            <button className="admin-submit-button" type="submit">
              Sperre speichern
            </button>
          </form>
        </div>
      )}

      {editingBooking && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-label="Buchung bearbeiten"
          aria-modal="true"
        >
          <div className="admin-modal admin-calendar-modal">
            <button
              className="admin-modal-close"
              onClick={() => setEditingBooking(null)}
              type="button"
            >
              <X size={22} />
            </button>

            <div className="admin-panel-head">
              <div>
                <span>Buchung</span>
                <h2>{editingBooking.clientName}</h2>
              </div>
            </div>

            <div className="admin-calendar-booking-summary">
              <p>{editingBooking.serviceName}</p>
              <span>{editingBooking.vehicle}</span>
              <span>{editingBooking.clientEmail}</span>
              <span>{editingBooking.clientPhone}</span>

              {editingBooking.addOns.length > 0 && (
                <span>Extras: {editingBooking.addOns.join(", ")}</span>
              )}
            </div>

            <form
              action={updateBookingAction}
              className="admin-form-grid"
              onSubmit={() => setEditingBooking(null)}
            >
              <input name="id" type="hidden" value={editingBooking.id} />

              <label>
                Datum
                <input
                  name="date"
                  required
                  type="date"
                  defaultValue={isoToDateKey(editingBooking.startTime)}
                />
              </label>

              <label>
                Von
                <input
                  name="start"
                  required
                  step="1800"
                  type="time"
                  defaultValue={timeValue(editingBooking.startTime)}
                />
              </label>

              <label>
                Bis
                <input
                  name="end"
                  required
                  step="1800"
                  type="time"
                  defaultValue={timeValue(editingBooking.endTime)}
                />
              </label>

              <button className="admin-submit-button" type="submit">
                Buchung speichern
              </button>
            </form>

            <form
              action={cancelBookingAction}
              className="admin-calendar-cancel-form"
              onSubmit={() => setEditingBooking(null)}
            >
              <input name="id" type="hidden" value={editingBooking.id} />

              <button className="admin-danger-button" type="submit">
                Buchung stornieren
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}