import Link from "next/link";
import { Flame, Trophy } from "lucide-react";
import type { HabitPerformance, TrendPeriod } from "@/types";

interface HabitPerformanceListProps {
  habits: HabitPerformance[];
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}

export function HabitPerformanceList({
  habits,
  period,
  onPeriodChange,
}: HabitPerformanceListProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">
          Habit Performance
        </h3>
        <div className="flex gap-1 rounded-lg bg-neutral-800/50 p-1">
          {([30, 60, 90] as TrendPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                period === p
                  ? "bg-violet-600 text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {habits.length === 0 ? (
        <p className="text-xs text-neutral-600 py-6 text-center">
          No habit data for this period yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {habits.map((habit) => (
            <Link
              key={habit.habitId}
              href={`/habits/${habit.habitId}`}
              className="flex flex-col gap-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-200 group-hover:text-violet-400 transition-colors truncate">
                  {habit.title}
                </span>
                <span className="text-xs font-semibold text-neutral-300 tabular-nums shrink-0 ml-2">
                  {habit.completionRate}%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-500"
                  style={{ width: `${habit.completionRate}%` }}
                />
              </div>

              <div className="flex items-center gap-3 text-[10px] text-neutral-600">
                <span className="flex items-center gap-1">
                  <Flame size={10} className="text-amber-500" />
                  {habit.currentStreak} current
                </span>
                <span className="flex items-center gap-1">
                  <Trophy size={10} className="text-yellow-500" />
                  {habit.bestStreak} best
                </span>
                <span>{habit.totalCompleted} total</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
