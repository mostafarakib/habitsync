"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Archive,
  ArchiveRestore,
  Flame,
  Calendar,
  Tag,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { LogCalendar } from "@/components/habits/LogCalendar";
import { useHabit } from "@/lib/hooks/useHabits";
import { useArchiveHabit } from "@/lib/hooks/useHabits";
import { useStreak } from "@/lib/hooks/useStreak";
import { useHabitLogs } from "@/lib/hooks/useHabitLogs";
import { frequencyLabel, isStreakRelevant } from "@/lib/utils/habit";
import { fromApiDate, toDisplayDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface HabitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function HabitDetailPage({ params }: HabitDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: habit, isLoading, error, refetch } = useHabit(id);
  const { data: streak } = useStreak(id);
  const { data: logs = [] } = useHabitLogs(id);
  const archiveHabit = useArchiveHabit();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }

  function handleArchiveToggle() {
    if (!habit) return;
    archiveHabit.mutate(
      { id: habit._id, archive: !habit.archived },
      { onSuccess: () => router.push("/dashboard") },
    );
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

  const streakCount = streak?.streak ?? 0;
  const streakCounts = isStreakRelevant(habit);

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

          {/* Logo — links to dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Flame size={16} className="text-violet-500" />
            <span className="text-sm font-semibold tracking-tight text-neutral-100">
              HabitSync
            </span>
          </Link>

          {/* <h1 className="text-base font-semibold text-neutral-100 truncate max-w-50">
            {habit.title}
          </h1> */}

          {/* {habit.archived && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500">
              Archived
            </span>
          )} */}
        </div>

        {/* Edit button */}
        <Link href={`/habits/${habit._id}/edit`}>
          <Button variant="ghost" size="icon" aria-label="Edit habit">
            <Pencil size={15} />
          </Button>
        </Link>
      </header>

      <main className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* ── Habit info ── */}
        <section className="flex flex-col gap-3">
          <h1 className="text-base font-semibold text-neutral-100 truncate max-w-50">
            {habit.title}
          </h1>

          {habit.description && (
            <p className="text-sm text-neutral-400">{habit.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {/* Category */}
            {habit.category && (
              <InfoChip icon={<Tag size={11} />} label={habit.category} />
            )}

            {/* Frequency */}
            <InfoChip
              icon={<Calendar size={11} />}
              label={frequencyLabel(habit)}
            />

            {/* Target */}
            {habit.evaluationType === "measurable" &&
              habit.targetValue != null && (
                <InfoChip
                  icon={<Target size={11} />}
                  label={`${habit.targetType} ${habit.targetValue}${habit.targetUnit ? ` ${habit.targetUnit}` : ""}`}
                />
              )}
          </div>

          {/* Start date */}
          <p className="text-xs text-neutral-600">
            Started {toDisplayDate(fromApiDate(habit.startDate))}
          </p>
        </section>

        {/* ── Streak card ── */}
        <section
          className={cn(
            "rounded-xl border px-5 py-4 flex items-center justify-between",
            streakCounts && streakCount > 0
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-neutral-900 border-neutral-800",
          )}
        >
          <div>
            <p className="text-xs text-neutral-500 mb-1">Current streak</p>
            <div className="flex items-center gap-2">
              <Flame
                size={20}
                className={
                  streakCounts && streakCount > 0
                    ? "text-amber-400"
                    : "text-neutral-700"
                }
              />
              <span className="text-3xl font-bold tabular-nums text-neutral-100">
                {streakCount}
              </span>
              <span className="text-sm text-neutral-500">days</span>
            </div>
          </div>

          {!streakCounts && (
            <p className="text-xs text-neutral-600 text-right max-w-30">
              Flexible habits don&apos;t count toward streak
            </p>
          )}
        </section>

        {/* ── Log calendar ── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-300">
            Last 30 days
          </h2>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 overflow-x-auto">
            <LogCalendar habit={habit} logs={logs} />
          </div>
        </section>

        {/* ── Archive / Unarchive ── */}
        <section className="pt-2">
          <Button
            variant={habit.archived ? "outline" : "danger"}
            size="md"
            onClick={handleArchiveToggle}
            loading={archiveHabit.isPending}
            className="w-full"
          >
            {habit.archived ? (
              <span className="flex items-center gap-1">
                <ArchiveRestore size={15} />
                Unarchive habit
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Archive size={15} />
                Archive habit
              </span>
            )}
          </Button>
        </section>
      </main>
    </div>
  );
}

// ── Info chip ─────────────────────────────────────────────────────────────────

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
      <span className="text-neutral-500">{icon}</span>
      <span className="text-xs text-neutral-300">{label}</span>
    </div>
  );
}
