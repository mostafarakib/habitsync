import { addDays, format, isAfter, isBefore, subDays } from "date-fns";

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
  // Parse as UTC midnight explicitly to avoid local timezone shift
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// "Today" check using UTC
export function isTodayUtc(date: Date): boolean {
  const today = normalizeUtcDate(new Date());
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
  const today = normalizeUtcDate(new Date());
  const target = normalizeUtcDate(date);

  if (isAfter(target, today)) {
    return false;
  }

  const thirtyDaysAgo = subDays(today, 30);

  return !isBefore(target, thirtyDaysAgo);
}

export function isFutureDate(date: Date): boolean {
  const today = normalizeUtcDate(new Date());
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
