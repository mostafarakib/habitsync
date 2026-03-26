import {
  archiveHabitService,
  createHabitService,
  getHabitByIdService,
  getHabitsByUserService,
  unarchiveHabitService,
  updateHabitService,
} from "../services/habit.services.js";
import { ApiResponse, asyncHandler } from "../utils/index.js";

/*
=========================
CREATE HABIT
POST /habits
=========================
*/
const createHabit = asyncHandler(async (req, res) => {
  const habitData = req.body;

  const habit = await createHabitService(req.user._id, habitData);

  return res
    .status(201)
    .json(new ApiResponse(201, "Habit created successfully", habit));
});

/*
=========================
GET USER HABITS
GET /habits > all habits (active+archived)
GET /habits?archived=true > all archived habits
GET /habits?archived=false > all active habits
=========================
*/
const getHabitsByUser = asyncHandler(async (req, res) => {
  const { archived } = req.query;

  const filters = {};

  if (archived === "true") {
    filters.archived = true;
  } else if (archived === "false") {
    filters.archived = false;
  }

  const habits = await getHabitsByUserService(req.user._id, filters);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habits fetched successfully", habits));
});

/*
=========================
GET HABIT BY ID
GET /habits/:id
=========================
*/
const getHabitById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const habit = await getHabitByIdService(req.user._id, id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit fetched successfully", habit));
});

/*
=========================
UPDATE HABIT
PATCH /habits/:id
=========================
*/
const updateHabit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = req.body;

  const habit = await updateHabitService(req.user._id, id, updateData);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit updated successfully", habit));
});

/*
=========================
ARCHIVE HABIT
PATCH /habits/:id/archive
=========================
*/
const archiveHabit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const habit = await archiveHabitService(req.user._id, id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit archived successfully", habit));
});

/*
=========================
UNARCHIVE HABIT
PATCH /habits/:id/unarchive
=========================
*/
const unarchiveHabit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const habit = await unarchiveHabitService(req.user._id, id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit unarchived successfully", habit));
});

export {
  createHabit,
  getHabitsByUser,
  getHabitById,
  updateHabit,
  archiveHabit,
  unarchiveHabit,
};
