"use client";

import { useMemo, useState } from "react";
import { ListTodo, ArrowUpDown } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { TaskRow } from "./TaskRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/DropdownMenu";
import { isTaskOverdue, sortTasks, TaskSortOption } from "@/lib/utils/task";
import type { Task } from "@/types";

const SORT_LABELS: Record<TaskSortOption, string> = {
  priority: "Priority",
  dueDate: "Due date",
  name: "Name",
  createdAt: "Recently added",
};

interface TaskListProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  isLoading: boolean;
  error: Error | null;
  onRefetch: () => void;
  onCreateTask: () => void;
}

export function TaskList({
  pendingTasks,
  completedTasks,
  isLoading,
  error,
  onRefetch,
  onCreateTask,
}: TaskListProps) {
  const [sortBy, setSortBy] = useState<TaskSortOption>("priority");

  const { notOverdue, overdue, completed } = useMemo(() => {
    const notOverdue: Task[] = [];
    const overdue: Task[] = [];

    pendingTasks.forEach((task) => {
      if (isTaskOverdue(task)) {
        overdue.push(task);
      } else {
        notOverdue.push(task);
      }
    });

    return {
      notOverdue: sortTasks(notOverdue, sortBy),
      overdue: sortTasks(overdue, sortBy),
      completed: sortTasks(completedTasks, "createdAt"),
    };
  }, [pendingTasks, completedTasks, sortBy]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <ErrorState
        message="Failed to load tasks."
        action={
          <Button variant="outline" size="sm" onClick={onRefetch}>
            Try again
          </Button>
        }
      />
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  const isEmpty = pendingTasks.length === 0 && completedTasks.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={<ListTodo size={20} />}
        title="No tasks yet"
        description="Create your first task to get started."
        action={
          <Button variant="primary" size="sm" onClick={onCreateTask}>
            Create task
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-28">
      {/* ── Sort control ── */}
      <div className="flex items-center justify-end">
        <DropdownMenu
          trigger={
            <button
              className="flex items-center gap-1.5 text-xs text-neutral-500
              hover:text-neutral-300 transition-colors py-1 px-2 rounded-lg
              hover:bg-neutral-800"
            >
              <ArrowUpDown size={12} />
              Sort: {SORT_LABELS[sortBy]}
            </button>
          }
          align="end"
        >
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {(Object.keys(SORT_LABELS) as TaskSortOption[]).map((option) => (
            <DropdownMenuItem key={option} onClick={() => setSortBy(option)}>
              <span className={sortBy === option ? "text-violet-400" : ""}>
                {SORT_LABELS[option]}
              </span>
              {sortBy === option && (
                <span className="ml-auto text-violet-400 text-xs">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      </div>

      {/* Overdue — shown first, red accent */}
      {overdue.length > 0 && (
        <Accordion title="Overdue" count={overdue.length} defaultOpen={true}>
          {overdue.map((task) => (
            <TaskRow key={task._id} task={task} />
          ))}
        </Accordion>
      )}

      {/* Pending */}
      {notOverdue.length > 0 && (
        <Accordion title="Pending" count={notOverdue.length} defaultOpen={true}>
          {notOverdue.map((task) => (
            <TaskRow key={task._id} task={task} />
          ))}
        </Accordion>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <Accordion
          title="Completed"
          count={completed.length}
          defaultOpen={false}
        >
          {completed.map((task) => (
            <TaskRow key={task._id} task={task} />
          ))}
        </Accordion>
      )}
    </div>
  );
}
