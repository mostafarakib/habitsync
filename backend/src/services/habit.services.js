import Habit from "../models/habit.model.js";
import { ApiError } from "../utils/index.js";

const createHabitService = async (userId, habitData) => {
  const habit = await Habit.create({ ...habitData, userId });

  return habit;
};

const getHabitsByUserService = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.archived !== undefined) {
    query.archived = filters.archived;
  }

  const habits = await Habit.find(query).sort({
    createdAt: -1,
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
  const habit = await Habit.findByIdAndUpdate(
    { _id: habitId, user: userId },
    updateData,
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
  const habit = await Habit.findByIdAndUpdate(
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
  const habit = await Habit.findByIdAndUpdate(
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

export {
  createHabitService,
  getHabitsByUserService,
  getHabitByIdService,
  updateHabitService,
  archiveHabitService,
  unarchiveHabitService,
};
