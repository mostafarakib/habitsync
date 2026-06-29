"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useId } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function Select({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  label,
  disabled,
  error,
  className,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-neutral-300"
        >
          {label}
        </label>
      )}

      <RadixSelect.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <RadixSelect.Trigger
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "flex items-center justify-between w-full h-10 px-3 rounded-lg text-sm",
            "bg-neutral-800 border border-neutral-700",
            "text-neutral-100 transition-colors outline-none",
            "hover:border-neutral-600",
            "focus:border-violet-500 focus:ring-1 focus:ring-violet-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "data-[placeholder]:text-neutral-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className,
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />

          <RadixSelect.Icon>
            <ChevronDown size={14} className="text-neutral-400" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className={cn(
              "z-50 w-[var(--radix-select-trigger-width)]",
              "rounded-lg p-1 shadow-xl",
              "bg-neutral-800 border border-neutral-700",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md",
                    "text-sm text-neutral-100 cursor-pointer outline-none",
                    "data-[highlighted]:bg-neutral-700",
                    "data-[state=checked]:text-violet-400",
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>

                  <RadixSelect.ItemIndicator>
                    <Check size={12} />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p id={errorId} className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
