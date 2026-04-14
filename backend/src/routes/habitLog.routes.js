import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteHabitLog,
  getHabitLogById,
  getHabitLogsByDate,
  getHabitLogsByDateRange,
  getHabitLogsByHabit,
  updateHabitLogNotes,
  updateHabitLogValue,
  upsertHabitLog,
} from "../controllers/habitLog.controllers.js";

const router = Router();

router.use(verifyJWT);

router.put("/", upsertHabitLog);
router.get("/date/:date", getHabitLogsByDate);
router.get("/date-range", getHabitLogsByDateRange);
router.get("/habit/:habitId", getHabitLogsByHabit);
router.patch("/:id/value", updateHabitLogValue);
router.patch("/:id/notes", updateHabitLogNotes);
router.delete("/:id", deleteHabitLog);
router.get("/:id", getHabitLogById);

export default router;
