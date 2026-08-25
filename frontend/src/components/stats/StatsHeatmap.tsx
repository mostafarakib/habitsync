import { fromApiDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import type { HeatmapDay } from "@/types";

interface StatsHeatmapProps {
  days: HeatmapDay[];
}

const CELL_SIZE = 11; // px,
const CELL_GAP = 3; // px
const MONTH_GAP = 10; // px, extra space between month groups

export function StatsHeatmap({ days }: StatsHeatmapProps) {
  const weeks = groupIntoWeeks(days);
  const monthLabels = generateMonthLabels(weeks);

  return (
    <div className="flex flex-col gap-2 w-fit min-w-full">
      {/* Month labels */}
      <div className="flex pl-8">
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className="text-[10px] text-neutral-500"
            style={{
              width: label.span * CELL_SIZE + (label.span - 1) * CELL_GAP,
              marginRight: label.isMonthEnd ? MONTH_GAP : 0,
            }}
          >
            {label.text}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex">
        <div
          className="flex flex-col shrink-0"
          style={{ gap: CELL_GAP, width: 20 }}
        >
          {["Mon", "", "Wed", "", "Fri", "", ""].map((label, i) => (
            <div
              key={i}
              style={{ height: CELL_SIZE }}
              className="flex items-center text-[8px] text-neutral-600"
            >
              {label}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => {
          const isMonthEnd =
            weeks[wi + 1] && weekMonth(week) !== weekMonth(weeks[wi + 1]);
          return (
            <div
              key={wi}
              className="flex flex-col"
              style={{
                gap: CELL_GAP,
                marginRight: isMonthEnd ? MONTH_GAP : CELL_GAP,
              }}
            >
              {week.map((day, di) => (
                <Cell key={di} day={day} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1 pl-8">
        <span className="text-[10px] text-neutral-600">Less</span>
        <div className="flex" style={{ gap: CELL_GAP }}>
          <LegendCell className="bg-neutral-800/40 border border-neutral-800" />
          <LegendCell className="bg-[#0e4429]" />
          <LegendCell className="bg-[#006d32]" />
          <LegendCell className="bg-[#26a641]" />
          <LegendCell className="bg-[#39d353]" />
        </div>
        <span className="text-[10px] text-neutral-600">More</span>
      </div>
    </div>
  );
}

function LegendCell({ className }: { className: string }) {
  return (
    <div
      className={cn("rounded-sm", className)}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
    />
  );
}

function Cell({ day }: { day: HeatmapDay | null }) {
  if (!day) {
    return <div style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
  }

  const color = getCellColor(day.percent);
  const dateLabel = format(fromApiDate(day.date), "MMM d, yyyy");

  let tooltip: string;
  if (day.percent === null) {
    tooltip = `${dateLabel} — rest day`;
  } else if (day.value != null && day.targetValue != null) {
    tooltip = `${dateLabel} — ${day.value} of ${day.targetValue} (${day.percent}%)`;
  } else {
    tooltip = `${dateLabel} — ${day.percent}% completed`;
  }

  return (
    <div
      title={tooltip}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      className={cn("rounded-sm transition-colors", color)}
    />
  );
}

function getCellColor(percent: number | null): string {
  if (percent === null) return "bg-neutral-800/40 border border-neutral-800";
  if (percent === 0) return "bg-neutral-800/40 border border-neutral-800";
  if (percent <= 25) return "bg-[#0e4429]";
  if (percent <= 50) return "bg-[#006d32]";
  if (percent <= 75) return "bg-[#26a641]";
  return "bg-[#39d353]";
}

function weekMonth(week: (HeatmapDay | null)[]): string {
  const firstDay = week.find((d) => d !== null);
  return firstDay ? format(fromApiDate(firstDay.date), "yyyy-MM") : "";
}

function groupIntoWeeks(days: HeatmapDay[]): (HeatmapDay | null)[][] {
  if (days.length === 0) return [];

  const weeks: (HeatmapDay | null)[][] = [];
  const firstDate = fromApiDate(days[0].date);
  const firstDayOfWeek = (firstDate.getUTCDay() + 6) % 7;

  let currentWeek: (HeatmapDay | null)[] = Array(firstDayOfWeek).fill(null);

  days.forEach((day) => {
    const date = fromApiDate(day.date);
    const dayOfWeek = (date.getUTCDay() + 6) % 7;

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  while (currentWeek.length < 7) currentWeek.push(null);
  weeks.push(currentWeek);

  return weeks;
}

interface MonthLabel {
  text: string;
  span: number;
  isMonthEnd: boolean;
}

function generateMonthLabels(weeks: (HeatmapDay | null)[][]): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let currentMonth = "";
  let currentSpan = 0;

  weeks.forEach((week, i) => {
    const firstDay = week.find((d) => d !== null);
    const month = firstDay ? format(fromApiDate(firstDay.date), "MMM") : "";
    const isLastWeek = i === weeks.length - 1;

    if (month !== currentMonth) {
      if (currentMonth !== "") {
        labels.push({
          text: currentMonth,
          span: currentSpan,
          isMonthEnd: true,
        });
      }
      currentMonth = month;
      currentSpan = 1;
    } else {
      currentSpan++;
    }

    if (isLastWeek) {
      labels.push({ text: currentMonth, span: currentSpan, isMonthEnd: false });
    }
  });

  return labels;
}
