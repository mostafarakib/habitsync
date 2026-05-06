import { CreateHabitPayload, Habit } from "@/types";
import { apiFetch } from "./client";

export const habitsApi = {
  getAll: () => apiFetch<Habit[]>("/habits"),

  getById: (id: string) => apiFetch<Habit>(`/habits/${id}`),

  create: (data: CreateHabitPayload) =>
    apiFetch<Habit>("/habits", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateHabitPayload>) =>
    apiFetch<Habit>(`/habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  archive: (id: string) =>
    apiFetch<Habit>(`/habits/${id}/archive`, {
      method: "PATCH",
    }),

  unarchive: (id: string) =>
    apiFetch<Habit>(`/habits/${id}/unarchive`, {
      method: "PATCH",
    }),
};
