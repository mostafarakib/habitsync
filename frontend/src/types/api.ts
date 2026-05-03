import type { Frequency, Reminder } from "./habit";

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
}
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
}

export interface CreateHabitPayload {
  title: string;
  description?: string;
  category?: string;

  startDate: string; // ISO format date string YYYY-MM-DD
  endDate?: string | null; // ISO format date string YYYY-MM-DD

  frequency: Frequency;

  evaluationType: "boolean" | "measurable";
  targetType?: "atLeast" | "atMost" | "lessThan" | "exactly";
  targetValue?: number | null;
  targetUnit?: string | null; // e.g., "times", "hours", "pages", etc.

  priority?: "low" | "normal" | "high";

  reminder?: Reminder;
  color?: string | null; // Hex color code for UI representation
}

export interface UpsertLogPayload {
  habitId: string;
  date: string; // ISO format date string YYYY-MM-DD
  value: number;
  notes?: string | null;
}

export interface HabitLogValueUpdatePayload {
  value: number | boolean; // Depending on the habit's evaluationType
}

export interface HabitLogNotesUpdatePayload {
  notes: string | null;
}
