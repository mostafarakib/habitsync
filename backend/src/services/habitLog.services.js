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
const upsertHabitLogService = async (userId, habitId, date, value, notes) => {
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
  validateHabitLogWriteAllowed(date);

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

const getHabitLogsByDateService = async (userId, date) => {
  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  if (!validateDateFormat(date)) {
    throw new ApiError(400, "Invalid date format");
  }

  // normalize the date
  const normalizedDate = normalizeDate(date);

  const today = normalizeDate(new Date());

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

  // merge habits + logs

  const result = habits.map((habit) => {
    const habitId = habit._id.toString();

    const log = logMap.get(habitId) || null;

    return {
      habit,
      log,
    };
  });

  return result;
};

const getHabitLogsByDateRangeService = async (userId, startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new ApiError(400, "Start date and end date are required");
  }

  if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
    throw new ApiError(400, "Invalid date format");
  }

  const today = normalizeDate(new Date());

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
  endDate
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

    const today = normalizeDate(new Date());
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

const updateHabitLogValueService = async (userId, habitLogId, value) => {
  if (value === undefined) {
    throw new ApiError(400, "Value is required");
  }

  const habitLog = await HabitLog.findOne({ _id: habitLogId, user: userId });

  if (!habitLog) {
    throw new ApiError(404, "Habit log not found");
  }

  // validate if the log is editable
  validateHabitLogWriteAllowed(habitLog.date);

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

const updateHabitLogNotesService = async (userId, habitLogId, notes) => {
  if (notes === undefined) {
    throw new ApiError(400, "Notes are required");
  }

  if (typeof notes !== "string") {
    throw new ApiError(400, "Notes must be a string");
  }

  if (notes === null) {
    notes = "";
  }

  if (notes.length > 200) {
    throw new ApiError(400, "Notes cannot exceed 200 characters");
  }

  const habitLog = await HabitLog.findOne({ _id: habitLogId, user: userId });

  if (!habitLog) {
    throw new ApiError(404, "Habit log not found");
  }

  // validate if the log is editable
  validateHabitLogWriteAllowed(habitLog.date);

  habitLog.notes = notes;

  await habitLog.save();
  return habitLog;
};

const deleteHabitLogService = async (userId, habitLogId) => {
  const habitLog = await HabitLog.findOne({ _id: habitLogId, user: userId });

  if (!habitLog) {
    throw new ApiError(404, "Habit log not found");
  }

  // validate if the log is editable
  validateHabitLogWriteAllowed(habitLog.date);

  await habitLog.deleteOne();

  return {
    deleted: true,
    habitLogId,
  };
};

const getHabitLogByIdService = async (userId, habitLogId) => {
  const habitLog = await HabitLog.findOne({
    _id: habitLogId,
    user: userId,
  }).populate({
    path: "habit",
    select: "name evaluationType targetType targetValue targetUnit archived",
  });

  if (!habitLog) {
    throw new ApiError(404, "Habit log not found");
  }

  return habitLog;
};

const getHabitStreakService = async (userId, habitId) => {
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
    .select("date");

  if (completedLogs.length === 0) {
    return {
      habitId,
      streak: 0,
    };
  }

  let streak = 0;
  let currentDate = normalizeDate(new Date());
  let logIndex = 0;

  // if today not completed, start from yesterday
  if (
    normalizeDate(completedLogs[0].date).getTime() !== currentDate.getTime()
  ) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // iterate from backwards until we find a non-completed day
  while (logIndex < completedLogs.length) {
    const logDate = normalizeDate(completedLogs[logIndex].date);

    if (logDate.getTime() === currentDate.getTime()) {
      streak++;

      currentDate.setDate(currentDate.getDate() - 1);
      logIndex++;
    } else {
      break;
    }
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
