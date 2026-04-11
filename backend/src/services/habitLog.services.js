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

export { upsertHabitLogService, getHabitLogsByDateService };
