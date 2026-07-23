import type { Habit, HabitLog, DayEntry } from "@/types";
import { parseISO } from "date-fns";
import { getUtcDate, getUtcDay } from "./date";

export function isScheduledOnDate(habit: Habit, date: Date): boolean {
  const { type, daysOfWeek, flexible } = habit.frequency;

  if (type === "daily") return true;

  if (type === "weekly") {
    // flexible weekly → appears every day like daily
    if (flexible) return true;
    // scheduled weekly → only on selected days
    if (!daysOfWeek || daysOfWeek.length === 0) return false;
    return daysOfWeek.includes(getUtcDay(date));
  }

  // monthly → appears every day (flexible by default)
  if (type === "monthly") return true;
  return false;
}

// Determines if a habit affects the main streak calculation
// Only daily and scheduled weekly habits count toward streak
export function isStreakRelevant(habit: Habit): boolean {
  const { type, flexible } = habit.frequency;

  if (type === "daily") return true;
  if (type === "weekly") return !flexible;
  if (type === "monthly") return false;

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

export function isHabitCompleted(
  habit: Habit,
  log: HabitLog | null,
  periodCompleted?: boolean,
): boolean {
  // For flexible weekly and monthly — use period completion
  if (periodCompleted !== undefined) {
    const { type, flexible } = habit.frequency;
    if ((type === "weekly" && flexible) || type === "monthly") {
      return periodCompleted;
    }
  }

  if (!log) return false;

  if (habit.evaluationType === "boolean") {
    return isBooleanDone(log.value);
  }

  if (habit.targetValue === null) return log.value > 0;

  switch (habit.targetType) {
    case "atLeast":
      return log.value >= habit.targetValue;
    case "atMost":
      return log.value <= habit.targetValue;
    case "lessThan":
      return log.value < habit.targetValue;
    case "exactly":
      return log.value === habit.targetValue;
    default:
      return false;
  }
}

export type SortOption = "priority" | "startDate" | "name" | "status";

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

export function sortEntries(
  entries: DayEntry[],
  sortBy: SortOption,
): DayEntry[] {
  return [...entries].sort((a, b) => {
    switch (sortBy) {
      case "priority": {
        const pa = PRIORITY_ORDER[a.habit.priority ?? "normal"];
        const pb = PRIORITY_ORDER[b.habit.priority ?? "normal"];
        return pa - pb;
      }

      case "startDate": {
        const da = new Date(a.habit.startDate).getTime();
        const db = new Date(b.habit.startDate).getTime();
        return db - da; // newest first
      }

      case "name": {
        return a.habit.title
          .toLowerCase()
          .localeCompare(b.habit.title.toLowerCase());
      }

      case "status": {
        // not completed → completed (undone habits surface first)
        const ac = a.log?.isCompleted ? 1 : 0;
        const bc = b.log?.isCompleted ? 1 : 0;
        return ac - bc;
      }

      default:
        return 0;
    }
  });
}
