require("dotenv").config();
const mongoose = require("mongoose");
const { connectRedis, disconnectRedis } = require("./src/config/redis");
const conDb = require("./src/config/connectDB");

const PORT = process.env.PORT || 3000;
let server;

const startServer = async () => {
  try {
    await connectRedis();
    await conDb();

    const app = require("./app");

    server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Received. Closing HTTP server gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await disconnectRedis();
        await mongoose.connection.close(false);
        console.log("MongoDB connection closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown cleanup:", err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

startServer();