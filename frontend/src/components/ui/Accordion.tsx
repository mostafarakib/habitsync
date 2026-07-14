"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AccordionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  resetKey?: string | number;
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  title,
  count,
  defaultOpen = true,
  resetKey,
  children,
  className,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [resetKey, defaultOpen]);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full py-2 px-1 group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500 group-hover:text-neutral-400 transition-colors">
            {title}
          </span>
          {count !== undefined && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-500">
              {count}
            </span>
          )}
        </div>

        <ChevronDown
          size={14}
          className={cn(
            "text-neutral-600 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Grid trick — animates height without JS measurement or scrollbar flash */}
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 pt-1 pb-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
