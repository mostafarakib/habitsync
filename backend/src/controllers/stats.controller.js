import {
  getOverallStreakService,
  getDailyCompletionHeatmapService,
  getStatsSummaryService,
  getHabitPerformanceService,
} from "../services/stats.services.js";
import { ApiResponse, asyncHandler } from "../utils/index.js";

const getOverallStreak = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const clientDate = req.clientDate;

  const data = await getOverallStreakService(userId, clientDate);

  return res
    .status(200)
    .json(new ApiResponse(200, "Overall streak retrieved successfully", data));
});

const getHeatmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;
  const clientDate = req.clientDate;

  const data = await getDailyCompletionHeatmapService(
    userId,
    startDate,
    endDate,
    clientDate
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Heatmap data retrieved successfully", data));
});

const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const clientDate = req.clientDate;

  const data = await getStatsSummaryService(userId, clientDate);

  return res
    .status(200)
    .json(new ApiResponse(200, "Stats summary retrieved successfully", data));
});

const getHabitPerformance = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period } = req.query;
  const clientDate = req.clientDate;

  const data = await getHabitPerformanceService(userId, period, clientDate);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Habit performance retrieved successfully", data)
    );
});

export { getOverallStreak, getHeatmap, getSummary, getHabitPerformance };
