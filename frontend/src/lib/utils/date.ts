import { addDays, format, isAfter, isBefore, subDays } from "date-fns";

// Returns today's date as UTC midnight based on LOCAL calendar date
// e.g. if local date is July 14, returns 2026-07-14T00:00:00.000Z
export function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getFullYear(), // local year
      now.getMonth(), // local month
      now.getDate(), // local day
    ),
  );
}

// Returns today's date as a string in YYYY-MM-DD format based on LOCAL calendar date
export function toLocalDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Normalize a date to UTC midnight
export function normalizeUtcDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

// Converts Date -> "YYYY-MM-DD" in UTC
export function toApiDate(date: Date): string {
  return normalizeUtcDate(date).toISOString().split("T")[0];
}

//Parses an API date string  -> Date
export function fromApiDate(dateStr: string): Date {
  // Handle both "YYYY-MM-DD" and full ISO "YYYY-MM-DDTHH:mm:ss.sssZ"
  const datePart = dateStr.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// "Today" check using UTC
export function isTodayUtc(date: Date): boolean {
  const today = todayUtc();
  const target = normalizeUtcDate(date);

  return today.getTime() === target.getTime();
}

// "Monday, May 7"
export function toDisplayDate(date: Date): string {
  if (isTodayUtc(date)) return "Today";

  return format(date, "EEEE, MMM d");
}

// "May 7"
export function toShortDate(date: Date): string {
  return format(date, "MMM d");
}

// ------- Validation --------
// Rules: not in the future, not older than 30 days
export function isEditable(date: Date): boolean {
  const today = todayUtc();
  const target = normalizeUtcDate(date);

  if (isAfter(target, today)) {
    return false;
  }

  const thirtyDaysAgo = subDays(today, 30);

  return !isBefore(target, thirtyDaysAgo);
}

export function isFutureDate(date: Date): boolean {
  const today = todayUtc();
  const target = normalizeUtcDate(date);

  return isAfter(target, today);
}

// helpers

export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

// UTC helpers

export function getUtcDay(date: Date): number {
  return date.getUTCDay();
}

export function getUtcDate(date: Date): number {
  return date.getUTCDate();
}
