import Habit from "../models/habit.model.js";
import HabitLog from "../models/habitLog.model.js";
import { ApiError, normalizeDate, validateDateFormat } from "../utils/index.js";
import {
  isScheduledDate,
  isHabitStreakRelevant,
  computeDayScore,
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

// ── Overall streak (percentage-of-day based) ──────────────────────────────────

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

// ── Daily completion heatmap ───────────────────────────────────────────────────

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

export { getOverallStreakService, getDailyCompletionHeatmapService };
