// config/redis.js

const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
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

module.exports = {
  redisClient,
  connectRedis,
};