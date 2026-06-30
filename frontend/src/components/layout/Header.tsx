import { useCurrentUser, useLogout } from "@/lib/hooks/useAuth";
import { Flame, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Flame size={18} className="text-violet-500" />
        <h1 className="text-base font-semibold tracking-tight text-neutral-100">
          HabitSync
        </h1>
      </div>

      {/* User + Logout */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-neutral-400 hidden sm:inline">
            {user.fullName}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          loading={isPending}
          onClick={() => logout()}
          aria-label="Logout"
          title="Logout"
        >
          {!isPending && <LogOut size={16} />}
        </Button>
      </div>
    </header>
  );
}
