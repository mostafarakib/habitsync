import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

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

//routes import
import authRoutes from "./routes/auth.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import habitLogRoutes from "./routes/habitLog.routes.js";

// routes declaration
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/habits", habitRoutes);
app.use("/api/v1/habit-logs", habitLogRoutes);

export { app };
