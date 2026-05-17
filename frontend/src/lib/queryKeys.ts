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
} as const;
