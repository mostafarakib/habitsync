import { taskApi } from "@/lib/api/tasks";
import { queryKeys } from "@/lib/queryKeys";
import type { CreateTaskPayload, UpdateTaskPayload } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors/errorUtils";

export function useTasks(completed?: boolean) {
  return useQuery({
    queryKey: queryKeys.tasks.all(completed),
    queryFn: () => taskApi.getAll(completed),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => taskApi.getById(id),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskPayload) => taskApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
      taskApi.update(id, data),

    onSuccess: (updatedTask, { id }) => {
      queryClient.setQueryData(queryKeys.tasks.detail(id), updatedTask);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useToggleTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      taskApi.toggleStatus(id, { isCompleted }),

    // Optimistic update — toggle feels instant
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot both possible cache entries for rollback
      const previousAll = queryClient.getQueryData(queryKeys.tasks.all());
      const previousPending = queryClient.getQueryData(
        queryKeys.tasks.all(false),
      );
      const previousCompleted = queryClient.getQueryData(
        queryKeys.tasks.all(true),
      );
      const previousDetail = queryClient.getQueryData(
        queryKeys.tasks.detail(id),
      );

      // Optimistically update the detail cache if it exists
      queryClient.setQueryData(queryKeys.tasks.detail(id), (old: unknown) =>
        old
          ? {
              ...old,
              isCompleted,
              completedAt: isCompleted ? new Date().toISOString() : null,
            }
          : old,
      );

      return {
        previousAll,
        previousPending,
        previousCompleted,
        previousDetail,
        id,
      };
    },

    onError: (error, { id }, context) => {
      if (context?.previousAll !== undefined) {
        queryClient.setQueryData(queryKeys.tasks.all(), context.previousAll);
      }
      if (context?.previousPending !== undefined) {
        queryClient.setQueryData(
          queryKeys.tasks.all(false),
          context.previousPending,
        );
      }
      if (context?.previousCompleted !== undefined) {
        queryClient.setQueryData(
          queryKeys.tasks.all(true),
          context.previousCompleted,
        );
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(
          queryKeys.tasks.detail(id),
          context.previousDetail,
        );
      }
      toast.error(getErrorMessage(error));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
