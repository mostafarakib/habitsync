import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { logsApi } from "@/lib/api/habitLogs";
import type { DayEntry } from "@/types";
import { getErrorMessage } from "@/lib/errors/errorUtils";
import { toast } from "sonner";

interface LogValueArgs {
  habitId: string;
  logId: string | null;
  date: string;
  value: number;
}

export function useLogValueMutation(date: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.logs.day(date);

  return useMutation({
    mutationFn: ({ habitId, logId, date, value }: LogValueArgs) => {
      if (logId === null) {
        return logsApi.upsert({ habitId, date, value });
      }
      return logsApi.updateValue(logId, value);
    },

    onMutate: async ({ habitId, value }) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<DayEntry[]>(queryKey);

      queryClient.setQueryData<DayEntry[]>(queryKey, (old = []) =>
        old.map((entry) => {
          if (entry.habit._id !== habitId || !entry.log) return entry;

          return {
            ...entry,
            log: {
              ...entry.log,
              value,
            },
          };
        }),
      );

      return { previous };
    },

    onSuccess: (newLog, { habitId }) => {
      queryClient.setQueryData<DayEntry[]>(queryKey, (old = []) =>
        old.map((entry) => {
          if (entry.habit._id !== habitId) return entry;

          const updatedLog = newLog;
          const { type, flexible } = entry.habit.frequency;

          // Update periodCompleted optimistically for flexible/monthly
          let periodCompleted = entry.periodCompleted;
          if ((type === "weekly" && flexible) || type === "monthly") {
            // If this log is now completed, period is completed
            // If uncompleted, we can't know without refetching — let onSettled handle it
            if (updatedLog.isCompleted) {
              periodCompleted = true;
            }
          } else {
            periodCompleted = updatedLog.isCompleted;
          }

          return { ...entry, log: updatedLog, periodCompleted };
        }),
      );

      queryClient.invalidateQueries({
        queryKey: queryKeys.streaks.detail(habitId),
      });
    },

    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(getErrorMessage(error));
    },

    // Refetch to guarantee server consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// --------- notes mutation ---------
interface LogNotesArgs {
  habitId: string;
  logId: string;
  notes: string | null;
}

export function useLogNotesMutation(date: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.logs.day(date);

  return useMutation({
    mutationFn: ({ logId, notes }: LogNotesArgs) => {
      return logsApi.updateNotes(logId, notes);
    },

    onMutate: async ({ habitId, notes }) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<DayEntry[]>(queryKey);

      queryClient.setQueryData<DayEntry[]>(queryKey, (old = []) =>
        old.map((entry) =>
          entry.habit._id === habitId && entry.log
            ? { ...entry, log: { ...entry.log, notes } }
            : entry,
        ),
      );

      return { previous };
    },

    onSuccess: (updatedLog, { habitId }) => {
      queryClient.setQueryData<DayEntry[]>(queryKey, (old = []) =>
        old.map((entry) =>
          entry.habit._id === habitId ? { ...entry, log: updatedLog } : entry,
        ),
      );
    },

    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(getErrorMessage(error));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
