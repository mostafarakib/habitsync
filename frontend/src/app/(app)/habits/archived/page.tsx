"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  ArchiveRestore,
  Inbox,
  Archive,
  CalendarX,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHabits, useArchiveHabit } from "@/lib/hooks/useHabits";
import { frequencyLabel, isHabitEnded } from "@/lib/utils/habit";
import { cn } from "@/lib/utils/cn";
import { fromApiDate } from "@/lib/utils/date";
import { format } from "date-fns";

export default function ArchivedHabitsPage() {
  const router = useRouter();
  const { data: allHabits = [], isLoading, error, refetch } = useHabits();
  const archiveHabit = useArchiveHabit();

  const archivedHabits = allHabits.filter((h) => h.archived);
  const endedHabits = allHabits.filter((h) => !h.archived && isHabitEnded(h));

  const isEmpty = archivedHabits.length === 0 && endedHabits.length === 0;

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
          Archived & Ended habits
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
        {!isLoading && !error && isEmpty && (
          <EmptyState
            icon={<Inbox size={20} />}
            title="No archived habits"
            description="Archived and Ended habits will appear here."
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
          <section className="mt-12 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Archive size={13} className="text-neutral-500" />
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Archived
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-500">
                {archivedHabits.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {archivedHabits.map((habit) => (
                <div
                  key={habit._id}
                  className={cn(
                    "flex items-center justify-between gap-3",
                    "rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3.5",
                  )}
                >
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

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      archiveHabit.mutate({ id: habit._id, archive: false })
                    }
                    loading={archiveHabit.isPending}
                    className="shrink-0"
                  >
                    <span className="flex items-center gap-1">
                      <ArchiveRestore size={14} />
                      Restore
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Ended habits section ── */}
        {!isLoading && !error && endedHabits.length > 0 && (
          <section className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarX size={13} className="text-neutral-500" />
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Ended
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-500">
                {endedHabits.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {endedHabits.map((habit) => (
                <div
                  key={habit._id}
                  className={cn(
                    "flex items-center justify-between gap-3",
                    "rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3.5",
                  )}
                >
                  {/* Habit info — links to detail page (view only) */}
                  <Link
                    href={`/habits/${habit._id}`}
                    className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-500 truncate">
                        {habit.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider bg-neutral-800 text-neutral-600">
                        Ended
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {frequencyLabel(habit)}
                      {habit.endDate && (
                        <span className="ml-1">
                          · Ended on{" "}
                          {format(fromApiDate(habit.endDate), "MMM d, yyyy")}
                        </span>
                      )}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
