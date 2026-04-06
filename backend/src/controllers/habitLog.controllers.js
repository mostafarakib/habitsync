import { upsertHabitLogService } from "../services/habitLog.services.js";
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

export { upsertHabitLog };
