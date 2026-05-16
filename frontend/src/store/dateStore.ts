import {
  getNextDay,
  getPreviousDay,
  isFutureDate,
  normalizeUtcDate,
  toApiDate,
} from "@/lib/utils/date";
import { create } from "zustand";

interface DateStore {
  selectedDate: Date;
  selectedDateStr: string; // api formatted date string yyyy-mm-dd

  setDate: (date: Date) => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
}

export const useDateStore = create<DateStore>((set, get) => {
  const today = normalizeUtcDate(new Date());

  return {
    selectedDate: today,
    selectedDateStr: toApiDate(today),

    setDate: (date: Date) => {
      // block future dates
      if (isFutureDate(date)) return;

      const normalizedDate = normalizeUtcDate(date);
      set({
        selectedDate: normalizedDate,
        selectedDateStr: toApiDate(normalizedDate),
      });
    },
    goToPrevDay: () => {
      const prev = getPreviousDay(get().selectedDate);
      const normalized = normalizeUtcDate(prev);

      set({
        selectedDate: normalized,
        selectedDateStr: toApiDate(normalized),
      });
    },
    goToNextDay: () => {
      const next = getNextDay(get().selectedDate);

      // block future dates
      if (isFutureDate(next)) return;

      const normalized = normalizeUtcDate(next);
      set({
        selectedDate: normalized,
        selectedDateStr: toApiDate(normalized),
      });
    },
    goToToday: () => {
      const today = normalizeUtcDate(new Date());
      set({
        selectedDate: today,
        selectedDateStr: toApiDate(today),
      });
    },
  };
});
