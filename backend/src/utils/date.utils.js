import { ApiError } from "./ApiError.js";

// Utility function to normalize a date by setting the time to 00:00:00.000
const normalizeDate = (dateInput) => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};

const validateIsHabitLogEditable = (date) => {
  const today = normalizeDate(new Date());

  const editableStartDate = new Date(today);
  editableStartDate.setDate(editableStartDate.getDate() - 30); // Allow editing logs from the past 30 days

  if (date < editableStartDate) {
    throw new ApiError(400, "Logs older than 30 days cannot be edited");
  }
  if (date > today) {
    throw new ApiError(400, "Logs for future dates cannot be edited");
  }
};
export { normalizeDate, validateIsHabitLogEditable };
