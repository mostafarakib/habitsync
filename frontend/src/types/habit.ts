export type FrequencyType = "daily" | "weekly" | "monthly";
export type EvaluationType = "boolean" | "measurable";
export type TargetType = "atLeast" | "atMost" | "lessThan" | "exactly";
export type Priority = "low" | "normal" | "high";

export interface Frequency {
  type: FrequencyType;
  daysOfWeek?: number[]; // For weekly frequency, 0 (Sunday) to 6 (Saturday)
  flexible?: boolean; // indicates if the habit is flexible (not scheduled for specific days)
  interval?: number | null;
}

export interface Reminder {
  enabled: boolean;
  time: string | null; // Format: "HH:mm"
}

export interface Habit {
  _id: string;
  user: string;

  title: string;
  description?: string;
  category?: string;

  startDate: string; // ISO format date string YYYY-MM-DD
  endDate?: string | null; // ISO format date string YYYY-MM-DD

  frequency: Frequency;

  evaluationType: EvaluationType;
  targetType: TargetType;
  targetValue: number | null;
  targetUnit?: string | null; // e.g., "times", "hours", "pages", etc.

  priority?: Priority;
  reminder: Reminder;

  color: string | null; // Hex color code for UI representation

  archived: boolean;

  createdAt: string; // ISO format date string YYYY-MM-DD
  updatedAt: string; // ISO format date string YYYY-MM-DD
}
