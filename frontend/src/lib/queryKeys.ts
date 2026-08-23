export const queryKeys = {
  // auth
  auth: {
    currentUser: ["auth", "currentUser"] as const,
  },

  // habits
  habits: {
    all: ["habits"] as const,
    detail: (id: string) => ["habits", id] as const,
  },

  // logs
  logs: {
    day: (date: string) => ["logs", "day", date] as const,
    habit: (habitId: string) => ["logs", "habit", habitId] as const,
    dateRange: (startDate: string, endDate: string) =>
      ["logs", "dateRange", startDate, endDate] as const,
  },

  // Streaks
  streaks: {
    detail: (habitId: string) => ["streaks", habitId] as const,
  },

  // tasks
  tasks: {
    all: (completed?: boolean) =>
      completed === undefined
        ? (["tasks"] as const)
        : (["tasks", completed] as const),
    detail: (id: string) => ["tasks", "detail", id] as const,
  },

  //stats
  stats: {
    summary: ["stats", "summary"] as const,
    habitPerformance: (period: number) =>
      ["stats", "habitPerformance", period] as const,
    heatmap: (startDate: string, endDate: string) =>
      ["stats", "heatmap", startDate, endDate] as const,
    overallStreak: ["stats", "overallStreak"] as const,
  },
} as const;
