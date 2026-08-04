"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function NewTaskPage() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
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

        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Flame size={16} className="text-violet-500" />
          <span className="text-sm font-semibold tracking-tight text-neutral-100">
            HabitSync
          </span>
        </Link>
      </header>

      <main className="max-w-lg mx-auto w-full px-4 py-6">
        <h1 className="text-lg font-semibold text-neutral-100 mb-1">
          New Task
        </h1>
        <p className="text-xs text-neutral-500 mb-6">
          Add a one-time task to your list
        </p>

        <TaskForm onSuccess={() => router.push("/dashboard")} />
      </main>
    </div>
  );
}
