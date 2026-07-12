"use client";

import * as Radix from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils/cn";

// ── Root ──────────────────────────────────────────────────────────────────────

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function DropdownMenu({
  trigger,
  children,
  align = "end",
}: DropdownMenuProps) {
  return (
    <Radix.Root>
      <Radix.Trigger asChild>{trigger}</Radix.Trigger>

      <Radix.Portal>
        <Radix.Content
          align={align}
          sideOffset={8}
          className={cn(
            "z-50 min-w-45 rounded-xl p-1.5",
            "bg-neutral-900 border border-neutral-800",
            "shadow-xl shadow-black/40",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2",
          )}
        >
          {children}
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}

// ── Item ──────────────────────────────────────────────────────────────────────

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  destructive,
  disabled,
  className,
}: DropdownMenuItemProps) {
  return (
    <Radix.Item
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer",
        "outline-none transition-colors select-none",
        "data-highlighted:bg-neutral-800",
        destructive
          ? "text-red-400 data-highlighted:text-red-300"
          : "text-neutral-300 data-highlighted:text-neutral-100",
        disabled && "opacity-40 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </Radix.Item>
  );
}

// ── Separator ─────────────────────────────────────────────────────────────────

export function DropdownMenuSeparator() {
  return <Radix.Separator className="my-1 h-px bg-neutral-800" />;
}

// ── Label ─────────────────────────────────────────────────────────────────────

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <Radix.Label className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
      {children}
    </Radix.Label>
  );
}
