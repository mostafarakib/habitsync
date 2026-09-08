"use client";

import { useRouter } from "next/navigation";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function NewTaskPage() {
  const router = useRouter();

  return (
    <main className="max-w-lg mx-auto w-full px-4 py-6">
      <h1 className="text-lg font-semibold text-neutral-100 mb-1">New Task</h1>
      <p className="text-xs text-neutral-500 mb-6">
        Add a one-time task to your list
      </p>

      <TaskForm onSuccess={() => router.push("/dashboard")} />
    </main>
  );
}
