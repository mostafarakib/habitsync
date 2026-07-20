import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { habitsApi } from "../api/habits";
import { toast } from "sonner";
import { getErrorMessage } from "../errors/errorUtils";
import { CreateHabitPayload } from "@/types";

export function useHabits() {
  return useQuery({
    queryKey: queryKeys.habits.all,
    queryFn: habitsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes - habits don't change often, so we can cache them longer
  });
}

// fetch single habit by id
export function useHabit(id: string) {
  return useQuery({
    queryKey: queryKeys.habits.detail(id),
    queryFn: () => habitsApi.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only fetch if id is provided
  });
}

// create habit
export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: habitsApi.create,

    onSuccess: () => {
      // invalidate the habits list to refetch the updated list after creating a new habit
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      // Also invalidate day logs since creating a new habit may affect the logs list
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      toast.success("Habit created successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// update habit
export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateHabitPayload>;
    }) => habitsApi.update(id, data),

    onSuccess: (updatedHabit, { id }) => {
      queryClient.setQueryData(queryKeys.habits.detail(id), updatedHabit);
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      toast.success("Habit updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// archive/unarchive habits
export function useArchiveHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      archive ? habitsApi.archive(id) : habitsApi.unarchive(id),

    onSuccess: (_, { id, archive }) => {
      // refresh habit list
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      // refresh habit detail if it's open
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.detail(id) });
      // refresh logs since archiving/unarchiving a habit may affect the logs list
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      // refresh streaks since archiving/unarchiving a habit may affect the streaks list
      queryClient.invalidateQueries({ queryKey: ["streaks"] });

      toast.success(
        archive
          ? "Habit archived successfully"
          : "Habit unarchived successfully",
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),

    onSuccess: (_, id) => {
      // remove habit from cache immediately
      queryClient.removeQueries({ queryKey: queryKeys.habits.detail(id) });
      // invalidate habits lists and logs
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      toast.success("Habit deleted successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
