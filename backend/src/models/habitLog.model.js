import mongoose, { Schema } from "mongoose";
import Habit from "./habit.model.js";
import { ApiError } from "../utils/index.js";

const habitLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    habit: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // Stores numeric value:
    // Boolean habit → 0 or 1
    // Measurable habit → actual number
    value: {
      type: Number,
      required: true,
      min: [0, "Value cannot be negative"],
    },
    isCompleted: {
      type: Boolean,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate logs for the same habit on the same date
habitLogSchema.index({ habit: 1, date: 1 }, { unique: true });

// Helpful query index
habitLogSchema.index({ user: 1, date: 1 });

// normalize date to midnight for consistent querying
habitLogSchema.pre("save", function (next) {
  if (this.date) {
    this.date.setHours(0, 0, 0, 0);
  }
  next();
});

// calculate isCompleted based on value and habit's target
habitLogSchema.pre("save", async function (next) {
  try {
    const habit = await Habit.findById(this.habit);

    if (!habit) {
      return next(new ApiError(404, "Associated habit not found"));
    }

    // boolean habit: completed if value is 1
    if (habit.evaluationType === "boolean") {
      this.isCompleted = this.value === 1;
    }

    // measurable habit: evaluate based on targetType and targetValue
    if (habit.evaluationType === "measurable" && habit.targetValue !== null) {
      const target = habit.targetValue;

      switch (habit.targetType) {
        case "atLeast":
          this.isCompleted = this.value >= target;
          break;
        case "atMost":
          this.isCompleted = this.value <= target;
          break;
        case "lessThan":
          this.isCompleted = this.value < target;
          break;
        case "exactly":
          this.isCompleted = this.value === target;
          break;
        default:
          this.isCompleted = false; // default to not completed if targetType is invalid
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const HabitLog = mongoose.model("HabitLog", habitLogSchema);
export default HabitLog;
