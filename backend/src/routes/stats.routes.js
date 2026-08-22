import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getOverallStreak,
  getHeatmap,
} from "../controllers/stats.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/streak", getOverallStreak);
router.get("/heatmap", getHeatmap);

export default router;
