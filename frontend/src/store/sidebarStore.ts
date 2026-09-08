import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  isExpanded: boolean;
  toggle: () => void;
  close: () => void; // used on mobile after clicking a nav link
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isExpanded: true, // default: expanded on desktop, this value also controls mobile drawer open/closed
      toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
      close: () => set({ isExpanded: false }),
    }),
    {
      name: "habitsync-sidebar-expanded",
    },
  ),
);
