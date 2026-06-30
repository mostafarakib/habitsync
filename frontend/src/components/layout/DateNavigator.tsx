"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDateStore } from "@/store/dateStore";
import {
  toDisplayDate,
  isFutureDate,
  isEditable,
  getNextDay,
} from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

export function DateNavigator() {
  const { selectedDate, goToPrevDay, goToNextDay, goToToday } = useDateStore();

  const nextDay = getNextDay(selectedDate);
  const canGoNext = !isFutureDate(nextDay);
  const readOnly = !isEditable(selectedDate);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Previous day */}
      <button
        onClick={goToPrevDay}
        className="h-9 w-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Date display */}
      <button
        onClick={goToToday}
        className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
        title="Go to today"
      >
        <span className="text-base font-semibold tracking-tight text-neutral-100">
          {toDisplayDate(selectedDate)}
        </span>

        {readOnly && (
          <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
            Read-only
          </span>
        )}
      </button>

      {/* Next day */}
      <button
        onClick={goToNextDay}
        disabled={!canGoNext}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded-lg transition-colors",
          canGoNext
            ? "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
            : "text-neutral-700 cursor-not-allowed",
        )}
        aria-label="Next day"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
