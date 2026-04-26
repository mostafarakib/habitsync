// calculate HabitLog's isCompleted based on its value and the associated Habits's evaluationType, targetType, and targetValue
const calculateHabitCompletion = (habit, value) => {
  if (!habit) {
    return false;
  }

  if (value === null || value === undefined) {
    return false;
  }

  let normalizedValue = value;

  if (habit.evaluationType === "boolean") {
    normalizedValue = value === true ? 1 : Number(value);

    return normalizedValue === 1;
  }

  if (habit.evaluationType === "measurable" && habit.targetValue !== null) {
    const { targetType, targetValue } = habit;

    switch (targetType) {
      case "atLeast":
        return normalizedValue >= targetValue;
      case "atMost":
        return normalizedValue <= targetValue;
      case "lessThan":
        return normalizedValue < targetValue;
      case "exactly":
        return normalizedValue === targetValue;
      default:
        return false; // default to not completed if targetType is invalid
    }
  }

  return false; // default to not completed if evaluationType is invalid or targetValue is null
};

export { calculateHabitCompletion };
