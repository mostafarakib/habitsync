export interface StatsSummary {
  overallCompletionRate: number; // 0-100
  currentStreak: number;
  bestStreak: number;
  completedCount: number; // last 30 days
  activeHabitCount: number;
}

export interface HabitPerformance {
  habitId: string;
  title: string;
  category?: string;
  completionRate: number; // 0-100, for the selected period
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number; // all-time
}

export type TrendPeriod = 30 | 60 | 90;

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  percent: number | null; // null = rest day, nothing scheduled
  scheduledCount: number;
  value?: number | null;
  targetValue?: number | null;
}
