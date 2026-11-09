const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redisClient } = require("../config/redis");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500000000,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),

  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

module.exports = rateLimiter;