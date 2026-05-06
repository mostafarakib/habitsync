import type { Frequency, Reminder } from "./habit";

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string | null; // cloudinary URL
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  avatar?: File | null; // sends file to upload to cloudinary
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
