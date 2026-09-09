"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArchiveRestore, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Accordion } from "@/components/ui/Accordion";
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

  return (
    <main className="max-w-lg lg:max-w-4xl mx-auto w-full px-4 py-6">
      <h1 className="text-lg font-semibold text-neutral-100 mb-6">
        Archived &amp; Ended Habits
      </h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="md" />
        </div>
      )}

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

      {!isLoading && !error && !isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {archivedHabits.length > 0 && (
            <Accordion
              title="Archived"
              count={archivedHabits.length}
              defaultOpen={true}
            >
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
            </Accordion>
          )}

          {endedHabits.length > 0 && (
            <Accordion
              title="Ended"
              count={endedHabits.length}
              defaultOpen={true}
            >
              {endedHabits.map((habit) => (
                <div
                  key={habit._id}
                  className={cn(
                    "flex items-center justify-between gap-3",
                    "rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3.5",
                  )}
                >
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
            </Accordion>
          )}
        </div>
      )}
    </main>
  );
}
