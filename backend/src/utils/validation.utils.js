import { ApiError } from "./ApiError.js";

const validateHabitLogValue = (habit, value) => {
  if (!habit) {
    return;
  }

  // For boolean habits, value must be 0, 1, true, or false
  if (habit.evaluationType === "boolean") {
    const allowedValues = [0, 1, true, false];

    if (!allowedValues.includes(value)) {
      throw new ApiError(
        400,
        "Invalid value for boolean habit. Allowed values are 0, 1, true, or false."
      );
    }
  }

  // For measurable habits, value must be a non-negative number
  if (habit.evaluationType === "measurable") {
    if (typeof value !== "number" || isNaN(value) || value < 0) {
      throw new ApiError(
        400,
        "Invalid value for measurable habit. Value must be a non-negative number."
      );
    }
  }
};

export { validateHabitLogValue };
