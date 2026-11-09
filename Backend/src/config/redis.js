// config/redis.js

const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    console.log("Redis Connected Successfully");

    return redisClient;
  } catch (error) {
    console.error("Redis Connection Failed:", error.message);
    throw error;
  }
};

const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("Redis Disconnected Successfully");
    }
  } catch (error) {
    console.error("Redis Disconnect Error:", error.message);
  }
};

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};