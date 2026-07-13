import { normalizeUtcDate, toApiDate } from "@/lib/utils/date";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { logsApi } from "@/lib/api/habitLogs";

export function useHabitLogs(habitId: string) {
  const today = normalizeUtcDate(new Date());
  const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

  const startDate = toApiDate(thirtyDaysAgo);
  const endDate = toApiDate(today);

  return useQuery({
    queryKey: queryKeys.logs.habit(habitId),
    queryFn: () => logsApi.getAllByHabit(habitId, { startDate, endDate }),
    enabled: !!habitId,
    staleTime: 60 * 1000, // 1 minute
  });
}
