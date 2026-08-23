"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fromApiDate } from "@/lib/utils/date";
import { format } from "date-fns";
import type { HeatmapDay, TrendPeriod } from "@/types";

interface TrendChartProps {
  days: HeatmapDay[];
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}

interface ChartPoint {
  label: string;
  fullLabel: string;
  percent: number;
}

const BUCKET_SIZE_DAYS: Record<TrendPeriod, number> = {
  30: 7,
  60: 10,
  90: 15,
};

export function TrendChart({ days, period, onPeriodChange }: TrendChartProps) {
  const relevantDays = days.slice(-period);
  const bucketSize = BUCKET_SIZE_DAYS[period];
  const data = bucketByFixedSize(relevantDays, bucketSize);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">
            Completion Trend
          </h3>
          <p className="text-[11px] text-neutral-600 mt-0.5">
            Average completion per {bucketSize}-day period
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-neutral-800/50 p-1 shrink-0">
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

      {data.length === 0 ? (
        <p className="text-xs text-neutral-600 py-8 text-center">
          Not enough data yet.
        </p>
      ) : (
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#262626"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#737373", fontSize: 10 }}
                axisLine={{ stroke: "#262626" }}
                tickLine={false}
                interval={0}
                height={32}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#737373", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={38}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: "#262626", opacity: 0.4 }}
                contentStyle={{
                  background: "#171717",
                  border: "1px solid #262626",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                labelStyle={{ color: "#e5e5e5", marginBottom: 4 }}
                formatter={(value) => {
                  const num =
                    typeof value === "number" ? value : Number(value) || 0;
                  return [`${Math.round(num)}%`, "Avg completion"];
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullLabel ?? ""
                }
              />
              <Bar
                dataKey="percent"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function bucketByFixedSize(
  days: HeatmapDay[],
  bucketSize: number,
): ChartPoint[] {
  if (days.length === 0) return [];

  const buckets: ChartPoint[] = [];

  for (let i = 0; i < days.length; i += bucketSize) {
    const slice = days.slice(i, i + bucketSize);
    const validDays = slice.filter((d) => d.percent !== null);

    if (validDays.length === 0) continue;

    const avg =
      validDays.reduce((sum, d) => sum + (d.percent ?? 0), 0) /
      validDays.length;

    const startDate = fromApiDate(slice[0].date);
    const endDate = fromApiDate(slice[slice.length - 1].date);

    const sameMonth = startDate.getUTCMonth() === endDate.getUTCMonth();
    const label = sameMonth
      ? `${format(startDate, "MMM d")}–${format(endDate, "d")}`
      : `${format(startDate, "MMM d")}–${format(endDate, "MMM d")}`;

    const fullLabel = `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`;

    buckets.push({ label, fullLabel, percent: avg });
  }

  return buckets;
}
