import mongoose from "mongoose";
import Habit from "../models/habit.model.js";
import HabitLog from "../models/habitLog.model.js";
import {
  ApiError,
  calculateHabitCompletion,
  normalizeDate,
  validateHabitLogValue,
  validateHabitLogWriteAllowed,
  validateDateFormat,
} from "../utils/index.js";

// Create or update a habit log for a specific date
const upsertHabitLogService = async (
  userId,
  habitId,
  date,
  value,
  notes,
  clientDate
) => {
  if (!habitId) {
    throw new ApiError(400, "Habit ID is required");
  }
  if (date === undefined) {
    throw new ApiError(400, "Date is required");
  }
  if (value === undefined) {
    throw new ApiError(400, "Value is required");
  }

  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  // validate if the value is valid
  validateHabitLogValue(habit, value);

  // validate if the log date is within allowed range (not in the future and not more than 30 days old)
  validateHabitLogWriteAllowed(date, clientDate);

  if (habit.archived) {
    throw new ApiError(400, "Cannot log an archived habit");
  }

  // normalize the date to midnight for consistent querying
  const normalizedDate = normalizeDate(date);

  const isCompleted = calculateHabitCompletion(habit, value);

  const updateFields = {
    user: userId,
    value,
    isCompleted,
  };

  if (notes !== undefined) {
    updateFields.notes = notes;
  }

  const habitLog = await HabitLog.findOneAndUpdate(
    {
      habit: habitId,
      date: normalizedDate,
    },
    { $set: updateFields },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return habitLog;
};

// Service to bulk upsert habit logs
const bulkUpsertHabitLogsService = async (userId, logs) => {
  if (!Array.isArray(logs) || logs.length === 0) {
    throw new ApiError(400, "Logs array is required and cannot be empty");
  }

  const results = await Promise.all(
    logs.map(async ({ habitId, date, value, notes }) => {
      if (!habitId || !date) {
        throw new ApiError(400, "habitId and date are required");
      }
      return upsertHabitLogService(userId, habitId, date, value, notes);
    })
  );

  return results;
};

const getHabitLogsByDateService = async (userId, date, clientDate) => {
  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  if (!validateDateFormat(date)) {
    throw new ApiError(400, "Invalid date format");
  }

  // normalize the date
  const normalizedDate = normalizeDate(date);

  const today = clientDate
    ? normalizeDate(clientDate)
    : normalizeDate(new Date());

  if (normalizedDate > today) {
    throw new ApiError(400, "Cannot retrieve logs for future dates");
  }

  const nextDate = new Date(normalizedDate);
  nextDate.setDate(nextDate.getDate() + 1);

  // fetch active habits for that date

  const habits = await Habit.find({
    user: userId,
    archived: false,

    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: normalizedDate } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: normalizedDate } },
        ],
      },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();

  // fetch logs for those habits on that date

  const logs = await HabitLog.find({
    user: userId,
    date: {
      $gte: normalizedDate,
      $lt: nextDate,
    },
  }).lean();

  // map logs by habit ID for easy lookup
  const logMap = new Map();
  logs.forEach((log) => {
    logMap.set(log.habit.toString(), log);
  });

  // period ranges for flexible/monthly habits

  // Week range — Sunday to Saturday containing the requested date
  const dayOfWeek = normalizedDate.getUTCDay(); // 0 = Sunday

  const weekStart = new Date(normalizedDate);
  weekStart.setUTCDate(normalizedDate.getUTCDate() - dayOfWeek); // back to Sunday

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7); // next Sunday (exclusive)

  // Month range — first to last day of the month
  const monthStart = new Date(
    Date.UTC(normalizedDate.getUTCFullYear(), normalizedDate.getUTCMonth(), 1)
  );

  const monthEnd = new Date(
    Date.UTC(
      normalizedDate.getUTCFullYear(),
      normalizedDate.getUTCMonth() + 1,
      1
    )
  ); // first day of next month (exclusive)

  // Identify which habits need period completion checks
  const flexibleWeeklyHabitIds = habits
    .filter((h) => h.frequency.type === "weekly" && h.frequency.flexible)
    .map((h) => h._id);

  const monthlyHabitIds = habits
    .filter((h) => h.frequency.type === "monthly")
    .map((h) => h._id);

  // Fetch completed logs for flexible weekly habits in the current week
  // Fetch all logs (not just completed) for flexible weekly habits in current week
  // sorted by date desc so most recent is first
  const weeklyPeriodLogs =
    flexibleWeeklyHabitIds.length > 0
      ? await HabitLog.find({
          user: userId,
          habit: { $in: flexibleWeeklyHabitIds },
          date: { $gte: weekStart, $lt: weekEnd },
        })
          .sort({ date: -1 })
          .lean()
      : [];

  // Fetch all logs for monthly habits in current month
  // sorted by date desc so most recent is first
  const monthlyPeriodLogs =
    monthlyHabitIds.length > 0
      ? await HabitLog.find({
          user: userId,
          habit: { $in: monthlyHabitIds },
          date: { $gte: monthStart, $lt: monthEnd },
        })
          .sort({ date: -1 })
          .lean()
      : [];

  // Build maps: habitId → most recent log in period
  const weeklyPeriodLogMap = new Map();
  weeklyPeriodLogs.forEach((l) => {
    const id = l.habit.toString();
    if (!weeklyPeriodLogMap.has(id)) {
      weeklyPeriodLogMap.set(id, l); // first = most recent (sorted desc)
    }
  });

  const monthlyPeriodLogMap = new Map();
  monthlyPeriodLogs.forEach((l) => {
    const id = l.habit.toString();
    if (!monthlyPeriodLogMap.has(id)) {
      monthlyPeriodLogMap.set(id, l);
    }
  });

  // Build completed sets for boolean periodCompleted check
  const weeklyCompletedSet = new Set(
    weeklyPeriodLogs.filter((l) => l.isCompleted).map((l) => l.habit.toString())
  );

  const monthlyCompletedSet = new Set(
    monthlyPeriodLogs
      .filter((l) => l.isCompleted)
      .map((l) => l.habit.toString())
  );

  // merge habits + logs + periodCompleted
  const result = habits.map((habit) => {
    const habitId = habit._id.toString();
    const log = logMap.get(habitId) || null;
    const { type, flexible } = habit.frequency;

    let periodCompleted = false;
    let periodLog = null; // most recent log in the period

    if (type === "weekly" && flexible) {
      periodCompleted = weeklyCompletedSet.has(habitId);
      periodLog = weeklyPeriodLogMap.get(habitId) || null;
    } else if (type === "monthly") {
      periodCompleted = monthlyCompletedSet.has(habitId);
      periodLog = monthlyPeriodLogMap.get(habitId) || null;
    } else {
      // daily and scheduled weekly — period = just today
      periodCompleted = log?.isCompleted ?? false;
      periodLog = null; // daily/scheduled weekly use log directly
    }

    return {
      habit,
      log,
      periodCompleted,
      periodLog,
    };
  });

  return result;
};

const getHabitLogsByDateRangeService = async (
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

  const normalizedStartDate = normalizeDate(startDate);
  const normalizedEndDate = normalizeDate(endDate);

  if (normalizedEndDate < normalizedStartDate) {
    throw new ApiError(400, "End date cannot be before start date");
  }

  if (normalizedStartDate > today || normalizedEndDate > today) {
    throw new ApiError(400, "Cannot retrieve logs for future dates");
  }

  const diffInDays = Math.round(
    (normalizedEndDate - normalizedStartDate) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays > 30) {
    throw new ApiError(400, "Date range cannot exceed 30 days");
  }

  // fetch active habits
  const habits = await Habit.find({
    user: userId,
    archived: false,

    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: normalizedEndDate } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: normalizedStartDate } },
        ],
      },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();

  const nextOfEndDate = new Date(normalizedEndDate);
  nextOfEndDate.setDate(nextOfEndDate.getDate() + 1);

  // fetch logs for those habits in that date range
  const logs = await HabitLog.find({
    user: userId,
    date: {
      $gte: normalizedStartDate,
      $lt: nextOfEndDate,
    },
  }).lean();

  // group logs by date + habit for easy lookup
  const logsByDateRange = new Map();

  logs.forEach((log) => {
    const dateKey = [
      log.date.getUTCFullYear(),
      String(log.date.getUTCMonth() + 1).padStart(2, "0"),
      String(log.date.getUTCDate()).padStart(2, "0"),
    ].join("-"); // use only date part as key

    if (!logsByDateRange.has(dateKey)) {
      logsByDateRange.set(dateKey, new Map());
    }

    logsByDateRange.get(dateKey).set(log.habit.toString(), log);
  });

  const habitsWithNormalizedDates = habits.map((habit) => ({
    ...habit,
    _normalizedStartDate: habit.startDate
      ? normalizeDate(habit.startDate)
      : null,
    _normalizedEndDate: habit.endDate ? normalizeDate(habit.endDate) : null,
  }));
  // generate date sequence
  const result = [];
  let currentDate = new Date(normalizedStartDate);

  while (currentDate <= normalizedEndDate) {
    const dateKey = [
      currentDate.getUTCFullYear(),
      String(currentDate.getUTCMonth() + 1).padStart(2, "0"),
      String(currentDate.getUTCDate()).padStart(2, "0"),
    ].join("-");

    const habitLogMap = logsByDateRange.get(dateKey) || new Map();

    // merge habits + logs for that date
    const entries = habitsWithNormalizedDates
      .filter((habit) => {
        if (
          habit._normalizedStartDate &&
          habit._normalizedStartDate > currentDate
        ) {
          return false;
        }
        if (
          habit._normalizedEndDate &&
          habit._normalizedEndDate < currentDate
        ) {
          return false;
        }
        return true;
      })
      .map((habit) => {
        const habitId = habit._id.toString();
        const log = habitLogMap.get(habitId) || null;

        return { habit, log };
      });

    result.push({ date: dateKey, entries });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

const getHabitLogsByHabitService = async (
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

  if (!startDate && endDate) {
    throw new ApiError(400, "Start date is required when end date is provided");
  }

  let normalizedStartDate, normalizedEndDate;

  if (startDate) {
    if (!validateDateFormat(startDate)) {
      throw new ApiError(400, "Invalid start date format");
    }

    const today = clientDate
      ? normalizeDate(clientDate)
      : normalizeDate(new Date());

    normalizedStartDate = normalizeDate(startDate);

    if (normalizedStartDate > today) {
      throw new ApiError(400, "Start date cannot be in the future");
    }

    if (endDate) {
      if (!validateDateFormat(endDate)) {
        throw new ApiError(400, "Invalid end date format");
      }

      normalizedEndDate = normalizeDate(endDate);

      if (normalizedEndDate > today) {
        throw new ApiError(400, "End date cannot be in the future");
      }

      if (normalizedEndDate < normalizedStartDate) {
        throw new ApiError(400, "End date cannot be before start date");
      }

      const diffInDays = Math.round(
        (normalizedEndDate - normalizedStartDate) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays > 30) {
        throw new ApiError(400, "Date range cannot exceed 30 days");
      } else {
        // default endDate to 30 days from startDate, capped at today
        const thirtyDaysFromStart = new Date(normalizedStartDate);
        thirtyDaysFromStart.setDate(thirtyDaysFromStart.getDate() + 30);

        normalizedEndDate =
          thirtyDaysFromStart > today ? today : thirtyDaysFromStart;
      }
    }
  }

  // validate habit exists and belongs to user
  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  const query = {
    user: userId,
    habit: habitId,
  };

  if (normalizedStartDate && normalizedEndDate) {
    const nextOfEndDay = new Date(normalizedEndDate);
    nextOfEndDay.setDate(nextOfEndDay.getDate() + 1);

    query.date = { $gte: normalizedStartDate, $lt: nextOfEndDay };
  }

  // fetch logs for that habit (and date range if provided)
  const logs = await HabitLog.find(query).sort({ date: 1 }).lean();

  return logs;
};

const updateHabitLogValueService = async (
  userId,
  habitLogId,
  value,
  clientDate
) => {
  if (value === undefined) {
    throw new ApiError(400, "Value is required");
  }

  if (!mongoose.Types.ObjectId.isValid(habitLogId)) {
    throw new ApiError(400, "Invalid Habit Log ID");
  }

  const habitLog = await HabitLog.findOne({ _id: habitLogId, user: userId });

  if (!habitLog) {
    throw new ApiError(404, "Habit log not found");
  }

  // validate if the log is editable
  validateHabitLogWriteAllowed(habitLog.date, clientDate);

  const habit = await Habit.findOne({ _id: habitLog.habit, user: userId });

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  if (habit.archived) {
    throw new ApiError(400, "Cannot update log of an archived habit");
  }

  habitLog.value = value;
  habitLog.isCompleted = calculateHabitCompletion(habit, value);

  await habitLog.save();

  return habitLog;
};

const updateHabitLogNotesService = async (
  userId,
  habitLogId,
  notes,
  clientDate
) => {
  if (!habitLogId) {
    throw new ApiError(400, "Habit Log ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(habitLogId)) {
    throw new ApiError(400, "Invalid Habit Log ID");
  }

  if (notes === undefined) {
    throw new ApiError(400, "Notes are required");
  }

  if (notes === null) {
    notes = "";
  }

  if (typeof notes !== "string") {
    throw new ApiError(400, "Notes must be a string");
  }

  if (notes.length > 200) {
    throw new ApiError(400, "Notes cannot exceed 200 characters");
  }

  const habitLog = await HabitLog.findOne({ _id: habitLogId, user: userId });

  if (!habitLog) {
    throw new ApiError(404, "Habit log not found");
  }

  // validate if the log is editable
  validateHabitLogWriteAllowed(habitLog.date, clientDate);

  habitLog.notes = notes;

  await habitLog.save();

  return habitLog;
};

const deleteHabitLogService = async (userId, habitLogId, clientDate) => {
  if (!habitLogId) {
    throw new ApiError(400, "Habit Log ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(habitLogId)) {
    throw new ApiError(400, "Invalid Habit Log ID");
  }

  const habitLog = await HabitLog.findOne({ _id: habitLogId, user: userId });

  if (!habitLog) {
    throw new ApiError(404, "Habit log not found");
  }

  // validate if the log is editable
  validateHabitLogWriteAllowed(habitLog.date, clientDate);

  await habitLog.deleteOne();

  return {
    deleted: true,
    habitLogId,
  };
};

const getHabitLogByIdService = async (userId, habitLogId) => {
  if (!habitLogId) {
    throw new ApiError(400, "Habit Log ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(habitLogId)) {
    throw new ApiError(400, "Invalid Habit Log ID");
  }

  const habitLog = await HabitLog.findOne({
    _id: habitLogId,
    user: userId,
  })
    .populate({
      path: "habit",
      select: "name evaluationType targetType targetValue targetUnit archived",
    })
    .lean();

  if (!habitLog) {
    throw new ApiError(404, "Habit log not found");
  }

  return habitLog;
};

const getHabitStreakService = async (userId, habitId, clientDate) => {
  if (!habitId) {
    throw new ApiError(400, "Habit ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(habitId)) {
    throw new ApiError(400, "Invalid Habit ID");
  }

  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  // fetch completed logs for that habit, sorted by date descending
  const completedLogs = await HabitLog.find({
    user: userId,
    habit: habitId,
    isCompleted: true,
  })
    .sort({ date: -1 })
    .select("date")
    .lean();

  if (completedLogs.length === 0) {
    return {
      habitId,
      streak: 0,
    };
  }

  const completedDateSet = new Set(
    completedLogs.map((log) => normalizeDate(log.date).toISOString())
  );

  //check if a date is a scheduled date for the habit
  const isScheduledDate = (date) => {
    const { type, daysOfWeek, flexible } = habit.frequency;

    if (type === "daily") {
      return true;
    }
    if (type === "weekly") {
      // flexible weekly → never counts toward streak
      if (flexible) return false;
      // if daysOfWeek is specified, only those days count
      if (Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
        return daysOfWeek.includes(date.getUTCDay());
      }
      return false;
    }
    // monthly → always flexible, never counts toward streak
    if (type === "monthly") return false;

    return false;
  };

  const today = clientDate
    ? normalizeDate(clientDate)
    : normalizeDate(new Date());

  const mostRecentLogDate = normalizeDate(completedLogs[0].date);

  // always check for missed scheduled days
  let checkDate = new Date(today);
  checkDate.setUTCDate(checkDate.getUTCDate() - 1);

  while (checkDate > mostRecentLogDate) {
    if (isScheduledDate(checkDate)) {
      return {
        habitId,
        streak: 0,
      };
    }
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }

  // count consecutive completed logs from the most recent one until we find a break in the streak
  let streak = 0;
  let currentDate = new Date(mostRecentLogDate);

  while (true) {
    if (isScheduledDate(currentDate)) {
      const dateKey = normalizeDate(currentDate).toISOString();

      if (completedDateSet.has(dateKey)) {
        streak++;
      } else {
        // scheduled day with no completed log — streak is broken
        break;
      }
    }

    // if we have reached the habit start date, stop counting further back
    if (currentDate <= normalizeDate(habit.startDate)) {
      break;
    }

    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }

  return {
    habitId,
    streak,
  };
};

export {
  upsertHabitLogService,
  bulkUpsertHabitLogsService,
  getHabitLogsByDateService,
  getHabitLogsByDateRangeService,
  getHabitLogsByHabitService,
  updateHabitLogValueService,
  updateHabitLogNotesService,
  deleteHabitLogService,
  getHabitLogByIdService,
  getHabitStreakService,
};
