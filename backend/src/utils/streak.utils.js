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

// Walks a habit's full scheduled history and returns { current, best }
// using the same 0% / 1-49% / 50-99% / 100% rule as getHabitStreakService.

const computeHabitStreaks = (habit, logsByDateKey, startBound, today) => {
  let current = 0;
  let best = 0;
  let running = 0;
  let stillCounting = true; // once we hit a 0% day walking backward from today, current streak is locked in

  let cursor = new Date(today);

  // collect all scheduled days from startBound to today, in chronological order, then scan forward once for best, and use the existing backward scan for current.

  const scheduledDays = [];
  let d = new Date(startBound);
  while (d <= today) {
    if (isScheduledDate(habit, d)) {
      scheduledDays.push(new Date(d));
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }

  // Best Streak --- forward scan
  scheduledDays.forEach((date) => {
    const key = date.toISOString();
    const log = logsByDateKey.get(key) || null;
    const score = computeDayScore(habit, log);

    if (score === 0) {
      running = 0;
    } else if (score >= 50) {
      running += 1;
      if (running > best) best = running;
    }
    // 1-49% holds the running count steady, neither resets nor increments
  });

  // current streak --- backward scan from today
  for (let i = scheduledDays.length - 1; i >= 0; i--) {
    const date = scheduledDays[i];
    const key = date.toISOString();
    const log = logsByDateKey.get(key) || null;
    const score = computeDayScore(habit, log);
    const isToday = date.getTime() === today.getTime();

    if (isToday) {
      if (score >= 50) current += 1;
      continue;
    }

    if (score === 0) break;
    if (score >= 50) current += 1;
    // 1-49% holds steady, keep scanning backward
  }

  return { current, best };
};

const dayCounts = (habit, log) => computeDayScore(habit, log) >= 50;

export {
  isScheduledDate,
  isHabitStreakRelevant,
  computeDayScore,
  computeHabitStreaks,
  dayCounts,
};
