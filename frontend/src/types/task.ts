export type TaskPriority = "low" | "normal" | "high";

export interface Task {
  _id: string;
  user: string;
  title: string;
  description?: string | null;
  category?: string;
  dueDate?: string | null; // ISO format date string YYYY-MM-DD
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
}

export interface ToggleTaskPayload {
  isCompleted: boolean;
}
