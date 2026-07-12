"use client";

import Link from "next/link";
import { MessageSquare, Flame, CalendarOff } from "lucide-react";
import { HabitLogControl } from "./HabitLogControl";
import { useLogValueMutation } from "@/lib/hooks/useLogMutation";
import { useStreak } from "@/lib/hooks/useStreak";
import {
  isScheduledOnDate,
  frequencyLabel,
  isHabitCompleted,
} from "@/lib/utils/habit";
import { cn } from "@/lib/utils/cn";
import type { DayEntry } from "@/types";

interface HabitRowProps {
  entry: DayEntry;
  date: string;
  selectedDate: Date;
  isReadOnly: boolean;
  onNotesClick: (entry: DayEntry) => void;
}

export function HabitRow({
  entry,
  date,
  selectedDate,
  isReadOnly,
  onNotesClick,
}: HabitRowProps) {
  const { habit, log } = entry;

  const logMutation = useLogValueMutation(date);
  const isScheduled = isScheduledOnDate(habit, selectedDate);
  const isCompleted = isHabitCompleted(habit, log);
  const hasNotes = !!log?.notes?.trim();

  function handleValueChange(value: number) {
    logMutation.mutate({
      habitId: habit._id,
      logId: log?._id ?? null,
      date,
      value,
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200",
        // Completion state
        isCompleted
          ? "bg-neutral-800/60 border-violet-500/30"
          : "bg-neutral-900 border-neutral-800",
        // Unscheduled — dimmed
        !isScheduled && "opacity-40",
      )}
    >
      {/* ── Left: Habit info ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/habits/${habit._id}`}
            className={cn(
              "text-sm font-medium truncate hover:underline underline-offset-2 cursor-pointer",
              isCompleted ? "text-neutral-100" : "text-neutral-300",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {habit.title}
          </Link>

          {habit.category && (
            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider bg-neutral-800 text-neutral-400">
              {habit.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-neutral-500">{frequencyLabel(habit)}</p>

          {!isScheduled && (
            <span className="flex items-center gap-1 text-xs text-neutral-600">
              <CalendarOff size={10} />
              not scheduled
            </span>
          )}
        </div>
      </div>

      {/* ── Right: Controls ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Streak badge */}
        <StreakBadge habitId={habit._id} />

        {/* Notes button — only when log exists */}
        {shouldShowNotesButton(log, isReadOnly, hasNotes) && (
          <button
            onClick={() => onNotesClick(entry)}
            className={cn(
              "relative h-8 w-8 flex items-center justify-center rounded-lg transition-colors",
              "hover:bg-neutral-800",
              hasNotes ? "text-violet-400" : "text-neutral-600",
            )}
            title={hasNotes ? "View notes" : "Add notes"}
          >
            <MessageSquare size={15} />
            {hasNotes && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
            )}
          </button>
        )}

        {/* Log control */}
        {isScheduled && (
          <HabitLogControl
            habit={habit}
            log={log}
            isReadOnly={isReadOnly}
            isPending={logMutation.isPending}
            onValueChange={handleValueChange}
          />
        )}
      </div>
    </div>
  );
}

// ── Streak badge ──────────────────────────────────────────────────────────────

function StreakBadge({ habitId }: { habitId: string }) {
  const { data: streak } = useStreak(habitId);

  if (!streak?.streak) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10">
      <Flame size={11} className="text-amber-400" />
      <span className="text-xs font-semibold text-amber-400 tabular-nums">
        {streak.streak}
      </span>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Notes button shows when:
// - Log exists and not read-only (user can add/edit notes)
// - Log exists and read-only but has notes (user can view notes)
function shouldShowNotesButton(
  log: DayEntry["log"],
  isReadOnly: boolean,
  hasNotes: boolean,
): boolean {
  if (!log) return false;
  if (!isReadOnly) return true;
  return hasNotes;
}
