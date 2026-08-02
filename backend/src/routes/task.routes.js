import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasksByUser,
  toggleTaskCompletion,
  updateTask,
} from "../controllers/task.controller";

const router = Router();

// all task routes are protected
router.use(verifyJWT);

/*
POST   /api/v1/tasks
GET    /api/v1/tasks
*/

router.post("/", createTask);
router.get("/", getTasksByUser);
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.patch("/:id/status", toggleTaskCompletion);
router.delete("/:id", deleteTask);

export default router;
