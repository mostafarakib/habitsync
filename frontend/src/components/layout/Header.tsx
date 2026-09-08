"use client";

import { Flame, LogOut, Menu } from "lucide-react";
import { useCurrentUser, useLogout } from "@/lib/hooks/useAuth";
import { useSidebarStore } from "@/store/sidebarStore";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";

export function Header() {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();
  const { toggle } = useSidebarStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile-only hamburger trigger */}
        <button
          onClick={toggle}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Flame size={18} className="text-violet-500" />
          <h1 className="text-base font-semibold tracking-tight text-neutral-100">
            HabitSync
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <span className="text-sm text-neutral-500 hidden sm:inline truncate max-w-35">
            {user.fullName}
          </span>
        )}

        <DropdownMenu
          trigger={
            <button
              className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
              aria-label="Account menu"
            >
              <div className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-medium text-neutral-300">
                {user?.fullName?.[0]?.toUpperCase() ?? "U"}
              </div>
            </button>
          }
        >
          <DropdownMenuItem
            destructive
            disabled={isPending}
            onClick={() => logout()}
          >
            <LogOut size={14} />
            {isPending ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
