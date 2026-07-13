"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDateStore } from "@/store/dateStore";
import {
  toDisplayDate,
  isFutureDate,
  isEditable,
  getNextDay,
  toApiDate,
  fromApiDate,
} from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { useRef } from "react";

export function DateNavigator() {
  const { selectedDate, goToPrevDay, goToNextDay, setDate } = useDateStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const nextDay = getNextDay(selectedDate);
  const canGoNext = !isFutureDate(nextDay);
  const readOnly = !isEditable(selectedDate);
  const todayStr = toApiDate(new Date());

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!val) return;
    const parsed = fromApiDate(val);
    if (isFutureDate(parsed)) return;
    setDate(parsed);
  }

  function openDatePicker() {
    inputRef.current?.showPicker();
  }

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

      {/* Date display — opens date picker on tap */}
      <div className="relative flex flex-col items-center">
        {/* Hidden native date input */}
        <input
          ref={inputRef}
          type="date"
          max={todayStr}
          value={toApiDate(selectedDate)}
          onChange={handleDateChange}
          className="sr-only"
          aria-label="Select date"
        />

        {/* Visible date button */}
        <button
          onClick={openDatePicker}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg
            hover:bg-neutral-800 transition-colors"
        >
          <span className="text-base font-semibold tracking-tight text-neutral-100">
            {toDisplayDate(selectedDate)}
          </span>

          {readOnly && (
            <span
              className="text-[10px] font-medium uppercase tracking-wider
              px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400"
            >
              Read-only
            </span>
          )}
        </button>
      </div>

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
