import { normalizeUtcDate, toApiDate } from "@/lib/utils/date";
import { subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { logsApi } from "@/lib/api/habitLogs";

export function useHabitLogs(habitId: string) {
  const today = normalizeUtcDate(new Date());
  const thirtyDaysAgo = subDays(today, 29);

  const startDate = toApiDate(thirtyDaysAgo);
  const endDate = toApiDate(today);

  return useQuery({
    queryKey: queryKeys.logs.habit(habitId),
    queryFn: () => logsApi.getAllByHabit(habitId, { startDate, endDate }),
    enabled: !!habitId,
    staleTime: 60 * 1000, // 1 minute
  });
}
