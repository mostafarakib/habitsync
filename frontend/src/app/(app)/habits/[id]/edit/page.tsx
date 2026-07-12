"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { HabitForm } from "@/components/habits/HabitForm";
import { useHabit } from "@/lib/hooks/useHabits";
import Link from "next/link";

interface HabitEditPageProps {
  params: Promise<{ id: string }>;
}

export default function HabitEditPage({ params }: HabitEditPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: habit, isLoading, error, refetch } = useHabit(id);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/habits/${id}`);
    }
  }

  function handleSuccess() {
    router.push(`/habits/${id}`);
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
  if (error || !habit) {
    return (
      <div className="min-h-dvh bg-neutral-950 flex items-center justify-center">
        <ErrorState
          title="Habit not found"
          message="This habit may have been deleted or doesn't exist."
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
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </Button>

          {/* Logo — links to dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Flame size={16} className="text-violet-500" />
            <span className="text-sm font-semibold tracking-tight text-neutral-100">
              HabitSync
            </span>
          </Link>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <h1 className="text-base font-semibold text-neutral-100">
            Edit Habit
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-62.5">
            {habit.title}
          </p>
        </div>
      </header>

      {/* ── Form ── */}
      <main className="max-w-lg mx-auto w-full px-4 py-6">
        <HabitForm habit={habit} onSuccess={handleSuccess} />
      </main>
    </div>
  );
}
