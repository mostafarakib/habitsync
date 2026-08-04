"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/useTasks";
import { cn } from "@/lib/utils/cn";
import type { CreateTaskPayload, Task } from "@/types";

const CATEGORY_OPTIONS = [
  { value: "General", label: "General" },
  { value: "Personal", label: "Personal" },
  { value: "Work", label: "Work" },
  { value: "Errands", label: "Errands" },
  { value: "Health", label: "Health" },
  { value: "Finance", label: "Finance" },
  { value: "Other", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

interface FormValues {
  title: string;
  description: string;
  category: string;
  priority: "low" | "normal" | "high";
  dueDate: string;
}

interface TaskFormProps {
  onSuccess?: () => void;
  task?: Task; // if provided → edit mode
}

export function TaskForm({ onSuccess, task }: TaskFormProps) {
  const isEditMode = !!task;
  const [hasDueDate, setHasDueDate] = useState(!!task?.dueDate);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      category: task?.category ?? "General",
      priority: task?.priority ?? "normal",
      dueDate: task?.dueDate ?? "",
    },
  });

  async function onSubmit(data: FormValues) {
    const payload: CreateTaskPayload = {
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      category: data.category || undefined,
      priority: data.priority,
      dueDate: hasDueDate && data.dueDate ? data.dueDate : null,
    };

    if (isEditMode && task) {
      updateTask.mutate(
        { id: task._id, data: payload },
        { onSuccess: () => onSuccess?.() },
      );
    } else {
      createTask.mutate(payload, {
        onSuccess: () => {
          reset();
          setHasDueDate(false);
          onSuccess?.();
        },
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Title */}
      <Input
        label="Task name"
        placeholder="e.g. Buy groceries"
        error={errors.title?.message}
        {...register("title", {
          required: "Task name is required",
          minLength: {
            value: 2,
            message: "Task name must be at least 2 characters",
          },
          maxLength: {
            value: 120,
            message: "Task name cannot exceed 120 characters",
          },
        })}
      />

      {/* Description */}
      <Input
        label="Description"
        placeholder="Any details? (optional)"
        maxLength={500}
        {...register("description")}
      />

      {/* Category */}
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select
            label="Category"
            value={field.value}
            onValueChange={field.onChange}
            options={CATEGORY_OPTIONS}
          />
        )}
      />

      {/* Priority */}
      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <Select
            label="Priority"
            value={field.value}
            onValueChange={field.onChange}
            options={PRIORITY_OPTIONS}
          />
        )}
      />

      {/* Due date — optional, toggled */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={hasDueDate}
            onChange={(e) => setHasDueDate(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 accent-violet-600 cursor-pointer"
          />
          <span className="text-sm font-medium text-neutral-300">
            Set a due date
          </span>
        </label>

        {hasDueDate && (
          <input
            type="date"
            className={cn(
              "w-full h-10 px-3 rounded-lg text-sm transition-all outline-none",
              "bg-neutral-800 border border-neutral-700",
              "text-neutral-100",
              "focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
              "scheme-dark",
            )}
            {...register("dueDate", {
              required: hasDueDate ? "Due date is required" : false,
            })}
          />
        )}
        {errors.dueDate && (
          <p className="text-xs text-red-400">{errors.dueDate.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isEditMode ? updateTask.isPending : createTask.isPending}
        className="w-full mt-2"
      >
        {isEditMode ? "Save changes" : "Create task"}
      </Button>
    </form>
  );
}
