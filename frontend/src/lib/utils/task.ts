import { fromApiDate, todayUtc } from "@/lib/utils/date";
import type { Task } from "@/types";

export type TaskSortOption = "priority" | "dueDate" | "name" | "createdAt";

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

export function isTaskOverdue(task: Task): boolean {
  if (task.isCompleted) return false;
  if (!task.dueDate) return false;

  const due = fromApiDate(task.dueDate);
  const today = todayUtc();

  return due < today;
}

export function sortTasks(tasks: Task[], sortBy: TaskSortOption): Task[] {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "priority": {
        const pa = PRIORITY_ORDER[a.priority] ?? 1;
        const pb = PRIORITY_ORDER[b.priority] ?? 1;
        return pa - pb;
      }

      case "dueDate": {
        // Tasks without a due date go to the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (
          fromApiDate(a.dueDate).getTime() - fromApiDate(b.dueDate).getTime()
        );
      }

      case "name": {
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      }

      case "createdAt": {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      default:
        return 0;
    }
  });
}

export function taskDueDateLabel(task: Task): string | null {
  if (!task.dueDate) return null;

  const due = fromApiDate(task.dueDate);
  const today = todayUtc();
  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === -1) return "1 day overdue";
  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays > 1 && diffDays <= 7) return `Due in ${diffDays} days`;

  return `Due ${due.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })}`;
}
