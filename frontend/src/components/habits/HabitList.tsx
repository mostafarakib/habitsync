"use client";

import { HabitRow } from "./HabitRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { isScheduledOnDate } from "@/lib/utils/habit";
import { isEditable } from "@/lib/utils/date";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DayEntry } from "@/types";

interface HabitListProps {
  entries: DayEntry[];
  selectedDate: Date;
  dateStr: string;
  isLoading: boolean;
  error: Error | null;
  onRefetch: () => void;
  onNotesClick: (entry: DayEntry) => void;
  onCreateHabit: () => void;
}

export function HabitList({
  entries,
  selectedDate,
  dateStr,
  isLoading,
  error,
  onRefetch,
  onNotesClick,
  onCreateHabit,
}: HabitListProps) {
  const readOnly = !isEditable(selectedDate);

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
        message="Failed to load today's habits."
        action={
          <Button variant="outline" size="sm" onClick={onRefetch}>
            Try again
          </Button>
        }
      />
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays size={20} />}
        title="No habits yet"
        description="Create your first habit to start tracking your progress."
        action={
          <Button variant="primary" size="sm" onClick={onCreateHabit}>
            Create habit
          </Button>
        }
      />
    );
  }

  // ── Sort: scheduled first, unscheduled below ──────────────────────────────

  const scheduled = entries.filter((e) =>
    isScheduledOnDate(e.habit, selectedDate),
  );
  const unscheduled = entries.filter(
    (e) => !isScheduledOnDate(e.habit, selectedDate),
  );

  return (
    <div className="flex flex-col gap-2 px-4 pb-28">
      {/* Scheduled habits */}
      {scheduled.map((entry) => (
        <HabitRow
          key={entry.habit._id}
          entry={entry}
          date={dateStr}
          selectedDate={selectedDate}
          isReadOnly={readOnly}
          onNotesClick={onNotesClick}
        />
      ))}

      {/* Unscheduled section */}
      {unscheduled.length > 0 && (
        <>
          <div className={cn("flex items-center gap-3 mt-4 mb-1")}>
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-600">
              Not scheduled
            </span>
            <div className="flex-1 h-px bg-neutral-800" />
          </div>

          {unscheduled.map((entry) => (
            <HabitRow
              key={entry.habit._id}
              entry={entry}
              date={dateStr}
              selectedDate={selectedDate}
              isReadOnly={true}
              onNotesClick={onNotesClick}
            />
          ))}
        </>
      )}
    </div>
  );
}
