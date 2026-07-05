"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { useCreateHabit } from "@/lib/hooks/useHabits";
import { toApiDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { CreateHabitPayload } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = [
  { short: "S", label: "Sunday", value: 0 },
  { short: "M", label: "Monday", value: 1 },
  { short: "T", label: "Tuesday", value: 2 },
  { short: "W", label: "Wednesday", value: 3 },
  { short: "T", label: "Thursday", value: 4 },
  { short: "F", label: "Friday", value: 5 },
  { short: "S", label: "Saturday", value: 6 },
];

const CATEGORY_OPTIONS = [
  { value: "Health", label: "Health" },
  { value: "Fitness", label: "Fitness" },
  { value: "Learning", label: "Learning" },
  { value: "Mindfulness", label: "Mindfulness" },
  { value: "Productivity", label: "Productivity" },
  { value: "Finance", label: "Finance" },
  { value: "Social", label: "Social" },
  { value: "Other", label: "Other" },
];

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const TARGET_TYPE_OPTIONS = [
  { value: "atLeast", label: "At least" },
  { value: "atMost", label: "At most" },
  { value: "lessThan", label: "Less than" },
  { value: "exactly", label: "Exactly" },
];

// ── Form values ───────────────────────────────────────────────────────────────

interface FormValues {
  title: string;
  description: string;
  category: string;
  frequencyType: "daily" | "weekly" | "monthly";
  evaluationType: "boolean" | "measurable";
  targetType: "atLeast" | "atMost" | "lessThan" | "exactly";
  targetValue: string;
  targetUnit: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface HabitFormProps {
  onSuccess?: () => void;
}

export function HabitForm({ onSuccess }: HabitFormProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [daysError, setDaysError] = useState("");

  const createHabit = useCreateHabit();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      frequencyType: "daily",
      evaluationType: "boolean",
      targetType: "atLeast",
      targetValue: "",
      targetUnit: "",
    },
  });

  const frequencyType = useWatch({
    control,
    name: "frequencyType",
  });

  const evaluationType = useWatch({
    control,
    name: "evaluationType",
  });

  function toggleDay(day: number) {
    setDaysError("");

    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b),
    );
  }

  async function onSubmit(data: FormValues) {
    if (data.frequencyType === "weekly" && selectedDays.length === 0) {
      setDaysError("Please select at least one day.");
      return;
    }

    const payload: CreateHabitPayload = {
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      category: data.category || undefined,
      startDate: toApiDate(new Date()),
      frequency: {
        type: data.frequencyType,
        daysOfWeek: data.frequencyType === "weekly" ? selectedDays : undefined,
      },
      evaluationType: data.evaluationType,
      targetType:
        data.evaluationType === "measurable" ? data.targetType : undefined,
      targetValue:
        data.evaluationType === "measurable" && data.targetValue
          ? Number(data.targetValue)
          : undefined,
      targetUnit:
        data.evaluationType === "measurable" && data.targetUnit
          ? data.targetUnit.trim()
          : undefined,
    };

    createHabit.mutate(payload, {
      onSuccess: () => {
        reset();
        setSelectedDays([]);
        setDaysError("");
        onSuccess?.();
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Title */}
      <Input
        label="Habit name"
        placeholder="e.g. Morning run"
        error={errors.title?.message}
        {...register("title", {
          required: "Habit name is required",
          minLength: {
            value: 2,
            message: "Habit name must be at least 2 characters",
          },
          maxLength: {
            value: 100,
            message: "Habit name cannot exceed 100 characters",
          },
        })}
      />

      {/* Description */}
      <Input
        label="Description"
        placeholder="What's the goal? (optional)"
        maxLength={200}
        {...register("description")}
      />

      {/* Category */}
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select
            label="Category"
            placeholder="Pick a category…"
            value={field.value}
            onValueChange={field.onChange}
            options={CATEGORY_OPTIONS}
          />
        )}
      />

      {/* Frequency */}
      <Controller
        name="frequencyType"
        control={control}
        render={({ field }) => (
          <Select
            label="Frequency"
            value={field.value}
            onValueChange={field.onChange}
            options={FREQUENCY_OPTIONS}
          />
        )}
      />

      {/* Day picker — weekly only */}
      {frequencyType === "weekly" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-neutral-300">Which days?</p>
          <div className="flex gap-2">
            {DAYS.map((day) => {
              const active = selectedDays.includes(day.value);

              return (
                <button
                  key={day.value}
                  type="button"
                  title={day.label}
                  aria-label={day.label}
                  aria-pressed={active}
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "h-9 w-9 rounded-full text-xs font-semibold transition-all",
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-500",
                  )}
                >
                  {day.short}
                </button>
              );
            })}
          </div>

          {daysError && <p className="text-xs text-red-400">{daysError}</p>}
        </div>
      )}

      {/* Evaluation type toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-medium text-neutral-300">Measurable</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track a number instead of yes / no
          </p>
        </div>

        <Controller
          name="evaluationType"
          control={control}
          render={({ field }) => (
            <Toggle
              checked={field.value === "measurable"}
              onCheckedChange={(checked) =>
                field.onChange(checked ? "measurable" : "boolean")
              }
            />
          )}
        />
      </div>

      {/* Measurable fields */}
      {evaluationType === "measurable" && (
        <div className="flex flex-col gap-4">
          <Controller
            name="targetType"
            control={control}
            render={({ field }) => (
              <Select
                label="Target type"
                value={field.value}
                onValueChange={field.onChange}
                options={TARGET_TYPE_OPTIONS}
              />
            )}
          />

          <div className="flex gap-3">
            <Input
              label="Target value"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="e.g. 8"
              className="flex-1"
              error={errors.targetValue?.message}
              {...register("targetValue", {
                required: "Target value is required",
                valueAsNumber: false,

                validate: (value) => {
                  const num = Number(value);

                  if (Number.isNaN(num)) {
                    return "Enter a valid number";
                  }

                  if (num <= 0) {
                    return "Target must be greater than 0";
                  }

                  return true;
                },
              })}
            />

            <Input
              label="Unit"
              placeholder="e.g. glasses"
              className="flex-1"
              {...register("targetUnit")}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={createHabit.isPending}
        className="w-full mt-2"
      >
        Create habit
      </Button>
    </form>
  );
}
