import {
  getHabitLogsByDateRangeService,
  getHabitLogsByDateService,
  getHabitLogsByHabitService,
  updateHabitLogNotesService,
  updateHabitLogValueService,
  upsertHabitLogService,
} from "../services/habitLog.services.js";
import { ApiResponse, asyncHandler } from "../utils/index.js";

const upsertHabitLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { habitId, date, value, notes } = req.body;

  const habitLog = await upsertHabitLogService(
    userId,
    habitId,
    date,
    value,
    notes
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit log upserted successfully", habitLog));
});

// get habit logs by date
const getHabitLogsByDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date } = req.params;
  if (!date) {
    throw new ApiError(400, "Date is required");
  }
  const data = await getHabitLogsByDateService(userId, date);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit logs retrieved successfully", data));
});

const getHabitLogsByDateRange = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  const data = await getHabitLogsByDateRangeService(userId, startDate, endDate);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit logs retrieved successfully", data));
});

const getHabitLogsByHabit = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { habitId } = req.params;

  const { startDate, endDate } = req.query;

  const data = await getHabitLogsByHabitService(
    userId,
    habitId,
    startDate,
    endDate
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit logs retrieved successfully", data));
});

const updateHabitLogValue = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { value } = req.body;

  const habitLog = await updateHabitLogValueService(userId, id, value);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Habit log value updated successfully", habitLog)
    );
});

const updateHabitLogNotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { notes } = req.body;

  const habitLog = await updateHabitLogNotesService(userId, id, notes);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Habit log notes updated successfully", habitLog)
    );
});

export {
  upsertHabitLog,
  getHabitLogsByDate,
  getHabitLogsByDateRange,
  getHabitLogsByHabit,
  updateHabitLogValue,
  updateHabitLogNotes,
};
