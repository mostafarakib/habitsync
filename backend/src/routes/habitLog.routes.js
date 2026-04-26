import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  bulkUpsertHabitLogs,
  deleteHabitLog,
  getHabitLogById,
  getHabitLogsByDate,
  getHabitLogsByDateRange,
  getHabitLogsByHabit,
  getHabitStreak,
  updateHabitLogNotes,
  updateHabitLogValue,
  upsertHabitLog,
} from "../controllers/habitLog.controllers.js";

const router = Router();

// All routes in this router require authentication
router.use(verifyJWT);

router.put("/", upsertHabitLog);
router.put("/bulk", bulkUpsertHabitLogs);
router.get("/date/:date", getHabitLogsByDate);
router.get("/date-range", getHabitLogsByDateRange);
router.get("/habit/:habitId", getHabitLogsByHabit);
router.patch("/:id/value", updateHabitLogValue);
router.patch("/:id/notes", updateHabitLogNotes);
router.delete("/:id", deleteHabitLog);
router.get("/streak/:habitId", getHabitStreak);
router.get("/:id", getHabitLogById);

export default router;
