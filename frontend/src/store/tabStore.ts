import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DashboardTab = "habits" | "tasks";

interface TabStore {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  reset: () => void;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set) => ({
      activeTab: "habits",
      setActiveTab: (tab) => set({ activeTab: tab }),
      reset: () => set({ activeTab: "habits" }),
    }),
    {
      name: "habitsync-active-tab", // localStorage key
    },
  ),
);
