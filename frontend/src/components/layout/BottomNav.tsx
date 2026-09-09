"use client";

import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck, ListTodo } from "lucide-react";
import { useTabStore } from "@/store/tabStore";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTab, setActiveTab } = useTabStore();

  const onDashboard = pathname === "/dashboard";

  function goToTab(tab: "habits" | "tasks") {
    setActiveTab(tab);
    if (!onDashboard) router.push("/dashboard");
  }

  return (
    <nav className="lg:hidden fixed bottom-4 left-0 right-0 z-30 px-4">
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
