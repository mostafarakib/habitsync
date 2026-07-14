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
import { useMemo } from "react";
import { HabitListSection } from "@/components/habits/HabitListSection";

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

  // ── Categorize entries into buckets ───────────────────────────────────────
  const { scheduledToday, weeklyFlexible, monthly, notScheduled } =
    useMemo(() => {
      const scheduledToday: DayEntry[] = [];
      const weeklyFlexible: DayEntry[] = [];
      const monthly: DayEntry[] = [];
      const notScheduled: DayEntry[] = [];

      entries.forEach((entry) => {
        const { type, flexible } = entry.habit.frequency;

        if (type === "monthly") {
          monthly.push(entry);
          return;
        }

        if (type === "weekly" && flexible) {
          weeklyFlexible.push(entry);
          return;
        }

        // daily or scheduled weekly
        if (isScheduledOnDate(entry.habit, selectedDate)) {
          scheduledToday.push(entry);
        } else {
          // scheduled weekly but not today
          notScheduled.push(entry);
        }
      });

      return { scheduledToday, weeklyFlexible, monthly, notScheduled };
    }, [entries, selectedDate]);

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
    <div className="flex flex-col gap-4 px-4 pb-28">
      {/* Scheduled Today — daily + scheduled weekly on correct day */}
      <HabitListSection
        title="Scheduled Today"
        entries={scheduledToday}
        date={dateStr}
        selectedDate={selectedDate}
        isReadOnly={readOnly}
        defaultOpen={true}
        resetKey={dateStr}
        onNotesClick={onNotesClick}
      />

      {/* Weekly — flexible weekly habits */}
      <HabitListSection
        title="Weekly"
        entries={weeklyFlexible}
        date={dateStr}
        selectedDate={selectedDate}
        isReadOnly={readOnly}
        defaultOpen={true}
        resetKey={dateStr}
        onNotesClick={onNotesClick}
      />

      {/* Monthly — monthly habits */}
      <HabitListSection
        title="Monthly"
        entries={monthly}
        date={dateStr}
        selectedDate={selectedDate}
        isReadOnly={readOnly}
        defaultOpen={false}
        resetKey={dateStr}
        onNotesClick={onNotesClick}
      />

      {/* Not Scheduled Today — scheduled weekly not due today */}
      <HabitListSection
        title="Not Scheduled Today"
        entries={notScheduled}
        date={dateStr}
        selectedDate={selectedDate}
        isReadOnly={readOnly}
        forceReadOnly={true}
        defaultOpen={false}
        resetKey={dateStr}
        onNotesClick={onNotesClick}
      />
    </div>
  );
}
