import { apiFetch } from "./client";
import type {
  CreateTaskPayload,
  Task,
  ToggleTaskPayload,
  UpdateTaskPayload,
} from "@/types";

export const taskApi = {
  getAll: (completed?: boolean) => {
    const query = completed !== undefined ? `?completed=${completed}` : "";
    return apiFetch<Task[]>(`/tasks${query}`);
  },

  getById: (id: string) => apiFetch<Task>(`/tasks/${id}`),

  create: (data: CreateTaskPayload) =>
    apiFetch<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTaskPayload) =>
    apiFetch<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  toggleStatus: (id: string, data: ToggleTaskPayload) =>
    apiFetch<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ deleted: boolean; taskId: string }>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};
