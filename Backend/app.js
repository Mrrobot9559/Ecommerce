const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const notFoundMiddleware = require("./src/middlewares/notFound.middleware");
const errorMiddleware = require("./src/middlewares/error.middleware");
const app = express();
const routes = require("./src/routes");
const rateLimit = require("./src/middlewares/rateLimiter")
const path = require("path")

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(rateLimit)

app.use(
  "/uploads/movies",
  express.static(
    path.join(__dirname, "src/uploads/movies")
  )
);

app.use("/", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;