import { Flame, Trophy } from "lucide-react";
import type { HabitPerformance } from "@/types";

interface StreaksListProps {
  habits: HabitPerformance[];
}

export function StreaksList({ habits }: StreaksListProps) {
  const ranked = [...habits]
    .filter((h) => h.currentStreak > 0 || h.bestStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak);

  if (ranked.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <p className="text-xs text-neutral-600">
          No active or past streaks yet, keep logging to build one.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-neutral-200">Streaks</h3>
        <p className="text-[11px] text-neutral-600 mt-0.5">
          Current streak and Longest streak
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {ranked.map((habit) => (
          <div
            key={habit.habitId}
            className="flex items-center justify-between rounded-lg bg-neutral-800/40 px-3 py-2.5"
          >
            <span className="text-xs text-neutral-200 truncate flex-1">
              {habit.title}
            </span>

            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 tabular-nums">
                <Flame size={11} />
                {habit.currentStreak}d
              </span>
              <span className="flex items-center gap-1 text-[10px] text-neutral-500 tabular-nums">
                <Trophy size={10} className="text-yellow-500" />
                best {habit.bestStreak}d
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
