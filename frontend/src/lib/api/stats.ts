import { apiFetch } from "./client";
import type {
  StatsSummary,
  HabitPerformance,
  HeatmapDay,
  TrendPeriod,
} from "@/types";

export const statsApi = {
  getSummary: () => apiFetch<StatsSummary>("/stats/summary"),

  getHabitPerformance: (period: TrendPeriod = 30) =>
    apiFetch<HabitPerformance[]>(`/stats/habit-performance?period=${period}`),

  getHeatmap: (startDate: string, endDate: string) =>
    apiFetch<HeatmapDay[]>(
      `/stats/heatmap?startDate=${startDate}&endDate=${endDate}`,
    ),

  getOverallStreak: () => apiFetch<{ streak: number }>("/stats/streak"),
};
