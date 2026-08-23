import { Sparkles } from "lucide-react";
import { fromApiDate } from "@/lib/utils/date";
import type { HeatmapDay, HabitPerformance, StatsSummary } from "@/types";

interface InsightsCardProps {
  summary: StatsSummary;
  habits: HabitPerformance[];
  heatmapDays: HeatmapDay[];
}

interface Insight {
  title: string;
  description: string;
}

export function InsightsCard({
  summary,
  habits,
  heatmapDays,
}: InsightsCardProps) {
  const insights = generateInsights(summary, habits, heatmapDays);

  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-neutral-200">Insights</h3>
        </div>
        <p className="text-[11px] text-neutral-600 mt-0.5">
          Last {heatmapDays.length} days
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {insights.map((insight, i) => (
          <div key={i}>
            <p className="text-xs font-medium text-neutral-200">
              {insight.title}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateInsights(
  summary: StatsSummary,
  habits: HabitPerformance[],
  heatmapDays: HeatmapDay[],
): Insight[] {
  const insights: Insight[] = [];

  // Streak momentum
  if (summary.currentStreak >= 3) {
    insights.push({
      title: `You're on a ${summary.currentStreak}-day consistency streak.`,
      description: "Keep it going.",
    });
  }

  // Strongest habit
  const strongest = [...habits].sort(
    (a, b) => b.completionRate - a.completionRate,
  )[0];

  if (strongest && strongest.completionRate >= 70) {
    insights.push({
      title: `${strongest.title} is your strongest habit.`,
      description: `You've completed it ${strongest.completionRate}% of its scheduled days this period.`,
    });
  }

  // Weekday vs weekend
  const weekdayScores: number[] = [];
  const weekendScores: number[] = [];

  heatmapDays.forEach((day) => {
    if (day.percent === null) return;
    const dayOfTheWeek = fromApiDate(day.date).getUTCDay(); // 0 = Sun, 6 = Sat
    if (dayOfTheWeek === 0 || dayOfTheWeek === 6) {
      weekendScores.push(day.percent);
    } else {
      weekdayScores.push(day.percent);
    }
  });

  if (weekdayScores.length >= 3 && weekendScores.length >= 2) {
    const weekdayAvg = average(weekdayScores);
    const weekendAvg = average(weekendScores);
    const diff = Math.abs(weekdayAvg - weekendAvg);

    if (diff >= 15) {
      const better = weekdayAvg > weekendAvg ? "weekdays" : "weekends";
      insights.push({
        title: `You're most consistent on ${better}.`,
        description: `Your completion rate is ${Math.round(
          Math.max(weekdayAvg, weekendAvg),
        )}% on ${better} compared with ${Math.round(
          Math.min(weekdayAvg, weekendAvg),
        )}% on the other days.`,
      });
    }
  }

  // Weakest habit
  const weakest = [...habits]
    .filter((h) => h.totalCompleted > 0)
    .sort((a, b) => a.completionRate - b.completionRate)[0];

  if (weakest && weakest.completionRate < 40 && habits.length > 1) {
    insights.push({
      title: `${weakest.title} could use some attention.`,
      description: `It's sitting at ${weakest.completionRate}% completion this period.`,
    });
  }

  return insights.slice(0, 4);
}

function average(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}
