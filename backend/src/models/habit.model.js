import mongoose, { Schema } from "mongoose";

const habitSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    frequency: {
      type: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily",
      },
      daysOfWeek: {
        type: [Number], // 0 (Sunday) to 6 (Saturday)
        default: undefined,
      },
      interval: {
        type: Number,
        default: null,
      },
    },
    evaluationType: {
      type: String,
      enum: ["boolean", "measurable"],
      default: "boolean",
    },
    targetType: {
      type: String,
      enum: ["atLeast", "atMost", "lessThan", "exactly"],
      default: "atLeast",
    },
    targetValue: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          if (this.evaluationType === "measurable") {
            return value !== null && value >= 0;
          }
          return true; // No validation needed for Boolean type
        },
        message:
          "Target value is required for measurable habits and must be a non-negative number.",
      },
    },
    targetUnit: {
      type: String,
      trim: true,
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      time: {
        type: String, // "HH:mm" format
        default: null,
      },
    },
    color: {
      type: String,
      default: null,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

habitSchema.index({ user: 1, archived: 1 });

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;
