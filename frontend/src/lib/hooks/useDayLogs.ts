import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { logsApi } from "../api/habitLogs";

export function useDayLogs(date: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.logs.day(date),
    queryFn: () => logsApi.getByDate(date),
    staleTime: 30 * 1000, // 30 seconds
    enabled: (options?.enabled ?? true) && !!date,
  });
}
