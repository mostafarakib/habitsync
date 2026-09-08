"use client";

import { useState } from "react";
import { StatsSummaryCard } from "@/components/stats/StatsSummaryCard";
import { StatsHeatmap } from "@/components/stats/StatsHeatmap";
import { TrendChart } from "@/components/stats/TrendChart";
import { HabitPerformanceList } from "@/components/stats/HabitPerformanceList";
import { StreaksList } from "@/components/stats/StreaksList";
import { InsightsCard } from "@/components/stats/InsightsCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import {
  useStatsSummary,
  useHabitPerformance,
  useHeatmap,
} from "@/lib/hooks/useStats";
import { toApiDate, todayUtc } from "@/lib/utils/date";
import type { TrendPeriod } from "@/types";

export default function StatsPage() {
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>(30);
  const [performancePeriod, setPerformancePeriod] = useState<TrendPeriod>(30);

  const today = todayUtc();
  const heatmapStart = new Date(today.getTime() - 364 * 24 * 60 * 60 * 1000); // 12 months

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useStatsSummary();

  const { data: habits = [], isLoading: habitsLoading } =
    useHabitPerformance(performancePeriod);

  const { data: heatmapDays = [], isLoading: heatmapLoading } = useHeatmap(
    toApiDate(heatmapStart),
    toApiDate(today),
  );

  const isLoading = summaryLoading || habitsLoading || heatmapLoading;

  return (
    <main className="w-full max-w-lg lg:max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-neutral-100">Statistics</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="md" />
        </div>
      )}

      {summaryError && !isLoading && (
        <ErrorState
          message="Failed to load your stats."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchSummary()}
            >
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !summaryError && summary && (
        <div className="flex flex-col gap-5">
          {/* Row 1 — nested grid: left column stacks two cards, right column is TrendChart matching their combined height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <div className="flex flex-col gap-5">
              <StatsSummaryCard summary={summary} />
              <InsightsCard
                summary={summary}
                habits={habits}
                heatmapDays={heatmapDays}
              />
            </div>

            <div className="flex">
              <TrendChart
                days={heatmapDays}
                period={trendPeriod}
                onPeriodChange={setTrendPeriod}
                className="flex-1"
              />
            </div>
          </div>

          {/* Row 2 — full width heatmap */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-200">
                Activity Heatmap
              </h3>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Last 12 Months
              </p>
            </div>
            <div className="overflow-x-auto flex justify-center">
              <StatsHeatmap days={heatmapDays} />
            </div>
          </div>

          {/* Row 3 — half + half */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <HabitPerformanceList
              habits={habits}
              period={performancePeriod}
              onPeriodChange={setPerformancePeriod}
            />
            <StreaksList habits={habits} />
          </div>
        </div>
      )}
    </main>
  );
}
