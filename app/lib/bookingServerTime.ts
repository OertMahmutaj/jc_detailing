const TIME_ZONE = "Europe/Zurich";
const SERVER_DAY_START = "08:00";
const SERVER_DAY_END = "23:00";
const SERVER_WORK_MINUTES_PER_DAY = 15 * 60;
const EXTRA_ROLLOVER_DAYS = 14;

export type ScheduleRange = {
  startTime: Date;
  endTime: Date;
};

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return representedAsUtc - date.getTime();
}

export function buildZurichDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const wallTimeAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);

  let offset = getTimeZoneOffsetMs(new Date(wallTimeAsUtc), TIME_ZONE);
  let result = new Date(wallTimeAsUtc - offset);

  // Correct the offset around daylight-saving transitions.
  const correctedOffset = getTimeZoneOffsetMs(result, TIME_ZONE);

  if (correctedOffset !== offset) {
    offset = correctedOffset;
    result = new Date(wallTimeAsUtc - offset);
  }

  return result;
}

export function getZurichDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));

  return date.toISOString().slice(0, 10);
}

function clampDate(value: Date, min: Date, max: Date) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) {
  return startA < endB && endA > startB;
}

export function isDateInsideScheduleBlock(
  date: Date,
  blocks: ScheduleRange[],
) {
  return blocks.some(
    (block) => date >= block.startTime && date < block.endTime,
  );
}

export function getServerScheduleHorizonEnd(
  start: Date,
  durationMinutes: number,
) {
  const startDateKey = getZurichDateKey(start);
  const workDaysNeeded = Math.max(
    1,
    Math.ceil(durationMinutes / SERVER_WORK_MINUTES_PER_DAY),
  );
  const horizonDateKey = addDaysToDateKey(
    startDateKey,
    workDaysNeeded + EXTRA_ROLLOVER_DAYS,
  );

  return buildZurichDate(horizonDateKey, SERVER_DAY_END);
}

export function calculateServerBookingEnd(
  start: Date,
  durationMinutes: number,
  blocks: ScheduleRange[],
) {
  let remainingMs = durationMinutes * 60_000;
  let cursor = new Date(start);
  const maxDays = Math.max(
    1,
    Math.ceil(durationMinutes / SERVER_WORK_MINUTES_PER_DAY) +
      EXTRA_ROLLOVER_DAYS,
  );

  for (let dayIndex = 0; dayIndex <= maxDays; dayIndex += 1) {
    const currentDateKey = getZurichDateKey(cursor);
    const dayStart = buildZurichDate(currentDateKey, SERVER_DAY_START);
    const dayEnd = buildZurichDate(currentDateKey, SERVER_DAY_END);

    if (cursor < dayStart) {
      cursor = new Date(dayStart);
    }

    if (cursor >= dayEnd) {
      cursor = buildZurichDate(
        addDaysToDateKey(currentDateKey, 1),
        SERVER_DAY_START,
      );
      continue;
    }

    const dayBlocks = blocks
      .filter((block) =>
        overlaps(dayStart, dayEnd, block.startTime, block.endTime),
      )
      .map((block) => ({
        startTime: clampDate(block.startTime, dayStart, dayEnd),
        endTime: clampDate(block.endTime, dayStart, dayEnd),
      }))
      .filter((block) => block.endTime > block.startTime)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    for (const block of dayBlocks) {
      if (cursor < block.startTime) {
        const availableMs = block.startTime.getTime() - cursor.getTime();

        if (availableMs >= remainingMs) {
          return new Date(cursor.getTime() + remainingMs);
        }

        remainingMs -= availableMs;
      }

      if (cursor < block.endTime) {
        cursor = new Date(block.endTime);
      }

      if (cursor >= dayEnd) break;
    }

    if (cursor < dayEnd) {
      const availableMs = dayEnd.getTime() - cursor.getTime();

      if (availableMs >= remainingMs) {
        return new Date(cursor.getTime() + remainingMs);
      }

      remainingMs -= availableMs;
    }

    cursor = buildZurichDate(
      addDaysToDateKey(currentDateKey, 1),
      SERVER_DAY_START,
    );
  }

  return null;
}
