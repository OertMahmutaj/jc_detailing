"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AdminBookingCreator } from "../_components/AdminBookingCreator";
import { useAdminNotification } from "../_components/AdminNotificationProvider";

type ActionResult = {
  success: boolean;
  error?: string;
};

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

  cancelBookingAction: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
  }>;

  categories: Array<{ id: string; name: string; price?: number }>;

  createBookingAction: (formData: FormData) => Promise<ActionResult>;

  createBlockAction: (formData: FormData) => Promise<void>;

  deleteBlockAction: (formData: FormData) => Promise<void>;

  services: Array<{ id: string; name: string; price?: number }>;

  updateBookingAction: (formData: FormData) => Promise<ActionResult>;
};

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const monthFormatter = new Intl.DateTimeFormat("de-CH", {
  month: "long",
  year: "numeric",
});

const INITIAL_DATE = new Date(2000, 0, 1);
const INITIAL_DATE_KEY = "2000-01-01";

function toDateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(value.getDate()).padStart(2, "0")}`;
}

function isoToDateKey(value: string) {
  return toDateKey(new Date(value));
}

function timeValue(value: string) {
  const date = new Date(value);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function buildMonthDays(monthDate: Date) {
  const firstDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1
  );

  const lastDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  );

  const leadingDays = (firstDay.getDay() + 6) % 7;

  const days: Array<{ date: Date; inMonth: boolean }> = [];

  for (let index = leadingDays; index > 0; index--) {
    days.push({
      date: new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        1 - index
      ),
      inMonth: false,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push({
      date: new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        day
      ),
      inMonth: true,
    });
  }

  while (days.length % 7 !== 0) {
    const nextDay = days.length - leadingDays - lastDay.getDate() + 1;

    days.push({
      date: new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        nextDay
      ),
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
  const router = useRouter();
  const { showNotification } = useAdminNotification();

  const [hasHydrated, setHasHydrated] = useState(false);

  const [todayKey, setTodayKey] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(INITIAL_DATE);
  const [selectedDate, setSelectedDate] = useState(INITIAL_DATE_KEY);

  const [editingBooking, setEditingBooking] =
    useState<CalendarBooking | null>(null);

  const [blockingDate, setBlockingDate] = useState<string | null>(null);

  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [isCancellingBooking, setIsCancellingBooking] = useState(false);

  async function handleBookingCancel(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isCancellingBooking) return;

    try {
      setIsCancellingBooking(true);

      const result = await cancelBookingAction(
        new FormData(event.currentTarget)
      );

      if (!result.success) {
        showNotification(
          result.error || "Die Buchung konnte nicht storniert werden.",
          "error"
        );
        return;
      }

      setEditingBooking(null);

      showNotification(
        "Die Buchung wurde erfolgreich storniert.",
        "success"
      );

      router.refresh();
    } catch (error) {
      console.error("Booking cancellation failed:", error);

      showNotification(
        "Die Buchung konnte nicht storniert werden.",
        "error"
      );
    } finally {
      setIsCancellingBooking(false);
    }
  }

  useEffect(() => {
    const today = new Date();
    const currentDayKey = toDateKey(today);

    setTodayKey(currentDayKey);
    setSelectedDate(currentDayKey);

    setVisibleMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    setHasHydrated(true);
  }, []);

  const monthDays = useMemo(
    () => buildMonthDays(visibleMonth),
    [visibleMonth]
  );

  const bookingsByDay = useMemo(() => {
    return bookings.reduce<Record<string, CalendarBooking[]>>(
      (acc, booking) => {
        const key = isoToDateKey(booking.startTime);

        acc[key] = [...(acc[key] ?? []), booking];

        return acc;
      },
      {}
    );
  }, [bookings]);

  const blocksByDay = useMemo(() => {
    return blocks.reduce<Record<string, CalendarBlock[]>>(
      (acc, block) => {
        const key = isoToDateKey(block.startTime);

        acc[key] = [...(acc[key] ?? []), block];

        return acc;
      },
      {}
    );
  }, [blocks]);

  const selectedBookings = bookingsByDay[selectedDate] ?? [];
  const selectedBlocks = blocksByDay[selectedDate] ?? [];

  async function handleBookingUpdate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isUpdatingBooking) return;

    try {
      setIsUpdatingBooking(true);

      const formData = new FormData(event.currentTarget);

      const result = await updateBookingAction(formData);

      if (!result.success) {
        showNotification(
          result.error ||
          "Die Buchung konnte nicht gespeichert werden.",
          "error"
        );

        return;
      }

      setEditingBooking(null);

      showNotification(
        "Die Buchung wurde erfolgreich aktualisiert.",
        "success"
      );

      router.refresh();
    } catch (error) {
      console.error("Booking update failed:", error);

      showNotification(
        "Die Buchung konnte nicht gespeichert werden.",
        "error"
      );
    } finally {
      setIsUpdatingBooking(false);
    }
  }

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
                  new Date(
                    current.getFullYear(),
                    current.getMonth() - 1,
                    1
                  )
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
                  new Date(
                    current.getFullYear(),
                    current.getMonth() + 1,
                    1
                  )
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
                <span className="admin-calendar-day-number">
                  {date.getDate()}
                </span>

                <span className="admin-calendar-day-preview">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <small key={booking.id}>
                      {timeValue(booking.startTime)} {booking.clientName}
                    </small>
                  ))}

                  {!dayBookings.length && dayBlocks.length > 0 && (
                    <small>Blockiert</small>
                  )}

                  {!dayBookings.length && !dayBlocks.length && (
                    <small>Leer</small>
                  )}
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
                {timeValue(booking.startTime)} -{" "}
                {timeValue(booking.endTime)}
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
                    : `${timeValue(block.startTime)} - ${timeValue(
                      block.endTime
                    )}`}
                </span>

                <strong>{block.reason || "Blockiert"}</strong>
              </div>

              <form action={deleteBlockAction}>
                <input name="id" type="hidden" value={block.id} />

                <button
                  className="admin-danger-button"
                  type="submit"
                >
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
          aria-label="Zeit blockieren"
          aria-modal="true"
          className="admin-modal-backdrop"
          role="dialog"
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
                  defaultValue={blockingDate}
                  name="date"
                  required
                  type="date"
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
          aria-label="Buchung bearbeiten"
          aria-modal="true"
          className="admin-modal-backdrop"
          role="dialog"
        >
          <div className="admin-modal admin-calendar-modal">
            <button
              className="admin-modal-close"
              disabled={isUpdatingBooking}
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
                <span>
                  Extras: {editingBooking.addOns.join(", ")}
                </span>
              )}
            </div>

            <form
              className="admin-form-grid"
              onSubmit={handleBookingUpdate}
            >
              <input
                name="id"
                type="hidden"
                value={editingBooking.id}
              />

              <label>
                Datum
                <input
                  defaultValue={isoToDateKey(
                    editingBooking.startTime
                  )}
                  name="date"
                  required
                  type="date"
                />
              </label>

              <label>
                Von
                <input
                  defaultValue={timeValue(editingBooking.startTime)}
                  name="start"
                  required
                  step="1800"
                  type="time"
                />
              </label>

              <label>
                Bis
                <input
                  defaultValue={timeValue(editingBooking.endTime)}
                  name="end"
                  required
                  step="1800"
                  type="time"
                />
              </label>

              <button
                className="admin-submit-button"
                disabled={isUpdatingBooking}
                type="submit"
              >
                {isUpdatingBooking
                  ? "Buchung wird gespeichert..."
                  : "Buchung speichern"}
              </button>
            </form>

            <form
              className="admin-calendar-cancel-form"
              onSubmit={handleBookingCancel}
            >
              <input name="id" type="hidden" value={editingBooking.id} />

              <button
                className="admin-danger-button"
                disabled={isUpdatingBooking || isCancellingBooking}
                type="submit"
              >
                {isCancellingBooking
                  ? "Buchung wird storniert..."
                  : "Buchung stornieren"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}