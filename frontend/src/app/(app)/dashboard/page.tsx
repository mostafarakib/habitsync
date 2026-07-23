"use client";

import { HabitForm } from "@/components/habits/HabitForm";
import { HabitList } from "@/components/habits/HabitList";
import { NotesModal } from "@/components/habits/NotesModal";
import { DateNavigator } from "@/components/layout/DateNavigator";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useDayLogs } from "@/lib/hooks/useDayLogs";
import { cn } from "@/lib/utils/cn";
import { isScheduledOnDate, isStreakRelevant } from "@/lib/utils/habit";
import { useDateStore } from "@/store/dateStore";
import type { DayEntry } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { selectedDate, selectedDateStr } = useDateStore();

  const {
    data: entries = [],
    isLoading,
    error,
    refetch,
  } = useDayLogs(selectedDateStr);

  // ── Sheet state ───────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [notesEntry, setNotesEntry] = useState<DayEntry | null>(null);

  // ── Progress summary ──────────────────────────────────────────────────────
  const scheduledEntries = entries.filter(
    (entry) =>
      isScheduledOnDate(entry.habit, selectedDate) &&
      isStreakRelevant(entry.habit),
  );

  const completedCount = scheduledEntries.filter(
    (entry) => entry.periodCompleted,
  ).length;

  const scheduledCount = scheduledEntries.length;

  const allDone = scheduledCount > 0 && completedCount === scheduledCount;

  const progress =
    scheduledCount === 0 ? 0 : (completedCount / scheduledCount) * 100;

  function handleNotesOpenChange(open: boolean) {
    if (!open) {
      setNotesEntry(null);
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-950">
      <Header />

      <main className="max-w-lg mx-auto w-full">
        {/* Date navigation */}
        <DateNavigator />

        {/* Progress bar */}
        {scheduledCount > 0 && !isLoading && (
          <div
            className="mx-4 mb-3 px-4 py-3 rounded-xl border bg-neutral-900
            border-neutral-800 flex items-center justify-between gap-4"
          >
            <div>
              <p
                className={`text-sm font-semibold ${allDone ? "text-green-400" : "text-neutral-100"}`}
              >
                {allDone
                  ? "All done! 🎉"
                  : `${completedCount} of ${scheduledCount} done`}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {scheduledCount} scheduled today
              </p>
            </div>

            <div className="w-24 h-1.5 rounded-full bg-neutral-800 overflow-hidden shrink-0">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  allDone ? "bg-green-400" : "bg-violet-600",
                )}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Habit list */}
        <HabitList
          entries={entries}
          selectedDate={selectedDate}
          dateStr={selectedDateStr}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          onRefetch={refetch}
          onNotesClick={setNotesEntry}
          onCreateHabit={() => setCreateOpen(true)}
        />
      </main>

      {/* FAB — create habit */}
      <Button
        size="icon"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-violet-600
          hover:bg-violet-700 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-900/40 z-20"
        aria-label="Create habit"
      >
        <Plus size={22} color="white" strokeWidth={2.5} />
      </Button>

      {/* Create habit sheet */}
      <Sheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Habit"
        description="Build a new habit starting today"
      >
        <HabitForm onSuccess={() => setCreateOpen(false)} />
      </Sheet>

      {/* Notes sheet */}
      <NotesModal
        open={!!notesEntry}
        onOpenChange={handleNotesOpenChange}
        entry={notesEntry}
        date={selectedDateStr}
      />
    </div>
  );
}
