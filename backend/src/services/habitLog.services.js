import Habit from "../models/habit.model.js";
import HabitLog from "../models/habitLog.model.js";
import {
  ApiError,
  calculateHabitCompletion,
  normalizeDate,
  validateIsHabitLogEditable,
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

  if (habit.archived) {
    throw new ApiError(400, "Cannot log an archived habit");
  }

  const normalizedDate = normalizeDate(date);
  validateIsHabitLogEditable(normalizedDate);

  let existingLog = await HabitLog.findOne({
    habit: habitId,
    date: normalizedDate,
  });

  const isCompleted = calculateHabitCompletion(habit, value);

  let habitLog;

  if (existingLog) {
    // preserve existing notes if new notes are not provided
    const updatedNotes = notes !== undefined ? notes : existingLog.notes;
    existingLog.value = value;
    existingLog.isCompleted = isCompleted;
    existingLog.notes = updatedNotes;

    habitLog = await existingLog.save();
  } else {
    habitLog = new HabitLog.create({
      user: userId,
      habit: habitId,
      date: normalizedDate,
      value,
      isCompleted,
      notes: notes || "",
    });
  }

  return habitLog;
};

const getHabitLogsByDateService = async (userId, date) => {
  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  // normalize the date and validate if it's editable
  const normalizedDate = normalizeDate(date);
  validateIsHabitLogEditable(normalizedDate);

  // fetch active habits for that date
  const habits = await Habit.find({
    user: userId,
    archived: false,

    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: normalizedDate } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
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
    date: normalizedDate,
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

  const normalizedStartDate = normalizeDate(startDate);
  const normalizedEndDate = normalizeDate(endDate);

  // validate if the date range is editable
  validateIsHabitLogEditable(normalizedStartDate);
  validateIsHabitLogEditable(normalizedEndDate);

  // validate date range

  const diffInDays =
    (normalizedEndDate - normalizedStartDate) / (1000 * 60 * 60 * 24);

  if (diffInDays > 30) {
    throw new ApiError(400, "Date range cannot exceed 30 days");
  }

  if (normalizedEndDate < normalizedStartDate) {
    throw new ApiError(400, "End date cannot be before start date");
  }

  // fetch active habits
  const habits = await Habit.find({
    user: userId,
    archived: false,
  })
    .sort({ createdAt: 1 })
    .lean();

  // fetch logs for those habits in that date range
  const logs = await HabitLog.find({
    user: userId,
    date: {
      $gte: normalizedStartDate,
      $lte: normalizedEndDate,
    },
  }).lean();

  // group logs by date + habit for easy lookup
  const logsByDateRange = new Map();

  logs.forEach((log) => {
    const dateKey = log.date.toISOString().split("T")[0]; // use only date part as key

    if (!logsByDateRange.has(dateKey)) {
      logsByDateRange.set(dateKey, new Map());
    }

    logsByDateRange.get(dateKey).set(log.habit.toString(), log);

    // generate date sequence
    const result = [];
    let currentDate = new Date(normalizedStartDate);

    while (currentDate <= normalizedEndDate) {
      const dateKey = currentDate.toISOString().split("T")[0];

      const habitLogMap = logsByDateRange.get(dateKey) || new Map();

      // merge habits + logs for that date
      const entries = habits
        .filter((habit) => {
          if (habit.startDate && normalizeDate(habit.startDate) > currentDate) {
            return false;
          }
          if (habit.endDate && normalizeDate(habit.endDate) < currentDate) {
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
  });

  return result;
};

export {
  upsertHabitLogService,
  getHabitLogsByDateService,
  getHabitLogsByDateRangeService,
};
