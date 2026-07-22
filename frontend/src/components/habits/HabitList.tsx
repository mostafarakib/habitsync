"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { isScheduledOnDate, sortEntries, SortOption } from "@/lib/utils/habit";
import { isEditable } from "@/lib/utils/date";
import { ArrowUpDown, CalendarDays } from "lucide-react";
import type { DayEntry } from "@/types";
import { useMemo, useState } from "react";
import { HabitListSection } from "@/components/habits/HabitListSection";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/DropdownMenu";

const SORT_LABELS: Record<SortOption, string> = {
  priority: "Priority",
  startDate: "Start date",
  name: "Name",
  status: "Status",
};

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

  // Sort preference — persists across date changes, resets on refresh
  const [sortBy, setSortBy] = useState<SortOption>("priority");

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

      // Sort each bucket independently
      return {
        scheduledToday: sortEntries(scheduledToday, sortBy),
        weeklyFlexible: sortEntries(weeklyFlexible, sortBy),
        monthly: sortEntries(monthly, sortBy),
        notScheduled: sortEntries(notScheduled, sortBy),
      };
    }, [entries, selectedDate, sortBy]);

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

  return (
    <div className="flex flex-col gap-4 px-4 pb-28">
      {/* ── Sort control ── */}
      <div className="flex items-center justify-end">
        <DropdownMenu
          trigger={
            <button
              className="flex items-center gap-1.5 text-xs text-neutral-500
              hover:text-neutral-300 transition-colors py-1 px-2 rounded-lg
              hover:bg-neutral-800"
            >
              <ArrowUpDown size={12} />
              Sort: {SORT_LABELS[sortBy]}
            </button>
          }
          align="end"
        >
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <DropdownMenuItem key={option} onClick={() => setSortBy(option)}>
              <span className={sortBy === option ? "text-violet-400" : ""}>
                {SORT_LABELS[option]}
              </span>
              {sortBy === option && (
                <span className="ml-auto text-violet-400 text-xs">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      </div>

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
