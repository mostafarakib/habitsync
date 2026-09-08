"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Archive, Menu, X } from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Stats", href: "/stats", icon: BarChart3 },
  { label: "Archived", href: "/habits/archived", icon: Archive },
];

export function Sidebar() {
  const { isExpanded, toggle, close } = useSidebarStore();
  const pathname = usePathname();

  function isActive(href: string) {
    return (
      pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
    );
  }

  function handleNavClick() {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      close();
    }
  }

  return (
    <>
      {/* Mobile overlay backdrop, only when expanded */}
      {isExpanded && (
        <div
          onClick={close}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "flex flex-col shrink-0 self-stretch border-r border-neutral-800 bg-neutral-950 transition-all duration-200",
          "lg:flex lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)]", // 3.5rem = Header's h-14
          isExpanded ? "lg:w-60" : "lg:w-16",
          isExpanded
            ? "fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] flex lg:static lg:z-auto lg:max-w-none lg:inset-auto"
            : "hidden lg:flex",
        )}
      >
        {/* Mobile-only header row inside the drawer, mirrors the app's top bar */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-neutral-800 shrink-0">
          <span className="text-sm font-semibold text-neutral-100">Menu</span>
          <button
            onClick={close}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Desktop-only collapse toggle */}
        <div
          className={cn(
            "hidden lg:flex items-center h-12 shrink-0",
            isExpanded ? "justify-between px-4" : "justify-center",
          )}
        >
          {isExpanded && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-600">
              Menu
            </span>
          )}
          <button
            onClick={toggle}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-100 hover:bg-neutral-900 transition-colors"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={15} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 pt-2 lg:pt-0 overflow-y-auto flex-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  !isExpanded && "lg:justify-center lg:px-0",
                  active
                    ? "bg-violet-600/15 text-violet-400"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900",
                )}
              >
                <Icon size={17} className="shrink-0" />
                {isExpanded && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
