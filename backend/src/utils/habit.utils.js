// calculate HabitLog's isCompleted based on its value and the associated Habits's evaluationType, targetType, and targetValue
const calculateHabitCompletion = (habit, value) => {
  if (habit.evaluationType === "boolean") {
    return value === 1;
  }

  if (habit.evaluationType === "measurable" && habit.targetValue !== null) {
    const { targetType, targetValue } = habit;

    switch (targetType) {
      case "atLeast":
        return value >= targetValue;
      case "atMost":
        return value <= targetValue;
      case "lessThan":
        return value < targetValue;
      case "exactly":
        return value === targetValue;
      default:
        return false; // default to not completed if targetType is invalid
    }
  }
};

export { calculateHabitCompletion };
