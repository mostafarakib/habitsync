import Habit from "../models/habit.model.js";
import HabitLog from "../models/habitLog.model.js";
import { ApiError } from "../utils/index.js";

const createHabitService = async (userId, habitData) => {
  const habit = await Habit.create({ ...habitData, user: userId });

  return habit;
};

const getHabitsByUserService = async (userId, filters = {}) => {
  const query = { user: userId };

  /**
   * ARCHIVE FILTERING LOGIC
   *
   * Default behavior:
   * If no archived filter is provided, return ALL habits
   * (both archived and unarchived).
   *
   * Optional filtering:
   * - filters.archived === true  → return ONLY archived habits
   * - filters.archived === false → return ONLY active (unarchived) habits
   *
   * Examples:
   * getHabitsByUserService(userId)
   * → returns all habits
   *
   * getHabitsByUserService(userId, { archived: false })
   * → returns only active habits
   *
   * getHabitsByUserService(userId, { archived: true })
   * → returns only archived habits
   */

  if (filters.archived !== undefined) {
    query.archived = filters.archived;
  }

  const habits = await Habit.find(query).sort({
    createdAt: -1, // newest habits first
  });

  return habits;
};

const getHabitByIdService = async (userId, habitId) => {
  const habit = await Habit.findOne({ _id: habitId, user: userId });

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  return habit;
};

const updateHabitService = async (userId, habitId, updateData) => {
  // prevent updating of system-controlled fields
  const forbiddenFields = ["user", "archived", "_id", "createdAt", "updatedAt"];
  const filteredUpdateData = { ...updateData };

  forbiddenFields.forEach((field) => {
    if (field in filteredUpdateData) {
      delete filteredUpdateData[field];
    }
  });

  // update habit and return the updated document
  const habit = await Habit.findOneAndUpdate(
    { _id: habitId, user: userId },
    filteredUpdateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  return habit;
};

const archiveHabitService = async (userId, habitId) => {
  const habit = await Habit.findOneAndUpdate(
    {
      _id: habitId,
      user: userId,
    },
    { archived: true },
    { new: true }
  );

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  return habit;
};

const unarchiveHabitService = async (userId, habitId) => {
  const habit = await Habit.findOneAndUpdate(
    {
      _id: habitId,
      user: userId,
    },
    { archived: false },
    { new: true }
  );

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  return habit;
};

const deleteHabitService = async (userId, habitId) => {
  const habit = await Habit.findOne({
    _id: habitId,
    user: userId,
  });

  if (!habit) {
    throw new ApiError(404, "Habit not found");
  }

  // Delete all logs associated with this habit
  await HabitLog.deleteMany({ habit: habitId, user: userId });

  // Delete the habit itself
  await habit.deleteOne();

  return { deleted: true, habitId };
};

export {
  createHabitService,
  getHabitsByUserService,
  getHabitByIdService,
  updateHabitService,
  archiveHabitService,
  unarchiveHabitService,
  deleteHabitService,
};
