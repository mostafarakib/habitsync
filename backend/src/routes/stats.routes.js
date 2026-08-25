import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getOverallStreak,
  getHeatmap,
  getSummary,
  getHabitPerformance,
  getHabitHeatmap,
} from "../controllers/stats.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/streak", getOverallStreak);
router.get("/heatmap", getHeatmap);
router.get("/summary", getSummary);
router.get("/habit-performance", getHabitPerformance);
router.get("/heatmap/:habitId", getHabitHeatmap);

export default router;
