import Task from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";

const createTaskService = async (userId, taskData) => {
  const task = await Task.create({ ...taskData, user: userId });
  return task;
};

const getTasksByUserService = async (userId, filters = {}) => {
  const query = { user: userId };

  /**
   * Optional filtering:
   * - filters.isCompleted === true  → only completed tasks
   * - filters.isCompleted === false → only pending tasks
   * - undefined → all tasks
   */
  if (filters.isCompleted !== undefined) {
    query.isCompleted = filters.isCompleted;
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 });

  return tasks;
};

const getTaskByIdService = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return task;
};

const updateTaskService = async (userId, taskId, updateData) => {
  // prevent updating system-controlled fields
  const forbiddenFields = [
    "user",
    "_id",
    "isCompleted",
    "completedAt",
    "createdAt",
    "updatedAt",
  ];

  const filteredUpdateData = { ...updateData };

  forbiddenFields.forEach((field) => {
    if (field in filteredUpdateData) {
      delete filteredUpdateData[field];
    }
  });

  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    filteredUpdateData,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return task;
};

const toggleTaskCompletionService = async (userId, taskId, isCompleted) => {
  const task = await Task.findOne({ _id: taskId, user: userId });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  task.isCompleted = isCompleted;
  task.completedAt = isCompleted ? new Date() : null;

  await task.save();

  return task;
};

const deleteTaskService = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await task.deleteOne();

  return { deleted: true, taskId };
};

export {
  createTaskService,
  getTasksByUserService,
  getTaskByIdService,
  updateTaskService,
  toggleTaskCompletionService,
  deleteTaskService,
};
