// Shared schering logic used by both per-habit and overall streak calculations

const isScheduledDate = (habit, date) => {
  const { type, daysOfWeek, flexible } = habit.frequency;

  if (type === "daily") return true;

  if (type === "weekly") {
    if (flexible) return false; // flexible weekly never counts toward streak
    if (Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
      return daysOfWeek.includes(date.getUTCDay());
    }
    return false;
  }

  // monthly is always excluded from streak-relevant scheduling
  if (type === "monthly") return false;

  return false;
};

const isHabitStreakRelevant = (habit) => {
  const { type, flexible } = habit.frequency;
  if (type === "daily") return true;
  if (type === "weekly") return !flexible;
  return false; // monthly
};

// Returns 0-100. Boolean habits and non-atLeast measurable habits are binary.
const computeDayScore = (habit, log) => {
  if (!log) return 0;

  if (habit.evaluationType === "boolean") {
    return log.isCompleted ? 100 : 0;
  }

  // measurable
  if (habit.targetType === "atLeast" && habit.targetValue) {
    const raw = (log.value / habit.targetValue) * 100;
    return Math.max(0, Math.min(100, raw));
  }

  // atMost / lessThan / exactly / no target — no natural percentage, binary fallback
  return log.isCompleted ? 100 : 0;
};

export { isScheduledDate, isHabitStreakRelevant, computeDayScore };
