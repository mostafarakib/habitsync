import mongoose from "mongoose";
import Habit from "../models/habit.model.js";
import HabitLog from "../models/habitLog.model.js";
import { ApiError, normalizeDate, validateDateFormat } from "../utils/index.js";
import {
  isScheduledDate,
  isHabitStreakRelevant,
  computeDayScore,
  computeHabitStreaks,
  dayCounts,
} from "../utils/streak.utils.js";

function habitExistsOn(habit, date) {
  const start = normalizeDate(habit.startDate);
  if (date < start) return false;
  if (habit.endDate) {
    const end = normalizeDate(habit.endDate);
    if (date > end) return false;
  }
  return true;
}

// Overall streak (percentage-of-day based)

const getOverallStreakService = async (userId, clientDate) => {
  const today = clientDate
    ? normalizeDate(clientDate)
    : normalizeDate(new Date());

  const habits = await Habit.find({ user: userId, archived: false }).lean();
  const relevantHabits = habits.filter(isHabitStreakRelevant);

  if (relevantHabits.length === 0) {
    return { streak: 0 };
  }

  const startBound = relevantHabits.reduce((min, h) => {
    const sd = normalizeDate(h.startDate);
    return sd < min ? sd : min;
  }, today);

  const habitIds = relevantHabits.map((h) => h._id);

  const logs = await HabitLog.find({
    user: userId,
    habit: { $in: habitIds },
    date: { $gte: startBound, $lte: today },
  })
    .select("habit date value isCompleted")
    .lean();

  const logMap = new Map();
  logs.forEach((l) => {
    const key = `${l.habit.toString()}|${normalizeDate(l.date).toISOString()}`;
    logMap.set(key, l);
  });

  function dayScoreAverage(date) {
    const scheduled = relevantHabits.filter(
      (h) => habitExistsOn(h, date) && isScheduledDate(h, date)
    );
    if (scheduled.length === 0) return null; // rest day

    const total = scheduled.reduce((sum, h) => {
      const key = `${h._id.toString()}|${date.toISOString()}`;
      const log = logMap.get(key) || null;
      return sum + computeDayScore(h, log);
    }, 0);

    return total / scheduled.length;
  }

  let streak = 0;
  let currentDate = new Date(today);

  while (currentDate >= startBound) {
    const isToday = currentDate.getTime() === today.getTime();
    const percent = dayScoreAverage(currentDate);

    if (percent !== null) {
      if (isToday) {
        if (percent >= 50) streak += 1;
      } else {
        if (percent === 0) break;
        if (percent >= 50) streak += 1;
      }
    }
    // percent === null → rest day, no effect either way

    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }

  return { streak };
};

// Daily completion heatmap

const getDailyCompletionHeatmapService = async (
  userId,
  startDate,
  endDate,
  clientDate
) => {
  if (!startDate || !endDate) {
    throw new ApiError(400, "Start date and end date are required");
  }
  if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
    throw new ApiError(400, "Invalid date format");
  }

  const today = clientDate
    ? normalizeDate(clientDate)
    : normalizeDate(new Date());

  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd =
    normalizeDate(endDate) > today ? today : normalizeDate(endDate);

  if (normalizedEnd < normalizedStart) {
    throw new ApiError(400, "End date cannot be before start date");
  }

  const habits = await Habit.find({ user: userId, archived: false }).lean();
  const relevantHabits = habits.filter(isHabitStreakRelevant);

  if (relevantHabits.length === 0) {
    return [];
  }

  const habitIds = relevantHabits.map((h) => h._id);
  const nextOfEnd = new Date(normalizedEnd);
  nextOfEnd.setUTCDate(nextOfEnd.getUTCDate() + 1);

  const logs = await HabitLog.find({
    user: userId,
    habit: { $in: habitIds },
    date: { $gte: normalizedStart, $lt: nextOfEnd },
  })
    .select("habit date isCompleted")
    .lean();

  const completedMap = new Map();
  logs.forEach((l) => {
    if (!l.isCompleted) return;
    const key = `${l.habit.toString()}|${normalizeDate(l.date).toISOString()}`;
    completedMap.set(key, true);
  });

  const result = [];
  let cursor = new Date(normalizedStart);

  while (cursor <= normalizedEnd) {
    const scheduled = relevantHabits.filter(
      (h) => habitExistsOn(h, cursor) && isScheduledDate(h, cursor)
    );

    let percent = null; // null = rest day, nothing scheduled
    if (scheduled.length > 0) {
      const completedCount = scheduled.filter((h) => {
        const key = `${h._id.toString()}|${cursor.toISOString()}`;
        return completedMap.has(key);
      }).length;
      percent = Math.round((completedCount / scheduled.length) * 100);
    }

    result.push({
      date: cursor.toISOString().split("T")[0],
      percent, // 0-100, or null for a rest day
      scheduledCount: scheduled.length,
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
};

const getStatsSummaryService = async (userId, clientDate) => {
  const today = clientDate
    ? normalizeDate(clientDate)
    : normalizeDate(new Date());

  const habits = await Habit.find({ user: userId, archived: false }).lean();
  const relevantHabits = habits.filter(isHabitStreakRelevant);

  if (relevantHabits.length === 0) {
    return {
      overallCompletionRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      completedCount: 0,
      activeHabitCount: habits.length,
    };
  }

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);

  const habitIds = relevantHabits.map((h) => h._id);

  const logs = await HabitLog.find({
    user: userId,
    habit: { $in: habitIds },
    date: { $gte: thirtyDaysAgo, $lte: today },
  })
    .select("habit date isCompleted")
    .lean();

  const logsByHabitDateKey = new Map();
  logs.forEach((l) => {
    const key = `${l.habit.toString()}|${normalizeDate(l.date).toISOString()}`;
    logsByHabitDateKey.set(key, l);
  });

  // Overall completion rate, last 30 days
  let totalScheduled = 0;
  let totalCompleted = 0;
  let completedCount = 0;

  let cursor = new Date(thirtyDaysAgo);

  while (cursor <= today) {
    relevantHabits.forEach((h) => {
      const start = normalizeDate(h.startDate);
      if (cursor < start) return;
      if (h.endDate && cursor > normalizeDate(h.endDate)) return;
      if (!isScheduledDate(h, cursor)) return;

      totalScheduled += 1;
      const key = `${h._id.toString()}|${cursor.toISOString()}`;
      const log = logsByHabitDateKey.get(key);
      if (log?.isCompleted) {
        totalCompleted += 1;
        completedCount += 1;
      }
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const overallCompletionRate =
    totalScheduled === 0
      ? 0
      : Math.round((totalCompleted / totalScheduled) * 100);

  // Overall current + best streak
  // Reuse full-history logs per habit to compute per-habit streaks, then combine into a single "overall" streak using the same day-score-average approach as getOverallStreakService, but we also want a "best" version.

  const startBound = relevantHabits.reduce((min, h) => {
    const sd = normalizeDate(h.startDate);
    return sd < min ? sd : min;
  }, today);

  const fullLogs = await HabitLog.find({
    user: userId,
    habit: { $in: habitIds },
    date: { $gte: startBound, $lte: today },
  })
    .select("habit date value isCompleted")
    .lean();

  const fullLogsByHabitDateKey = new Map();
  fullLogs.forEach((l) => {
    const key = `${l.habit.toString()}|${normalizeDate(l.date).toISOString()}`;
    fullLogsByHabitDateKey.set(key, l);
  });

  function habitExistsOn(habit, date) {
    const start = normalizeDate(habit.startDate);
    if (date < start) return false;
    if (habit.endDate && date > normalizeDate(habit.endDate)) return false;
    return true;
  }

  function dayScoreAverage(date) {
    const scheduled = relevantHabits.filter(
      (h) => habitExistsOn(h, date) && isScheduledDate(h, date)
    );
    if (scheduled.length === 0) return null;

    const total = scheduled.reduce((sum, h) => {
      const key = `${h._id.toString()}|${date.toISOString()}`;
      const log = fullLogsByHabitDateKey.get(key) || null;
      return sum + computeDayScore(h, log);
    }, 0);

    return total / scheduled.length;
  }

  // current streak, backward from today
  let currentStreak = 0;
  let cur = new Date(today);
  while (cur >= startBound) {
    const isToday = cur.getTime() === today.getTime();
    const percent = dayScoreAverage(cur);

    if (percent !== null) {
      if (isToday) {
        if (percent >= 50) currentStreak += 1;
      } else {
        if (percent === 0) break;
        if (percent >= 50) currentStreak += 1;
      }
    }
    cur.setUTCDate(cur.getUTCDate() - 1);
  }

  // best streak, forward scan across full history
  let bestStreak = 0;
  let running = 0;
  let fwd = new Date(startBound);
  while (fwd <= today) {
    const percent = dayScoreAverage(fwd);
    if (percent !== null) {
      if (percent === 0) {
        running = 0;
      } else if (percent >= 50) {
        running += 1;
        if (running > bestStreak) bestStreak = running;
      }
    }
    fwd.setUTCDate(fwd.getUTCDate() + 1);
  }

  return {
    overallCompletionRate,
    currentStreak,
    bestStreak,
    completedCount,
    activeHabitCount: relevantHabits.length,
  };
};

// Per-habit performance list

const getHabitPerformanceService = async (userId, period, clientDate) => {
  const validPeriods = [30, 60, 90];
  const days = validPeriods.includes(Number(period)) ? Number(period) : 30;

  const today = clientDate
    ? normalizeDate(clientDate)
    : normalizeDate(new Date());

  const periodStart = new Date(today);
  periodStart.setUTCDate(periodStart.getUTCDate() - (days - 1));

  const habits = await Habit.find({ user: userId, archived: false }).lean();
  const relevantHabits = habits.filter(isHabitStreakRelevant);

  if (relevantHabits.length === 0) return [];

  const habitIds = relevantHabits.map((h) => h._id);

  // Full history needed for accurate streak + all-time completed count
  const allLogs = await HabitLog.find({
    user: userId,
    habit: { $in: habitIds },
  })
    .select("habit date value isCompleted")
    .lean();

  const logsByHabit = new Map();
  allLogs.forEach((l) => {
    const hid = l.habit.toString();
    if (!logsByHabit.has(hid)) logsByHabit.set(hid, new Map());
    const key = normalizeDate(l.date).toISOString();
    logsByHabit.get(hid).set(key, l);
  });

  const results = relevantHabits.map((habit) => {
    const hid = habit._id.toString();
    const logsByDateKey = logsByHabit.get(hid) || new Map();

    const habitStart = normalizeDate(habit.startDate);
    const effectivePeriodStart =
      habitStart > periodStart ? habitStart : periodStart;

    // completion rate over the selected period
    let scheduled = 0;
    let completed = 0;
    let cursor = new Date(effectivePeriodStart);

    while (cursor <= today) {
      if (habit.endDate && cursor > normalizeDate(habit.endDate)) break;
      if (isScheduledDate(habit, cursor)) {
        scheduled += 1;
        const key = cursor.toISOString();
        const log = logsByDateKey.get(key);
        if (dayCounts(habit, log)) completed += 1;
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const completionRate =
      scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);

    // all-time total completed occurrences
    const totalCompleted = allLogs.filter(
      (l) => l.habit.toString() === hid && dayCounts(habit, l)
    ).length;

    // streaks, full history
    const overallStartBound = habitStart;
    const { current, best } = computeHabitStreaks(
      habit,
      logsByDateKey,
      overallStartBound,
      today
    );

    return {
      habitId: hid,
      title: habit.title,
      category: habit.category,
      completionRate,
      currentStreak: current,
      bestStreak: best,
      totalCompleted,
    };
  });

  // sort by completion rate, highest first
  results.sort((a, b) => b.completionRate - a.completionRate);

  return results;
};

const getHabitHeatmapService = async (
  userId,
  habitId,
  startDate,
  endDate,
  clientDate
) => {
  if (!habitId) {
    throw new ApiError(400, "Habit ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(habitId)) {
    throw new ApiError(400, "Invalid Habit ID");
  }
  if (!startDate || !endDate) {
    throw new ApiError(400, "Start date and end date are required");
  }
  if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
    throw new ApiError(400, "Invalid date format");
  }

  const habit = await Habit.findOne({ _id: habitId, user: userId }).lean();
  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  const today = clientDate
    ? normalizeDate(clientDate)
    : normalizeDate(new Date());

  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd =
    normalizeDate(endDate) > today ? today : normalizeDate(endDate);

  if (normalizedEnd < normalizedStart) {
    throw new ApiError(400, "End date cannot be before start date");
  }

  const nextOfEnd = new Date(normalizedEnd);
  nextOfEnd.setUTCDate(nextOfEnd.getUTCDate() + 1);

  const logs = await HabitLog.find({
    user: userId,
    habit: habitId,
    date: { $gte: normalizedStart, $lt: nextOfEnd },
  })
    .select("date value isCompleted")
    .lean();

  const logsByDateKey = new Map();
  logs.forEach((l) => {
    logsByDateKey.set(normalizeDate(l.date).toISOString(), l);
  });

  function habitExistsOn(date) {
    const start = normalizeDate(habit.startDate);
    if (date < start) return false;
    if (habit.endDate && date > normalizeDate(habit.endDate)) return false;
    return true;
  }

  const result = [];
  let cursor = new Date(normalizedStart);

  while (cursor <= normalizedEnd) {
    let percent = null; // rest day / not scheduled / doesn't exist yet
    let value = null;
    let targetValue = null;

    if (habitExistsOn(cursor) && isScheduledDate(habit, cursor)) {
      const log = logsByDateKey.get(cursor.toISOString()) || null;
      percent = Math.round(computeDayScore(habit, log));
      value = log?.value ?? null;
      targetValue =
        habit.evaluationType === "measurable" ? habit.targetValue : null;
    }

    result.push({
      date: cursor.toISOString().split("T")[0],
      percent,
      scheduledCount:
        habitExistsOn(cursor) && isScheduledDate(habit, cursor) ? 1 : 0,
      value,
      targetValue,
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
};

export {
  getOverallStreakService,
  getDailyCompletionHeatmapService,
  getStatsSummaryService,
  getHabitPerformanceService,
  getHabitHeatmapService,
};
