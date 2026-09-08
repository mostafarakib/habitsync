import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  isExpanded: boolean;
  toggle: () => void;
  close: () => void;
}

function getDefaultExpanded(): boolean {
  if (typeof window === "undefined") return true; // SSR fallback, doesn't matter, client takes over
  return window.matchMedia("(min-width: 1024px)").matches; // lg breakpoint
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isExpanded: getDefaultExpanded(),
      toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
      close: () => set({ isExpanded: false }),
    }),
    {
      name: "habitsync-sidebar-expanded",
    },
  ),
);
