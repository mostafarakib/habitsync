import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getHabitLogsByDate,
  getHabitLogsByDateRange,
  upsertHabitLog,
} from "../controllers/habitLog.controllers.js";

const router = Router();

router.use(verifyJWT);

router.put("/", upsertHabitLog);
router.get("/date/:date", getHabitLogsByDate);
router.get("/date-range", getHabitLogsByDateRange);

export default router;
