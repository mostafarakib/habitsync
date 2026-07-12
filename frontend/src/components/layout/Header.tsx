import { useCurrentUser, useLogout } from "@/lib/hooks/useAuth";
import { Flame, LogOut, Archive, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/DropdownMenu";
import Link from "next/link";

export function Header() {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <Flame size={18} className="text-violet-500" />
        <h1 className="text-base font-semibold tracking-tight text-neutral-100">
          HabitSync
        </h1>
      </Link>

      {/* Username + Dropdown */}
      <div className="flex items-center gap-2">
        {user && (
          <span className="text-sm text-neutral-400 hidden sm:inline">
            {user.fullName}
          </span>
        )}

        <DropdownMenu
          trigger={
            <button
              className="h-8 w-8 flex items-center justify-center rounded-lg
                text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800
                transition-colors focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-violet-500"
              aria-label="Open menu"
            >
              <MoreVertical size={16} />
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

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Account</DropdownMenuLabel>

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
