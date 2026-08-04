"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Flame,
  Tag,
  Calendar,
  CircleCheck,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  useTask,
  useToggleTaskStatus,
  useDeleteTask,
} from "@/lib/hooks/useTasks";
import { isTaskOverdue, taskDueDateLabel } from "@/lib/utils/task";
import { cn } from "@/lib/utils/cn";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: task, isLoading, error, refetch } = useTask(id);
  const toggleStatus = useToggleTaskStatus();
  const deleteTask = useDeleteTask();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }

  function handleToggle() {
    if (!task) return;
    toggleStatus.mutate({ id: task._id, isCompleted: !task.isCompleted });
  }

  function handleDelete() {
    if (!task) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTask.mutate(task._id, {
      onSuccess: () => router.push("/dashboard"),
    });
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-neutral-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !task) {
    return (
      <div className="min-h-dvh bg-neutral-950 flex items-center justify-center">
        <ErrorState
          title="Task not found"
          message="This task may have been deleted or doesn't exist."
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const overdue = isTaskOverdue(task);
  const dueLabel = taskDueDateLabel(task);

  return (
    <div className="min-h-dvh bg-neutral-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </Button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Flame size={16} className="text-violet-500" />
            <span className="text-sm font-semibold tracking-tight text-neutral-100">
              HabitSync
            </span>
          </Link>
        </div>

        <Link href={`/tasks/${task._id}/edit`}>
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            aria-label="Edit task"
          >
            <Pencil size={15} />
          </Button>
        </Link>
      </header>

      <main className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* ── Task info ── */}
        <section className="flex flex-col gap-3">
          <h1
            className={cn(
              "text-lg font-semibold",
              task.isCompleted
                ? "text-neutral-500 line-through"
                : "text-neutral-100",
            )}
          >
            {task.title}
          </h1>

          {task.description && (
            <p className="text-sm text-neutral-400">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {task.category && (
              <InfoChip icon={<Tag size={11} />} label={task.category} />
            )}
            <PriorityChip priority={task.priority} />
            {dueLabel && (
              <InfoChip
                icon={<Calendar size={11} />}
                label={dueLabel}
                variant={overdue ? "danger" : "default"}
              />
            )}
          </div>
        </section>

        {/* ── Status card ── */}
        <section
          className={cn(
            "rounded-xl border px-5 py-4 flex items-center justify-between",
            task.isCompleted
              ? "bg-violet-500/5 border-violet-500/20"
              : overdue
                ? "bg-red-500/5 border-red-500/20"
                : "bg-neutral-900 border-neutral-800",
          )}
        >
          <div>
            <p className="text-xs text-neutral-500 mb-1">Status</p>
            <p
              className={cn(
                "text-base font-semibold",
                task.isCompleted ? "text-violet-400" : "text-neutral-100",
              )}
            >
              {task.isCompleted ? "Completed" : "Pending"}
            </p>
          </div>

          <Button
            variant={task.isCompleted ? "outline" : "primary"}
            size="md"
            onClick={handleToggle}
            loading={toggleStatus.isPending}
            className="cursor-pointer"
          >
            <span className="flex items-center gap-1">
              {task.isCompleted ? (
                <>
                  <Circle size={15} />
                  Mark pending
                </>
              ) : (
                <>
                  <CircleCheck size={15} />
                  Mark complete
                </>
              )}
            </span>
          </Button>
        </section>

        {/* ── Delete ── */}
        <section className="pt-2">
          <Button
            variant="danger"
            size="md"
            onClick={handleDelete}
            loading={deleteTask.isPending}
            className="w-full cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <Trash2 size={15} />
              {confirmDelete ? "Tap again to confirm delete" : "Delete task"}
            </span>
          </Button>

          {confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors text-center w-full mt-2"
            >
              Cancel
            </button>
          )}
        </section>
      </main>
    </div>
  );
}

// ── Info chip ─────────────────────────────────────────────────────────────────

function InfoChip({
  icon,
  label,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
        variant === "danger"
          ? "bg-red-500/10 border-red-500/20"
          : "bg-neutral-800 border-neutral-700",
      )}
    >
      <span
        className={variant === "danger" ? "text-red-400" : "text-neutral-500"}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-xs",
          variant === "danger" ? "text-red-400" : "text-neutral-300",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function PriorityChip({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-500/10 text-red-400 border-red-500/20",
    normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    low: "bg-neutral-800 text-neutral-500 border-neutral-700",
  };

  const labels: Record<string, string> = {
    high: "High priority",
    normal: "Normal priority",
    low: "Low priority",
  };

  return (
    <span
      className={cn(
        "text-xs px-2.5 py-1 rounded-full border",
        styles[priority] ?? styles.normal,
      )}
    >
      {labels[priority] ?? priority}
    </span>
  );
}
