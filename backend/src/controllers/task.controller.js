import {
  createTaskService,
  deleteTaskService,
  getTaskByIdService,
  getTasksByUserService,
  toggleTaskCompletionService,
  updateTaskService,
} from "../services/task.services.js";
import { asyncHandler } from "../utils/index.js";

const createTask = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const taskData = req.body;

  const task = await createTaskService(userId, taskData);

  res.status(201).json(new ApiResponse(201, "Task created successfully", task));
});

const getTasksByUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { completed } = req.query;

  const filters = {};
  if (completed === "true") filters.isCompleted = true;
  if (completed === "false") filters.isCompleted = false;

  const tasks = await getTasksByUserService(userId, filters);
  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks fetched successfully", tasks));
});

const getTaskById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const task = await getTaskByIdService(userId, id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Task fetched successfully", task));
});

const updateTask = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const updateData = req.body;

  const task = await updateTaskService(userId, id, updateData);

  return res
    .status(200)
    .json(new ApiResponse(200, "Task updated successfully", task));
});

const toggleTaskCompletion = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { isCompleted } = req.body;

  const task = await toggleTaskCompletionService(userId, id, isCompleted);

  return res
    .status(200)
    .json(new ApiResponse(200, "Task status updated successfully", task));
});

const deleteTask = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const result = await deleteTaskService(userId, id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted successfully", result));
});

export {
  createTask,
  getTasksByUser,
  getTaskById,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
};
