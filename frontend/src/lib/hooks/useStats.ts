import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api/stats";
import { queryKeys } from "@/lib/queryKeys";
import type { TrendPeriod } from "@/types";

export function useStatsSummary() {
  return useQuery({
    queryKey: queryKeys.stats.summary,
    queryFn: statsApi.getSummary,
    staleTime: 60 * 1000,
  });
}

export function useHabitPerformance(period: TrendPeriod = 30) {
  return useQuery({
    queryKey: queryKeys.stats.habitPerformance(period),
    queryFn: () => statsApi.getHabitPerformance(period),
    staleTime: 60 * 1000,
  });
}

export function useHeatmap(startDate: string, endDate: string) {
  return useQuery({
    queryKey: queryKeys.stats.heatmap(startDate, endDate),
    queryFn: () => statsApi.getHeatmap(startDate, endDate),
    staleTime: 60 * 1000,
    enabled: !!startDate && !!endDate,
  });
}

export function useHabitHeatmap(
  habitId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: queryKeys.stats.habitHeatmap(habitId, startDate, endDate),
    queryFn: () => statsApi.getHabitHeatmap(habitId, startDate, endDate),
    staleTime: 60 * 1000,
    enabled: !!habitId && !!startDate && !!endDate,
  });
}
