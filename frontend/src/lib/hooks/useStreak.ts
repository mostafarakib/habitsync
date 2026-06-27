import { useQuery } from "@tanstack/react-query";
import { logsApi } from "@/lib/api/habitLogs";
import { queryKeys } from "@/lib/queryKeys";

export function useStreak(habitId: string) {
  return useQuery({
    queryKey: queryKeys.streaks.detail(habitId),
    queryFn: () => logsApi.getStreak(habitId),
    enabled: Boolean(habitId),
    staleTime: 60 * 1000, // 1 minute
  });
}
