"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
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
  const heatmapStart = new Date(today.getTime() - 181 * 24 * 60 * 60 * 1000); // 6 months

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
    <div className="min-h-dvh bg-neutral-950">
      <Header />

      <main className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
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
          <>
            <StatsSummaryCard summary={summary} />
            <InsightsCard
              summary={summary}
              habits={habits}
              heatmapDays={heatmapDays}
            />

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <h3 className="text-sm font-semibold text-neutral-200 mb-4">
                Activity Heatmap
              </h3>
              <div className="overflow-x-auto">
                <StatsHeatmap days={heatmapDays} />
              </div>
            </div>

            <TrendChart
              days={heatmapDays}
              period={trendPeriod}
              onPeriodChange={setTrendPeriod}
            />

            <HabitPerformanceList
              habits={habits}
              period={performancePeriod}
              onPeriodChange={setPerformancePeriod}
            />

            <StreaksList habits={habits} />
          </>
        )}
      </main>
    </div>
  );
}
