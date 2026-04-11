import {
  getHabitLogsByDateService,
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

export { upsertHabitLog, getHabitLogsByDate };
