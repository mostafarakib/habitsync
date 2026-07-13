import { normalizeDate } from "../utils/date.utils.js";

const attachClientDate = (req, res, next) => {
  const clientDateHeader = req.headers["x-client-date"];

  if (clientDateHeader && /^\d{4}-\d{2}-\d{2}$/.test(clientDateHeader)) {
    // Valid YYYY-MM-DD format — use as today
    req.clientDate = normalizeDate(clientDateHeader);
  } else {
    // Fallback to server UTC date
    req.clientDate = normalizeDate(new Date());
  }

  next();
};

export { attachClientDate };
