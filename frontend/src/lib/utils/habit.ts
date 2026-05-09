import type { Habit } from "@/types";
import { parseISO } from "date-fns";
import { getUtcDate, getUtcDay } from "./date";

export function isScheduledOnDate(habit: Habit, date: Date): boolean {
  const { type, daysOfWeek } = habit.frequency;

  // daily habits are always scheduled
  if (type === "daily") return true;

  if (type === "weekly") {
    // if no specific days are set then it is scheduled on everyday
    if (!daysOfWeek || daysOfWeek.length === 0) return true;

    return daysOfWeek.includes(getUtcDay(date));
  }

  // Scheduled on the same day-of-month as the habit startDate
  if (type === "monthly") {
    const scheduledDay = getUtcDate(parseISO(habit.startDate));

    return getUtcDate(date) === scheduledDay;
  }

  return false;
}

// readable frequency label for UI
export function frequencyLabel(habit: Habit): string {
  const { type, daysOfWeek } = habit.frequency;

  if (type === "daily") return "Daily";

  if (type === "weekly") {
    if (!daysOfWeek || daysOfWeek.length === 0) return "Weekly";

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return daysOfWeek.map((d) => dayNames[d]).join(", ");
  }

  if (type === "monthly") {
    const day = getUtcDate(parseISO(habit.startDate));

    return `Monthly (${day}${ordinalSuffix(day)})`;
  }

  return type;
}

// is a boolean habit marked done?
export function isBooleanDone(value: number | null | undefined): boolean {
  return value === 1;
}

// completion perchantage for measurable habits
export function completionPercent(
  value: number | null | undefined,
  target: number | null | undefined,
): number {
  if (target == null || value == null) return 0;

  return Math.min(100, Math.round((value / target) * 100));
}

// internal helpers
function ordinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
