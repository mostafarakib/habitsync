import {
  DateRangeEntry,
  DayEntry,
  HabitLog,
  StreakData,
  UpsertLogPayload,
} from "@/types";
import { apiFetch } from "./client";

export const logsApi = {
  // upsert operations
  upsert: (data: UpsertLogPayload) =>
    apiFetch<HabitLog>("/habit-logs", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  bulkUpsert: (data: UpsertLogPayload[]) =>
    apiFetch<HabitLog>("/habit-logs/bulk", {
      method: "PUT",
      body: JSON.stringify({ logs: data }),
    }),

  // reads operations
  getByDate: (date: string) => apiFetch<DayEntry[]>(`/habit-logs/date/${date}`),

  getByDateRange: (startDate: string, endDate: string) =>
    apiFetch<DateRangeEntry[]>(
      `/habit-logs/date-range?startDate=${startDate}&endDate=${endDate}`,
    ),

  getAllByHabit: (
    habitId: string,
    params?: { startDate?: string; endDate?: string },
  ) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    const qs = query.toString();

    return apiFetch<HabitLog[]>(
      `/habit-logs/habit/${habitId}${qs ? `?${qs}` : ""}`,
    );
  },

  getById: (habitLogId: string) =>
    apiFetch<HabitLog>(`/habit-logs/${habitLogId}`),

  getStreak: (habitId: string) =>
    apiFetch<StreakData>(`/habit-logs/streak/${habitId}`),

  // update operations
  updateValue: (habitLogId: string, value: number | boolean) =>
    apiFetch<HabitLog>(`/habit-logs/${habitLogId}/value`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),

  updateNotes: (habitLogId: string, notes: string | null) =>
    apiFetch<HabitLog>(`/habit-logs/${habitLogId}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }),

  // delete operations
  delete: (habitLogId: string) =>
    apiFetch<{ deleted: boolean; habitLogId: string }>(
      `/habit-logs/${habitLogId}`,
      {
        method: "DELETE",
      },
    ),
};
