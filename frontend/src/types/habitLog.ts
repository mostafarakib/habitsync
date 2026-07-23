import type { Habit } from "./habit";

export interface HabitLog {
  _id: string;
  user: string;
  habit: string; // habit ID;

  date: string; // ISO format date string YYYY-MM-DD

  value: number;
  isCompleted: boolean;

  notes: string | null;

  createdAt: string; // ISO format date string YYYY-MM-DD
  updatedAt: string; // ISO format date string YYYY-MM-DD
}

export interface DayEntry {
  habit: Habit;
  log: HabitLog | null;
  periodCompleted: boolean;
}

export interface DateRangeEntry {
  date: string; // ISO format date string YYYY-MM-DD
  entries: DayEntry[];
}

export interface StreakData {
  habitId: string;
  streak: number;
}
