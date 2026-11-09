require("dotenv").config();

const { connectRedis } = require("./src/config/redis");
const conDb = require("./src/config/connectDB");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectRedis();

    await conDb();

    const app = require("./app");

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();