import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { logsApi } from "../api/habitLogs";

export function useDayLogs(date: string) {
  return useQuery({
    queryKey: queryKeys.logs.day(date),
    queryFn: () => logsApi.getByDate(date),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!date, // Only fetch if date is provided
  });
}
