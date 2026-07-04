import type { Habit, HabitLog } from "@/types";
import { Toggle } from "@/components/ui/Toggle";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface HabitLogControlProps {
  habit: Habit;
  log: HabitLog | null;
  isReadOnly: boolean;
  isPending: boolean;
  onValueChange: (value: number) => void;
}

export function HabitLogControl({
  habit,
  log,
  isReadOnly,
  isPending,
  onValueChange,
}: HabitLogControlProps) {
  if (habit.evaluationType === "boolean") {
    return (
      <BooleanControl
        log={log}
        isReadOnly={isReadOnly}
        isPending={isPending}
        onValueChange={onValueChange}
      />
    );
  }

  return (
    <MeasurableControl
      habit={habit}
      log={log}
      isReadOnly={isReadOnly}
      isPending={isPending}
      onValueChange={onValueChange}
    />
  );
}

// -- Boolean Control

interface BooleanControlProps {
  log: HabitLog | null;
  isReadOnly: boolean;
  isPending: boolean;
  onValueChange: (value: number) => void;
}

function BooleanControl({
  log,
  isReadOnly,
  isPending,
  onValueChange,
}: BooleanControlProps) {
  const isDone = log?.value === 1;

  return (
    <Toggle
      checked={isDone}
      onCheckedChange={(checked) => onValueChange(checked ? 1 : 0)}
      disabled={isReadOnly || isPending}
    />
  );
}

interface MeasurableControlProps {
  habit: Habit;
  log: HabitLog | null;
  isReadOnly: boolean;
  isPending: boolean;
  onValueChange: (value: number) => void;
}

function MeasurableControl({
  habit,
  log,
  isReadOnly,
  isPending,
  onValueChange,
}: MeasurableControlProps) {
  const currentValue = log?.value ?? 0;
  const [localValue, setLocalValue] = useState(
    currentValue > 0 ? String(currentValue) : "",
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when server response comes back
  // Keep local input in sync with server updates
  useEffect(() => {
    const serverValue = currentValue > 0 ? String(currentValue) : "";

    if (localValue !== serverValue) {
      setLocalValue(serverValue);
    }
  }, [currentValue, localValue]);

  // Cleanup pending debounce timer
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    setLocalValue(raw);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Empty input = 0
    if (raw === "") {
      debounceRef.current = setTimeout(() => {
        onValueChange(0);
      }, 600);

      return;
    }

    const parsed = Number(raw);

    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      onValueChange(parsed);
    }, 600);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        step="any"
        min={0}
        value={localValue}
        onChange={handleChange}
        disabled={isReadOnly || isPending}
        placeholder="0"
        className={cn(
          "h-8 w-20 rounded-lg border border-neutral-700 bg-neutral-800 px-2 text-center text-sm",
          "text-neutral-100 placeholder:text-neutral-500",
          "focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all [appearance:textfield]",
          "[&::-webkit-inner-spin-button]:appearance-none",
          "[&::-webkit-outer-spin-button]:appearance-none",
        )}
      />

      {habit.targetValue != null && (
        <span className="text-xs text-neutral-500">
          / {habit.targetValue}
          {habit.targetUnit && <span className="ml-1">{habit.targetUnit}</span>}
        </span>
      )}
    </div>
  );
}
