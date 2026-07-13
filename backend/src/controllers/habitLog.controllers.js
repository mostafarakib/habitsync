import {
  deleteHabitLogService,
  getHabitLogByIdService,
  getHabitLogsByDateRangeService,
  getHabitLogsByDateService,
  getHabitLogsByHabitService,
  getHabitStreakService,
  updateHabitLogNotesService,
  updateHabitLogValueService,
  upsertHabitLogService,
  bulkUpsertHabitLogsService,
} from "../services/habitLog.services.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const upsertHabitLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { habitId, date, value, notes } = req.body;
  const clientDate = req.clientDate;

  const habitLog = await upsertHabitLogService(
    userId,
    habitId,
    date,
    value,
    notes,
    clientDate
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit log upserted successfully", habitLog));
});

const bulkUpsertHabitLogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { logs } = req.body;

  const result = await bulkUpsertHabitLogsService(userId, logs);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit logs upserted successfully", result));
});

// get habit logs by date
const getHabitLogsByDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date } = req.params;
  const clientDate = req.clientDate;

  if (!date) {
    throw new ApiError(400, "Date is required");
  }
  const data = await getHabitLogsByDateService(userId, date, clientDate);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit logs retrieved successfully", data));
});

const getHabitLogsByDateRange = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;
  const clientDate = req.clientDate;

  const data = await getHabitLogsByDateRangeService(
    userId,
    startDate,
    endDate,
    clientDate
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit logs retrieved successfully", data));
});

const getHabitLogsByHabit = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { habitId } = req.params;
  const { startDate, endDate } = req.query;
  const clientDate = req.clientDate;

  const data = await getHabitLogsByHabitService(
    userId,
    habitId,
    startDate,
    endDate,
    clientDate
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit logs retrieved successfully", data));
});

const updateHabitLogValue = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const value = req.body?.value;
  const clientDate = req.clientDate;

  const habitLog = await updateHabitLogValueService(
    userId,
    id,
    value,
    clientDate
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Habit log value updated successfully", habitLog)
    );
});

const updateHabitLogNotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const notes = req.body?.notes;
  const clientDate = req.clientDate;

  const habitLog = await updateHabitLogNotesService(
    userId,
    id,
    notes,
    clientDate
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Habit log notes updated successfully", habitLog)
    );
});

const deleteHabitLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const clientDate = req.clientDate;

  const result = await deleteHabitLogService(userId, id, clientDate);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit log deleted successfully", result));
});

const getHabitLogById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const habitLog = await getHabitLogByIdService(userId, id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit log retrieved successfully", habitLog));
});

const getHabitStreak = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { habitId } = req.params;
  const clientDate = req.clientDate;

  const streak = await getHabitStreakService(userId, habitId, clientDate);

  return res
    .status(200)
    .json(new ApiResponse(200, "Habit streak retrieved successfully", streak));
});

export {
  upsertHabitLog,
  bulkUpsertHabitLogs,
  getHabitLogsByDate,
  getHabitLogsByDateRange,
  getHabitLogsByHabit,
  updateHabitLogValue,
  updateHabitLogNotes,
  deleteHabitLog,
  getHabitLogById,
  getHabitStreak,
};
