"use client";

import Link from "next/link";
import { Circle, CircleCheck } from "lucide-react";
import { useToggleTaskStatus } from "@/lib/hooks/useTasks";
import { isTaskOverdue, taskDueDateLabel } from "@/lib/utils/task";
import { cn } from "@/lib/utils/cn";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {
  const toggleStatus = useToggleTaskStatus();
  const overdue = isTaskOverdue(task);
  const dueLabel = taskDueDateLabel(task);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault(); // don't navigate when clicking the checkbox
    e.stopPropagation();
    toggleStatus.mutate({ id: task._id, isCompleted: !task.isCompleted });
  }

  return (
    <Link
      href={`/tasks/${task._id}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200",
        task.isCompleted
          ? "bg-neutral-900/50 border-neutral-800/50"
          : overdue
            ? "bg-red-500/5 border-red-500/20"
            : "bg-neutral-900 border-neutral-800",
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={toggleStatus.isPending}
        className={cn(
          "shrink-0 transition-colors",
          task.isCompleted
            ? "text-violet-400"
            : "text-neutral-600 hover:text-neutral-400",
        )}
        aria-label={task.isCompleted ? "Mark as pending" : "Mark as complete"}
      >
        {task.isCompleted ? (
          <CircleCheck
            size={20}
            fill="currentColor"
            className="text-violet-500"
          />
        ) : (
          <Circle size={20} />
        )}
      </button>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={cn(
              "text-sm font-medium truncate",
              task.isCompleted
                ? "text-neutral-500 line-through"
                : "text-neutral-100",
            )}
          >
            {task.title}
          </p>

          {task.category && (
            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider bg-neutral-800 text-neutral-400">
              {task.category}
            </span>
          )}

          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {task.description && (
            <p className="text-xs text-neutral-500 truncate">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Due date label */}
      {dueLabel && (
        <span
          className={cn(
            "shrink-0 text-xs font-medium",
            overdue ? "text-red-400" : "text-neutral-500",
          )}
        >
          {dueLabel}
        </span>
      )}
    </Link>
  );
}

// ── Priority badge ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-500/10 text-red-400",
    normal: "bg-blue-500/10 text-blue-400",
    low: "bg-neutral-800 text-neutral-500",
  };

  const labels: Record<string, string> = {
    high: "High",
    normal: "Normal",
    low: "Low",
  };

  return (
    <span
      className={cn(
        "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider",
        styles[priority] ?? "bg-neutral-800 text-neutral-500",
      )}
    >
      {labels[priority] ?? priority}
    </span>
  );
}
