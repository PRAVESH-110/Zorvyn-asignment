const rateLimit = require("express-rate-limit");

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = Number(process.env.RATE_LIMIT_MAX) || 100;

/**
 * Applies to all routes under `/api`. Counts requests per IP (uses `X-Forwarded-For` when `trust proxy` is enabled).
 */
const apiRateLimiter = rateLimit({
  windowMs,
  max,
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiRateLimiter };
