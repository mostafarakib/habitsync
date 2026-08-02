import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { attachClientDate } from "./middlewares/clientDate.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(attachClientDate);

//routes import
import authRoutes from "./routes/auth.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import habitLogRoutes from "./routes/habitLog.routes.js";
import taskRoutes from "./routes/task.routes.js";

// Health check — used by UptimeRobot to keep server alive
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// routes declaration
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/habits", habitRoutes);
app.use("/api/v1/habit-logs", habitLogRoutes);
app.use("/api/v1/tasks", taskRoutes);

// error handler import
import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);

export { app };
