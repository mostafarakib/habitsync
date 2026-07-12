"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame, ArchiveRestore, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHabits, useArchiveHabit } from "@/lib/hooks/useHabits";
import { frequencyLabel } from "@/lib/utils/habit";
import { cn } from "@/lib/utils/cn";

export default function ArchivedHabitsPage() {
  const router = useRouter();
  const { data: allHabits = [], isLoading, error, refetch } = useHabits();
  const archiveHabit = useArchiveHabit();

  const archivedHabits = allHabits.filter((h) => h.archived);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }

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
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Flame size={16} className="text-violet-500" />
            <span className="text-sm font-semibold tracking-tight text-neutral-100">
              HabitSync
            </span>
          </Link>
        </div>

        <h2 className="text-sm font-medium text-neutral-400">
          Archived habits
        </h2>
      </header>

      <main className="max-w-lg mx-auto w-full px-4 py-6">
        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size="md" />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <ErrorState
            message="Failed to load archived habits."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {/* ── Empty ── */}
        {!isLoading && !error && archivedHabits.length === 0 && (
          <EmptyState
            icon={<Inbox size={20} />}
            title="No archived habits"
            description="Habits you archive will appear here."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                Back to dashboard
              </Button>
            }
          />
        )}

        {/* ── Archived habit list ── */}
        {!isLoading && !error && archivedHabits.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-neutral-600 mb-2">
              {archivedHabits.length}{" "}
              {archivedHabits.length === 1 ? "habit" : "habits"} archived
            </p>

            {archivedHabits.map((habit) => (
              <div
                key={habit._id}
                className={cn(
                  "flex items-center justify-between gap-3",
                  "rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3.5",
                )}
              >
                {/* Habit info — links to detail page */}
                <Link
                  href={`/habits/${habit._id}`}
                  className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <p className="text-sm font-medium text-neutral-400 truncate">
                    {habit.title}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {frequencyLabel(habit)}
                    {habit.category ? ` · ${habit.category}` : ""}
                  </p>
                </Link>

                {/* Unarchive button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    archiveHabit.mutate({ id: habit._id, archive: false })
                  }
                  loading={archiveHabit.isPending}
                  className="shrink-0 inline-flex items-center gap-1"
                >
                  <span className="flex items-center gap-1">
                    <ArchiveRestore size={14} />
                    Restore
                  </span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
