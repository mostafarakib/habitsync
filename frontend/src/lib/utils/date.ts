import {
  addDays,
  format,
  getDate,
  getDay,
  isAfter,
  isBefore,
  isToday,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

// ----- Formatting --------
// Converts a Date to the API-expected format: "YYYY-MM-DD"
export function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

//Parses an API date string back to a Date object
export function fromApiDate(dateStr: string): Date {
  return parseISO(dateStr);
}

// "Monday, May 7" — used in DateNavigator header
export function toDisplayDate(date: Date): string {
  if (isToday(date)) return "Today";
  return format(date, "EEEE, MMM d");
}

// "May 7" — used in compact date chips
export function toShortDate(date: Date): string {
  return format(date, "MMM d");
}

// ------- Validation --------
// Rules: not in the future, not older than 30 days
export function isEditable(date: Date): boolean {
  const today = startOfDay(new Date());
  const target = startOfDay(date);

  if (isAfter(target, today)) {
    return false;
  }

  const thirtyDaysAgo = subDays(today, 30);
  return !isBefore(target, thirtyDaysAgo);
}

export function isFutureDate(date: Date): boolean {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return isAfter(target, today);
}

// helpers

export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

// Re-exports (so nothing else imports from date-fns directly)

export { isToday, getDay, getDate };
