"use client";

import { Flame, MessageSquare, CircleCheck, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ── Browser frame wrapper ──────────────────────────────────────────────────────

export function BrowserFrame({
  children,
  url = "habitsyncweb.vercel.app",
  className,
}: {
  children: React.ReactNode;
  url?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/50",
        className,
      )}
    >
      {/* Chrome */}
      <div className="flex items-center gap-3 px-4 h-10 bg-neutral-900 border-b border-neutral-800">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 rounded-md bg-neutral-800 text-[10px] text-neutral-500">
            {url}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-neutral-950">{children}</div>
    </div>
  );
}

// ── Phone frame wrapper ─────────────────────────────────────────────────────────

export function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[2.5rem] border-[6px] border-neutral-800 bg-neutral-900 shadow-2xl shadow-black/50 overflow-hidden w-70",
        className,
      )}
    >
      <div className="relative bg-neutral-950">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-neutral-800 rounded-b-2xl z-10" />
        {children}
      </div>
    </div>
  );
}

// ── Fake dashboard preview ───────────────────────────────────────────────────────

const MOCK_HABITS = [
  { title: "Drink water", category: "Health", done: true, streak: 12 },
  { title: "Read 20 pages", category: "Learning", done: true, streak: 8 },
  { title: "Morning workout", category: "Fitness", done: false, streak: 5 },
  { title: "No sugar", category: "Health", done: false, streak: 3 },
];

export function DashboardMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("p-5 flex flex-col gap-3", compact && "p-4 gap-2")}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-violet-500" />
          <span className="text-xs font-semibold text-neutral-200">
            HabitSync
          </span>
        </div>
        <div className="h-6 w-6 rounded-full bg-neutral-800" />
      </div>

      {/* Date nav */}
      <div className="flex items-center justify-between px-1">
        <span className="text-neutral-600 text-xs">‹</span>
        <span className="text-xs font-medium text-neutral-200">Today</span>
        <span className="text-neutral-600 text-xs">›</span>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-neutral-100">2 of 4 done</p>
          <p className="text-[10px] text-neutral-600">4 scheduled today</p>
        </div>
        <div className="w-14 h-1 rounded-full bg-neutral-800 overflow-hidden">
          <div className="h-full w-1/2 bg-violet-600 rounded-full" />
        </div>
      </div>

      {/* Habit rows */}
      <div className="flex flex-col gap-1.5">
        {MOCK_HABITS.map((habit, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2",
              habit.done
                ? "bg-neutral-800/60 border-violet-500/20"
                : "bg-neutral-900 border-neutral-800",
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p
                  className={cn(
                    "text-[11px] font-medium truncate",
                    habit.done ? "text-neutral-200" : "text-neutral-400",
                  )}
                >
                  {habit.title}
                </p>
                <span className="shrink-0 text-[8px] px-1 py-0.5 rounded bg-neutral-800 text-neutral-500 uppercase tracking-wide">
                  {habit.category}
                </span>
              </div>
            </div>

            {habit.streak > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 shrink-0">
                <Flame size={9} className="text-amber-400" />
                <span className="text-[9px] font-semibold text-amber-400">
                  {habit.streak}
                </span>
              </div>
            )}

            <div
              className={cn(
                "shrink-0 h-4 w-7 rounded-full flex items-center px-0.5 transition-colors",
                habit.done
                  ? "bg-violet-600 justify-end"
                  : "bg-neutral-700 justify-start",
              )}
            >
              <div className="h-3 w-3 rounded-full bg-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fake habit creation form preview ─────────────────────────────────────────────

export function HabitFormMockup() {
  return (
    <div className="p-5 flex flex-col gap-3">
      <p className="text-xs font-semibold text-neutral-200 mb-1">New Habit</p>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-neutral-500">Habit name</span>
        <div className="h-8 rounded-lg bg-neutral-800 border border-neutral-700 px-2.5 flex items-center">
          <span className="text-[11px] text-neutral-300">Evening walk</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-neutral-500">Category</span>
          <div className="h-8 rounded-lg bg-neutral-800 border border-neutral-700 px-2.5 flex items-center">
            <span className="text-[11px] text-neutral-300">Fitness</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-neutral-500">Frequency</span>
          <div className="h-8 rounded-lg bg-neutral-800 border border-neutral-700 px-2.5 flex items-center">
            <span className="text-[11px] text-neutral-300">Weekly</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-neutral-500">Which days?</span>
        <div className="flex gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-semibold",
                [1, 3, 5].includes(i)
                  ? "bg-violet-600 text-white"
                  : "bg-neutral-800 text-neutral-500 border border-neutral-700",
              )}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      <div className="h-8 rounded-lg bg-violet-600 flex items-center justify-center mt-1">
        <span className="text-[11px] font-medium text-white">Create habit</span>
      </div>
    </div>
  );
}

// ── Contribution calendar mockup ─────────────────────────────────────────────────

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function CalendarMockup({ animate = true }: { animate?: boolean }) {
  const weeks = 14;
  const days = 7;

  return (
    <div className="p-5">
      <div className="flex gap-1">
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-1">
            {Array.from({ length: days }).map((_, d) => {
              const seed = w * 7 + d;
              const rand = seededRandom(seed);
              let bg = "bg-neutral-800/60 border border-neutral-800";
              if (rand > 0.75) bg = "bg-green-500";
              else if (rand > 0.55) bg = "bg-green-700";
              else if (rand > 0.4) bg = "bg-green-900";

              return (
                <div
                  key={d}
                  className={cn(
                    "h-3 w-3 rounded-sm transition-all duration-500",
                    bg,
                    animate && "opacity-0 scale-75 animate-cell-in",
                  )}
                  style={
                    animate
                      ? {
                          animationDelay: `${seed * 6}ms`,
                          animationFillMode: "forwards",
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Task list mockup ─────────────────────────────────────────────────────────────

const MOCK_TASKS = [
  { title: "Renew car registration", done: false, overdue: true },
  { title: "Book dentist appointment", done: false, overdue: false },
  { title: "Buy birthday gift", done: false, overdue: false },
  { title: "Submit tax documents", done: true, overdue: false },
];

export function TaskMockup() {
  return (
    <div className="p-5 flex flex-col gap-2">
      <p className="text-xs font-semibold text-neutral-200 mb-1">Tasks</p>

      {MOCK_TASKS.map((task, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
            task.done
              ? "bg-neutral-900/50 border-neutral-800/50"
              : task.overdue
                ? "bg-red-500/5 border-red-500/20"
                : "bg-neutral-900 border-neutral-800",
          )}
        >
          {task.done ? (
            <CircleCheck
              size={15}
              className="text-violet-500 shrink-0"
              fill="currentColor"
            />
          ) : (
            <Circle size={15} className="text-neutral-600 shrink-0" />
          )}

          <span
            className={cn(
              "text-[11px] flex-1 truncate",
              task.done ? "text-neutral-500 line-through" : "text-neutral-200",
            )}
          >
            {task.title}
          </span>

          {task.overdue && (
            <span className="text-[9px] font-medium text-red-400 shrink-0">
              Overdue
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Notes mockup snippet ─────────────────────────────────────────────────────────

export function NotesMockup() {
  return (
    <div className="p-5">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <MessageSquare size={12} className="text-violet-400" />
          <span className="text-[10px] font-medium text-neutral-300">
            Notes · Morning workout
          </span>
        </div>
        <div className="rounded-lg bg-neutral-800 border border-neutral-700 px-2.5 py-2">
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Felt strong today, increased reps on squats. Legs a bit sore from
            yesterday but pushed through.
          </p>
        </div>
      </div>
    </div>
  );
}
