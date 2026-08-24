"use client";

import { HabitForm } from "@/components/habits/HabitForm";
import { HabitList } from "@/components/habits/HabitList";
import { NotesModal } from "@/components/habits/NotesModal";
import { DateNavigator } from "@/components/layout/DateNavigator";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useDayLogs } from "@/lib/hooks/useDayLogs";
import { isScheduledOnDate, isStreakRelevant } from "@/lib/utils/habit";
import { useDateStore } from "@/store/dateStore";
import type { DayEntry } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTabStore } from "@/store/tabStore";
import { useTasks } from "@/lib/hooks/useTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TodaysSummaryCard } from "@/components/habits/todaysSummaryCard";
import { useStatsSummary } from "@/lib/hooks/useStats";

export default function DashboardPage() {
  const { selectedDate, selectedDateStr } = useDateStore();
  const { activeTab, setActiveTab } = useTabStore();
  const { data: summary } = useStatsSummary();

  // sheet state
  const [createOpen, setCreateOpen] = useState(false);
  const [notesEntry, setNotesEntry] = useState<DayEntry | null>(null);

  // habits data - only fetches when habits tab is active
  const {
    data: entries = [],
    isLoading: habitsLoading,
    error: habitsError,
    refetch: refetchHabits,
  } = useDayLogs(selectedDateStr, { enabled: activeTab === "habits" });

  // Tasks data — only fetch when tasks tab is active
  const {
    data: pendingTasks = [],
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useTasks(false, { enabled: activeTab === "tasks" });

  const {
    data: completedTasks = [],
    isLoading: completedLoading,
    refetch: refetchCompleted,
  } = useTasks(true, { enabled: activeTab === "tasks" });

  const tasksLoading = pendingLoading || completedLoading;

  function refetchTasks() {
    refetchPending();
    refetchCompleted();
  }

  // today's scheduled habit stats
  const scheduledEntries = entries.filter(
    (entry) =>
      isScheduledOnDate(entry.habit, selectedDate) &&
      isStreakRelevant(entry.habit),
  );

  const completedCount = scheduledEntries.filter(
    (entry) => entry.periodCompleted,
  ).length;

  const scheduledCount = scheduledEntries.length;

  const totalCompletedTodayAllHabits = entries.filter(
    (entry) => entry.periodCompleted,
  ).length;

  function handleNotesOpenChange(open: boolean) {
    if (!open) {
      setNotesEntry(null);
    }
  }

  function handleNotesClick(entry: DayEntry) {
    const { type, flexible } = entry.habit.frequency;

    const isFlexibleOrMonthly =
      (type === "weekly" && flexible) || type === "monthly";

    const effectiveEntry: DayEntry = isFlexibleOrMonthly
      ? { ...entry, log: entry.periodLog ?? entry.log }
      : entry;

    setNotesEntry(effectiveEntry);
  }

  return (
    <div className="min-h-dvh bg-neutral-950">
      <Header />

      <div className="max-w-lg mx-auto w-full relative">
        <main>
          {/* Date navigation — habits only */}
          {activeTab === "habits" && <DateNavigator />}

          {activeTab === "habits" && !habitsLoading && summary && (
            <div className="px-4 mb-3">
              <TodaysSummaryCard
                completionRate={
                  scheduledCount === 0
                    ? 0
                    : Math.round((completedCount / scheduledCount) * 100)
                }
                allHabitsDoneToday={totalCompletedTodayAllHabits}
                currentStreak={summary.currentStreak}
                scheduledCount={scheduledCount}
                notDoneCount={scheduledCount - completedCount}
              />
            </div>
          )}
          {/* Habits tab content */}
          {activeTab === "habits" && (
            <HabitList
              entries={entries}
              selectedDate={selectedDate}
              dateStr={selectedDateStr}
              isLoading={habitsLoading}
              error={habitsError instanceof Error ? habitsError : null}
              onRefetch={refetchHabits}
              onNotesClick={handleNotesClick}
              onCreateHabit={() => setCreateOpen(true)}
            />
          )}

          {/* Tasks tab content */}
          {activeTab === "tasks" && (
            <div className="pt-4">
              <TaskList
                pendingTasks={pendingTasks}
                completedTasks={completedTasks}
                isLoading={tasksLoading}
                error={pendingError instanceof Error ? pendingError : null}
                onRefetch={refetchTasks}
                onCreateTask={() => setCreateOpen(true)}
              />
            </div>
          )}
        </main>

        {/* FAB — context aware */}
        <div className="fixed bottom-24 left-0 right-6 z-20 pointer-events-none">
          <div className="max-w-lg mx-auto w-full px-4 flex justify-end">
            <Button
              size="icon"
              onClick={() => setCreateOpen(true)}
              className="h-14 w-14 rounded-full bg-violet-600
        hover:bg-violet-700 active:scale-95 transition-all duration-200
        shadow-lg shadow-violet-900/40 cursor-pointer pointer-events-auto"
              aria-label={
                activeTab === "habits" ? "Create habit" : "Create task"
              }
            >
              <Plus size={22} color="white" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Create sheet - context aware */}
      <Sheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={activeTab === "habits" ? "New Habit" : "New Task"}
        description={
          activeTab === "habits"
            ? "Build a new habit starting today"
            : "Add a one-time task to your list"
        }
      >
        {activeTab === "habits" ? (
          <HabitForm onSuccess={() => setCreateOpen(false)} />
        ) : (
          <TaskForm onSuccess={() => setCreateOpen(false)} />
        )}
      </Sheet>

      {/* Notes sheet - habits only */}
      <NotesModal
        open={!!notesEntry}
        onOpenChange={handleNotesOpenChange}
        entry={notesEntry}
        date={selectedDateStr}
      />
    </div>
  );
}
