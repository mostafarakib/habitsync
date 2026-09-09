"use client";

import { HabitForm } from "@/components/habits/HabitForm";
import { HabitList } from "@/components/habits/HabitList";
import { NotesModal } from "@/components/habits/NotesModal";
import { DateNavigator } from "@/components/layout/DateNavigator";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useDayLogs } from "@/lib/hooks/useDayLogs";
import { isScheduledOnDate, isStreakRelevant } from "@/lib/utils/habit";
import { useDateStore } from "@/store/dateStore";
import type { DayEntry } from "@/types";
import { CalendarCheck, ListTodo, Plus } from "lucide-react";
import { useState } from "react";
import { useTabStore } from "@/store/tabStore";
import { useTasks } from "@/lib/hooks/useTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TodaysSummaryCard } from "@/components/habits/todaysSummaryCard";
import { useStatsSummary } from "@/lib/hooks/useStats";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";

type CreateType = "habit" | "task" | null;

export default function DashboardPage() {
  const { selectedDate, selectedDateStr } = useDateStore();
  const { activeTab, setActiveTab } = useTabStore();
  const { data: summary } = useStatsSummary();

  const [createType, setCreateType] = useState<CreateType>(null);
  const [notesEntry, setNotesEntry] = useState<DayEntry | null>(null);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Both fetched unconditionally now — desktop shows both panels at once,
  // mobile still only renders one at a time but the data is cheap to have cached either way
  const {
    data: entries = [],
    isLoading: habitsLoading,
    error: habitsError,
    refetch: refetchHabits,
  } = useDayLogs(selectedDateStr);

  const {
    data: pendingTasks = [],
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useTasks(false);

  const {
    data: completedTasks = [],
    isLoading: completedLoading,
    refetch: refetchCompleted,
  } = useTasks(true);

  const tasksLoading = pendingLoading || completedLoading;

  function refetchTasks() {
    refetchPending();
    refetchCompleted();
  }

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
    if (!open) setNotesEntry(null);
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

  const habitsPanel = (
    <div className="flex flex-col">
      <DateNavigator />

      {!habitsLoading && summary && (
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

      <HabitList
        entries={entries}
        selectedDate={selectedDate}
        dateStr={selectedDateStr}
        isLoading={habitsLoading}
        error={habitsError instanceof Error ? habitsError : null}
        onRefetch={refetchHabits}
        onNotesClick={handleNotesClick}
        onCreateHabit={() => setCreateType("habit")}
      />
    </div>
  );

  const tasksPanel = (
    <div className="pt-4">
      <TaskList
        pendingTasks={pendingTasks}
        completedTasks={completedTasks}
        isLoading={tasksLoading}
        error={pendingError instanceof Error ? pendingError : null}
        onRefetch={refetchTasks}
        onCreateTask={() => setCreateType("task")}
      />
    </div>
  );

  return (
    <div className="min-h-dvh bg-neutral-950">
      {/* ── Mobile: single panel + tab switcher (BottomNav lives in app layout, already lg:hidden) ── */}
      <div className="lg:hidden max-w-lg mx-auto w-full relative">
        <main>
          {activeTab === "habits" && habitsPanel}
          {activeTab === "tasks" && tasksPanel}
        </main>

        {/* Mobile FAB — context aware, single button */}
        <div className="fixed bottom-24 left-0 right-6 z-20 pointer-events-none">
          <div className="max-w-lg mx-auto w-full px-4 flex justify-end">
            <Button
              size="icon"
              onClick={() =>
                setCreateType(activeTab === "habits" ? "habit" : "task")
              }
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

      {/* ── Desktop: both panels side by side, 1/2 / 1/2 ── */}
      <div className="hidden lg:flex max-w-6xl mx-auto w-full gap-6 px-6 py-6 items-start">
        <div className="w-1/2 flex flex-col gap-3 sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto scrollbar-hide">
          <h2 className="text-sm font-semibold text-neutral-300">Habits</h2>
          {habitsPanel}
        </div>

        <div className="w-1/2 flex flex-col gap-3 sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto scrollbar-hide">
          <h2 className="text-sm font-semibold text-neutral-300">Tasks</h2>
          {tasksPanel}
        </div>
      </div>

      {/* Desktop FAB — asks habit or task via dropup */}
      <div className="hidden lg:block fixed bottom-8 right-8 z-20">
        <DropdownMenu
          open={isCreateMenuOpen}
          onOpenChange={setIsCreateMenuOpen}
          side="top"
          align="end"
          trigger={
            <button
              className="h-14 w-14 flex items-center justify-center rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-900/40 cursor-pointer"
              aria-label="Create new"
            >
              <Plus size={22} color="white" strokeWidth={2.5} />
            </button>
          }
        >
          <DropdownMenuItem
            onClick={() => {
              setIsCreateMenuOpen(false);
              setTimeout(() => setCreateType("habit"), 0);
            }}
          >
            <CalendarCheck size={14} />
            New habit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setIsCreateMenuOpen(false);
              setTimeout(() => setCreateType("task"), 0);
            }}
          >
            <ListTodo size={14} />
            New task
          </DropdownMenuItem>
        </DropdownMenu>
      </div>

      {/* Create sheet — driven by createType */}
      <Sheet
        open={createType !== null}
        onOpenChange={(open) => !open && setCreateType(null)}
        title={createType === "habit" ? "New Habit" : "New Task"}
        description={
          createType === "habit"
            ? "Build a new habit starting today"
            : "Add a one-time task to your list"
        }
      >
        {createType === "habit" ? (
          <HabitForm onSuccess={() => setCreateType(null)} />
        ) : (
          <TaskForm onSuccess={() => setCreateType(null)} />
        )}
      </Sheet>

      {/* Notes sheet — habits only, shared across both layouts */}
      <NotesModal
        open={!!notesEntry}
        onOpenChange={handleNotesOpenChange}
        entry={notesEntry}
        date={selectedDateStr}
      />
    </div>
  );
}
