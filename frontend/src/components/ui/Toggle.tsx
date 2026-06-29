"use client";

import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function Toggle({
  checked,
  onCheckedChange,
  disabled,
  size = "md",
  className,
}: ToggleProps) {
  const sizes = {
    sm: {
      root: "w-9 h-5",
      thumb: "h-3.5 w-3.5 data-[state=checked]:translate-x-4",
    },
    md: {
      root: "w-11 h-6",
      thumb: "h-4 w-4 data-[state=checked]:translate-x-5",
    },
  };

  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        checked ? "bg-violet-600" : "bg-neutral-700",
        sizes[size].root,
        className,
      )}
    >
      <RadixSwitch.Thumb
        className={cn(
          "block rounded-full bg-white shadow-sm",
          "transition-transform duration-200 translate-x-1",
          sizes[size].thumb,
        )}
      />
    </RadixSwitch.Root>
  );
}
