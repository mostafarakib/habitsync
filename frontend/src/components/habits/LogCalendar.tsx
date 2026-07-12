import { normalizeUtcDate, toApiDate } from "@/lib/utils/date";
import { isHabitCompleted, isScheduledOnDate } from "@/lib/utils/habit";
import type { Habit, HabitLog } from "@/types";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils/cn";

interface LogCalendarProps {
  habit: Habit;
  logs: HabitLog[];
}

interface CalendarDay {
  date: Date;
  dateStr: string;
  log: HabitLog | null;
  isScheduled: boolean;
  isCompleted: boolean;
  isFuture: boolean;
}

function buildDays(habit: Habit, logs: HabitLog[]): CalendarDay[] {
  const today = normalizeUtcDate(new Date());

  // Build a map of dateStr → log for quick lookup
  const logMap = new Map<string, HabitLog>();
  logs.forEach((log) => {
    const key = toApiDate(new Date(log.date));
    logMap.set(key, log);
  });

  const days: CalendarDay[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = normalizeUtcDate(subDays(today, i));
    const dateStr = toApiDate(date);
    const log = logMap.get(dateStr) ?? null;
    const isScheduled = isScheduledOnDate(habit, date);
    const completed = isHabitCompleted(habit, log);

    days.push({
      date,
      dateStr,
      log,
      isScheduled,
      isCompleted: completed,
      isFuture: false,
    });
  }

  return days;
}

function groupIntoWeeks(days: CalendarDay[]): (CalendarDay | null)[][] {
  const weeks: (CalendarDay | null)[][] = [];
  // Find the day of week of the first day (0=Sun, 1=Mon...6=Sat)
  // We want Mon=0 ... Sun=6 (ISO week)
  const firstDay = days[0];
  const firstDayOfWeek = (firstDay.date.getUTCDay() + 6) % 7; // convert to Mon-based

  // Pad the first week with nulls
  let currentWeek: (CalendarDay | null)[] = Array(firstDayOfWeek).fill(null);

  days.forEach((day) => {
    const dayOfWeek = (day.date.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      // Fill remaining slots of previous week
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(day);
  });

  // Push the last week, padding if needed
  while (currentWeek.length < 7) currentWeek.push(null);
  weeks.push(currentWeek);

  return weeks;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function LogCalendar({ habit, logs }: LogCalendarProps) {
  const days = buildDays(habit, logs);
  const weeks = groupIntoWeeks(days);

  // Generate month labels for the top
  const monthLabels = generateMonthLabels(weeks);

  return (
    <div className="flex flex-col gap-2">
      {/* Month labels */}
      <div className="flex gap-1 pl-8">
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className="text-[10px] text-neutral-500"
            style={{ width: label.span * 16 + (label.span - 1) * 4 }}
          >
            {label.text}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-3.5 flex items-center text-[10px] text-neutral-600 w-6"
            >
              {/* Only show Mon, Wed, Fri */}
              {i % 2 === 0 ? label : ""}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <CalendarCell key={dayIndex} day={day} habit={habit} />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1 pl-8">
        <span className="text-[10px] text-neutral-600">Less</span>
        <div className="flex gap-1">
          <div className="h-3.5 w-3.5 rounded-sm bg-neutral-800 border border-neutral-700" />
          <div className="h-3.5 w-3.5 rounded-sm bg-green-900" />
          <div className="h-3.5 w-3.5 rounded-sm bg-green-700" />
          <div className="h-3.5 w-3.5 rounded-sm bg-green-500" />
        </div>
        <span className="text-[10px] text-neutral-600">More</span>
      </div>
    </div>
  );
}

// ── Calendar Cell ─────────────────────────────────────────────────────────────

interface CalendarCellProps {
  day: CalendarDay | null;
  habit: Habit;
}

function CalendarCell({ day, habit }: CalendarCellProps) {
  if (!day) {
    return <div className="h-3.5 w-3.5 rounded-sm" />;
  }

  const cellColor = getCellColor(day, habit);
  const tooltip = getTooltip(day);

  return (
    <div
      title={tooltip}
      className={cn("h-3.5 w-3.5 rounded-sm transition-colors", cellColor)}
    />
  );
}

function getCellColor(day: CalendarDay, habit: Habit): string {
  // Not scheduled — neutral
  if (!day.isScheduled) {
    return "bg-neutral-800/50 border border-neutral-800";
  }

  // Scheduled but missed
  if (!day.isCompleted) {
    return "bg-neutral-800 border border-neutral-700";
  }

  // Completed — color intensity based on evaluation type
  if (habit.evaluationType === "boolean") {
    return "bg-green-500";
  }

  // Measurable — vary intensity by completion percentage
  if (habit.targetValue && day.log?.value != null) {
    const percent = Math.min(100, (day.log.value / habit.targetValue) * 100);

    if (percent >= 100) return "bg-green-500";
    if (percent >= 75) return "bg-green-600";
    if (percent >= 50) return "bg-green-700";
    return "bg-green-900";
  }

  return "bg-green-500";
}

function getTooltip(day: CalendarDay): string {
  const dateLabel = format(day.date, "MMM d, yyyy");

  if (!day.isScheduled) return `${dateLabel} — not scheduled`;
  if (!day.log) return `${dateLabel} — no log`;
  if (day.isCompleted) return `${dateLabel} — completed`;
  return `${dateLabel} — not completed`;
}

// ── Month label helpers ───────────────────────────────────────────────────────

interface MonthLabel {
  text: string;
  span: number; // how many week columns this month spans
}

function generateMonthLabels(weeks: (CalendarDay | null)[][]): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let currentMonth = "";
  let currentSpan = 0;

  weeks.forEach((week) => {
    // Use the first non-null day in the week to determine the month
    const firstDay = week.find((d) => d !== null);
    const month = firstDay ? format(firstDay.date, "MMM") : "";

    if (month !== currentMonth) {
      if (currentMonth !== "") {
        labels.push({ text: currentMonth, span: currentSpan });
      }
      currentMonth = month;
      currentSpan = 1;
    } else {
      currentSpan++;
    }
  });

  if (currentMonth) {
    labels.push({ text: currentMonth, span: currentSpan });
  }

  return labels;
}
