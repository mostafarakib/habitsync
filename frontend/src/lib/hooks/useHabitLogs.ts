import { normalizeUtcDate, toApiDate } from "@/lib/utils/date";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { logsApi } from "@/lib/api/habitLogs";

export function useHabitLogs(habitId: string) {
  const today = normalizeUtcDate(new Date());
  // Start from the first day of the month 4 months ago
  const fourMonthsAgo = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() - 3, // 3 months back = 4 months total including current
      1, // first day of that month
    ),
  );

  const startDate = toApiDate(fourMonthsAgo);
  const endDate = toApiDate(today);

  return useQuery({
    queryKey: queryKeys.logs.habit(habitId),
    queryFn: () => logsApi.getAllByHabit(habitId, { startDate, endDate }),
    enabled: !!habitId,
    staleTime: 60 * 1000, // 1 minute
  });
}
