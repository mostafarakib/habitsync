import { Accordion } from "@/components/ui/Accordion";
import { HabitRow } from "./HabitRow";
import type { DayEntry } from "@/types";

interface HabitListSectionProps {
  title: string;
  entries: DayEntry[];
  date: string;
  selectedDate: Date;
  isReadOnly: boolean;
  forceReadOnly?: boolean; // for "not scheduled today" section
  defaultOpen?: boolean;
  resetKey: string; // date string — triggers accordion reset
  onNotesClick: (entry: DayEntry) => void;
}

export function HabitListSection({
  title,
  entries,
  date,
  selectedDate,
  isReadOnly,
  forceReadOnly = false,
  defaultOpen = true,
  resetKey,
  onNotesClick,
}: HabitListSectionProps) {
  if (entries.length === 0) return null;

  return (
    <Accordion
      title={title}
      count={entries.length}
      defaultOpen={defaultOpen}
      resetKey={resetKey}
    >
      {entries.map((entry) => (
        <HabitRow
          key={entry.habit._id}
          entry={entry}
          date={date}
          selectedDate={selectedDate}
          isReadOnly={isReadOnly || forceReadOnly}
          onNotesClick={onNotesClick}
        />
      ))}
    </Accordion>
  );
}
