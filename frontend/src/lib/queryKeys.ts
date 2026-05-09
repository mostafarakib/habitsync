export const queryKeys = {
  // auth
  currentUser: ["currentUser"] as const,

  // habits
  habits: ["habits"] as const,
  habitById: (id: string) => ["habits", id] as const,

  // logs
  dayLogs: (date: string) => ["logs", "date", date] as const,
  habitLogs: (habitId: string) => ["logs", "habit", habitId] as const,
  dateRangeLogs: (startDate: string, endDate: string) =>
    ["logs", "dateRange", startDate, endDate] as const,

  // Streaks
  HabitStreak: (habitId: string) => ["streak", habitId] as const,
} as const;
