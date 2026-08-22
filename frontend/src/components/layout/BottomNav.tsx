"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck,
  ListTodo,
  BarChart3,
  MoreHorizontal,
  Archive,
  CalendarX,
  CircleCheck,
} from "lucide-react";
import { useTabStore } from "@/store/tabStore";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTab, setActiveTab } = useTabStore();

  const onDashboard = pathname === "/dashboard";
  const onStats = pathname === "/stats";

  function goToTab(tab: "habits" | "tasks") {
    setActiveTab(tab);
    if (!onDashboard) router.push("/dashboard");
  }

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-30 px-4">
      <div
        className="max-w-sm sm:max-w-md mx-auto flex rounded-2xl border border-neutral-800
          bg-neutral-900/95 backdrop-blur-md shadow-lg shadow-black/30 overflow-hidden"
      >
        <NavButton
          label="Habits"
          icon={<CalendarCheck size={18} />}
          active={onDashboard && activeTab === "habits"}
          onClick={() => goToTab("habits")}
        />
        <NavButton
          label="Tasks"
          icon={<ListTodo size={18} />}
          active={onDashboard && activeTab === "tasks"}
          onClick={() => goToTab("tasks")}
        />
        <NavButton
          label="Stats"
          icon={<BarChart3 size={18} />}
          active={onStats}
          onClick={() => router.push("/stats")}
        />

        {/* More — dropup */}
        <DropdownMenu
          side="top"
          align="end"
          trigger={
            <button
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
                "text-neutral-500 hover:text-neutral-300",
              )}
            >
              <MoreHorizontal size={18} />
              <span className="text-xs font-medium">More</span>
            </button>
          }
        >
          <DropdownMenuLabel>Manage</DropdownMenuLabel>

          <Link href="/habits/archived">
            <DropdownMenuItem>
              <Archive size={14} />
              Archived habits
            </DropdownMenuItem>
          </Link>

          <Link href="/habits/archived?section=ended">
            <DropdownMenuItem>
              <CalendarX size={14} />
              Ended habits
            </DropdownMenuItem>
          </Link>

          <Link href="/dashboard?tab=tasks&section=completed">
            <DropdownMenuItem onClick={() => setActiveTab("tasks")}>
              <CircleCheck size={14} />
              Completed tasks
            </DropdownMenuItem>
          </Link>
        </DropdownMenu>
      </div>
    </nav>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
        active ? "text-violet-400" : "text-neutral-500 hover:text-neutral-300",
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
