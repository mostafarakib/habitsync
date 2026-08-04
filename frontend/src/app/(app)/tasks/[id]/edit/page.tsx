"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTask } from "@/lib/hooks/useTasks";

interface TaskEditPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskEditPage({ params }: TaskEditPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: task, isLoading, error, refetch } = useTask(id);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/tasks/${id}`);
    }
  }

  function handleSuccess() {
    router.push(`/tasks/${id}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-neutral-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

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

  return (
    <div className="min-h-dvh bg-neutral-950">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </Button>

        <div>
          <h1 className="text-base font-semibold text-neutral-100">
            Edit Task
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-62.5">
            {task.title}
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto w-full px-4 py-6">
        <TaskForm task={task} onSuccess={handleSuccess} />
      </main>
    </div>
  );
}
