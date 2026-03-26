import { Router } from "express"; // eslint-disable-line no-unused-vars
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  archiveHabit,
  createHabit,
  getHabitById,
  getHabitsByUser,
  unarchiveHabit,
  updateHabit,
} from "../controllers/habit.controllers.js";

const router = Router();

// all habit routes are protected
router.use(verifyJWT);

// routes
/*
POST  /api/v1/habits
GET   /api/v1/habits
*/

router.post("/", createHabit);
router.get("/", getHabitsByUser);
router.get("/:id", getHabitById);
router.patch("/:id", updateHabit);
router.patch("/:id/archive", archiveHabit);
router.patch("/:id/unarchive", unarchiveHabit);

export default router;
