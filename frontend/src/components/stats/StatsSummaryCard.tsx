import { Flame, ListChecks, Trophy } from "lucide-react";
import { StreakRing } from "./StreakRing";
import type { StatsSummary } from "@/types";

interface StatsSummaryCardProps {
  summary: StatsSummary;
}

function getMotivationalMessage(rate: number): string {
  if (rate >= 90) return "Outstanding! 🏆";
  if (rate >= 75) return "Great job! 🎉";
  if (rate >= 50) return "Good progress! 📈";
  if (rate >= 25) return "Keep going! 💪";
  return "Let's build momentum! 🚀";
}

export function StatsSummaryCard({ summary }: StatsSummaryCardProps) {
  const message = getMotivationalMessage(summary.overallCompletionRate);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-4">
      {/* Top row — ring + message */}
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-1/3 flex justify-center">
          <StreakRing
            percent={summary.overallCompletionRate}
            size={92}
            strokeWidth={9}
            sublabel="Completed"
          />
        </div>

        <div className="flex-1 min-w-0 rounded-xl bg-neutral-800/50 border border-neutral-800 px-3 py-2.5">
          <p className="text-base font-semibold text-neutral-100">{message}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {summary.completedCount} habits completed in the last 30 days
          </p>
        </div>
      </div>

      {/* Stat tiles row */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile
          icon={<Flame size={13} className="text-amber-400" />}
          value={summary.currentStreak}
          label="Current streak"
        />
        <StatTile
          icon={<ListChecks size={13} className="text-blue-400" />}
          value={summary.activeHabitCount}
          label="Active habits"
        />
        <StatTile
          icon={<Trophy size={13} className="text-yellow-400" />}
          value={summary.bestStreak}
          label="Best streak"
        />
      </div>
    </div>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-neutral-800/50 border border-neutral-800 px-3 py-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-base font-semibold text-neutral-100 tabular-nums">
          {value}
        </span>
      </div>
      <span className="text-[10px] text-neutral-500 leading-tight">
        {label}
      </span>
    </div>
  );
}
